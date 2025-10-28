// Form data types
export interface ProjectFormData {
  projectName: string;
  submittedTo: string;
  preparedBy: string;
  projectNumber?: string;
  emailAddress: string;
  phoneNumber: string;
  date: string;
  status: {
    forReview: boolean;
    forApproval: boolean;
    forRecord: boolean;
    forInformationOnly: boolean;
  };
  product: string;
}

// Document types
export interface Document {
  id: string;
  name: string;
  description: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  required: boolean;
  products: string[];
}

export interface SelectedDocument {
  id: string;
  document: Document;
  selected: boolean;
  order: number;
}

// App state
export interface AppState {
  currentStep: number;
  formData: Partial<ProjectFormData>;
  selectedDocuments: SelectedDocument[];
  isGenerating: boolean;
  darkMode: boolean;
}

// Document type for filtering
export type DocumentType = 'TDS' | 'ESR' | 'MSDS' | 'LEED' | 'Installation' | 'warranty' | 'Acoustic' | 'PartSpec';
