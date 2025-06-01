"use client";

import { ComponentType } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface WithAuthGuardProps {}

export function withAuthGuard<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P & WithAuthGuardProps> {
  return function AuthGuardedComponent(props: P & WithAuthGuardProps) {
    const { isLoading } = useAuthGuard();

    if (isLoading) {
      return <LoadingSpinner fullScreen message="認証情報を確認しています..." />;
    }

    return <WrappedComponent {...props} />;
  };
}