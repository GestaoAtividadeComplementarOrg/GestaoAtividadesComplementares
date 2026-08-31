package br.edu.ufape.backend.notificacao.contrato;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver;
import br.edu.ufape.backend.notificacao.service.MensagemNotificacaoResolver.MensagemNotificacao;
import br.edu.ufape.backend.notificacao.service.NotificacaoService;

@Component
public class NotificacaoContratoImpl implements NotificacaoContrato {

	private static final Logger log = LoggerFactory.getLogger(NotificacaoContratoImpl.class);

	private final NotificacaoService notificacaoService;

	public NotificacaoContratoImpl(NotificacaoService notificacaoService) {
		this.notificacaoService = notificacaoService;
	}

	@Override
	public void notificarMudancaStatusSolicitacao(Long destinatarioId, Long solicitacaoId, EventoSolicitacao evento,
			String justificativa) {
		try {
			MensagemNotificacao msg = MensagemNotificacaoResolver.resolver(evento, justificativa);
			notificacaoService.registrar(destinatarioId, msg.tipo(), msg.titulo(), msg.mensagem(), solicitacaoId);
		} catch (Exception e) {
			// Notificacoes nao devem interromper o fluxo principal da operacao (submissao/avaliacao
			// de solicitacao). O erro e registrado para acompanhamento, mantendo o comportamento
			// fail-open: uma falha ao notificar nunca deve reverter a transacao do chamador.
			log.error(
					"Falha ao registrar notificacao para destinatarioId: {}, solicitacaoId: {}, evento: {}.",
					destinatarioId,
					solicitacaoId,
					evento,
					e
			);
		}
	}
}
