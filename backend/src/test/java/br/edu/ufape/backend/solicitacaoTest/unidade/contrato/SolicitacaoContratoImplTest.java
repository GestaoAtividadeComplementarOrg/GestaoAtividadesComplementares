package br.edu.ufape.backend.solicitacaoTest.unidade.contrato;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.solicitacao.contrato.SolicitacaoContratoImpl;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;

@ExtendWith(MockitoExtension.class)
class SolicitacaoContratoImplTest {

    private static final Long ATIVIDADE_ID = 10L;
    private static final Long ESTUDANTE_ID = 1L;

    @Mock
    private SolicitacaoService solicitacaoService;

    private SolicitacaoContratoImpl solicitacaoContrato;

    @BeforeEach
    void setUp() {
        solicitacaoContrato = new SolicitacaoContratoImpl(solicitacaoService);
    }

    @Test
    @DisplayName("Deve delegar checagem de solicitação em aberto com atividade para o service")
    void deveDelegarChecagemDeSolicitacaoEmAbertoComAtividade() {
        when(solicitacaoService.existeSolicitacaoEmAbertoComAtividade(ATIVIDADE_ID)).thenReturn(true);

        boolean resultado = solicitacaoContrato.existeSolicitacaoEmAbertoComAtividade(ATIVIDADE_ID);

        assertTrue(resultado);
        verify(solicitacaoService).existeSolicitacaoEmAbertoComAtividade(ATIVIDADE_ID);
    }

    @Test
    @DisplayName("Deve delegar checagem de solicitação em aberto do estudante para o service")
    void deveDelegarChecagemDeSolicitacaoEmAbertoDoEstudante() {
        when(solicitacaoService.existeSolicitacaoEmAbertoDoEstudante(ESTUDANTE_ID)).thenReturn(false);

        boolean resultado = solicitacaoContrato.existeSolicitacaoEmAbertoDoEstudante(ESTUDANTE_ID);

        assertFalse(resultado);
        verify(solicitacaoService).existeSolicitacaoEmAbertoDoEstudante(ESTUDANTE_ID);
    }
}

