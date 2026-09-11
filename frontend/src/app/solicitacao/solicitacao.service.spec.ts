import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SolicitacaoService } from './solicitacao.service';
import { API_BASE_URL } from '../api.config';

describe('SolicitacaoService', () => {
  let service: SolicitacaoService;
  let httpMock: HttpTestingController;
  const url = `${API_BASE_URL}/solicitacoes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolicitacaoService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SolicitacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve submeter solicitacao', () => {
    service.submeter().subscribe((res) => expect(res).toBeTruthy());
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, status: 'SUBMETIDO' });
  });

  it('deve listar solicitacoes', () => {
    service.listar().subscribe((res) => expect(res.length).toBe(1));
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('deve detalhar solicitacao por id', () => {
    service.detalhar(1).subscribe((res) => expect(res.id).toBe(1));
    const req = httpMock.expectOne(`${url}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1 });
  });

  it('deve traduzir erro 403 na submissao', () => {
    let erro: Error | undefined;
    service.submeter().subscribe({ error: (e: Error) => (erro = e) });
    httpMock.expectOne(url).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(erro?.message).toBe('Apenas estudantes podem solicitar a validação de atividades.');
  });

  it('deve traduzir erro 500 generico na submissao e leitura', () => {
    let erroSubmissao: Error | undefined;
    let erroLeitura: Error | undefined;

    service.submeter().subscribe({ error: (e: Error) => (erroSubmissao = e) });
    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Internal Server Error' });

    service.listar().subscribe({ error: (e: Error) => (erroLeitura = e) });
    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(erroSubmissao?.message).toBe(
      'Não foi possível enviar o relatório para validação. Tente novamente.',
    );
    expect(erroLeitura?.message).toBe(
      'Não foi possível carregar suas solicitações. Tente novamente.',
    );
  });

  it('deve extrair texto de erro em formato string ou objeto do backend', () => {
    let erroStr: Error | undefined;
    let erroObj: Error | undefined;

    service.detalhar(1).subscribe({ error: (e: Error) => (erroStr = e) });
    httpMock
      .expectOne(`${url}/1`)
      .flush('Erro direto em string', { status: 400, statusText: 'Bad Request' });

    service.detalhar(2).subscribe({ error: (e: Error) => (erroObj = e) });
    httpMock
      .expectOne(`${url}/2`)
      .flush({ message: 'Objeto de erro' }, { status: 400, statusText: 'Bad Request' });

    expect(erroStr?.message).toBe('Erro direto em string');
    expect(erroObj?.message).toBe('Objeto de erro');
  });
});
