package br.edu.ufape.backend.notificacao.service;

import br.edu.ufape.backend.notificacao.contrato.EventoSolicitacao;
import br.edu.ufape.backend.notificacao.model.TipoNotificacao;

public final class MensagemNotificacaoResolver {

	public record MensagemNotificacao(TipoNotificacao tipo, String titulo, String mensagem) {
	}

	private MensagemNotificacaoResolver() {
	}

	public static MensagemNotificacao resolver(EventoSolicitacao evento, String justificativa) {
		if (evento == null) {
			throw new IllegalArgumentException("Evento de notificação não pode ser nulo");
		}
		if ((evento == EventoSolicitacao.COM_PENDENCIAS || evento == EventoSolicitacao.REJEITADA)
				&& (justificativa == null || justificativa.isBlank())) {
			throw new IllegalArgumentException("Justificativa é obrigatória para o evento " + evento);
		}
		return switch (evento) {
			case SUBMETIDA -> new MensagemNotificacao(
					TipoNotificacao.SOLICITACAO_SUBMETIDA,
					"Solicitação enviada",
					"Sua solicitação de validação foi enviada e aguarda análise."
			);
			case EM_ANALISE -> new MensagemNotificacao(
					TipoNotificacao.SOLICITACAO_EM_ANALISE,
					"Solicitação em análise",
					"Sua solicitação de validação está sendo analisada."
			);
			case COM_PENDENCIAS -> new MensagemNotificacao(
					TipoNotificacao.SOLICITACAO_COM_PENDENCIAS,
					"Solicitação com pendências",
					"Sua solicitação apresenta pendências: " + justificativa
			);
			case APROVADA -> new MensagemNotificacao(
					TipoNotificacao.SOLICITACAO_APROVADA,
					"Solicitação aprovada",
					"Sua solicitação de validação foi aprovada."
			);
			case REJEITADA -> new MensagemNotificacao(
					TipoNotificacao.SOLICITACAO_REJEITADA,
					"Solicitação rejeitada",
					"Sua solicitação foi rejeitada: " + justificativa
			);
		};
	}
}

