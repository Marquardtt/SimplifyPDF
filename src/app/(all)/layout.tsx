"use client";

import { HeaderComponent } from "@/components/Header";
import { AppProps } from "next/app";
import { ReactNode } from "react";

type Props = AppProps & {
  text: string
  children: ReactNode
};

export default function Layout({ children }: Props) {

  return (
    <body id="body" className={`w-screen h-screen bg-white flex flex-col dark:bg-slate-600 transition-all`}>
      <HeaderComponent />
        {children}
    </body>
  );
}