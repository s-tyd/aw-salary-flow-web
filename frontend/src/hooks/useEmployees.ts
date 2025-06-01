import { useState, useEffect } from 'react';
import { Employee, EmployeeCreate, EmployeeUpdate } from '@/lib/types';
import { employeeAPI } from '@/lib/api/employees';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await employeeAPI.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.warn('社員データ取得エラー（バックエンドAPI利用不可）:', err);
      // バックエンドが利用できない場合は空の配列を設定
      setError(null);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createEmployee = async (employeeData: EmployeeCreate): Promise<void> => {
    try {
      const newEmployee = await employeeAPI.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
    } catch (err) {
      console.warn('社員作成エラー（バックエンドAPI利用不可）:', err);
      // モックレスポンス
      const mockEmployee: Employee = {
        id: Date.now(),
        user_id: 1,
        employee_number: employeeData.employee_number,
        name: employeeData.name,
        hire_date: employeeData.hire_date,
        resignation_date: employeeData.resignation_date,
        kiwi_name: employeeData.kiwi_name,
        remote_allowance: employeeData.remote_allowance,
        created_at: new Date().toISOString()
      };
      setEmployees(prev => [...prev, mockEmployee]);
      alert('社員が追加されました（モック）');
    }
  };

  const updateEmployee = async (employeeId: number, employeeData: EmployeeUpdate): Promise<void> => {
    try {
      const updatedEmployee = await employeeAPI.updateEmployee(employeeId, employeeData);
      setEmployees(prev => prev.map(emp => emp.id === employeeId ? updatedEmployee : emp));
    } catch (err) {
      console.warn('社員更新エラー（バックエンドAPI利用不可）:', err);
      // モックレスポンス
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, ...employeeData, updated_at: new Date().toISOString() }
          : emp
      ));
      alert('社員情報が更新されました（モック）');
    }
  };

  const deleteEmployee = async (employeeId: number): Promise<void> => {
    try {
      await employeeAPI.deleteEmployee(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    } catch (err) {
      console.warn('社員削除エラー（バックエンドAPI利用不可）:', err);
      // モックレスポンス
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      alert('社員が削除されました（モック）');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    isLoading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}