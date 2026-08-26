package br.edu.ufape.backend.solicitacaoTest.unidade.facade;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.edu.ufape.backend.atividade.exception.AcessoNegadoAtividadeException;
import br.edu.ufape.backend.solicitacao.dto.SolicitacaoResponse;
import br.edu.ufape.backend.solicitacao.facade.SolicitacaoFacade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoAtividade;
import br.edu.ufape.backend.solicitacao.model.SolicitacaoValidacao;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.service.SolicitacaoService;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Avaliador;
import br.edu.ufape.backend.usuario.model.Estudante;
import br.edu.ufape.backend.usuario.model.Usuario;

@ExtendWith(MockitoExtension.class)
class SolicitacaoFacadeTest {

    private static final String EMAIL = "estudante@ufape.edu.br";
    private static final Long ESTUDANTE_ID = 1L;

    @Mock
    private SolicitacaoService solicitacaoService;

    @Mock
    private UsuarioContrato usuarioContrato;

    private SolicitacaoFacade solicitacaoFacade;

    @BeforeEach
    void setUp() {
        solicitacaoFacade = new SolicitacaoFacade(solicitacaoService, usuarioContrato);
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getSuperclass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            try {
                Field field = target.getClass().getDeclaredField(fieldName);
                field.setAccessible(true);
                field.set(target, value);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }
    }

    @Test
    @DisplayName("Deve submeter solicitação por email de estudante com sucesso")
    void deveSubmeterPorEmailComSucesso() {
        Estudante estudante = new Estudante("Estudante Teste", EMAIL, "hash");
        setField(estudante, "id", ESTUDANTE_ID);

        SolicitacaoValidacao solicitacao = new SolicitacaoValidacao(
                ESTUDANTE_ID,
                LocalDateTime.now(),
                StatusSolicitacao.SUBMETIDA
        );
        setField(solicitacao, "id", 100L);

        SolicitacaoAtividade item = new SolicitacaoAtividade(10L, "Curso de Java", 40, "ACC");
        solicitacao.adicionarItem(item);

        when(usuarioContrato.buscarPorEmail(EMAIL)).thenReturn(Optional.of(estudante));
        when(solicitacaoService.submeter(ESTUDANTE_ID)).thenReturn(solicitacao);

        SolicitacaoResponse response = solicitacaoFacade.submeter(EMAIL);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(StatusSolicitacao.SUBMETIDA, response.status());
        assertEquals(1, response.itens().size());
        assertEquals(10L, response.itens().get(0).atividadeId());
        assertEquals("Curso de Java", response.itens().get(0).titulo());
        assertEquals(40, response.itens().get(0).cargaHoraria());
        assertEquals("ACC", response.itens().get(0).natureza());

        verify(usuarioContrato).buscarPorEmail(EMAIL);
        verify(solicitacaoService).submeter(ESTUDANTE_ID);
    }

    @Test
    @DisplayName("Deve lançar AcessoNegadoAtividadeException quando usuário não for encontrado")
    void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
        when(usuarioContrato.buscarPorEmail(EMAIL)).thenReturn(Optional.empty());

        assertThrows(
                AcessoNegadoAtividadeException.class,
                () -> solicitacaoFacade.submeter(EMAIL)
        );
    }

    @Test
    @DisplayName("Deve lançar AcessoNegadoAtividadeException quando usuário não for Estudante")
    void deveLancarExcecaoQuandoUsuarioNaoForEstudante() {
        Usuario avaliador = new Avaliador("Avaliador", EMAIL, "hash", "REG-01", "Extensao");
        when(usuarioContrato.buscarPorEmail(EMAIL)).thenReturn(Optional.of(avaliador));

        assertThrows(
                AcessoNegadoAtividadeException.class,
                () -> solicitacaoFacade.submeter(EMAIL)
        );
    }

    @Test
    @DisplayName("Deve submeter solicitação por estudanteId direto")
    void deveSubmeterPorIdDireto() {
        SolicitacaoValidacao solicitacao = new SolicitacaoValidacao(
                ESTUDANTE_ID,
                LocalDateTime.now(),
                StatusSolicitacao.SUBMETIDA
        );
        setField(solicitacao, "id", 100L);

        when(solicitacaoService.submeter(ESTUDANTE_ID)).thenReturn(solicitacao);

        SolicitacaoResponse response = solicitacaoFacade.submeter(ESTUDANTE_ID);

        assertNotNull(response);
        assertEquals(100L, response.id());
        verify(solicitacaoService).submeter(ESTUDANTE_ID);
    }
}

