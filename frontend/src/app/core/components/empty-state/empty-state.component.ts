import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="mb-6 p-4 bg-[#f3f4f5] text-[#404945] rounded-lg border border-[#c0c9c3]/40 text-sm flex items-center gap-3"
      [ngClass]="customClass"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 text-[#003629] shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ mensagem }}</span>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() mensagem = 'Nenhum item encontrado.';
  @Input() customClass = '';
}
