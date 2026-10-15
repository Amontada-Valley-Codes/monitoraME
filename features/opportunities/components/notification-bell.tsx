'use client';

import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '../notification-context';
import { NotificationRow } from './notification-item';

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notificações, ${unreadCount} não lidas`}
        >
          <Bell className="size-4" />

          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(26rem,calc(100vw-1rem))] p-0"
      >
        <div className="relative flex items-center justify-between border-b p-4">
          <div className="text-center">
            <h2 className="font-semibold mb-1">Notificações</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount} não lidas · dados demonstrativos
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2"
            disabled={!unreadCount}
            onClick={markAllRead}
          >
            <CheckCheck className="size-4" />
            Marcar todas
          </Button>
        </div>

        <ScrollArea className="h-[25rem]">
          {notifications.slice(0, 4).map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              compact
            />
          ))}
        </ScrollArea>

        <div className="border-t p-3">
          <Button asChild className="w-full" variant="outline">
            <Link href="/oportunidades/notificacoes">
              Abrir central de notificações
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}