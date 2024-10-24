"use client"

import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    
    <div className="font-montserrat w-screen h-screen bg-white flex flex-col justify-between  dark:bg-slate-600 transition-all py-24">{children}</div>
  );
}
