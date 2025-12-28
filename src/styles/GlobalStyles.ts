import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html {
    overflow-x: hidden;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  input, textarea, select {
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Default light theme - fallback */
  :root {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #dee2e6;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --primary-color: #007bff;
    --success-bg: #d1e7dd;
    --success-border: #badbcc;
    --success-text: #000000;
    --error-bg: #f8d7da;
    --error-border: #f5c2c7;
    --error-text: #000000;
    --warning-bg: #fff3cd;
    --warning-border: #ffc107;
    --warning-text: #000000;
  }

  /* Dark mode support */
  [data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: #404040;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --primary-color: #4da6ff;
    --success-bg: #1a3d1a;
    --success-border: #4a7c59;
    --success-text: #ffffff;
    --error-bg: #4a1a1a;
    --error-border: #6b2a2a;
    --error-text: #ffffff;
    --warning-bg: #3d2f1a;
    --warning-border: #b8860b;
    --warning-text: #ffd700;
  }

  [data-theme="light"] {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #dee2e6;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --primary-color: #007bff;
    --success-bg: #d1e7dd;
    --success-border: #badbcc;
    --success-text: #000000;
    --error-bg: #f8d7da;
    --error-border: #f5c2c7;
    --error-text: #000000;
    --warning-bg: #fff3cd;
    --warning-border: #ffc107;
    --warning-text: #000000;
  }

  /* Dark mode body styles */
  [data-theme="dark"] body {
    background-color: #1a1a1a;
    color: #ffffff;
  }

  /* Ensure all elements inherit theme colors */
  [data-theme="dark"] * {
    color: inherit;
  }

  /* Force dark mode on all cards and containers */
  [data-theme="dark"] .card,
  [data-theme="dark"] [class*="Card"],
  [data-theme="dark"] [class*="card"] {
    background-color: var(--bg-secondary) !important;
    color: var(--text-primary) !important;
  }
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const Card = styled.div`
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #007bff;
          color: white;
          &:hover {
            background-color: #0056b3;
          }
        `;
      case 'secondary':
        return `
          background-color: #6c757d;
          color: white;
          &:hover {
            background-color: #545b62;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover {
            background-color: #c82333;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;

  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px var(--shadow-color);

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  th {
    background-color: var(--bg-primary);
    font-weight: 600;
    color: var(--text-primary);
  }

  tr:hover {
    background-color: var(--bg-primary);
  }
`;

export const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;

  ${({ status }) => {
    switch (status) {
      case 'draft':
        return `
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `;
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'signed':
        return `
          background-color: var(--success-bg, #d1e7dd);
          color: var(--success-text, #000000);
          border: 1px solid var(--success-border, #badbcc);
        `;
      case 'completed':
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      case 'active':
        return `
          background-color: var(--success-bg, #d1e7dd);
          color: var(--success-text, #000000);
          border: 1px solid var(--success-border, #badbcc);
        `;
      case 'inactive':
        return `
          background-color: var(--error-bg, #f8d7da);
          color: var(--error-text, #000000);
          border: 1px solid var(--error-border, #f5c2c7);
        `;
      default:
        return `
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        `;
    }
  }}

  /* Dark mode overrides */
  [data-theme="dark"] & {
    ${({ status }) => {
      switch (status) {
        case 'pending':
          return `
            background-color: #4a3c00;
            color: #ffd700;
            border-color: #6b5b00;
          `;
        case 'signed':
        case 'active':
          return `
            background-color: var(--success-bg, #1a3d1a);
            color: var(--success-text, #ffffff);
            border-color: var(--success-border, #4a7c59);
          `;
        case 'completed':
          return `
            background-color: #0d3a3a;
            color: #87ceeb;
            border-color: #1a5a5a;
          `;
        case 'inactive':
          return `
            background-color: var(--error-bg, #4a1a1a);
            color: var(--error-text, #ffffff);
            border-color: var(--error-border, #6b2a2a);
          `;
        default:
          return '';
      }
    }}
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 2 }) => columns}, 1fr);
  gap: ${({ gap = '20px' }) => gap};
`;

export const Flex = styled.div<{ 
  direction?: 'row' | 'column';
  justify?: string;
  align?: string;
  gap?: string;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  justify-content: ${({ justify = 'flex-start' }) => justify};
  align-items: ${({ align = 'stretch' }) => align};
  gap: ${({ gap = '0' }) => gap};
`;

