"use client";

import { useRouter } from "next/navigation";
import {
  Home,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Car,
  FileSpreadsheet,
  UserCheck,
  Settings,
  Receipt,
  Calendar,
  Bug,
} from "lucide-react";
import { useCalculationPeriods } from "@/hooks/useCalculationPeriods";
import { useDate } from "@/contexts/DateContext";
import { useState, useEffect } from "react";
import config from "@/lib/config";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

// 基本のナビゲーション項目
const baseNavigationItems: NavigationItem[] = [
  { id: "dashboard", label: "ダッシュボード", icon: Home, href: "/dashboard" },
  { id: "employees", label: "社員管理", icon: Users, href: "/employees" },
  { id: "work-data", label: "勤務データ", icon: Clock, href: "/work-data" },
  {
    id: "attendance-records",
    label: "勤務時間データ",
    icon: Calendar,
    href: "/attendance-records",
  },
  {
    id: "kiwigo-reports",
    label: "KiwiGoレポート",
    icon: TrendingUp,
    href: "/kiwigo-reports",
  },
  {
    id: "kincone-transportation",
    label: "Kincone交通費",
    icon: Car,
    href: "/kincone-transportation",
  },
  {
    id: "freee-expenses",
    label: "Freee経費",
    icon: Receipt,
    href: "/freee-expenses",
  },
];

// 通常のナビゲーション項目（開発モード項目を除く）
export const navigationItems: NavigationItem[] = baseNavigationItems;

// 開発モード専用項目
const developmentBottomItems: NavigationItem[] = config.features.payrollTest ? [
  {
    id: "debug",
    label: "デバッグ",
    icon: Bug,
    href: "/debug",
  },
] : [];

export const bottomNavigationItems: NavigationItem[] = [
  {
    id: "excel-templates",
    label: "Excelテンプレート",
    icon: FileSpreadsheet,
    href: "/excel-templates",
  },
  {
    id: "employee-master",
    label: "社員マスタデータ",
    icon: UserCheck,
    href: "/employee-master",
  },
  { id: "settings", label: "設定", icon: Settings, href: "/settings" },
  ...developmentBottomItems, // 設定の真下に配置
];

interface NavigationItemsProps {
  currentPath?: string;
  isCollapsed: boolean;
}

// 計算開始前にアクセス制限するページ
const restrictedPages = [
  "/employees",
  "/work-data",
  "/attendance-records",
  "/kiwigo-reports",
  "/kincone-transportation",
  "/freee-expenses",
  "/debug", // 開発モード専用ページも制限対象
];

export default function NavigationItems({
  currentPath,
  isCollapsed,
}: NavigationItemsProps) {
  const router = useRouter();
  const { checkPeriod } = useCalculationPeriods();
  const { currentYear, currentMonth } = useDate();
  const [periodCheck, setPeriodCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 現在の期間の計算開始状態をチェック
  useEffect(() => {
    const checkCurrentPeriod = async () => {
      setIsLoading(true);
      try {
        const check = await checkPeriod(currentYear, currentMonth);
        console.log("Navigation: Period check result:", check);
        setPeriodCheck(check);
      } catch (err) {
        console.warn("計算期間チェックエラー:", err);
        setPeriodCheck({
          exists: false,
          status: null,
          can_start_calculation: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentPeriod();

    // 計算開始イベントを監聴
    const handleCalculationStarted = () => {
      console.log("Navigation: Calculation started event received");
      checkCurrentPeriod();
    };

    window.addEventListener("calculationStarted", handleCalculationStarted);

    return () => {
      window.removeEventListener(
        "calculationStarted",
        handleCalculationStarted,
      );
    };
  }, [currentYear, currentMonth, checkPeriod]);

  const handleNavigation = (href: string) => {
    // 計算開始前で制限対象ページの場合はナビゲーションを防ぐ
    // APIレスポンス: exists=true, status="calculating"なら計算開始済み
    const isCalculationStarted =
      periodCheck?.exists &&
      periodCheck?.status &&
      periodCheck.status !== "draft";

    if (!isCalculationStarted && restrictedPages.includes(href)) {
      alert(
        "この機能を利用するには、まず給与計算を開始してください。ダッシュボードから「この月の給与計算を開始」ボタンをクリックしてください。",
      );
      return;
    }
    router.push(href);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    // ローディング中は制限を適用しない（ちらつき防止）
    if (isLoading) {
      const isActive = currentPath === item.href;
      return (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-3 px-3"} py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={18} className="text-current flex-shrink-0" />
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </button>
        </li>
      );
    }

    // APIレスポンス: exists=true, status="calculating"なら計算開始済み
    const isCalculationStarted =
      periodCheck?.exists &&
      periodCheck?.status &&
      periodCheck.status !== "draft";
    const isRestricted =
      !isCalculationStarted && restrictedPages.includes(item.href);
    const isActive = currentPath === item.href;

    // デバッグ情報
    if (item.id === "employees") {
      console.log("Navigation Debug:", {
        periodCheck,
        isCalculationStarted,
        isRestricted,
        status: periodCheck?.status,
      });
    }

    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => handleNavigation(item.href)}
          disabled={isRestricted}
          className={`w-full flex items-center ${isCollapsed ? "justify-center px-3" : "space-x-3 px-3"} py-2 text-sm font-medium rounded-md transition-colors ${
            isActive
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : isRestricted
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <item.icon size={18} className="text-current flex-shrink-0" />
          {!isCollapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </button>
      </li>
    );
  };

  return (
    <nav className="flex-1 overflow-y-auto">
      <ul className="p-2 space-y-1">
        {navigationItems.map(renderNavigationItem)}
      </ul>
    </nav>
  );
}
