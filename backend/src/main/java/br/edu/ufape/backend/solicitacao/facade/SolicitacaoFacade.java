package br.edu.ufape.backend.solicitacao.facade;

import org.springframework.stereotype.Component;

import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResponse;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Estudante;
import br.edu.ufape.backend.usuario.model.Usuario;

@Component
public class SolicitacaoFacade {

    private final SolicitacaoService solicitacaoService;
    private final UsuarioContrato usuarioContrato;

    public SolicitacaoFacade(SolicitacaoService solicitacaoService, UsuarioContrato usuarioContrato) {
        this.solicitacaoService = solicitacaoService;
        this.usuarioContrato = usuarioContrato;
    }

    public SolicitacaoResponse submeter(String emailEstudante) {
        Usuario usuario = usuarioContrato.buscarPorEmail(emailEstudante)
                .orElseThrow(() -> new AcessoNegadoAtividadeException("Apenas estudantes podem submeter solicitações de validação."));

        if (!(usuario instanceof Estudante estudante)) {
            throw new AcessoNegadoAtividadeException("Apenas estudantes podem submeter solicitações de validação.");
        }

        SolicitacaoValidacao solicitacao = solicitacaoService.submeter(estudante.getId());
        return new SolicitacaoResponse(solicitacao);
    }

    public SolicitacaoResponse submeter(Long estudanteId) {
        SolicitacaoValidacao solicitacao = solicitacaoService.submeter(estudanteId);
        return new SolicitacaoResponse(solicitacao);
    }
}

