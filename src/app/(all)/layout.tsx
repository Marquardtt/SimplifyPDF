"use client"

import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    
    <div className="font-montserrat w-screen h-screen bg-white flex flex-col items-center justify-between dark:bg-slate-600 transition-all ">{children}</div>
  );
}
