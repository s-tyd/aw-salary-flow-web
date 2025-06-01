import { ApiClient } from './base';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../../lib/types';

class EmployeeAPI extends ApiClient {
  async getEmployees(): Promise<Employee[]> {
    return this.get<Employee[]>('/employees');
  }

  async getEmployee(employeeId: number): Promise<Employee> {
    return this.get<Employee>(`/employees/${employeeId}`);
  }

  async createEmployee(employeeData: EmployeeCreate): Promise<Employee> {
    return this.post<Employee>('/employees', employeeData);
  }

  async updateEmployee(employeeId: number, employeeData: EmployeeUpdate): Promise<Employee> {
    return this.put<Employee>(`/employees/${employeeId}`, employeeData);
  }

  async deleteEmployee(employeeId: number): Promise<{ message: string }> {
    return this.delete<{ message: string }>(`/employees/${employeeId}`);
  }
}

export const employeeAPI = new EmployeeAPI();