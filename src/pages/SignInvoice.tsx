import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Card, Button } from '../styles/GlobalStyles';
import { signingService } from '../services/signingService';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation, Translations } from '../contexts/TranslationContext';
import { formatCurrency } from '../utils/currency';

const SignContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: var(--text-primary);
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const InvoiceCard = styled(Card)`
  margin-bottom: 30px;
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
  background: var(--bg-secondary);
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
    background: var(--bg-secondary);
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
  
  .total-row {
    font-weight: bold;
    font-size: 18px;
    
    td {
      border-top: 2px solid var(--border-color);
      padding-top: 20px;
    }
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
    
    &:last-child {
      border-top: 2px solid var(--border-color);
      padding-top: 15px;
      margin-top: 10px;
      font-weight: bold;
      font-size: 18px;
    }
  }
  
  td {
    color: var(--text-primary);
  }
`;

const SignForm = styled(Card)`
  margin-top: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 16px;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.3s, box-shadow 0.3s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color, #007bff);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--bg-secondary);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 6px;
`;

const Checkbox = styled.input`
  margin-top: 3px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color, #007bff);
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CheckboxLabel = styled.label`
  cursor: pointer;
  color: var(--text-primary);
  line-height: 1.5;
  
  a {
    color: var(--primary-color, #007bff);
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
      opacity: 0.8;
    }
  }
