import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: `
    <div class="w-full min-h-[80vh] h-[85vh]">
      <object
        [data]="url"
        type="application/pdf"
        class="w-full h-full rounded-lg border border-outline-variant bg-white shadow-inner"
      >
        <p>Seu navegador não suporta a visualização de PDFs.</p>
      </object>
    </div>
  `,
})
export class PdfPreviewComponent {
  @Input() url = '';
}
