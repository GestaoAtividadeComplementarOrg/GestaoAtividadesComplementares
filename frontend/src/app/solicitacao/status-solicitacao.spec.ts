import { describe, it, expect } from 'vitest';
import { rotuloStatus, classeStatus } from './status-solicitacao';

describe('StatusSolicitacao Fallbacks', () => {
  it('deve retornar o próprio valor informado quando o status não for mapeado', () => {
    expect(rotuloStatus('STATUS_INEXISTENTE' as any)).toBe('STATUS_INEXISTENTE');
    expect(classeStatus('STATUS_INEXISTENTE' as any)).toBe('');
  });
});
