## Descrição

Refatoração completa do código base com redução de Complexidade Cognitiva (CC 20→15, 27→15), correção de acessibilidade (dialog nativo, progress nativo), extração de utilitários compartilhados (erro-util, FooterComponent), simplificação de mock-data, ajustes em testes e correções no backend (java.time API, constante CONTENT, lambda simplificada, static import Mockito).

---

## Tipo da alteração

- [x] Refatoração
- [x] Testes
- [x] Configuração
- [x] Documentação
- [ ] Nova funcionalidade
- [ ] Correção de defeito
- [ ] Outro

---

## Issue Relacionada

Closes #

Refs #

---

## Alterações realizadas

### Frontend
- `mock-api.interceptor.ts`: redução de CC (extração de handlers, simplificação de ternários)
- `mock-api.interceptor`: extração de `criarPayloadCertificado`, `criarPayloadParecer`, `criarPayloadCertificadoPDF`, `filtrarAtividadesPorParametros`, `criarNovaAtividade`, `obterIdDeUrl`
- `handleSolicitacoesMocks`: refatorado com handlers (`handleRotaAvaliacao`, `processarSolicitacoesParaAvaliacao`, `handleRotaAvaliacaoId`, `avaliarSolicitacao`, `handleRotaEstudante`, `criarResumosEstudante`, `criarNovaSolicitacao`, `obterDetalheEstudante`)
- `handleAtividadesIdRoutes`: simplificado com `Record<string, () => Observable<HttpResponse<unknown>> | null>`
- Acessibilidade: `<dialog>` substitui `role="dialog"` (`edicao-atividade`, `listagem-atividades`, `detalhe-avaliacao`, `fila-solicitacoes`, `submissao-solicitacao`)
- Acessibilidade: `<progress>` substitui `role="progressbar"` (`dashboard`)
- `navbar.component.spec.ts`: testes parametrizados com `it.each`
- `progresso.component.ts`: removido import `computed` não usado
- `progresso.component.html`: usado `<app-footer>` (FooterComponent compartilhado)
- `dashboard.component.html`: usado `<app-footer>`
- `progresso-shared.ts`: extraídas `calcularResumos()` e `calcularSemAtividades()`
- `erro-util.ts`: extraídas `mensagemDoBackend()` e `traduzirErroComum()` usadas por 6 serviços
- `mock-data.ts`: simplificado (`ATIVIDADES_MOCK_INICIAIS` derivado de `ATIVIDADES_MOCK`)
- `notificacao.mock.spec.ts`, `lista-notificacoes.component.spec.ts`: `.toHaveLength()` usado
- `autenticacao/logout/logout.component.spec.ts`: `.toHaveLength()` usado
- `avaliacao/fila/fila-solicitacoes.component.spec.ts`: `.toHaveLength()` usado
- `regulamentos/regulamento.service.spec.ts`: `.toBeInstanceOf()` usado
- `solicitacao/solicitacao.service.spec.ts`: `.toHaveLength()` usado
- `regulamentos/gestao-regulamentos.component.spec.ts`: `.toHaveLength()` usado
- `admin/cursos/gestao-cursos.component.spec.ts`: `.toHaveLength()` usado
- `admin/usuarios/gestao-usuarios.component.spec.ts`: `.toHaveLength()` usado
- `core/interceptors/mock-api.interceptor.spec.ts`: `.toHaveLength()` usado

### Backend
- `GroqRagService.java`: constante `CONTENT` usada em vez de duplicar `'content'`
- `SecurityConfig.java`: removido `throws Exception` desnecessário
- `JwtService.java`: `java.time.Instant` usado (`Instant.now()`, `plusMillis()`); `java.util.Date` mantido apenas para `Date.from()` (conversão `jjwt`)
- `SolicitacaoNotificacaoIntegracaoTest.java`: lambda simplificada (`submeter()` e `avaliar()` em linha única)
- `AtividadeComplementarControllerTest.java`: `when` estático usado
- `NotificacaoControllerTest.java`: `eq(...)` e `isNull()` removidos (uso direto dos valores)

---

## Como testar

1. `npm run test -- --watch=false` (frontend): 44 arquivos, 311 testes
2. `mvnw compile` (backend): compila sem erros
3. `npm run lint:fix` (frontend): 0 erros

---

## Evidências

- Todos os 311 testes do frontend passam (`44 passed`)
- Backend compila (`BUILD SUCCESS`)
- Todos os apontados corrigidos (CC reduzida, acessibilidade, duplicação, testes parametrizados, imports não usados, `java.time`, constante `CONTENT`, lambda simplificada, `Mockito.when` estático, `toHaveLength`, `toBeInstanceOf`)

---

## Checklist

### Desenvolvimento
- [x] A implementação está concluída.
- [x] O código segue os padrões definidos.
- [x] Não existem arquivos temporários.
- [x] Não existem comentários desnecessários.

### Testes
- [x] Os testes necessários foram executados.
- [x] O comportamento esperado foi validado.

### Documentação
- [x] A documentação não foi afetada.

### Git
- [x] A branch está atualizada.
- [x] O histórico de commits está organizado.

### Revisão
- [x] Estou ciente de que o PR será revisado antes do merge.