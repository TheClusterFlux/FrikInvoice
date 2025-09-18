# FrikInvoice Frontend

This is the React frontend for the FrikInvoice order management system.

## Features

- Modern React 18 with TypeScript
- Styled Components for styling
- React Query for data fetching
- React Router for navigation
- Form handling with React Hook Form
- Responsive design
- User authentication and role-based access

## Environment Variables

The following environment variables are configured:

- `REACT_APP_API_URL`: Backend API URL (https://frik-invoice-bff.theclusterflux.com/api/v1)
- `REACT_APP_ENVIRONMENT`: Environment (production/development)

## Pages

- **Login**: User authentication
- **Dashboard**: Overview and statistics
- **Inventory**: Manage inventory items
- **Orders**: View and manage orders
- **OrderForm**: Create/edit orders
- **Clients**: Manage client information
- **Users**: User management (admin only)

## Components

- **Layout**: Main application layout with navigation
- **LoadingSpinner**: Loading indicator
- **PasswordChangeModal**: Password change modal
- **PDFTemplateModal**: PDF template selection

## Services

- **authService**: Authentication API calls
- **inventoryService**: Inventory management API calls
- **orderService**: Order management API calls
- **clientService**: Client management API calls
- **userService**: User management API calls

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Kubernetes:
   ```bash
   kubectl apply -f deployment.yaml
   ```

## Development

To run locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export REACT_APP_API_URL=http://localhost:8080/api/v1
   export REACT_APP_ENVIRONMENT=development
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Styling

The application uses Styled Components for styling with a modern, clean design. Global styles are defined in `src/styles/GlobalStyles.ts`.

## Authentication

The frontend uses JWT tokens for authentication. Tokens are stored in memory and automatically refreshed. Users are redirected to login if not authenticated.

## User Roles

- **clerk**: Can manage inventory, orders, and clients
- **admin**: Full access including user management