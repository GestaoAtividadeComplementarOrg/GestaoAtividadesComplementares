import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { EdicaoAtividadeComponent } from './edicao-atividade.component';
import { AtividadeService } from '../atividade.service';
import { Atividade } from '../atividade.model';

const atividadeMock: Atividade = {
  id: 1,
  titulo: 'Monitoria de Algoritmos',
  instituicaoResponsavel: 'UFAPE',
  dataRealizacao: '2026-03-10',
  cargaHorariaEmHoras: 30,
  natureza: 'ACC',
  categoria: 'ENSINO',
  dataCadastro: '2026-03-11T08:00:00',
  status: 'PENDENTE',
};

describe('EdicaoAtividadeComponent - Cobertura Total 100%', () => {
  let component: EdicaoAtividadeComponent;
  let fixture: ComponentFixture<EdicaoAtividadeComponent>;
  let atividadeService: AtividadeService;
  let router: Router;
  let mockParamId: string | null = '1';

  beforeEach(async () => {
    TestBed.resetTestingModule();

    // Moca apenas os métodos estáticos mantendo o construtor nativo de URL
    URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url');
    URL.revokeObjectURL = vi.fn();
    window.scrollTo = vi.fn();

    await TestBed.configureTestingModule({
      imports: [EdicaoAtividadeComponent],
      providers: [
        AtividadeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? mockParamId : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    atividadeService = TestBed.inject(AtividadeService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function criarComponente(): void {
    fixture = TestBed.createComponent(EdicaoAtividadeComponent);
    component = fixture.componentInstance;
  }

  it('deve inicializar e tratar ausência do ID de atividade na rota', () => {
    mockParamId = null;
    criarComponente();
    fixture.detectChanges();

    expect(component.atividadeId).toBeNull();
    expect(component.mensagemErro()).toBe('ID de atividade não informado.');
    expect(component.carregandoDados()).toBe(false);
  });

  it('deve carregar os dados da atividade com sucesso no ngOnInit', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    expect(component.atividadeId).toBe(1);
    expect(component.atividadeOriginal()).toEqual(atividadeMock);
    expect(component.activityForm.value.titulo).toBe('Monitoria de Algoritmos');
    expect(component.carregandoDados()).toBe(false);
  });

  it('deve tratar erro ao carregar dados da atividade', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(
      throwError(() => new Error('Falha ao carregar atividade')),
    );
    criarComponente();
    fixture.detectChanges();

    expect(component.mensagemErro()).toBe('Falha ao carregar atividade');
    expect(component.carregandoDados()).toBe(false);
  });

  it('deve validar o método isCampoInvalido', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    expect(component.isCampoInvalido('campoInexistente')).toBe(false);

    const control = component.activityForm.get('titulo');
    control?.setValue('');
    control?.markAsTouched();

    expect(component.isCampoInvalido('titulo')).toBe(true);
  });

  it('deve gerenciar estados do sinal temCertificadoValido', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    expect(component.temCertificadoValido()).toBe(true);

    component.removerCertificadoAtual();
    expect(component.temCertificadoValido()).toBe(false);

    const pdfFile = new File(['conteudo'], 'certificado.pdf', { type: 'application/pdf' });
    component.arquivoAnexado.set(pdfFile);
    expect(component.temCertificadoValido()).toBe(true);

    component.arquivoAnexado.set(null);
    component.atividadeOriginal.set(null);
    component.restaurarCertificadoAtual();
    expect(component.temCertificadoValido()).toBe(false);
  });

  it('deve processar seleção manual de arquivo via onFileSelected', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    const pdfFile = new File(['conteudo'], 'novo.pdf', { type: 'application/pdf' });
    const event = { target: { files: [pdfFile] } } as unknown as Event;

    component.onFileSelected(event);
    expect(component.arquivoAnexado()).toEqual(pdfFile);

    const emptyEvent = { target: { files: [] } } as unknown as Event;
    component.onFileSelected(emptyEvent);
  });

  it('deve processar upload com IA com sucesso e aplicar fallback em campos nulos', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    vi.spyOn(atividadeService, 'extrairDadosCertificado').mockReturnValue(
      of({
        titulo: 'Título IA',
        instituicaoResponsavel: '',
        dataRealizacao: '2026-05-01',
        cargaHoraria: 40,
        natureza: 'ACEX',
        categoria: 'EXTENSAO',
      } as any),
    );

    criarComponente();
    fixture.detectChanges();

    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' });
    const inputElement = {
      files: [pdfFile],
      value: 'comprovante.pdf',
    } as unknown as HTMLInputElement;
    const event = { target: inputElement } as unknown as Event;

    component.aoSelecionarNovoArquivoComIA(event);

    expect(component.extraindoComIA()).toBe(false);
    expect(component.activityForm.value.titulo).toBe('Título IA');
    expect(component.activityForm.value.data).toBe('2026-05-01');
    expect(inputElement.value).toBe('');
  });

  it('deve ignorar input sem arquivos em aoSelecionarNovoArquivoComIA', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    const event = { target: { files: null } } as unknown as Event;
    component.aoSelecionarNovoArquivoComIA(event);
    expect(component.extraindoComIA()).toBe(false);
  });

  it('deve tratar erro na extração de dados com IA', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    vi.spyOn(atividadeService, 'extrairDadosCertificado').mockReturnValue(
      throwError(() => new Error('Erro IA')),
    );

    criarComponente();
    fixture.detectChanges();

    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' });
    const event = { target: { files: [pdfFile], value: '' } } as unknown as Event;

    component.aoSelecionarNovoArquivoComIA(event);

    expect(component.extraindoComIA()).toBe(false);
    expect(component.erroExtracao()).toContain('Não foi possível extrair os dados com a IA');
  });

  it('deve tratar eventos de Drag and Drop', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    const dragEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [new File([''], 'doc.pdf', { type: 'application/pdf' })] },
    } as unknown as DragEvent;

    component.onDragOver(dragEvent);
    expect(component.dragOver()).toBe(true);

    component.onDragLeave(dragEvent);
    expect(component.dragOver()).toBe(false);

    component.onDrop(dragEvent);
    expect(component.dragOver()).toBe(false);
    expect(component.arquivoAnexado()?.name).toBe('doc.pdf');

    const emptyDrop = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [] },
    } as unknown as DragEvent;

    component.onDrop(emptyDrop);
  });

  it('deve testar os métodos de remoção e restauração de arquivos', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    component.arquivoAnexado.set(new File([''], 'teste.pdf', { type: 'application/pdf' }));
    component.removerNovoArquivo();
    expect(component.arquivoAnexado()).toBeNull();

    component.removerCertificadoAtual();
    expect(component.certificadoAtualRemovido()).toBe(true);

    component.restaurarCertificadoAtual();
    expect(component.certificadoAtualRemovido()).toBe(false);
  });

  it('deve visualizar o certificado atual (PDF e Imagem) com sucesso e erro', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    const spyObter = vi.spyOn(atividadeService, 'obterCertificado');

    criarComponente();
    fixture.detectChanges();

    component.atividadeId = null;
    component.visualizarCertificadoAtual();

    component.atividadeId = 1;
    spyObter.mockReturnValue(of(new Blob(['data'], { type: 'image/png' })));
    component.visualizarCertificadoAtual();
    expect(component.tipoPrevia()).toBe('imagem');
    expect(component.modalVisualizacaoAberto()).toBe(true);

    spyObter.mockReturnValue(of(new Blob(['data'], { type: 'application/pdf' })));
    component.atividadeOriginal.set(null);
    component.visualizarCertificadoAtual();
    expect(component.tipoPrevia()).toBe('pdf');
    expect(component.tituloPrevia()).toBe('Certificado - Atividade');

    spyObter.mockReturnValue(throwError(() => new Error('Erro servidor')));
    component.visualizarCertificadoAtual();
    expect(component.erroPrevia()).toContain('Não foi possível carregar o arquivo');
  });

  it('deve visualizar o novo arquivo anexado e fechar o modal', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    component.arquivoAnexado.set(null);
    component.visualizarNovoArquivo();

    const imgFile = new File([''], 'foto.jpg', { type: 'image/jpeg' });
    component.arquivoAnexado.set(imgFile);
    component.visualizarNovoArquivo();

    expect(component.tipoPrevia()).toBe('imagem');
    expect(component.tituloPrevia()).toBe('foto.jpg');
    expect(component.modalVisualizacaoAberto()).toBe(true);

    component.fecharModalVisualizacao();
    expect(component.modalVisualizacaoAberto()).toBe(false);
    expect(component.urlPrevia()).toBeNull();
  });

  it('deve formatar o tamanho do arquivo em MB', () => {
    mockParamId = '1';
    criarComponente();
    expect(component.formatarTamanhoArquivo(1048576)).toBe('1.00 MB');
  });

  it('deve impedir a submissão se o formulário for inválido ou sem comprovante', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    const spyAtualizar = vi.spyOn(atividadeService, 'atualizar');

    criarComponente();
    fixture.detectChanges();

    component.activityForm.patchValue({ titulo: '' });
    component.removerCertificadoAtual();

    component.onSubmit();

    expect(spyAtualizar).not.toHaveBeenCalled();
    expect(component.erroArquivo()).toContain('O comprovante é obrigatório');

    component.atividadeId = null;
    component.onSubmit();
    expect(spyAtualizar).not.toHaveBeenCalled();
  });

  it('deve submeter o formulário com sucesso e navegar após 1500ms', () => {
    vi.useFakeTimers();
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    vi.spyOn(atividadeService, 'atualizar').mockReturnValue(of(atividadeMock as any));
    const spyNavigate = vi.spyOn(router, 'navigate');

    criarComponente();
    fixture.detectChanges();

    component.onSubmit();

    expect(component.carregando()).toBe(false);
    expect(component.mensagemSucesso()).toBe(true);

    vi.advanceTimersByTime(1500);

    expect(spyNavigate).toHaveBeenCalledWith(['/atividades']);
  });

  it('deve tratar erro na submissão do formulário', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    vi.spyOn(atividadeService, 'atualizar').mockReturnValue(
      throwError(() => new Error('Erro ao atualizar atividade')),
    );

    criarComponente();
    fixture.detectChanges();

    component.onSubmit();

    expect(component.carregando()).toBe(false);
    expect(component.mensagemErro()).toBe('Erro ao atualizar atividade');
  });

  it('deve rejeitar arquivos com formato inválido ou tamanho superior a 5MB', () => {
    mockParamId = '1';
    vi.spyOn(atividadeService, 'buscarPorId').mockReturnValue(of(atividadeMock));
    criarComponente();
    fixture.detectChanges();

    const txtFile = new File([''], 'texto.txt', { type: 'text/plain' });
    const eventInvalid = { target: { files: [txtFile] } } as unknown as Event;
    component.onFileSelected(eventInvalid);

    expect(component.arquivoAnexado()).toBeNull();
    expect(component.erroArquivo()).toContain('Tipo de arquivo inválido');

    const bigFile = new File([''], 'grande.pdf', { type: 'application/pdf' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });
    const eventBig = { target: { files: [bigFile] } } as unknown as Event;
    component.onFileSelected(eventBig);

    expect(component.arquivoAnexado()).toBeNull();
    expect(component.erroArquivo()).toContain('O arquivo excede o limite máximo de 5MB');
  });
});
