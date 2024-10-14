"use client"

import { FooterComponent } from "@/components/Footer";
import { HeaderComponent } from "@/components/Header";
import { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <body
      suppressHydrationWarning={true}
      id="body"
      className={`font-montserrat w-screen h-screen bg-white flex flex-col justify-between dark:bg-slate-600 transition-all`}
    >
      <HeaderComponent />
      <div>{children}</div>
      <FooterComponent />
    </body>
  );
}
