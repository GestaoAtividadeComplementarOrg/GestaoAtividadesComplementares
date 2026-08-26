package br.edu.ufape.backend.solicitacao.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResponse;
import br.edu.ufape.backend.solicitacao.facade.SolicitacaoFacade;

@RestController
@RequestMapping("/api/v1/solicitacoes")
public class SolicitacaoEstudanteController {

    private final SolicitacaoFacade solicitacaoFacade;

    public SolicitacaoEstudanteController(SolicitacaoFacade solicitacaoFacade) {
        this.solicitacaoFacade = solicitacaoFacade;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoResponse> submeter(Authentication authentication) {
        String emailEstudante = authentication.getName();
        SolicitacaoResponse response = solicitacaoFacade.submeter(emailEstudante);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

