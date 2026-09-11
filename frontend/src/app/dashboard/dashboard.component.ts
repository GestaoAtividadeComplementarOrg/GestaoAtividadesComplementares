import { SituacaoSolicitacaoComponent } from './situacao-solicitacao/situacao-solicitacao.component';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressoCargaHoraria } from '../atividades/progresso/progresso.model';
import { ProgressoService } from '../atividades/progresso/progresso.service';
import { ResumoModalidade, percentualExibido } from '../atividades/progresso/progresso-shared';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SituacaoSolicitacaoComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly progressoService = inject(ProgressoService);

  readonly carregando = signal(true);
  readonly mensagemErro = signal<string | null>(null);
  readonly progresso = signal<ProgressoCargaHoraria | null>(null);

  readonly resumos = computed<ResumoModalidade[]>(() => {
    const progresso = this.progresso();
    if (!progresso) {
      return [];
    }
    return [
      { titulo: 'ACC', descricao: 'Atividades Complementares de Curso', dados: progresso.acc },
      { titulo: 'ACEX', descricao: 'Atividades de Extensão', dados: progresso.acex },
    ];
  });

  readonly semAtividades = computed<boolean>(() => {
    const progresso = this.progresso();
    if (!progresso) {
      return false;
    }
    return (
      progresso.acc.horasAcumuladas +
        progresso.acc.horasPendentes +
        progresso.acex.horasAcumuladas +
        progresso.acex.horasPendentes ===
      0
    );
  });

  ngOnInit(): void {
    this.buscarProgresso();
  }

  tentarNovamente(): void {
    this.buscarProgresso();
  }

  percentualExibido = percentualExibido;

  private buscarProgresso(): void {
    this.carregando.set(true);
    this.mensagemErro.set(null);

    this.progressoService.obterProgresso().subscribe({
      next: (progresso) => {
        this.progresso.set(progresso);
        this.carregando.set(false);
      },
      error: (erro: Error) => {
        this.mensagemErro.set(erro.message);
        this.carregando.set(false);
      },
    });
  }
}
