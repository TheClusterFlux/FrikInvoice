import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import { shouldShowWelcomeToday, markWelcomeAsShownToday } from '../utils/welcomeUtils';

const LayoutContainer = styled.div<{ sidebarCollapsed: boolean }>`
  display: flex;
  min-height: 100vh;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside<{ collapsed: boolean; isDark: boolean }>`
  width: ${({ collapsed }) => collapsed ? '70px' : '250px'};
  height: 100vh;
  background: ${({ isDark }) => isDark 
    ? 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)' 
    : 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)'};
  color: white;
  padding: 20px 0;
  transition: all 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div<{ collapsed: boolean }>`
  padding: 0 ${({ collapsed }) => collapsed ? '10px' : '20px'} 20px;
  border-bottom: 1px solid #495057;
  margin-bottom: 20px;
  text-align: ${({ collapsed }) => collapsed ? 'center' : 'left'};
`;

const Logo = styled.h2<{ collapsed: boolean }>`
  font-size: ${({ collapsed }) => collapsed ? '16px' : '20px'};
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
`;

const Nav = styled.nav<{ collapsed: boolean }>`
  padding: 0 ${({ collapsed }) => collapsed ? '10px' : '20px'};
  flex: 1;
`;

const NavItem = styled(Link)<{ active?: boolean; collapsed?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px ${({ collapsed }) => collapsed ? '8px' : '16px'};
  color: ${({ active }) => (active ? '#fff' : '#adb5bd')};
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  background-color: ${({ active }) => (active ? '#007bff' : 'transparent')};
  position: relative;
  justify-content: ${({ collapsed }) => collapsed ? 'center' : 'flex-start'};

  &:hover {
    color: #fff;
    background-color: ${({ active }) => (active ? '#0056b3' : '#495057')};
    transform: translateX(${({ collapsed }) => collapsed ? '0' : '4px'});
  }

  span {
    font-size: 18px;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.3s ease;
  }

  /* Icon styling */
  span:first-child {
    margin-left: 0;
    display: ${({ collapsed }) => collapsed ? 'flex' : 'inline'};
    align-items: ${({ collapsed }) => collapsed ? 'center' : 'auto'};
    justify-content: ${({ collapsed }) => collapsed ? 'center' : 'auto'};
    width: ${({ collapsed }) => collapsed ? '100%' : 'auto'};
    text-align: ${({ collapsed }) => collapsed ? 'center' : 'left'};
  }

  /* Text styling */
  span:last-child {
    margin-left: ${({ collapsed }) => collapsed ? '0' : '8px'};
    font-size: 14px;
  }

  /* Enhanced active state when collapsed */
  ${({ active, collapsed }) => active && collapsed && `
    background-color: #007bff !important;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
    transform: scale(1.05);
  `}
`;

const ToggleButton = styled.button<{ collapsed: boolean }>`
  position: absolute;
  top: 20px;
  right: ${({ collapsed }) => collapsed ? '50%' : '12px'};
  transform: ${({ collapsed }) => collapsed ? 'translateX(50%)' : 'none'};
  width: 28px;
  height: 28px;
  background: ${({ collapsed }) => collapsed ? 'var(--bg-primary)' : 'var(--bg-secondary)'};
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  z-index: 1001;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
    border-color: var(--text-secondary);
    transform: ${({ collapsed }) => collapsed ? 'translateX(50%) scale(1.05)' : 'scale(1.05)'};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: ${({ collapsed }) => collapsed ? 'translateX(50%) scale(0.95)' : 'scale(0.95)'};
  }
`;

const SidebarFooter = styled.div<{ collapsed: boolean; isDark: boolean }>`
  padding: 20px ${({ collapsed }) => collapsed ? '10px' : '20px'};
  border-top: 1px solid ${({ isDark }) => isDark ? '#404040' : '#495057'};
  margin-top: auto;
`;

const LogoutButton = styled.button<{ collapsed: boolean }>`
  width: 100%;
  padding: 12px ${({ collapsed }) => collapsed ? '8px' : '16px'};
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => collapsed ? 'center' : 'flex-start'};
  gap: ${({ collapsed }) => collapsed ? '0' : '12px'};

  &:hover {
    background-color: #c82333;
    transform: translateY(-1px);
  }

  span {
    font-size: 18px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  /* Icon styling */
  span:first-child {
    display: ${({ collapsed }) => collapsed ? 'flex' : 'inline'};
    align-items: ${({ collapsed }) => collapsed ? 'center' : 'auto'};
    justify-content: ${({ collapsed }) => collapsed ? 'center' : 'auto'};
    width: ${({ collapsed }) => collapsed ? '100%' : 'auto'};
  }

  /* Text styling */
  span:last-child {
    margin-left: 12px;
    font-size: 14px;
  }
`;

const MobileNavbar = styled.div<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1001;
    height: 60px;
  }
`;

const MobileLogo = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const BurgerButton = styled.button<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 30px;
    height: 30px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    
    span {
      width: 25px;
      height: 3px;
      background: white;
      border-radius: 3px;
      transition: all 0.3s ease;
      transform-origin: 1px;
      
      &:nth-child(1) {
        transform: ${({ isOpen }) => isOpen ? 'rotate(45deg)' : 'rotate(0)'};
      }
      
      &:nth-child(2) {
        opacity: ${({ isOpen }) => isOpen ? '0' : '1'};
        transform: ${({ isOpen }) => isOpen ? 'translateX(20px)' : 'translateX(0)'};
      }
      
      &:nth-child(3) {
        transform: ${({ isOpen }) => isOpen ? 'rotate(-45deg)' : 'rotate(0)'};
      }
    }
  }
