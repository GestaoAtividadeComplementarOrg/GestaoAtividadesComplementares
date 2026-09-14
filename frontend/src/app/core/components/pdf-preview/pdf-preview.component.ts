import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: `
    <iframe
      [src]="url"
      class="w-full h-full rounded-lg border border-outline-variant bg-white shadow-inner"
      title="Pré-visualização do Documento PDF"
    ></iframe>
  `,
})
export class PdfPreviewComponent {
  private _url = '';

  @Input()
  set url(value: string) {
    this._url = this.isValidPdfUrl(value) ? value : '';
  }

  get url(): string {
    return this._url;
  }

  private isValidPdfUrl(value: string): boolean {
    if (!value) {
      return false;
    }

    try {
      const parsed = new URL(value);

      return (
        parsed.protocol === 'blob:' &&
        parsed.origin === window.location.origin
      );
    } catch {
      return false;
    }
  }
}
