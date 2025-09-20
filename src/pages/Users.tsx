import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { 
  Card, 
  Button, 
  Table, 
  PageHeader, 
  PageTitle, 
  Input, 
  Select,
  StatusBadge
} from '../styles/GlobalStyles';
import { userService, User, CreateUserData, UpdateUserData } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import logger from '../utils/logger';

const UsersContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 768px) {
    padding-bottom: 80px; /* Space for floating button */
  }
`;

const FiltersContainer = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const FloatingActionButton = styled.button`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 123, 255, 0.6);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
`;

const DesktopButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UsersTable = styled(Table)`
  margin-bottom: 20px;
  table-layout: fixed;
  width: 100%;
  
  @media (max-width: 768px) {
    display: none; /* Hide table on mobile */
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: none; /* Hide table on mobile */
  }
`;

const MobileCardContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 20px;
  }
`;

const MobileCard = styled(Card)`
  margin-bottom: 12px;
  padding: 16px;
  
  @media (max-width: 768px) {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MobileCardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const MobileCardRole = styled.div`
  display: flex;
  align-items: center;
`;

const MobileCardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileCardLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
`;

const MobileCardValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 400;
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
`;

const UsernameColumn = styled.td`
  width: 20%;
  word-break: break-word;
`;

const RoleColumn = styled.td`
  width: 15%;
  word-break: break-word;
`;

const StatusColumn = styled.td`
  width: 15%;
  word-break: break-word;
`;

const LastLoginColumn = styled.td`
  width: 20%;
  word-break: break-word;
`;

const CreatedColumn = styled.td`
  width: 20%;
  word-break: break-word;
`;

const ActionsColumn = styled.td`
  width: 10%;
  text-align: right;
  padding-right: 16px;
`;

const UsernameHeader = styled.th`
  width: 20%;
`;

const RoleHeader = styled.th`
  width: 15%;
`;

const StatusHeader = styled.th`
  width: 15%;
`;

const LastLoginHeader = styled.th`
  width: 20%;
`;

const CreatedHeader = styled.th`
  width: 20%;
`;

const ActionsHeader = styled.th`
  width: 10%;
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const SuccessMessage = styled.div`
  background-color: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #22543d;
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ConfirmationDialog = styled(Card)`
  max-width: 400px;
  margin: 0;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
`;

const TableRow = styled.tr<{ alternating?: boolean; index?: number }>`
  ${props => props.alternating && props.index !== undefined && props.index % 2 === 1 && `
    background-color: #f8f9fa;
  `}
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const FilterLabel = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
`;

const ValidationError = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #721c24;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  color: var(--text-primary);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--text-primary);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const RoleBadge = styled.span<{ role: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.role === 'admin' ? '#cce5ff' : '#e6f3ff'};
  color: ${props => props.role === 'admin' ? '#0066cc' : '#004499'};
  border: 1px solid ${props => props.role === 'admin' ? '#99d1ff' : '#b3d9ff'};

  /* Dark mode overrides */
  [data-theme="dark"] & {
    background-color: ${props => props.role === 'admin' ? '#1a3d5c' : '#0d2a3d'};
    color: ${props => props.role === 'admin' ? '#66b3ff' : '#4da6ff'};
    border-color: ${props => props.role === 'admin' ? '#2d5a7a' : '#1a3d5c'};
  }
`;

