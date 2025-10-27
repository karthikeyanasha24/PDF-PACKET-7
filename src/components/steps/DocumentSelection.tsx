import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatFileSize, generateId } from '@/utils';
import { availableDocuments, documentTypeConfig } from '@/data/documents';
import PacketStats from '@/components/PacketStats';
import type { SelectedDocument, DocumentType } from '@/types';

interface DocumentSelectionProps {
  selectedDocuments: SelectedDocument[];
  onUpdateSelectedDocuments: (documents: SelectedDocument[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function DocumentSelection({
  selectedDocuments,
  onUpdateSelectedDocuments,
  onNext,
  onPrevious,
}: DocumentSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    return availableDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || doc.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterType]);

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = Array.from(new Set(availableDocuments.map(doc => doc.type)));
    console.log('Document types:', types);
    types.forEach(type => {
      if (!documentTypeConfig[type]) {
        console.warn(`Missing documentTypeConfig for type: ${type}`);
      }
    });
    return types.sort((a, b) => {
      const priorityA = documentTypeConfig[a]?.priority ?? 99;
      const priorityB = documentTypeConfig[b]?.priority ?? 99;
      return priorityA - priorityB;
    });
  }, []);

  // Check if document is selected
  const isDocumentSelected = (documentId: string): boolean => {
    return selectedDocuments.some(doc => doc.document.id === documentId && doc.selected);
  };

  // Toggle document selection
  const toggleDocument = (document: typeof availableDocuments[0]) => {
    const isSelected = isDocumentSelected(document.id);
    console.log('Toggling document:', document.name, { isSelected });
    
    if (isSelected) {
      // Remove document
      const updated = selectedDocuments.filter(doc => doc.document.id !== document.id);
      onUpdateSelectedDocuments(updated);
    } else {
      // Add document
      const newSelectedDoc: SelectedDocument = {
        id: generateId(),
        document,
        order: selectedDocuments.length,
        selected: true,
      };
      onUpdateSelectedDocuments([...selectedDocuments, newSelectedDoc]);
    }
  };

  // Get selected count
  const selectedCount = selectedDocuments.filter(doc => doc.selected).length;

  // Check if can proceed
  const canProceed = selectedCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto"
    >
      <div className="card p-8 lg:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-white font-bold">Docs</span>
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Select Documents
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose which documents to include in your PDF packet. You can select multiple documents 
            and arrange their order in the next step.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full pl-4"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
              className="form-input pl-4 pr-10 min-w-48"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Statistics */}
        <PacketStats 
          selectedDocuments={selectedDocuments}
          formData={{}}
        />

        {/* Selected Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
        >
          <p className="text-primary-700 dark:text-primary-300 font-medium">
            {selectedCount} document{selectedCount !== 1 ? 's' : ''} selected
            {selectedCount > 0 && (
              <span className="ml-2 text-sm text-primary-600 dark:text-primary-400">
                • Ready to proceed to arrangement
              </span>
            )}
          </p>
        </motion.div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatePresence>
            {filteredDocuments.map((document, index) => {
              const isSelected = isDocumentSelected(document.id);
              const config = documentTypeConfig[document.type] || { color: 'gray', priority: 99 }; // Fallback config
              
              return (
                <motion.div
                  key={document.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    'relative cursor-pointer transition-all duration-300',
                    'border-2 rounded-xl p-6 bg-white dark:bg-gray-800',
                    isSelected 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md'
                  )}
                  onClick={() => toggleDocument(document)}
                >
                  {/* Selection Indicator */}
                  <div className="absolute top-4 right-4">
                    <motion.div
                      initial={false}
                      animate={{ scale: isSelected ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <span className="text-primary-500 font-bold">Selected</span>
                    </motion.div>
                  </div>

                  {/* Document Type Badge */}
                  <div className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4',
                    `bg-${config.color}-100 text-${config.color}-700`,
                    `dark:bg-${config.color}-900/20 dark:text-${config.color}-300`
                  )}>
                    {document.type}
                  </div>

                  {/* Document Info */}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 pr-8">
                    {document.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {document.description}
                  </p>

                  {/* File Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(document.size || 0)}</span>
                    <span>PDF</span>
                  </div>

                  {/* Preview Button */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Previewing document:', document.url);
                      window.open(document.url, '_blank');
                    }}
                    className="absolute bottom-4 right-4 btn btn-primary btn-sm opacity-0 hover:opacity-100 transition-opacity"
                    title="Preview PDF"
                  >
                    Preview
                  </motion.button>

                  {/* Hover Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-primary-500/5 rounded-xl pointer-events-none"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or filter settings.
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={() => {
              console.log('Navigating back to form');
              onPrevious();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-outline btn-lg"
          >
            Back to Form
          </motion.button>

          <motion.button
            onClick={() => {
              console.log('Navigating to arrange documents', { selectedCount });
              onNext();
            }}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            className={cn(
              'btn btn-primary btn-lg min-w-48',
              !canProceed && 'opacity-50 cursor-not-allowed'
            )}
          >
            Arrange Documents
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}