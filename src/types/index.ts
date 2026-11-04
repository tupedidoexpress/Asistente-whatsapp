export type VariableTransform = 'none' | 'titleCase' | 'upperCase' | 'lowerCase' | 'currency' | 'date';

export interface VariableConfig {
  name: string;
  mappedColumn: string;
  fallbackValue?: string;
  transform: VariableTransform;
}

export interface DataRow {
  __id: string;
  [key: string]: any;
}

export type DispatchStatus = 'pending' | 'sent' | 'skipped';

export interface MergedMessage {
  id: string;
  rowIndex: number;
  data: DataRow;
  renderedText: string;
  recipientPhone: string;
  recipientName: string;
  cleanPhone: string;
  whatsappUrl: string;
  status: DispatchStatus;
  missingVariables: string[];
}

export interface TemplatePreset {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  sampleColumns: string[];
  sampleData: Record<string, string>[];
  phoneColumn: string;
  nameColumn: string;
}

export interface CountryCode {
  country: string;
  code: string;
  prefix: string;
  flag: string;
}
