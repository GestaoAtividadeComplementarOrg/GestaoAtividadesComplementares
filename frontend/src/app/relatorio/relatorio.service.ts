import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../api.config';
import { mensagemDoBackend, traduzirErroComum } from '../core/interceptors/erro-util';
import { RelatorioAtividades } from './relatorio.model';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/relatorios/atividades`;

  obterRelatorio(): Observable<RelatorioAtividades> {
    return this.http
      .get<RelatorioAtividades>(this.apiUrl)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => new Error(this.traduzirErro(error))),
        ),
      );
  }

  private traduzirErro(error: HttpErrorResponse): string {
    const comum = traduzirErroComum(error);
    if (comum) return comum;
    if (error.status === 403) {
      return (
        mensagemDoBackend(error) ?? 'Apenas estudantes podem emitir o relatório de atividades.'
      );
    }
    return mensagemDoBackend(error) ?? 'Não foi possível carregar seu relatório. Tente novamente.';
  }
}
