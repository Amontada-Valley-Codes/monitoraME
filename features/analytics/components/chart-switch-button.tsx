'use client';

import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChartSwitchButton({
  nextView,
  onClick,
  disabled = false,
}: {
  nextView: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      aria-label={`Alternar para ${nextView}`}
      className="min-h-9 gap-2"
      disabled={disabled}
      onClick={onClick}
      variant="outline"
    >
      <ArrowLeftRight aria-hidden="true" />
      <span>{nextView}</span>
    </Button>
  );
}
