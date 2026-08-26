package br.edu.ufape.backend.solicitacaoTest.unidade.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.atividade.contrato.AtividadeContrato;
import br.edu.ufape.backend.atividade.dto.AtividadeResponseDTO;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.atividade.model.StatusAtividade;
import br.edu.ufape.backend.solicitacao.exception.EstudanteSemAtividadesException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoEmAbertoException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoNaoEncontradaException;
import br.edu.ufape.backend.solicitacao.exception.TransicaoEstadoInvalidaException;
import br.edu.ufape.backend.solicitacao.model.DecisaoAvaliacao;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;

@ExtendWith(MockitoExtension.class)
class SolicitacaoServiceTest {

    @Mock
    private SolicitacaoValidacaoRepository solicitacaoValidacaoRepository;

    @Mock
    private AtividadeContrato atividadeContrato;

    private SolicitacaoService solicitacaoService;

    @BeforeEach
    void setUp() {
        solicitacaoService = new SolicitacaoService(solicitacaoValidacaoRepository, atividadeContrato);
    }

    private SolicitacaoValidacao criarSolicitacao(StatusSolicitacao status) {
        SolicitacaoValidacao s = new SolicitacaoValidacao(1L);
        s.setId(10L);
        s.setStatus(status);
        return s;
    }

    // ---- submeter ----

