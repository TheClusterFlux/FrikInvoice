import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Translations {
  // Navigation
  dashboard: string;
  orders: string;
  clients: string;
  inventory: string;
  users: string;
  logout: string;
  
  // Common actions
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  close: string;
  add: string;
  remove: string;
  search: string;
  filter: string;
  export: string;
  import: string;
  download: string;
  upload: string;
  yes: string;
  no: string;
  confirm: string;
  loading: string;
  disable: string;
  enable: string;
  
  // Authentication
  login: string;
  username: string;
  password: string;
  loginButton: string;
  logoutConfirm: string;
  invalidCredentials: string;
  loginError: string;
  
  // Dashboard
  welcomeBack: string;
  totalOrders: string;
  inventoryItems: string;
  pendingOrders: string;
  createNewOrderDashboard: string;
  userManagementDashboard: string;
  recentOrders: string;
  noRecentActivity: string;
  
  // Orders
  orderManagement: string;
  createNewOrderOrders: string;
  editOrder: string;
  signOrder: string;
  orderStatus: string;
  customer: string;
  items: string;
  totalOrdersTable: string;
  date: string;
  status: string;
  actions: string;
  pdf: string;
  draft: string;
  pending: string;
  signed: string;
  completed: string;
  
  // Clients
  clientManagement: string;
  addNewClient: string;
  editClient: string;
  saveClient: string;
  addClient: string;
  clientName: string;
  contactInfo: string;
  address: string;
  taxNumber: string;
  clientStatus: string;
  active: string;
  inactive: string;
  
  // Inventory
  inventoryManagement: string;
  addNewItem: string;
  editItem: string;
  updateItem: string;
  addItem: string;
  itemCode: string;
  description: string;
  group: string;
  unit: string;
  price: string;
  quantityInventory: string;
  unitPriceInventory: string;
  totalPrice: string;
  importInventory: string;
  downloadTemplate: string;
  exportCSV: string;
  importCSV: string;
  itemsPerPage: string;
  alternatingRowColors: string;
  
  // Users
  userManagementUsers: string;
  createUser: string;
  editUser: string;
  resetPassword: string;
  userRole: string;
  admin: string;
  clerk: string;
  user: string;
  lastLogin: string;
  createdUsers: string;
  allRoles: string;
  
  // Forms
  required: string;
  optional: string;
  selectOption: string;
  enterValue: string;
  formError: string;
  validationError: string;
  
  // Modals
  confirmDelete: string;
  deleteWarning: string;
  thisActionCannotBeUndone: string;
  yesDelete: string;
  noCancel: string;
  
  // Order Form
  orderForm: string;
  selectClient: string;
  clientDetails: string;
  itemSelection: string;
  quantityOrderForm: string;
  unitPriceOrderForm: string;
  totalOrderForm: string;
  subtotal: string;
  tax: string;
  grandTotal: string;
  notes: string;
  saveOrder: string;
  updateOrder: string;
  
  // System
  orderManagementSystem: string;
  switchToLightMode: string;
  switchToDarkMode: string;
  switchToAfrikaans: string;
  switchToEnglish: string;
  
  // Error messages
  errorOccurred: string;
  tryAgain: string;
  networkError: string;
  serverError: string;
  notFound: string;
  unauthorized: string;
  forbidden: string;
  
  // Success messages
  orderSignedSuccessfully: string;
  orderDeletedSuccessfully: string;
  
  // Error messages
  errorLoadingOrders: string;
  
  // User specific
  userCreatedSuccessfully: string;
  userUpdatedSuccessfully: string;
  userDeletedSuccessfully: string;
  passwordResetSuccessfully: string;
  failedToCreateUser: string;
  failedToUpdateUser: string;
  failedToDeleteUser: string;
  failedToResetPassword: string;
  never: string;
  
  // Dashboard specific
  welcomeBackDashboard: string;
  userDashboard: string;
  adminWelcomeMessage: string;
  clerkWelcomeMessage: string;
  someDataCouldNotBeLoaded: string;
  createNewOrderDescription: string;
  userManagementDescription: string;
  createYourFirstOrder: string;
  
  // Placeholders and additional text
  searchUsersPlaceholder: string;
  searchClientsPlaceholder: string;
  searchItemsPlaceholder: string;
  searchOrdersPlaceholder: string;
  searchClientsByNamePlaceholder: string;
  phonePlaceholder: string;
  vatNumberPlaceholder: string;
  streetAddressPlaceholder: string;
  cityPlaceholder: string;
  provincePlaceholder: string;
  postalCodePlaceholder: string;
  countryPlaceholder: string;
  additionalNotesPlaceholder: string;
  additionalOrderNotesPlaceholder: string;
  leaveEmptyForceResetPlaceholder: string;
  loadingItemsPlaceholder: string;
  quantityPlaceholder: string;
  pricePlaceholder: string;
  
  // Error messages
  errorLoadingUsers: string;
  errorLoadingClients: string;
  
  // Signing page
  signInvoice: string;
  signInvoiceSubtitle: string;
  invoiceSignedSuccessfully: string;
  invoiceSignedRedirect: string;
  pleaseEnterYourName: string;
  mustAcknowledgeTerms: string;
  invalidSigningLink: string;
  failedToLoadInvoice: string;
  failedToSignInvoice: string;
  goToHome: string;
  reviewAndSignInvoice: string;
  billTo: string;
  fullName: string;
  enterFullName: string;
  acknowledgeTerms: string;
  signAcceptInvoice: string;
  clickHereToReceiveInvoiceCopy: string;
  invoicePDFSentToEmail: string;
  view: string;
  invoiceDetails: string;
  sending: string;
  
  // Signing error codes
  errorTokenNotFound: string;
  errorTokenInvalid: string;
  errorTokenExpired: string;
  errorTokenAlreadyUsed: string;
  errorOrderNotFound: string;
  errorOrderAlreadySigned: string;
  errorValidationFailed: string;
  errorGenericSigning: string;
  
  // Pagination
  previous: string;
  next: string;
  
  // Form labels
  email: string;
  phone: string;
  streetAddress: string;
  cityTown: string;
  province: string;
  postalCode: string;
  country: string;
  
  // Table headers
  role: string;
  created: string;
  name: string;
  contact: string;
  
  // Default credentials
  defaultUsername: string;
  defaultPassword: string;
  allGroups: string;
  
  // Order specific
  allStatuses: string;
  invoiceNumber: string;
  item: string;
  order: string;
  signing: string;
  signedByCustomerName: string;
  enterCustomerNamePlaceholder: string;
  deleteOrderWarning: string;
}

