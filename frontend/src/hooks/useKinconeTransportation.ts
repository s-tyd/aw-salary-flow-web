/**
 * Kincone交通費データ管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  KinconeTransportationService, 
  KinconeTransportation, 
  KinconeTransportationImportResponse,
  KinconeTransportationFilters 
} from '@/services/KinconeTransportationService';
import { ImportResult } from '@/services/CsvImportService';

export function useKinconeTransportation(filters: KinconeTransportationFilters = {}) {
  const [transportation, setTransportation] = useState<KinconeTransportation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 交通費データを取得
   */
  const fetchTransportation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await KinconeTransportationService.getTransportation(filters);
      setTransportation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '交通費データの取得に失敗しました';
      setError(errorMessage);
      console.error('交通費データ取得エラー:', err);
      setTransportation([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * CSVファイルを解析（プレビュー用）
   */
  const parseCsv = useCallback(async (
    file: File
  ): Promise<ImportResult<Partial<KinconeTransportation>>> => {
    try {
      setError(null);
      return await KinconeTransportationService.parseCsv(file);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSV解析に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * CSVファイルをインポート
   */
  const importCsv = useCallback(async (
    file: File,
    calculationPeriodId?: number
  ): Promise<KinconeTransportationImportResponse> => {
    try {
      setError(null);
      
      const result = await KinconeTransportationService.importCsv(file, calculationPeriodId || 1);
      
      // インポート成功時はデータを再取得
      if (result.success) {
        await fetchTransportation();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'CSVインポートに失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTransportation]);

  /**
   * 交通費データを削除
   */
  const deleteTransportation = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      
      await KinconeTransportationService.deleteTransportation(id);
      // 削除成功時はデータを再取得
      await fetchTransportation();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '交通費データの削除に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTransportation]);

  /**
   * 全ての交通費データを削除
   */
  const deleteAllTransportation = useCallback(async (): Promise<{ message: string; deleted_count: number }> => {
    try {
      setError(null);
      
      const result = await KinconeTransportationService.deleteAllTransportation();
      // 削除成功時はデータを再取得
      await fetchTransportation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '交通費データの一括削除に失敗しました';
      setError(errorMessage);
      throw err;
    }
  }, [fetchTransportation]);

  // データ取得
  useEffect(() => {
    const loadTransportation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await KinconeTransportationService.getTransportation(filters);
        setTransportation(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '交通費データの取得に失敗しました';
        setError(errorMessage);
        console.error('交通費データ取得エラー:', err);
        setTransportation([]);
      } finally {
        setLoading(false);
      }
    };

    loadTransportation();
  }, [JSON.stringify(filters)]); // filtersの内容が変わった時のみ再実行

  return {
    transportation,
    loading,
    error,
    fetchTransportation,
    parseCsv,
    importCsv,
    deleteTransportation,
    deleteAllTransportation,
  };
}