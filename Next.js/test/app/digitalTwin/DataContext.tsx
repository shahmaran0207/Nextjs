"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DataStats {
  totalTraffic: number;
  avgSpeed: number;
  activeConstruction: number;
}

interface DataContextType {
  dataStats: DataStats;
  setDataStats: (stats: DataStats) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dataStats, setDataStats] = useState<DataStats>({
    totalTraffic: 0,
    avgSpeed: 0,
    activeConstruction: 0,
  });

  return (
    <DataContext.Provider value={{ dataStats, setDataStats }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider");
  }
  return context;
}
