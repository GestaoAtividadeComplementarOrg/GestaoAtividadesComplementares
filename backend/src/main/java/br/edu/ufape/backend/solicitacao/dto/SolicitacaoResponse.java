package br.edu.ufape.backend.solicitacao.dto;

import java.time.LocalDateTime;
import java.util.List;

import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;

public record SolicitacaoResponse(
        Long id,
        StatusSolicitacao status,
        LocalDateTime dataSubmissao,
        List<SolicitacaoItemResponse> itens
) {
    public SolicitacaoResponse(SolicitacaoValidacao solicitacao) {
        this(
                solicitacao.getId(),
                solicitacao.getStatus(),
                solicitacao.getDataSubmissao(),
                solicitacao.getItens() != null
                        ? solicitacao.getItens().stream().map(SolicitacaoItemResponse::new).toList()
                        : List.of()
        );
    }
}

