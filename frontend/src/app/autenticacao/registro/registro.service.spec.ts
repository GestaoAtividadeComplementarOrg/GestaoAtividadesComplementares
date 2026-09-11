import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RegistroService } from './registro.service';
import { API_BASE_URL } from '../../api.config';

describe('RegistroService', () => {
  let service: RegistroService;
  let httpMock: HttpTestingController;
  const url = `${API_BASE_URL}/auth/cadastro`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegistroService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegistroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve cadastrar com payload correto', () => {
    service
      .register({
        fullName: 'Teste',
        emailOrRegistration: 'teste@ufape.edu.br',
        password: '12345678',
      })
      .subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'Teste',
      email: 'teste@ufape.edu.br',
      senha: '12345678',
      role: 'ESTUDANTE',
    });
    req.flush({ message: 'Cadastrado', success: true });
  });

  it('deve traduzir erro de conexão', () => {
    let erro: Error | undefined;
    service
      .register({
        fullName: 'Teste',
        emailOrRegistration: 'teste@ufape.edu.br',
        password: '12345678',
      })
      .subscribe({ error: (e: Error) => (erro = e) });
    httpMock.expectOne(url).error(new ProgressEvent('error'), { status: 0 });
    expect(erro?.message).toContain('Não foi possível conectar');
  });

  it('deve traduzir mensagem do backend', () => {
    let erro: Error | undefined;
    service
      .register({
        fullName: 'Teste',
        emailOrRegistration: 'teste@ufape.edu.br',
        password: '12345678',
      })
      .subscribe({ error: (e: Error) => (erro = e) });
    httpMock
      .expectOne(url)
      .flush({ message: 'E-mail já existe' }, { status: 400, statusText: 'Bad Request' });
    expect(erro?.message).toBe('E-mail já existe');
  });

  it('deve traduzir erro sem mensagem do backend', () => {
    let erro: Error | undefined;
    service
      .register({
        fullName: 'Teste',
        emailOrRegistration: 'teste@ufape.edu.br',
        password: '12345678',
      })
      .subscribe({ error: (e: Error) => (erro = e) });
    httpMock.expectOne(url).flush(null, { status: 500, statusText: 'Internal Server Error' });
    expect(erro?.message).toBe('Erro ao cadastrar. Tente novamente.');
  });
});
