import { companyDemoFixture, type NotificationItem } from './demo-fixture';
import type { Opportunity } from './types';

export type DemoScenario = 'success' | 'loading' | 'empty' | 'error' | 'blocked';
export interface OpportunityRepository {
  listNotifications(): Promise<NotificationItem[]>;
  listOpportunities(): Promise<Opportunity[]>;
}

const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
export const mockOpportunityRepository: OpportunityRepository = {
  async listNotifications() { await pause(); return companyDemoFixture.notifications.map((item) => ({ ...item })); },
  async listOpportunities() { await pause(); return companyDemoFixture.opportunities.map((item) => ({ ...item })); },
};

export const markNotificationRead = (items: NotificationItem[], id: string) =>
  items.map((item) => item.id === id ? { ...item, read: true } : item);
export const markAllNotificationsRead = (items: NotificationItem[]) => items.map((item) => ({ ...item, read: true }));
export const deleteNotifications = (items: NotificationItem[], ids: string[]) =>
  items.filter((item) => !ids.includes(item.id));
export const unreadNotificationCount = (items: NotificationItem[]) => items.filter((item) => !item.read).length;
export const visibleNotifications = (items: NotificationItem[]) => items.filter((item) => item.score === undefined || item.score >= 75);