const Users: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    password: '',
    role: 'clerk',
    isActive: true
  });
  const [editFormData, setEditFormData] = useState<UpdateUserData>({});
  const [passwordData, setPasswordData] = useState({ newPassword: '' });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [alternatingRows] = useState(true);

  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['users', page, search, roleFilter],
    () => userService.getUsers({ page, limit: 20, search, role: roleFilter }),
    {
      onError: (error: any) => {
        logger.error('Users', 'Failed to load users', {
          error: error.message,
          page,
          search,
          roleFilter
        });
      }
    }
  );

  // Create user mutation
  const createMutation = useMutation(userService.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      setIsCreateModalOpen(false);
      resetForm();
        setSuccessMessage(t('userCreatedSuccessfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
      logger.info('Users', 'User created successfully');
    },
    onError: (error: any) => {
      logger.error('Users', 'Failed to create user', {
        error: error.message,
        formData
      });
        const errorMessage = error.response?.data?.error?.message || t('failedToCreateUser');
      setFormErrors([errorMessage]);
    }
  });

  // Update user mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateUserData }) => userService.updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setSuccessMessage(t('userUpdatedSuccessfully'));
        setTimeout(() => setSuccessMessage(''), 3000);
        logger.info('Users', 'User updated successfully');
      },
      onError: (error: any) => {
        logger.error('Users', 'Failed to update user', {
          error: error.message,
          userId: selectedUser?._id,
          editFormData
        });
        const errorMessage = error.response?.data?.error?.message || t('failedToUpdateUser');
        setFormErrors([errorMessage]);
      }
    }
  );

  // Reset password mutation
  const resetPasswordMutation = useMutation(
    ({ id, newPassword }: { id: string; newPassword?: string }) => 
      userService.resetUserPassword(id, newPassword),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setIsPasswordModalOpen(false);
        setPasswordData({ newPassword: '' });
        setSuccessMessage(t('passwordResetSuccessfully'));
        setTimeout(() => setSuccessMessage(''), 3000);
        logger.info('Users', 'User password reset successfully');
      },
      onError: (error: any) => {
        logger.error('Users', 'Failed to reset user password', {
          error: error.message,
          userId: selectedUser?._id
        });
        const errorMessage = error.response?.data?.error?.message || t('failedToResetPassword');
        setFormErrors([errorMessage]);
      }
    }
  );

  // Delete user mutation
  const deleteMutation = useMutation(userService.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      setShowDeleteConfirm(null);
        setSuccessMessage(t('userDeletedSuccessfully'));
      setTimeout(() => setSuccessMessage(''), 3000);
      logger.info('Users', 'User deleted successfully');
    },
    onError: (error: any) => {
      logger.error('Users', 'Failed to delete user', {
        error: error.message,
        userId: selectedUser?._id
      });
        const errorMessage = error.response?.data?.error?.message || t('failedToDeleteUser');
      setFormErrors([errorMessage]);
    }
  });

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'clerk',
      isActive: true
    });
    setFormErrors([]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validate form
    const errors: string[] = [];
    if (!formData.username.trim()) errors.push('Username is required');
    if (!formData.password.trim()) errors.push('Password is required');
    if (formData.password.length < 6) errors.push('Password must be at least 6 characters');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    createMutation.mutate(formData);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      role: user.role,
      isActive: user.isActive
    });
    setIsEditModalOpen(true);
    setFormErrors([]);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormErrors([]);
    
    // Validate form
    const errors: string[] = [];
    if (!editFormData.username?.trim()) errors.push('Username is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    updateMutation.mutate({ id: selectedUser._id, data: editFormData });
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setPasswordData({ newPassword: '' });
    setIsPasswordModalOpen(true);
    setFormErrors([]);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormErrors([]);
    resetPasswordMutation.mutate({ 
      id: selectedUser._id, 
      newPassword: passwordData.newPassword || undefined 
    });
  };

  const handleDelete = (user: User) => {
    setShowDeleteConfirm(user);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) return <div>{t('loading')}</div>;
  if (error) return <div>{t('errorLoadingUsers')}</div>;

  return (
    <UsersContainer>
      <PageHeader>
        <PageTitle>{t('userManagementUsers')}</PageTitle>
        <DesktopButtons>
          {user?.role === 'admin' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              {t('createUser')}
            </Button>
          )}
        </DesktopButtons>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>{t('search')}</FilterLabel>
          <Input
            type="text"
            placeholder={t('searchUsersPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>{t('role')}</FilterLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">{t('allRoles')}</option>
            <option value="admin">{t('admin')}</option>
            <option value="clerk">{t('clerk')}</option>
          </Select>
        </FilterGroup>
      </FiltersContainer>

      <TableContainer>
        <UsersTable>
        <thead>
          <tr>
            <UsernameHeader>{t('username')}</UsernameHeader>
            <RoleHeader>{t('role')}</RoleHeader>
            <StatusHeader>{t('status')}</StatusHeader>
            <LastLoginHeader>{t('lastLogin')}</LastLoginHeader>
            <CreatedHeader>{t('created')}</CreatedHeader>
            {user?.role === 'admin' && <ActionsHeader>{t('actions')}</ActionsHeader>}
          </tr>
        </thead>
        <tbody>
          {usersData?.data.map((userItem, index) => (
            <TableRow key={userItem._id} alternating={alternatingRows} index={index}>
              <UsernameColumn><strong>{userItem.username}</strong></UsernameColumn>
              <RoleColumn>
                <RoleBadge role={userItem.role}>
                  {userItem.role.toUpperCase()}
                </RoleBadge>
              </RoleColumn>
              <StatusColumn>
                <StatusBadge status={userItem.isActive ? 'active' : 'inactive'}>
                  {userItem.isActive ? t('active') : t('inactive')}
                </StatusBadge>
              </StatusColumn>
              <LastLoginColumn>
                {userItem.lastLogin ? formatDate(userItem.lastLogin) : t('never')}
              </LastLoginColumn>
              <CreatedColumn>{formatDate(userItem.createdAt)}</CreatedColumn>
              {user?.role === 'admin' && (
                <ActionsColumn>
                  <ActionButtons>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEdit(userItem)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('edit')}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleResetPassword(userItem)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('resetPassword')}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDelete(userItem)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('delete')}
                    </Button>
                  </ActionButtons>
                </ActionsColumn>
              )}
            </TableRow>
          ))}
        </tbody>
        </UsersTable>
      </TableContainer>

      {/* Mobile Card Layout */}
      <MobileCardContainer>
        {usersData?.data.map((userItem, index) => (
          <MobileCard key={userItem._id}>
            <MobileCardHeader>
              <MobileCardTitle>{userItem.username}</MobileCardTitle>
              <MobileCardRole>
                <RoleBadge role={userItem.role}>
                  {userItem.role.toUpperCase()}
                </RoleBadge>
              </MobileCardRole>
            </MobileCardHeader>
            
            <MobileCardContent>
              <MobileCardField>
                <MobileCardLabel>{t('status')}</MobileCardLabel>
                <MobileCardValue>
                  <StatusBadge status={userItem.isActive ? 'active' : 'inactive'}>
                    {userItem.isActive ? t('active') : t('inactive')}
                  </StatusBadge>
                </MobileCardValue>
              </MobileCardField>
              
              <MobileCardField>
                <MobileCardLabel>{t('lastLogin')}</MobileCardLabel>
                <MobileCardValue>
                  {userItem.lastLogin ? formatDate(userItem.lastLogin) : t('never')}
                </MobileCardValue>
              </MobileCardField>
            </MobileCardContent>
            
            <MobileCardField style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>
              <MobileCardLabel>{t('created')}</MobileCardLabel>
              <MobileCardValue>{formatDate(userItem.createdAt)}</MobileCardValue>
            </MobileCardField>
            
            {user?.role === 'admin' && (
              <MobileCardActions>
                <Button 
                  variant="secondary" 
                  onClick={() => handleEdit(userItem)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('edit')}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleResetPassword(userItem)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('resetPassword')}
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDelete(userItem)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('delete')}
                </Button>
              </MobileCardActions>
            )}
          </MobileCard>
        ))}
      </MobileCardContainer>

      {usersData?.meta && usersData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>{t('previous')}</Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {usersData.meta.pages}
          </span>
          {page < usersData.meta.pages && (
            <Button onClick={() => setPage(page + 1)}>{t('next')}</Button>
          )}
        </PaginationContainer>
      )}

      {/* Create User Modal */}
      <Modal isOpen={isCreateModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{t('createUser')}</ModalTitle>
            <CloseButton onClick={() => setIsCreateModalOpen(false)}>
              ×
            </CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleCreate}>
            <FormGroup>
              <Label>{t('username')}</Label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>{t('password')}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>{t('role')}</Label>
              <Select
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, role: e.target.value as 'clerk' | 'admin' })}
              >
                <option value="clerk">Clerk</option>
                <option value="admin">Admin</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </Label>
            </FormGroup>

            {formErrors.length > 0 && (
              <ValidationError>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Please fix the following errors:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationError>
            )}
            
            <ButtonGroup>
              <Button type="button" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Edit user</ModalTitle>
            <CloseButton onClick={() => setIsEditModalOpen(false)}>
              ×
            </CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleUpdate}>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={editFormData.username || ''}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Role</Label>
              <Select
                value={editFormData.role || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFormData({ ...editFormData, role: e.target.value as 'clerk' | 'admin' })}
              >
                <option value="clerk">Clerk</option>
                <option value="admin">Admin</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>
                <input
                  type="checkbox"
                  checked={editFormData.isActive || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                />
                Active
              </Label>
            </FormGroup>

            {formErrors.length > 0 && (
              <ValidationError>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Please fix the following errors:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationError>
            )}
            
            <ButtonGroup>
              <Button type="button" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={isPasswordModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Reset password</ModalTitle>
            <CloseButton onClick={() => setIsPasswordModalOpen(false)}>
              ×
            </CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handlePasswordReset}>
            <FormGroup>
              <Label>New Password (leave empty to force user to reset)</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ newPassword: e.target.value })}
                placeholder="Leave empty to force user reset"
              />
            </FormGroup>

            {formErrors.length > 0 && (
              <ValidationError>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Please fix the following errors:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationError>
            )}
            
            <ButtonGroup>
              <Button type="button" onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isLoading}>
                {resetPasswordMutation.isLoading ? 'Resetting...' : 'Reset password'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>Confirm delete</h3>
            <p>Are you sure you want to delete the user <strong>{showDeleteConfirm.username}</strong>?</p>
            <p style={{ color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>This action cannot be undone.</p>
            <ConfirmationButtons>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                No
              </Button>
              <Button 
                variant="danger" 
                onClick={() => deleteMutation.mutate(showDeleteConfirm._id)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, delete'}
              </Button>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationModal>
      )}
      
      {/* Floating Action Button for Mobile */}
      {user?.role === 'admin' && (
        <FloatingActionButton onClick={() => setIsCreateModalOpen(true)}>
          +
        </FloatingActionButton>
      )}
    </UsersContainer>
  );
};

export default Users;
