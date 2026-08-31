package br.edu.ufape.backend.notificacao.unidade.contrato;

import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.notificacao.contrato.NotificacaoContratoImpl;
import br.edu.ufape.backend.notificacao.model.TipoNotificacao;
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
	@DisplayName("Deve delegar criacao de notificacao de submissao para NotificacaoService")
	void deveNotificarSubmissao() {
		contrato.notificarMudancaStatusSolicitacao(1L, 10L, "SUBMETIDA", null);

		verify(notificacaoService).registrar(1L, TipoNotificacao.SOLICITACAO_SUBMETIDA, "Solicitação enviada",
				"Sua solicitação de validação foi enviada e aguarda análise.", 10L);
	}

	@Test
	@DisplayName("Deve delegar criacao de notificacao de aprovacao para NotificacaoService")
	void deveNotificarAprovacao() {
		contrato.notificarMudancaStatusSolicitacao(1L, 10L, "APROVADA", null);

		verify(notificacaoService).registrar(1L, TipoNotificacao.SOLICITACAO_APROVADA, "Solicitação aprovada",
				"Sua solicitação de validação foi aprovada.", 10L);
	}

	@Test
	@DisplayName("Deve delegar criacao de notificacao de pendencia para NotificacaoService")
	void deveNotificarPendencias() {
		contrato.notificarMudancaStatusSolicitacao(1L, 10L, "COM_PENDENCIAS", "Anexo corrompido");

		verify(notificacaoService).registrar(1L, TipoNotificacao.SOLICITACAO_COM_PENDENCIAS,
				"Solicitação com pendências", "Sua solicitação apresenta pendências: Anexo corrompido", 10L);
	}

	@Test
	@DisplayName("Deve delegar criacao de notificacao de rejeicao para NotificacaoService")
	void deveNotificarRejeicao() {
		contrato.notificarMudancaStatusSolicitacao(1L, 10L, "REJEITADA", "Documento invalido");

		verify(notificacaoService).registrar(1L, TipoNotificacao.SOLICITACAO_REJEITADA, "Solicitação rejeitada",
				"Sua solicitação foi rejeitada: Documento invalido", 10L);
	}

	@Test
	@DisplayName("Deve delegar criacao de notificacao de em analise para NotificacaoService")
	void deveNotificarEmAnalise() {
		contrato.notificarMudancaStatusSolicitacao(1L, 10L, "EM_ANALISE", null);

		verify(notificacaoService).registrar(1L, TipoNotificacao.SOLICITACAO_EM_ANALISE, "Solicitação em análise",
				"Sua solicitação de validação está sendo analisada.", 10L);
	}
}

