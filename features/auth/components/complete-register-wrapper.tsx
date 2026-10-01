"use client";

import { useEffect, useState } from "react";
import { RegisterForm } from "@/features/auth/components/register-form";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";

interface CompleteRegisterWrapperProps {
  onSubmitAction: (data: AuthFormData, token: string) => Promise<void>;
}

export function CompleteRegisterWrapper({ onSubmitAction }: CompleteRegisterWrapperProps) {
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const extractedToken = params.get("token");

    if (extractedToken) {
      setToken(extractedToken);
    } else {
      setError("Token de onboarding em falta ou inválido na URL (#token=...).");
    }
  }, []);

  const handleSubmit = async (data: AuthFormData) => {
    if (!token) {
      throw new Error("Token de onboarding ausente.");
    }
    await onSubmitAction(data, token);
  };

  if (error) {
    return (
      <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-md">
        {error}
      </div>
    );
  }

  return <RegisterForm onSubmitAction={handleSubmit} />;
}
