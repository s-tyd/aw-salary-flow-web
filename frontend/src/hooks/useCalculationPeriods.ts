import { useState, useEffect, useCallback } from 'react';
import { CalculationPeriod, CalculationPeriodCreate, CalculationPeriodCheck } from '@/lib/types';
import { calculationPeriodAPI } from '@/lib/api/calculation-periods';

export function useCalculationPeriods() {
  const [periods, setPeriods] = useState<CalculationPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<CalculationPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await calculationPeriodAPI.getCalculationPeriods();
      setPeriods(data);
    } catch (err) {
      console.warn('計算期間データ取得エラー:', err);
      setError('計算期間データの取得に失敗しました');
      setPeriods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentPeriod = async () => {
    try {
      const data = await calculationPeriodAPI.getCurrentCalculationPeriod();
      setCurrentPeriod(data);
    } catch (err) {
      console.warn('現在の計算期間取得エラー:', err);
      setCurrentPeriod(null);
    }
  };

  const checkPeriod = useCallback(async (year: number, month: number): Promise<CalculationPeriodCheck> => {
    return await calculationPeriodAPI.checkCalculationPeriod(year, month);
  }, []);

  const createPeriod = async (periodData: CalculationPeriodCreate): Promise<void> => {
    try {
      const newPeriod = await calculationPeriodAPI.createCalculationPeriod(periodData);
      setPeriods(prev => [newPeriod, ...prev]);
      return newPeriod;
    } catch (err) {
      console.error('計算期間作成エラー:', err);
      throw err;
    }
  };

  const startSalaryCalculation = useCallback(async (year: number, month: number): Promise<CalculationPeriod> => {
    try {
      const period = await calculationPeriodAPI.startSalaryCalculation(year, month);
      setPeriods(prev => {
        const index = prev.findIndex(p => p.year === year && p.month === month);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = period;
          return updated;
        } else {
          return [period, ...prev];
        }
      });
      setCurrentPeriod(period);
      return period;
    } catch (err) {
      console.error('給与計算開始エラー:', err);
      throw err;
    }
  }, []);

  const updatePeriodStatus = async (periodId: number, status: string): Promise<void> => {
    try {
      const updatedPeriod = await calculationPeriodAPI.updateCalculationPeriodStatus(periodId, status);
      setPeriods(prev => prev.map(p => p.id === periodId ? updatedPeriod : p));
      if (currentPeriod && currentPeriod.id === periodId) {
        setCurrentPeriod(updatedPeriod);
      }
    } catch (err) {
      console.error('計算期間ステータス更新エラー:', err);
      throw err;
    }
  };

  const deletePeriod = async (periodId: number): Promise<void> => {
    try {
      await calculationPeriodAPI.deleteCalculationPeriod(periodId);
      setPeriods(prev => prev.filter(p => p.id !== periodId));
      if (currentPeriod && currentPeriod.id === periodId) {
        setCurrentPeriod(null);
      }
    } catch (err) {
      console.error('計算期間削除エラー:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPeriods();
    fetchCurrentPeriod();
  }, []);

  return {
    periods,
    currentPeriod,
    isLoading,
    error,
    fetchPeriods,
    fetchCurrentPeriod,
    checkPeriod,
    createPeriod,
    startSalaryCalculation,
    updatePeriodStatus,
    deletePeriod,
  };
}