package br.edu.ufape.backend.solicitacao.repository;

import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface SolicitacaoValidacaoRepository extends JpaRepository<SolicitacaoValidacao, Long> {

    boolean existsByItens_AtividadeIdAndStatusIn(Long atividadeId, Collection<StatusSolicitacao> statuses);

    boolean existsByEstudanteIdAndStatusIn(Long estudanteId, Collection<StatusSolicitacao> statuses);
}
