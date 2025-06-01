/**
 * 給与計算フック
 */

import { useState } from 'react';
import PayrollService, { 
  PayrollGenerationRequest, 
  PayrollGenerationResponse, 
  WorkDataSummary 
} from '@/services/PayrollService';

export function usePayroll() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 給与計算Excelファイルを生成
   */
  const generatePayrollExcel = async (request: PayrollGenerationRequest): Promise<PayrollGenerationResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await PayrollService.generatePayrollExcel(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '給与計算Excel生成に失敗しました';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 勤務データサマリを取得
   */
  const getWorkDataSummary = async (calculationPeriodId: number): Promise<WorkDataSummary[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const summaries = await PayrollService.getWorkDataSummary(calculationPeriodId);
      return summaries;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '勤務データサマリ取得に失敗しました';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generatePayrollExcel,
    getWorkDataSummary,
  };
}