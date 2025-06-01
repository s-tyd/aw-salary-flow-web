/**
 * 勤務データ管理フック
 */

import { useCsvImportData } from './useCsvImportData';
import { 
  AttendanceRecordService, 
  AttendanceRecord, 
  AttendanceRecordImportResponse,
  AttendanceRecordFilters 
} from '@/services/AttendanceRecordService';

export function useAttendanceRecords(filters: AttendanceRecordFilters = {}) {
  const {
    data: records,
    loading,
    error,
    fetchData: fetchRecords,
    parseCsv,
    importCsv,
    deleteItem: deleteRecord,
    deleteAll: deleteAllRecords
  } = useCsvImportData<AttendanceRecord, AttendanceRecordImportResponse>({
    service: AttendanceRecordService,
    filters
  });

  return {
    records,
    loading,
    error,
    fetchRecords,
    parseCsv,
    importCsv,
    deleteRecord,
    deleteAllRecords,
  };
}