"use client";

import { RegisterForm } from "@/features/auth/components/register-form";
import { CompleteAuthFormData } from "@/features/auth/schemas/auth.schema";

interface CompleteRegisterWrapperProps {
  onSubmitAction: (data: CompleteAuthFormData) => Promise<{ error?: string } | void>;
}

export function CompleteRegisterWrapper({ onSubmitAction }: CompleteRegisterWrapperProps) {
  return <RegisterForm mode="complete" onSubmitAction={onSubmitAction} />;
}
