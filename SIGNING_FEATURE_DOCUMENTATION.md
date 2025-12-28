# Invoice Signing Feature Documentation

## Overview

This document describes the email-based invoice signing feature that allows customers to sign invoices via a secure, unique link sent to their email address.

## Features

### 1. **Secure Token-Based Signing**
- Each signing request generates a unique 64-character cryptographic token
- Tokens expire after 30 days (configurable)
- Tokens are single-use (cannot be reused after signing)
- Tokens are tied to specific email addresses

### 2. **Comprehensive Signature Metadata**
The system captures the following information for legal compliance and audit purposes:

- **Device Information** (captured when link is accessed):
  - IP Address
  - User Agent (browser/device info)
  - Platform
  - Language
  - Timezone
  - Screen Resolution
  - Timestamp

- **Signature Information** (captured when order is signed):
  - Signer's full name
  - IP Address at time of signing
  - User Agent at time of signing
  - Consent acknowledgment
  - Document hash (SHA-256) for integrity verification
  - Signing method (email_link)
  - Token reference

### 3. **Professional E-Signature Standards**

The implementation follows industry best practices:

- ✅ **Unique, time-limited tokens** - Prevents unauthorized access
- ✅ **IP address tracking** - Records location of signature
- ✅ **User agent capture** - Records device/browser information
- ✅ **Cryptographic document hash** - Ensures document integrity
- ✅ **Consent acknowledgment** - Explicit user consent required
- ✅ **Audit trail** - Complete history of signature process
- ✅ **Single-use tokens** - Prevents signature replay attacks
- ✅ **Email verification** - Tokens tied to specific email addresses

## Architecture

### Backend Components

1. **SigningToken Model** (`src/models/SigningToken.js`)
   - Stores unique signing tokens
   - Tracks token usage and expiration
   - Captures device information
   - Links to orders

2. **Order Model Updates** (`src/models/Order.js`)
   - Enhanced `signatureMetadata` field
   - Stores comprehensive signature information
   - Links to signing token

3. **Email Service** (`src/services/emailService.js`)
   - Integrates with mail server API
   - Sends professional HTML email templates
   - Handles email delivery errors

4. **Order Routes** (`src/routes/orders.js`)
   - `POST /orders/:id/send-signing-email` - Send signing email (authenticated)
   - `GET /orders/sign/:token` - Get order by token (public)
   - `POST /orders/sign/:token/accept` - Accept/sign order (public)

### Frontend Components

1. **SignInvoice Page** (`src/pages/SignInvoice.tsx`)
   - Public page (no authentication required)
   - Displays invoice details
   - Captures signature and consent
   - Shows success/error messages

2. **Signing Service** (`src/services/signingService.ts`)
   - Public API client (no auth token)
   - Captures device information headers
   - Handles signing API calls

3. **Order Service Updates** (`src/services/orderService.ts`)
   - `sendSigningEmail()` method
   - Integrates with backend API

4. **Orders Page Updates** (`src/pages/Orders.tsx`)
   - "Send Signing Email" button
   - Only shown for draft/pending orders with customer email

## Environment Variables

### Backend

Add these to your backend `.env` file:

```env
# Email API Configuration
EMAIL_API_URL=http://email-api-service:8080
# Or for local development:
# EMAIL_API_URL=http://localhost:8080

# Email Settings
EMAIL_FROM=noreply@theclusterflux.com
EMAIL_REPLY_TO=support@theclusterflux.com

# Frontend URL (for generating signing links)
FRONTEND_URL=http://localhost:3000
# Or for production:
# FRONTEND_URL=https://yourdomain.com
```

### Frontend

No additional environment variables required. The frontend uses the existing `REACT_APP_API_URL` configuration.

## Usage

### Sending a Signing Email

1. Navigate to the Orders page
2. Find an order with status "draft" or "pending" that has a customer email
3. Click the "Send Signing Email" button
4. The system will:
   - Generate a unique signing token
   - Send a professional email to the customer
   - Update order status to "pending" (if it was "draft")

### Customer Signing Process

1. Customer receives email with signing link
2. Customer clicks link (unique token in URL)
3. System captures device information
4. Customer reviews invoice details
5. Customer enters their name
6. Customer acknowledges consent
7. Customer clicks "Sign & Accept Invoice"
8. System:
   - Validates token
   - Captures signature metadata
   - Updates order status to "signed"
   - Marks token as used
   - Shows success message

## Security Considerations

1. **Token Security**
   - 64-character random tokens (cryptographically secure)
   - Single-use tokens prevent replay attacks
   - Time-limited expiration (30 days)

2. **Email Verification**
   - Tokens are tied to specific email addresses
   - Prevents token sharing between different recipients

3. **Document Integrity**
   - SHA-256 hash of order data at time of signing
   - Prevents tampering after signature

4. **Audit Trail**
   - Complete record of signature process
   - Device information captured
   - Timestamps for all actions

5. **Consent**
   - Explicit consent acknowledgment required
   - Clear terms presented to signer

## Legal Compliance

The implementation includes features that support legal compliance:

- ✅ **Consent acknowledgment** - Explicit user agreement
- ✅ **IP address tracking** - Geographic location evidence
- ✅ **Device fingerprinting** - Device identification
- ✅ **Document hash** - Integrity verification
- ✅ **Timestamp records** - Temporal evidence
- ✅ **Audit trail** - Complete history

**Note:** This implementation provides a solid foundation for e-signatures, but you should consult with legal counsel to ensure compliance with applicable laws in your jurisdiction (e.g., ESIGN Act in the US, eIDAS in the EU).

## API Endpoints

### Send Signing Email
```
POST /api/v1/orders/:id/send-signing-email
Authorization: Bearer <token>
Body: { "email": "optional@email.com" }
```

### Get Order by Token (Public)
```
GET /api/v1/orders/sign/:token
No authentication required
```

### Accept/Sign Order (Public)
```
POST /api/v1/orders/sign/:token/accept
No authentication required
Body: {
  "signedBy": "Customer Name",
  "consentAcknowledged": "true"
}
```

## Error Handling

The system handles various error scenarios:

- Invalid or expired tokens
- Already used tokens
- Missing customer email
- Already signed orders
- Email delivery failures
- Network errors

All errors are returned with appropriate HTTP status codes and descriptive error messages.

## Future Enhancements

Potential improvements for future versions:

1. **Multi-signature support** - Multiple signers for the same invoice
2. **Signature images** - Capture actual signature images
3. **PDF signing** - Direct PDF signature integration
4. **Email reminders** - Automatic reminders for unsigned invoices
5. **Signature templates** - Customizable email templates
6. **Advanced analytics** - Signature completion rates and metrics
7. **Two-factor authentication** - Additional security for high-value invoices
8. **Digital certificates** - PKI-based signatures for enhanced security

## Testing

To test the signing feature:

1. Create an order with a customer email
2. Click "Send Signing Email" button
3. Check email inbox for signing link
4. Click link and verify invoice displays correctly
5. Enter name and acknowledge consent
6. Submit signature
7. Verify order status changes to "signed"
8. Check signature metadata in database

## Troubleshooting

### Email Not Sending
- Verify `EMAIL_API_URL` is correct
- Check mail server is running and accessible
- Verify email service API is responding
- Check network connectivity between services

### Token Not Working
- Verify token hasn't expired (30 days)
- Check token hasn't been used already
- Verify order hasn't been deleted
- Check token format (64 characters)

### Signature Not Saving
- Verify consent is acknowledged
- Check signedBy field is not empty
- Verify order is not already signed
- Check database connection

## Support

For issues or questions, please refer to the main project documentation or contact the development team.