interface TranslationContextType {
  language: 'en' | 'af';
  setLanguage: (lang: 'en' | 'af') => void;
  t: (key: keyof Translations) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations: Record<'en' | 'af', Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    orders: 'Orders',
    clients: 'Clients',
    inventory: 'Inventory',
    users: 'Users',
    logout: 'Logout',
    
    // Common actions
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    loading: 'Loading',
    disable: 'Disable',
    enable: 'Enable',
    
    // Authentication
    login: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    logoutConfirm: 'Are you sure you want to logout?',
    invalidCredentials: 'Invalid credentials',
    loginError: 'Login failed',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    totalOrders: 'Total orders',
    inventoryItems: 'Inventory items',
    pendingOrders: 'Pending orders',
    createNewOrderDashboard: 'Create new order',
    userManagementDashboard: 'User management',
    recentOrders: 'Recent orders',
    noRecentActivity: 'No recent activity',
    
    // Orders
    orderManagement: 'Order management',
    createNewOrderOrders: 'Create new order',
    editOrder: 'Edit order',
    signOrder: 'Sign order',
    orderStatus: 'Status',
    customer: 'Customer',
    items: 'Items',
    totalOrdersTable: 'Total',
    date: 'Date',
    status: 'Status',
    actions: 'Actions',
    pdf: 'PDF',
    draft: 'Draft',
    pending: 'Pending',
    signed: 'Signed',
    completed: 'Completed',
    
