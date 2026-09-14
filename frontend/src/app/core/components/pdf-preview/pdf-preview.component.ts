import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: `
    <div class="w-full min-h-[75vh] h-full">
      <iframe
        [src]="safeUrl"
        class="w-full h-full rounded-lg border border-outline-variant bg-white shadow-inner"
        title="Pré-visualização do Documento PDF"
      ></iframe>
    </div>
  `,
})
export class PdfPreviewComponent {
  @Input() url!: string;
  private readonly sanitizer = inject(DomSanitizer);

  get safeUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }
}
