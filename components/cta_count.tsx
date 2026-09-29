"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamUpgradeModal({
  open,
  onOpenChange,
}: TeamUpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[80vh] w-[calc(100%-24px)] max-w-[1400px] overflow-y-auto border-0 bg-background p-0 shadow-2xl sm:w-[calc(100%-40px)] sm:max-w-[900px]"
      >
        {/* Botão fechar */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Conteúdo */}
        <div className="px-6 pb-7 pt-6 sm:px-8">
          {/* Cabeçalho */}
          <DialogTitle className="max-w-[700px] mt-5 text-xl font-bold leading-tight tracking-tight sm:text-[22px] text-base">
            Crie sua conta gratuitamente e desbloqueie
            a visualização de dados municipais
          </DialogTitle>

          <p className="mt-2 max-w-[550px] text-[10px] sm:text-xs leading-5 text-muted-foreground">
            Crie sua conta para começar a explorar o MonitoraME e conhecer
            recursos avançados para acompanhar e gerenciar sua equipe.
          </p>

          <div className="mt-5 h-px bg-border" />

          {/* Conteúdo principal */}
          <div className="flex flex-col items-stretch gap-12 mt-4 sm:mt-0 sm:flex-row sm:items-start sm:p-4">
            {/* LADO ESQUERDO */}
            <div className="min-w-0 flex-1">
              <div className="rounded-xl bg-muted/40">
                <h2 className="text-sm font-semibold sm:text-base">
                  Visualização de dados municipais
                </h2>

                <p className="mt-1 max-w-[500px] text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                  Acompanhe licitações e contratos com informações claras e acessíveis.
                </p>

                {/* Preview */}
                <div className="mt-3 overflow-hidden rounded-lg bg-background p-2.5 sm:mt-2 sm:p-3">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src="/project/monitoraMe_analytics.png"
                      alt="Visualização de dados municipais do MonitoraME"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LADO DIREITO */}
            <div className="min-w-0 flex-1 sm:flex-[0.8]">
              {/* Título */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold sm:text-[18px]">
                  Conheça o MonitoraME
                </h2>

                <span className="shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 sm:text-xs">
                  Gratuito
                </span>
              </div>

              <p className="mt-1.5 max-w-[320px] text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                Tenha acesso a informações públicas de forma simples, organizada e
                transparente.
              </p>

              {/* Criar conta */}
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/register";
                }}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-violet-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-violet-700 sm:mt-5"
              >
                Criar uma conta
              </button>

              <p className="mt-2 text-center text-[10px] text-muted-foreground sm:text-[11px]">
                Já possui uma conta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="font-medium text-violet-600 hover:underline"
                >
                  Entrar
                </button>
              </p>

              {/* Benefícios */}
              <div className="mt-5 space-y-2.5 sm:space-y-3">
                <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  <span className="leading-4 sm:leading-5">
                    Informações públicas claras e organizadas.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  <span className="leading-4 sm:leading-5">
                    Dados baseados em fontes públicas e confiáveis.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  <span className="leading-4 sm:leading-5">
                    Consulte licitações, empresas e municípios.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  <span className="leading-4 sm:leading-5">
                    Visualize dados de forma simples.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-[11px] sm:text-xs">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                  <span className="leading-4 sm:leading-5">
                    Acompanhe informações públicas em um só lugar.
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t pt-4">
            <p className="text-center text-[10px] leading-4 text-muted-foreground">
              Comece gratuitamente e explore as informações disponíveis no
              MonitoraME.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}