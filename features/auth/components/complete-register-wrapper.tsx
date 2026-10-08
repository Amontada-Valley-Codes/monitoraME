"use client";

import { RegisterForm } from "@/features/auth/components/register-form";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";

interface CompleteRegisterWrapperProps {
  onSubmitAction: (data: AuthFormData) => Promise<void>;
}

export function CompleteRegisterWrapper({ onSubmitAction }: CompleteRegisterWrapperProps) {
  return <RegisterForm onSubmitAction={onSubmitAction} />;
}
