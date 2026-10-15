import { describe, expect, it } from 'vitest';
import { companyDemoFixture } from './demo-fixture';
import { deleteNotifications, markAllNotificationsRead, markNotificationRead, unreadNotificationCount, visibleNotifications } from './notification-repository';

describe('notification repository demo rules', () => {
  it('keeps an immediate individual match with score >= 90 and confidence >= 70', () => {
    const item = companyDemoFixture.notifications.find((notification) => notification.id === 'n2');
    expect(item).toMatchObject({ priority: 'immediate', score: 96, confidence: 88 });
    expect('groupCount' in (item ?? {})).toBe(false);
    expect(item?.destination.href).toBe('/oportunidades/ti-fortaleza-2026');
  });

  it('represents the 75-89 range as one grouped notification', () => {
    const grouped = companyDemoFixture.notifications.filter((item) => item.priority === 'grouped');
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({ id: 'g1', groupCount: 4, score: 84 });
  });

  it('updates read and unread state without mutating the fixture', () => {
    const items = companyDemoFixture.notifications.map((item) => ({ ...item }));
    const count = unreadNotificationCount(items);
    const readOne = markNotificationRead(items, 'n1');
    expect(unreadNotificationCount(readOne)).toBe(count - 1);
    expect(items.find((item) => item.id === 'n1')?.read).toBe(false);
    expect(unreadNotificationCount(markAllNotificationsRead(items))).toBe(0);
  });

  it('deletes selected notifications without mutating the source', () => {
    const items = companyDemoFixture.notifications.map((item) => ({ ...item }));
    const remaining = deleteNotifications(items, ['n1', 'n2']);
    expect(remaining.some((item) => item.id === 'n1' || item.id === 'n2')).toBe(false);
    expect(remaining).toHaveLength(items.length - 2);
    expect(items).toHaveLength(companyDemoFixture.notifications.length);
  });

  it('supports an empty result and filters scores below the notification threshold', () => {
    expect(visibleNotifications([])).toEqual([]);
    const belowThreshold = { ...companyDemoFixture.notifications[1], id: 'low', score: 74 };
    expect(visibleNotifications([belowThreshold])).toEqual([]);
  });

  it('uses a safe current destination for stale events', () => {
    const stale = companyDemoFixture.notifications.find((item) => item.stale);
    expect(stale?.destination).toEqual({ kind: 'portfolio', href: '/oportunidades', label: 'Consultar oportunidades atuais' });
  });
});
