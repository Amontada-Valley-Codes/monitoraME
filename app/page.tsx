import type { Metadata } from 'next';

import { TesteLanding } from '@/components/teste/teste-landing';

import './teste/teste.css';

export const metadata: Metadata = {
  title: 'MonitoraME',
  description:
    'Plataforma de inteligência territorial e oportunidades de compras públicas.',
  robots: { index: true, follow: true },
};

export default function Home() {
  return <TesteLanding />;
}
