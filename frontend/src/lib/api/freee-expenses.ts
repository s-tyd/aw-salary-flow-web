import { apiClient } from './base';

export interface FreeeExpense {
  id: number;
  calculation_period_id: number;
  employee_id?: number;
  income_expense_type: string;
  management_number?: string;
  occurrence_date?: string;
  payment_due_date?: string;
  partner_name: string;
  account_item: string;
  tax_classification: string;
  amount: number;
  tax_calculation_type: string;
  tax_amount: number;
  notes?: string;
  item_name?: string;
  department?: string;
  memo_tags?: string;
  payment_date?: string;
  payment_account?: string;
  payment_amount?: number;
  employee_number?: string;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface FreeeExpenseCreate {
  calculation_period_id: number;
  employee_id?: number;
  income_expense_type: string;
  management_number?: string;
  occurrence_date?: string;
  payment_due_date?: string;
  partner_name: string;
  account_item: string;
  tax_classification: string;
  amount: number;
  tax_calculation_type: string;
  tax_amount: number;
  notes?: string;
  item_name?: string;
  department?: string;
  memo_tags?: string;
  payment_date?: string;
  payment_account?: string;
  payment_amount?: number;
  employee_number?: string;
  data_source?: string;
}

export interface FreeeExpenseUpdate {
  income_expense_type?: string;
  management_number?: string;
  occurrence_date?: string;
  payment_due_date?: string;
  partner_name?: string;
  account_item?: string;
  tax_classification?: string;
  amount?: number;
  tax_calculation_type?: string;
  tax_amount?: number;
  notes?: string;
  item_name?: string;
  department?: string;
  memo_tags?: string;
  payment_date?: string;
  payment_account?: string;
  payment_amount?: number;
  employee_number?: string;
}

export interface FreeeExpenseImportResponse {
  imported_count: number;
  errors: string[];
  success: boolean;
}

export interface FreeeExpenseFilters {
  calculation_period_id?: number;
  employee_id?: number;
  skip?: number;
  limit?: number;
}

class FreeeExpenseAPI {
  private basePath = '/freee-expenses';

  async getFreeeExpenses(filters: FreeeExpenseFilters = {}): Promise<FreeeExpense[]> {
    const params = new URLSearchParams();
    
    if (filters.calculation_period_id) {
      params.append('calculation_period_id', filters.calculation_period_id.toString());
    }
    if (filters.employee_id) {
      params.append('employee_id', filters.employee_id.toString());
    }
    if (filters.skip !== undefined) {
      params.append('skip', filters.skip.toString());
    }
    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return apiClient.get<FreeeExpense[]>(url);
  }

  async getFreeeExpense(id: number): Promise<FreeeExpense> {
    return apiClient.get<FreeeExpense>(`${this.basePath}/${id}`);
  }

  async createFreeeExpense(data: FreeeExpenseCreate): Promise<FreeeExpense> {
    return apiClient.post<FreeeExpense>(this.basePath, data);
  }

  async updateFreeeExpense(id: number, data: FreeeExpenseUpdate): Promise<FreeeExpense> {
    return apiClient.put<FreeeExpense>(`${this.basePath}/${id}`, data);
  }

  async deleteFreeeExpense(id: number): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async importCSV(calculationPeriodId: number, file: File): Promise<FreeeExpenseImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${this.basePath}/import-csv?calculation_period_id=${calculationPeriodId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'CSVインポートに失敗しました');
    }

    return response.json();
  }
}

export const freeeExpenseAPI = new FreeeExpenseAPI();