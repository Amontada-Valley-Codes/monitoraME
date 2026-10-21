import type { Metadata } from "next";
import { Landing } from "@/components/teste/teste-landing";
import "./landing.css";

export const metadata: Metadata = {
  title: "MonitoraME",
  description: "Plataforma de inteligência territorial e oportunidades de compras públicas.",
  robots: { index: true, follow: true },
};

export default function TestePage() {
  return <Landing />;
}
