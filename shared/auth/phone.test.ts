import { describe, expect, it } from 'vitest';
import { isValidBrazilianPhone, normalizeBrazilianPhone } from './phone';

describe('telefone brasileiro', () => {
  it.each([
    ['(85) 99999-1234', '85999991234'],
    ['55 85 99999-1234', '85999991234'],
    ['85 3333-1234', '8533331234'],
  ])('normaliza %s', (input, output) => expect(normalizeBrazilianPhone(input)).toBe(output));

  it('aceita 10 ou 11 digitos e rejeita outros tamanhos', () => {
    expect(isValidBrazilianPhone('8533331234')).toBe(true);
    expect(isValidBrazilianPhone('85999991234')).toBe(true);
    expect(isValidBrazilianPhone('999')).toBe(false);
  });
});

