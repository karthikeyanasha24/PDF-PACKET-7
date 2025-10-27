import { motion } from 'framer-motion';
import { pdfService } from '@/services/pdfService';
import type { SelectedDocument, ProjectFormData } from '@/types';
import { cn, formatFileSize } from '@/utils';
import { documentTypeConfig } from '@/data/documents';

interface PacketGenerationProps {
  selectedDocuments: SelectedDocument[];
  onPrevious: () => void;
  onNext: () => void;
  isGenerating: boolean;
  onSetGenerating: (isGenerating: boolean) => void;
  formData: Partial<ProjectFormData>;
}

const PacketGeneration = ({
  selectedDocuments,
  onPrevious,
  onNext,
  isGenerating,
  onSetGenerating,
  formData
}: PacketGenerationProps) => {
  // Calculate total size
  const totalSize = selectedDocuments.filter(doc => doc.selected).reduce((sum, doc) => sum + (doc.document.size || 0), 0);
  const sortedDocs = selectedDocuments.filter(doc => doc.selected).sort((a, b) => a.order - b.order);

  // Estimate final size (e.g., 80% of total size to account for compression or overhead)
  const estimatedFinalSize = totalSize * 0.8;

  const handleGenerate = async () => {
    console.log('Generate Packet button clicked');
    if (isGenerating) return;
    onSetGenerating(true);
    try {
      // Ensure all formData fields are provided, using empty strings or defaults
      const preparedFormData = {
        ...formData,
        emailAddress: formData.emailAddress || '',
        phoneNumber: formData.phoneNumber || '',
        product: formData.product || '3/4-in (20mm)',
        status: formData.status || {
          forReview: false,
          forApproval: false,
          forRecord: false,
          forInformationOnly: false,
        },
        submittalType: formData.submittalType || {
          tds: false,
          threePartSpecs: false,
          testReportIccEsr5194: false,
          testReportIccEsl1645: false,
          fireAssembly: false,
          fireAssembly01: false,
          fireAssembly02: false,
          fireAssembly03: false,
          msds: false,
          leedGuide: false,
          installationGuide: false,
          warranty: false,
          samples: false,
          other: false,
        },
        date: formData.date || new Date().toLocaleDateString(),
      };
      console.log('Prepared form data for PDF:', preparedFormData); // Debug output
      const pdfBytes = await pdfService.generatePacket(preparedFormData, sortedDocs);
      pdfService.downloadPDF(pdfBytes, `${formData.projectName || 'Untitled'}_Packet.pdf`);
      onNext();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF packet.');
    } finally {
      onSetGenerating(false);
    }
  };

  const handlePreview = async () => {
    console.log('Preview Packet button clicked');
    if (isGenerating) return;
    onSetGenerating(true);
    try {
      const preparedFormData = {
        ...formData,
        emailAddress: formData.emailAddress || '',
        phoneNumber: formData.phoneNumber || '',
        product: formData.product || '3/4-in (20mm)',
        status: formData.status || {
          forReview: false,
          forApproval: false,
          forRecord: false,
          forInformationOnly: false,
        },
        submittalType: formData.submittalType || {
          tds: false,
          threePartSpecs: false,
          testReportIccEsr5194: false,
          testReportIccEsl1645: false,
          fireAssembly: false,
          fireAssembly01: false,
          fireAssembly02: false,
          fireAssembly03: false,
          msds: false,
          leedGuide: false,
          installationGuide: false,
          warranty: false,
          samples: false,
          other: false,
        },
        date: formData.date || new Date().toLocaleDateString(),
      };
      console.log('Prepared form data for preview:', preparedFormData); // Debug output
      const pdfBytes = await pdfService.generatePacket(preparedFormData, sortedDocs);
      pdfService.previewPDF(pdfBytes);
    } catch (error) {
      console.error('Error generating PDF for preview:', error);
      alert('Failed to generate PDF preview.');
    } finally {
      onSetGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl mx-auto">
      <div className="card p-8 lg:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">Generate PDF Packet</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-2">Review your selections and generate a professional PDF packet with cover page, section dividers, and all selected documents.</p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center border border-primary-200 dark:border-primary-800">
            <p className="text-primary-700 dark:text-primary-300 font-medium">{sortedDocs.length}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400">Documents Selected</p>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center border border-primary-200 dark:border-primary-800">
            <p className="text-primary-700 dark:text-primary-300 font-medium">{formatFileSize(totalSize)}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400">Total Size</p>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 text-center border border-primary-200 dark:border-primary-800">
            <p className="text-primary-700 dark:text-primary-300 font-medium">{formatFileSize(estimatedFinalSize)}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400">Estimated Final Size</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Document Breakdown</h3>
          <div className="space-y-4">
            {sortedDocs.map((doc, index) => {
              return (
                <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{index + 1}. {doc.document.name}</span>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{doc.document.type} • {formatFileSize(doc.document.size || 0)}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Order: {doc.order}</div>
                  </div>
                </div>
              );
            })}
            {sortedDocs.length === 0 && <p className="text-gray-500 dark:text-gray-400">No documents selected.</p>}
          </div>
          {sortedDocs.length > 0 && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <p className="text-primary-700 dark:text-primary-300 font-medium">Total Documents: {sortedDocs.length} | Combined Size: {formatFileSize(totalSize)}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Packet Summary</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Project Information</h4>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>Project: {formData.projectName || 'N/A'}</p>
              <p>Company: {formData.submittedTo || 'N/A'}</p>
              <p>Prepared by: {formData.preparedBy || 'N/A'}</p>
              <p>Email Address: {formData.emailAddress || ''}</p>
              <p>Phone Number: {formData.phoneNumber || ''}</p>
              <p>Project Number: {formData.projectNumber || 'N/A'}</p>
              <p>Date: {formData.date || new Date().toLocaleDateString()}</p>
              <p>Status: {formData.status ? Object.entries(formData.status).filter(([_, v]) => v).map(([k]) => k.replace(/([A-Z])/g, ' $1').trim()).join(', ') : 'N/A'}</p>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-3">Documents ({sortedDocs.length})</h4>
            <div className="space-y-2">
              {sortedDocs.map((doc, index) => {
                return <p key={doc.id} className="text-gray-700 dark:text-gray-300">{index + 1}. {doc.document.name}</p>;
              })}
            </div>
            {sortedDocs.length > 0 && <p className="text-gray-700 dark:text-gray-300 mt-2">Estimated size: {formatFileSize(totalSize)}</p>}
          </div>
        </div>

        <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-700 gap-2">
          <motion.button onClick={() => { console.log('Navigating back to arrangement'); onPrevious(); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-outline btn-lg">Back to Arrangement</motion.button>
          <motion.button onClick={handlePreview} disabled={isGenerating || sortedDocs.length === 0} whileHover={!(isGenerating || sortedDocs.length === 0) ? { scale: 1.02 } : {}} whileTap={!(isGenerating || sortedDocs.length === 0) ? { scale: 0.98 } : {}} className={cn('btn btn-outline btn-lg min-w-24', (isGenerating || sortedDocs.length === 0) && 'opacity-50 cursor-not-allowed')}>{isGenerating ? 'Generating...' : 'Preview Packet'}</motion.button>
          <motion.button onClick={handleGenerate} disabled={isGenerating || sortedDocs.length === 0} whileHover={!(isGenerating || sortedDocs.length === 0) ? { scale: 1.02 } : {}} whileTap={!(isGenerating || sortedDocs.length === 0) ? { scale: 0.98 } : {}} className={cn('btn btn-primary btn-lg min-w-24', (isGenerating || sortedDocs.length === 0) && 'opacity-50 cursor-not-allowed')}>{isGenerating ? 'Generating...' : 'Generate Packet'}</motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PacketGeneration;