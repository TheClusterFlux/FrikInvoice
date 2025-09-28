import api from './authService';
import logger from '../utils/logger';

export interface InventoryItem {
  _id: string;
  code: string;
  description: string;
  group: string;
  unit: string;
  basePrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
}

export interface CreateInventoryData {
  code: string;
  description: string;
  group: string;
  unit: string;
  basePrice?: number;
}

export interface UpdateInventoryData extends Partial<CreateInventoryData> {
  isActive?: boolean;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const inventoryService = {
  async getInventory(params?: {
    page?: number;
    limit?: number;
    group?: string;
    search?: string;
    sortField?: string;
    sortDirection?: string;
    isActive?: boolean;
  }): Promise<InventoryListResponse> {
    logger.debug('InventoryService', 'Fetching inventory', {
      params,
      url: '/inventory'
    });
    
    try {
      const response = await api.get('/inventory', { params });
      logger.info('InventoryService', 'Inventory fetched successfully', {
        itemCount: response.data?.data?.length || 0,
        totalItems: response.data?.meta?.total || 0,
        firstFewItems: response.data?.data?.slice(0, 3).map((item: any) => ({
          id: item._id,
          code: item.code,
          description: item.description,
          isActive: item.isActive
        }))
      });
      return response.data;
    } catch (error: any) {
      logger.error('InventoryService', 'Failed to fetch inventory', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async getInventoryItem(id: string): Promise<InventoryItem> {
    const response = await api.get(`/inventory/${id}`);
    return response.data.data;
  },

  async createInventory(data: CreateInventoryData): Promise<InventoryItem> {
    const response = await api.post('/inventory', data);
    return response.data.data;
  },

  async updateInventory(id: string, data: UpdateInventoryData): Promise<InventoryItem> {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data.data;
  },

  async deleteInventory(id: string): Promise<void> {
    await api.delete(`/inventory/${id}`);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const response = await api.get(`/inventory/${id}/audit`);
    return response.data.data;
  },

  async exportCSV(): Promise<Blob> {
    const response = await api.get('/inventory/export/csv', {
      responseType: 'blob'
    });
    return response.data;
  },

  async importCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const response = await api.post('/inventory/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
};

