import { apiClient } from './base';
import { ExcelTemplate, ExcelTemplateCreate } from '../../lib/types';

export const excelTemplateAPI = {
  async getTemplates(): Promise<ExcelTemplate[]> {
    return apiClient.get<ExcelTemplate[]>('/excel-templates');
  },

  async createTemplate(templateData: ExcelTemplateCreate): Promise<ExcelTemplate> {
    const formData = new FormData();
    formData.append('name', templateData.name);
    formData.append('description', templateData.description || '');
    formData.append('file', templateData.file);

    return apiClient.postFormData<ExcelTemplate>('/excel-templates', formData);
  },

  async downloadTemplate(templateId: number, fileName: string): Promise<void> {
    return apiClient.downloadFile(`/excel-templates/${templateId}/download`, fileName);
  },

  async deleteTemplate(templateId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/excel-templates/${templateId}`);
  }
};