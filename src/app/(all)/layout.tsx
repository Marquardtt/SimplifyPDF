"use client";

import { FooterComponent } from "@/components/Footer";
import { HeaderComponent } from "@/components/Header";
import { AppProps } from "next/app";
import { ReactNode } from "react";

type Props = AppProps & {
  text: string
  children: ReactNode
};

export default function Layout({ children }: Props) {

  return (
    <body suppressHydrationWarning={true} id="body" className={`font-montserrat w-screen h-screen bg-white flex flex-col justify-between dark:bg-slate-600 transition-all`}>
      <HeaderComponent />
      <div>
        {children}
      </div>
      <FooterComponent />
    </body>
  );
}