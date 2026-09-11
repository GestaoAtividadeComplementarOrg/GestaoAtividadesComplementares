import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { RelatorioService } from './relatorio.service';
import { API_BASE_URL } from '../api.config';
import { RelatorioAtividades } from './relatorio.model';

describe('RelatorioService', () => {
  let service: RelatorioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [RelatorioService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RelatorioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve obter o relatório com sucesso', () => {
    const mockRelatorio: RelatorioAtividades = {} as RelatorioAtividades;

    service.obterRelatorio().subscribe((data) => {
      expect(data).toEqual(mockRelatorio);
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRelatorio);
  });

  it('deve tratar erro status 401 (Sessão expirada)', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Sessão expirada. Faça login novamente.');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('deve tratar erro status 0 (Falha de conexão)', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Não foi possível conectar ao servidor. Verifique sua conexão.');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({}, { status: 0, statusText: 'Unknown Error' });
  });

  it('deve tratar erro status 403 sem mensagem no corpo (padrão)', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Apenas estudantes podem emitir o relatório de atividades.');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({}, { status: 403, statusText: 'Forbidden' });
  });

  it('deve tratar erro status 403 com mensagem no formato string', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Erro 403 em string');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush('  Erro 403 em string  ', { status: 403, statusText: 'Forbidden' });
  });

  it('deve tratar erro status 403 com propriedade message no objeto', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Erro 403 no objeto');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({ message: '  Erro 403 no objeto  ' }, { status: 403, statusText: 'Forbidden' });
  });

  it('deve tratar erro genérico (ex: 500) sem mensagem (padrão)', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Não foi possível carregar seu relatório. Tente novamente.');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
  });

  it('deve tratar erro genérico com mensagem em string', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Falha interna');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush(' Falha interna ', { status: 500, statusText: 'Internal Server Error' });
  });

  it('deve tratar erro com corpo não textual e campo message inválido ou ausente', () => {
    service.obterRelatorio().subscribe({
      next: () => expect.fail('Deveria ter falhado'),
      error: (err: Error) => {
        expect(err.message).toBe('Não foi possível carregar seu relatório. Tente novamente.');
      },
    });

    const req = httpMock.expectOne(`${API_BASE_URL}/relatorios/atividades`);
    req.flush({ message: 12345 }, { status: 500, statusText: 'Internal Server Error' });
  });
});
