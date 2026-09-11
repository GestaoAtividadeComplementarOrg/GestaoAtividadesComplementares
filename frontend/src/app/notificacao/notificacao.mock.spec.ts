import { describe, it, expect } from 'vitest';
import { NOTIFICACOES_MOCK, resetarMocks } from './notificacao.mock';

describe('NotificacaoMock', () => {
  it('deve exportar mock', () => {
    expect(NOTIFICACOES_MOCK).toBeDefined();
    expect(NOTIFICACOES_MOCK.length).toBeGreaterThan(0);
  });

  it('deve resetar mocks', () => {
    resetarMocks();
    expect(NOTIFICACOES_MOCK.length).toBe(5);
  });
});
