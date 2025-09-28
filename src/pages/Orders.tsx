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
  StatusBadge
} from '../styles/GlobalStyles';
import { orderService, Order } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import PDFTemplateModal from '../components/PDFTemplateModal';

const OrdersContainer = styled.div`
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

const OrdersTable = styled(Table)`
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

const MobileCardInvoice = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
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

const InvoiceColumn = styled.td`
  width: 15%;
  word-break: break-word;
`;

const CustomerColumn = styled.td`
  width: 15%;
  word-break: break-word;
`;

const ItemsColumn = styled.td`
  width: 8%;
  word-break: break-word;
`;

const TotalColumn = styled.td`
  width: 12%;
  word-break: break-word;
`;

const DateColumn = styled.td`
  width: 12%;
  word-break: break-word;
`;

const StatusColumn = styled.td`
  width: 10%;
  word-break: break-word;
`;

const ActionsColumn = styled.td`
  width: 28%;
  text-align: right;
  padding-right: 16px;
`;

const InvoiceHeader = styled.th`
  width: 15%;
`;

const CustomerHeader = styled.th`
  width: 15%;
`;

const ItemsHeader = styled.th`
  width: 8%;
`;

const TotalHeader = styled.th`
  width: 12%;
`;

const DateHeader = styled.th`
  width: 12%;
`;

const StatusHeader = styled.th`
  width: 10%;
`;

const ActionsHeader = styled.th`
  width: 28%;
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  flex-wrap: wrap;
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

const TableRow = styled.tr<{ index: number }>`
  background-color: ${props => 
    props.index % 2 === 1 
      ? 'var(--table-row-alt, rgba(0, 0, 0, 0.02))' 
      : 'transparent'
  };
  
  /* Dark mode alternating rows */
  @media (prefers-color-scheme: dark) {
    background-color: ${props => 
      props.index % 2 === 1 
        ? 'var(--table-row-alt, rgba(255, 255, 255, 0.03))' 
        : 'transparent'
    };
  }
  
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--table-row-hover, rgba(0, 123, 255, 0.05));
  }
`;

const FilterLabel = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
`;

