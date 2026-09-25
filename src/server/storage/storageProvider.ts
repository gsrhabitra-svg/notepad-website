import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/User.js';
import { NotebookNodeModel, INotebookNode } from '../models/NotebookNode.js';
import { PageModel, IPage } from '../models/Page.js';
import { getDBStatus } from '../config/db.js';

export interface UserDoc {
  _id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeDoc {
  _id: string;
  userId: string;
  title: string;
  parentId: string | null;
  type: 'notebook' | 'topic' | 'page';
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageDoc {
  _id: string;
  userId: string;
  nodeId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Local persistent document storage for resilience
const DATA_DIR = path.resolve(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const NODES_FILE = path.join(DATA_DIR, 'nodes.json');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  if (!fs.existsSync(NODES_FILE)) fs.writeFileSync(NODES_FILE, JSON.stringify([]));
  if (!fs.existsSync(PAGES_FILE)) fs.writeFileSync(PAGES_FILE, JSON.stringify([]));
};

const readLocal = <T>(file: string): T[] => {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeLocal = <T>(file: string, data: T[]) => {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};

const isMongooseActive = (): boolean => {
  return getDBStatus().connected && mongoose.connection.readyState === 1;
};

export const StorageProvider = {
  // === USER OPERATIONS ===
  async createUser(data: {
    fullName: string;
    mobileNumber: string;
    email: string;
    passwordHash: string;
  }): Promise<UserDoc> {
    const email = data.email.toLowerCase().trim();
    if (isMongooseActive()) {
      const user = await UserModel.create({
        fullName: data.fullName.trim(),
        mobileNumber: data.mobileNumber.trim(),
        email,
        passwordHash: data.passwordHash,
      });
      return user.toObject();
    }

    const users = readLocal<UserDoc>(USERS_FILE);
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const now = new Date();
    const newUser: UserDoc = {
      _id: crypto.randomUUID(),
      fullName: data.fullName.trim(),
      mobileNumber: data.mobileNumber.trim(),
      email,
      passwordHash: data.passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    writeLocal(USERS_FILE, users);
    return newUser;
  },

  async findUserByEmail(email: string): Promise<UserDoc | null> {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongooseActive()) {
      const user = await UserModel.findOne({ email: cleanEmail }).lean();
      return user as UserDoc | null;
    }
    const users = readLocal<UserDoc>(USERS_FILE);
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id: string): Promise<UserDoc | null> {
    if (isMongooseActive()) {
      const user = await UserModel.findById(id).lean();
      return user as UserDoc | null;
    }
    const users = readLocal<UserDoc>(USERS_FILE);
    return users.find((u) => u._id === id) || null;
  },

  async updateUser(id: string, updates: Partial<Pick<UserDoc, 'fullName' | 'mobileNumber' | 'passwordHash'>>): Promise<UserDoc | null> {
    if (isMongooseActive()) {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean();
      return user as UserDoc | null;
    }

    const users = readLocal<UserDoc>(USERS_FILE);
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...updates,
      updatedAt: new Date(),
    };
    writeLocal(USERS_FILE, users);
    return users[idx];
  },

  async deleteUser(id: string): Promise<boolean> {
    if (isMongooseActive()) {
      await UserModel.findByIdAndDelete(id);
      await NotebookNodeModel.deleteMany({ userId: id });
      await PageModel.deleteMany({ userId: id });
      return true;
    }

    let users = readLocal<UserDoc>(USERS_FILE);
    users = users.filter((u) => u._id !== id);
    writeLocal(USERS_FILE, users);

    let nodes = readLocal<NodeDoc>(NODES_FILE);
    nodes = nodes.filter((n) => n.userId !== id);
    writeLocal(NODES_FILE, nodes);

    let pages = readLocal<PageDoc>(PAGES_FILE);
    pages = pages.filter((p) => p.userId !== id);
    writeLocal(PAGES_FILE, pages);

    return true;
  },

  // === NODE OPERATIONS (Hierarchical Structure) ===
  async getNodesByUserId(userId: string): Promise<NodeDoc[]> {
    if (isMongooseActive()) {
      const nodes = await NotebookNodeModel.find({ userId })
        .sort({ order: 1, createdAt: 1 })
        .lean();
      return nodes.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
      }));
    }

    const nodes = readLocal<NodeDoc>(NODES_FILE);
    return nodes
      .filter((n) => n.userId === userId)
      .sort((a, b) => (a.order - b.order) || (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  },

  async getNodeById(nodeId: string, userId: string): Promise<NodeDoc | null> {
    if (isMongooseActive()) {
      const node = await NotebookNodeModel.findOne({ _id: nodeId, userId }).lean();
      if (!node) return null;
      return { ...(node as any), _id: (node as any)._id.toString() };
    }

    const nodes = readLocal<NodeDoc>(NODES_FILE);
    return nodes.find((n) => n._id === nodeId && n.userId === userId) || null;
  },

  async createNode(data: {
    userId: string;
    title: string;
    parentId?: string | null;
    type?: 'notebook' | 'topic' | 'page';
    color?: string;
  }): Promise<NodeDoc> {
    const parentId = data.parentId || null;
    const type = data.type || (parentId ? 'topic' : 'notebook');
    const title = data.title.trim();

    if (isMongooseActive()) {
      // Find max order of current siblings
      const siblingCount = await NotebookNodeModel.countDocuments({
        userId: data.userId,
        parentId,
      });

      const newNode = await NotebookNodeModel.create({
        userId: data.userId,
        title,
        parentId,
        type,
        order: siblingCount,
        color: data.color || '#212529',
      });

      // Also create an initial Page record for this node
      await PageModel.create({
        userId: data.userId,
        nodeId: newNode._id.toString(),
        title,
        content: '',
      });

      return {
        ...newNode.toObject(),
        _id: newNode._id.toString(),
      };
    }

    const nodes = readLocal<NodeDoc>(NODES_FILE);
    const siblings = nodes.filter((n) => n.userId === data.userId && n.parentId === parentId);
    const order = siblings.length;
    const now = new Date();
    const nodeId = crypto.randomUUID();

    const newNode: NodeDoc = {
      _id: nodeId,
      userId: data.userId,
      title,
      parentId,
      type,
      order,
      color: data.color || '#212529',
      createdAt: now,
      updatedAt: now,
    };

    nodes.push(newNode);
    writeLocal(NODES_FILE, nodes);

    // Initial page document
    const pages = readLocal<PageDoc>(PAGES_FILE);
    pages.push({
      _id: crypto.randomUUID(),
      userId: data.userId,
      nodeId,
      title,
      content: '',
      createdAt: now,
      updatedAt: now,
    });
    writeLocal(PAGES_FILE, pages);

    return newNode;
  },

  async updateNode(
    nodeId: string,
    userId: string,
    updates: Partial<Pick<NodeDoc, 'title' | 'color' | 'order' | 'parentId'>>
  ): Promise<NodeDoc | null> {
    if (isMongooseActive()) {
      const updated = await NotebookNodeModel.findOneAndUpdate(
        { _id: nodeId, userId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (!updated) return null;

      // Also update corresponding page title if title was modified
      if (updates.title) {
        await PageModel.findOneAndUpdate(
          { nodeId, userId },
          { title: updates.title.trim(), updatedAt: new Date() }
        );
      }

      return { ...(updated as any), _id: (updated as any)._id.toString() };
    }

    const nodes = readLocal<NodeDoc>(NODES_FILE);
    const idx = nodes.findIndex((n) => n._id === nodeId && n.userId === userId);
    if (idx === -1) return null;

    nodes[idx] = {
      ...nodes[idx],
      ...updates,
      updatedAt: new Date(),
    };
    writeLocal(NODES_FILE, nodes);

    if (updates.title) {
      const pages = readLocal<PageDoc>(PAGES_FILE);
      const pageIdx = pages.findIndex((p) => p.nodeId === nodeId && p.userId === userId);
      if (pageIdx !== -1) {
        pages[pageIdx].title = updates.title.trim();
        pages[pageIdx].updatedAt = new Date();
        writeLocal(PAGES_FILE, pages);
      }
    }

    return nodes[idx];
  },

  async deleteNodeCascade(nodeId: string, userId: string): Promise<string[]> {
    // Find all descendant node IDs recursively
    const allUserNodes = await this.getNodesByUserId(userId);
    const toDeleteIds: string[] = [];

    const collectDescendants = (currentId: string) => {
      toDeleteIds.push(currentId);
      const children = allUserNodes.filter((n) => n.parentId === currentId);
      for (const child of children) {
        collectDescendants(child._id);
      }
    };

    collectDescendants(nodeId);

    if (isMongooseActive()) {
      await NotebookNodeModel.deleteMany({
        _id: { $in: toDeleteIds },
        userId,
      });
      await PageModel.deleteMany({
        nodeId: { $in: toDeleteIds },
        userId,
      });
      return toDeleteIds;
    }

    let nodes = readLocal<NodeDoc>(NODES_FILE);
    nodes = nodes.filter((n) => !(toDeleteIds.includes(n._id) && n.userId === userId));
    writeLocal(NODES_FILE, nodes);

    let pages = readLocal<PageDoc>(PAGES_FILE);
    pages = pages.filter((p) => !(toDeleteIds.includes(p.nodeId) && p.userId === userId));
    writeLocal(PAGES_FILE, pages);

    return toDeleteIds;
  },

  async moveNode(
    nodeId: string,
    userId: string,
    newParentId: string | null
  ): Promise<NodeDoc | null> {
    // Check if newParentId would cause a cycle
    if (newParentId === nodeId) {
      throw new Error('A node cannot be its own parent');
    }

    if (newParentId) {
      // Check if newParentId is a descendant of nodeId
      const allUserNodes = await this.getNodesByUserId(userId);
      let curr = allUserNodes.find((n) => n._id === newParentId);
      while (curr) {
        if (curr.parentId === nodeId) {
          throw new Error('Cannot move a node inside one of its descendants');
        }
        curr = allUserNodes.find((n) => n._id === curr?.parentId);
      }
    }

    return this.updateNode(nodeId, userId, { parentId: newParentId });
  },

  async reorderNodes(
    userId: string,
    orderedNodeIds: string[]
  ): Promise<boolean> {
    if (isMongooseActive()) {
      const bulkOps = orderedNodeIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id, userId },
          update: { $set: { order: index } },
        },
      }));
      await NotebookNodeModel.bulkWrite(bulkOps);
      return true;
    }

