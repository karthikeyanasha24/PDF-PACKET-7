import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  Bars3Icon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'
import { cn, formatFileSize, generateId } from '@/utils'
import { availableDocuments, documentTypeConfig } from '@/data/documents'
import type { SelectedDocument, DocumentType } from '@/types'

interface DocumentOrderingProps {
  selectedDocuments: SelectedDocument[]
  onUpdateSelectedDocuments: (documents: SelectedDocument[]) => void
  onNext: () => void
  onPrevious: () => void
}

interface SortableItemProps {
  document: SelectedDocument
  index: number
  totalCount: number
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onPreview: (url: string) => void
}

function SortableItem({ document, index, totalCount, onRemove, onMoveUp, onMoveDown, onPreview }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: document.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all duration-200",
        isDragging 
          ? "border-primary-500 shadow-2xl scale-105 rotate-2 z-50 opacity-90 bg-opacity-90"
          : "border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <Bars3Icon className="w-5 h-5 text-gray-400" />
        </button>

        {/* Order Number */}
        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full font-semibold text-sm">
          {index + 1}
        </div>

       

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {document.document.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {document.document.description}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatFileSize(document.document.size || 0)} • PDF
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Move Up Button */}
          <button
            onClick={() => onMoveUp(document.id)}
            disabled={index === 0}
            className={cn(
              "btn btn-ghost btn-sm p-2 transition-colors",
              index === 0 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            )}
            title="Move up"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>

          {/* Move Down Button */}
          <button
            onClick={() => onMoveDown(document.id)}
            disabled={index === totalCount - 1}
            className={cn(
              "btn btn-ghost btn-sm p-2 transition-colors",
              index === totalCount - 1 
                ? "opacity-30 cursor-not-allowed" 
                : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            )}
            title="Move down"
          >
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {/* Preview Button */}
          <button
            onClick={() => onPreview(document.document.url)}
            className="btn btn-ghost btn-sm p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
            title="Preview document (opens in new tab)"
          >
            <EyeIcon className="w-4 h-4" />
          </button>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(document.id)}
            className="btn btn-ghost btn-sm p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Remove document"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function DocumentOrdering({
  selectedDocuments,
  onUpdateSelectedDocuments,
  onNext,
  onPrevious,
}: DocumentOrderingProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all')
  const [showSelection, setShowSelection] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter and search documents for selection
  const filteredDocuments = useMemo(() => {
    return availableDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || doc.type === filterType
      return matchesSearch && matchesFilter
    })
  }, [searchTerm, filterType])

  // Get unique document types for filter
  const documentTypes = useMemo(() => {
    const types = Array.from(new Set(availableDocuments.map(doc => doc.type)))
    return types.sort((a, b) => {
      const configA = documentTypeConfig[a as DocumentType]
      const configB = documentTypeConfig[b as DocumentType]
      const priorityA = configA?.priority ?? 99
      const priorityB = configB?.priority ?? 99
      return priorityA - priorityB
    })
  }, [])

  // Filter only selected documents and sort by order
  const sortedDocuments = selectedDocuments
    .filter(doc => doc.selected)
    .sort((a, b) => a.order - b.order)

  // Check if document is selected
  const isDocumentSelected = (documentId: string): boolean => {
    return selectedDocuments.some(doc => doc.document.id === documentId && doc.selected)
  }

  // Toggle document selection
  const toggleDocument = (document: typeof availableDocuments[0]) => {
    const isSelected = isDocumentSelected(document.id)

    if (isSelected) {
      const updated = selectedDocuments.map(doc =>
        doc.document.id === document.id ? { ...doc, selected: false } : doc
      )
      onUpdateSelectedDocuments(updated)
    } else {
      const existingDoc = selectedDocuments.find(doc => doc.document.id === document.id)
      if (existingDoc) {
        const updated = selectedDocuments.map(doc =>
          doc.document.id === document.id ? { ...doc, selected: true } : doc
        )
        onUpdateSelectedDocuments(updated)
      } else {
        const newSelectedDoc: SelectedDocument = {
          id: generateId(),
          document,
          order: selectedDocuments.length,
          selected: true,
        }
        onUpdateSelectedDocuments([...selectedDocuments, newSelectedDoc])
      }
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sortedDocuments.findIndex(doc => doc.id === active.id)
      const newIndex = sortedDocuments.findIndex(doc => doc.id === over.id)

      const reorderedDocs = arrayMove(sortedDocuments, oldIndex, newIndex)
      
      // Update order property
      const updatedDocs = reorderedDocs.map((doc, index) => ({
        ...doc,
        order: index
      }))

      const unselectedDocs = selectedDocuments.filter(doc => !doc.selected)
      onUpdateSelectedDocuments([...updatedDocs, ...unselectedDocs])
    }
  }

  const removeDocument = (documentId: string) => {
    const updatedDocuments = selectedDocuments.map(doc =>
      doc.id === documentId ? { ...doc, selected: false } : doc
    )
    onUpdateSelectedDocuments(updatedDocuments)
  }

  // Move document up in order
  const moveDocumentUp = (documentId: string) => {
    const currentIndex = sortedDocuments.findIndex(doc => doc.id === documentId)
    if (currentIndex > 0) {
      const newDocuments = [...sortedDocuments]
      const [movedDoc] = newDocuments.splice(currentIndex, 1)
      newDocuments.splice(currentIndex - 1, 0, movedDoc)
      
      // Update orders
      const updatedDocuments = selectedDocuments.map(doc => {
        const newIndex = newDocuments.findIndex(newDoc => newDoc.id === doc.id)
        if (newIndex !== -1) {
          return { ...doc, order: newIndex + 1 }
        }
        return doc
      })
      onUpdateSelectedDocuments(updatedDocuments)
    }
  }

  // Move document down in order
  const moveDocumentDown = (documentId: string) => {
    const currentIndex = sortedDocuments.findIndex(doc => doc.id === documentId)
    if (currentIndex < sortedDocuments.length - 1) {
      const newDocuments = [...sortedDocuments]
      const [movedDoc] = newDocuments.splice(currentIndex, 1)
      newDocuments.splice(currentIndex + 1, 0, movedDoc)
      
      // Update orders
      const updatedDocuments = selectedDocuments.map(doc => {
        const newIndex = newDocuments.findIndex(newDoc => newDoc.id === doc.id)
        if (newIndex !== -1) {
          return { ...doc, order: newIndex + 1 }
        }
        return doc
      })
      onUpdateSelectedDocuments(updatedDocuments)
    }
  }

  // Preview document
  const previewDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank')
  }

  const canProceed = sortedDocuments.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="card p-8 lg:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <DocumentCheckIcon className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Select & Arrange Documents
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
            Choose which documents to include in your packet, then arrange their order.
          </p>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setShowSelection(!showSelection)}
              className={cn(
                "btn btn-lg transition-all duration-200",
                showSelection
                  ? "btn-secondary"
                  : "btn-primary bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              )}
            >
              <DocumentCheckIcon className="w-5 h-5 mr-2" />
              {showSelection ? 'Show Ordering' : 'Select Documents'}
            </button>
          </div>
        </div>

        {/* Document Selection Section */}
        <AnimatePresence mode="wait">
          {showSelection ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select Documents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Choose which documents to include in your PDF packet.
                </p>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input w-full pl-4 bg-white dark:bg-gray-700"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
                      className="form-input pl-4 pr-10 min-w-48 bg-white dark:bg-gray-700"
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

                {/* Selected Count */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} selected
                    {sortedDocuments.length > 0 && (
                      <span className="ml-2 text-cyan-600 dark:text-cyan-400">
                        ✓ Ready to arrange
                      </span>
                    )}
                  </p>
                </motion.div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredDocuments.map((document, index) => {
                      const isSelected = isDocumentSelected(document.id)

                      return (
                        <motion.div
                          key={document.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            'relative cursor-pointer transition-all duration-200',
                            'border-2 rounded-lg p-4 bg-white dark:bg-gray-700',
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-600 hover:border-cyan-300 hover:shadow-sm'
                          )}
                          onClick={() => toggleDocument(document)}
                        >
                          {/* Selection Indicator */}
                          <div className="absolute top-3 right-3">
                            <motion.div
                              initial={false}
                              animate={{ scale: isSelected ? 1 : 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          </div>

                          {/* Document Type Badge */}
                          <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium mb-2 bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                            {document.type}
                          </div>

                          {/* Document Info */}
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1 pr-8">
                            {document.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                            {document.description}
                          </p>

                          {/* File Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatFileSize(document.size || 0)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(document.url, '_blank')
                              }}
                              className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 hover:underline"
                            >
                              Preview
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {/* No Results */}
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No documents found. Try adjusting your search or filter.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ordering"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Document Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
              >
                <p className="text-primary-700 dark:text-primary-300 font-medium text-center">
                  {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''} selected for your packet
                </p>
              </motion.div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-3xl mx-auto mb-8">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How to reorder documents:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <Bars3Icon className="w-4 h-4" />
                    <span>Use the drag handle (⋮⋮⋮) to drag documents up or down</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronUpIcon className="w-4 h-4" />
                    <ChevronDownIcon className="w-4 h-4" />
                    <span>Click arrow buttons to move documents one position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>Click the eye icon to preview documents in a new tab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrashIcon className="w-4 h-4" />
                    <span>Click the trash icon to remove a document</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 italic">
                  Your cover page will always appear first, regardless of the order here.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document List (only show when not in selection mode) */}
        {!showSelection && sortedDocuments.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedDocuments.map(doc => doc.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {sortedDocuments.map((document, index) => (
                    <SortableItem
                      key={document.id}
                      document={document}
                      index={index}
                      totalCount={sortedDocuments.length}
                      onRemove={removeDocument}
                      onMoveUp={moveDocumentUp}
                      onMoveDown={moveDocumentDown}
                      onPreview={previewDocument}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        ) : null}

        {!showSelection && sortedDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentCheckIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents selected
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Click the "Select Documents" button above to choose documents for your packet.
            </p>
            <button
              onClick={() => setShowSelection(true)}
              className="btn btn-primary bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              <DocumentCheckIcon className="w-4 h-4 mr-2" />
              Select Documents
            </button>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={onPrevious}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-secondary btn-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Previous
          </motion.button>

          <motion.button
            onClick={onNext}
            disabled={!canProceed}
            whileHover={canProceed ? { scale: 1.02 } : {}}
            whileTap={canProceed ? { scale: 0.98 } : {}}
            className={cn(
              "btn btn-primary btn-lg",
              !canProceed && "opacity-50 cursor-not-allowed"
            )}
          >
            Generate Packet
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}