import api from './authService';

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Client {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address: ClientAddress;
  taxNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    username: string;
  };
  updatedBy?: {
    _id: string;
    username: string;
  };
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  address?: ClientAddress;
  taxNumber?: string;
  notes?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  isActive?: boolean;
}

export interface ClientListResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const clientService = {
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ClientListResponse> {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  async getClient(id: string): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data.data;
  },

  async createClient(data: CreateClientData): Promise<Client> {
    const response = await api.post('/clients', data);
    return response.data.data;
  },

  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await api.put(`/clients/${id}`, data);
    return response.data.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async getAuditTrail(id: string): Promise<any[]> {
    const response = await api.get(`/clients/${id}/audit`);
    return response.data.data;
  },
};
