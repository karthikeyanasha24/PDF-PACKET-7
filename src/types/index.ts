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
  submittalType: {
    tds: boolean;
    threePartSpecs: boolean;
    testReportIccEsr5194: boolean;
    testReportIccEsl1645: boolean;
    fireAssembly: boolean;
    fireAssembly01: boolean;
    fireAssembly02: boolean;
    fireAssembly03: boolean;
    msds: boolean;
    leedGuide: boolean;
    installationGuide: boolean;
    warranty: boolean;
    samples: boolean;
    other: boolean;
    otherText?: string;
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