    // Clients
    clientManagement: 'Client management',
    addNewClient: 'Add new client',
    editClient: 'Edit client',
    saveClient: 'Save client',
    addClient: 'Add client',
    clientName: 'Name',
    contactInfo: 'Contact',
    address: 'Address',
    taxNumber: 'Tax Number',
    clientStatus: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    
    // Inventory
    inventoryManagement: 'Inventory management',
    addNewItem: 'Add new item',
    editItem: 'Edit item',
    updateItem: 'Update item',
    addItem: 'Add item',
    itemCode: 'Code',
    description: 'Description',
    group: 'Group',
    unit: 'Unit',
    price: 'Price',
    quantityInventory: 'Quantity',
    unitPriceInventory: 'Unit Price',
    totalPrice: 'Total',
    importInventory: 'Import inventory from CSV',
    downloadTemplate: 'Download template CSV',
    exportCSV: 'Export CSV',
    importCSV: 'Import CSV',
    itemsPerPage: 'Items per page',
    alternatingRowColors: 'Alternating row colors',
    
    // Users
    userManagementUsers: 'User management',
    createUser: 'Create user',
    editUser: 'Edit user',
    resetPassword: 'Reset password',
    userRole: 'Role',
    admin: 'Admin',
    clerk: 'Clerk',
    user: 'User',
    lastLogin: 'Last Login',
    createdUsers: 'Created',
    allRoles: 'All Roles',
    
    // Forms
    required: 'Required',
    optional: 'Optional',
    selectOption: 'Select an option',
    enterValue: 'Enter value',
    formError: 'Form error',
    validationError: 'Validation error',
    
    // Modals
    confirmDelete: 'Confirm delete',
    deleteWarning: 'Are you sure you want to delete this item?',
    thisActionCannotBeUndone: 'This action cannot be undone.',
    yesDelete: 'Yes, delete',
    noCancel: 'No',
    
    // Order Form
    orderForm: 'Order Form',
    selectClient: 'Select Client',
    clientDetails: 'Client Details',
    itemSelection: 'Item Selection',
    quantityOrderForm: 'Quantity',
    unitPriceOrderForm: 'Unit Price',
    totalOrderForm: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    grandTotal: 'Grand Total',
    notes: 'Notes',
    saveOrder: 'Save Order',
    updateOrder: 'Update Order',
    
    // System
    orderManagementSystem: 'Order management system',
    switchToLightMode: 'Switch to light mode',
    switchToDarkMode: 'Switch to dark mode',
    switchToAfrikaans: 'Switch to Afrikaans',
    switchToEnglish: 'Switch to English',
    
    // Error messages
    errorOccurred: 'An error occurred',
    tryAgain: 'Please try again',
    networkError: 'Network error',
    serverError: 'Server error',
    notFound: 'Not found',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    
    // Success messages
    orderSignedSuccessfully: 'Order signed successfully!',
    orderDeletedSuccessfully: 'Order deleted successfully!',
    
    // Error messages
    errorLoadingOrders: 'Error loading orders',
    
    // User specific
    userCreatedSuccessfully: 'User created successfully!',
    userUpdatedSuccessfully: 'User updated successfully!',
    userDeletedSuccessfully: 'User deleted successfully!',
    passwordResetSuccessfully: 'Password reset successfully!',
    failedToCreateUser: 'Failed to create user',
    failedToUpdateUser: 'Failed to update user',
    failedToDeleteUser: 'Failed to delete user',
    failedToResetPassword: 'Failed to reset password',
    never: 'Never',
    
    // Dashboard specific
    welcomeBackDashboard: 'Welcome back',
    userDashboard: 'User',
    adminWelcomeMessage: 'Manage your invoice system and oversee all operations',
    clerkWelcomeMessage: 'Create and manage orders for your customers',
    someDataCouldNotBeLoaded: 'Some data could not be loaded. Please refresh the page or contact support.',
    createNewOrderDescription: 'Start a new invoice order for a customer',
    userManagementDescription: 'Manage system users and permissions',
    createYourFirstOrder: 'Create your first order',
    
    // Order specific
    allStatuses: 'All Statuses',
    invoiceNumber: 'Invoice #',
    item: 'item',
    order: 'Order',
    signing: 'Signing...',
    signedByCustomerName: 'Signed By (Customer Name):',
    enterCustomerNamePlaceholder: 'Enter customer name',
    deleteOrderWarning: 'Are you sure you want to delete the order',
    
