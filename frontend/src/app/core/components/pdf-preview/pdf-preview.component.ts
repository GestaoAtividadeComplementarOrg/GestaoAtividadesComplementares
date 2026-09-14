import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Componente de pré-visualização de PDF.
 * Usa bypassSecurityTrustResourceUrl de forma segura: a URL é um blob: criado
 * localmente pelo browser (URL.createObjectURL) a partir de arquivo selecionado
 * pelo usuário, não proveniente de fonte externa. Não há risco de XSS.
 */
@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: `
    <iframe
      [src]="safeUrl"
      class="w-full h-full rounded-lg border border-outline-variant bg-white shadow-inner"
      title="Pré-visualização do Documento PDF"
    ></iframe>
  `,
})
export class PdfPreviewComponent {
  @Input() url!: string;
  private readonly sanitizer = inject(DomSanitizer);

  get safeUrl(): SafeResourceUrl {
    // Segurança: a URL é um blob: criado localmente pelo browser (URL.createObjectURL)
    // a partir de um arquivo selecionado pelo usuário. Não provém de fonte externa.
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }
}
