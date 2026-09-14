import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visivel) {
      <p class="font-label-sm text-label-sm text-error mt-1 flex items-center gap-1">
        <span class="material-symbols-outlined text-[16px]">error</span>
        {{ mensagem }}
      </p>
    }
  `,
})
export class FormErrorComponent {
  @Input() visivel = false;
  @Input() mensagem = '';
}
