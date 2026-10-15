'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { companyDemoFixture, type NotificationItem } from './demo-fixture';
import { deleteNotifications, markAllNotificationsRead, markNotificationRead, unreadNotificationCount, visibleNotifications } from './notification-repository';

const STORAGE_KEY = 'monitorame:demo-notification-read';
type ContextValue = { notifications: NotificationItem[]; unreadCount: number; markRead: (id: string) => void; markAllRead: () => void; deleteMany: (ids: string[]) => void };
const NotificationContext = createContext<ContextValue | null>(null);

export function OpportunityDemoProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => visibleNotifications(companyDemoFixture.notifications.map((item) => ({ ...item }))));
  useEffect(() => {
    try {
      const ids = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
      queueMicrotask(() => setNotifications((items) => items.map((item) => ids.includes(item.id) ? { ...item, read: true } : item)));
    } catch { /* use fixture defaults */ }
  }, []);
  const update = (mutation: (items: NotificationItem[]) => NotificationItem[]) => {
    setNotifications((current) => {
      const next = mutation(current);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next.filter((item) => item.read).map((item) => item.id)));
      return next;
    });
  };
  const value = useMemo<ContextValue>(() => ({
    notifications, unreadCount: unreadNotificationCount(notifications),
    markRead: (id) => update((items) => markNotificationRead(items, id)),
    markAllRead: () => update(markAllNotificationsRead),
    deleteMany: (ids) => update((items) => deleteNotifications(items, ids)),
  }), [notifications]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value) throw new Error('useNotifications must be used within OpportunityDemoProvider');
  return value;
}
