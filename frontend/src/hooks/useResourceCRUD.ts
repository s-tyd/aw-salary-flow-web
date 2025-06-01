"use client";

import { useState, useEffect, useCallback } from "react";
import { LoadingState } from "@/lib/types";

interface ResourceAPI<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  getAll(): Promise<T[]>;
  getById?(id: number | string): Promise<T>;
  create(data: TCreate): Promise<T>;
  update?(id: number | string, data: TUpdate): Promise<T>;
  delete?(id: number | string): Promise<void>;
}

interface UseResourceCRUDOptions {
  autoFetch?: boolean;
  onError?: (error: string) => void;
  fallbackData?: any[];
}

export function useResourceCRUD<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
  api: ResourceAPI<T, TCreate, TUpdate>,
  options: UseResourceCRUDOptions = {}
) {
  const { autoFetch = true, onError, fallbackData = [] } = options;
  
  const [items, setItems] = useState<T[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: autoFetch,
    error: null,
  });
  const [operationLoading, setOperationLoading] = useState(false);

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "エラーが発生しました";
    setLoadingState(prev => ({ ...prev, error: errorMessage }));
    
    if (onError) {
      onError(errorMessage);
    } else {
      console.error("Resource CRUD Error:", error);
    }
  }, [onError]);

  const fetchAll = useCallback(async () => {
    try {
      setLoadingState({ isLoading: true, error: null });
      const data = await api.getAll();
      setItems(data);
      setLoadingState({ isLoading: false, error: null });
    } catch (error) {
      handleError(error);
      if (fallbackData.length > 0) {
        setItems(fallbackData);
      }
      setLoadingState(prev => ({ ...prev, isLoading: false }));
    }
  }, [api.getAll, handleError, fallbackData]);

  const create = useCallback(async (data: TCreate): Promise<T | null> => {
    try {
      setOperationLoading(true);
      const newItem = await api.create(data);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setOperationLoading(false);
    }
  }, [api.create, handleError]);

  const update = useCallback(async (id: number | string, data: TUpdate): Promise<T | null> => {
    if (!api.update) {
      console.warn("Update operation not supported");
      return null;
    }

    try {
      setOperationLoading(true);
      const updatedItem = await api.update(id, data);
      setItems(prev => prev.map(item => 
        (item as any).id === id ? updatedItem : item
      ));
      return updatedItem;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setOperationLoading(false);
    }
  }, [api.update, handleError]);

  const remove = useCallback(async (id: number | string): Promise<boolean> => {
    if (!api.delete) {
      console.warn("Delete operation not supported");
      return false;
    }

    try {
      setOperationLoading(true);
      await api.delete(id);
      setItems(prev => prev.filter(item => (item as any).id !== id));
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setOperationLoading(false);
    }
  }, [api.delete, handleError]);

  const refresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch]); // fetchAllを依存関係から除外

  return {
    items,
    isLoading: loadingState.isLoading,
    error: loadingState.error,
    operationLoading,
    create,
    update,
    remove,
    refresh,
    fetchAll,
  };
}