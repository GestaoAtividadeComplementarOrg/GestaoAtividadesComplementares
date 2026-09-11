import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressoModalidade } from './progresso.model';
import { percentualExibido } from '../progresso/progresso-shared';

@Component({
  selector: 'app-progresso-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#e1e3e4] p-6 relative overflow-hidden"
    >
      <div class="flex justify-between items-start mb-1">
        <h2 class="text-lg font-bold text-[#191c1d]">{{ titulo }}</h2>
        @if (dados.horasPendentes > 0) {
          <span
            class="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#fff8e1] text-[#b78103] border border-[#ffe082] px-2.5 py-0.5 rounded-full"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#b78103] animate-pulse"></span>
            {{ dados.horasPendentes }}h em análise
          </span>
        }
      </div>
      <p class="text-xs text-[#404945] mb-4">{{ descricao }}</p>

      <div
        class="grid grid-cols-4 gap-1 text-center mb-4 bg-[#f8f9fa] p-3 rounded-lg border border-[#e1e3e4]"
      >
        <div>
          <p class="text-base font-bold text-[#003629]">{{ dados.horasAcumuladas }}h</p>
          <p class="text-[9px] uppercase tracking-wider text-[#707974] font-semibold">Aprovadas</p>
        </div>
        <div>
          <p class="text-base font-bold text-[#b78103]">{{ dados.horasPendentes }}h</p>
          <p class="text-[9px] uppercase tracking-wider text-[#707974] font-semibold">Em Análise</p>
        </div>
        <div>
          <p class="text-base font-bold text-[#191c1d]">{{ dados.horasExigidas }}h</p>
          <p class="text-[9px] uppercase tracking-wider text-[#707974] font-semibold">Exigidas</p>
        </div>
        <div>
          <p class="text-base font-bold text-[#404945]">{{ dados.horasRestantes }}h</p>
          <p class="text-[9px] uppercase tracking-wider text-[#707974] font-semibold">Restantes</p>
        </div>
      </div>

      <div
        class="w-full h-3 bg-[#f3f4f5] rounded-full overflow-hidden flex"
        role="progressbar"
        [attr.aria-valuenow]="percentualExibido(dados)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full bg-[#003629] rounded-full transition-all"
          [style.width.%]="percentualExibido(dados)"
          title="Aprovado"
        ></div>
      </div>

      <div class="flex justify-between items-center mt-2 text-xs text-[#404945]">
        <span class="text-[11px] text-[#707974]">
          @if (dados.horasPendentes > 0) {
            Contém {{ dados.horasPendentes }}h aguardando validação
          } @else {
            Nenhuma atividade pendente
          }
        </span>
        <span class="font-bold text-[#003629]">{{ percentualExibido(dados) }}% concluído</span>
      </div>
    </div>
  `,
})
export class ProgressoCardComponent {
  @Input() titulo = '';
  @Input() descricao = '';
  @Input() dados!: ProgressoModalidade;

  readonly percentualExibido = percentualExibido;
}
