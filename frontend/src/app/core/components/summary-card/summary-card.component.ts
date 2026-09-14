import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#e1e3e4] p-6"
    >
      <div class="flex justify-between items-start mb-1">
        <h2 class="text-lg font-bold text-[#191c1d]">{{ titulo }}</h2>
        @if (horasPendentes > 0) {
          <span
            class="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#fff8e1] text-[#b78103] border border-[#ffe082] px-2.5 py-0.5 rounded-full"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-[#b78103]"></span>
            {{ horasPendentes }}h em análise
          </span>
        }
      </div>
      <p class="text-xs text-[#404945] mb-4">{{ descricao }}</p>
      <p class="text-sm text-[#404945] mb-3">
        <span class="text-2xl font-bold text-[#003629]">{{ horasAcumuladas }}h</span>
        <span class="text-[#707974]"> de {{ horasExigidas }}h exigidas</span>
      </p>
      <progress
        class="w-full h-3 bg-[#f3f4f5] rounded-full overflow-hidden"
        [attr.aria-label]="'Progresso de ' + titulo"
        [attr.value]="percentual"
        min="0"
        max="100"
      >
        <div
          class="h-full bg-[#003629] rounded-full transition-all"
          [style.width.%]="percentual"
        ></div>
      </progress>
      <div class="flex justify-between items-center mt-2 text-xs text-[#404945]">
        <span class="text-[11px] text-[#707974]">Faltam {{ horasRestantes }}h</span>
        <span class="font-bold text-[#003629]">{{ percentual }}% concluído</span>
      </div>
    </div>
  `,
})
export class SummaryCardComponent {
  @Input() titulo = '';
  @Input() descricao = '';
  @Input() horasAcumuladas = 0;
  @Input() horasExigidas = 0;
  @Input() horasRestantes = 0;
  @Input() horasPendentes = 0;
  @Input() percentual = 0;
}
