package br.edu.ufape.backend.solicitacao.dto;

import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;

public record SolicitacaoItemResponse(
        Long atividadeId,
        String titulo,
        Integer cargaHoraria,
        String natureza
) {
    public SolicitacaoItemResponse(SolicitacaoAtividade item) {
        this(
                item.getAtividadeId(),
                item.getTitulo(),
                item.getCargaHoraria(),
                item.getNatureza()
        );
    }
}

