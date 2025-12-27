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
  StatusBadge
} from '../styles/GlobalStyles';
import { clientService, Client, CreateClientData } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

const ClientsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 1300px) {
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
  
  @media (max-width: 1300px) {
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
  
  @media (max-width: 1300px) {
    display: none;
  }
`;

const ClientsTable = styled(Table)`
  margin-bottom: 20px;
  table-layout: fixed;
  width: 100%;
  
  @media (max-width: 1300px) {
    display: none; /* Hide table on small screens */
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 20px;
  
  @media (max-width: 1300px) {
    display: none; /* Hide table on small screens */
  }
`;

const MobileCardContainer = styled.div`
  display: none;
  
  @media (max-width: 1300px) {
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

const MobileCardStatus = styled.div`
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

const NameColumn = styled.td`
  width: 20%;
  word-break: break-word;
`;

const ContactColumn = styled.td`
  width: 20%;
  word-break: break-word;
`;

const AddressColumn = styled.td`
  width: 30%;
  word-break: break-word;
`;

const TaxColumn = styled.td`
  width: 10%;
  word-break: break-word;
`;

const StatusColumn = styled.td`
  width: 10%;
  word-break: break-word;
`;

const ActionsColumn = styled.td`
  width: 10%;
  text-align: right;
  padding-right: 16px;
`;

const NameHeader = styled.th`
  width: 20%;
`;

const ContactHeader = styled.th`
  width: 20%;
`;

const AddressHeader = styled.th`
  width: 30%;
`;

const TaxHeader = styled.th`
  width: 10%;
`;

const StatusHeader = styled.th`
  width: 10%;
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterLabel = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
`;

const ValidationError = styled.div`
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #c53030;
`;

const SuccessMessage = styled.div`
  background-color: var(--success-bg, #d1e7dd);
  border: 1px solid var(--success-border, #badbcc);
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--success-text, #000000);
  font-weight: 500;
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

const TableRow = styled.tr<{ alternating: boolean; index: number }>`
  background-color: ${props => 
    props.alternating && props.index % 2 === 1 
      ? 'var(--table-row-alt, rgba(0, 0, 0, 0.02))' 
      : 'transparent'
  };
  
  /* Dark mode alternating rows */
  @media (prefers-color-scheme: dark) {
    background-color: ${props => 
      props.alternating && props.index % 2 === 1 
        ? 'var(--table-row-alt, rgba(255, 255, 255, 0.03))' 
        : 'transparent'
    };
  }
  
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--table-row-hover, rgba(0, 123, 255, 0.05));
  }
`;

const Clients: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    taxNumber: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Client | null>(null);
  const [alternatingRows] = useState(true);

  const queryClient = useQueryClient();

  const { data: clientsData, isLoading, error } = useQuery(
    ['clients', page, search],
    () => clientService.getClients({ page, limit: 20, search }),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(clientService.createClient, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      setShowForm(false);
      resetForm();
      setSuccessMessage('Client created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create client';
      setFormErrors([errorMessage]);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientService.updateClient(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clients');
        setShowForm(false);
        setEditingClient(null);
        resetForm();
        setSuccessMessage('Client updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error?.message || 'Failed to update client';
        setFormErrors([errorMessage]);
      },
    }
  );

  const deleteMutation = useMutation(clientService.deleteClient, {
    onSuccess: () => {
      queryClient.invalidateQueries('clients');
      setShowDeleteConfirm(null);
      setSuccessMessage('Client deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete client';
      setFormErrors([errorMessage]);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      taxNumber: '',
      notes: '',
    });
    setFormErrors([]);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        zipCode: client.address?.zipCode || '',
        country: client.address?.country || '',
      },
      taxNumber: client.taxNumber || '',
      notes: client.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validate form
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Name is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return '';
    const parts = [address.street, address.city, address.state, address.zipCode, address.country];
    return parts.filter(Boolean).join(', ');
  };

  if (isLoading) return <div>{t('loading')}</div>;
  if (error) return <div>{t('errorLoadingClients')}</div>;

  return (
    <ClientsContainer>
      <PageHeader>
        <PageTitle>{t('clientManagement')}</PageTitle>
        <DesktopButtons>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowForm(true)}>{t('addNewClient')}</Button>
          )}
        </DesktopButtons>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>{t('search')}</FilterLabel>
          <Input
            type="text"
            placeholder={t('searchClientsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
      </FiltersContainer>

      {showForm && user?.role === 'admin' && (
        <Card>
          <h3>{editingClient ? t('editClient') : t('addNewClient')}</h3>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <label>{t('name')} *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label>{t('email')}</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <label>{t('phone')}</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('phonePlaceholder')}
                />
              </div>
              
              <div>
                <label>{t('taxNumber')}</label>
                <Input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  placeholder={t('vatNumberPlaceholder')}
                />
              </div>
            </FormGrid>

            <AddressSection>
              <h4>{t('address')}</h4>
              <AddressGrid>
                <div>
                  <label>{t('streetAddress')}</label>
                  <Input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    placeholder={t('streetAddressPlaceholder')}
                  />
                </div>
                
                <div>
                  <label>{t('cityTown')}</label>
                  <Input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value }
                    })}
                    placeholder={t('cityPlaceholder')}
                  />
                </div>
                
                <div>
                  <label>{t('province')}</label>
                  <Input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                    placeholder={t('provincePlaceholder')}
                  />
                </div>
                
                <div>
                  <label>{t('postalCode')}</label>
                  <Input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    placeholder={t('postalCodePlaceholder')}
                  />
                </div>
              </AddressGrid>
              <div style={{ marginTop: '16px' }}>
                <label>{t('country')}</label>
                <Input
                  type="text"
                  value={formData.address?.country || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  placeholder={t('countryPlaceholder')}
                />
              </div>
            </AddressSection>

            <div style={{ marginTop: '16px' }}>
              <label>{t('notes')}</label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('additionalNotesPlaceholder')}
              />
            </div>

            {formErrors.length > 0 && (
              <ValidationError>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{t('formError')}</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationError>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {editingClient ? t('saveClient') : t('addClient')}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                  resetForm();
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <TableContainer>
        <ClientsTable>
        <thead>
          <tr>
            <NameHeader>{t('name')}</NameHeader>
            <ContactHeader>{t('contact')}</ContactHeader>
            <AddressHeader>{t('address')}</AddressHeader>
            <TaxHeader>{t('taxNumber')}</TaxHeader>
            <StatusHeader>{t('status')}</StatusHeader>
            {user?.role === 'admin' && <ActionsHeader>{t('actions')}</ActionsHeader>}
          </tr>
        </thead>
        <tbody>
          {clientsData?.data.map((client, index) => (
            <TableRow key={client._id} alternating={alternatingRows} index={index}>
              <NameColumn>
                <strong>{client.name}</strong>
              </NameColumn>
              <ContactColumn>
                <div>
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                </div>
              </ContactColumn>
              <AddressColumn>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {formatAddress(client.address)}
                </div>
              </AddressColumn>
              <TaxColumn>{client.taxNumber || '-'}</TaxColumn>
              <StatusColumn>
                <StatusBadge status={client.isActive ? 'active' : 'inactive'}>
                  {client.isActive ? t('active') : t('inactive')}
                </StatusBadge>
              </StatusColumn>
              {user?.role === 'admin' && (
                <ActionsColumn>
                  <ActionButtons>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEdit(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('edit')}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteConfirm(client)}
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
        </ClientsTable>
      </TableContainer>

      {/* Mobile Card Layout */}
      <MobileCardContainer>
        {clientsData?.data.map((client, index) => (
          <MobileCard key={client._id}>
            <MobileCardHeader>
              <MobileCardTitle>{client.name}</MobileCardTitle>
              <MobileCardStatus>
                <StatusBadge status={client.isActive ? 'active' : 'inactive'}>
                  {client.isActive ? t('active') : t('inactive')}
                </StatusBadge>
              </MobileCardStatus>
            </MobileCardHeader>
            
            <MobileCardContent>
              <MobileCardField>
                <MobileCardLabel>{t('contact')}</MobileCardLabel>
                <MobileCardValue>
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                  {!client.email && !client.phone && <div>-</div>}
                </MobileCardValue>
              </MobileCardField>
              
              <MobileCardField>
                <MobileCardLabel>{t('taxNumber')}</MobileCardLabel>
                <MobileCardValue>{client.taxNumber || '-'}</MobileCardValue>
              </MobileCardField>
            </MobileCardContent>
            
            {client.address && formatAddress(client.address) && (
              <MobileCardField style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>
                <MobileCardLabel>{t('address')}</MobileCardLabel>
                <MobileCardValue>{formatAddress(client.address)}</MobileCardValue>
              </MobileCardField>
            )}
            
            {user?.role === 'admin' && (
              <MobileCardActions>
                <Button 
                  variant="secondary" 
                  onClick={() => handleEdit(client)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('edit')}
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => setShowDeleteConfirm(client)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('delete')}
                </Button>
              </MobileCardActions>
            )}
          </MobileCard>
        ))}
      </MobileCardContainer>

      {clientsData?.meta && clientsData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>{t('previous')}</Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {clientsData.meta.pages}
          </span>
          {page < clientsData.meta.pages && (
            <Button onClick={() => setPage(page + 1)}>{t('next')}</Button>
          )}
        </PaginationContainer>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>{t('confirmDelete')}</h3>
            <p>{t('deleteWarning')} <strong>{showDeleteConfirm.name}</strong>?</p>
            <p style={{ color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>{t('thisActionCannotBeUndone')}</p>
            <ConfirmationButtons>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                {t('noCancel')}
              </Button>
              <Button 
                variant="danger" 
                onClick={() => deleteMutation.mutate(showDeleteConfirm._id)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? t('loading') : t('yesDelete')}
              </Button>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationModal>
      )}
      
      {/* Floating Action Button for Mobile */}
      {user?.role === 'admin' && (
        <FloatingActionButton onClick={() => setShowForm(true)}>
          +
        </FloatingActionButton>
      )}
    </ClientsContainer>
  );
};

export default Clients;
