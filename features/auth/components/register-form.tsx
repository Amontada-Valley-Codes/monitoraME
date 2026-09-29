"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, AuthFormData } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface RegisterFormProps {
  onSubmitAction: (data: AuthFormData) => Promise<void>;
}

export function RegisterForm({ onSubmitAction }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const senhaValue = watch("senha", "");

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3}).*/, "$1.$2");
    }

    setValue("cpf", value, { shouldValidate: true });
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { text: "", color: "bg-slate-200", width: "w-0" };
    if (pass.length < 8) return { text: "Muito curta", color: "bg-red-500", width: "w-1/4" };
    if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { text: "Média (adicione maiúsculas/números)", color: "bg-yellow-500", width: "w-2/4" };
    return { text: "Senha forte", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength(senhaValue);

  const handleFormSubmit = async (data: AuthFormData) => {
    console.log("1. Formulário submetido com sucesso pelo Zod:", data);
    try {
      setLoading(true);
      await onSubmitAction(data);
      console.log("2. Ação onSubmitAction executada com sucesso!");
    } catch (error) {
      console.error("❌ Erro capturado na submissão:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função disparada se houver erros de validação do Zod ao tentar enviar
  const onInvalid = (errors: any) => {
    console.warn("⚠️ Validação do Zod impediu o envio. Campos com erro:", errors);
  };

  const cpfRegistration = register("cpf");

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Criar conta
        </h2>
        <p className="text-sm text-slate-500">
          Crie sua conta para ganhar acesso a detalhes municipais e outras funcionalidades
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Nome completo</label>
          <Input placeholder="Seu nome" {...register("name")} />
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">CPF</label>
          <Input 
            placeholder="000.000.000-00" 
            {...cpfRegistration}
            onChange={(e) => {
              cpfRegistration.onChange(e);
              handleCpfChange(e);
            }}
          />
          {errors.cpf && <span className="text-xs text-red-500 mt-1 block">{errors.cpf.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">E-mail</label>
          <Input type="email" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Senha</label>
          <Input type="password" placeholder="Mínimo 8 caracteres" {...register("senha")} />
          {senhaValue && (
            <div className="mt-1">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">{strength.text}</span>
            </div>
          )}
          {errors.senha && <span className="text-xs text-red-500 mt-1 block">{errors.senha.message}</span>}
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Confirmar Senha</label>
          <Input type="password" placeholder="Repita a senha" {...register("confirmarSenha")} />
          {errors.confirmarSenha && <span className="text-xs text-red-500 mt-1 block">{errors.confirmarSenha.message}</span>}
        </div>

        <div className="flex items-center space-x-2 py-1">
          <Checkbox id="termos" {...register("termos")} />
          <label htmlFor="termos" className="text-xs text-slate-600 cursor-pointer">
            Concordo com os Termos de Uso e Política de Privacidade.
          </label>
        </div>
        {errors.termos && <span className="text-xs text-red-500 block">{errors.termos.message}</span>}

        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
          {loading ? "A cadastrar..." : "Cadastrar →"}
        </Button>
      </form>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <span className="relative bg-white px-3 text-xs text-slate-400 uppercase">ou</span>
      </div>

      <Button variant="outline" className="w-full mb-4 border-slate-200">
        🌐 Continuar com o Google
      </Button>

      <div className="text-center text-xs text-slate-500">
        Já possui uma conta? <Link href="/login" className="font-semibold text-slate-800 underline">Entrar</Link>
      </div>
    </div>
  );
}