    const nodes = readLocal<NodeDoc>(NODES_FILE);
    for (let index = 0; index < orderedNodeIds.length; index++) {
      const id = orderedNodeIds[index];
      const node = nodes.find((n) => n._id === id && n.userId === userId);
      if (node) {
        node.order = index;
      }
    }
    writeLocal(NODES_FILE, nodes);
    return true;
  },

  // === PAGE OPERATIONS ===
  async getPageByNodeId(nodeId: string, userId: string): Promise<PageDoc | null> {
    if (isMongooseActive()) {
      let page = await PageModel.findOne({ nodeId, userId }).lean();
      if (!page) {
        // Find node to get title
        const node = await NotebookNodeModel.findOne({ _id: nodeId, userId }).lean();
        if (!node) return null;
        const newPage = await PageModel.create({
          userId,
          nodeId,
          title: (node as any).title,
          content: '',
        });
        return {
          ...newPage.toObject(),
          _id: newPage._id.toString(),
        };
      }
      return {
        ...(page as any),
        _id: (page as any)._id.toString(),
      };
    }

    const pages = readLocal<PageDoc>(PAGES_FILE);
    let page = pages.find((p) => p.nodeId === nodeId && p.userId === userId);
    if (!page) {
      const nodes = readLocal<NodeDoc>(NODES_FILE);
      const node = nodes.find((n) => n._id === nodeId && n.userId === userId);
      if (!node) return null;

      const now = new Date();
      page = {
        _id: crypto.randomUUID(),
        userId,
        nodeId,
        title: node.title,
        content: '',
        createdAt: now,
        updatedAt: now,
      };
      pages.push(page);
      writeLocal(PAGES_FILE, pages);
    }
    return page;
  },

  async updatePage(
    pageId: string,
    userId: string,
    updates: { title?: string; content?: string }
  ): Promise<PageDoc | null> {
    const updatedAt = new Date();
    if (isMongooseActive()) {
      const updated = await PageModel.findOneAndUpdate(
        { _id: pageId, userId },
        { ...updates, updatedAt },
        { new: true }
      ).lean();
      if (!updated) return null;

      // If title changed, keep the corresponding NotebookNode in sync
      if (updates.title && (updated as any).nodeId) {
        await NotebookNodeModel.findOneAndUpdate(
          { _id: (updated as any).nodeId, userId },
          { title: updates.title.trim(), updatedAt }
        );
      }

      return { ...(updated as any), _id: (updated as any)._id.toString() };
    }

    const pages = readLocal<PageDoc>(PAGES_FILE);
    const idx = pages.findIndex((p) => p._id === pageId && p.userId === userId);
    if (idx === -1) return null;

    pages[idx] = {
      ...pages[idx],
      ...updates,
      updatedAt,
    };
    writeLocal(PAGES_FILE, pages);

    // Keep node title in sync
    if (updates.title) {
      const nodes = readLocal<NodeDoc>(NODES_FILE);
      const nodeIdx = nodes.findIndex((n) => n._id === pages[idx].nodeId && n.userId === userId);
      if (nodeIdx !== -1) {
        nodes[nodeIdx].title = updates.title.trim();
        nodes[nodeIdx].updatedAt = updatedAt;
        writeLocal(NODES_FILE, nodes);
      }
    }

    return pages[idx];
  },

  // === SEARCH (User-Isolated Only) ===
  async searchUserNotes(userId: string, query: string): Promise<Array<{
    nodeId: string;
    nodeTitle: string;
    nodeType: string;
    pageTitle: string;
    snippet: string;
    matchedIn: 'title' | 'content';
  }>> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const nodes = await this.getNodesByUserId(userId);
    let pages: PageDoc[] = [];

    if (isMongooseActive()) {
      const rawPages = await PageModel.find({ userId }).lean();
      pages = rawPages.map((p: any) => ({ ...p, _id: p._id.toString() }));
    } else {
      pages = readLocal<PageDoc>(PAGES_FILE).filter((p) => p.userId === userId);
    }

    const results: Array<{
      nodeId: string;
      nodeTitle: string;
      nodeType: string;
      pageTitle: string;
      snippet: string;
      matchedIn: 'title' | 'content';
    }> = [];

    for (const node of nodes) {
      const page = pages.find((p) => p.nodeId === node._id);
      const titleMatches = node.title.toLowerCase().includes(q) || (page && page.title.toLowerCase().includes(q));

      // Strip HTML tags for clean snippet extraction
      const cleanContent = page ? page.content.replace(/<[^>]*>/g, ' ') : '';
      const contentMatches = cleanContent.toLowerCase().includes(q);

      if (titleMatches || contentMatches) {
        let snippet = '';
        if (contentMatches) {
          const lower = cleanContent.toLowerCase();
          const matchIndex = lower.indexOf(q);
          const start = Math.max(0, matchIndex - 40);
          const end = Math.min(cleanContent.length, matchIndex + q.length + 60);
          snippet = (start > 0 ? '...' : '') + cleanContent.substring(start, end).trim() + (end < cleanContent.length ? '...' : '');
        } else {
          snippet = node.type === 'notebook' ? 'Root notebook' : 'Topic note';
        }

        results.push({
          nodeId: node._id,
          nodeTitle: node.title,
          nodeType: node.type,
          pageTitle: page ? page.title : node.title,
          snippet,
          matchedIn: titleMatches ? 'title' : 'content',
        });
      }
    }

    return results;
  },
};
