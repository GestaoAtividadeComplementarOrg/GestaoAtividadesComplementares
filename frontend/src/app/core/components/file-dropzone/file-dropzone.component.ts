import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-dropzone',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="border-2 border-dashed border-outline-variant bg-surface-container-lowest rounded-xl p-8 text-center hover:bg-surface-container-low hover:border-primary-container transition-all cursor-pointer relative"
      [ngClass]="{
        'border-primary-container bg-primary-fixed/5': arquivoAnexado,
        'border-error': erroArquivo,
      }"
      (dragover)="dragOverEvent.emit($event)"
      (dragleave)="dragLeaveEvent.emit($event)"
      (drop)="dropEvent.emit($event)"
    >
      @if (!arquivoAnexado) {
        <input
          id="comprovante"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          (change)="fileChange.emit($event)"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div class="flex flex-col items-center gap-3">
          <span class="material-symbols-outlined text-4xl text-primary-container"
            >cloud_upload</span
          >
          <div>
            <p class="font-body-md text-body-md text-on-surface font-medium">
              Arraste e solte seu arquivo aqui
            </p>
            <p class="font-label-sm text-label-sm text-on-surface-variant mt-1">
              ou clique para procurar no computador
            </p>
          </div>
          <p
            class="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full mt-2"
          >
            Aceita apenas PDF, PNG ou JPEG (Máx 5MB)
          </p>
        </div>
      } @else {
        <div
          class="flex items-center justify-between bg-surface-container p-4 rounded-lg z-20 relative"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary-container text-2xl">task</span>
            <div class="text-left">
              <p
                class="font-body-md text-body-md font-medium text-on-surface truncate max-w-[200px] sm:max-w-xs"
              >
                {{ arquivoAnexado ? arquivoAnexado.name : arquivoNome }}
              </p>
              <p class="font-label-sm text-label-sm text-on-surface-variant">
                {{ arquivoTamanho }}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Remover arquivo"
            (click)="remover.emit()"
            class="p-2 text-error hover:bg-error-container rounded-full transition-colors flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[20px]">delete</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class FileDropzoneComponent {
  @Input() arquivoAnexado: File | null = null;
  @Input() arquivoNome = '';
  @Input() arquivoTamanho = '';
  @Input() erroArquivo = false;
  @Output() remover = new EventEmitter<void>();
  @Output() dragOverEvent = new EventEmitter<any>();
  @Output() dragLeaveEvent = new EventEmitter<any>();
  @Output() dropEvent = new EventEmitter<any>();
  @Output() fileChange = new EventEmitter<any>();
}
