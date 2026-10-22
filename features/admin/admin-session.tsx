'use client';

import { createContext, useContext, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical } from 'lucide-react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ADMIN_DEMO_PROFILES, ADMIN_DEMO_ROLE_COOKIE } from './rules';
import type { AdminRole } from './types';

type AdminSession = { role: AdminRole; demo: boolean };
const AdminSessionContext = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ role, demo, children }: AdminSession & { children: ReactNode }) {
  return <AdminSessionContext value={{ role, demo }}>{children}</AdminSessionContext>;
}

export function useAdminSession() {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error('useAdminSession deve ser usado dentro de AdminSessionProvider');
  return value;
}

/** Disponível apenas na sessão demonstrativa de desenvolvimento. */
export function AdminDemoProfileSwitcher({ value }: { value: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      Perfil da demonstração
      <NativeSelect
        size="sm"
        value={value}
        disabled={pending}
        onChange={(event) => {
          document.cookie = `${ADMIN_DEMO_ROLE_COOKIE}=${event.target.value}; path=/; SameSite=Lax`;
          startTransition(() => router.refresh());
        }}
      >
        {ADMIN_DEMO_PROFILES.map((profile) => (
          <NativeSelectOption key={profile.value} value={profile.value}>{profile.label}</NativeSelectOption>
        ))}
      </NativeSelect>
    </label>
  );
}

export function AdminDemoBanner({ profile }: { profile: string }) {
  return (
    <div className="mx-auto mb-5 flex max-w-[1480px] flex-wrap items-center gap-3 rounded-xl border border-dashed bg-card px-4 py-3">
      <FlaskConical className="size-4 text-warning" aria-hidden />
      <p className="mr-auto text-xs text-muted-foreground">
        <b className="font-semibold text-foreground">Sessão demonstrativa</b> · disponível só em desenvolvimento. Em produção, o perfil vem do login.
      </p>
      <AdminDemoProfileSwitcher value={profile} />
    </div>
  );
}
