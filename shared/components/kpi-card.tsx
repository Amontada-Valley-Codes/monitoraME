import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function KpiCard({
  label,
  value,
  detail,
  change,
  icon: Icon,
  sizeScope = 'Todos',
  highlight = false,
  inverse = false,
  tone = 'slate',
}: {
  label: string;
  value: string;
  detail: string;
  change: number | null;
  icon: LucideIcon;
  sizeScope?: string;
  originScope?: string;
  highlight?: boolean;
  inverse?: boolean;
  tone?: 'slate' | 'blue' | 'teal' | 'violet' | 'amber';
}) {
  void change;
  void inverse;

  const tones = {
    slate: 'bg-card',
    blue: 'border-primary/25 bg-[#eef4ff] dark:bg-primary/10',
    teal: 'border-[#8fc8bd]/60 bg-[#eef8f5] dark:bg-[#14332f]',
    violet: 'border-[#c7b7e8]/60 bg-[#f5f1fb] dark:bg-[#29213b]',
    amber: 'border-[#dfc494]/60 bg-[#fbf6eb] dark:bg-[#372b17]',
  } as const;

  return (
    <Card
      className={`min-h-40 gap-0 overflow-hidden py-0 shadow-none ${tones[tone]} ${highlight ? 'border-primary/30' : ''}`}
    >
      <CardContent className="flex min-h-40 flex-col p-0">
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-muted-foreground">
              {label}
            </p>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${
                highlight
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : tone === 'teal'
                    ? 'border-[#8fc8bd]/60 bg-[#dcefe9] text-[#176b5d] dark:bg-[#205047] dark:text-[#8dd7c7]'
                    : tone === 'violet'
                      ? 'border-[#c7b7e8]/60 bg-[#e9e0f7] text-[#6846a3] dark:bg-[#3a2e53] dark:text-[#c9afea]'
                      : tone === 'amber'
                        ? 'border-[#dfc494]/60 bg-[#f3e7cf] text-[#8a5b12] dark:bg-[#4a381c] dark:text-[#efc778]'
                        : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <Icon className="size-4" />
            </span>
          </div>
          <div
            className={`metric mt-4 whitespace-nowrap text-3xl xl:text-[2.125rem] ${
              highlight ? 'text-primary' : ''
            }`}
          >
            {value}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <p className="border-t bg-muted/20 px-5 py-2.5 text-xs text-muted-foreground">
          Porte: {sizeScope}
        </p>
      </CardContent>
    </Card>
  );
}
