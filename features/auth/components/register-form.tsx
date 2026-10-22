"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Eye, EyeOff, IdCard, LoaderCircle, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { Resolver, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authSchema, type AuthFormData, completeAuthSchema, type CompleteAuthFormData } from "../schemas/auth.schema";

type SubmitResult = { error?: string } | void;
type RegisterFormProps =
  | { mode?: "register"; onSubmitAction: (data: AuthFormData) => Promise<SubmitResult>; variant?: "default" | "landing" }
  | { mode: "complete"; onSubmitAction: (data: CompleteAuthFormData) => Promise<SubmitResult> };

const fieldClass = "h-11 rounded-lg bg-background pl-10";

export function RegisterForm(props: RegisterFormProps) {
  const isCompletion = props.mode === "complete";
  const isLanding = "variant" in props && props.variant === "landing";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm<CompleteAuthFormData>({
    resolver: zodResolver(isCompletion ? completeAuthSchema : authSchema) as Resolver<CompleteAuthFormData>,
  });

  const password = useWatch({ control, name: "senha" }) || "";
  const requirements = [
    [password.length >= 8, "8 caracteres"],
    [/[A-Z]/.test(password), "Uma maiúscula"],
    [/[0-9]/.test(password), "Um número"],
    [/[^A-Za-z0-9]/.test(password), "Um símbolo"],
  ] as const;

  const onSubmit = async (data: CompleteAuthFormData) => {
    try {
      setLoading(true);
      const result = await props.onSubmitAction(data);
      if (result?.error) return toast.error(result.error);
      toast.success(isCompletion ? "Cadastro concluído!" : "Conta criada com sucesso!");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto w-full ${isLanding ? "max-w-none" : "max-w-md"}`}>
      <div className="mb-7">
        <span className={`eyebrow ${isLanding ? "text-white/70" : "text-primary"}`}>{isCompletion ? "Última etapa" : "Comece agora"}</span>
        <h2 className={`mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl ${isLanding ? "text-white" : "text-foreground"}`}>{isCompletion ? "Complete seu cadastro." : "Crie sua conta."}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isCompletion ? "Revise seus dados e defina a senha que usará nos próximos acessos." : "Preencha seus dados para acessar as análises e oportunidades do MonitoraME."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={`space-y-3.5 ${isLanding ? "landing-register-form" : ""}`}>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="register-name" label="Nome completo" error={errors.name?.message} icon={<UserRound />}>
            <Input id="register-name" autoComplete="name" placeholder="Seu nome" aria-invalid={Boolean(errors.name)} className={fieldClass} {...register("name")} />
          </Field>
          <Field id="register-cpf" label="CPF" error={errors.cpf?.message} icon={<IdCard />}>
            <Input id="register-cpf" inputMode="numeric" placeholder="000.000.000-00" aria-invalid={Boolean(errors.cpf)} className={fieldClass} {...register("cpf")} />
          </Field>
        </div>

        <Field id="register-email" label="E-mail" error={errors.email?.message} icon={<Mail />}>
          <Input id="register-email" type="email" autoComplete="email" placeholder="seu@email.com" aria-invalid={Boolean(errors.email)} className={fieldClass} {...register("email")} />
        </Field>

        {isCompletion && (
          <Field id="register-phone" label="Telefone com DDD" error={errors.phone?.message} icon={<Phone />}>
            <Input id="register-phone" inputMode="tel" autoComplete="tel" placeholder="(85) 99999-9999" aria-invalid={Boolean(errors.phone)} className={fieldClass} {...register("phone")} />
          </Field>
        )}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <PasswordField id="register-password" label="Senha" visible={showPassword} onToggle={() => setShowPassword((value) => !value)} error={errors.senha?.message}>
            <Input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Crie uma senha" aria-invalid={Boolean(errors.senha)} className="h-11 rounded-lg bg-background px-10" {...register("senha")} />
          </PasswordField>
          <PasswordField id="register-confirm-password" label="Confirmar senha" visible={showConfirmation} onToggle={() => setShowConfirmation((value) => !value)} error={errors.confirmarSenha?.message}>
            <Input id="register-confirm-password" type={showConfirmation ? "text" : "password"} autoComplete="new-password" placeholder="Repita a senha" aria-invalid={Boolean(errors.confirmarSenha)} className="h-11 rounded-lg bg-background px-10" {...register("confirmarSenha")} />
          </PasswordField>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 border border-border/70 bg-muted/35 p-3">
          {requirements.map(([met, label]) => (
            <span key={label} className={`flex items-center gap-1.5 text-[10px] ${met ? "font-semibold text-success" : "text-muted-foreground"}`}>
              <span className={`flex size-3.5 items-center justify-center rounded-full border ${met ? "border-success bg-success text-white" : "border-input"}`}>{met && <Check className="size-2.5" />}</span>
              {label}
            </span>
          ))}
        </div>

        <div>
          <label htmlFor="register-terms" className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-muted-foreground">
            <input id="register-terms" type="checkbox" {...register("termos")} className="mt-0.5 size-4 rounded border-input accent-primary" />
            <span>Li e concordo com os <span className="font-semibold text-foreground underline underline-offset-2">Termos de Uso</span> e a Política de Privacidade.</span>
          </label>
          {errors.termos && <p role="alert" className="mt-1 text-xs text-destructive">{errors.termos.message}</p>}
        </div>

        <Button type="submit" className="h-12 w-full rounded-lg text-sm font-semibold" disabled={loading}>
          {loading ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <>{isCompletion ? "Concluir e acessar" : "Criar conta"}<ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <p className={`mt-5 text-center text-xs ${isLanding ? "text-white/75" : "text-muted-foreground"}`}>Já possui uma conta? <Link href="/login" className={`font-semibold hover:underline ${isLanding ? "text-white" : "text-primary"}`}>Faça login</Link></p>
    </div>
  );
}

function Field({ id, label, error, icon, children }: { id: string; label: string; error?: string; icon: React.ReactElement; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">{icon}</span>{children}</div>{error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}</div>;
}

function PasswordField({ id, label, visible, onToggle, error, children }: { id: string; label: string; visible: boolean; onToggle: () => void; error?: string; children: React.ReactNode }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />{children}<button type="button" onClick={onToggle} aria-label={visible ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}</div>;
}
