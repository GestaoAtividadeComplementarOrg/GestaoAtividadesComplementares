package br.edu.ufape.backend.solicitacao.service;

import br.edu.ufape.backend.solicitacao.exception.TransicaoEstadoInvalidaException;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public final class MaquinaEstadosSolicitacao {

    private static final Map<StatusSolicitacao, Set<StatusSolicitacao>> TRANSICOES_VALIDAS = Map.of(
            StatusSolicitacao.SUBMETIDA,       EnumSet.of(StatusSolicitacao.EM_ANALISE,
                                                          StatusSolicitacao.APROVADA,
                                                          StatusSolicitacao.REJEITADA,
                                                          StatusSolicitacao.COM_PENDENCIAS),
            StatusSolicitacao.EM_ANALISE,      EnumSet.of(StatusSolicitacao.APROVADA,
                                                          StatusSolicitacao.REJEITADA,
                                                          StatusSolicitacao.COM_PENDENCIAS),
            StatusSolicitacao.APROVADA,        EnumSet.noneOf(StatusSolicitacao.class),
            StatusSolicitacao.REJEITADA,       EnumSet.noneOf(StatusSolicitacao.class),
            StatusSolicitacao.COM_PENDENCIAS,  EnumSet.noneOf(StatusSolicitacao.class)
    );

    private MaquinaEstadosSolicitacao() {}

    /**
     * Valida se a transicao de {@code estadoAtual} para {@code novoEstado} e permitida.
     * Lanca {@link TransicaoEstadoInvalidaException} (HTTP 409) caso contrario.
     */
    public static void validar(StatusSolicitacao estadoAtual, StatusSolicitacao novoEstado) {
        Set<StatusSolicitacao> permitidos = TRANSICOES_VALIDAS.getOrDefault(estadoAtual, Set.of());
        if (!permitidos.contains(novoEstado)) {
            throw new TransicaoEstadoInvalidaException(estadoAtual, novoEstado);
        }
    }
}
