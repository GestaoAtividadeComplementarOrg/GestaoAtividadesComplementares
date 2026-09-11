import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
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
      providers: [provideRouter([]), { provide: AutenticacaoService, useValue: authServiceMock }],
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('deve renderizar links de estudante para perfil ESTUDANTE', () => {
    montar('ESTUDANTE');
    expect(component).toBeTruthy();
  });

  it('deve renderizar links de avaliador para perfil AVALIADOR', () => {
    montar('AVALIADOR');
    expect(component).toBeTruthy();
  });

  it('deve renderizar links de gestao de usuarios e cursos para ADMINISTRADOR', () => {
    montar('ADMINISTRADOR');
    expect(component).toBeTruthy();
  });

  it('deve ocultar links restritos para visitante anonimo', () => {
    montar(null);
    expect(component).toBeTruthy();
  });
});
