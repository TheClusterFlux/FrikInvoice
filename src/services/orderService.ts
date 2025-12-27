import api from './authService';
import logger from '../utils/logger';

export interface OrderItem {
  inventoryId: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  calculationBreakdown?: string;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface Order {
  _id: string;
  invoiceNumber: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'pending' | 'signed' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
  signedAt?: string;
  signedBy?: string;
}

export interface CreateOrderData {
  customerInfo: CustomerInfo;
  items: Array<{
    inventoryId: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    basePrice?: number;
    markup?: number;
    calculationBreakdown?: string;
  }>;
  taxRate?: number;
  notes?: string;
}

export interface UpdateOrderData {
  customerInfo?: Partial<CustomerInfo>;
  taxRate?: number;
  notes?: string;
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const orderService = {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<OrderListResponse> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getOrder(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  async createOrder(data: CreateOrderData): Promise<Order> {
    logger.info('OrderService', 'Creating order', {
      customerName: data.customerInfo.name,
      itemCount: data.items.length,
      items: data.items.map((item, index) => ({
        index: index + 1,
        inventoryId: item.inventoryId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit,
        calculationBreakdown: item.calculationBreakdown
      })),
      taxRate: data.taxRate,
      notes: data.notes
    });

    try {
      logger.debug('OrderService', 'Making API POST request to /orders', {
        url: '/orders',
        method: 'POST',
        dataKeys: Object.keys(data)
      });
      
      const response = await api.post('/orders', data);
      
      logger.info('OrderService', 'Order created successfully', {
        orderId: response.data?.data?._id,
        responseStatus: response.status,
        responseData: response.data
      });
      
      return response.data.data;
    } catch (error: any) {
      logger.error('OrderService', 'Failed to create order', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  },

  async updateOrder(id: string, data: UpdateOrderData): Promise<Order> {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  },

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  async generatePDF(id: string, template?: string): Promise<Blob> {
    const params = template ? { template } : {};
    const response = await api.get(`/orders/${id}/pdf`, {
      responseType: 'blob',
      params,
    });
    return response.data;
  },

  async getPDFTemplates(): Promise<{
    available: string[];
    active: string;
    current: string;
  }> {
    const response = await api.get('/orders/pdf/templates');
    return response.data.data;
  },

  async signOrder(id: string, signedBy: string): Promise<Order> {
    const response = await api.put(`/orders/${id}/sign`, { signedBy });
    return response.data.data;
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const response = await api.get(`/orders/${id}/audit`);
    return response.data.data;
  },

  async sendSigningEmail(id: string, email?: string): Promise<{ email: string; tokenId: string; expiresAt: string }> {
    const response = await api.post(`/orders/${id}/send-signing-email`, { email });
    return response.data.data;
  },

  async sendInvoicePDFEmail(id: string, email?: string): Promise<{ email: string }> {
    const response = await api.post(`/orders/${id}/send-pdf-email`, { email });
    return response.data.data;
  },
};
