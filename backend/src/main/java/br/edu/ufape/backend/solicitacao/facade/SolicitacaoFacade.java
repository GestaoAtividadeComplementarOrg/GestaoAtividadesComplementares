package br.edu.ufape.backend.solicitacao.facade;

import br.edu.ufape.backend.autenticacao.exception.UnauthorizedException;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoDetalheResponseDTO;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import org.springframework.stereotype.Component;

@Component
public class SolicitacaoFacade {

    private final SolicitacaoService solicitacaoService;
    private final UsuarioContrato usuarioContrato;

    public SolicitacaoFacade(SolicitacaoService solicitacaoService,
                              UsuarioContrato usuarioContrato) {
        this.solicitacaoService = solicitacaoService;
        this.usuarioContrato = usuarioContrato;
    }

    public SolicitacaoDetalheResponseDTO avaliar(Long solicitacaoId, String avaliadorEmail,
                                                  DecisaoAvaliacao decisao, String justificativa) {
        Long avaliadorId = usuarioContrato.buscarPorEmail(avaliadorEmail)
                .orElseThrow(() -> new UnauthorizedException("Avaliador nao encontrado."))
                .getId();

        SolicitacaoValidacao atualizada = solicitacaoService.avaliar(
                solicitacaoId, avaliadorId, decisao, justificativa);

        return new SolicitacaoDetalheResponseDTO(atualizada);
    }
}
