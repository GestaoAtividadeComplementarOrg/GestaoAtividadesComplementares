import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ATIVIDADES_MOCK,
  SOLICITACOES_MOCK,
  REGULAMENTOS_MOCK,
  CURSOS_MOCK,
  USUARIOS_MOCK,
  gerarTokenMock,
  obterProgressoCalculado,
  obterRelatorioCalculado,
} from '../mocks/mock-data';
import { NOTIFICACOES_MOCK } from '../../notificacao/notificacao.mock';
import { Atividade } from '../../atividades/atividade.model';
import { SolicitacaoAvaliadorDetalhe } from '../../avaliacao/avaliacao.model';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const overrideRuntime =
    typeof window !== 'undefined' ? localStorage.getItem('sgac_use_mocks') : null;
  const mocksAtivos = overrideRuntime !== null ? overrideRuntime === 'true' : environment.useMocks;

  if (!mocksAtivos) {
    return next(req);
  }

  const url = req.url.split('?')[0].replace(/\/$/, '').trimEnd();
  const method = req.method.toUpperCase();

  return processarRotasMock(req, url, method) ?? next(req);
};

function processarRotasMock(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  return (
    handleAuthMocks(req, url, method) ??
    handleAtividadesMocks(req, url, method) ??
    handleSolicitacoesMocks(req, url, method) ??
    handleRegulamentosMocks(req, url, method) ??
    handleCursosMocks(req, url, method) ??
    handleUsuariosMocks(req, url, method) ??
    handleRelatoriosMocks(req, url, method) ??
    handleNotificacoesMocks(req, url, method)
  );
}

// --- Handlers Específicos por Domínio ---

function handleAuthMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/auth/login') && method === 'POST') {
    const body = (req.body ?? {}) as { usuario?: string; email?: string };
    const email = (body?.usuario || body?.email || 'estudante@ufape.edu.br').toLowerCase();
    const role = email.includes('avaliador')
      ? 'AVALIADOR'
      : email.includes('admin')
        ? 'ADMINISTRADOR'
        : 'ESTUDANTE';

    return jsonResponse(200, {
      token: gerarTokenMock(email, role),
      tipo: 'Bearer',
      usuario: { email, role },
    });
  }

  if (url.endsWith('/auth/cadastro') && method === 'POST') {
    return jsonResponse(201, { message: 'Cadastro realizado com sucesso.', success: true });
  }

  if (url.endsWith('/auth/logout') && method === 'POST') {
    return jsonResponse(200, { message: 'Sessão encerrada com sucesso.', success: true });
  }

  if (url.endsWith('/auth/me') && method === 'GET') {
    return jsonResponse(200, {
      id: '1',
      nome: 'Usuário Mock',
      email: 'estudante@ufape.edu.br',
      role: 'ESTUDANTE',
    });
  }

  return null;
}

function handleAtividadesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/atividades')) return null;

  if (url.endsWith('/atividades/progresso') && method === 'GET') {
    return jsonResponse(200, obterProgressoCalculado());
  }

  if (url.endsWith('/atividades/extrair-certificado') && method === 'POST') {
    return jsonResponse(200, {
      titulo: 'Curso de Extensão em Tecnologia',
      instituicaoResponsavel: 'UFAPE',
      dataRealizacao: '2026-05-10',
      cargaHoraria: 20,
      natureza: 'ACC',
      categoria: 'ENSINO',
    });
  }

  if (url.includes('/parecer') && method === 'GET') {
    const id = Number(url.split('/atividades/')[1]?.split('/parecer')[0]);
    return jsonResponse(200, {
      id: id || 1,
      atividadeId: id || 1,
      naturezaSugerida: 'ACC',
      categoriaSugerida: 'ENSINO',
      cargaHorariaAproveitavel: 30,
      artigoRegulamento: 'Art. 12',
      justificativaTecnica: 'Atividade compatível com os critérios do PPC.',
      scoreConfianca: 0.95,
      decisaoIA: 'DEFERIDO',
      tempoProcessamentoMs: 350,
    });
  }

  if (url.includes('/certificado') && method === 'GET') {
    const blob = new Blob(['mock-pdf-content'], { type: 'application/pdf' });
    return of(new HttpResponse({ status: 200, body: blob })).pipe(delay(200));
  }

  if (url.endsWith('/atividades')) {
    if (method === 'GET') {
      const natureza = req.params.get('natureza');
      const categoria = req.params.get('categoria');
      let lista = [...ATIVIDADES_MOCK];
      if (natureza) lista = lista.filter((a) => a.natureza === natureza);
      if (categoria) lista = lista.filter((a) => a.categoria === categoria);
      return jsonResponse(200, lista);
    }

    if (method === 'POST') {
      const bodyObj = extrairDadosCorpo(req);
      const novaAtividade: Atividade = {
        id: Date.now(),
        titulo: String(bodyObj['titulo'] ?? 'Nova Atividade'),
        instituicaoResponsavel: String(bodyObj['instituicaoResponsavel'] ?? 'UFAPE'),
        dataRealizacao: String(bodyObj['dataRealizacao'] ?? new Date().toISOString().split('T')[0]),
        cargaHorariaEmHoras: Number(bodyObj['cargaHoraria'] ?? 10),
        natureza: String(bodyObj['natureza'] ?? 'ACC'),
        categoria: String(bodyObj['categoria'] ?? 'ENSINO'),
        dataCadastro: new Date().toISOString(),
        status: 'PENDENTE',
      };
      ATIVIDADES_MOCK.push(novaAtividade);
      return jsonResponse(201, novaAtividade);
    }
  }

  const idSeg = url.split('/atividades/')[1];
  return handleAtividadesIdRoutes(req, idSeg, method);
}

function handleAtividadesIdRoutes(
  req: HttpRequest<unknown>,
  idSeg: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  const idNum = Number(idSeg);
  if (Number.isNaN(idNum)) return null;

  const index = ATIVIDADES_MOCK.findIndex((a) => a.id === idNum);

  if (method === 'GET') {
    return index !== -1
      ? jsonResponse(200, ATIVIDADES_MOCK[index])
      : jsonResponse(404, { message: 'Atividade não encontrada.' });
  }

  if (method === 'PUT') {
    if (index === -1) return jsonResponse(404, { message: 'Atividade não encontrada.' });
    const bodyObj = extrairDadosCorpo(req);
    ATIVIDADES_MOCK[index] = {
      ...ATIVIDADES_MOCK[index],
      titulo:
        typeof bodyObj['titulo'] === 'string' ? bodyObj['titulo'] : ATIVIDADES_MOCK[index].titulo,
      instituicaoResponsavel:
        typeof bodyObj['instituicaoResponsavel'] === 'string'
          ? bodyObj['instituicaoResponsavel']
          : ATIVIDADES_MOCK[index].instituicaoResponsavel,
      dataRealizacao:
        typeof bodyObj['dataRealizacao'] === 'string'
          ? bodyObj['dataRealizacao']
          : ATIVIDADES_MOCK[index].dataRealizacao,
      cargaHorariaEmHoras: Number(
        bodyObj['cargaHoraria'] ?? ATIVIDADES_MOCK[index].cargaHorariaEmHoras,
      ),
      natureza:
        typeof bodyObj['natureza'] === 'string'
          ? bodyObj['natureza']
          : ATIVIDADES_MOCK[index].natureza,
      categoria:
        typeof bodyObj['categoria'] === 'string'
          ? bodyObj['categoria']
          : ATIVIDADES_MOCK[index].categoria,
    };
    return jsonResponse(200, ATIVIDADES_MOCK[index]);
  }

  if (method === 'DELETE') {
    if (index === -1) return jsonResponse(404, { message: 'Atividade não encontrada.' });
    ATIVIDADES_MOCK.splice(index, 1);
    return jsonResponse(204, null);
  }

  return null;
}

function handleSolicitacoesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/solicitacoes')) return null;

  // 1. Rota de listagem de avaliação (Avaliador): GET /solicitacoes/avaliacao
  if (url.endsWith('/solicitacoes/avaliacao') && method === 'GET') {
    const statusFiltro = req.params.get('status');
    let resumos = SOLICITACOES_MOCK.map((s) => ({
      id: s.id,
      estudanteNome: s.estudanteNome,
      dataSubmissao: s.dataSubmissao,
      status: s.status,
      dataAvaliacao: s.dataAvaliacao,
      totalAtividades: s.itens.length,
      cargaHorariaTotal: s.cargaHorariaTotal,
    }));

    if (statusFiltro) {
      resumos = resumos.filter((r) => r.status === statusFiltro);
    }
    return jsonResponse(200, resumos);
  }

  // 2. Rotas de detalhe e ação de avaliação (Avaliador): /solicitacoes/:id/avaliacao
  if (url.includes('/avaliacao')) {
    const partes = url.split('/solicitacoes/')[1]?.split('/avaliacao')[0];
    const idNum = Number(partes);
    const index = SOLICITACOES_MOCK.findIndex((s) => s.id === idNum);

    if (index === -1) {
      return jsonResponse(404, { message: 'Solicitação não encontrada.' });
    }

    if (method === 'GET') {
      return jsonResponse(200, SOLICITACOES_MOCK[index]);
    }

    if (method === 'PATCH') {
      const body = (req.body ?? {}) as { decisao?: string; justificativa?: string };
      const novaDecisao = (body.decisao as any) ?? 'APROVADA';
      SOLICITACOES_MOCK[index] = {
        ...SOLICITACOES_MOCK[index],
        status: novaDecisao,
        justificativa: body.justificativa?.trim() || undefined,
        dataAvaliacao: new Date().toISOString(),
      };
      return jsonResponse(200, SOLICITACOES_MOCK[index]);
    }
  }

  // 3. Rotas do Estudante: /solicitacoes
  if (url.endsWith('/solicitacoes')) {
    if (method === 'GET') {
      const resumosEstudante = SOLICITACOES_MOCK.map((s) => ({
        id: s.id,
        status: s.status,
        dataSubmissao: s.dataSubmissao,
        dataAvaliacao: s.dataAvaliacao,
        totalAtividades: s.itens.length,
      }));
      return jsonResponse(200, resumosEstudante);
    }

    if (method === 'POST') {
      const temAberta = SOLICITACOES_MOCK.some(
        (s) => s.status === 'SUBMETIDA' || s.status === 'EM_ANALISE',
      );
      if (temAberta) {
        return jsonResponse(409, {
          message:
            'Você possui uma solicitação em aberto. Acompanhe o andamento antes de enviar outra.',
        });
      }

      const itens = ATIVIDADES_MOCK.map((a) => ({
        atividadeId: a.id,
        titulo: a.titulo,
        cargaHoraria: a.cargaHorariaEmHoras,
        natureza: a.natureza,
      }));

      if (itens.length === 0) {
        return jsonResponse(422, {
          message: 'Cadastre ao menos uma atividade antes de enviar o relatório para validação.',
        });
      }

      const novaSolicitacao: SolicitacaoAvaliadorDetalhe = {
        id: Date.now(),
        estudanteNome: 'Estudante Teste UFAPE',
        estudanteEmail: 'estudante@ufape.edu.br',
        dataSubmissao: new Date().toISOString(),
        status: 'SUBMETIDA',
        cargaHorariaTotal: itens.reduce((acc, cur) => acc + cur.cargaHoraria, 0),
        itens: itens,
      };

      SOLICITACOES_MOCK.push(novaSolicitacao);

      const detalheEstudante = {
        id: novaSolicitacao.id,
        status: novaSolicitacao.status,
        dataSubmissao: novaSolicitacao.dataSubmissao,
        totalAtividades: novaSolicitacao.itens.length,
        itens: novaSolicitacao.itens,
      };

      return jsonResponse(201, detalheEstudante);
    }
  }

  // 4. Detalhe do Estudante: GET /solicitacoes/:id
  const idEstudanteSeg = url.split('/solicitacoes/')[1];
  if (idEstudanteSeg && !Number.isNaN(Number(idEstudanteSeg)) && method === 'GET') {
    const idNum = Number(idEstudanteSeg);
    const item = SOLICITACOES_MOCK.find((s) => s.id === idNum);
    if (!item) {
      return jsonResponse(404, { message: 'Solicitação não encontrada.' });
    }
    const detalheEstudante = {
      id: item.id,
      status: item.status,
      dataSubmissao: item.dataSubmissao,
      dataAvaliacao: item.dataAvaliacao,
      totalAtividades: item.itens.length,
      justificativa: item.justificativa,
      itens: item.itens,
    };
    return jsonResponse(200, detalheEstudante);
  }

  return null;
}

function handleRegulamentosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/regulamentos')) return null;

  if (url.endsWith('/regulamentos') && method === 'GET') {
    return jsonResponse(200, REGULAMENTOS_MOCK);
  }

  if (url.includes('/regulamentos/ingerir') && method === 'POST') {
    return jsonResponse(200, {
      nomeDocumento: 'regulamento.pdf',
      totalChunksExtraidos: 4,
      status: 'SUCESSO',
      mensagem: '4 normas extraídas e vetorizadas com sucesso.',
    });
  }

  return null;
}

function handleCursosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/cursos')) return null;

  if (method === 'GET') {
    return jsonResponse(200, CURSOS_MOCK);
  }

  if (method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const novoCurso = { id: Date.now(), ...body };
    CURSOS_MOCK.push(novoCurso as any);
    return jsonResponse(201, novoCurso);
  }

  return null;
}

function handleUsuariosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/usuarios')) return null;

  if (method === 'GET') {
    return jsonResponse(200, USUARIOS_MOCK);
  }

  return null;
}

function handleRelatoriosMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (url.endsWith('/relatorios/atividades') && method === 'GET') {
    return jsonResponse(200, obterRelatorioCalculado('estudante@ufape.edu.br'));
  }

  return null;
}

function handleNotificacoesMocks(
  req: HttpRequest<unknown>,
  url: string,
  method: string,
): Observable<HttpResponse<unknown>> | null {
  if (!url.includes('/notificacoes')) return null;

  if (url.endsWith('/notificacoes/contagem-nao-lidas') && method === 'GET') {
    const naoLidas = NOTIFICACOES_MOCK.filter((n) => !n.lida).length;
    return jsonResponse(200, { naoLidas });
  }

  if (url.endsWith('/notificacoes') && method === 'GET') {
    const apenasNaoLidas = req.params.get('apenasNaoLidas') === 'true';
    const lista = apenasNaoLidas ? NOTIFICACOES_MOCK.filter((n) => !n.lida) : NOTIFICACOES_MOCK;
    return jsonResponse(200, lista);
  }

  if (url.includes('/leitura') && method === 'PATCH') {
    const idSeg = url.split('/notificacoes/')[1]?.split('/leitura')[0];
    if (idSeg && !Number.isNaN(Number(idSeg))) {
      const idNum = Number(idSeg);
      const item = NOTIFICACOES_MOCK.find((n) => n.id === idNum);
      if (item) {
        item.lida = true;
        return jsonResponse(200, item);
      }
      return jsonResponse(404, { message: 'Notificação não encontrada.' });
    }

    NOTIFICACOES_MOCK.forEach((n) => (n.lida = true));
    return jsonResponse(204, null);
  }

  return null;
}

// --- Funções Auxiliares ---

function jsonResponse(
  status: number,
  body: unknown,
  delayMs = 200,
): Observable<HttpResponse<unknown>> {
  return of(new HttpResponse({ status, body })).pipe(delay(delayMs));
}

function extrairDadosCorpo(req: HttpRequest<unknown>): Record<string, unknown> {
  const bodyObj: Record<string, unknown> = {};
  if (req.body instanceof FormData) {
    req.body.forEach((val, key) => {
      bodyObj[key] = val;
    });
  } else if (typeof req.body === 'object' && req.body !== null) {
    Object.assign(bodyObj, req.body);
  }
  return bodyObj;
}