`;

const MobileNav = styled.nav<{ isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
    flex-direction: column;
    background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    padding: 0;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }
`;

const MobileNavItem = styled(Link)<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s ease;
  background-color: ${({ isActive }) => isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  span:first-child {
    font-size: 18px;
    margin-right: 12px;
    width: 20px;
    text-align: center;
  }
`;

const MobileToggleContainer = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    padding: 15px 20px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

const MainContent = styled.main<{ sidebarCollapsed: boolean; isDark: boolean }>`
  flex: 1;
  padding: 20px;
  margin-left: ${({ sidebarCollapsed }) => sidebarCollapsed ? '70px' : '250px'};
  transition: all 0.3s ease;
  background: ${({ isDark }) => isDark ? '#1a1a1a' : '#f8f9fa'};
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 20px 10px;
    padding-top: 80px; /* Account for fixed mobile navbar */
  }
`;

const Header = styled.header<{ isDark: boolean; hideTitle?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 30px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid var(--border-color);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 20px;
  }
  
  h1 {
    display: ${({ hideTitle }) => hideTitle ? 'none' : 'block'};
    
    @media (max-width: 768px) {
      margin: 0;
      font-size: 24px;
    }
  }
`;

const UserInfo = styled.div<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const UserName = styled.span<{ isDark: boolean }>`
  font-weight: 500;
  color: ${({ isDark }) => isDark ? '#ffffff' : '#333'};
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ToggleContainer = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: ${({ collapsed }) => collapsed ? 'column' : 'row'};
  gap: ${({ collapsed }) => collapsed ? '6px' : '8px'};
  margin-bottom: 12px;
  width: 100%;
`;

const ThemeToggleSwitch = styled.button<{ isDark: boolean; collapsed: boolean }>`
  flex: 1;
  height: 32px;
  background-color: ${({ isDark }) => isDark ? '#1a1a1a' : '#2c2c2c'};
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.02);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: ${({ isDark }) => isDark ? '#ffffff' : '#ffffff'};
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
    left: ${({ isDark }) => isDark ? 'calc(100% - 26px)' : '6px'};
    top: 50%;
    transform: translateY(-50%);
  }

  /* Add theme icon on the circle when collapsed */
  &::before {
    content: ${({ collapsed, isDark }) => collapsed ? (isDark ? '"🌙"' : '"☀️"') : '""'};
    position: absolute;
    left: ${({ isDark }) => isDark ? 'calc(100% - 26px)' : '6px'};
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    z-index: 3;
    opacity: ${({ collapsed }) => collapsed ? '1' : '0'};
    transition: opacity 0.3s ease;
    pointer-events: none;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    font-size: 14px;
    opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
    transition: all 0.3s ease;
    color: ${({ isDark }) => isDark ? '#ffffff' : '#ffffff'};
    font-weight: 500;
    z-index: 1;
    position: relative;
    filter: ${({ isDark }) => isDark ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'};
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }
`;

