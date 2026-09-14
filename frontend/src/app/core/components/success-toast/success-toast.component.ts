import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-surface border-l-4 border-primary-container shadow-lg rounded-r-lg p-4 z-50 flex items-center gap-3"
      [ngClass]="customClass"
    >
      <span class="material-symbols-outlined text-primary-container">check_circle</span>
      <span class="font-body-md text-body-md font-medium">{{ mensagem }}</span>
    </div>
  `,
})
export class SuccessToastComponent {
  @Input() mensagem = 'Operação realizada com sucesso!';
  @Input() customClass = '';
}
