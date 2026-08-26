package br.edu.ufape.backend.solicitacao.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.edu.ufape.backend.atividade.contrato.AtividadeContrato;
import br.edu.ufape.backend.atividade.dto.AtividadeResponse;
import br.edu.ufape.backend.solicitacao.exception.EstudanteSemAtividadesException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoEmAbertoException;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;

@Service
public class SolicitacaoService {

    private final SolicitacaoValidacaoRepository solicitacaoRepository;
    private final AtividadeContrato atividadeContrato;

    public SolicitacaoService(
            SolicitacaoValidacaoRepository solicitacaoRepository,
            AtividadeContrato atividadeContrato) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.atividadeContrato = atividadeContrato;
    }

    @Transactional
    public SolicitacaoValidacao submeter(Long estudanteId) {
        // Regra 1: Verificar se ja existe uma solicitacao em aberto para este estudante
        if (solicitacaoRepository.existsByEstudanteIdAndStatusIn(estudanteId, StatusSolicitacao.STATUS_EM_ABERTO)) {
            throw new SolicitacaoEmAbertoException("Já existe uma solicitação de validação em aberto para este estudante.");
        }

        // Regra 2: Buscar atividades do estudante via AtividadeContrato
        List<AtividadeResponse> atividades = atividadeContrato.buscarPorEstudanteId(estudanteId);

        // Regra 3: Se o estudante nao possuir nenhuma atividade, lancar excecao de negocio (422)
        if (atividades == null || atividades.isEmpty()) {
            throw new EstudanteSemAtividadesException("O estudante não possui atividades cadastradas para submissão.");
        }

        // Regra 4: Criar SolicitacaoValidacao, preencher dataSubmissao, status SUBMETIDA e snapshots
        SolicitacaoValidacao solicitacao = new SolicitacaoValidacao(
                estudanteId,
                LocalDateTime.now(),
                StatusSolicitacao.SUBMETIDA
        );

        List<SolicitacaoAtividade> itens = atividades.stream()
                .map(atv -> new SolicitacaoAtividade(
                        atv.id(),
                        atv.titulo(),
                        atv.cargaHorariaEmHoras(),
                        atv.natureza() != null ? atv.natureza().name() : null,
                        solicitacao
                ))
                .toList();

        solicitacao.setItens(itens);

        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional(readOnly = true)
    public boolean existeSolicitacaoEmAbertoComAtividade(Long atividadeId) {
        return solicitacaoRepository.existsByAtividadeIdAndStatusIn(atividadeId, StatusSolicitacao.STATUS_EM_ABERTO);
    }

    @Transactional(readOnly = true)
    public boolean existeSolicitacaoEmAbertoDoEstudante(Long estudanteId) {
        return solicitacaoRepository.existsByEstudanteIdAndStatusIn(estudanteId, StatusSolicitacao.STATUS_EM_ABERTO);
    }
}

