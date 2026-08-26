package br.edu.ufape.backend.solicitacao.model;

import java.util.Set;

public enum StatusSolicitacao {
    SUBMETIDA,
    EM_ANALISE,
    COM_PENDENCIAS,
    APROVADA,
    REJEITADA;

    public static final Set<StatusSolicitacao> STATUS_EM_ABERTO = Set.of(
            SUBMETIDA,
            EM_ANALISE,
            COM_PENDENCIAS
    );

    public boolean isEmAberto() {
        return STATUS_EM_ABERTO.contains(this);
    }
}

