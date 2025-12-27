import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Card } from '../styles/GlobalStyles';
import { orderService } from '../services/orderService';

const ModalOverlay = styled.div`
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

const ModalContent = styled(Card)`
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  background: var(--bg-secondary);
  color: var(--text-primary);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--text-primary);
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const TemplateCard = styled.div<{ selected: boolean }>`
  padding: 15px;
  border: 2px solid ${props => props.selected ? '#007bff' : '#eee'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f8f9ff' : 'var(--bg-secondary)'};

  &:hover {
    border-color: ${props => props.selected ? '#007bff' : '#ccc'};
    background-color: ${props => props.selected ? '#f8f9ff' : 'var(--bg-primary)'};
  }
`;

const TemplateName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  text-transform: capitalize;
`;

const TemplateDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #666;
`;

interface PDFTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: string) => void;
  orderId: string;
  orderNumber: string;
}

const PDFTemplateModal: React.FC<PDFTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  orderId,
  orderNumber,
}) => {
  const [templates, setTemplates] = useState<{
    available: string[];
    active: string;
    current: string;
  } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const templateDescriptions: Record<string, string> = {
    professional: 'Clean, professional layout with standard business styling and bilingual support',
    compact: 'Compact, minimal design optimized for quick printing with essential fields',
    bilingual: 'Full bilingual Afrikaans/English template matching OOSVAAL LANDBOU design',
    'ultra-compact': 'Ultra-compact layout optimized for small print formats and space efficiency',
    'signing-screen': 'Modern, clean design matching the invoice signing screen with card-based layout'
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const templateData = await orderService.getPDFTemplates();
      setTemplates(templateData);
      setSelectedTemplate(templateData.current);
    } catch (err) {
      setError('Failed to load PDF templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      await onSelectTemplate(selectedTemplate);
      onClose();
    } catch (err) {
      setError('Failed to generate PDF');
      console.error('Error generating PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Choose PDF Template</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <p style={{ marginBottom: '20px', color: '#666' }}>
          Select a template for invoice <strong>{orderNumber}</strong>:
        </p>

        {loading && !templates ? (
          <LoadingSpinner>Loading templates...</LoadingSpinner>
        ) : error ? (
          <div style={{ color: '#dc3545', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : (
          <TemplateGrid>
            {templates?.available.map((template) => (
              <TemplateCard
                key={template}
                selected={selectedTemplate === template}
                onClick={() => handleTemplateSelect(template)}
              >
                <TemplateName>{template}</TemplateName>
                <TemplateDescription>
                  {templateDescriptions[template] || 'Custom template'}
                </TemplateDescription>
              </TemplateCard>
            ))}
          </TemplateGrid>
        )}

        <ModalActions>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={loading || !selectedTemplate}
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </Button>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PDFTemplateModal;
