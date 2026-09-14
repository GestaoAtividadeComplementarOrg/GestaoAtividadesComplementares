import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { NavbarComponent } from './navbar.component';
import { AutenticacaoService } from '../../../autenticacao/autenticacao.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: {
    perfilAtual: ReturnType<typeof signal>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    encerrarSessao: ReturnType<typeof vi.fn>;
  };

  const montar = (perfil: string | null) => {
    TestBed.resetTestingModule();

    authServiceMock = {
      perfilAtual: signal<string | null>(perfil),
      isAuthenticated: vi.fn().mockReturnValue(perfil !== null),
      encerrarSessao: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AutenticacaoService, useValue: authServiceMock },
      ],
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it.each([['ESTUDANTE'], ['AVALIADOR'], ['ADMINISTRADOR']])(
    'deve renderizar links para perfil %s',
    (perfil) => {
      montar(perfil as string);
      expect(component).toBeTruthy();
    },
  );

  it('deve ocultar links para visitante anonimo', () => {
    montar(null);
    expect(component).toBeTruthy();
  });
});
