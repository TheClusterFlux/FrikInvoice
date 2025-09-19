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

const InventoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FiltersContainer = styled(Card)`
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: end;
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const InventoryTable = styled(Table)`
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
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
    background-color: ${({ sortable }) => sortable ? '#e9ecef' : 'inherit'};
  }
  
  &::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    opacity: 0.5;
  }
  
  &.asc::after {
    border-bottom: 6px solid #666;
    opacity: 1;
  }
  
  &.desc::after {
    border-top: 6px solid #666;
    opacity: 1;
  }
`;

const TableRow = styled.tr<{ alternating?: boolean; index?: number }>`
  background-color: ${({ alternating, index }) => 
    alternating && index !== undefined && index % 2 === 1 ? '#f8f9fa' : 'white'};
`;

const ToggleButton = styled(Button)`
  font-size: 12px;
  padding: 6px 12px;
  margin-bottom: 16px;
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

const Inventory: React.FC = () => {
  const { user } = useAuth();
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
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [alternatingRows, setAlternatingRows] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading, error } = useQuery(
    ['inventory', page, search, group, sortField, sortDirection],
    () => inventoryService.getInventory({ page, limit: 20, search, group, sortField, sortDirection }),
    { keepPreviousData: true }
  );

  // Fetch available groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await inventoryService.getInventory({ limit: 1000 });
        const groups = Array.from(new Set(response.data.map(item => item.group))).sort();
        setAvailableGroups(groups);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };
    fetchGroups();
  }, []);

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
        <PageTitle>Inventory Management</PageTitle>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={() => setShowImportModal(true)}>Import CSV</Button>
          {user?.role === 'admin' && (
            <Button onClick={() => setShowForm(true)}>Add New Item</Button>
          )}
        </div>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <ToggleButton 
        variant={alternatingRows ? 'primary' : 'secondary'}
        onClick={() => setAlternatingRows(!alternatingRows)}
      >
        {alternatingRows ? 'Disable' : 'Enable'} Alternating Row Colors
      </ToggleButton>

      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Search:</FilterLabel>
          <Input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Group:</FilterLabel>
          <Select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="">All Groups</option>
            {availableGroups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </FilterGroup>
      </FiltersContainer>

      {showForm && user?.role === 'admin' && (
        <Card>
          <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>Code *</label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label>Description *</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Group *</label>
                <Input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Unit *</label>
                <Input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>
            </div>
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
                {editingItem ? 'Update Item' : 'Add Item'}
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
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <InventoryTable>
        <thead>
          <tr>
            <SortableHeader sortable onClick={() => handleSort('code')} className={getSortClass('code')}>
              Code
            </SortableHeader>
            <SortableHeader sortable onClick={() => handleSort('description')} className={getSortClass('description')}>
              Description
            </SortableHeader>
            <SortableHeader sortable onClick={() => handleSort('group')} className={getSortClass('group')}>
              Group
            </SortableHeader>
            <SortableHeader sortable onClick={() => handleSort('unit')} className={getSortClass('unit')}>
              Unit
            </SortableHeader>
            {user?.role === 'admin' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {inventoryData?.data.map((item, index) => (
            <TableRow key={item._id} alternating={alternatingRows} index={index}>
              <td>
                <strong>{item.code}</strong>
              </td>
              <td>
                {item.description}
              </td>
              <td>{item.group}</td>
              <td>{item.unit}</td>
              {user?.role === 'admin' && (
                <td>
                  <ActionButtons>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleEdit(item)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => setShowDeleteConfirm(item)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Delete
                    </Button>
                  </ActionButtons>
                </td>
              )}
            </TableRow>
          ))}
        </tbody>
      </InventoryTable>

      {inventoryData?.meta && inventoryData.meta.pages > 1 && (
        <PaginationContainer>
          {page > 1 && (
            <Button 
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
          )}
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Page {page} of {inventoryData.meta.pages}
          </span>
          {page < inventoryData.meta.pages && (
            <Button 
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          )}
        </PaginationContainer>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <Card style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, minWidth: '500px' }}>
          <h3>Import Inventory from CSV</h3>
          <div style={{ marginBottom: '20px' }}>
            <p>Upload a CSV file with the following columns:</p>
            <ul style={{ fontSize: '14px', color: '#666' }}>
              <li><strong>Code</strong> (required) - Unique product code</li>
              <li><strong>Description</strong> (required) - Product description</li>
              <li><strong>Group</strong> (required) - Product group</li>
              <li><strong>Unit</strong> (required) - Unit of measurement</li>
            </ul>
            <div style={{ marginTop: '10px' }}>
              <Button 
                variant="secondary" 
                onClick={downloadTemplate}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Download Template CSV
              </Button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            {importFile && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </div>
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
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <h4>Import Results:</h4>
              <p>✅ Imported: {importResults.imported} items</p>
              <p>🔄 Updated: {importResults.updated} items</p>
              <p>❌ Errors: {importResults.errors} items</p>
              
              {importResults.details.filter((d) => d.errors).length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Error Details:</strong>
                  <ul style={{ fontSize: '12px', maxHeight: '100px', overflowY: 'auto' }}>
                    {importResults.details.filter((d) => d.errors).map((detail, index) => (
                      <li key={index}>
                        Row {detail.row} ({detail.code}): {detail.errors?.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
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
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal>
          <ConfirmationDialog>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the item <strong>{showDeleteConfirm.code}</strong> - {showDeleteConfirm.description}?</p>
            <p style={{ color: '#666', fontSize: '14px' }}>This action cannot be undone.</p>
            <ConfirmationButtons>
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => deleteMutation.mutate(showDeleteConfirm._id)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </ConfirmationButtons>
          </ConfirmationDialog>
        </ConfirmationModal>
      )}
    </InventoryContainer>
  );
};

export default Inventory;

