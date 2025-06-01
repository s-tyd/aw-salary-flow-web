/**
 * Freee経費データ管理フック
 */

import { useCsvImportData } from './useCsvImportData';
import { 
  FreeeExpenseService, 
  FreeeExpense, 
  FreeeExpenseImportResponse,
  FreeeExpenseFilters 
} from '@/services/FreeeExpenseService';

export function useFreeeExpenses(filters: FreeeExpenseFilters = {}) {
  const {
    data: expenses,
    loading,
    error,
    fetchData: fetchExpenses,
    parseCsv,
    importCsv,
    deleteItem: deleteExpense,
    deleteAll: deleteAllExpenses
  } = useCsvImportData<FreeeExpense, FreeeExpenseImportResponse>({
    service: FreeeExpenseService,
    filters
  });

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    parseCsv,
    importCsv,
    deleteExpense,
    deleteAllExpenses,
  };
}