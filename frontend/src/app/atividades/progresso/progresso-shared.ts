import { ProgressoCargaHoraria, ProgressoModalidade } from './progresso.model';

export interface ResumoModalidade {
  titulo: string;
  descricao: string;
  dados: ProgressoModalidade;
}

export function calcularResumos(progresso: ProgressoCargaHoraria | null): ResumoModalidade[] {
  if (!progresso) return [];
  return [
    { titulo: 'ACC', descricao: 'Atividades Complementares de Curso', dados: progresso.acc },
    { titulo: 'ACEX', descricao: 'Atividades de Extensão', dados: progresso.acex },
  ];
}

export function calcularSemAtividades(progresso: ProgressoCargaHoraria | null): boolean {
  if (!progresso) return false;
  return (
    progresso.acc.horasAcumuladas +
      progresso.acc.horasPendentes +
      progresso.acex.horasAcumuladas +
      progresso.acex.horasPendentes ===
    0
  );
}

export function percentualExibido(dados: ProgressoModalidade): number {
  return Math.min(100, Math.max(0, dados.percentualConcluido));
}
