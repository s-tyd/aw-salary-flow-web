import { Employee, ExpenseRecord } from '../../lib/types';

/**
 * 取引先文字列から従業員番号を抽出する
 * 例: "★01川端光義" -> "001"
 * 例: "★100吉村芙実" -> "100"
 */
export function extractEmployeeNumber(businessPartner: string): string | null {
  // ★記号の後に続く数字を抽出（3桁にパディング）
  const match = businessPartner.match(/★(\d+)/);
  if (match) {
    const number = match[1];
    // 3桁にパディング（例: "1" -> "001", "100" -> "100"）
    return number.padStart(3, '0');
  }
  return null;
}

/**
 * 取引先文字列から従業員名を抽出する
 * 例: "★01川端光義" -> "川端光義"
 */
export function extractEmployeeName(businessPartner: string): string | null {
  // ★記号と数字の後に続く文字列を抽出
  const match = businessPartner.match(/★\d+(.+)/);
  if (match) {
    return match[1].trim();
  }
  return null;
}

/**
 * 経費データに社員マスターデータを紐付ける
 */
export function linkExpenseToEmployee(
  expense: ExpenseRecord,
  employees: Employee[]
): ExpenseRecord {
  const employeeNumber = extractEmployeeNumber(expense.business_partner);
  const employeeName = extractEmployeeName(expense.business_partner);
  
  if (!employeeNumber) {
    return expense;
  }

  // 社員マスターから該当する従業員を検索
  const employee = employees.find(emp => emp.employee_number === employeeNumber);
  
  return {
    ...expense,
    employee_number: employeeNumber,
    employee_name: employee ? employee.name : employeeName || '不明',
  };
}

/**
 * 複数の経費データに社員マスターデータを一括で紐付ける
 */
export function linkExpensesToEmployees(
  expenses: ExpenseRecord[],
  employees: Employee[]
): ExpenseRecord[] {
  return expenses.map(expense => linkExpenseToEmployee(expense, employees));
}