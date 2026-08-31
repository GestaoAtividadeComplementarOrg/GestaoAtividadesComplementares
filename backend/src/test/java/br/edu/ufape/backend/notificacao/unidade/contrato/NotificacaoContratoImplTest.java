package br.edu.ufape.backend.notificacao.unidade.contrato;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.notificacao.contrato.EventoSolicitacao;
import br.edu.ufape.backend.notificacao.contrato.NotificacaoContratoImpl;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver.MensagemNotificacao;
import br.edu.ufape.backend.notificacao.service.NotificacaoService;

@ExtendWith(MockitoExtension.class)
class NotificacaoContratoImplTest {

	@Mock
	private NotificacaoService notificacaoService;

	private NotificacaoContratoImpl contrato;

	@BeforeEach
	void setUp() {
		contrato = new NotificacaoContratoImpl(notificacaoService);
	}

	@Test
	@DisplayName("Deve delegar criacao de notificacao para NotificacaoService resolvendo a mensagem dinamicamente")
	void deveDelegarCriacaoDeNotificacao() {
		Long destinatarioId = 1L;
		Long solicitacaoId = 10L;
		EventoSolicitacao evento = EventoSolicitacao.SUBMETIDA;

		MensagemNotificacao esperada = MensagemNotificacaoResolver.resolver(evento, null);

		contrato.notificarMudancaStatusSolicitacao(destinatarioId, solicitacaoId, evento, null);

		verify(notificacaoService).registrar(destinatarioId, esperada.tipo(), esperada.titulo(), esperada.mensagem(),
				solicitacaoId);
	}

	@Test
	@DisplayName("Nao deve propagar excecao para o chamador quando NotificacaoService falhar")
	void naoDevePropagarExcecaoQuandoServiceFalhar() {
		Long destinatarioId = 1L;
		Long solicitacaoId = 10L;
		EventoSolicitacao evento = EventoSolicitacao.APROVADA;
		MensagemNotificacao esperada = MensagemNotificacaoResolver.resolver(evento, null);

		doThrow(new RuntimeException("Falha de conexao com banco"))
				.when(notificacaoService)
				.registrar(destinatarioId, esperada.tipo(), esperada.titulo(), esperada.mensagem(), solicitacaoId);

		assertDoesNotThrow(() -> contrato.notificarMudancaStatusSolicitacao(destinatarioId, solicitacaoId, evento, null));
	}
}
