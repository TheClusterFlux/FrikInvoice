import api from './authService';
import logger from '../utils/logger';

export interface User {
  _id: string;
  username: string;
  role: 'clerk' | 'admin';
  isActive: boolean;
  mustResetPassword: boolean;
  lastLogin?: string;
  invoiceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role?: 'clerk' | 'admin';
  isActive?: boolean;
}

export interface UpdateUserData {
  username?: string;
  role?: 'clerk' | 'admin';
  isActive?: boolean;
  invoiceCode?: string;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<UserListResponse> {
    logger.debug('UserService', 'Fetching users', {
      params,
      url: '/users'
    });
    
    try {
      const response = await api.get('/users', { params });
      logger.info('UserService', 'Users fetched successfully', {
        userCount: response.data?.data?.length || 0,
        totalUsers: response.data?.meta?.total || 0
      });
      return response.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to fetch users', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async getUser(id: string): Promise<User> {
    logger.debug('UserService', 'Fetching user', {
      userId: id,
      url: `/users/${id}`
    });
    
    try {
      const response = await api.get(`/users/${id}`);
      logger.info('UserService', 'User fetched successfully', {
        userId: id,
        username: response.data?.data?.username
      });
      return response.data.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to fetch user', {
        userId: id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async createUser(data: CreateUserData): Promise<User> {
    logger.info('UserService', 'Creating user', {
      username: data.username,
      role: data.role,
      isActive: data.isActive
    });

    try {
      const response = await api.post('/users', data);
      logger.info('UserService', 'User created successfully', {
        userId: response.data?.data?._id,
        username: response.data?.data?.username
      });
      return response.data.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to create user', {
        username: data.username,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    logger.info('UserService', 'Updating user', {
      userId: id,
      updateData: data
    });

    try {
      const response = await api.put(`/users/${id}`, data);
      logger.info('UserService', 'User updated successfully', {
        userId: id,
        username: response.data?.data?.username
      });
      return response.data.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to update user', {
        userId: id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async resetUserPassword(id: string, newPassword?: string): Promise<{ message: string; data: User }> {
    logger.info('UserService', 'Resetting user password', {
      userId: id,
      hasNewPassword: !!newPassword
    });

    try {
      const response = await api.post(`/users/${id}/reset-password`, { newPassword });
      logger.info('UserService', 'User password reset successfully', {
        userId: id,
        message: response.data?.message
      });
      return response.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to reset user password', {
        userId: id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async deleteUser(id: string): Promise<void> {
    logger.info('UserService', 'Deleting user', {
      userId: id
    });

    try {
      await api.delete(`/users/${id}`);
      logger.info('UserService', 'User deleted successfully', {
        userId: id
      });
    } catch (error: any) {
      logger.error('UserService', 'Failed to delete user', {
        userId: id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async getCurrentUser(): Promise<User> {
    logger.debug('UserService', 'Fetching current user profile', {
      url: '/users/profile/me'
    });
    
    try {
      const response = await api.get('/users/profile/me');
      logger.info('UserService', 'Current user profile fetched successfully', {
        userId: response.data?.data?._id,
        username: response.data?.data?.username,
        role: response.data?.data?.role
      });
      return response.data.data;
    } catch (error: any) {
      logger.error('UserService', 'Failed to fetch current user profile', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  async changePassword(data: PasswordChangeData): Promise<void> {
    logger.info('UserService', 'Changing password', {
      url: '/users/profile/password'
    });

    try {
      await api.put('/users/profile/password', data);
      logger.info('UserService', 'Password changed successfully');
    } catch (error: any) {
      logger.error('UserService', 'Failed to change password', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};
