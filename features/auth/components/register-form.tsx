"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, AuthFormData } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionResult } from "@/components/register-view";

interface RegisterFormProps {
  onSubmitAction: (data: AuthFormData) => Promise<ActionResult>;
}

export function RegisterForm({ onSubmitAction }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      termos: false as unknown as true,
    },
  });

  const senhaValue = watch("senha") || "";

  const hasMinLen = senhaValue.length >= 8;
  const hasUpper = /[A-Z]/.test(senhaValue);
  const hasNumber = /[0-9]/.test(senhaValue);
  const hasSpecial = /[^A-Za-z0-9]/.test(senhaValue);

  const handleFormSubmit = async (data: AuthFormData) => {
    try {
      setLoading(true);
      const result = await onSubmitAction(data);

      if (result && !result.success && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "Ocorreu um erro ao criar a conta.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Criar Conta
        </h2>
        <p className="text-sm text-slate-500">
          Registe-se para aceder ao portal municipal e monitorar dados
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Nome Completo</label>
          <Input placeholder="Seu nome" {...register("name")} />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">CPF</label>
          <Input placeholder="000.000.000-00" {...register("cpf")} />
          {errors.cpf && <span className="text-xs text-red-500 mt-1 block">{errors.cpf.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
          <Input type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Senha</label>
          <Input type="password" placeholder="Mínimo 8 caracteres, maiúsculas, números e símbolos" {...register("senha")} />
          
          <div className="mt-2 space-y-1 text-xs">
            <p className="text-slate-600 font-medium">Requisitos para senha forte:</p>
            <div className="grid grid-cols-2 gap-1 text-slate-500">
              <span className={hasMinLen ? "text-green-600 font-semibold" : "text-slate-400"}>
                {hasMinLen ? "✓" : "○"} Mínimo 8 caracteres
              </span>
              <span className={hasUpper ? "text-green-600 font-semibold" : "text-slate-400"}>
                {hasUpper ? "✓" : "○"} Letra maiúscula
              </span>
              <span className={hasNumber ? "text-green-600 font-semibold" : "text-slate-400"}>
                {hasNumber ? "✓" : "○"} Número
              </span>
              <span className={hasSpecial ? "text-green-600 font-semibold" : "text-slate-400"}>
                {hasSpecial ? "✓" : "○"} Caractere especial (!@#$)
              </span>
            </div>
          </div>

          {errors.senha && <span className="text-xs text-red-500 mt-1 block">{errors.senha.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Confirmar Senha</label>
          <Input type="password" placeholder="Confirme sua senha" {...register("confirmarSenha")} />
          {errors.confirmarSenha && <span className="text-xs text-red-500 mt-1 block">{errors.confirmarSenha.message}</span>}
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <input type="checkbox" id="termos" {...register("termos")} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
          <label htmlFor="termos" className="text-xs text-slate-600">
            Concordo com os <span className="font-semibold underline">Termos de Uso</span>
          </label>
        </div>
        {errors.termos && <span className="text-xs text-red-500 block">{errors.termos.message}</span>}

        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 mt-2" disabled={loading}>
          {loading ? "A criar conta..." : "Criar Conta →"}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-6">
        Já possui uma conta? <Link href="/login" className="font-semibold text-slate-800 underline">Faça login</Link>
      </div>
    </div>
  );
}