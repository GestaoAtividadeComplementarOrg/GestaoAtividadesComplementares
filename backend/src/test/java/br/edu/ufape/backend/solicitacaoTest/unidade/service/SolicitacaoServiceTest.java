package br.edu.ufape.backend.solicitacaoTest.unidade.service;

import br.edu.ufape.backend.solicitacao.exception.SolicitacaoNaoEncontradaException;
import br.edu.ufape.backend.solicitacao.exception.TransicaoEstadoInvalidaException;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitacaoServiceTest {

    @Mock
    private SolicitacaoValidacaoRepository repository;

    @InjectMocks
    private SolicitacaoService service;

    private SolicitacaoValidacao criarSolicitacao(StatusSolicitacao status) {
        SolicitacaoValidacao s = new SolicitacaoValidacao(1L);
        s.setId(10L);
        s.setStatus(status);
        return s;
    }

    // ---- avaliar ----

    @Test
    @DisplayName("Deve aprovar solicitacao SUBMETIDA e persistir avaliadorId e dataAvaliacao")
    void deveAprovarSolicitacaoSubmetida() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SolicitacaoValidacao resultado = service.avaliar(10L, 99L, DecisaoAvaliacao.APROVADA, null);

        assertEquals(StatusSolicitacao.APROVADA, resultado.getStatus());
        assertEquals(99L, resultado.getAvaliadorId());
        assertNotNull(resultado.getDataAvaliacao());
        verify(repository).save(solicitacao);
    }

    @Test
    @DisplayName("Deve rejeitar solicitacao com justificativa e persistir texto")
    void deveRejeitarComJustificativa() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.EM_ANALISE);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SolicitacaoValidacao resultado = service.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "Documentacao insuficiente.");

        assertEquals(StatusSolicitacao.REJEITADA, resultado.getStatus());
        assertEquals("Documentacao insuficiente.", resultado.getJustificativa());
    }

    @Test
    @DisplayName("Rejeicao sem justificativa deve lancar IllegalArgumentException — 400")
    void rejeicaoSemJustificativaDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                service.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, null));

        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Rejeicao com justificativa em branco deve lancar IllegalArgumentException — 400")
    void rejeicaoComJustificativaEmBrancoDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                service.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "   "));
    }

    @Test
    @DisplayName("COM_PENDENCIAS sem justificativa deve lancar IllegalArgumentException — 400")
    void comPendenciasSemJustificativaDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.EM_ANALISE);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                service.avaliar(10L, 99L, DecisaoAvaliacao.COM_PENDENCIAS, null));
    }

    @Test
    @DisplayName("Solicitacao inexistente deve lancar SolicitacaoNaoEncontradaException — 404")
    void solicitacaoInexistenteDeveLancar404() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(SolicitacaoNaoEncontradaException.class, () ->
                service.avaliar(999L, 99L, DecisaoAvaliacao.APROVADA, null));
    }

    @Test
    @DisplayName("Reavaliar solicitacao ja APROVADA deve lancar TransicaoEstadoInvalidaException — 409")
    void reavaliarAprovadaDeveLancar409() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.APROVADA);
        when(repository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                service.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "Tentativa invalida."));
    }

    // ---- existeSolicitacaoEmAberto ----

    @Test
    @DisplayName("Deve retornar true quando houver solicitacao em aberto com a atividade")
    void deveRetornarTrueParaAtividadeEmAberto() {
        when(repository.existsByItens_AtividadeIdAndStatusIn(eq(5L), any()))
                .thenReturn(true);

        assertTrue(service.existeSolicitacaoEmAbertoComAtividade(5L));
    }

    @Test
    @DisplayName("Deve retornar false quando nao houver solicitacao em aberto com a atividade")
    void deveRetornarFalseParaAtividadeSemSolicitacaoAberta() {
        when(repository.existsByItens_AtividadeIdAndStatusIn(eq(5L), any()))
                .thenReturn(false);

        assertFalse(service.existeSolicitacaoEmAbertoComAtividade(5L));
    }

    @Test
    @DisplayName("Deve retornar true quando estudante tiver solicitacao em aberto")
    void deveRetornarTrueParaEstudanteComSolicitacaoAberta() {
        when(repository.existsByEstudanteIdAndStatusIn(eq(7L), any()))
                .thenReturn(true);

        assertTrue(service.existeSolicitacaoEmAbertoDoEstudante(7L));
    }

    @Test
    @DisplayName("Deve retornar false quando estudante nao tiver solicitacao em aberto")
    void deveRetornarFalseParaEstudanteSemSolicitacaoAberta() {
        when(repository.existsByEstudanteIdAndStatusIn(eq(7L), any()))
                .thenReturn(false);

        assertFalse(service.existeSolicitacaoEmAbertoDoEstudante(7L));
    }
}