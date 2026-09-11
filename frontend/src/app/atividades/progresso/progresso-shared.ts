import { ProgressoModalidade } from './progresso.model';

export interface ResumoModalidade {
  titulo: string;
  descricao: string;
  dados: ProgressoModalidade;
}

export function percentualExibido(dados: ProgressoModalidade): number {
  return Math.min(100, Math.max(0, dados.percentualConcluido));
}
