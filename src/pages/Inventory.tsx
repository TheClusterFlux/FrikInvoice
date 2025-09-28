import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { 
  Card, 
  Button, 
  Table, 
  PageHeader, 
  PageTitle, 
  Input, 
  Select
} from '../styles/GlobalStyles';
import { inventoryService, InventoryItem, CreateInventoryData } from '../services/inventoryService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';

const InventoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 1300px) {
    padding-bottom: 80px; /* Space for floating button */
  }
`;

const FiltersContainer = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const FloatingActionButton = styled.button`
  display: none;
  
  @media (max-width: 1300px) {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 123, 255, 0.6);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
`;

const DesktopButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 1300px) {
    display: none;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InventoryTable = styled(Table)`
  margin-bottom: 20px;
  table-layout: fixed;
  width: 100%;
  
  @media (max-width: 1300px) {
    display: none; /* Hide table on small screens */
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 20px;
  
  @media (max-width: 1300px) {
    display: none; /* Hide table on small screens */
  }
`;

const MobileCardContainer = styled.div`
  display: none;
  
  @media (max-width: 1300px) {
    display: block;
    margin-bottom: 20px;
  }
`;

const MobileCard = styled(Card)`
  margin-bottom: 12px;
  padding: 16px;
  
  @media (max-width: 768px) {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MobileCardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
`;

const MobileCardCode = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
`;

const MobileCardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileCardLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 4px;
`;

const MobileCardValue = styled.span`
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 400;
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
`;

const CodeColumn = styled.td`
  width: 10%;
  word-break: break-word;
`;

const DescriptionColumn = styled.td`
  width: 40%;
  word-break: break-word;
`;

const GroupColumn = styled.td`
  width: 15%;
  word-break: break-word;
`;

const UnitColumn = styled.td`
  width: 10%;
  word-break: break-word;
`;

const PriceColumn = styled.td`
  width: 15%;
  text-align: right;
  font-family: monospace;
  font-weight: bold;
  word-break: break-word;
`;

const ActionsColumn = styled.td`
  width: 10%;
  text-align: right;
  padding-right: 16px;
`;

const CodeHeader = styled.th`
  width: 10%;
`;

const DescriptionHeader = styled.th`
  width: 40%;
`;

const GroupHeader = styled.th`
  width: 15%;
`;

const UnitHeader = styled.th`
  width: 10%;
`;

const PriceHeader = styled.th`
  width: 15%;
  text-align: right;
`;

const ActionsHeader = styled.th`
  width: 10%;
  text-align: right;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const FilterLabel = styled.label`
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
`;

const SortableHeader = styled.th<{ sortable?: boolean }>`
  cursor: ${({ sortable }) => sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  
  &:hover {
    background-color: ${({ sortable }) => sortable ? 'var(--bg-primary)' : 'inherit'};
  }
  
  &::after {
    content: '';
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    opacity: 0.5;
  }
  
  &.asc::after {
    border-bottom: 6px solid var(--text-secondary);
    opacity: 1;
  }
  
  &.desc::after {
    border-top: 6px solid var(--text-secondary);
    opacity: 1;
  }
`;

const TableRow = styled.tr<{ alternating?: boolean; index?: number }>`
  background-color: ${({ alternating, index }) => 
    alternating && index !== undefined && index % 2 === 1 
      ? 'var(--table-row-alt, rgba(0, 0, 0, 0.02))' 
      : 'transparent'
  };
  
  /* Dark mode alternating rows */
  @media (prefers-color-scheme: dark) {
    background-color: ${({ alternating, index }) => 
      alternating && index !== undefined && index % 2 === 1 
        ? 'var(--table-row-alt, rgba(255, 255, 255, 0.03))' 
        : 'transparent'
    };
  }
  
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--table-row-hover, rgba(0, 123, 255, 0.05));
  }
`;

const ValidationError = styled.div`
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #c53030;
`;

const SuccessMessage = styled.div`
  background-color: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #22543d;
`;

const ConfirmationModal = styled.div`
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
`;

const ConfirmationDialog = styled(Card)`
  max-width: 400px;
  margin: 0;
`;

const ConfirmationButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  align-items: center;
`;

const ImportModal = styled(Card)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  min-width: 500px;
`;

const ImportInstructions = styled.div`
  margin-bottom: 20px;
`;

const ImportInstructionsList = styled.ul`
  font-size: 14px;
  color: var(--text-secondary);
`;

const ImportFileInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
`;

const ImportFileInfo = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-secondary);
`;

const ImportResults = styled.div`
  margin-bottom: 20px;
  padding: 12px;
  background-color: var(--bg-primary);
  border-radius: 4px;
`;

const ImportErrorDetails = styled.div`
  margin-top: 10px;
`;

const ImportErrorList = styled.ul`
  font-size: 12px;
  max-height: 100px;
  overflow-y: auto;
`;

const ImportButtonContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<CreateInventoryData>({
    code: '',
    description: '',
    group: '',
    unit: '',
    basePrice: 0,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<{
    imported: number;
    updated: number;
    errors: number;
    details: Array<{
      row: number;
      code: string;
      action?: string;
      errors?: string[];
    }>;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<InventoryItem | null>(null);
  const [sortField, setSortField] = useState<string>('description'); // Default sort by description
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [alternatingRows] = useState(true);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Reduced default items per page

  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading, error } = useQuery(
    ['inventory', page, search, group, sortField, sortDirection, itemsPerPage],
    () => inventoryService.getInventory({ page, limit: itemsPerPage, search, group, sortField, sortDirection }),
    { keepPreviousData: true }
  );

  // Fetch available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Use the same search parameters as the main query to get consistent results
        const response = await inventoryService.getInventory({ 
          limit: 1000, 
          search, 
          sortField, 
          sortDirection 
        });
        
        // Get groups from the search results (backend already filtered by search term)
        const groups = Array.from(new Set(response.data.map(item => item.group)))
          .sort((a, b) => {
            // Sort numerically if both are numbers, otherwise alphabetically
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
            return a.localeCompare(b);
          });
        setAvailableGroups(groups);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };
    fetchGroups();
  }, [search, sortField, sortDirection]);

  // Clear group filter if it's no longer valid for current search
  useEffect(() => {
    if (group && !availableGroups.includes(group)) {
      setGroup('');
    }
  }, [availableGroups, group]);

  // Function to highlight search terms
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? <mark key={index} style={{ 
        backgroundColor: isDark ? '#ffd700' : '#ffeb3b', 
        color: isDark ? '#000000' : '#000000',
        padding: '2px 4px',
        borderRadius: '2px'
      }}>{part}</mark> : part
    );
  };

  const createMutation = useMutation(inventoryService.createInventory, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory');
      setShowForm(false);
      resetForm();
      setSuccessMessage('Item created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create item';
      setFormErrors([errorMessage]);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateInventoryData> }) =>
      inventoryService.updateInventory(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        setSuccessMessage('Item updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.error?.message || 'Failed to update item';
        setFormErrors([errorMessage]);
      },
    }
  );

  const deleteMutation = useMutation(inventoryService.deleteInventory, {
    onSuccess: () => {
      queryClient.invalidateQueries('inventory');
      setShowDeleteConfirm(null);
      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete item';
      setFormErrors([errorMessage]);
    },
  });

  const importMutation = useMutation(inventoryService.importCSV, {
    onSuccess: (data) => {
      setImportResults(data.data);
      queryClient.invalidateQueries('inventory');
      setFormErrors([]);
    },
    onError: (error: any) => {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to import CSV';
      setFormErrors([`Import failed: ${errorMessage}`]);
      setImportResults(null);
    },
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortClass = (field: string) => {
    if (sortField !== field) return '';
    return sortDirection;
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      group: '',
      unit: '',
      basePrice: 0,
    });
    setFormErrors([]);
  };

  const downloadTemplate = () => {
    const csvContent = 'Code,Description,Group,Unit\nABC001,Sample Product 1,Electronics,Each\nXYZ002,Sample Product 2,Clothing,Piece';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportCSV = async () => {
    try {
      const blob = await inventoryService.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inventory_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setFormErrors(['Please select a CSV file']);
        setImportFile(null);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(['File size must be less than 5MB']);
        setImportFile(null);
        return;
      }
      
      setImportFile(file);
      setFormErrors([]);
      setImportResults(null);
    }
  };

  const handleImport = () => {
    if (!importFile) {
      setFormErrors(['Please select a CSV file first']);
      return;
    }
    
    setFormErrors([]);
    setImportResults(null);
    importMutation.mutate(importFile);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      description: item.description,
      group: item.group,
      unit: item.unit,
      basePrice: item.basePrice || 0,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    // Validate form
    const errors: string[] = [];
    if (!formData.code.trim()) errors.push('Code is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.group.trim()) errors.push('Group is required');
    if (!formData.unit.trim()) errors.push('Unit is required');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading inventory</div>;

  return (
    <InventoryContainer>
      <PageHeader>
        <PageTitle>{t('inventoryManagement')}</PageTitle>
        <DesktopButtons>
          <Button onClick={exportCSV}>{t('exportCSV')}</Button>
          <Button onClick={() => setShowImportModal(true)}>{t('importCSV')}</Button>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowForm(true)}>{t('addNewItem')}</Button>
          )}
        </DesktopButtons>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>{t('search')}</FilterLabel>
          <Input
            type="text"
            placeholder={t('searchItemsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>{t('group')}</FilterLabel>
          <Select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">{t('allGroups')}</option>
            {availableGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>{t('itemsPerPage')}</FilterLabel>
          <Select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </FilterGroup>
      </FiltersContainer>

      {showForm && user?.role === 'admin' && (
        <Card>
          <h3>{editingItem ? t('editItem') : t('addNewItem')}</h3>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <label>{t('itemCode')} *</label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label>{t('description')} *</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>{t('group')} *</label>
                <Input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>{t('unit')} *</label>
                <Input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Base Price (R)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice || 0}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </FormGrid>
            {formErrors.length > 0 && (
              <ValidationError>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Please fix the following errors:</div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </ValidationError>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {editingItem ? t('updateItem') : t('addItem')}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <TableContainer>
        <InventoryTable>
        <thead>
          <tr>
            <CodeHeader>
              <SortableHeader sortable onClick={() => handleSort('code')} className={getSortClass('code')}>
                {t('itemCode')}
              </SortableHeader>
            </CodeHeader>
            <DescriptionHeader>
              <SortableHeader sortable onClick={() => handleSort('description')} className={getSortClass('description')}>
                {t('description')}
              </SortableHeader>
            </DescriptionHeader>
            <GroupHeader>
              <SortableHeader sortable onClick={() => handleSort('group')} className={getSortClass('group')}>
                {t('group')}
              </SortableHeader>
            </GroupHeader>
            <UnitHeader>
              <SortableHeader sortable onClick={() => handleSort('unit')} className={getSortClass('unit')}>
                {t('unit')}
              </SortableHeader>
            </UnitHeader>
            <PriceHeader>
              <SortableHeader sortable onClick={() => handleSort('basePrice')} className={getSortClass('basePrice')}>
                Base Price (R)
              </SortableHeader>
            </PriceHeader>
            {user?.role === 'admin' && <ActionsHeader>{t('actions')}</ActionsHeader>}
          </tr>
        </thead>
        <tbody>
          {inventoryData?.data.map((item, index) => (
            <TableRow key={item._id} alternating={alternatingRows} index={index}>
              <CodeColumn>
                <strong>{highlightSearchTerm(item.code, search)}</strong>
              </CodeColumn>
              <DescriptionColumn>
                {highlightSearchTerm(item.description, search)}
              </DescriptionColumn>
              <GroupColumn>{highlightSearchTerm(item.group, search)}</GroupColumn>
              <UnitColumn>{highlightSearchTerm(item.unit, search)}</UnitColumn>
              <PriceColumn>
                R {(item.basePrice || 0).toFixed(2)}
              </PriceColumn>
              {user?.role === 'admin' && (
                <ActionsColumn>
                  <ActionButtons>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEdit(item)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('edit')}
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteConfirm(item)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {t('delete')}
                    </Button>
                  </ActionButtons>
                </ActionsColumn>
              )}
            </TableRow>
          ))}
        </tbody>
        </InventoryTable>
      </TableContainer>

      {/* Mobile Card Layout */}
      <MobileCardContainer>
        {inventoryData?.data.map((item, index) => (
          <MobileCard key={item._id}>
            <MobileCardHeader>
              <MobileCardTitle>
                {highlightSearchTerm(item.description, search)}
              </MobileCardTitle>
              <MobileCardCode>
                {highlightSearchTerm(item.code, search)}
              </MobileCardCode>
            </MobileCardHeader>
            
            <MobileCardContent>
              <MobileCardField>
                <MobileCardLabel>{t('group')}</MobileCardLabel>
                <MobileCardValue>
                  {highlightSearchTerm(item.group, search)}
                </MobileCardValue>
              </MobileCardField>
              
              <MobileCardField>
                <MobileCardLabel>{t('unit')}</MobileCardLabel>
                <MobileCardValue>
                  {highlightSearchTerm(item.unit, search)}
                </MobileCardValue>
              </MobileCardField>
              
              <MobileCardField>
                <MobileCardLabel>Base Price</MobileCardLabel>
                <MobileCardValue style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  R {(item.basePrice || 0).toFixed(2)}
                </MobileCardValue>
              </MobileCardField>
            </MobileCardContent>
            
            {user?.role === 'admin' && (
              <MobileCardActions>
                <Button 
                  variant="secondary" 
                  onClick={() => handleEdit(item)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('edit')}
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => setShowDeleteConfirm(item)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {t('delete')}
                </Button>
              </MobileCardActions>
            )}
          </MobileCard>
        ))}
      </MobileCardContainer>

      {inventoryData?.meta && inventoryData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button 
              onClick={() => setPage(page - 1)}
            >
              {t('previous')}
            </Button>
          )}
          <span>
            Page {page} of {inventoryData.meta.pages}
          </span>
          {page < inventoryData.meta.pages && (
            <Button 
              onClick={() => setPage(page + 1)}
            >
              {t('next')}
            </Button>
          )}
        </PaginationContainer>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <ImportModal>
          <h3>Import inventory from CSV</h3>
          <ImportInstructions>
            <p>Upload a CSV file with the following columns:</p>
            <ImportInstructionsList>
              <li><strong>Code</strong> (required) - Unique product code</li>
              <li><strong>Description</strong> (required) - Product description</li>
              <li><strong>Group</strong> (required) - Product group</li>
              <li><strong>Unit</strong> (required) - Unit of measurement</li>
            </ImportInstructionsList>
            <div style={{ marginTop: '10px' }}>
              <Button 
                variant="secondary" 
                onClick={downloadTemplate}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Download template CSV
              </Button>
            </div>
          </ImportInstructions>
          
          <div style={{ marginBottom: '20px' }}>
            <ImportFileInput
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
            />
            {importFile && (
              <ImportFileInfo>
                Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </ImportFileInfo>
            )}
          </div>

          {formErrors.length > 0 && (
            <ValidationError>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error:</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </ValidationError>
          )}

          {importResults && (
            <ImportResults>
              <h4>Import Results:</h4>
              <p>✅ Imported: {importResults.imported} items</p>
              <p>🔄 Updated: {importResults.updated} items</p>
              <p>❌ Errors: {importResults.errors} items</p>
              
              {importResults.details.filter((d) => d.errors).length > 0 && (
                <ImportErrorDetails>
                  <strong>Error Details:</strong>
                  <ImportErrorList>
                    {importResults.details.filter((d) => d.errors).map((detail, index) => (
                      <li key={index}>
                        Row {detail.row} ({detail.code}): {detail.errors?.join(', ')}
                      </li>
                    ))}
                  </ImportErrorList>
                </ImportErrorDetails>
              )}
            </ImportResults>
          )}

          <ImportButtonContainer>
            <Button 
              onClick={handleImport}
              disabled={!importFile || importMutation.isLoading}
            >
              {importMutation.isLoading ? 'Importing...' : 'Import CSV'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowImportModal(false);
                setImportFile(null);
                setImportResults(null);
                setFormErrors([]);
              }}
              disabled={importMutation.isLoading}
            >
              Close
            </Button>
          </ImportButtonContainer>
        </ImportModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>Confirm delete</h3>
            <p>Are you sure you want to delete the item <strong>{showDeleteConfirm.code}</strong> - {showDeleteConfirm.description}?</p>
            <p style={{ color: '#dc3545', fontSize: '14px', fontWeight: 'bold' }}>This action cannot be undone.</p>
            <ConfirmationButtons>
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                No
              </Button>
              <Button 
                variant="danger" 
                onClick={() => deleteMutation.mutate(showDeleteConfirm._id)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, delete'}
              </Button>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationModal>
      )}
      
      {/* Floating Action Button for Mobile */}
      {user?.role === 'admin' && (
        <FloatingActionButton onClick={() => setShowForm(true)}>
          +
        </FloatingActionButton>
      )}
    </InventoryContainer>
  );
};

export default Inventory;

