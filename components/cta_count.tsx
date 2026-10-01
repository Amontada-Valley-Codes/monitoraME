'use client';

import { Check, LockKeyhole, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { CTA_CONTENT } from '@/components/cta-content';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { RestrictedFeature } from '@/shared/config/access';

interface TeamUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasAccount: boolean;
  feature?: RestrictedFeature;
}

export function TeamUpgradeModal({ open, onOpenChange, hasAccount, feature }: TeamUpgradeModalProps) {
  const router = useRouter();
  const content = CTA_CONTENT[hasAccount ? 'choosePlan' : 'createAccount'];

  const navigate = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[80vh] w-[calc(100%-24px)] max-w-350 overflow-y-auto border-0 bg-background p-0 shadow-2xl sm:w-[calc(100%-40px)] sm:max-w-225"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={content.closeLabel}
        >
          <X className="size-4" />
        </button>

        <div className="px-6 pb-7 pt-6 sm:px-8">
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <LockKeyhole className="size-3.5" aria-hidden="true" />
            Recurso da assinatura
          </div>

          <DialogTitle className="mt-4 max-w-175 text-xl font-bold leading-tight tracking-tight sm:text-[22px]">
            {feature ? `${feature.name} amplia sua visão dos dados` : content.title}
          </DialogTitle>

          <DialogDescription className="mt-2 max-w-150 text-xs leading-5 sm:text-sm">
            {feature?.description ?? content.description}
          </DialogDescription>

          <div className="mt-5 h-px bg-border" />

          <div className="mt-4 flex flex-col items-stretch gap-12 sm:mt-0 sm:flex-row sm:items-start sm:p-4">
            <div className="min-w-0 flex-1">
              <div className="rounded-xl bg-muted/40">
                <h2 className="text-sm font-semibold sm:text-base">{content.preview.title}</h2>
                <p className="mt-1 max-w-125 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                  {content.preview.description}
                </p>

                <div className="mt-3 overflow-hidden rounded-lg bg-background sm:mt-2">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={content.preview.image}
                      alt={content.preview.imageAlt}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 sm:flex-[0.8]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold sm:text-[18px]">{content.offer.title}</h2>
                <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-primary sm:text-xs">
                  {content.offer.badge}
                </span>
              </div>

              <p className="mt-1.5 max-w-80 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
                {content.offer.description}
              </p>

              <button
                type="button"
                onClick={() => navigate(content.offer.primaryAction.href)}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/80 sm:mt-5"
              >
                {content.offer.primaryAction.label}
              </button>

              {content.offer.secondaryAction && (
                <p className="mt-2 text-center text-[10px] text-muted-foreground sm:text-[11px]">
                  {content.offer.secondaryAction.prefix}{' '}
                  <button
                    type="button"
                    onClick={() => navigate(content.offer.secondaryAction!.href)}
                    className="font-medium text-primary hover:underline"
                  >
                    {content.offer.secondaryAction.label}
                  </button>
                </p>
              )}

              <div className="mt-5 space-y-2.5 sm:space-y-3">
                {content.offer.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 text-[11px] sm:text-xs">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="leading-4 sm:leading-5">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-center text-[10px] leading-4 text-muted-foreground">{content.footer}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
