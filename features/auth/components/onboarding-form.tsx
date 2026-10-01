"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

const onboardingSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onSubmitAction: (data: OnboardingFormData) => Promise<void>;
}

export function OnboardingForm({ onSubmitAction }: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const handleFormSubmit = async (data: OnboardingFormData) => {
    try {
      setLoading(true);
      await onSubmitAction(data);
      toast.success("Link de ativação enviado! Verifique o seu e-mail.");
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao iniciar o onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Iniciar Cadastro
        </h2>
        <p className="text-sm text-slate-500">
          Informe seus dados básicos para receber o link de acesso seguro.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Nome Completo</label>
          <Input placeholder="Seu nome" {...register("name")} />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
          <Input type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Telefone (com DDD)</label>
          <Input placeholder="+55 (88) 99999-9999" {...register("phone")} />
          {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
        </div>

        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
          {loading ? "A enviar..." : "Continuar com Onboarding →"}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-6">
        Já tem uma conta? <Link href="/login" className="font-semibold text-slate-800 underline">Faça login</Link>
      </div>
    </div>
  );
}
