// 社員関連の型定義

export interface Employee {
  id: number;
  user_id: number;
  employee_number: string;
  name: string;
  hire_date: string;
  resignation_date?: string;
  kiwi_name?: string;
  remote_allowance: boolean;
  created_at: string;
}

export interface EmployeeCreate {
  employee_number: string;
  name: string;
  hire_date: string;
  resignation_date?: string;
  kiwi_name?: string;
  remote_allowance: boolean;
}

export interface EmployeeUpdate {
  employee_number?: string;
  name?: string;
  hire_date?: string;
  resignation_date?: string;
  kiwi_name?: string;
  remote_allowance?: boolean;
}

// 勤務データ関連の型
export interface WorkData {
  id: number;
  employee_id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  break_time?: number;
  overtime_hours?: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkDataCreate {
  employee_id: number;
  date: string;
  start_time?: string;
  end_time?: string;
  break_time?: number;
  overtime_hours?: number;
  note?: string;
}

// 交通費関連の型
export interface TransportationExpense {
  employee_number: string;
  employee_name: string;
  period_start: string;
  period_end: string;
  usage_count: number;
  transportation_expense: number;
  commute_expense: number;
  total_amount: number;
}

// 計算期間関連の型
export interface CalculationPeriod {
  id: number;
  year: number;
  month: number;
  period_name: string;
  status: 'draft' | 'calculating' | 'completed' | 'locked';
  created_at: string;
  updated_at: string;
}

export interface CalculationPeriodCreate {
  year: number;
  month: number;
  period_name: string;
  status?: string;
}

export interface CalculationPeriodCheck {
  exists: boolean;
  status: string | null;
  can_start_calculation: boolean;
  period?: CalculationPeriod;
}

// ダッシュボード関連の型
export interface DashboardEmployee {
  id: string;
  nameKeys?: any;
  workData?: any;
  approved?: boolean;
  kiwiScoreReport?: any;
  transportationExpenses?: any;
  freeeExpenses?: any;
}