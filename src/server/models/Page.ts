import mongoose, { Schema, Document } from 'mongoose';

export interface IPage extends Document {
  userId: string;
  nodeId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled',
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

PageSchema.index({ userId: 1, nodeId: 1 }, { unique: true });

export const PageModel =
  mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
