import React from 'react';
import styled from 'styled-components';
import { Card, Button } from '../styles/GlobalStyles';
import { formatCurrency } from '../utils/currency';
import { Order } from '../services/orderService';
import { useTranslation } from '../contexts/TranslationContext';

const ModalOverlay = styled.div`
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
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled(Card)`
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--bg-secondary);
  color: var(--text-primary);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
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
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--text-primary);
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const InvoiceInfo = styled.div`
  flex: 1;
`;

const InvoiceLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InvoiceValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
  
  &.amount {
    font-size: 32px;
    color: var(--primary-color, #007bff);
  }
`;

const CustomerInfo = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: 8px;
`;

const CustomerLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 5px;
`;

const CustomerValue = styled.div`
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background: var(--bg-primary);
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }
  
  td {
    color: var(--text-primary);
  }
  
  .text-right {
    text-align: right;
  }
`;

const TotalsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const TotalsTable = styled.table`
  width: 300px;
  
  tr {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
  }
  
  tr:last-child {
    border-top: 2px solid var(--border-color);
    padding-top: 15px;
    margin-top: 10px;
    font-weight: bold;
    font-size: 18px;
  }
  
  td {
    color: var(--text-primary);
  }
`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { t } = useTranslation();
  
  if (!isOpen || !order) return null;

  const customerAddress = order.customerInfo.address;
  const addressString = customerAddress 
    ? [
        customerAddress.street,
        customerAddress.city,
        customerAddress.state,
        customerAddress.zipCode,
        customerAddress.country,
      ].filter(Boolean).join(', ')
    : '';

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('invoiceDetails')}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <InvoiceHeader>
          <InvoiceInfo>
            <InvoiceLabel>{t('invoiceNumber')}</InvoiceLabel>
            <InvoiceValue>{order.invoiceNumber}</InvoiceValue>
          </InvoiceInfo>
          <InvoiceInfo>
            <InvoiceLabel>{t('date')}</InvoiceLabel>
            <InvoiceValue>{formatDate(order.createdAt)}</InvoiceValue>
          </InvoiceInfo>
          <InvoiceInfo style={{ textAlign: 'right' }}>
            <InvoiceLabel>{t('totalOrdersTable')}</InvoiceLabel>
            <InvoiceValue className="amount">{formatCurrency(order.total || 0)}</InvoiceValue>
          </InvoiceInfo>
        </InvoiceHeader>

        <CustomerInfo>
          <CustomerLabel>{t('billTo')}</CustomerLabel>
          <CustomerValue>{order.customerInfo.name}</CustomerValue>
          {order.customerInfo.email && (
            <>
              <CustomerLabel>{t('email')}</CustomerLabel>
              <CustomerValue>{order.customerInfo.email}</CustomerValue>
            </>
          )}
          {order.customerInfo.phone && (
            <>
              <CustomerLabel>{t('phone')}</CustomerLabel>
              <CustomerValue>{order.customerInfo.phone}</CustomerValue>
            </>
          )}
          {addressString && (
            <>
              <CustomerLabel>{t('address')}</CustomerLabel>
              <CustomerValue>{addressString}</CustomerValue>
            </>
          )}
        </CustomerInfo>

        <ItemsTable>
          <thead>
            <tr>
              <th>{t('item')}</th>
              <th>{t('quantityInventory')}</th>
              <th className="text-right">{t('unitPriceInventory')}</th>
              <th className="text-right">{t('totalPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>
                  {item.quantity} {item.unit}
                </td>
                <td className="text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </ItemsTable>

        <TotalsSection>
          <TotalsTable>
            <tbody>
              <tr>
                <td>{t('subtotal')}:</td>
                <td>{formatCurrency(order.subtotal || 0)}</td>
              </tr>
              {order.taxRate > 0 && (
                <tr>
                  <td>{t('tax')} ({order.taxRate}%):</td>
                  <td>{formatCurrency(order.taxAmount || 0)}</td>
                </tr>
              )}
              <tr>
                <td>{t('totalOrdersTable')}:</td>
                <td>{formatCurrency(order.total || 0)}</td>
              </tr>
            </tbody>
          </TotalsTable>
        </TotalsSection>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ViewInvoiceModal;

