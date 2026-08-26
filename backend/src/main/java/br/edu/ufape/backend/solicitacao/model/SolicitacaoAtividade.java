package br.edu.ufape.backend.solicitacao.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitacao_atividades")
public class SolicitacaoAtividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "atividade_id", nullable = false)
    private Long atividadeId;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "carga_horaria", nullable = false)
    private Integer cargaHoraria;

    @Column(name = "natureza", nullable = false)
    private String natureza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id")
    private SolicitacaoValidacao solicitacao;

    public SolicitacaoAtividade() {
    }

    public SolicitacaoAtividade(Long atividadeId, String titulo, Integer cargaHoraria, String natureza) {
        this.atividadeId = atividadeId;
        this.titulo = titulo;
        this.cargaHoraria = cargaHoraria;
        this.natureza = natureza;
    }

    public SolicitacaoAtividade(Long atividadeId, String titulo, Integer cargaHoraria, String natureza,
            SolicitacaoValidacao solicitacao) {
        this.atividadeId = atividadeId;
        this.titulo = titulo;
        this.cargaHoraria = cargaHoraria;
        this.natureza = natureza;
        this.solicitacao = solicitacao;
    }

    public Long getId() {
        return id;
    }

    public Long getAtividadeId() {
        return atividadeId;
    }

    public void setAtividadeId(Long atividadeId) {
        this.atividadeId = atividadeId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public Integer getCargaHoraria() {
        return cargaHoraria;
    }

    public void setCargaHoraria(Integer cargaHoraria) {
        this.cargaHoraria = cargaHoraria;
    }

    public String getNatureza() {
        return natureza;
    }

    public void setNatureza(String natureza) {
        this.natureza = natureza;
    }

    public SolicitacaoValidacao getSolicitacao() {
        return solicitacao;
    }

    public void setSolicitacao(SolicitacaoValidacao solicitacao) {
        this.solicitacao = solicitacao;
    }
}

