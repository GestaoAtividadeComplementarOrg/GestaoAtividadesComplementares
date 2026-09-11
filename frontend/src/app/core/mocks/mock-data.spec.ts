import { beforeEach, describe, expect, it } from 'vitest';
import {
  ATIVIDADES_MOCK,
  SOLICITACOES_MOCK,
  REGULAMENTOS_MOCK,
  gerarTokenMock,
  obterProgressoCalculado,
  obterRelatorioCalculado,
  resetarAtividadesMock,
} from './mock-data';

describe('MockData', () => {
  beforeEach(() => {
    resetarAtividadesMock();
  });

  it('deve exportar dados mock', () => {
    expect(ATIVIDADES_MOCK.length).toBeGreaterThan(0);
    expect(SOLICITACOES_MOCK.length).toBeGreaterThan(0);
    expect(REGULAMENTOS_MOCK.length).toBeGreaterThan(0);
  });

  it('deve gerar token mock', () => {
    const token = gerarTokenMock('teste@ufape.edu.br', 'ESTUDANTE');
    expect(token).toContain('.');
  });

  it('deve calcular progresso', () => {
    const progresso = obterProgressoCalculado();
    expect(progresso.acc?.horasExigidas).toBe(90);
  });

  it('deve calcular relatório', () => {
    const relatorio = obterRelatorioCalculado('teste@ufape.edu.br');
    expect(relatorio.estudanteEmail).toBe('teste@ufape.edu.br');
  });
});