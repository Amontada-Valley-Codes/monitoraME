"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeOnboardingAction } from "./actions";

const completeSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  password: z.string()
    .min(8, "Mínimo de 8 caracteres")
    .regex(/[A-Z]/, "Letra maiúscula obrigatória")
    .regex(/[0-9]/, "Número obrigatório")
    .regex(/[^A-Za-z0-9]/, "Caractere especial obrigatório"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type CompleteFormData = z.infer<typeof completeSchema>;

export default function OnboardingTokenPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
  });

  useEffect(() => {
    // 1. Extrai o token do hash da URL
    const hash = window.location.hash;
    if (hash.includes("token=")) {
      const extractedToken = hash.split("token=")[1]?.split("&")[0];
      if (extractedToken) {
        setToken(decodeURIComponent(extractedToken));
      }
    }

    // 2. Recupera o e-mail salvo no localStorage e preenche o formulário automaticamente
    const savedEmail = localStorage.getItem("onboarding_email");
    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [setValue]);

  const onSubmit = async (data: CompleteFormData) => {
    if (!token) {
      toast.error("Token de onboarding ausente ou inválido na URL.");
      return;
    }

    try {
      setLoading(true);
      
      // Envia os dados completos com o e-mail preenchido no input
      await completeOnboardingAction(
        {
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          password: data.password,
          phone: localStorage.getItem("onboarding_phone") || "88999999999",
        },
        token
      );

      toast.success("Cadastro concluído com sucesso!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao concluir o onboarding.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Link inválido ou expirado</h2>
          <p className="text-sm text-slate-500 mb-4">
            O token de acesso não foi detetado na URL. Certifique-se de que utilizou o link completo enviado por e-mail.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full bg-slate-900 text-white">
            Ir para o Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Concluir Cadastro</h2>
          <p className="text-sm text-slate-500">
            Confirme seus dados e defina sua senha para ativar sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Nome Completo</label>
            <Input placeholder="Seu nome" {...register("name")} />
            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
            <Input placeholder="seu@email.com" {...register("email")} />
            {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">CPF</label>
            <Input placeholder="000.000.000-00" {...register("cpf")} />
            {errors.cpf && <span className="text-xs text-red-500 mt-1">{errors.cpf.message}</span>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Nova Senha</label>
            <Input type="password" placeholder="Mín. 8 caracteres, maiúsculas, números e símbolos" {...register("password")} />
            {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message}</span>}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Confirmar Senha</label>
            <Input type="password" placeholder="Repita a senha" {...register("confirmPassword")} />
            {errors.confirmPassword && <span className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</span>}
          </div>

          <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2" disabled={loading}>
            {loading ? "A concluir..." : "Ativar Conta →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