const Orders: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        setSuccessMessage(t('orderSignedSuccessfully'));
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    }
  );

  const deleteMutation = useMutation(orderService.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      setShowDeleteConfirm(null);
        setSuccessMessage(t('orderDeletedSuccessfully'));
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

  if (isLoading) return <div>{t('loading')}</div>;
  if (error) return <div>{t('errorLoadingOrders')}</div>;

  return (
    <OrdersContainer>
      <PageHeader>
        <PageTitle>{t('orderManagement')}</PageTitle>
        <DesktopButtons>
          <Button as={Link} to="/orders/new">{t('createNewOrderOrders')}</Button>
        </DesktopButtons>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>{t('search')}</FilterLabel>
          <Input
            type="text"
            placeholder={t('searchOrdersPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>{t('status')}</FilterLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t('allStatuses')}</option>
            <option value="draft">{t('draft')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="signed">{t('signed')}</option>
            <option value="completed">{t('completed')}</option>
          </Select>
        </FilterGroup>
      </FiltersContainer>

      <TableContainer>
        <OrdersTable>
        <thead>
          <tr>
            <InvoiceHeader>{t('invoiceNumber')}</InvoiceHeader>
            <CustomerHeader>{t('customer')}</CustomerHeader>
            <ItemsHeader>{t('items')}</ItemsHeader>
            <TotalHeader>{t('totalOrdersTable')}</TotalHeader>
            <DateHeader>{t('date')}</DateHeader>
            <StatusHeader>{t('status')}</StatusHeader>
            <ActionsHeader>{t('actions')}</ActionsHeader>
          </tr>
        </thead>
        <tbody>
          {ordersData?.data.map((order, index) => (
            <TableRow key={order._id} index={index}>
              <InvoiceColumn>
                <strong>{order.invoiceNumber}</strong>
              </InvoiceColumn>
              <CustomerColumn>
                <div>
                  <strong>{order.customerInfo.name}</strong>
                  {user?.role === 'admin' && order.customerInfo.email && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {order.customerInfo.email}
                    </div>
                  )}
                </div>
              </CustomerColumn>
              <ItemsColumn>
                <div style={{ fontSize: '12px' }}>
                  {order.items.length} {order.items.length !== 1 ? t('items') : t('item')}
                </div>
              </ItemsColumn>
              <TotalColumn>{formatCurrency(order.total)}</TotalColumn>
              <DateColumn>{formatDate(order.createdAt)}</DateColumn>
              <StatusColumn>
                <StatusBadge status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </StatusColumn>
              <ActionsColumn>
                <ActionButtons>
                  <Button 
                    variant="secondary" 
                    as={Link} 
                    to={`/orders/${order._id}/edit`}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {t('edit')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => handleDownloadPDF(order)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {t('pdf')}
                  </Button>
                  {order.status === 'draft' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => handleSignOrder(order)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('signOrder')}
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    onClick={() => setShowDeleteConfirm(order)}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    {t('delete')}
                  </Button>
                </ActionButtons>
              </ActionsColumn>
            </TableRow>
          ))}
        </tbody>
        </OrdersTable>
      </TableContainer>

      {/* Mobile Card Layout */}
      <MobileCardContainer>
        {ordersData?.data.map((order) => (
          <MobileCard key={order._id}>
            <MobileCardHeader>
              <MobileCardTitle>{order.customerInfo.name}</MobileCardTitle>
              <MobileCardInvoice>{order.invoiceNumber}</MobileCardInvoice>
            </MobileCardHeader>
            
            <MobileCardContent>
              <MobileCardField>
                <MobileCardLabel>{t('items')}</MobileCardLabel>
                <MobileCardValue>
                  {order.items.length} {order.items.length !== 1 ? t('items') : t('item')}
                </MobileCardValue>
              </MobileCardField>
              
              <MobileCardField>
                <MobileCardLabel>{t('totalOrdersTable')}</MobileCardLabel>
                <MobileCardValue>{formatCurrency(order.total)}</MobileCardValue>
              </MobileCardField>
            </MobileCardContent>
            
            <MobileCardField style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>
              <MobileCardLabel>{t('date')}</MobileCardLabel>
              <MobileCardValue>{formatDate(order.createdAt)}</MobileCardValue>
            </MobileCardField>
            
            <MobileCardField style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>
              <MobileCardLabel>{t('status')}</MobileCardLabel>
              <MobileCardValue>
                <StatusBadge status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </MobileCardValue>
            </MobileCardField>
            
            {user?.role === 'admin' && order.customerInfo.email && (
              <MobileCardField style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>
                <MobileCardLabel>{t('email')}</MobileCardLabel>
                <MobileCardValue>{order.customerInfo.email}</MobileCardValue>
              </MobileCardField>
            )}
            
            <MobileCardActions>
              <Button 
                variant="secondary" 
                as={Link} 
                to={`/orders/${order._id}/edit`}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                {t('edit')}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleDownloadPDF(order)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                {t('pdf')}
              </Button>
              {order.status === 'draft' && (
                <Button 
                  variant="secondary" 
                  onClick={() => handleSignOrder(order)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('signOrder')}
                </Button>
              )}
              <Button 
                variant="danger" 
                onClick={() => setShowDeleteConfirm(order)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                {t('delete')}
              </Button>
            </MobileCardActions>
          </MobileCard>
        ))}
      </MobileCardContainer>

      {ordersData?.meta && ordersData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button onClick={() => setPage(page - 1)}>{t('previous')}</Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {ordersData.meta.pages}
          </span>
          {page < ordersData.meta.pages && (
            <Button onClick={() => setPage(page + 1)}>{t('next')}</Button>
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
            <h3>{t('signOrder')}</h3>
            <p><strong>{t('invoiceNumber')}:</strong> {signingOrder.invoiceNumber}</p>
            <p><strong>{t('customer')}:</strong> {signingOrder.customerInfo.name}</p>
            <p><strong>{t('totalOrdersTable')}:</strong> {formatCurrency(signingOrder.total)}</p>
            
            <form onSubmit={handleSignSubmit} style={{ marginTop: '20px' }}>
              <div>
                <label>{t('signedByCustomerName')}</label>
                <Input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder={t('enterCustomerNamePlaceholder')}
                  required
                />
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Button type="submit" disabled={signMutation.isLoading}>
                  {signMutation.isLoading ? t('signing') : t('signOrder')}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setSigningOrder(null);
                    setSignedBy('');
                  }}
                >
                  {t('cancel')}
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
            <h3>{t('confirmDelete')}</h3>
            <p>{t('deleteOrderWarning')} <strong>{showDeleteConfirm.invoiceNumber}</strong>?</p>
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
      <FloatingActionButton as={Link} to="/orders/new">
        +
      </FloatingActionButton>
    </OrdersContainer>
  );
};

export default Orders;
