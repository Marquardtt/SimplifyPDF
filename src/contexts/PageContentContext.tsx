"use client"

import { createContext, useContext, useState } from "react";

type PageContentProps = {
    option?: string
    setOption?: (option: string) => void
}
const OptionContext = createContext<PageContentProps | undefined>(undefined)

export function PageContent({ children }: { children: React.ReactNode }) {
    const [option, setOption] = useState<string>('')
    return (
        <OptionContext.Provider value={{ option, setOption }}>
            {children}
        </OptionContext.Provider>
    )
}

export function useOption() {
    const context = useContext(OptionContext);
    if (!context) {
      throw new Error("useOption must be used within an OptionProvider");
    }
    return context;
  }