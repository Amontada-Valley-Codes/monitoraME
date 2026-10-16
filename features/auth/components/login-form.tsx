'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginFormData } from '../schemas/login.schema';

interface LoginFormProps {
  onSubmitAction: (data: LoginFormData) => Promise<void>;
}

export function LoginForm({ onSubmitAction }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await onSubmitAction(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-9">
        <span className="eyebrow text-primary">Acesso à plataforma</span>
        <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Bem-vindo de volta.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Entre para acompanhar oportunidades e analisar as compras públicas do seu território.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-xs font-semibold text-foreground">E-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              aria-invalid={Boolean(errors.email)}
              className="h-12 rounded-lg bg-background pl-11"
              {...register('email')}
            />
          </div>
          {errors.email && <p role="alert" className="mt-2 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-foreground">Senha</label>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              aria-invalid={Boolean(errors.password)}
              className="h-12 rounded-lg bg-background px-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p role="alert" className="mt-2 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="h-12 w-full rounded-lg text-sm font-semibold" disabled={loading}>
          {loading ? <><LoaderCircle className="size-4 animate-spin" />Entrando...</> : <>Acessar plataforma <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Novo por aqui?</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button asChild variant="outline" className="h-12 w-full rounded-lg bg-card text-sm">
        <Link href="/register">Criar uma conta gratuita <ArrowRight className="size-4" /></Link>
      </Button>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Precisa apenas consultar informações?{' '}
        <Link href="/analitico" className="font-semibold text-primary hover:underline">Acesse os dados públicos</Link>
      </p>
    </div>
  );
}
