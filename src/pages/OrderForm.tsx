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
import { formatCurrency } from '../utils/currency';
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
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
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
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-primary);
  margin-bottom: 16px;
`;

const RemoveButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
`;

const PriceInput = styled(Input)`
  text-align: right;
  font-family: 'Courier New', monospace;
  font-weight: bold;
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
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
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--bg-primary);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemCode = styled.div`
  font-weight: bold;
  color: var(--text-primary);
  font-size: 14px;
`;

const ItemDescription = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 2px;
`;

const ItemGroup = styled.div`
  color: var(--text-secondary);
  font-size: 11px;
  margin-top: 2px;
`;

const ClientDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--shadow-color);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;

const ClientDropdownItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  
  &:hover {
    background-color: var(--bg-primary);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ClientName = styled.div`
  font-weight: bold;
  color: var(--text-primary);
`;

const ClientDetail = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const TotalQuantitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
`;

const TotalQuantityCard = styled.div`
  padding: 16px;
  background-color: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const TotalQuantityTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const TotalQuantityPlaceholder = styled.div`
  color: var(--text-secondary);
  font-style: italic;
`;

const TaxDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const PriceInputDisabled = styled(PriceInput)`
  background-color: var(--bg-primary);
`;

// Modern Item Card Components
const ItemCard = styled.div<{ isExpanded: boolean }>`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;



const RemoveItemButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const ItemCardContent = styled.div<{ isExpanded: boolean }>`
  padding: ${({ isExpanded }) => isExpanded ? '24px' : '0'};
  max-height: ${({ isExpanded }) => isExpanded ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ isExpanded }) => isExpanded ? '1' : '0'};
  
  @media (max-width: 768px) {
    padding: ${({ isExpanded }) => isExpanded ? '20px' : '0'};
  }
`;

const ItemSelectionSection = styled.div`
  margin-bottom: 20px;
`;

const ItemSelectionLabel = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 14px;
`;

const SelectedItemInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const SelectedItemCode = styled.div`
  font-weight: 600;
  color: #007bff;
  font-size: 14px;
  margin-bottom: 4px;
`;

const SelectedItemDescription = styled.div`
  color: var(--text-primary);
  font-size: 14px;
  margin-bottom: 4px;
`;

const SelectedItemGroup = styled.div`
  color: var(--text-secondary);
  font-size: 12px;
`;

const ItemDetailsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 1300px) {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const ItemDetailGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ItemDetailLabel = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 14px;
`;

const ModernInput = styled(Input)`
  border-radius: 8px;
  border: 2px solid var(--border-color);
  padding: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const EditableInput = styled(Input)`
  border-radius: 8px;
  border: 2px solid var(--primary-color, #007bff);
  padding: 12px;
  font-size: 14px;
  background: var(--input-bg, var(--bg-secondary));
  color: var(--text-primary);
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--primary-dark, #0056b3);
    box-shadow: 0 0 0 3px var(--primary-shadow, rgba(0, 123, 255, 0.2));
    background: var(--input-bg-focus, var(--bg-secondary));
  }
  
  &:hover {
    border-color: var(--primary-dark, #0056b3);
  }
`;

const ItemUnitDisplay = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
`;

const PriceInputGroup = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const CurrencySymbol = styled.span`
  padding: 12px 8px 12px 12px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 14px;
`;

const ModernPriceInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  padding: 12px 12px 12px 0;
  font-size: 14px;
  color: var(--text-primary);
  text-align: right;
  font-weight: 600;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const TotalPriceDisplay = styled.div`
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  opacity: 0.8;
`;

const ReadOnlyPriceGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  opacity: 0.8;
`;

const ReadOnlyPriceInput = styled.div`
  flex: 1;
  padding: 12px 12px 12px 0;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: right;
  font-weight: 500;
  
  /* Hide number input arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Firefox */
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const AddItemCard = styled.button`
  width: 100%;
  padding: 24px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: #007bff;
    background: rgba(0, 123, 255, 0.05);
  }
