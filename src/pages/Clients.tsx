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

const ClientsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FiltersContainer = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: end;
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const ClientsTable = styled(Table)`
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const ToggleButton = styled(Button)<{ variant: 'primary' | 'secondary' }>`
  margin-bottom: 16px;
`;

const TableRow = styled.tr<{ alternating: boolean; index: number }>`
  background-color: ${props => 
    props.alternating && props.index % 2 === 1 
      ? '#f8f9fa' 
      : 'transparent'
  };
`;

const Clients: React.FC = () => {
  const { user } = useAuth();
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
  const [alternatingRows, setAlternatingRows] = useState(false);

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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading clients</div>;

  return (
    <ClientsContainer>
      <PageHeader>
        <PageTitle>Client Management</PageTitle>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowForm(true)}>Add New Client</Button>
        )}
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <ToggleButton 
        variant={alternatingRows ? 'primary' : 'secondary'}
        onClick={() => setAlternatingRows(!alternatingRows)}
      >
        {alternatingRows ? 'Disable' : 'Enable'} Alternating Row Colors
      </ToggleButton>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Search:</FilterLabel>
          <Input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
      </FiltersContainer>

      {showForm && user?.role === 'admin' && (
        <Card>
          <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <label>Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label>Phone</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +27 12 345 6789"
                />
              </div>
              <div>
                <label>Tax Number</label>
                <Input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  placeholder="VAT Number"
                />
              </div>
            </FormGrid>

            <AddressSection>
              <h4>Address</h4>
              <AddressGrid>
                <div>
                  <label>Street Address</label>
                  <Input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, street: e.target.value }
                    })}
                    placeholder="e.g., 123 Main Street"
                  />
                </div>
                <div>
                  <label>City/Town</label>
                  <Input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value }
                    })}
                    placeholder="e.g., Johannesburg or Bloemfontein"
                  />
                </div>
                <div>
                  <label>Province</label>
                  <Input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                    placeholder="e.g., Gauteng"
                  />
                </div>
                <div>
                  <label>Postal Code</label>
                  <Input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    placeholder="e.g., 2196"
                  />
                </div>
              </AddressGrid>
              <div style={{ marginTop: '16px' }}>
                <label>Country</label>
                <Input
                  type="text"
                  value={formData.address?.country || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  placeholder="South Africa"
                />
              </div>
            </AddressSection>

            <div style={{ marginTop: '16px' }}>
              <label>Notes</label>
              <Input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the client..."
              />
            </div>

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
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {editingClient ? 'Update Client' : 'Add Client'}
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
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ClientsTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Address</th>
            <th>Tax Number</th>
            <th>Status</th>
            {user?.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {clientsData?.data.map((client, index) => (
            <TableRow key={client._id} alternating={alternatingRows} index={index}>
              <td>
                <strong>{client.name}</strong>
              </td>
              <td>
                <div>
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {formatAddress(client.address)}
                </div>
              </td>
              <td>{client.taxNumber || '-'}</td>
              <td>
                <StatusBadge status={client.isActive ? 'active' : 'inactive'}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </td>
              {user?.role === 'admin' && (
                <td>
                  <ActionButtons>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEdit(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteConfirm(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </ActionButtons>
                </td>
              )}
            </TableRow>
          ))}
        </tbody>
      </ClientsTable>

      {clientsData?.meta && clientsData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>Previous</Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {clientsData.meta.pages}
          </span>
          {page < clientsData.meta.pages && (
            <Button onClick={() => setPage(page + 1)}>Next</Button>
          )}
        </PaginationContainer>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the client <strong>{showDeleteConfirm.name}</strong>?</p>
            <p style={{ color: '#666', fontSize: '14px' }}>This action cannot be undone.</p>
            <ConfirmationButtons>
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => deleteMutation.mutate(showDeleteConfirm._id)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationModal>
      )}
    </ClientsContainer>
  );
};

export default Clients;
