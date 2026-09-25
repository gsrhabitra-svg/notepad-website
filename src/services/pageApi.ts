import { request } from './api.js';
import { PageContent } from '../types/index.js';

export const pageApi = {
  async getPage(nodeId: string): Promise<PageContent> {
    const res = await request<{ success: boolean; data: PageContent }>(`/pages/${nodeId}`);
    return res.data;
  },

  async updatePage(
    pageId: string,
    updates: { title?: string; content?: string }
  ): Promise<PageContent> {
    const res = await request<{ success: boolean; data: PageContent }>(`/pages/${pageId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data;
  },
};
