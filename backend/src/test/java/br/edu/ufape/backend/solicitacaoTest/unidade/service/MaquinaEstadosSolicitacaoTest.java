package br.edu.ufape.backend.solicitacaoTest.unidade.service;

import br.edu.ufape.backend.solicitacao.exception.TransicaoEstadoInvalidaException;
import br.edu.ufape.backend.solicitacao.model.StatusSolicitacao;
import br.edu.ufape.backend.solicitacao.service.MaquinaEstadosSolicitacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MaquinaEstadosSolicitacaoTest {

    // ---- Transicoes validas ----

    @Test
    @DisplayName("SUBMETIDA pode transitar para EM_ANALISE")
    void submetidaParaEmAnalise() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.SUBMETIDA, StatusSolicitacao.EM_ANALISE));
    }

    @Test
    @DisplayName("SUBMETIDA pode transitar diretamente para APROVADA (transicao implicita)")
    void submetidaParaAprovadaDireta() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.SUBMETIDA, StatusSolicitacao.APROVADA));
    }

    @Test
    @DisplayName("SUBMETIDA pode transitar diretamente para REJEITADA (transicao implicita)")
    void submetidaParaRejeitadaDireta() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.SUBMETIDA, StatusSolicitacao.REJEITADA));
    }

    @Test
    @DisplayName("SUBMETIDA pode transitar diretamente para COM_PENDENCIAS (transicao implicita)")
    void submetidaParaComPendenciasDireta() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.SUBMETIDA, StatusSolicitacao.COM_PENDENCIAS));
    }

    @Test
    @DisplayName("EM_ANALISE pode transitar para APROVADA")
    void emAnaliseParaAprovada() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.EM_ANALISE, StatusSolicitacao.APROVADA));
    }

    @Test
    @DisplayName("EM_ANALISE pode transitar para REJEITADA")
    void emAnaliseParaRejeitada() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.EM_ANALISE, StatusSolicitacao.REJEITADA));
    }

    @Test
    @DisplayName("EM_ANALISE pode transitar para COM_PENDENCIAS")
    void emAnaliseParaComPendencias() {
        assertDoesNotThrow(() ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.EM_ANALISE, StatusSolicitacao.COM_PENDENCIAS));
    }

    // ---- Transicoes invalidas ----

    @Test
    @DisplayName("APROVADA nao pode ser reavaliada para REJEITADA — deve lancar 409")
    void aprovadaParaRejeitadaDeveLancarExcecao() {
        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.APROVADA, StatusSolicitacao.REJEITADA));
    }

    @Test
    @DisplayName("REJEITADA nao pode transitar para EM_ANALISE — deve lancar 409")
    void rejeitadaParaEmAnaliseDeveLancarExcecao() {
        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.REJEITADA, StatusSolicitacao.EM_ANALISE));
    }

    @Test
    @DisplayName("COM_PENDENCIAS nao pode transitar para APROVADA — deve lancar 409")
    void comPendenciasParaAprovadaDeveLancarExcecao() {
        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.COM_PENDENCIAS, StatusSolicitacao.APROVADA));
    }

    @Test
    @DisplayName("APROVADA nao pode transitar para COM_PENDENCIAS — deve lancar 409")
    void aprovadaParaComPendenciasDeveLancarExcecao() {
        assertThrows(TransicaoEstadoInvalidaException.class, () ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.APROVADA, StatusSolicitacao.COM_PENDENCIAS));
    }

    @Test
    @DisplayName("Mensagem da excecao informa os estados envolvidos")
    void mensagemExcecaoInformaEstados() {
        TransicaoEstadoInvalidaException ex = assertThrows(TransicaoEstadoInvalidaException.class, () ->
                MaquinaEstadosSolicitacao.validar(StatusSolicitacao.APROVADA, StatusSolicitacao.REJEITADA));
        assertTrue(ex.getMessage().contains("APROVADA"));
        assertTrue(ex.getMessage().contains("REJEITADA"));
    }
}
