package br.edu.ufape.backend.solicitacaoTest.unidade.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.atividade.contrato.AtividadeContrato;
import br.edu.ufape.backend.atividade.dto.AtividadeResponse;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.solicitacao.exception.EstudanteSemAtividadesException;
import br.edu.ufape.backend.solicitacao.exception.SolicitacaoEmAbertoException;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.repository.SolicitacaoValidacaoRepository;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;

@ExtendWith(MockitoExtension.class)
class SolicitacaoServiceTest {

    private static final Long ESTUDANTE_ID = 1L;
    private static final Long ATIVIDADE_ID = 10L;

    @Mock
    private SolicitacaoValidacaoRepository solicitacaoRepository;

    @Mock
    private AtividadeContrato atividadeContrato;

    @InjectMocks
    private SolicitacaoService solicitacaoService;

    private AtividadeResponse criarAtividadeResponse(Long id, String titulo, Integer cargaHoraria, Natureza natureza) {
        return new AtividadeResponse(
                id,
                titulo,
                "Instituicao Teste",
                LocalDate.of(2026, 8, 20),
                cargaHoraria,
                natureza,
                Categoria.PESQUISA,
                LocalDateTime.now(),
                "estudante@ufape.edu.br"
        );
    }

    @Test
    @DisplayName("Caminho feliz: deve criar e salvar solicitação no estado SUBMETIDA com snapshot das atividades")
    void deveSubmeterSolicitacaoComSucesso() {
        when(solicitacaoRepository.existsByEstudanteIdAndStatusIn(eq(ESTUDANTE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(false);

        AtividadeResponse atividade1 = criarAtividadeResponse(ATIVIDADE_ID, "Curso de Java", 40, Natureza.ACC);
        AtividadeResponse atividade2 = criarAtividadeResponse(20L, "Projeto de Extensão", 60, Natureza.ACEX);
        when(atividadeContrato.buscarPorEstudanteId(ESTUDANTE_ID))
                .thenReturn(List.of(atividade1, atividade2));

        when(solicitacaoRepository.save(any(SolicitacaoValidacao.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SolicitacaoValidacao resultado = solicitacaoService.submeter(ESTUDANTE_ID);

        assertNotNull(resultado);
        assertEquals(ESTUDANTE_ID, resultado.getEstudanteId());
        assertEquals(StatusSolicitacao.SUBMETIDA, resultado.getStatus());
        assertNotNull(resultado.getDataSubmissao());
        assertEquals(2, resultado.getItens().size());

        SolicitacaoAtividade item1 = resultado.getItens().get(0);
        assertEquals(ATIVIDADE_ID, item1.getAtividadeId());
        assertEquals("Curso de Java", item1.getTitulo());
        assertEquals(40, item1.getCargaHoraria());
        assertEquals("ACC", item1.getNatureza());
        assertEquals(resultado, item1.getSolicitacao());

        SolicitacaoAtividade item2 = resultado.getItens().get(1);
        assertEquals(20L, item2.getAtividadeId());
        assertEquals("Projeto de Extensão", item2.getTitulo());
        assertEquals(60, item2.getCargaHoraria());
        assertEquals("ACEX", item2.getNatureza());
        assertEquals(resultado, item2.getSolicitacao());

        ArgumentCaptor<SolicitacaoValidacao> captor = ArgumentCaptor.forClass(SolicitacaoValidacao.class);
        verify(solicitacaoRepository).save(captor.capture());
        assertEquals(StatusSolicitacao.SUBMETIDA, captor.getValue().getStatus());
    }

    @Test
    @DisplayName("Negativo: deve lançar SolicitacaoEmAbertoException quando estudante já possuir solicitação em aberto")
    void deveLancarExcecaoQuandoJaExisteSolicitacaoEmAberto() {
        when(solicitacaoRepository.existsByEstudanteIdAndStatusIn(eq(ESTUDANTE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(true);

        assertThrows(
                SolicitacaoEmAbertoException.class,
                () -> solicitacaoService.submeter(ESTUDANTE_ID)
        );

        verify(atividadeContrato, never()).buscarPorEstudanteId(any());
        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Negativo: deve lançar EstudanteSemAtividadesException quando estudante não possuir atividades")
    void deveLancarExcecaoQuandoEstudanteNaoPossuiAtividades() {
        when(solicitacaoRepository.existsByEstudanteIdAndStatusIn(eq(ESTUDANTE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(false);
        when(atividadeContrato.buscarPorEstudanteId(ESTUDANTE_ID))
                .thenReturn(List.of());

        assertThrows(
                EstudanteSemAtividadesException.class,
                () -> solicitacaoService.submeter(ESTUDANTE_ID)
        );

        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Negativo: deve lançar EstudanteSemAtividadesException quando retorno do contrato for nulo")
    void deveLancarExcecaoQuandoRetornoDoContratoForNulo() {
        when(solicitacaoRepository.existsByEstudanteIdAndStatusIn(eq(ESTUDANTE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(false);
        when(atividadeContrato.buscarPorEstudanteId(ESTUDANTE_ID))
                .thenReturn(null);

        assertThrows(
                EstudanteSemAtividadesException.class,
                () -> solicitacaoService.submeter(ESTUDANTE_ID)
        );

        verify(solicitacaoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve consultar se existe solicitação em aberto com atividade delegando para o repositório")
    void deveConsultarSeExisteSolicitacaoEmAbertoComAtividade() {
        when(solicitacaoRepository.existsByAtividadeIdAndStatusIn(eq(ATIVIDADE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(true);

        boolean resultado = solicitacaoService.existeSolicitacaoEmAbertoComAtividade(ATIVIDADE_ID);

        assertTrue(resultado);
        verify(solicitacaoRepository).existsByAtividadeIdAndStatusIn(ATIVIDADE_ID, StatusSolicitacao.STATUS_EM_ABERTO);
    }

    @Test
    @DisplayName("Deve consultar se existe solicitação em aberto do estudante delegando para o repositório")
    void deveConsultarSeExisteSolicitacaoEmAbertoDoEstudante() {
        when(solicitacaoRepository.existsByEstudanteIdAndStatusIn(eq(ESTUDANTE_ID), eq(StatusSolicitacao.STATUS_EM_ABERTO)))
                .thenReturn(true);

        boolean resultado = solicitacaoService.existeSolicitacaoEmAbertoDoEstudante(ESTUDANTE_ID);

        assertTrue(resultado);
        verify(solicitacaoRepository).existsByEstudanteIdAndStatusIn(ESTUDANTE_ID, StatusSolicitacao.STATUS_EM_ABERTO);
    }
}

