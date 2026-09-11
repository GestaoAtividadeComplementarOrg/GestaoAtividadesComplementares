import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CadastroAtividadeComponent } from './cadastro-atividade.component';
import { AtividadeService } from '../atividade.service';

describe('CadastroAtividadeComponent - Cobertura Total 100%', () => {
  let component: CadastroAtividadeComponent;
  let fixture: ComponentFixture<CadastroAtividadeComponent>;
  let atividadeService: AtividadeService;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    window.scrollTo = vi.fn();

    await TestBed.configureTestingModule({
      imports: [CadastroAtividadeComponent],
      providers: [
        AtividadeService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    atividadeService = TestBed.inject(AtividadeService);
    fixture = TestBed.createComponent(CadastroAtividadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function preencherFormularioValido(): void {
    component.activityForm.patchValue({
      titulo: 'Atividade Teste',
      instituicao: 'UFAPE',
      data: '2026-03-10',
      natureza: 'ACC',
      categoria: 'ENSINO',
      cargaHoraria: 20,
    });
  }

  it('deve validar o método isCampoInvalido', () => {
    expect(component.isCampoInvalido('campoInexistente')).toBe(false);

    const tituloControl = component.activityForm.get('titulo');
    expect(component.isCampoInvalido('titulo')).toBe(false);

    tituloControl?.setValue('');
    tituloControl?.markAsTouched();
    expect(component.isCampoInvalido('titulo')).toBe(true);
  });

  it('deve validar todas as condições de isFormularioInvalido', () => {
    // Formulário inválido
    expect(component.isFormularioInvalido()).toBe(true);

    // Formulário válido mas sem arquivo
    preencherFormularioValido();
    expect(component.isFormularioInvalido()).toBe(true);

    // Formulário válido + arquivo anexado
    const file = new File(['conteudo'], 'certificado.pdf', { type: 'application/pdf' });
    component.arquivoAnexado.set(file);
    expect(component.isFormularioInvalido()).toBe(false);

    // Com carregando ativado
    component.carregando.set(true);
    expect(component.isFormularioInvalido()).toBe(true);

    component.carregando.set(false);
    // Com extraindoComIA ativado
    component.extraindoComIA.set(true);
    expect(component.isFormularioInvalido()).toBe(true);
  });

  it('deve ignorar eventos de seleção quando nenhum arquivo for informado', () => {
    const eventSemArquivos = { target: { files: null } } as unknown as Event;

    component.onFileSelected(eventSemArquivos);
    expect(component.arquivoAnexado()).toBeNull();

    component.aoSelecionarArquivoComIA(eventSemArquivos);
    expect(component.arquivoAnexado()).toBeNull();

    component.aoSelecionarArquivo(eventSemArquivos);
    expect(component.arquivoAnexado()).toBeNull();
  });

  it('deve processar seleção simples de arquivo via onFileSelected e aoSelecionarArquivo', () => {
    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' });
    const inputElement = {
      files: [pdfFile],
      value: 'comprovante.pdf',
    } as unknown as HTMLInputElement;
    const event = { target: inputElement } as unknown as Event;

    component.onFileSelected(event);
    expect(component.arquivoAnexado()).toEqual(pdfFile);

    component.aoSelecionarArquivo(event);
    expect(component.arquivoAnexado()).toEqual(pdfFile);
    expect(inputElement.value).toBe('');
  });

  it('deve processar seleção com IA com sucesso e aplicar fallbacks para campos vazios', () => {
    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' });
    const inputElement = {
      files: [pdfFile],
      value: 'comprovante.pdf',
    } as unknown as HTMLInputElement;
    const event = { target: inputElement } as unknown as Event;

    // Retorna objeto vazio para disparar os fallbacks ?? ''
    vi.spyOn(atividadeService, 'extrairDadosCertificado').mockReturnValue(of({} as any));

    component.aoSelecionarArquivoComIA(event);

    expect(component.extraindoComIA()).toBe(false);
    expect(component.activityForm.value.titulo).toBe('');
    expect(component.activityForm.value.instituicao).toBe('');
    expect(component.activityForm.value.data).toBe('');
    expect(component.activityForm.value.cargaHoraria).toBe('');
    expect(component.activityForm.value.natureza).toBe('');
    expect(component.activityForm.value.categoria).toBe('');
    expect(inputElement.value).toBe('');
  });

  it('deve tratar erro na extração de dados com IA', () => {
    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' });
    const inputElement = { files: [pdfFile], value: '' } as unknown as HTMLInputElement;
    const event = { target: inputElement } as unknown as Event;

    vi.spyOn(atividadeService, 'extrairDadosCertificado').mockReturnValue(
      throwError(() => new Error('Erro IA')),
    );

    component.aoSelecionarArquivoComIA(event);

    expect(component.extraindoComIA()).toBe(false);
    expect(component.erroExtracao()).toContain('Não foi possível extrair os dados automaticamente');
  });

  it('deve cancelar extração com IA se o arquivo for inválido', () => {
    const txtFile = new File(['conteudo'], 'texto.txt', { type: 'text/plain' });
    const inputElement = { files: [txtFile], value: 'texto.txt' } as unknown as HTMLInputElement;
    const event = { target: inputElement } as unknown as Event;

    const spyIA = vi.spyOn(atividadeService, 'extrairDadosCertificado');

    component.aoSelecionarArquivoComIA(event);

    expect(spyIA).not.toHaveBeenCalled();
    expect(inputElement.value).toBe('');
    expect(component.erroArquivo()).toContain('Tipo de arquivo inválido');
  });

  it('deve tratar os eventos de Drag and Drop (onDragOver, onDragLeave, onDrop)', () => {
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

    // Testar onDrop sem arquivos
    const emptyDrop = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: { files: [] },
    } as unknown as DragEvent;

    component.onDrop(emptyDrop);
    expect(component.dragOver()).toBe(false);
  });

  it('deve validar tipo e tamanho máximo de arquivo', () => {
    // Tipo inválido
    const invalidFile = new File([''], 'script.sh', { type: 'text/x-shellscript' });
    const eventInvalid = { target: { files: [invalidFile] } } as unknown as Event;
    component.onFileSelected(eventInvalid);

    expect(component.arquivoAnexado()).toBeNull();
    expect(component.erroArquivo()).toContain('Tipo de arquivo inválido');

    // Tamanho acima de 5MB
    const bigFile = new File([''], 'gigante.pdf', { type: 'application/pdf' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });
    const eventBig = { target: { files: [bigFile] } } as unknown as Event;
    component.onFileSelected(eventBig);

    expect(component.arquivoAnexado()).toBeNull();
    expect(component.erroArquivo()).toContain('excede o limite máximo de 5MB');
  });

  it('deve remover o arquivo anexado ao chamar removerArquivo', () => {
    component.arquivoAnexado.set(new File([''], 'doc.pdf', { type: 'application/pdf' }));
    component.erroArquivo.set('Erro');
    component.erroExtracao.set('Erro IA');

    component.removerArquivo();

    expect(component.arquivoAnexado()).toBeNull();
    expect(component.erroArquivo()).toBeNull();
    expect(component.erroExtracao()).toBeNull();
  });

  it('deve formatar o tamanho do arquivo corretamente em B, KB e MB', () => {
    expect(component.formatarTamanhoArquivo(500)).toBe('500 B');
    expect(component.formatarTamanhoArquivo(2048)).toBe('2.00 KB');
    expect(component.formatarTamanhoArquivo(5242880)).toBe('5.00 MB');
  });

  it('deve tratar cenários de bloqueio na submissão (onSubmit)', () => {
    const spyCadastrar = vi.spyOn(atividadeService, 'cadastrar');

    // 1. Formulário inválido
    component.onSubmit();
    expect(spyCadastrar).not.toHaveBeenCalled();

    // 2. Formulário válido, mas sem comprovante anexado
    preencherFormularioValido();
    component.onSubmit();
    expect(component.erroArquivo()).toBe('O comprovante é obrigatório.');
    expect(spyCadastrar).not.toHaveBeenCalled();

    // 3. Comprovante anexado, mas extração de IA ainda em andamento
    component.arquivoAnexado.set(new File([''], 'doc.pdf', { type: 'application/pdf' }));
    component.extraindoComIA.set(true);
    component.onSubmit();
    expect(component.mensagemErro()).toBe('Aguarde a conclusão da leitura do certificado.');
    expect(spyCadastrar).not.toHaveBeenCalled();

    // 4. Já carregando (envio duplo)
    component.extraindoComIA.set(false);
    component.carregando.set(true);
    component.onSubmit();
    expect(spyCadastrar).not.toHaveBeenCalled();
  });

  it('deve submeter o formulário com sucesso, limpar os campos e ocultar mensagem após 4000ms', () => {
    vi.useFakeTimers();
    preencherFormularioValido();
    component.arquivoAnexado.set(new File([''], 'doc.pdf', { type: 'application/pdf' }));

    vi.spyOn(atividadeService, 'cadastrar').mockReturnValue(of({} as any));

    component.onSubmit();

    expect(component.carregando()).toBe(false);
    expect(component.mensagemSucesso()).toBe(true);
    expect(component.arquivoAnexado()).toBeNull();

    vi.advanceTimersByTime(4000);

    expect(component.mensagemSucesso()).toBe(false);
  });

  it('deve tratar os diferentes formatos de erro na submissão', () => {
    preencherFormularioValido();
    component.arquivoAnexado.set(new File([''], 'doc.pdf', { type: 'application/pdf' }));

    const spyCadastrar = vi.spyOn(atividadeService, 'cadastrar');

    // Erro formato Http com error.message
    spyCadastrar.mockReturnValue(throwError(() => ({ error: { message: 'Erro na API backend' } })));
    component.onSubmit();
    expect(component.mensagemErro()).toBe('Erro na API backend');

    // Erro formato Error genérico com message
    spyCadastrar.mockReturnValue(throwError(() => new Error('Falha de conexão')));
    component.onSubmit();
    expect(component.mensagemErro()).toBe('Falha de conexão');

    // Erro formato desconhecido / fallback
    spyCadastrar.mockReturnValue(throwError(() => 'Erro em string pura'));
    component.onSubmit();
    expect(component.mensagemErro()).toBe(
      'Não foi possível cadastrar a atividade. Tente novamente.',
    );
  });
});
