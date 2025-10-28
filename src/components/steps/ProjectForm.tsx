import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn, getUniqueProducts } from '@/utils';
import type { ProjectFormData, SelectedDocument } from '@/types';

interface ProjectFormProps {
  formData: Partial<ProjectFormData>;
  selectedDocuments: SelectedDocument[];
  onUpdateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
}

export default function ProjectForm({
  formData,
  selectedDocuments,
  onUpdateFormData,
  onNext,
}: ProjectFormProps) {
  const [projectName, setProjectName] = useState(formData.projectName || '');
  const [submittedTo, setSubmittedTo] = useState(formData.submittedTo || '');
  const [preparedBy, setPreparedBy] = useState(formData.preparedBy || '');
  const [date, setDate] = useState(
    formData.date && !isNaN(new Date(formData.date).getTime()) ? formData.date : ''
  );
  const [projectNumber, setProjectNumber] = useState(formData.projectNumber || '');
  const [emailAddress, setEmailAddress] = useState(formData.emailAddress || '');
  const [phoneNumber, setPhoneNumber] = useState(formData.phoneNumber || '');

  const availableProducts = useMemo(() => {
    const selectedDocs = selectedDocuments
      .filter(doc => doc.selected)
      .map(doc => doc.document);

    if (selectedDocs.length === 0) {
      return ['3/4-in (20mm)', '1-in (25mm)', '1-1/8-in (28mm)'];
    }

    return getUniqueProducts(selectedDocs);
  }, [selectedDocuments]);

  const [product, setProduct] = useState(() => {
    if (formData.product && availableProducts.includes(formData.product)) {
      return formData.product;
    }
    return availableProducts[0] || '3/4-in (20mm)';
  });

  // Status checkboxes
  const [statusForReview, setStatusForReview] = useState(formData.status?.forReview || false);
  const [statusForApproval, setStatusForApproval] = useState(formData.status?.forApproval || false);
  const [statusForRecord, setStatusForRecord] = useState(formData.status?.forRecord || false);
  const [statusForInformationOnly, setStatusForInformationOnly] = useState(formData.status?.forInformationOnly || false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if at least one status is selected
  const isStatusValid = statusForReview || statusForApproval || statusForRecord || statusForInformationOnly;

  // Check if form is valid
  const isFormValid =
    projectName.trim() !== '' &&
    submittedTo.trim() !== '' &&
    preparedBy.trim() !== '' &&
    date !== '' &&
    emailAddress.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    isStatusValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (!submittedTo.trim()) newErrors.submittedTo = 'Submitted To is required';
    if (!preparedBy.trim()) newErrors.preparedBy = 'Prepared By is required';
    if (!date) newErrors.date = 'Date is required';
    if (!emailAddress.trim()) newErrors.emailAddress = 'Email Address is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
    if (!isStatusValid) newErrors.status = 'Please select at least one status option';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onUpdateFormData({
        projectName,
        submittedTo,
        preparedBy,
        date,
        projectNumber,
        emailAddress,
        phoneNumber,
        product,
        status: {
          forReview: statusForReview,
          forApproval: statusForApproval,
          forRecord: statusForRecord,
          forInformationOnly: statusForInformationOnly,
        },
      });
      onNext();
    }
  };

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
            className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-white font-bold text-xl">NS</span>
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Project Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill out the form below with your project details. You'll select and arrange documents in the next step.
          </p>
        </div>

        {/* Form */}
        <form id="form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

          {/* Project Information Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="submittedTo" className="form-label text-sm font-medium">
                  Submitted To <span className="text-red-500">*</span>
                </label>
                <input
                  id="submittedTo"
                  type="text"
                  value={submittedTo}
                  onChange={(e) => setSubmittedTo(e.target.value)}
                  placeholder="Enter recipient name or organization"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.submittedTo && 'border-red-500')}
                  required
                />
                {errors.submittedTo && (
                  <p className="text-red-500 text-sm">{errors.submittedTo}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="projectName" className="form-label text-sm font-medium">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.projectName && 'border-red-500')}
                  required
                />
                {errors.projectName && (
                  <p className="text-red-500 text-sm">{errors.projectName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="projectNumber" className="form-label text-sm font-medium">
                  Project Number
                </label>
                <input
                  id="projectNumber"
                  type="text"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  placeholder="Enter project number"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.projectNumber && 'border-red-500')}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="preparedBy" className="form-label text-sm font-medium">
                  Prepared By <span className="text-red-500">*</span>
                </label>
                <input
                  id="preparedBy"
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Enter your name or organization"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.preparedBy && 'border-red-500')}
                  required
                />
                {errors.preparedBy && (
                  <p className="text-red-500 text-sm">{errors.preparedBy}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="emailAddress" className="form-label text-sm font-medium">
                  Phone/Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="emailAddress"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter email address"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.emailAddress && 'border-red-500')}
                  required
                />
                {errors.emailAddress && (
                  <p className="text-red-500 text-sm">{errors.emailAddress}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phoneNumber" className="form-label text-sm font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className={cn('form-input bg-white dark:bg-gray-700', errors.phoneNumber && 'border-red-500')}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="date" className="form-label text-sm font-medium">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && !isNaN(new Date(value).getTime())) {
                      setDate(value);
                    } else {
                      setDate('');
                    }
                  }}
                  className={cn('form-input bg-white dark:bg-gray-700', errors.date && 'border-red-500')}
                  placeholder="YYYY-MM-DD"
                  required
                />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>
            </div>
          </div>

          {/* Status/Action Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status / Action <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusForReview}
                  onChange={(e) => setStatusForReview(e.target.checked)}
                  className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">For Review</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusForApproval}
                  onChange={(e) => setStatusForApproval(e.target.checked)}
                  className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">For Approval</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusForRecord}
                  onChange={(e) => setStatusForRecord(e.target.checked)}
                  className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">For Record</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={statusForInformationOnly}
                  onChange={(e) => setStatusForInformationOnly(e.target.checked)}
                  className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">For Information Only</span>
              </label>
            </div>
            {errors.status && (
              <p className="text-red-500 text-sm mt-2">{errors.status}</p>
            )}
          </div>

          {/* Product Selection */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
            <div className="flex flex-col gap-2">
              <label htmlFor="product" className="form-label text-sm font-medium">
                Panel Thickness
              </label>
              <select
                id="product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="form-input bg-white dark:bg-gray-700"
              >
                {availableProducts.map((productOption) => (
                  <option key={productOption} value={productOption}>
                    {productOption}
                  </option>
                ))}
              </select>
              {selectedDocuments.filter(doc => doc.selected).length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Product options based on selected documents
                </p>
              )}
            </div>

            <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">NEXGEN® Building Products, LLC</strong><br />
                1504 Manhattan Ave West, #300 Brandon, FL 34205<br />
                (727) 634-5534<br />
                Technical Support: <a href="mailto:support@nexgenbp.com" className="text-cyan-600 hover:underline">support@nexgenbp.com</a>
              </p>
            </div>
          </div>
        </form>

        {/* Navigation */}
        <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
          <motion.button
            type="submit"
            form="form"
            disabled={!isFormValid}
            aria-disabled={!isFormValid}
            aria-label={isFormValid ? 'Proceed to select documents' : 'Please fill out all required fields'}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            className={cn(
              'btn btn-primary btn-lg min-w-48 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700',
              !isFormValid && 'opacity-50 cursor-not-allowed'
            )}
          >
            Select & Arrange Documents
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
