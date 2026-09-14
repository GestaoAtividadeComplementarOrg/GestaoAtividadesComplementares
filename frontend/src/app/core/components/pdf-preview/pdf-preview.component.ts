import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  template: '',
})
export class PdfPreviewComponent {
  @Input() set url(value: string) {
    if (value) {
      window.open(value, '_blank');
    }
  }

  get url(): string {
    return '';
  }
}