`;

const AddItemIcon = styled.div`
  font-size: 24px;
  color: #007bff;
  font-weight: 300;
`;

const AddItemText = styled.div`
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
`;

const CancelItemButton = styled.button`
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc3545;
    color: white;
  }
`;

// Clean Customer Section Components
const CustomerCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
`;

const CustomerHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
`;

const CustomerTitle = styled.h3`
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
`;

const CustomerSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
`;

const CustomerContent = styled.div`
  padding: 24px;
`;

const ClientSearchSection = styled.div`
  margin-bottom: 24px;
`;

const SearchLabel = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 14px;
`;

const SearchHint = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }
  
  span {
    padding: 0 16px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
  }
`;

const SelectedClientBanner = styled.div`
  background: var(--success-bg, #e8f5e8);
  border: 1px solid var(--success-border, #4caf50);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectedClientInfo = styled.div`
  color: var(--success-text, #2e7d32);
  font-weight: 600;
`;

const ClearSelectionButton = styled.button`
  background: none;
  border: 1px solid var(--success-border, #4caf50);
  color: var(--success-border, #4caf50);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--success-border, #4caf50);
    color: var(--bg-secondary);
  }
`;

const CollapsedCustomerSummary = styled.div`
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color, #007bff);
  }
`;

const CustomerSummaryName = styled.div`
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const CustomerSummaryDetails = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const CustomerDetailsSection = styled.div<{ isCollapsed: boolean }>`
  max-height: ${({ isCollapsed }) => isCollapsed ? '0' : '2000px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  opacity: ${({ isCollapsed }) => isCollapsed ? '0' : '1'};
`;

const ExpandButton = styled.button`
  background: none;
  border: 1px solid var(--primary-color, #007bff);
  color: var(--primary-color, #007bff);
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  margin-top: 12px;
  
  &:hover {
    background: var(--primary-color, #007bff);
    color: var(--bg-secondary);
  }
`;

// Collapsed Item Summary Component
const CollapsedItemSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  color: var(--text-secondary);
  font-size: 14px;
  min-height: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
  }
`;

const CollapsedItemInfo = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 12px;
    width: 100%;
  }
`;

const CollapsedItemCode = styled.span`
  font-weight: 600;
  color: #007bff;
  font-size: 15px;
`;

const CollapsedItemActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const CollapsedItemTotal = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
`;

// Modern Searchable Select Styled Components
const ModernSearchableSelectContainer = styled.div`
  position: relative;
`;

const ModernSearchableInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
  
  &:disabled {
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const ModernDropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
`;

const ModernDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: var(--bg-primary);
  }
`;

const ModernItemCode = styled.div`
  font-weight: 600;
  color: #007bff;
  font-size: 14px;
  margin-bottom: 2px;
`;

const ModernItemDescription = styled.div`
  color: var(--text-primary);
  font-size: 13px;
  margin-bottom: 2px;
`;

const ModernItemGroup = styled.div`
  color: var(--text-secondary);
  font-size: 11px;
