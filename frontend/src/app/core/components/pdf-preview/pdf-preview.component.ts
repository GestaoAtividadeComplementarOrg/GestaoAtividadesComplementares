import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'assets/pdf-js/pdf.worker.min.mjs';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-[80vh] h-[85vh] flex flex-col">
      <div class="flex items-center justify-between gap-2 p-2 border border-outline-variant rounded-t-lg">
        <button
          type="button"
          class="px-3 py-1 border rounded disabled:opacity-50"
          [disabled]="currentPage <= 1 || loading"
          (click)="previousPage()"
        >
          Anterior
        </button>

        <span class="text-sm">
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <button
          type="button"
          class="px-3 py-1 border rounded disabled:opacity-50"
          [disabled]="currentPage >= totalPages || loading"
          (click)="nextPage()"
        >
          Próxima
        </button>
      </div>

      <div
        class="flex-1 overflow-auto border-x border-b border-outline-variant bg-white"
      >
        <div class="flex justify-center p-4 min-w-fit">
          <canvas #pdfCanvas></canvas>
        </div>
      </div>

      @if (loading) {
        <p class="text-sm text-center p-2">
          Carregando PDF...
        </p>
      }

      @if (errorMessage) {
        <p class="text-sm text-red-600 text-center p-2">
          {{ errorMessage }}
        </p>
      }
    </div>
  `,
})
export class PdfPreviewComponent
  implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('pdfCanvas')
  private readonly canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() url = '';

  currentPage = 1;
  totalPages = 0;
  loading = false;
  errorMessage = '';

  private pdfDocument: pdfjsLib.PDFDocumentProxy | null = null;
  private renderTask: pdfjsLib.RenderTask | null = null;
  private viewInitialized = false;
  private loadVersion = 0;

  async ngAfterViewInit(): Promise<void> {
    this.viewInitialized = true;

    if (this.url) {
      await this.loadPdf();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['url'] && this.viewInitialized) {
      await this.loadPdf();
    }
  }

  private async loadPdf(): Promise<void> {
    const version = ++this.loadVersion;

    this.cancelRender();
    this.pdfDocument?.destroy();
    this.pdfDocument = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.errorMessage = '';

    if (!this.url) {
      this.clearCanvas();
      return;
    }

    this.loading = true;

    try {
      const loadingTask = pdfjsLib.getDocument({
        url: this.url,
      });

      const pdf = await loadingTask.promise;

      if (version !== this.loadVersion) {
        await pdf.destroy();
        return;
      }

      this.pdfDocument = pdf;
      this.totalPages = pdf.numPages;

      await this.renderPage();
    } catch (error) {
      if (version === this.loadVersion) {
        this.errorMessage = 'Não foi possível carregar o PDF.';
        console.error('Erro ao carregar PDF:', error);
      }
    } finally {
      if (version === this.loadVersion) {
        this.loading = false;
      }
    }
  }

  async renderPage(): Promise<void> {
    if (!this.pdfDocument || !this.canvasRef) {
      return;
    }

    this.cancelRender();

    const page = await this.pdfDocument.getPage(this.currentPage);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    this.renderTask = page.render({
      canvasContext: context,
      viewport,
    });

    try {
      await this.renderTask.promise;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== 'RenderingCancelledException'
      ) {
        console.error('Erro ao renderizar página:', error);
      }
    } finally {
      this.renderTask = null;
    }
  }

  async previousPage(): Promise<void> {
    if (this.currentPage <= 1 || this.loading) {
      return;
    }

    this.currentPage--;
    await this.renderPage();
  }

  async nextPage(): Promise<void> {
    if (
      this.currentPage >= this.totalPages ||
      this.loading
    ) {
      return;
    }

    this.currentPage++;
    await this.renderPage();
  }

  private cancelRender(): void {
    this.renderTask?.cancel();
    this.renderTask = null;
  }

  private clearCanvas(): void {
    if (!this.canvasRef) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    canvas.width = 0;
    canvas.height = 0;
  }

  ngOnDestroy(): void {
    ++this.loadVersion;
    this.cancelRender();
    this.pdfDocument?.destroy();
  }
}