`;

const ErrorMessage = styled.div`
  background: var(--warning-bg, #fff3cd);
  border: 2px solid var(--warning-border, #ffc107);
  color: var(--warning-text, #856404);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
  
  /* Ensure text is always readable and adapts to theme */
  * {
    color: var(--warning-text, #856404) !important;
  }
  
  h2, h3, h4 {
    color: var(--warning-text, #856404) !important;
    margin-bottom: 8px;
  }
  
  p {
    color: var(--warning-text, #856404) !important;
    margin: 4px 0;
  }
`;

const SuccessMessage = styled.div`
  background: var(--success-bg, #d1e7dd);
  border: 2px solid var(--success-border, #badbcc);
  color: var(--success-text, #000000);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
  
  /* Ensure text is always readable and adapts to theme */
  * {
    color: var(--success-text, #000000) !important;
  }
  
  h2 {
    color: var(--success-text, #000000) !important;
    margin-bottom: 10px;
  }
  
  p {
    color: var(--success-text, #000000) !important;
    margin: 8px 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SignButton = styled(Button)`
  flex: 1;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to get translated error message from error code
const getErrorMessage = (
  errorCode: string | undefined, 
  defaultMessage: string, 
  t: (key: keyof Translations) => string
): string => {
  if (!errorCode) {
    return defaultMessage;
  }
  
  const errorMap: Record<string, keyof Translations> = {
    'TOKEN_NOT_FOUND': 'errorTokenNotFound',
    'TOKEN_INVALID': 'errorTokenInvalid',
    'ORDER_NOT_FOUND': 'errorOrderNotFound',
    'ORDER_ALREADY_SIGNED': 'errorOrderAlreadySigned',
    'VALIDATION_ERROR': 'errorValidationFailed',
  };
  
  const translationKey = errorMap[errorCode];
  if (translationKey) {
    return t(translationKey);
  }
  
  return defaultMessage;
};

const SignInvoice: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [signedBy, setSignedBy] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [sendingPDF, setSendingPDF] = useState(false);
  const [pdfSent, setPdfSent] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) {
        setError(t('invalidSigningLink'));
        setLoading(false);
        return;
      }

      try {
        const data = await signingService.getOrderByToken(token);
        setOrderData(data);
        // Pre-fill signed by with customer name
        if (data.order?.customerInfo?.name) {
          setSignedBy(data.order.customerInfo.name);
        }
      } catch (err: any) {
        const errorCode = err.response?.data?.error?.code;
        const errorMessage = getErrorMessage(
          errorCode,
          t('failedToLoadInvoice'),
          t
        );
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signedBy.trim()) {
      setError(t('pleaseEnterYourName'));
      return;
    }

    if (!consentAcknowledged) {
      setError(t('mustAcknowledgeTerms'));
      return;
    }

    if (!token) {
      setError(t('invalidSigningLink'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signingService.acceptOrder(token, {
        signedBy: signedBy.trim(),
        consentAcknowledged: true,
      });

      setSuccess(true);
    } catch (err: any) {
      const errorCode = err.response?.data?.error?.code;
      const errorMessage = getErrorMessage(
        errorCode,
        t('failedToSignInvoice'),
        t
      );
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SignContainer>
        <LoadingSpinner />
      </SignContainer>
    );
  }

  if (error && !orderData) {
    return (
      <SignContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </SignContainer>
    );
  }

  const handleSendPDF = async () => {
    if (!orderData?.order?._id) return;
    
    setSendingPDF(true);
    setError(null);
    
    try {
      await orderService.sendInvoicePDFEmail(
        orderData.order._id,
        orderData.order.customerInfo?.email
      );
      setPdfSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send invoice PDF');
    } finally {
      setSendingPDF(false);
    }
  };

  if (success) {
    return (
      <SignContainer>
        <SuccessMessage>
          <h2>{t('invoiceSignedSuccessfully')}</h2>
          <p>Thank you for signing invoice {orderData?.order?.invoiceNumber || ''}.</p>
          {!pdfSent && orderData?.order?.customerInfo?.email && (
            <p style={{ marginTop: '20px' }}>
              <Button 
                onClick={handleSendPDF} 
                disabled={sendingPDF}
                style={{ marginTop: '10px' }}
              >
                {sendingPDF ? t('sending') : t('clickHereToReceiveInvoiceCopy')}
              </Button>
            </p>
          )}
          {pdfSent && (
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
              {t('invoicePDFSentToEmail')}
            </p>
          )}
          <p style={{ marginTop: '20px' }}>You can safely close this tab.</p>
        </SuccessMessage>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </SignContainer>
    );
  }

  const order = orderData?.order;

  return (
    <SignContainer>
      <Header>
        <Title>{t('signInvoice')}</Title>
        <Subtitle>{t('signInvoiceSubtitle')}</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <InvoiceCard>
        <InvoiceHeader>
          <InvoiceInfo>
            <InvoiceLabel>{t('invoiceNumber')}</InvoiceLabel>
            <InvoiceValue>{order?.invoiceNumber}</InvoiceValue>
          </InvoiceInfo>
          <InvoiceInfo>
            <InvoiceLabel>{t('date')}</InvoiceLabel>
            <InvoiceValue>{order?.createdAt ? formatDate(order.createdAt) : 'N/A'}</InvoiceValue>
          </InvoiceInfo>
          <InvoiceInfo style={{ textAlign: 'right' }}>
            <InvoiceLabel>{t('totalOrdersTable')}</InvoiceLabel>
            <InvoiceValue className="amount">{formatCurrency(order?.total || 0)}</InvoiceValue>
          </InvoiceInfo>
        </InvoiceHeader>

        <CustomerInfo>
          <CustomerLabel>{t('billTo')}</CustomerLabel>
          <CustomerValue>{order?.customerInfo?.name}</CustomerValue>
          {order?.customerInfo?.email && (
            <>
              <CustomerLabel>{t('email')}</CustomerLabel>
              <CustomerValue>{order.customerInfo.email}</CustomerValue>
            </>
          )}
          {order?.customerInfo?.phone && (
            <>
              <CustomerLabel>{t('phone')}</CustomerLabel>
              <CustomerValue>{order.customerInfo.phone}</CustomerValue>
            </>
          )}
          {order?.customerInfo?.address && (
            <>
              <CustomerLabel>{t('address')}</CustomerLabel>
              <CustomerValue>
                {[
                  order.customerInfo.address.street,
                  order.customerInfo.address.city,
                  order.customerInfo.address.state,
                  order.customerInfo.address.zipCode,
                  order.customerInfo.address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </CustomerValue>
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
            {order?.items?.map((item: any, index: number) => (
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
                <td>{formatCurrency(order?.subtotal || 0)}</td>
              </tr>
              {order?.taxRate > 0 && (
                <tr>
                  <td>{t('tax')} ({order.taxRate}%):</td>
                  <td>{formatCurrency(order?.taxAmount || 0)}</td>
                </tr>
              )}
              <tr>
                <td>{t('totalOrdersTable')}:</td>
                <td>{formatCurrency(order?.total || 0)}</td>
              </tr>
            </tbody>
          </TotalsTable>
        </TotalsSection>
      </InvoiceCard>

      <SignForm>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="signedBy">{t('fullName')} *</Label>
            <Input
              id="signedBy"
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              placeholder={t('enterFullName')}
              required
              disabled={submitting}
            />
          </FormGroup>

          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="consent"
              checked={consentAcknowledged}
              onChange={(e) => setConsentAcknowledged(e.target.checked)}
              disabled={submitting}
              required
            />
            <CheckboxLabel htmlFor="consent">
              {t('acknowledgeTerms')}
            </CheckboxLabel>
          </CheckboxContainer>

          <ButtonGroup>
            <SignButton type="submit" disabled={submitting || !consentAcknowledged}>
              {submitting ? t('signing') : t('signAcceptInvoice')}
            </SignButton>
          </ButtonGroup>
        </form>
      </SignForm>
    </SignContainer>
  );
};

export default SignInvoice;

// Ensure this file is treated as a module
export {};

