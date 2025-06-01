import { apiClient } from './base';
import { CalculationPeriod, CalculationPeriodCreate, CalculationPeriodCheck } from '../types';

export const calculationPeriodAPI = {
  async getCalculationPeriods(): Promise<CalculationPeriod[]> {
    return apiClient.get<CalculationPeriod[]>('/calculation-periods');
  },

  async getCalculationPeriod(periodId: number): Promise<CalculationPeriod> {
    return apiClient.get<CalculationPeriod>(`/calculation-periods/${periodId}`);
  },

  async getCurrentCalculationPeriod(): Promise<CalculationPeriod> {
    return apiClient.get<CalculationPeriod>('/calculation-periods-current');
  },

  async checkCalculationPeriod(year: number, month: number): Promise<CalculationPeriodCheck> {
    return apiClient.get<CalculationPeriodCheck>(`/calculation-periods/check/${year}/${month}`);
  },

  async createCalculationPeriod(data: CalculationPeriodCreate): Promise<CalculationPeriod> {
    return apiClient.post<CalculationPeriod>('/calculation-periods', data);
  },

  async startSalaryCalculation(year: number, month: number): Promise<CalculationPeriod> {
    return apiClient.post<CalculationPeriod>(`/calculation-periods/start/${year}/${month}`, {});
  },

  async updateCalculationPeriodStatus(periodId: number, status: string): Promise<CalculationPeriod> {
    return apiClient.put<CalculationPeriod>(`/calculation-periods/${periodId}`, { status });
  },

  async deleteCalculationPeriod(periodId: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/calculation-periods/${periodId}`);
  }
};