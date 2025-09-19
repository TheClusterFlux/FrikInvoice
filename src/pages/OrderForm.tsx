import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Card, 
  Button, 
  Input, 
  TextArea, 
  FormGroup,
  Label,
  ErrorMessage,
  Grid
} from '../styles/GlobalStyles';
import { orderService, CreateOrderData } from '../services/orderService';
import { inventoryService, InventoryItem } from '../services/inventoryService';
import { clientService, Client } from '../services/clientService';
import { calculateTotalQuantity, detectUnitCategory, convertToBaseUnit, convertToDisplayUnit, formatQuantity } from '../utils/unitConversion';
import { calculateTaxForItems, getTaxCalculationMethod } from '../utils/taxCalculation';
import logger from '../utils/logger';

const OrderFormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const OrderForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 16px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr auto;
  gap: 16px;
  align-items: end;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 16px;
`;

const RemoveButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
`;

const AddItemButton = styled(Button)`
  align-self: flex-start;
  background-color: #28a745;
  color: white;
`;

const SearchableSelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchableInput = styled(Input)`
  width: 100%;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.div`
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemCode = styled.div`
  font-weight: bold;
  color: #333;
  font-size: 14px;
`;

const ItemDescription = styled.div`
  color: #666;
  font-size: 12px;
  margin-top: 2px;
`;

const ItemGroup = styled.div`
  color: #999;
  font-size: 11px;
  margin-top: 2px;
`;

interface SearchableSelectProps {
  value: string;
  onChange: (inventoryId: string) => void;
  inventoryItems: InventoryItem[];
  disabled?: boolean;
  placeholder?: string;
}

// Configuration for auto-selection behavior
const AUTO_SELECT_DELAY_MS = 2000; // 2 seconds delay for auto-selection