`;

interface SearchableSelectProps {
  value: string;
  onChange: (inventoryId: string) => void;
  inventoryItems: InventoryItem[];
  disabled?: boolean;
  placeholder?: string;
}

interface ModernSearchableSelectProps {
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
        <ClientDropdown>
          {filteredClients.map((client) => (
            <ClientDropdownItem
              key={client._id}
              onClick={() => handleClientSelect(client)}
            >
              <ClientName>{client.name}</ClientName>
              {client.email && <ClientDetail>{client.email}</ClientDetail>}
              {client.phone && <ClientDetail>{client.phone}</ClientDetail>}
            </ClientDropdownItem>
          ))}
        </ClientDropdown>
      )}
    </div>
  );
};

// Modern Searchable Select Component
const ModernSearchableSelect: React.FC<ModernSearchableSelectProps> = ({
  value,
  onChange,
  inventoryItems,
  disabled = false,
  placeholder = 'Search by code or description...'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Find selected item when value changes
  useEffect(() => {
    if (value) {
      const item = inventoryItems.find(item => item._id === value);
      if (item) {
        setSelectedItem(item);
        setSearchTerm(`${item.code} - ${item.description}`);
      }
    } else {
      setSelectedItem(null);
      setSearchTerm('');
    }
  }, [value, inventoryItems]);

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
    setSearchTerm(newSearchTerm);
    setIsOpen(true);
    
    // Clear selection if no exact match
    if (selectedItem && !newSearchTerm.includes(selectedItem.code)) {
      setSelectedItem(null);
      onChange('');
    }
  };

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setSearchTerm(`${item.code} - ${item.description}`);
    onChange(item._id);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
    <ModernSearchableSelectContainer>
      <ModernSearchableInput
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
        <ModernDropdownList>
          {filteredItems.slice(0, 8).map((item) => (
            <ModernDropdownItem
              key={item._id}
              onClick={() => handleItemSelect(item)}
            >
              <ModernItemCode>{item.code}</ModernItemCode>
              <ModernItemDescription>{item.description}</ModernItemDescription>
              <ModernItemGroup>{item.group}</ModernItemGroup>
            </ModernDropdownItem>
          ))}
          {filteredItems.length > 8 && (
            <ModernDropdownItem style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              ... and {filteredItems.length - 8} more items
            </ModernDropdownItem>
          )}
        </ModernDropdownList>
      )}
    </ModernSearchableSelectContainer>
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
    taxRate: 0,
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(0); // First item expanded by default
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isCustomerSectionCollapsed, setIsCustomerSectionCollapsed] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{[key: string]: boolean}>({});

  const queryClient = useQueryClient();

  // Fetch inventory for item selection - get only active items
  const { data: inventoryData, error: inventoryError, isLoading: inventoryLoading } = useQuery(
    'inventory-active',
    () => inventoryService.getInventory({ isActive: true }),
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
    setSelectedClientId(client._id);
    // Mark fields as touched since they now have valid data
    setTouchedFields(prev => ({
      ...prev,
      customerName: true,
      customerEmail: true,
      customerPhone: true
    }));
    // Auto-collapse after client selection to focus on items
    setIsCustomerSectionCollapsed(true);
  };

  // Function to clear client selection
  const handleClearClientSelection = () => {
    setSelectedClientId(null);
    setIsCustomerSectionCollapsed(false);
    // Reset touched fields when clearing
    setTouchedFields({});
    // Clear form data
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        name: '', email: '', phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' }
      }
    }));
  };

  // Function to mark field as touched
  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const addItem = () => {
    // Validate that the current item (if any) is not empty before adding a new one
    if (formData.items.length > 0) {
      const lastItem = formData.items[formData.items.length - 1];
      if (!lastItem.inventoryId || !lastItem.quantity || lastItem.quantity <= 0 || !lastItem.unitPrice || lastItem.unitPrice <= 0) {
        setFormError('Please complete the current item before adding a new one.');
        return;
      }
    }
    
    // Clear any existing form errors
    setFormError('');
    
    const newItemIndex = formData.items.length;
    setFormData({
      ...formData,
      items: [...formData.items, { inventoryId: '', quantity: 1, unitPrice: 0, unit: '' }],
    });
    // Expand the newly added item
    setExpandedItemIndex(newItemIndex);
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
    
    // Adjust expanded index if needed
    if (expandedItemIndex === index) {
      // If we removed the expanded item, expand the previous one or first one
      const newExpandedIndex = index > 0 ? index - 1 : (formData.items.length > 1 ? 0 : null);
      setExpandedItemIndex(newExpandedIndex);
    } else if (expandedItemIndex !== null && expandedItemIndex > index) {
      // If we removed an item before the expanded one, adjust the index
      setExpandedItemIndex(expandedItemIndex - 1);
    }
  };

  const cancelNewItem = (index: number) => {
    const item = formData.items[index];
    // Only allow canceling if the item is empty (new item mode)
    if (!item.inventoryId && (!item.quantity || item.quantity <= 1) && (!item.unitPrice || item.unitPrice <= 0)) {
      removeItem(index);
    }
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

  // Helper function to calculate individual item's total quantity with unit conversion
  const getItemTotalQuantity = (item: any, inventoryItem: any) => {
    if (!inventoryItem || !item.quantity) return null;
    
    const itemsWithUnits = [{
      inventoryId: item.inventoryId,
      quantity: item.quantity,
      unit: item.unit || inventoryItem.unit || 'units',
      description: inventoryItem.description || 'Unknown Item'
    }];
    
    const totals = calculateTotalQuantity(itemsWithUnits);
    const itemTotal = totals[item.inventoryId];
    
    if (itemTotal) {
      return `${item.quantity} X ${item.unit || inventoryItem.unit || 'units'} : ${itemTotal.formattedTotal} ${itemTotal.displayUnit}`;
    }
    
    return `${item.quantity} ${item.unit || inventoryItem.unit || 'units'}`;
  };

  // Real-time validation functions
  const validateCustomerName = (name: string | undefined) => {
    if (!name || !name.trim()) return 'Customer name is required';
    if (name.length > 200) return 'Customer name must be less than 200 characters';
    return null;
  };

  const validateEmail = (email: string | undefined) => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Invalid email format';
    return null;
  };

  const validatePhone = (phone: string | undefined) => {
    if (phone && phone.length > 20) return 'Phone must be less than 20 characters';
    return null;
  };

  const validateTaxRate = (rate: number | undefined) => {
    if (rate !== undefined && (rate < 0 || rate > 100)) return 'Tax rate must be between 0 and 100';
    return null;
  };

  const validateNotes = (notes: string | undefined) => {
    if (notes && notes.length > 1000) return 'Notes must be less than 1000 characters';
    return null;
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
      <h1>{isEditing ? 'Edit order' : 'Create new order'}</h1>
      
      <OrderForm onSubmit={handleSubmit}>
        <CustomerCard>
          <CustomerHeader>
            <CustomerTitle>Customer Information</CustomerTitle>
            <CustomerSubtitle>Search for an existing client or enter details manually</CustomerSubtitle>
          </CustomerHeader>
          
          {/* Show collapsed summary when collapsed */}
          {isCustomerSectionCollapsed && formData.customerInfo.name && (
            <CollapsedCustomerSummary onClick={() => setIsCustomerSectionCollapsed(false)}>
              <CustomerSummaryName>{formData.customerInfo.name}</CustomerSummaryName>
              <CustomerSummaryDetails>
                {formData.customerInfo.email && <span>{formData.customerInfo.email}</span>}
                {formData.customerInfo.phone && <span>{formData.customerInfo.phone}</span>}
                {formData.customerInfo.address?.city && <span>{formData.customerInfo.address.city}</span>}
              </CustomerSummaryDetails>
            </CollapsedCustomerSummary>
          )}
          
          <CustomerDetailsSection isCollapsed={isCustomerSectionCollapsed}>
            <CustomerContent>
              {/* Show selected client banner if client is selected */}
              {selectedClientId && (
                <SelectedClientBanner>
                  <SelectedClientInfo>
                    ✅ Client loaded from database: {formData.customerInfo.name}
                  </SelectedClientInfo>
                  <ClearSelectionButton onClick={handleClearClientSelection}>
                    Clear & Enter Manually
                  </ClearSelectionButton>
                </SelectedClientBanner>
              )}
              
              {/* Client Search Section - Only show if no client selected */}
              {!selectedClientId && clientsData?.data && (
                <ClientSearchSection>
                  <SearchLabel>Search Existing Clients</SearchLabel>
                  <SearchHint>Start typing to find an existing client, or skip to enter details manually</SearchHint>
                  <ClientSelector 
                    clients={clientsData.data} 
                    onClientSelect={handleClientSelect}
                  />
                  <OrDivider>
                    <span>OR</span>
                  </OrDivider>
                </ClientSearchSection>
              )}
              
              {/* Customer Details Form - Always visible */}
              <div>
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
                  onBlur={() => markFieldAsTouched('customerName')}
                  onFocus={() => markFieldAsTouched('customerName')}
                />
                {touchedFields.customerName && validateCustomerName(formData.customerInfo.name) && (
                  <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                    {validateCustomerName(formData.customerInfo.name)}
                  </div>
                )}
              </FormGroup>
              
              <Grid columns={2}>
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
                    onBlur={() => markFieldAsTouched('customerEmail')}
                    onFocus={() => markFieldAsTouched('customerEmail')}
                  />
                  {touchedFields.customerEmail && validateEmail(formData.customerInfo.email) && (
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
                    onBlur={() => markFieldAsTouched('customerPhone')}
                    onFocus={() => markFieldAsTouched('customerPhone')}
                  />
                  {touchedFields.customerPhone && validatePhone(formData.customerInfo.phone) && (
                    <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                      {validatePhone(formData.customerInfo.phone)}
                    </div>
                  )}
                </FormGroup>
              </Grid>
              
              <SectionTitle style={{ marginTop: '24px' }}>Address</SectionTitle>
              
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
              
              <Grid columns={3}>
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
                  <Label>Province</Label>
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
              </div>
            </CustomerContent>
          </CustomerDetailsSection>
        </CustomerCard>

        <Card>
          <SectionTitle>Order Items</SectionTitle>
          <ItemsContainer>
            {formData.items.map((item, index) => {
              const selectedInventoryItem = inventoryData?.data.find(inv => inv._id === item.inventoryId);
              const isExpanded = expandedItemIndex === index;
              
              return (
                <ItemCard 
                  key={index} 
                  isExpanded={isExpanded}
                  onClick={() => setExpandedItemIndex(isExpanded ? null : index)}
                >
                  {!isExpanded && selectedInventoryItem && (
                    <CollapsedItemSummary>
                      <CollapsedItemInfo>
                        <CollapsedItemCode>{selectedInventoryItem.code}</CollapsedItemCode>
                        <span>{selectedInventoryItem.description}</span>
                        <span>Qty: {getItemTotalQuantity(item, selectedInventoryItem) || `${item.quantity} ${item.unit || 'units'}`}</span>
                      </CollapsedItemInfo>
                      <CollapsedItemActions>
                        <CollapsedItemTotal>
                          {formatCurrency((item.unitPrice || 0) * item.quantity)}
                        </CollapsedItemTotal>
                        <RemoveItemButton 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(index);
                          }}
                        >
                          ✕
                        </RemoveItemButton>
                      </CollapsedItemActions>
                    </CollapsedItemSummary>
                  )}
                  
                  <ItemCardContent isExpanded={isExpanded} onClick={(e) => e.stopPropagation()}>
                    <ItemSelectionSection>
                      <ItemSelectionLabel>Select Item</ItemSelectionLabel>
                      <ModernSearchableSelect
                        value={item.inventoryId}
                        onChange={(inventoryId) => {
                          logger.debug('OrderForm', 'SearchableSelect onChange called', {
                            inventoryId,
                            index,
                            currentInventoryId: item.inventoryId
                          });
                          
                          // Find the selected item to get the unit and base price
                          const selectedItem = inventoryData?.data.find(inv => inv._id === inventoryId);
                          logger.debug('OrderForm', 'Looking for selected item to set unit and price', {
                            inventoryId,
                            found: !!selectedItem,
                            selectedItem: selectedItem ? {
                              id: selectedItem._id,
                              code: selectedItem.code,
                              unit: selectedItem.unit,
                              basePrice: selectedItem.basePrice
                            } : null
                          });
                          
                          // Calculate price with 30% markup
                          const basePrice = selectedItem?.basePrice || 0;
                          const markupPrice = basePrice * 1.30; // 30% markup
                          
                          // Update inventoryId, unit, and unitPrice in a single operation
                          const newItems = [...formData.items];
                          newItems[index] = { 
                            ...newItems[index], 
                            inventoryId: inventoryId,
                            unit: selectedItem?.unit || '',
                            unitPrice: markupPrice,
                            basePrice: basePrice,
                            markup: 30 // Default 30% markup
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
                                     'Search by code or description...'}
                      />
                      {selectedInventoryItem && (
                        <SelectedItemInfo>
                          <SelectedItemCode>{selectedInventoryItem.code}</SelectedItemCode>
                          <SelectedItemDescription>{selectedInventoryItem.description}</SelectedItemDescription>
                          <SelectedItemGroup>Group: {selectedInventoryItem.group}</SelectedItemGroup>
                        </SelectedItemInfo>
                      )}
                    </ItemSelectionSection>

                    <ItemDetailsSection>
                      <ItemDetailGroup>
                        <ItemDetailLabel>Quantity</ItemDetailLabel>
                        <EditableInput
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          required
                          placeholder="1"
                        />
                        <ItemUnitDisplay>{item.unit || 'units'}</ItemUnitDisplay>
                      </ItemDetailGroup>

                      <ItemDetailGroup>
                        <ItemDetailLabel>Markup (%)</ItemDetailLabel>
                        <EditableInput
                          type="number"
                          min="0"
                          step="1"
                          value={item.markup !== undefined ? item.markup : 30}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const newMarkup = inputValue === '' ? 0 : parseFloat(inputValue);
                            const basePrice = item.basePrice || 0;
                            const newUnitPrice = basePrice * (1 + newMarkup / 100);
                            
                            const newItems = [...formData.items];
                            newItems[index] = { 
                              ...newItems[index], 
                              markup: newMarkup,
                              unitPrice: newUnitPrice
                            };
                            setFormData({ ...formData, items: newItems });
                          }}
                          placeholder="30"
                        />
                        <ItemUnitDisplay>Base: {formatCurrency(item.basePrice || 0)}</ItemUnitDisplay>
                      </ItemDetailGroup>

                      <ItemDetailGroup>
                        <ItemDetailLabel>Unit Price (Read-only)</ItemDetailLabel>
                        <ReadOnlyPriceGroup>
                          <CurrencySymbol>R</CurrencySymbol>
                          <ReadOnlyPriceInput>
                            {(item.unitPrice || 0).toFixed(2)}
                          </ReadOnlyPriceInput>
                        </ReadOnlyPriceGroup>
                        <ItemUnitDisplay>Calculated from base price + markup</ItemUnitDisplay>
                      </ItemDetailGroup>

                      <ItemDetailGroup>
                        <ItemDetailLabel>Total</ItemDetailLabel>
                        <TotalPriceDisplay>
                          {formatCurrency((item.unitPrice || 0) * item.quantity)}
                        </TotalPriceDisplay>
                      </ItemDetailGroup>
                    </ItemDetailsSection>
                    
                    {/* Show cancel button for empty items (new item mode) */}
                    {!item.inventoryId && (!item.quantity || item.quantity <= 1) && (!item.unitPrice || item.unitPrice <= 0) && (
                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                        <CancelItemButton 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelNewItem(index);
                          }}
                        >
                          Cancel Item
                        </CancelItemButton>
                      </div>
                    )}
                  </ItemCardContent>
                </ItemCard>
              );
            })}
            <AddItemCard type="button" onClick={addItem}>
              <AddItemIcon>+</AddItemIcon>
              <AddItemText>Add new item</AddItemText>
            </AddItemCard>
          </ItemsContainer>
        </Card>


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
              <TaxDescription>
                Tax is calculated as included in the price (reverse calculation)
              </TaxDescription>
              {validateTaxRate(formData.taxRate) && (
                <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                  {validateTaxRate(formData.taxRate)}
                </div>
              )}
            </FormGroup>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Tax:</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
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
