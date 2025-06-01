// Excel・ファイル関連の型定義

export interface ExcelTemplate {
  id: number;
  name: string;
  description?: string;
  template_type?: string;
  file_name: string;
  file_size?: number;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExcelTemplateCreate {
  name: string;
  description?: string;
  file: File;
}

// ファイル関連の型
export interface FileUploadStatus {
  uploading: boolean;
  error: string | null;
  success: boolean;
}