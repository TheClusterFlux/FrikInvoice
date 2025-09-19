import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Card, 
  Button, 
  Table, 
  PageHeader, 
  PageTitle, 
  Input, 
  Select,
  StatusBadge,
  ErrorMessage 
} from '../styles/GlobalStyles';
import { orderService, Order } from '../services/orderService';
import PDFTemplateModal from '../components/PDFTemplateModal';

const OrdersContainer = styled.div`
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

const OrdersTable = styled(Table)`
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
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

const FilterLabel = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
`;

const Orders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [signingOrder, setSigningOrder] = useState<Order | null>(null);
  const [signedBy, setSignedBy] = useState('');
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedOrderForPDF, setSelectedOrderForPDF] = useState<Order | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Order | null>(null);

  const queryClient = useQueryClient();

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', page, search, status],
    () => orderService.getOrders({ page, limit: 20, search, status }),
    { keepPreviousData: true }
  );

  const signMutation = useMutation(
    ({ id, signedBy }: { id: string; signedBy: string }) =>
      orderService.signOrder(id, signedBy),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        setSigningOrder(null);
        setSignedBy('');
        setSuccessMessage('Order signed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    }
  );

  const deleteMutation = useMutation(orderService.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      setShowDeleteConfirm(null);
      setSuccessMessage('Order deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleSignOrder = (order: Order) => {
    setSigningOrder(order);
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (signingOrder && signedBy.trim()) {
      signMutation.mutate({ id: signingOrder._id, signedBy: signedBy.trim() });
    }
  };

  const handleDownloadPDF = (order: Order) => {
    setSelectedOrderForPDF(order);
    setPdfModalOpen(true);
  };

  const handlePDFTemplateSelect = async (template: string) => {
    if (!selectedOrderForPDF) return;
    
    try {
      const blob = await orderService.generatePDF(selectedOrderForPDF._id, template);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${selectedOrderForPDF.invoiceNumber}-${template}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading orders</div>;

  return (
    <OrdersContainer>
      <PageHeader>
        <PageTitle>Order Management</PageTitle>
        <Button as={Link} to="/orders/new">Create New Order</Button>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Search:</FilterLabel>
          <Input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="signed">Signed</option>
            <option value="completed">Completed</option>
          </Select>
        </FilterGroup>
      </FiltersContainer>

      <OrdersTable>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ordersData?.data.map((order) => (
            <tr key={order._id}>
              <td>
                <strong>{order.invoiceNumber}</strong>
              </td>
              <td>
                <div>
                  <strong>{order.customerInfo.name}</strong>
                  {order.customerInfo.email && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {order.customerInfo.email}
                    </div>
                  )}
                </div>
              </td>
              <td>
                <div style={{ fontSize: '12px' }}>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </div>
              </td>
              <td>{formatCurrency(order.total)}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>
                <StatusBadge status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </td>
              <td>
                <ActionButtons>
                  <Button 
                    variant="secondary" 
                    as={Link} 
                    to={`/orders/${order._id}/edit`}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleDownloadPDF(order)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    PDF
                  </Button>
                  {order.status === 'draft' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleSignOrder(order)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Sign
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteConfirm(order)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Delete
                  </Button>
                </ActionButtons>
              </td>
            </tr>
          ))}
        </tbody>
      </OrdersTable>

      {ordersData?.meta && ordersData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>Previous</Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {ordersData.meta.pages}
          </span>
          {page < ordersData.meta.pages && (
            <Button onClick={() => setPage(page + 1)}>Next</Button>
          )}
        </PaginationContainer>
      )}

      {/* Sign Order Modal */}
      {signingOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: '400px', maxWidth: '90vw' }}>
            <h3>Sign Order</h3>
            <p><strong>Invoice:</strong> {signingOrder.invoiceNumber}</p>
            <p><strong>Customer:</strong> {signingOrder.customerInfo.name}</p>
            <p><strong>Total:</strong> {formatCurrency(signingOrder.total)}</p>
            
            <form onSubmit={handleSignSubmit} style={{ marginTop: '20px' }}>
              <div>
                <label>Signed By (Customer Name):</label>
                <Input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Button type="submit" disabled={signMutation.isLoading}>
                  {signMutation.isLoading ? 'Signing...' : 'Sign Order'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setSigningOrder(null);
                    setSignedBy('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* PDF Template Selection Modal */}
      <PDFTemplateModal
        isOpen={pdfModalOpen}
        onClose={() => {
          setPdfModalOpen(false);
          setSelectedOrderForPDF(null);
        }}
        onSelectTemplate={handlePDFTemplateSelect}
        orderId={selectedOrderForPDF?._id || ''}
        orderNumber={selectedOrderForPDF?.invoiceNumber || ''}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the order <strong>{showDeleteConfirm.invoiceNumber}</strong>?</p>
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
    </OrdersContainer>
  );
};

export default Orders;