// Client Selector Component
interface ClientSelectorProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients, onClientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients([]);
    }
  }, [searchTerm, clients]);

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <Label>Select Existing Client (Optional)</Label>
      <Input
        type="text"
        placeholder="Search clients by name, email, or phone..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      
      {isOpen && filteredClients.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {filteredClients.map((client) => (
            <div
              key={client._id}
              onClick={() => handleClientSelect(client)}
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: 'bold' }}>{client.name}</div>
              {client.email && <div style={{ fontSize: '14px', color: '#666' }}>{client.email}</div>}
              {client.phone && <div style={{ fontSize: '14px', color: '#666' }}>{client.phone}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  inventoryItems,
  disabled = false,
  placeholder = 'Type code or description...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [autoSelectTimeout, setAutoSelectTimeout] = useState<NodeJS.Timeout | null>(null);

  // Log component initialization
  useEffect(() => {
    logger.debug('SearchableSelect', 'Component initialized', {
      inventoryItemsCount: inventoryItems.length,
      value,
      disabled,
      placeholder
    });
  }, []);

  // Find selected item when value changes
  useEffect(() => {
    logger.debug('SearchableSelect', 'Value or inventoryItems changed', {
      value,
      inventoryItemsCount: inventoryItems.length,
      hasValue: !!value
    });

    if (value) {
      const item = inventoryItems.find(item => item._id === value);
      logger.debug('SearchableSelect', 'Looking for item with value', {
        value,
        foundItem: item ? {
          id: item._id,
          code: item.code,
          description: item.description,
          isActive: item.isActive
        } : null
      });
      
      if (item) {
        setSelectedItem(item);
        setSearchTerm(`${item.code} - ${item.description}`);
        logger.info('SearchableSelect', 'Item selected', {
          id: item._id,
          code: item.code,
          description: item.description
        });
      } else {
        logger.warn('SearchableSelect', 'Value provided but item not found in inventory', {
          value,
          availableIds: inventoryItems.map(item => item._id)
        });
      }
    } else {
      setSelectedItem(null);
      setSearchTerm('');
      logger.debug('SearchableSelect', 'Value cleared');
    }
  }, [value, inventoryItems]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSelectTimeout) {
        clearTimeout(autoSelectTimeout);
      }
    };
  }, [autoSelectTimeout]);

  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.group.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    logger.debug('SearchableSelect', 'Input changed', {
      newSearchTerm,
      currentSelectedItem: selectedItem ? {
        id: selectedItem._id,
        code: selectedItem.code
      } : null
    });
    
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    
    // Clear any existing timeout
    if (autoSelectTimeout) {
      clearTimeout(autoSelectTimeout);
    }
    
    // Clear selection if no exact match
    if (selectedItem && !newSearchTerm.includes(selectedItem.code)) {
      logger.debug('SearchableSelect', 'Clearing selection - no exact match', {
        selectedItemCode: selectedItem.code,
        newSearchTerm
      });
      setSelectedItem(null);
      onChange('');
    }
    
    // Set up debounced auto-selection for exact code matches
    if (newSearchTerm.length > 0) {
      const timeout = setTimeout(() => {
        const exactMatch = inventoryItems.find(item => 
          item.code.toLowerCase() === newSearchTerm.toLowerCase()
        );
        logger.debug('SearchableSelect', 'Auto-selection timeout triggered', {
          searchTerm: newSearchTerm,
          exactMatch: exactMatch ? {
            id: exactMatch._id,
            code: exactMatch.code,
            description: exactMatch.description
          } : null
        });
        
        if (exactMatch) {
          setSelectedItem(exactMatch);
          onChange(exactMatch._id);
          setIsOpen(false);
          logger.info('SearchableSelect', 'Auto-selected item', {
            id: exactMatch._id,
            code: exactMatch.code,
            description: exactMatch.description
          });
        }
      }, AUTO_SELECT_DELAY_MS);
      
      setAutoSelectTimeout(timeout);
    }
  };

  const handleItemSelect = (item: InventoryItem) => {
    logger.info('SearchableSelect', 'handleItemSelect called', {
      item: {
        id: item._id,
        code: item.code,
        description: item.description,
        isActive: item.isActive
      }
    });
    
    setSelectedItem(item);
    setSearchTerm(`${item.code} - ${item.description}`);
    
    logger.debug('SearchableSelect', 'About to call onChange', {
      itemId: item._id,
      currentValue: value
    });
    
    onChange(item._id);
    setIsOpen(false);
    
    logger.debug('SearchableSelect', 'onChange called, closing dropdown');
  };

  const handleInputFocus = () => {
    logger.debug('SearchableSelect', 'Input focused, opening dropdown');
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    logger.debug('SearchableSelect', 'Input blurred, scheduling dropdown close');
    // Delay closing to allow click on dropdown item
    setTimeout(() => {
      logger.debug('SearchableSelect', 'Closing dropdown after blur timeout');
      setIsOpen(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Clear timeout and immediately check for exact match
      if (autoSelectTimeout) {
        clearTimeout(autoSelectTimeout);
        setAutoSelectTimeout(null);
      }
      
      const exactMatch = inventoryItems.find(item => 
        item.code.toLowerCase() === searchTerm.toLowerCase()
      );
      if (exactMatch) {
        setSelectedItem(exactMatch);
        onChange(exactMatch._id);
        setIsOpen(false);
      }
    }
  };

  return (
    <SearchableSelectContainer>
      <SearchableInput
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isOpen && filteredItems.length > 0 && (
        <DropdownList>
          {(() => {
            logger.debug('SearchableSelect', 'Rendering dropdown', {
              isOpen,
              filteredItemsCount: filteredItems.length,
              showingItems: Math.min(filteredItems.length, 10)
            });
            return null;
          })()}
          {filteredItems.slice(0, 10).map((item) => (
            <DropdownItem
              key={item._id}
              onClick={(e) => {
                logger.debug('SearchableSelect', 'Dropdown item clicked', {
                  itemId: item._id,
                  itemCode: item.code,
                  event: e.type
                });
                handleItemSelect(item);
              }}
            >
              <ItemCode>{item.code}</ItemCode>
              <ItemDescription>{item.description}</ItemDescription>
              <ItemGroup>{item.group}</ItemGroup>
            </DropdownItem>
          ))}
          {filteredItems.length > 10 && (
            <DropdownItem style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
              ... and {filteredItems.length - 10} more items
            </DropdownItem>
          )}
        </DropdownList>
      )}
    </SearchableSelectContainer>
  );
};

const OrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<CreateOrderData>({
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    items: [],
    taxRate: 15,
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch inventory for item selection - get all items
  const { data: inventoryData, error: inventoryError, isLoading: inventoryLoading } = useQuery(
    'inventory-unlimited',
    () => inventoryService.getInventory(),
    {
      onSuccess: (data) => {
        logger.info('OrderForm', 'Inventory data loaded successfully', {
          itemCount: data?.data?.length || 0,
          firstFewItems: data?.data?.slice(0, 3).map(item => ({
            id: item._id,
            code: item.code,
            description: item.description,
            isActive: item.isActive
          }))
        });
      },
      onError: (error: any) => {
        logger.error('OrderForm', 'Failed to load inventory data', {
          error: error.message,
          stack: error.stack
        });
      }
    }
  );

  // Fetch clients for autopopulation
  const { data: clientsData } = useQuery(
    'clients-unlimited',
    () => clientService.getClients()
  );

  // Fetch existing order if editing
  const { data: existingOrder } = useQuery(
    ['order', id],
    () => orderService.getOrder(id!),
    { enabled: isEditing }
  );

  const createMutation = useMutation(orderService.createOrder, {
    onSuccess: (data) => {
      logger.info('OrderForm', 'Create mutation succeeded', {
        responseData: data
      });
      queryClient.invalidateQueries('orders');
      navigate('/orders');
    },
    onError: (error: any) => {
      logger.error('OrderForm', 'Create mutation failed', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        stack: error.stack
      });
      
      const errorData = error.response?.data?.error;
      if (errorData?.code === 'VALIDATION_ERROR' && errorData?.details) {
        logger.warn('OrderForm', 'Backend validation errors', {
          code: errorData.code,
          details: errorData.details
        });
        // Format validation errors in a user-friendly way
        const formattedErrors = errorData.details.map((detail: string) => {
          // Convert backend field names to user-friendly names
          if (detail.includes('total')) return 'Total amount is required';
          if (detail.includes('subtotal')) return 'Subtotal is required';
          if (detail.includes('customerInfo.name')) return 'Customer name is required';
          if (detail.includes('items')) return 'At least one item is required';
          return detail;
        });
        setFormError(formattedErrors.join('. '));
      } else {
        logger.warn('OrderForm', 'Non-validation error', {
          errorData
        });
        setFormError(errorData?.message || 'Failed to create order');
      }
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateOrderData> }) =>
      orderService.updateOrder(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        navigate('/orders');
      },
      onError: (error: any) => {
        const errorData = error.response?.data?.error;
        if (errorData?.code === 'VALIDATION_ERROR' && errorData?.details) {
          // Format validation errors in a user-friendly way
          const formattedErrors = errorData.details.map((detail: string) => {
            // Convert backend field names to user-friendly names
            if (detail.includes('total')) return 'Total amount is required';
            if (detail.includes('subtotal')) return 'Subtotal is required';
            if (detail.includes('customerInfo.name')) return 'Customer name is required';
            if (detail.includes('items')) return 'At least one item is required';
            return detail;
          });
          setFormError(formattedErrors.join('. '));
        } else {
          setFormError(errorData?.message || 'Failed to update order');
        }
      },
    }
  );

  // Load existing order data when editing
  useEffect(() => {
    if (existingOrder) {
      setFormData({
        customerInfo: existingOrder.customerInfo,
        items: existingOrder.items.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
        taxRate: existingOrder.taxRate,
        notes: existingOrder.notes || '',
      });
    }
  }, [existingOrder]);

  // Client autopopulation function
  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      customerInfo: {
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: {
          street: client.address?.street || '',
          city: client.address?.city || '',
          state: client.address?.state || '',
          zipCode: client.address?.zipCode || '',
          country: client.address?.country || '',
        },
      },
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { inventoryId: '', quantity: 1, unitPrice: 0, unit: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: keyof (typeof formData.items)[0], value: any) => {
    logger.debug('OrderForm', 'Updating item field', {
      index,
      field,
      value,
      currentValue: formData.items[index]?.[field],
      itemId: formData.items[index]?.inventoryId,
      fullCurrentItem: formData.items[index]
    });
    
    const newItems = [...formData.items];
    const currentItem = newItems[index];
    logger.debug('OrderForm', 'Before update', {
      index,
      field,
      currentItem,
      newValue: value
    });
    
    newItems[index] = { ...currentItem, [field]: value };
    
    logger.debug('OrderForm', 'After update', {
      index,
      field,
      updatedItem: newItems[index]
    });
    
    setFormData({ ...formData, items: newItems });
    
    logger.debug('OrderForm', 'Item field updated', {
      index,
      field,
      newValue: value,
      updatedItem: newItems[index]
    });
  };

  const calculateSubtotal = () => {
    const taxMethod = getTaxCalculationMethod();
    const items = formData.items.map(item => ({
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity,
      taxRate: formData.taxRate || 0
    }));
    
    const calculation = calculateTaxForItems(items, taxMethod);
    return calculation.subtotal;
  };

  const calculateTax = () => {
    const taxMethod = getTaxCalculationMethod();
    const items = formData.items.map(item => ({
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity,
      taxRate: formData.taxRate || 0
    }));
    
    const calculation = calculateTaxForItems(items, taxMethod);
    return calculation.taxAmount;
  };

  const calculateTotal = () => {
    const taxMethod = getTaxCalculationMethod();
    const items = formData.items.map(item => ({
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity,
      taxRate: formData.taxRate || 0
    }));
    
    const calculation = calculateTaxForItems(items, taxMethod);
    return calculation.total;
  };

  // Real-time validation functions
  const validateCustomerName = (name: string | undefined) => {
    if (!name || !name.trim()) return 'Customer name is required';
    if (name.length > 200) return 'Customer name must be less than 200 characters';
    return '';
  };

  const validateEmail = (email: string | undefined) => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePhone = (phone: string | undefined) => {
    if (phone && phone.length > 20) return 'Phone must be less than 20 characters';
    return '';
  };

  const validateTaxRate = (rate: number | undefined) => {
    if (rate !== undefined && (rate < 0 || rate > 100)) return 'Tax rate must be between 0 and 100';
    return '';
  };

  const validateNotes = (notes: string | undefined) => {
    if (notes && notes.length > 1000) return 'Notes must be less than 1000 characters';
    return '';
  };

  const validateItem = (item: any, index: number) => {
    const errors: string[] = [];
    if (!item.inventoryId) errors.push(`Item ${index + 1}: Please select an inventory item`);
    if (!item.quantity || item.quantity < 1) errors.push(`Item ${index + 1}: Quantity must be at least 1`);
    if (!item.unitPrice || item.unitPrice <= 0) errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
    return errors;
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Customer Info Validation
    const nameError = validateCustomerName(formData.customerInfo.name);
    if (nameError) errors.push(nameError);

    const emailError = validateEmail(formData.customerInfo.email);
    if (emailError) errors.push(emailError);

    const phoneError = validatePhone(formData.customerInfo.phone);
    if (phoneError) errors.push(phoneError);

    // Items Validation
    if (formData.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      formData.items.forEach((item, index) => {
        errors.push(...validateItem(item, index));
      });
    }

    // Tax Rate Validation
    const taxError = validateTaxRate(formData.taxRate);
    if (taxError) errors.push(taxError);

    // Notes Validation
    const notesError = validateNotes(formData.notes);
    if (notesError) errors.push(notesError);

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('OrderForm', 'Form submission started', {
      formData: {
        customerName: formData.customerInfo.name,
        itemCount: formData.items.length,
        items: formData.items.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit
        }))
      }
    });
    
    setFormError('');
    setLoading(true);

    try {
      // Comprehensive client-side validation
      const validationErrors = validateForm();
      logger.debug('OrderForm', 'Client-side validation completed', {
        errorCount: validationErrors.length,
        errors: validationErrors
      });
      
      if (validationErrors.length > 0) {
        logger.warn('OrderForm', 'Client-side validation failed', {
          errors: validationErrors
        });
        setFormError(validationErrors.join('. '));
        setLoading(false);
        return;
      }

      // Add calculation breakdown to each item before submitting
      logger.debug('OrderForm', 'Processing items for calculation breakdown', {
        itemCount: formData.items.length,
        inventoryDataAvailable: !!inventoryData?.data,
        inventoryItemCount: inventoryData?.data?.length || 0
      });

      const itemsWithCalculations = formData.items.map((item, index) => {
        logger.debug('OrderForm', `Processing item ${index + 1}`, {
          itemId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit
        });

        const inventoryItem = inventoryData?.data.find(inv => inv._id === item.inventoryId);
        logger.debug('OrderForm', `Found inventory item for item ${index + 1}`, {
          found: !!inventoryItem,
          inventoryItem: inventoryItem ? {
            id: inventoryItem._id,
            code: inventoryItem.code,
            description: inventoryItem.description,
            unit: inventoryItem.unit
          } : null
        });

        if (!inventoryItem) {
          logger.warn('OrderForm', `Inventory item not found for item ${index + 1}`, {
            itemId: item.inventoryId,
            availableIds: inventoryData?.data?.map(inv => inv._id) || []
          });
          return item;
        }
        
        const category = detectUnitCategory(item.unit);
        const baseUnitPerItem = convertToBaseUnit(1, item.unit);
        const totalBaseQuantity = baseUnitPerItem * item.quantity;
        
        const { value: displayValue, unit: displayUnit } = convertToDisplayUnit(baseUnitPerItem, category);
        const { value: totalDisplayValue, unit: totalDisplayUnit } = convertToDisplayUnit(totalBaseQuantity, category);
        
        const calculationBreakdown = `${formatQuantity(displayValue, category)} ${displayUnit} × ${item.quantity} = ${formatQuantity(totalDisplayValue, category)} ${totalDisplayUnit}`;
        
        logger.debug('OrderForm', `Calculation breakdown for item ${index + 1}`, {
          category,
          baseUnitPerItem,
          totalBaseQuantity,
          displayValue,
          displayUnit,
          totalDisplayValue,
          totalDisplayUnit,
          calculationBreakdown
        });
        
        return {
          ...item,
          calculationBreakdown
        };
      });

      logger.info('OrderForm', 'Items processed for submission', {
        processedItemCount: itemsWithCalculations.length,
        items: itemsWithCalculations.map((item, index) => ({
          index: index + 1,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          calculationBreakdown: item.calculationBreakdown
        }))
      });

      const orderData = {
        ...formData,
        items: itemsWithCalculations
      };

      logger.info('OrderForm', 'Prepared order data for submission', {
        isEditing,
        orderId: isEditing ? id : 'new',
        orderData: {
          customerInfo: orderData.customerInfo,
          itemCount: orderData.items.length,
          taxRate: orderData.taxRate,
          notes: orderData.notes,
          items: orderData.items.map((item, index) => ({
            index: index + 1,
            inventoryId: item.inventoryId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            calculationBreakdown: item.calculationBreakdown
          }))
        }
      });

      logger.info('OrderForm', 'Calling API to submit order', {
        isEditing,
        orderId: isEditing ? id : 'new'
      });

      if (isEditing) {
        logger.debug('OrderForm', 'Calling updateMutation.mutateAsync', {
          id: id!,
          dataKeys: Object.keys(orderData)
        });
        await updateMutation.mutateAsync({ id: id!, data: orderData });
        logger.info('OrderForm', 'Order updated successfully');
      } else {
        logger.debug('OrderForm', 'Calling createMutation.mutateAsync', {
          dataKeys: Object.keys(orderData)
        });
        await createMutation.mutateAsync(orderData);
        logger.info('OrderForm', 'Order created successfully');
      }
    } catch (error: any) {
      logger.error('OrderForm', 'Error during order submission', {
        error: error.message,
        stack: error.stack,
        isEditing,
        orderId: isEditing ? id : 'new'
      });
      // Error handled by mutation
    } finally {
      logger.debug('OrderForm', 'Form submission completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <OrderFormContainer>
      <h1>{isEditing ? 'Edit Order' : 'Create New Order'}</h1>
      
      <OrderForm onSubmit={handleSubmit}>
        <Card>
          <SectionTitle>Customer Information</SectionTitle>
          
          {/* Client Selector */}
          {clientsData?.data && (
            <ClientSelector 
              clients={clientsData.data} 
              onClientSelect={handleClientSelect}
            />
          )}
          
          <Grid columns={2}>
            <FormGroup>
              <Label>Customer Name *</Label>
              <Input
                type="text"
                value={formData.customerInfo.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: { ...formData.customerInfo, name: e.target.value },
                  })
                }
                required
              />
              {validateCustomerName(formData.customerInfo.name) && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {validateCustomerName(formData.customerInfo.name)}
                </div>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: { ...formData.customerInfo, email: e.target.value },
                  })
                }
              />
              {validateEmail(formData.customerInfo.email) && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {validateEmail(formData.customerInfo.email)}
                </div>
              )}
            </FormGroup>
            <FormGroup>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: { ...formData.customerInfo, phone: e.target.value },
                  })
                }
              />
              {validatePhone(formData.customerInfo.phone) && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {validatePhone(formData.customerInfo.phone)}
                </div>
              )}
            </FormGroup>
          </Grid>
          
          <SectionTitle>Address</SectionTitle>
          <Grid columns={2}>
            <FormGroup>
              <Label>Street</Label>
              <Input
                type="text"
                value={formData.customerInfo.address?.street || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: {
                      ...formData.customerInfo,
                      address: { ...formData.customerInfo.address, street: e.target.value },
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>City</Label>
              <Input
                type="text"
                value={formData.customerInfo.address?.city || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: {
                      ...formData.customerInfo,
                      address: { ...formData.customerInfo.address, city: e.target.value },
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>State</Label>
              <Input
                type="text"
                value={formData.customerInfo.address?.state || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: {
                      ...formData.customerInfo,
                      address: { ...formData.customerInfo.address, state: e.target.value },
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>ZIP Code</Label>
              <Input
                type="text"
                value={formData.customerInfo.address?.zipCode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customerInfo: {
                      ...formData.customerInfo,
                      address: { ...formData.customerInfo.address, zipCode: e.target.value },
                    },
                  })
                }
              />
            </FormGroup>
          </Grid>
        </Card>

        <Card>
          <SectionTitle>Order Items</SectionTitle>
          <ItemsContainer>
            {formData.items.map((item, index) => {
              return (
                <ItemRow key={index}>
                  <div>
                    <Label>Item</Label>
                    <SearchableSelect
                      value={item.inventoryId}
                      onChange={(inventoryId) => {
                        logger.debug('OrderForm', 'SearchableSelect onChange called', {
                          inventoryId,
                          index,
                          currentInventoryId: item.inventoryId
                        });
                        
                        // Find the selected item to get the unit
                        const selectedItem = inventoryData?.data.find(inv => inv._id === inventoryId);
                        logger.debug('OrderForm', 'Looking for selected item to set unit', {
                          inventoryId,
                          found: !!selectedItem,
                          selectedItem: selectedItem ? {
                            id: selectedItem._id,
                            code: selectedItem.code,
                            unit: selectedItem.unit
                          } : null
                        });
                        
                        // Update both inventoryId and unit in a single operation
                        const newItems = [...formData.items];
                        newItems[index] = { 
                          ...newItems[index], 
                          inventoryId: inventoryId,
                          unit: selectedItem?.unit || ''
                        };
                        setFormData({ ...formData, items: newItems });
                        
                        logger.debug('OrderForm', 'Combined update completed', {
                          index,
                          updatedItem: newItems[index]
                        });
                      }}
                      inventoryItems={inventoryData?.data || []}
                      disabled={inventoryLoading}
                      placeholder={inventoryLoading ? 'Loading items...' : 
                                   inventoryError ? 'Error loading items' : 
                                   'Type code or description...'}
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <div style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f8f9fa', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {item.unit || 'Select item first'}
                    </div>
                  </div>
                  <div>
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice || 0}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input
                      type="text"
                      value={`$${((item.unitPrice || 0) * item.quantity).toFixed(2)}`}
                      disabled
                    />
                  </div>
                  <RemoveButton type="button" onClick={() => removeItem(index)}>
                    Remove
                  </RemoveButton>
                </ItemRow>
              );
            })}
            <AddItemButton type="button" onClick={addItem}>
              Add Item
            </AddItemButton>
          </ItemsContainer>
        </Card>

        {/* Total Quantities Summary */}
        {formData.items.length > 0 && (
          <Card>
            <SectionTitle>Total Quantities</SectionTitle>
            {(() => {
              const itemsWithUnits = formData.items
                .filter(item => item.inventoryId && item.quantity)
                .map(item => {
                  const inventoryItem = inventoryData?.data.find(inv => inv._id === item.inventoryId);
                  return {
                    inventoryId: item.inventoryId,
                    quantity: item.quantity,
                    unit: item.unit || inventoryItem?.unit || 'units',
                    description: inventoryItem?.description || 'Unknown Item'
                  };
                });
              
              const totals = calculateTotalQuantity(itemsWithUnits);
              
              return Object.keys(totals).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {Object.values(totals).map((item) => (
                    <div key={item.inventoryId} style={{ 
                      padding: '16px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                        {item.description.split(' ').slice(0, 2).join(' ')}: {item.formattedTotal} {item.displayUnit}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic' }}>
                  Select items and quantities to see total calculations
                </div>
              );
            })()}
          </Card>
        )}

        <Card>
          <SectionTitle>Order Summary</SectionTitle>
          <Grid columns={2}>
            <FormGroup>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                }
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Tax is calculated as included in the price (reverse calculation)
              </div>
              {validateTaxRate(formData.taxRate) && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {validateTaxRate(formData.taxRate)}
                </div>
              )}
            </FormGroup>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </Grid>
          
          <FormGroup>
            <Label>Notes</Label>
            <TextArea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for this order..."
            />
            {validateNotes(formData.notes) && (
              <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                {validateNotes(formData.notes)}
              </div>
            )}
          </FormGroup>
        </Card>

        {formError && <ErrorMessage>{formError}</ErrorMessage>}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/orders')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || formData.items.length === 0}>
            {loading ? 'Saving...' : isEditing ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </OrderForm>
    </OrderFormContainer>
  );
};

export default OrderFormPage;