    // Placeholders and additional text
    searchUsersPlaceholder: 'Search users...',
    searchClientsPlaceholder: 'Search clients...',
    searchItemsPlaceholder: 'Search items...',
    searchOrdersPlaceholder: 'Search orders...',
    searchClientsByNamePlaceholder: 'Search clients by name, email, or phone...',
    phonePlaceholder: 'e.g., +27 12 345 6789',
    vatNumberPlaceholder: 'VAT Number',
    streetAddressPlaceholder: 'e.g., 123 Main Street',
    cityPlaceholder: 'e.g., Johannesburg or Bloemfontein',
    provincePlaceholder: 'e.g., Gauteng',
    postalCodePlaceholder: 'e.g., 2196',
    countryPlaceholder: 'South Africa',
    additionalNotesPlaceholder: 'Additional notes about the client...',
    additionalOrderNotesPlaceholder: 'Additional notes for this order...',
    leaveEmptyForceResetPlaceholder: 'Leave empty to force user reset',
    loadingItemsPlaceholder: 'Loading items...',
    quantityPlaceholder: '1',
    pricePlaceholder: '0.00',
    
    // Error messages
    errorLoadingUsers: 'Error loading users',
    errorLoadingClients: 'Error loading clients',
    
    // Signing page
    signInvoice: 'Sign Invoice',
    signInvoiceSubtitle: 'Please review the invoice below and provide your signature',
    invoiceSignedSuccessfully: 'Invoice Signed Successfully!',
    invoiceSignedRedirect: 'Thank you for signing invoice {invoiceNumber}. You will be redirected shortly...',
    pleaseEnterYourName: 'Please enter your name',
    mustAcknowledgeTerms: 'You must acknowledge that you agree to the terms',
    invalidSigningLink: 'Invalid signing link',
    failedToLoadInvoice: 'Failed to load invoice. The link may be invalid or expired.',
    failedToSignInvoice: 'Failed to sign invoice. Please try again.',
    goToHome: 'Go to Home',
    reviewAndSignInvoice: 'Review & Sign Invoice',
    billTo: 'Bill To',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    acknowledgeTerms: 'I acknowledge that I have reviewed this invoice and agree to the terms and conditions. By signing, I confirm that the information is accurate and I agree to pay the amount specified.',
    signAcceptInvoice: 'Sign & Accept Invoice',
    clickHereToReceiveInvoiceCopy: 'Click here to receive a copy of the invoice in your inbox',
    invoicePDFSentToEmail: 'Invoice PDF has been sent to your email!',
    view: 'View',
    invoiceDetails: 'Invoice Details',
    sending: 'Sending...',
    
    // Signing error codes
    errorTokenNotFound: 'This signing link is invalid or has expired. Please contact the sender to request a new link.',
    errorTokenInvalid: 'This signing link is invalid or has expired. Please contact the sender to request a new link.',
    errorTokenExpired: 'This signing link has expired. Please contact the sender to request a new link.',
    errorTokenAlreadyUsed: 'This signing link has already been used. If you need to sign this invoice again, please contact the sender to request a new link.',
    errorOrderNotFound: 'This invoice could not be found. Please contact the sender.',
    errorOrderAlreadySigned: 'This invoice has already been signed. No further action is required.',
    errorValidationFailed: 'Please check the information you entered and try again.',
    errorGenericSigning: 'An error occurred while processing your request. Please try again or contact support.',
    
    // Pagination
    previous: 'Previous',
    next: 'Next',
    
    // Form labels
    email: 'Email',
    phone: 'Phone',
    streetAddress: 'Street Address',
    cityTown: 'City/Town',
    province: 'Province',
    postalCode: 'Postal Code',
    country: 'Country',
    
    // Table headers (additional)
    name: 'Name',
    contact: 'Contact',
    role: 'Role',
    created: 'Created',
    
