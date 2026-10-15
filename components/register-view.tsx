import { AuthPageShell } from "@/components/auth-page-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import type { AuthFormData } from "@/features/auth/schemas/auth.schema";

interface RegisterViewProps {
  onSubmitAction: (data: AuthFormData) => Promise<void>;
}

export function RegisterView({ onSubmitAction }: RegisterViewProps) {
  return (
    <AuthPageShell>
      <RegisterForm onSubmitAction={onSubmitAction} />
    </AuthPageShell>
  );
}
