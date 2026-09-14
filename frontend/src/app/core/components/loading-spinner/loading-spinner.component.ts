import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-[#e1e3e4] p-10 flex flex-col items-center justify-center gap-3 text-[#404945]"
      [ngClass]="customClass"
    >
      <svg
        class="animate-spin h-8 w-8 text-[#003629]"
        [ngClass]="spinnerClass"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-sm">{{ message }}</p>
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = 'Carregando...';
  @Input() spinnerClass = 'h-8 w-8';
  @Input() customClass = '';
}
