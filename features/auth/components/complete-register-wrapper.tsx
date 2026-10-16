"use client";

import { RegisterForm } from "@/features/auth/components/register-form";
import { CompleteAuthFormData } from "@/features/auth/schemas/auth.schema";
import { AuthPageShell } from "@/components/auth-page-shell";

interface CompleteRegisterWrapperProps {
  onSubmitAction: (data: CompleteAuthFormData) => Promise<{ error?: string } | void>;
}

export function CompleteRegisterWrapper({ onSubmitAction }: CompleteRegisterWrapperProps) {
  return (
    <AuthPageShell completion>
      <RegisterForm mode="complete" onSubmitAction={onSubmitAction} />
    </AuthPageShell>
  );
}
