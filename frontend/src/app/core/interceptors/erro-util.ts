import { HttpErrorResponse } from '@angular/common/http';

export function mensagemDoBackend(error: HttpErrorResponse): string | null {
  const corpo: unknown = error.error;
  if (typeof corpo === 'string' && corpo.trim().length > 0) {
    return corpo.trim();
  }
  const mensagem = (corpo as { message?: unknown } | null)?.message;
  if (typeof mensagem === 'string' && mensagem.trim().length > 0) {
    return mensagem.trim();
  }
  return null;
}

export function traduzirErroComum(error: HttpErrorResponse): string | null {
  if (error.status === 401) return 'Sessão expirada. Faça login novamente.';
  if (error.status === 0) return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  return null;
}
