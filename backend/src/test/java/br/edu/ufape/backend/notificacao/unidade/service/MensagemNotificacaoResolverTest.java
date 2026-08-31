package br.edu.ufape.backend.notificacao.unidade.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import br.edu.ufape.backend.notificacao.contrato.EventoSolicitacao;
import br.edu.ufape.backend.notificacao.model.TipoNotificacao;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver.MensagemNotificacao;

class MensagemNotificacaoResolverTest {

	@Test
	@DisplayName("Deve resolver mensagem de notificacao para evento SUBMETIDA")
	void deveResolverMensagemParaEventoSubmetida() {
		MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(EventoSolicitacao.SUBMETIDA, null);

		assertEquals(TipoNotificacao.SOLICITACAO_SUBMETIDA, msg.tipo());
		assertEquals("Solicitação enviada", msg.titulo());
		assertEquals("Sua solicitação de validação foi enviada e aguarda análise.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve resolver mensagem de notificacao para evento EM_ANALISE")
	void deveResolverMensagemParaEventoEmAnalise() {
		MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(EventoSolicitacao.EM_ANALISE, null);

		assertEquals(TipoNotificacao.SOLICITACAO_EM_ANALISE, msg.tipo());
		assertEquals("Solicitação em análise", msg.titulo());
		assertEquals("Sua solicitação de validação está sendo analisada.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve resolver mensagem de notificacao para evento COM_PENDENCIAS interpolando justificativa")
	void deveResolverMensagemParaEventoComPendencias() {
		String justificativa = "Falta comprovante de carga horária.";
		MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(EventoSolicitacao.COM_PENDENCIAS, justificativa);

		assertEquals(TipoNotificacao.SOLICITACAO_COM_PENDENCIAS, msg.tipo());
		assertEquals("Solicitação com pendências", msg.titulo());
		assertEquals("Sua solicitação apresenta pendências: Falta comprovante de carga horária.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve resolver mensagem de notificacao para evento APROVADA")
	void deveResolverMensagemParaEventoAprovada() {
		MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(EventoSolicitacao.APROVADA, null);

		assertEquals(TipoNotificacao.SOLICITACAO_APROVADA, msg.tipo());
		assertEquals("Solicitação aprovada", msg.titulo());
		assertEquals("Sua solicitação de validação foi aprovada.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve resolver mensagem de notificacao para evento REJEITADA interpolando justificativa")
	void deveResolverMensagemParaEventoRejeitada() {
		String justificativa = "Atividade fora do período letivo.";
		MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(EventoSolicitacao.REJEITADA, justificativa);

		assertEquals(TipoNotificacao.SOLICITACAO_REJEITADA, msg.tipo());
		assertEquals("Solicitação rejeitada", msg.titulo());
		assertEquals("Sua solicitação foi rejeitada: Atividade fora do período letivo.", msg.mensagem());
	}

	@ParameterizedTest
	@NullAndEmptySource
	@ValueSource(strings = { "   ", "\t", "\n" })
	@DisplayName("Deve lancar IllegalArgumentException para COM_PENDENCIAS com justificativa nula ou em branco")
	void deveLancarExcecaoParaComPendenciasSemJustificativa(String justificativaInvalida) {
		assertThrows(IllegalArgumentException.class,
				() -> MensagemNotificacaoResolver.resolver(EventoSolicitacao.COM_PENDENCIAS, justificativaInvalida));
	}

	@ParameterizedTest
	@NullAndEmptySource
	@ValueSource(strings = { "   ", "\t", "\n" })
	@DisplayName("Deve lancar IllegalArgumentException para REJEITADA com justificativa nula ou em branco")
	void deveLancarExcecaoParaRejeitadaSemJustificativa(String justificativaInvalida) {
		assertThrows(IllegalArgumentException.class,
				() -> MensagemNotificacaoResolver.resolver(EventoSolicitacao.REJEITADA, justificativaInvalida));
	}

	@Test
	@DisplayName("Deve lancar IllegalArgumentException para evento nulo")
	void deveLancarExcecaoParaEventoNulo() {
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoResolver.resolver(null, "justificativa"));
	}
}

