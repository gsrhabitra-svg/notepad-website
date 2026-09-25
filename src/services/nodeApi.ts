import { request } from './api.js';
import { NotebookNode } from '../types/index.js';

export const nodeApi = {
  async getNodes(): Promise<NotebookNode[]> {
    const res = await request<{ success: boolean; data: NotebookNode[] }>('/nodes');
    return res.data;
  },

  async createNode(data: {
    title: string;
    parentId?: string | null;
    type?: 'notebook' | 'topic' | 'page';
    color?: string;
  }): Promise<NotebookNode> {
    const res = await request<{ success: boolean; data: NotebookNode }>('/nodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateNode(id: string, updates: { title?: string; color?: string }): Promise<NotebookNode> {
    const res = await request<{ success: boolean; data: NotebookNode }>(`/nodes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data;
  },

  async deleteNode(id: string): Promise<string[]> {
    const res = await request<{ success: boolean; deletedIds: string[] }>(`/nodes/${id}`, {
      method: 'DELETE',
    });
    return res.deletedIds;
  },

  async moveNode(id: string, newParentId: string | null): Promise<NotebookNode> {
    const res = await request<{ success: boolean; data: NotebookNode }>(`/nodes/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    });
    return res.data;
  },

  async reorderNodes(orderedIds: string[]): Promise<void> {
    await request('/nodes/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  },
};
