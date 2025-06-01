/**
 * 汎用CSVインポートデータ管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import { BaseCsvImportService, BaseImportResponse, BaseFilters } from '@/services/base/BaseCsvImportService';
import { ImportResult } from '@/services/CsvImportService';
import { AuthService } from '@/services/AuthService';

interface CsvImportDataOptions<T, ImportResponse extends BaseImportResponse> {
  service: BaseCsvImportService<T, ImportResponse>;
  filters?: BaseFilters;
}

export function useCsvImportData<T, ImportResponse extends BaseImportResponse>(
  options: CsvImportDataOptions<T, ImportResponse>
) {
  const { service, filters = {} } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * データを取得
   */
  const fetchData = useCallback(async () => {
    // 認証されていない場合は何もしない
    if (!AuthService.isAuthenticated()) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await service.getData(filters);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの取得に失敗しました';
      setError(errorMessage);
      console.error('データ取得エラー:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [service, JSON.stringify(filters)]);

  /**
   * CSVファイルを解析（プレビュー用）
   */
  const parseCsv = useCallback(async (
    file: File
  ): Promise<ImportResult<Partial<T>>> => {
    try {
      setError(null);
      return await service.parseCsv(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSV解析に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [service]);

  /**
   * CSVファイルをインポート
   */
  const importCsv = useCallback(async (
    file: File,
    calculationPeriodId?: number
  ): Promise<ImportResponse> => {
    try {
      setError(null);
      
      const result = await service.importCsv(file, calculationPeriodId || 1);
      
      // インポート成功時はデータを再取得
      if (result.success) {
        await fetchData();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSVインポートに失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [service, fetchData]);

  /**
   * データを削除
   */
  const deleteItem = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      
      await service.deleteItem(id);
      // 削除成功時はデータを再取得
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの削除に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [service, fetchData]);

  /**
   * 全てのデータを削除
   */
  const deleteAll = useCallback(async (): Promise<{ message: string; deleted_count: number }> => {
    try {
      setError(null);
      
      const result = await service.deleteAll();
      // 削除成功時はデータを再取得
      await fetchData();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの一括削除に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [service, fetchData]);

  // 初期データ取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    parseCsv,
    importCsv,
    deleteItem,
    deleteAll,
  };
}