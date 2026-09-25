import mongoose, { Schema, Document } from 'mongoose';

export type NodeType = 'notebook' | 'topic' | 'page';

export interface INotebookNode extends Document {
  userId: string;
  title: string;
  parentId: string | null;
  type: NodeType;
  order: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotebookNodeSchema = new Schema<INotebookNode>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    parentId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['notebook', 'topic', 'page'],
      default: 'notebook',
    },
    order: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#212529',
    },
  },
  {
    timestamps: true,
  }
);

NotebookNodeSchema.index({ userId: 1, parentId: 1, order: 1 });

export const NotebookNodeModel =
  mongoose.models.NotebookNode ||
  mongoose.model<INotebookNode>('NotebookNode', NotebookNodeSchema);
