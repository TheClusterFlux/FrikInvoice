import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Public API instance (no auth token)
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add device info headers
publicApi.interceptors.request.use((config) => {
  // Capture device information
  if (typeof window !== 'undefined') {
    config.headers['screen-resolution'] = `${window.screen.width}x${window.screen.height}`;
    config.headers['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return config;
});

export interface SigningOrderResponse {
  order: any;
  token: {
    email: string;
    expiresAt: string;
  };
}

export interface AcceptOrderRequest {
  signedBy: string;
  consentAcknowledged: boolean;
}

export interface AcceptOrderResponse {
  order: any;
  signature: {
    signedAt: string;
    signedBy: string;
    documentHash: string;
  };
}

export const signingService = {
  async getOrderByToken(token: string): Promise<SigningOrderResponse> {
    const response = await publicApi.get(`/orders/sign/${token}`);
    return response.data.data;
  },

  async acceptOrder(token: string, data: AcceptOrderRequest): Promise<AcceptOrderResponse> {
    const response = await publicApi.post(`/orders/sign/${token}/accept`, {
      signedBy: data.signedBy,
      consentAcknowledged: data.consentAcknowledged ? 'true' : 'false'
    });
    return response.data.data;
  },
};

