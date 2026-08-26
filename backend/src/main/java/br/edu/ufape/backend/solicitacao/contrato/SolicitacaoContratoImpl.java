package br.edu.ufape.backend.solicitacao.contrato;

import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SolicitacaoContratoImpl implements SolicitacaoContrato {

    private static final List<StatusSolicitacao> EM_ABERTO = List.of(
            StatusSolicitacao.SUBMETIDA,
            StatusSolicitacao.EM_ANALISE,
            StatusSolicitacao.COM_PENDENCIAS
    );

    private final SolicitacaoValidacaoRepository repository;

    public SolicitacaoContratoImpl(SolicitacaoValidacaoRepository repository) {
        this.repository = repository;
    }

    @Override
    public boolean existeSolicitacaoEmAbertoComAtividade(Long atividadeId) {
        return repository.existsByItens_AtividadeIdAndStatusIn(atividadeId, EM_ABERTO);
    }

    @Override
    public boolean existeSolicitacaoEmAbertoDoEstudante(Long estudanteId) {
        return repository.existsByEstudanteIdAndStatusIn(estudanteId, EM_ABERTO);
    }
}
