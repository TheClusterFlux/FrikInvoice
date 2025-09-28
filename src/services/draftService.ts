import { CreateOrderData } from './orderService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export interface DraftOrderData extends CreateOrderData {
  selectedClientId?: string | null;
  lastSaved?: string;
}

export interface DraftOrder {
  _id: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  selectedClientId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } | null;
  items: Array<{
    inventoryId: {
      _id: string;
      code: string;
      description: string;
      unit: string;
      group: string;
      basePrice: number;
    } | string;
    quantity: number;
    unit: string;
    unitPrice: number;
    basePrice?: number;
    markup?: number;
    calculationBreakdown?: string;
  }>;
  taxRate: number;
  notes: string;
  lastSaved: string;
  createdAt: string;
  updatedAt: string;
}

class DraftService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getDraft(): Promise<DraftOrder | null> {
    const response = await fetch(`${API_BASE_URL}/drafts`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch draft');
    }

    const result = await response.json();
    return result.data;
  }

  async saveDraft(draftData: DraftOrderData): Promise<DraftOrder> {
    const response = await fetch(`${API_BASE_URL}/drafts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(draftData),
    });

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    const result = await response.json();
    return result.data;
  }

  async deleteDraft(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/drafts`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete draft');
    }
  }
}

export const draftService = new DraftService();
