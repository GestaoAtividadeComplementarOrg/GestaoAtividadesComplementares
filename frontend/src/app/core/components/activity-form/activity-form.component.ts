import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activity-form.component.html',
})
export class ActivityFormComponent {
  @Input() form!: FormGroup;
  @Input() title = 'Cadastrar Atividade';
  @Input() submitLabel = 'Enviar Atividade';
  @Input() cancelRoute = '/dashboard';
  @Output() submitEmit = new EventEmitter<void>();
}
