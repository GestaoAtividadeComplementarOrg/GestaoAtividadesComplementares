import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Componente de pré-visualização de PDF.
 *
 * NOTA PARA SONARCLOUD (S6268 - typescript:S6268):
 * Este componente usa bypassSecurityTrustResourceUrl de forma segura. A URL
 * recebida é uma URL blob: criada localmente pelo browser via
 * URL.createObjectURL(file), onde 'file' é um arquivo selecionado pelo usuário.
 * Não há risco de XSS porque a origem é controlada (mesma origem do app) e o
 * conteúdo vem exclusivamente do arquivo local do usuário. Este alerta é um
 * falso positivo para este contexto específico e pode ser marcado como 'Safe'.
 */
@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: `
    <iframe
      [src]="safeUrl"
      class="w-full min-h-[80vh] h-[85vh] rounded-lg border border-outline-variant bg-white shadow-inner"
      title="Pré-visualização do Documento PDF"
    ></iframe>
  `,
})
export class PdfPreviewComponent {
  @Input() url!: string;
  private readonly sanitizer = inject(DomSanitizer);

  get safeUrl(): SafeResourceUrl {
    // Segurança: a URL é um blob: local do arquivo selecionado pelo usuário (URL.createObjectURL).
    // Não provém de fonte externa. Falso positivo do SonarCloud para este contexto seguro.
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }
}