const LanguageToggleSwitch = styled.button<{ isDark: boolean; collapsed: boolean; isEnglish: boolean }>`
  flex: 1;
  height: 32px;
  background-color: ${({ isDark }) => isDark ? '#1a1a1a' : '#2c2c2c'};
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.02);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: ${({ isDark }) => isDark ? '#ffffff' : '#ffffff'};
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
    left: ${({ isEnglish }) => isEnglish ? '6px' : 'calc(100% - 26px)'};
    top: 50%;
    transform: translateY(-50%);
  }

  /* Add language text on the circle when collapsed */
  &::before {
    content: ${({ collapsed, isEnglish }) => collapsed ? (isEnglish ? '"EN"' : '"AF"') : '""'};
    position: absolute;
    left: ${({ isEnglish }) => isEnglish ? '6px' : 'calc(100% - 26px)'};
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    font-weight: bold;
    z-index: 3;
    opacity: ${({ collapsed }) => collapsed ? '1' : '0'};
    transition: opacity 0.3s ease;
    pointer-events: none;
    color: #333333;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    font-size: 11px;
    opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
    transition: all 0.3s ease;
    font-weight: 600;
    z-index: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  /* Left text (EN) */
  span:first-child {
    color: ${({ isEnglish }) => isEnglish ? '#333333' : '#ffffff'};
    filter: ${({ isEnglish }) => isEnglish ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'};
  }

  /* Right text (AF) */
  span:last-child {
    color: ${({ isEnglish }) => isEnglish ? '#ffffff' : '#333333'};
    filter: ${({ isEnglish }) => isEnglish ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'};
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if welcome should be shown today
  useEffect(() => {
    const shouldShow = shouldShowWelcomeToday();
    setShowWelcome(shouldShow);
    
    if (shouldShow) {
      markWelcomeAsShownToday();
    }
  }, []);

  const navItems = [
    { path: '/', label: t('dashboard'), icon: '📊' },
    { path: '/inventory', label: t('inventory'), icon: '📦' },
    { path: '/clients', label: t('clients'), icon: '👥' },
    { path: '/orders', label: t('orders'), icon: '📋' },
    ...(user?.role === 'admin' ? [{ path: '/users', label: t('users'), icon: '👤' }] : []),
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  // Close mobile nav when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileNavOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-mobile-nav]')) {
          setMobileNavOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileNavOpen]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'af' : 'en');
  };

  const isDashboard = location.pathname === '/';

  return (
    <>
      {/* Mobile Navbar - Fixed at top */}
      <MobileNavbar isOpen={mobileNavOpen} data-mobile-nav>
        <MobileLogo>FrikInvoice</MobileLogo>
        <BurgerButton isOpen={mobileNavOpen} onClick={toggleMobileNav}>
          <span></span>
          <span></span>
          <span></span>
        </BurgerButton>
      </MobileNavbar>

      {/* Mobile Navigation Menu - Dropdown */}
      <MobileNav isOpen={mobileNavOpen} data-mobile-nav>
        {navItems.map((item) => (
          <MobileNavItem
            key={item.path}
            to={item.path}
            isActive={location.pathname === item.path}
            onClick={() => setMobileNavOpen(false)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </MobileNavItem>
        ))}
        
        {/* Mobile Toggles */}
        <MobileToggleContainer>
          <ThemeToggleSwitch 
            isDark={isDark} 
            collapsed={false} 
            onClick={toggleTheme}
          >
            <span>☀️</span>
            <span>🌙</span>
          </ThemeToggleSwitch>
          <LanguageToggleSwitch 
            isDark={isDark} 
            collapsed={false} 
            isEnglish={language === 'en'}
            onClick={toggleLanguage}
          >
            <span>EN</span>
            <span>AF</span>
          </LanguageToggleSwitch>
        </MobileToggleContainer>

        {/* Mobile Logout */}
        <MobileNavItem
          to="#"
          isActive={false}
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm(t('logoutConfirm'))) {
              logout();
            }
          }}
        >
          <span>↪</span>
          <span>{t('logout')}</span>
        </MobileNavItem>
      </MobileNav>

      {/* Main Layout Container */}
      <LayoutContainer sidebarCollapsed={sidebarCollapsed}>
        {/* Desktop Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} isDark={isDark}>
        <SidebarHeader collapsed={sidebarCollapsed}>
          <Logo collapsed={sidebarCollapsed}>
            {sidebarCollapsed ? 'FI' : 'FrikInvoice'}
          </Logo>
        </SidebarHeader>
        <Nav collapsed={sidebarCollapsed}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              active={location.pathname === item.path}
              collapsed={sidebarCollapsed}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavItem>
          ))}
        </Nav>
        <SidebarFooter collapsed={sidebarCollapsed} isDark={isDark}>
          <ToggleContainer collapsed={sidebarCollapsed}>
            <ThemeToggleSwitch 
              isDark={isDark} 
              collapsed={sidebarCollapsed} 
              onClick={toggleTheme}
            >
              <span>☀️</span>
              <span>🌙</span>
            </ThemeToggleSwitch>
            <LanguageToggleSwitch 
              isDark={isDark} 
              collapsed={sidebarCollapsed} 
              isEnglish={language === 'en'}
              onClick={toggleLanguage}
            >
              <span>EN</span>
              <span>AF</span>
            </LanguageToggleSwitch>
          </ToggleContainer>
          <LogoutButton collapsed={sidebarCollapsed} onClick={logout}>
            <span>↪</span>
            {!sidebarCollapsed && <span>{t('logout')}</span>}
          </LogoutButton>
        </SidebarFooter>
        <ToggleButton 
          collapsed={sidebarCollapsed} 
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? '▶' : '◀'}
        </ToggleButton>
      </Sidebar>
      
      <MainContent sidebarCollapsed={sidebarCollapsed} isDark={isDark}>
        <Header isDark={isDark} hideTitle={!isDashboard}>
          <h1>{t('orderManagementSystem')}</h1>
          <UserInfo isDark={isDark}>
            {showWelcome && (
              <UserName isDark={isDark}>{t('welcomeBack')}, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1).toLowerCase() : 'User'}</UserName>
            )}
          </UserInfo>
        </Header>
        {children}
      </MainContent>
    </LayoutContainer>
    </>
  );
};

export default Layout;

