import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { Card, Grid } from '../styles/GlobalStyles';
import { orderService } from '../services/orderService';
import { inventoryService } from '../services/inventoryService';
import { clientService } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { shouldShowWelcomeToday, markWelcomeAsShownToday } from '../utils/welcomeUtils';
import logger from '../utils/logger';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-secondary);
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #007bff, #0056b3);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
    
    @media (max-width: 768px) {
      transform: none;
    }
  }
`;

const StatNumber = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }
`;

const ActionCard = styled(Card)`
  text-align: center;
  padding: 24px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  background: var(--bg-secondary);
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    padding: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #007bff;
    box-shadow: 0 8px 25px rgba(0, 123, 255, 0.15);
    
    @media (max-width: 768px) {
      transform: none;
    }
  }
`;

const ActionIcon = styled.div`
  font-size: 40px;
  margin-bottom: 16px;
`;

const ActionTitle = styled.h3`
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 18px;
`;

const ActionDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.4;
`;

const RecentActivity = styled(Card)`
  padding: 24px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ActivityTitle = styled.h2`
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 20px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 8px 0;
  }
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-primary);
    padding-left: 8px;
    padding-right: 8px;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 6px;
    
    @media (max-width: 768px) {
      padding-left: 4px;
      padding-right: 4px;
      margin-left: -4px;
      margin-right: -4px;
    }
  }
`;

const ActivityIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  width: 32px;
  text-align: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const WelcomeSection = styled.div<{ show: boolean }>`
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  display: ${({ show }) => show ? 'block' : 'none'};
`;

const WelcomeTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 28px;
`;

const WelcomeSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
`;

const StatsGrid = styled(Grid)`
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if welcome should be shown today
  useEffect(() => {
    const shouldShow = shouldShowWelcomeToday();
    setShowWelcome(shouldShow);
    
    if (shouldShow) {
      markWelcomeAsShownToday();
    }
  }, []);

  // Fetch dashboard data
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery(
    'dashboard-orders',
    () => orderService.getOrders({ page: 1, limit: 5 }),
    {
      onError: (error: any) => {
        logger.error('Dashboard', 'Failed to load orders', {
          error: error.message
        });
      }
    }
  );

  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useQuery(
    'dashboard-inventory',
    () => inventoryService.getInventory({ page: 1, limit: 1 }),
    {
      onError: (error: any) => {
        logger.error('Dashboard', 'Failed to load inventory', {
          error: error.message
        });
      }
    }
  );

  const { data: clientsData, isLoading: clientsLoading, error: clientsError } = useQuery(
    'dashboard-clients',
    () => clientService.getClients({ page: 1, limit: 1 }),
    {
      onError: (error: any) => {
        logger.error('Dashboard', 'Failed to load clients', {
          error: error.message
        });
      }
    }
  );

  const isLoading = ordersLoading || inventoryLoading || clientsLoading;
  const hasError = ordersError || inventoryError || clientsError;

  // Calculate stats
  const totalOrders = ordersData?.meta?.total || 0;
  const totalInventory = inventoryData?.meta?.total || 0;
  const totalClients = clientsData?.meta?.total || 0;
  const pendingOrders = ordersData?.data?.filter(order => order.status === 'pending').length || 0;

  // Get recent orders for activity feed
  const recentOrders = ordersData?.data?.slice(0, 5) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'signed': return '✅';
      case 'completed': return '🎯';
      case 'draft': return '📝';
      default: return '📄';
    }
  };

  // Navigation handlers
  const handleStatCardClick = (path: string, queryParams?: string) => {
    if (queryParams) {
      navigate(`${path}?${queryParams}`);
    } else {
      navigate(path);
    }
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSpinner>{t('loading')} dashboard...</LoadingSpinner>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <WelcomeSection show={showWelcome}>
        <WelcomeTitle>{t('welcomeBackDashboard')}, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : t('userDashboard')}!</WelcomeTitle>
        <WelcomeSubtitle>
          {user?.role === 'admin' 
            ? t('adminWelcomeMessage')
            : t('clerkWelcomeMessage')
          }
        </WelcomeSubtitle>
      </WelcomeSection>

      {hasError && (
        <ErrorMessage>
          {t('someDataCouldNotBeLoaded')}
        </ErrorMessage>
      )}

      <StatsGrid columns={4}>
        <StatCard onClick={() => handleStatCardClick('/orders')}>
          <StatIcon>📊</StatIcon>
          <StatNumber>{totalOrders}</StatNumber>
          <StatLabel>{t('totalOrders')}</StatLabel>
        </StatCard>
        
        <StatCard onClick={() => handleStatCardClick('/inventory')}>
          <StatIcon>📦</StatIcon>
          <StatNumber>{totalInventory}</StatNumber>
          <StatLabel>{t('inventoryItems')}</StatLabel>
        </StatCard>
        
        <StatCard onClick={() => handleStatCardClick('/clients')}>
          <StatIcon>👥</StatIcon>
          <StatNumber>{totalClients}</StatNumber>
          <StatLabel>{t('clients')}</StatLabel>
        </StatCard>
        
        <StatCard onClick={() => handleStatCardClick('/orders', 'status=pending')}>
          <StatIcon>⏳</StatIcon>
          <StatNumber>{pendingOrders}</StatNumber>
          <StatLabel>{t('pendingOrders')}</StatLabel>
        </StatCard>
      </StatsGrid>

      <QuickActions>
        <ActionCard as={Link} to="/orders/new">
          <ActionIcon>➕</ActionIcon>
          <ActionTitle>{t('createNewOrderDashboard')}</ActionTitle>
          <ActionDescription>
            {t('createNewOrderDescription')}
          </ActionDescription>
        </ActionCard>

        {user?.role === 'admin' && (
          <ActionCard as={Link} to="/users">
            <ActionIcon>👤</ActionIcon>
            <ActionTitle>{t('userManagementDashboard')}</ActionTitle>
            <ActionDescription>
              {t('userManagementDescription')}
            </ActionDescription>
          </ActionCard>
        )}
      </QuickActions>

      <RecentActivity>
        <ActivityTitle>{t('recentOrders')}</ActivityTitle>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <ActivityItem key={order._id} onClick={() => handleOrderClick(order._id)}>
              <ActivityIcon>{getStatusIcon(order.status)}</ActivityIcon>
              <ActivityContent>
                <ActivityText>
                  {t('order')} #{order.invoiceNumber} - {order.customerInfo.name}
                </ActivityText>
                <ActivityTime>
                  {formatDate(order.createdAt)} • {t('status')}: {order.status}
                </ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            {t('noRecentActivity')}. <Link to="/orders/new">{t('createYourFirstOrder')}</Link>
          </div>
        )}
      </RecentActivity>
    </DashboardContainer>
  );
};

export default Dashboard;

