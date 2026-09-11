import { describe, it, expect } from 'vitest';
import { dataFormatada } from './solicitacao.helpers';

describe('SolicitacaoHelpers', () => {
  it('deve formatar data', () => {
    expect(dataFormatada('2026-08-20T10:30:00')).toBe('20/08/2026');
    expect(dataFormatada('invalido')).toBe('');
  });
});
