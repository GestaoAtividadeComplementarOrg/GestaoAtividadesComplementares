import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GestaoCursosComponent } from './gestao-cursos.component';
import { AdminService } from '../admin.service';
import { Curso } from '../admin.model';

const cursosMock: Curso[] = [
  {
    id: 1,
    nome: 'Ciência da Computação',
    codigo: 'BCC',
    horasAccExigidas: 90,
    horasAcexExigidas: 320,
    ativo: true,
  },
];

describe('GestaoCursosComponent', () => {
  let component: GestaoCursosComponent;
  let fixture: ComponentFixture<GestaoCursosComponent>;
  let adminServiceSpy: {
    listarCursos: ReturnType<typeof vi.fn>;
    criarCurso: ReturnType<typeof vi.fn>;
    atualizarCurso: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminServiceSpy = {
      listarCursos: vi.fn().mockReturnValue(of(cursosMock)),
      criarCurso: vi.fn(),
      atualizarCurso: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GestaoCursosComponent],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoCursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('deve carregar a lista de cursos parametrizados', () => {
    expect(component).toBeTruthy();
    expect(adminServiceSpy.listarCursos).toHaveBeenCalled();
    expect(component.cursos().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Ciência da Computação');
  });

  it('deve abrir modal para novo curso', () => {
    component.abrirModalNovo();
    expect(component.modalAberto()).toBeTruthy();
    expect(component.editandoId()).toBeNull();
  });

  it('deve abrir modal para editar curso', () => {
    component.abrirModalEditar(cursosMock[0]);
    expect(component.modalAberto()).toBeTruthy();
    expect(component.editandoId()).toBe(1);
    expect(component.formCurso.value.nome).toBe('Ciência da Computação');
  });

  it('deve criar curso com sucesso', () => {
    adminServiceSpy.criarCurso.mockReturnValue(of({ ...cursosMock[0], id: 2 }));
    component.abrirModalNovo();
    component.formCurso.setValue({
      nome: 'Engenharia',
      codigo: 'ENG',
      horasAccExigidas: 90,
      horasAcexExigidas: 320,
      ativo: true,
    });
    component.salvar();
    expect(adminServiceSpy.criarCurso).toHaveBeenCalled();
  });

  it('deve atualizar curso com sucesso', () => {
    adminServiceSpy.atualizarCurso.mockReturnValue(of(cursosMock[0]));
    component.abrirModalEditar(cursosMock[0]);
    component.salvar();
    expect(adminServiceSpy.atualizarCurso).toHaveBeenCalled();
  });

  it('deve mostrar erro ao criar curso', () => {
    adminServiceSpy.criarCurso.mockReturnValue(of(new Error('Erro')));
    component.abrirModalNovo();
    component.formCurso.setValue({
      nome: 'Teste',
      codigo: 'TST',
      horasAccExigidas: 90,
      horasAcexExigidas: 320,
      ativo: true,
    });
    component.salvar();
  });

  it('não deve salvar se o formulário for inválido', () => {
    component.formCurso.reset();
    component.salvar();
    expect(adminServiceSpy.criarCurso).not.toHaveBeenCalled();
  });
});
