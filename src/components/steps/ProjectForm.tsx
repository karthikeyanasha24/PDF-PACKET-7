import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils';
import type { ProjectFormData } from '@/types';

// Update the ProjectFormData interface to include new fields
interface ProjectFormData {
  projectName: string;
  submittedTo: string;
  preparedBy: string;
  date: string;
  projectNumber?: string;
  emailAddress: string;
  phoneNumber: string;
  status: string;
}

interface ProjectFormProps {
  formData: Partial<ProjectFormData>;
  onUpdateFormData: (data: Partial<ProjectFormData>) => void;
  onNext: () => void;
}

export default function ProjectForm({
  formData,
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
  const [status, setStatus] = useState(formData.status || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Check if form is valid (projectNumber is optional, so not included in validation)
  const isFormValid =
    projectName.trim() !== '' &&
    submittedTo.trim() !== '' &&
    preparedBy.trim() !== '' &&
    date !== '' &&
    emailAddress.trim() !== '' &&
    phoneNumber.trim() !== '' &&
    status !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', {
      projectName,
      submittedTo,
      preparedBy,
      date,
      projectNumber,
      emailAddress,
      phoneNumber,
      status,
      isFormValid,
    });
    const newErrors: { [key: string]: string } = {};
    if (!projectName.trim()) newErrors.projectName = 'Project Name is required';
    if (!submittedTo.trim()) newErrors.submittedTo = 'Submitted To is required';
    if (!preparedBy.trim()) newErrors.preparedBy = 'Prepared By is required';
    if (!date) newErrors.date = 'Date is required';
    if (!emailAddress.trim()) newErrors.emailAddress = 'Email Address is required';
    if (!phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
    if (!status) newErrors.status = 'Status is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form is valid, updating form data and calling onNext');
      onUpdateFormData({
        projectName,
        submittedTo,
        preparedBy,
        date,
        projectNumber,
        emailAddress,
        phoneNumber,
        status,
      });
      onNext();
    } else {
      console.log('Form validation failed', newErrors);
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
            className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-white font-bold">Form</span>
          </motion.div>
          <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
            Project Information
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fill out the form below to customize your PDF packet with project-specific information.
          </p>
        </div>

        {/* Form */}
        <form id="form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 mb-10 max-w-3xl mx-auto">
          <div className="flex flex-col gap-2">
            <label htmlFor="projectName" className="form-label">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className={cn('form-input', errors.projectName && 'border-red-500')}
              required
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm">{errors.projectName}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="projectNumber" className="form-label">
              Project Number
            </label>
            <input
              id="projectNumber"
              type="text"
              value={projectNumber}
              onChange={(e) => setProjectNumber(e.target.value)}
              placeholder="Enter project number"
              className={cn('form-input', errors.projectNumber && 'border-red-500')}
            />
            {errors.projectNumber && (
              <p className="text-red-500 text-sm">{errors.projectNumber}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="submittedTo" className="form-label">
              Submitted To <span className="text-red-500">*</span>
            </label>
            <input
              id="submittedTo"
              type="text"
              value={submittedTo}
              onChange={(e) => setSubmittedTo(e.target.value)}
              placeholder="Enter recipient name or organization"
              className={cn('form-input', errors.submittedTo && 'border-red-500')}
              required
            />
            {errors.submittedTo && (
              <p className="text-red-500 text-sm">{errors.submittedTo}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="preparedBy" className="form-label">
              Prepared By <span className="text-red-500">*</span>
            </label>
            <input
              id="preparedBy"
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              placeholder="Enter your name or organization"
              className={cn('form-input', errors.preparedBy && 'border-red-500')}
              required
            />
            {errors.preparedBy && (
              <p className="text-red-500 text-sm">{errors.preparedBy}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="emailAddress" className="form-label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              className={cn('form-input', errors.emailAddress && 'border-red-500')}
              required
            />
            {errors.emailAddress && (
              <p className="text-red-500 text-sm">{errors.emailAddress}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="form-label">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className={cn('form-input', errors.phoneNumber && 'border-red-500')}
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="form-label">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Date input:', value);
                if (value && !isNaN(new Date(value).getTime())) {
                  setDate(value);
                } else {
                  setDate('');
                }
              }}
              className={cn('form-input', errors.date && 'border-red-500')}
              placeholder="YYYY-MM-DD"
              required
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="form-label">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={cn('form-input', errors.status && 'border-red-500')}
              required
            >
              <option value="" disabled>
                Select status
              </option>
              <option value="Review">Review</option><option value="Approval">Approval</option><option value="Record">Record</option><option value="Info Only">Info Only</option>
            </select>

            
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status}</p>
            )}
          </div>
        </form>

        {/* Navigation */}
        <div className="flex justify-center pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            type="submit"
            form="form"
            disabled={!isFormValid}
            aria-disabled={!isFormValid}
            aria-label={isFormValid ? 'Proceed to select documents' : 'Please fill out all required fields'}
            whileHover={isFormValid ? { scale: 1.02 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            onClick={() => console.log('Button clicked')}
            className={cn(
              'btn btn-primary btn-lg min-w-48',
              !isFormValid && 'opacity-50 cursor-not-allowed'
            )}
          >
            Select Documents
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}