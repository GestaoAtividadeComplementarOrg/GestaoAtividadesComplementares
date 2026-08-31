package br.edu.ufape.backend.notificacao.contrato;

public enum EventoSolicitacao {
	SUBMETIDA,
	/**
	 * Preparação para a transição SUBMETIDA -> EM_ANALISE descrita em MaquinaEstadosSolicitacao.
	 * Ainda não é acionado por nenhum fluxo atual de produção.
	 */
	EM_ANALISE,
	COM_PENDENCIAS,
	APROVADA,
	REJEITADA
}

