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
      id="body"
      className={` font-montserrat w-screen h-screen bg-white flex flex-col justify-between  dark:bg-slate-600 transition-all`}
    >
      <header><HeaderComponent/></header>
      <div className="py-24">{children}</div>
      {/* <footer className="bottom-0"><FooterComponent /></footer> */}
    </body>
  );
}