    @Test
    @DisplayName("Deve submeter nova solicitacao criando snapshots com status SUBMETIDA")
    void deveSubmeterSolicitacaoComSucesso() {
        Long estudanteId = 100L;
        List<AtividadeResponseDTO> atividades = List.of(
                new AtividadeResponseDTO(1L, "Curso de Java", "UFAPE", LocalDate.now(), 40,
                        Natureza.ACC, Categoria.ENSINO, LocalDateTime.now(),
                        "estudante@ufape.edu.br", StatusAtividade.PENDENTE),
                new AtividadeResponseDTO(2L, "Projeto de Extensao", "UFAPE", LocalDate.now(), 60,
                        Natureza.ACEX, Categoria.EXTENSAO, LocalDateTime.now(),
                        "estudante@ufape.edu.br", StatusAtividade.PENDENTE)
        );

        when(solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(
                eq(estudanteId), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(false);
        when(atividadeContrato.buscarPorEstudante(estudanteId)).thenReturn(atividades);
        when(solicitacaoValidacaoRepository.save(any(SolicitacaoValidacao.class))).thenAnswer(inv -> {
            SolicitacaoValidacao sol = inv.getArgument(0);
            sol.setId(1L);
            return sol;
        });

        SolicitacaoValidacao resultado = solicitacaoService.submeter(estudanteId);

        assertNotNull(resultado);
        assertEquals(estudanteId, resultado.getEstudanteId());
        assertEquals(StatusSolicitacao.SUBMETIDA, resultado.getStatus());
        assertEquals(2, resultado.getItens().size());
        assertEquals("ACC", resultado.getItens().get(0).getNatureza());

        ArgumentCaptor<SolicitacaoValidacao> captor = ArgumentCaptor.forClass(SolicitacaoValidacao.class);
        verify(solicitacaoValidacaoRepository).save(captor.capture());
        assertEquals(StatusSolicitacao.SUBMETIDA, captor.getValue().getStatus());
    }

    @Test
    @DisplayName("Deve lancar SolicitacaoEmAbertoException se ja existir solicitacao em aberto")
    void deveLancarExcecaoQuandoJaExisteSolicitacaoEmAberto() {
        when(solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(
                eq(100L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(true);

        assertThrows(SolicitacaoEmAbertoException.class, () -> solicitacaoService.submeter(100L));
        verify(atividadeContrato, never()).buscarPorEstudante(anyLong());
        verify(solicitacaoValidacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve lancar EstudanteSemAtividadesException se estudante nao possuir atividades")
    void deveLancarExcecaoQuandoEstudanteNaoPossuiAtividades() {
        when(solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(
                eq(100L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(false);
        when(atividadeContrato.buscarPorEstudante(100L)).thenReturn(List.of());

        assertThrows(EstudanteSemAtividadesException.class, () -> solicitacaoService.submeter(100L));
        verify(solicitacaoValidacaoRepository, never()).save(any());
    }

    // ---- avaliar ----

    @Test
    @DisplayName("Deve aprovar solicitacao SUBMETIDA e persistir avaliadorId e dataAvaliacao")
    void deveAprovarSolicitacaoSubmetida() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoValidacaoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SolicitacaoValidacao resultado = solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.APROVADA, null);

        assertEquals(StatusSolicitacao.APROVADA, resultado.getStatus());
        assertEquals(99L, resultado.getAvaliadorId());
        assertNotNull(resultado.getDataAvaliacao());
        verify(solicitacaoValidacaoRepository).save(solicitacao);
    }

    @Test
    @DisplayName("Deve rejeitar solicitacao com justificativa e persistir texto")
    void deveRejeitarComJustificativa() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.EM_ANALISE);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));
        when(solicitacaoValidacaoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        SolicitacaoValidacao resultado = solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "Documentacao insuficiente.");

        assertEquals(StatusSolicitacao.REJEITADA, resultado.getStatus());
        assertEquals("Documentacao insuficiente.", resultado.getJustificativa());
    }

    @Test
    @DisplayName("Rejeicao sem justificativa deve lancar IllegalArgumentException — 400")
    void rejeicaoSemJustificativaDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, null));
        verify(solicitacaoValidacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rejeicao com justificativa em branco deve lancar IllegalArgumentException — 400")
    void rejeicaoComJustificativaEmBrancoDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.SUBMETIDA);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "   "));
    }

    @Test
    @DisplayName("COM_PENDENCIAS sem justificativa deve lancar IllegalArgumentException — 400")
    void comPendenciasSemJustificativaDeveLancar400() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.EM_ANALISE);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(IllegalArgumentException.class, () ->
                solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.COM_PENDENCIAS, null));
    }

    @Test
    @DisplayName("Solicitacao inexistente deve lancar SolicitacaoNaoEncontradaException — 404")
    void solicitacaoInexistenteDeveLancar404() {
        when(solicitacaoValidacaoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(SolicitacaoNaoEncontradaException.class, () ->
                solicitacaoService.avaliar(999L, 99L, DecisaoAvaliacao.APROVADA, null));
    }

    @Test
    @DisplayName("Reavaliar solicitacao ja APROVADA deve lancar TransicaoEstadoInvalidaException — 409")
    void reavaliarAprovadaDeveLancar409() {
        SolicitacaoValidacao solicitacao = criarSolicitacao(StatusSolicitacao.APROVADA);
        when(solicitacaoValidacaoRepository.findById(10L)).thenReturn(Optional.of(solicitacao));

        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                solicitacaoService.avaliar(10L, 99L, DecisaoAvaliacao.REJEITADA, "Tentativa invalida."));
    }

    // ---- contrato ----

    @Test
    @DisplayName("Contrato: deve verificar existencia de solicitacao em aberto com a atividade (true)")
    void deveVerificarExistenciaDeSolicitacaoEmAbertoComAtividade() {
        when(solicitacaoValidacaoRepository.existsByAtividadeIdAndStatusIn(
                eq(10L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(true);

        assertTrue(solicitacaoService.existeSolicitacaoEmAbertoComAtividade(10L));
    }

    @Test
    @DisplayName("Contrato: deve retornar false quando nao houver solicitacao em aberto com a atividade")
    void deveRetornarFalseParaAtividadeSemSolicitacaoAberta() {
        when(solicitacaoValidacaoRepository.existsByAtividadeIdAndStatusIn(
                eq(10L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(false);

        assertFalse(solicitacaoService.existeSolicitacaoEmAbertoComAtividade(10L));
    }

    @Test
    @DisplayName("Contrato: deve verificar existencia de solicitacao em aberto do estudante (true)")
    void deveVerificarExistenciaDeSolicitacaoEmAbertoDoEstudante() {
        when(solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(
                eq(100L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(true);

        assertTrue(solicitacaoService.existeSolicitacaoEmAbertoDoEstudante(100L));
    }

    @Test
    @DisplayName("Contrato: deve retornar false quando estudante nao tiver solicitacao em aberto")
    void deveRetornarFalseParaEstudanteSemSolicitacaoAberta() {
        when(solicitacaoValidacaoRepository.existsByEstudanteIdAndStatusIn(
                eq(100L), eq(StatusSolicitacao.STATUS_EM_ABERTO))).thenReturn(false);

        assertFalse(solicitacaoService.existeSolicitacaoEmAbertoDoEstudante(100L));
    }
}