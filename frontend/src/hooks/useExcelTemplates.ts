import { useCallback, useMemo } from 'react';
import { ExcelTemplate, ExcelTemplateCreate } from '@/lib/types';
import { excelTemplateAPI } from '@/lib/api/excel-templates';
import { useResourceCRUD } from './useResourceCRUD';

export function useExcelTemplates() {
  const mockTemplates = useMemo(() => [
    {
      id: 1,
      name: "基本給与テンプレート",
      description: "基本的な給与計算用テンプレート",
      file_name: "basic_salary_template.xlsx",
      file_size: 25600,
      version: "1.0",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ], []);

  const crudAPI = useMemo(() => ({
    getAll: () => excelTemplateAPI.getTemplates(),
    create: (data: ExcelTemplateCreate) => excelTemplateAPI.createTemplate(data),
    delete: (id: number | string) => excelTemplateAPI.deleteTemplate(String(id)),
  }), []);

  const {
    items: templates,
    isLoading,
    error,
    create,
    remove,
    refresh,
    operationLoading,
  } = useResourceCRUD(crudAPI, {
    fallbackData: mockTemplates,
    onError: useCallback((error) => console.error('ExcelTemplate操作エラー:', error), []),
  });

  const downloadTemplate = useCallback(async (templateId: string, fileName: string): Promise<void> => {
    try {
      await excelTemplateAPI.downloadTemplate(templateId, fileName);
    } catch (err) {
      console.error('テンプレートダウンロードエラー:', err);
      throw err;
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    operationLoading,
    fetchTemplates: refresh,
    createTemplate: create,
    downloadTemplate,
    deleteTemplate: remove,
  };
}