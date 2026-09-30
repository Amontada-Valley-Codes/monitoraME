import type { CheckoutPlan } from './plans';

const PIX_GUI = 'br.gov.bcb.pix';
const DEFAULT_PIX_KEY = 'pagamentos@monitorame.com.br';

function emvField(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function normalizePixText(value: string, maxLength: number) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, maxLength);
}

function crc16Ccitt(value: string) {
  let crc = 0xffff;

  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) !== 0 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function createPixPayload(plan: CheckoutPlan) {
  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY?.trim() || DEFAULT_PIX_KEY;
  const amount = (plan.priceInCents / 100).toFixed(2);
  const transactionId = normalizePixText(`MONITORA${plan.id}`, 25);
  const merchantAccount = [
    emvField('00', PIX_GUI),
    emvField('01', pixKey),
    emvField('02', normalizePixText(`Plano ${plan.name}`, 72)),
  ].join('');

  const additionalData = emvField('05', transactionId);
  const payloadWithoutCrc = [
    emvField('00', '01'),
    emvField('01', '12'),
    emvField('26', merchantAccount),
    emvField('52', '0000'),
    emvField('53', '986'),
    emvField('54', amount),
    emvField('58', 'BR'),
    emvField('59', normalizePixText('MonitoraME', 25)),
    emvField('60', normalizePixText('Fortaleza', 15)),
    emvField('62', additionalData),
    '6304',
  ].join('');

  return `${payloadWithoutCrc}${crc16Ccitt(payloadWithoutCrc)}`;
}
