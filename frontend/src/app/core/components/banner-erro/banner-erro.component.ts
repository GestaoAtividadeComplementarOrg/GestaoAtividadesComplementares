import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-erro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="w-full max-w-3xl mb-6 bg-error-container text-on-error-container p-4 rounded-lg flex items-center justify-between shadow-sm"
      id="error-banner"
      role="alert"
      [ngClass]="customClass"
    >
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-error">error</span>
        <span class="font-body-md text-body-md">{{ mensagem }}</span>
      </div>
      @if (fechavel) {
        <button
          aria-label="Fechar alerta"
          class="p-1 hover:bg-error/10 rounded-full transition-colors"
          type="button"
          (click)="fechar.emit()"
        >
          <span class="material-symbols-outlined text-on-error-container">close</span>
        </button>
      }
    </div>
  `,
})
export class BannerErroComponent {
  @Input() mensagem = '';
  @Input() fechavel = false;
  @Input() customClass = '';
  @Output() fechar = new EventEmitter<void>();
}
