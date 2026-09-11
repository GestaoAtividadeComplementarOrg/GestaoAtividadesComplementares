import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthInterceptor } from './auth.interceptor';
import { AutenticacaoService } from './autenticacao.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    getTokenType: ReturnType<typeof vi.fn>;
    encerrarSessao: ReturnType<typeof vi.fn>;
  };
  let spyRouter: any;

  beforeEach(() => {
    TestBed.resetTestingModule();
    spyRouter = { navigate: vi.fn() };
    authServiceMock = {
      getToken: vi.fn().mockReturnValue('token-123'),
      getTokenType: vi.fn().mockReturnValue('Bearer'),
      encerrarSessao: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AutenticacaoService, useValue: authServiceMock },
        { provide: Router, useValue: spyRouter },
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve anexar o header Authorization usando o tipo de token salvo', () => {
    authServiceMock.getToken.mockReturnValue('token-123');
    authServiceMock.getTokenType.mockReturnValue('Bearer');

    http.get('http://localhost:8080/atividades').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/atividades');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({});
  });

  it('não deve anexar o header Authorization quando não houver token', () => {
    authServiceMock.getToken.mockReturnValue(null);

    http.get('http://localhost:8080/atividades').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/atividades');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('deve limpar o token e redirecionar para /login ao receber 401 em rota protegida', () => {
    authServiceMock.getToken.mockReturnValue('token-expirado');

    http.get('http://localhost:8080/atividades').subscribe({ error: () => {} });

    const req = httpMock.expectOne('http://localhost:8080/atividades');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.encerrarSessao).toHaveBeenCalled();
    expect(spyRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('não deve redirecionar ao receber 401 na própria rota de login', () => {
    http.post('http://localhost:8080/api/v1/auth/login', {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(spyRouter.navigate).not.toHaveBeenCalled();
  });
});
