package br.edu.ufape.backend.solicitacao.service;

import br.edu.ufape.backend.solicitacao.exception.SolicitacaoNaoEncontradaException;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SolicitacaoService {

    private final SolicitacaoValidacaoRepository repository;

    public SolicitacaoService(SolicitacaoValidacaoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SolicitacaoValidacao avaliar(Long solicitacaoId, Long avaliadorId,
                                        DecisaoAvaliacao decisao, String justificativa) {
        SolicitacaoValidacao solicitacao = repository.findById(solicitacaoId)
                .orElseThrow(() -> new SolicitacaoNaoEncontradaException(solicitacaoId));

        StatusSolicitacao novoStatus = decisao.toStatus();
        MaquinaEstadosSolicitacao.validar(solicitacao.getStatus(), novoStatus);

        if ((novoStatus == StatusSolicitacao.REJEITADA || novoStatus == StatusSolicitacao.COM_PENDENCIAS)
                && (justificativa == null || justificativa.isBlank())) {
            throw new IllegalArgumentException(
                    "Justificativa e obrigatoria para decisao " + novoStatus);
        }

        solicitacao.setStatus(novoStatus);
        solicitacao.setJustificativa(justificativa);
        solicitacao.setAvaliadorId(avaliadorId);
        solicitacao.setDataAvaliacao(LocalDateTime.now());

        return repository.save(solicitacao);
    }
}
