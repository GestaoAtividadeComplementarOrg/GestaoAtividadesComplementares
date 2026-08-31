package br.edu.ufape.backend.notificacao.unidade.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import br.edu.ufape.backend.notificacao.model.TipoNotificacao;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoFactory;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoFactory.MensagemNotificacao;

class MensagemNotificacaoFactoryTest {

	@Test
	@DisplayName("Deve criar mensagem de notificacao para status SUBMETIDA")
	void deveCriarMensagemParaStatusSubmetida() {
		MensagemNotificacao msg = MensagemNotificacaoFactory.criar("SUBMETIDA", null);

		assertEquals(TipoNotificacao.SOLICITACAO_SUBMETIDA, msg.tipo());
		assertEquals("Solicitação enviada", msg.titulo());
		assertEquals("Sua solicitação de validação foi enviada e aguarda análise.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve criar mensagem de notificacao para status EM_ANALISE")
	void deveCriarMensagemParaStatusEmAnalise() {
		MensagemNotificacao msg = MensagemNotificacaoFactory.criar("EM_ANALISE", null);

		assertEquals(TipoNotificacao.SOLICITACAO_EM_ANALISE, msg.tipo());
		assertEquals("Solicitação em análise", msg.titulo());
		assertEquals("Sua solicitação de validação está sendo analisada.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve criar mensagem de notificacao para status COM_PENDENCIAS interpolando justificativa")
	void deveCriarMensagemParaStatusComPendencias() {
		String justificativa = "Falta comprovante de carga horária.";
		MensagemNotificacao msg = MensagemNotificacaoFactory.criar("COM_PENDENCIAS", justificativa);

		assertEquals(TipoNotificacao.SOLICITACAO_COM_PENDENCIAS, msg.tipo());
		assertEquals("Solicitação com pendências", msg.titulo());
		assertEquals("Sua solicitação apresenta pendências: Falta comprovante de carga horária.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve criar mensagem de notificacao para status APROVADA")
	void deveCriarMensagemParaStatusAprovada() {
		MensagemNotificacao msg = MensagemNotificacaoFactory.criar("APROVADA", null);

		assertEquals(TipoNotificacao.SOLICITACAO_APROVADA, msg.tipo());
		assertEquals("Solicitação aprovada", msg.titulo());
		assertEquals("Sua solicitação de validação foi aprovada.", msg.mensagem());
	}

	@Test
	@DisplayName("Deve criar mensagem de notificacao para status REJEITADA interpolando justificativa")
	void deveCriarMensagemParaStatusRejeitada() {
		String justificativa = "Atividade fora do período letivo.";
		MensagemNotificacao msg = MensagemNotificacaoFactory.criar("REJEITADA", justificativa);

		assertEquals(TipoNotificacao.SOLICITACAO_REJEITADA, msg.tipo());
		assertEquals("Solicitação rejeitada", msg.titulo());
		assertEquals("Sua solicitação foi rejeitada: Atividade fora do período letivo.", msg.mensagem());
	}

	@ParameterizedTest
	@ValueSource(strings = { "CANCELADA", "RASCUNHO", "INVALIDO", "EM_ANALISE_EXTRA" })
	@DisplayName("Deve lancar IllegalArgumentException para status desconhecido")
	void deveLancarExcecaoParaStatusDesconhecido(String statusInvalido) {
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoFactory.criar(statusInvalido, null));
	}

	@Test
	@DisplayName("Deve lancar IllegalArgumentException para status nulo")
	void deveLancarExcecaoParaStatusNulo() {
		assertThrows(IllegalArgumentException.class, () -> MensagemNotificacaoFactory.criar(null, null));
	}
}

