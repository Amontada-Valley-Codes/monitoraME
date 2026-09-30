"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../schemas/login.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

interface LoginFormProps {
  onSubmitAction: (data: LoginFormData) => Promise<void>;
}

export function LoginForm({ onSubmitAction }: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await onSubmitAction(data);
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Bem-vindo de volta!
        </h2>
        <p className="text-sm text-slate-500">
          Volte a monitorar compras públicas, dados municipais e receba novas propostas
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
          <Input type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Senha</label>
          <Input type="password" placeholder="Sua senha" {...register("senha")} />
          {errors.senha && <span className="text-xs text-red-500 mt-1 block">{errors.senha.message}</span>}
        </div>

        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
          {loading ? "A entrar..." : "Entrar →"}
        </Button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <span className="relative bg-white px-3 text-xs text-slate-400 uppercase">ou</span>
      </div>

      <Button variant="outline" className="w-full mb-6 border-slate-200">
        🌐 Continuar com o Google
      </Button>

      <div className="text-center text-xs text-slate-500">
        Não possui uma conta? <Link href="/register" className="font-semibold text-slate-800 underline">Cadastre-se</Link>
      </div>
    </div>
  );
}
