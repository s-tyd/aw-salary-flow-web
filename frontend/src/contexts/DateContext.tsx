"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DateContextType {
  currentYear: number;
  currentMonth: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  setYearMonth: (year: number, month: number) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const setYear = (year: number) => {
    setCurrentYear(year);
  };

  const setMonth = (month: number) => {
    setCurrentMonth(month);
  };

  const setYearMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <DateContext.Provider
      value={{
        currentYear,
        currentMonth,
        setYear,
        setMonth,
        setYearMonth,
      }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
}
