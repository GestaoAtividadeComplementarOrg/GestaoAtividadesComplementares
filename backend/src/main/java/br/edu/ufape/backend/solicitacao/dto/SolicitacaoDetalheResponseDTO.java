package br.edu.ufape.backend.solicitacao.dto;

import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;

import java.time.LocalDateTime;
import java.util.List;

public record SolicitacaoDetalheResponseDTO(
        Long id,
        StatusSolicitacao status,
        LocalDateTime dataSubmissao,
        LocalDateTime dataAvaliacao,
        String justificativa,
        List<SolicitacaoAtividadeResponseDTO> itens) {

    public SolicitacaoDetalheResponseDTO(SolicitacaoValidacao solicitacao) {
        this(
                solicitacao.getId(),
                solicitacao.getStatus(),
                solicitacao.getDataSubmissao(),
                solicitacao.getDataAvaliacao(),
                solicitacao.getJustificativa(),
                solicitacao.getItens().stream()
                        .map(SolicitacaoAtividadeResponseDTO::new)
                        .toList()
        );
    }
}
