import { useState, useCallback } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  clearErrors: () => void;
  reset: (newValues?: T) => void;
}

/**
 * 汎用フォーム管理フック
 * フォーム状態、バリデーション、送信処理を統合管理
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // バリデーション実行
  const validateForm = useCallback((formValues: T) => {
    if (!validate) return {};
    return validate(formValues);
  }, [validate]);

  // フィールド値変更
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // リアルタイムバリデーション
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // フィールド値設定
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  // フィールドエラー設定
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // エラークリア
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // フォームリセット
  const reset = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  // フォーム送信
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    
    try {
      // バリデーション実行
      const validationErrors = validateForm(values);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // 送信処理実行
      await onSubmit(values);
      
      // 成功時はエラーをクリア
      setErrors({});
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      // API エラーの場合は適切にハンドリング
      if (error instanceof Error) {
        setErrors({ submit: error.message } as any);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  // フォームの有効性チェック
  const isValid = Object.keys(errors).length === 0 && !isSubmitting;

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    clearErrors,
    reset,
  };
}