    // Default credentials
    defaultUsername: 'admin',
    defaultPassword: 'admin123',
    allGroups: 'All Groups',
  },
  af: {
    // Navigation - Afrikaans translations
    dashboard: 'Paneelbord',
    orders: 'Bestellings',
    clients: 'Kliënte',
    inventory: 'Voorraad',
    users: 'Gebruikers',
    logout: 'Teken uit',
    
    // Common actions
    create: 'Skep',
    edit: 'Wysig',
    delete: 'Skrap',
    save: 'Stoor',
    cancel: 'Kanselleer',
    close: 'Sluit',
    add: 'Voeg by',
    remove: 'Verwyder',
    search: 'Soek',
    filter: 'Filter',
    export: 'Uitvoer',
    import: 'Invoer',
    download: 'Aflaai',
    upload: 'Oplaai',
    yes: 'Ja',
    no: 'Nee',
    confirm: 'Bevestig',
    loading: 'Laai...',
    disable: 'Deaktiveer',
    enable: 'Aktiveer',
    
    // Authentication
    login: 'Teken in',
    username: 'Gebruikersnaam',
    password: 'Wagwoord',
    loginButton: 'Teken in',
    logoutConfirm: 'Is jy seker jy wil uitteken?',
    invalidCredentials: 'Ongeldige geloofsbriewe',
    loginError: 'Aanmelding het misluk',
    
    // Dashboard
    welcomeBack: 'Welkom terug',
    totalOrders: 'Totale bestellings',
    inventoryItems: 'Voorraad items',
    pendingOrders: 'Hangende bestellings',
    createNewOrderDashboard: 'Skep nuwe bestelling',
    userManagementDashboard: 'Gebruiker bestuur',
    recentOrders: 'Onlangse bestellings',
    noRecentActivity: 'Geen onlangse aktiwiteit',
    
    // Orders
    orderManagement: 'Bestelling bestuur',
    createNewOrderOrders: 'Skep nuwe bestelling',
    editOrder: 'Wysig bestelling',
    signOrder: 'Teken bestelling',
    orderStatus: 'Status',
    customer: 'Kliënt',
    items: 'Items',
    totalOrdersTable: 'Totaal',
    date: 'Datum',
    status: 'Status',
    actions: 'Aksies',
    pdf: 'PDF',
    draft: 'Konsep',
    pending: 'Hangend',
    signed: 'Geteken',
    completed: 'Voltooi',
    
    // Clients
    clientManagement: 'Kliënt bestuur',
    addNewClient: 'Voeg nuwe kliënt by',
    editClient: 'Wysig kliënt',
    saveClient: 'Stoor kliënt',
    addClient: 'Voeg kliënt by',
    clientName: 'Kliënt Naam',
    contactInfo: 'Kontak Inligting',
    address: 'Adres',
    taxNumber: 'Belasting Nommer',
    clientStatus: 'Status',
    active: 'Aktief',
    inactive: 'Onaktief',
    
    // Inventory
    inventoryManagement: 'Voorraad bestuur',
    addNewItem: 'Voeg nuwe item by',
    editItem: 'Wysig item',
    updateItem: 'Opdateer item',
    addItem: 'Voeg item by',
    itemCode: 'Kode',
    description: 'Beskrywing',
    group: 'Groep',
    unit: 'Eenheid',
    price: 'Prys',
    quantityInventory: 'Hoeveelheid',
    unitPriceInventory: 'Eenheid Prys',
    totalPrice: 'Totaal',
    importInventory: 'Voer voorraad in vanaf CSV',
    downloadTemplate: 'Aflaai sjabloon CSV',
    exportCSV: 'Uitvoer CSV',
    importCSV: 'Invoer CSV',
    itemsPerPage: 'Items per bladsy',
    alternatingRowColors: 'Afwisselende ry kleure',
    
    // Users
    userManagementUsers: 'Gebruiker bestuur',
    createUser: 'Skep gebruiker',
    editUser: 'Wysig gebruiker',
    resetPassword: 'Herstel wagwoord',
    userRole: 'Rol',
    admin: 'Admin',
    clerk: 'Klerk',
    user: 'Gebruiker',
    lastLogin: 'Laaste Aanmelding',
    createdUsers: 'Geskeep',
    allRoles: 'Alle Rolle',
    
    // Forms
    required: 'Vereis',
    optional: 'Opsioneel',
    selectOption: 'Kies \'n opsie',
    enterValue: 'Voer waarde in',
    formError: 'Vorm fout',
    validationError: 'Validasie fout',
    
    // Modals
    confirmDelete: 'Bevestig skrap',
    deleteWarning: 'Is jy seker jy wil hierdie item skrap?',
    thisActionCannotBeUndone: 'Hierdie aksie kan nie ongedaan gemaak word nie.',
    yesDelete: 'Ja, skrap',
    noCancel: 'Nee',
    
    // Order Form
    orderForm: 'Bestelling Vorm',
    selectClient: 'Kies Kliënt',
    clientDetails: 'Kliënt Besonderhede',
    itemSelection: 'Item Keuse',
    quantityOrderForm: 'Hoeveelheid',
    unitPriceOrderForm: 'Eenheid Prys',
    totalOrderForm: 'Totaal',
    subtotal: 'Subtotaal',
    tax: 'Belasting',
    grandTotal: 'Groot Totaal',
    notes: 'Notas',
    saveOrder: 'Stoor Bestelling',
    updateOrder: 'Opdateer Bestelling',
    
    // System
    orderManagementSystem: 'Bestelling bestuur stelsel',
    switchToLightMode: 'Skakel na ligte modus',
    switchToDarkMode: 'Skakel na donker modus',
    switchToAfrikaans: 'Skakel na Afrikaans',
    switchToEnglish: 'Skakel na Engels',
    
    // Error messages
    errorOccurred: '\'n Fout het voorgekom',
    tryAgain: 'Probeer weer',
    networkError: 'Netwerk fout',
    serverError: 'Bediener fout',
    notFound: 'Nie gevind nie',
    unauthorized: 'Nie gemagtig nie',
    forbidden: 'Verbode',
    
    // Success messages
    orderSignedSuccessfully: 'Bestelling suksesvol geteken!',
    orderDeletedSuccessfully: 'Bestelling suksesvol geskrap!',
    
    // Error messages
    errorLoadingOrders: 'Fout met laai van bestellings',
    
    // User specific
    userCreatedSuccessfully: 'Gebruiker suksesvol geskep!',
    userUpdatedSuccessfully: 'Gebruiker suksesvol opdateer!',
    userDeletedSuccessfully: 'Gebruiker suksesvol geskrap!',
    passwordResetSuccessfully: 'Wagwoord suksesvol herstel!',
    failedToCreateUser: 'Kon nie gebruiker skep nie',
    failedToUpdateUser: 'Kon nie gebruiker opdateer nie',
    failedToDeleteUser: 'Kon nie gebruiker skrap nie',
    failedToResetPassword: 'Kon nie wagwoord herstel nie',
    never: 'Nooit',
    
    // Dashboard specific
    welcomeBackDashboard: 'Welkom terug',
    userDashboard: 'Gebruiker',
    adminWelcomeMessage: 'Bestuur jou faktuur stelsel en hou toesig oor alle bedrywighede',
    clerkWelcomeMessage: 'Skep en bestuur bestellings vir jou kliënte',
    someDataCouldNotBeLoaded: 'Sommige data kon nie gelaai word nie. Ververs die bladsy of kontak ondersteuning.',
    createNewOrderDescription: 'Begin \'n nuwe faktuur bestelling vir \'n kliënt',
    userManagementDescription: 'Bestuur stelsel gebruikers en toestemmings',
    createYourFirstOrder: 'Skep jou eerste bestelling',
    
    // Order specific
    allStatuses: 'Alle Statusse',
    invoiceNumber: 'Faktuur #',
    item: 'item',
    order: 'Bestelling',
    signing: 'Teken...',
    signedByCustomerName: 'Geteken Deur (Kliënt Naam):',
    enterCustomerNamePlaceholder: 'Voer kliënt naam in',
    deleteOrderWarning: 'Is jy seker jy wil die bestelling skrap',
    
    // Placeholders and additional text
    searchUsersPlaceholder: 'Soek gebruikers...',
    searchClientsPlaceholder: 'Soek kliënte...',
    searchItemsPlaceholder: 'Soek items...',
    searchOrdersPlaceholder: 'Soek bestellings...',
    searchClientsByNamePlaceholder: 'Soek kliënte volgens naam, e-pos, of telefoon...',
    phonePlaceholder: 'bv., +27 12 345 6789',
    vatNumberPlaceholder: 'BTW Nommer',
    streetAddressPlaceholder: 'bv., 123 Hoofstraat',
    cityPlaceholder: 'bv., Johannesburg of Bloemfontein',
    provincePlaceholder: 'bv., Gauteng',
    postalCodePlaceholder: 'bv., 2196',
    countryPlaceholder: 'Suid-Afrika',
    additionalNotesPlaceholder: 'Addisionele notas oor die kliënt...',
    additionalOrderNotesPlaceholder: 'Addisionele notas vir hierdie bestelling...',
    leaveEmptyForceResetPlaceholder: 'Los leeg om gebruiker te dwing om te herstel',
    loadingItemsPlaceholder: 'Laai items...',
    quantityPlaceholder: '1',
    pricePlaceholder: '0.00',
    
    // Error messages
    errorLoadingUsers: 'Fout met laai van gebruikers',
    errorLoadingClients: 'Fout met laai van kliënte',
    
    // Signing page
    signInvoice: 'Teken Faktuur',
    signInvoiceSubtitle: 'Gaan asseblief die faktuur hieronder deur en verskaf jou handtekening',
    invoiceSignedSuccessfully: 'Faktuur Suksesvol Geteken!',
    invoiceSignedRedirect: 'Dankie dat jy faktuur {invoiceNumber} geteken het. Jy sal binnekort herlei word...',
    pleaseEnterYourName: 'Voer asseblief jou naam in',
    mustAcknowledgeTerms: 'Jy moet erken dat jy met die bepalings saamstem',
    invalidSigningLink: 'Ongeldige teken skakel',
    failedToLoadInvoice: 'Kon nie faktuur laai nie. Die skakel is dalk ongeldig of het verval.',
    failedToSignInvoice: 'Kon nie faktuur teken nie. Probeer asseblief weer.',
    goToHome: 'Gaan na Tuis',
    reviewAndSignInvoice: 'Gaan Deur & Teken Faktuur',
    billTo: 'Rekening Aan',
    fullName: 'Volle Naam',
    enterFullName: 'Voer jou volle naam in',
    acknowledgeTerms: 'Ek erken dat ek hierdie faktuur deurgegaan het en saamstem met die bepalings en voorwaardes. Deur te teken, bevestig ek dat die inligting akkuraat is en ek stem saam om die bedrag te betaal.',
    signAcceptInvoice: 'Teken & Aanvaar Faktuur',
    clickHereToReceiveInvoiceCopy: 'Klik hier om \'n afskrif van die faktuur in jou inkassie te ontvang',
    invoicePDFSentToEmail: 'Faktuur PDF is na jou e-pos gestuur!',
    view: 'Bekyk',
    invoiceDetails: 'Faktuur Besonderhede',
    sending: 'Stuur...',
    
    // Signing error codes
    errorTokenNotFound: 'Hierdie teken skakel is ongeldig of het verval. Kontak asseblief die sender om \'n nuwe skakel te versoek.',
    errorTokenInvalid: 'Hierdie teken skakel is ongeldig of het verval. Kontak asseblief die sender om \'n nuwe skakel te versoek.',
    errorTokenExpired: 'Hierdie teken skakel het verval. Kontak asseblief die sender om \'n nuwe skakel te versoek.',
    errorTokenAlreadyUsed: 'Hierdie teken skakel is reeds gebruik. As jy hierdie faktuur weer moet teken, kontak asseblief die sender om \'n nuwe skakel te versoek.',
    errorOrderNotFound: 'Hierdie faktuur kon nie gevind word nie. Kontak asseblief die sender.',
    errorOrderAlreadySigned: 'Hierdie faktuur is reeds geteken. Geen verdere aksie word vereis nie.',
    errorValidationFailed: 'Gaan asseblief die inligting wat jy ingevoer het na en probeer weer.',
    errorGenericSigning: '\'n Fout het voorgekom tydens die verwerking van jou versoek. Probeer asseblief weer of kontak ondersteuning.',
    
    // Pagination
    previous: 'Vorige',
    next: 'Volgende',
    
    // Form labels (additional)
    email: 'E-pos',
    phone: 'Telefoon',
    streetAddress: 'Straat Adres',
    cityTown: 'Stad/Dorp',
    province: 'Provinsie',
    postalCode: 'Poskode',
    country: 'Land',
    
    // Table headers (additional)
    name: 'Naam',
    contact: 'Kontak',
    role: 'Rol',
    created: 'Geskeep',
    
    // Default credentials
    defaultUsername: 'admin',
    defaultPassword: 'admin123',
    allGroups: 'Alle Groepe',
  }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'af'>(() => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'af' || savedLanguage === 'en') ? savedLanguage : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: keyof Translations): string => {
    const translation = translations[language][key];
    // If Afrikaans translation is empty or undefined, fallback to English
    if (language === 'af' && (!translation || translation.trim() === '')) {
      return translations.en[key];
    }
    return translation;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
