package br.edu.ufape.backend.solicitacao.model;

import jakarta.persistence.*;

@Entity
@Table(name = "solicitacao_atividades")
public class SolicitacaoAtividade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private SolicitacaoValidacao solicitacao;

    @Column(name = "atividade_id", nullable = false)
    private Long atividadeId;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "carga_horaria", nullable = false)
    private Integer cargaHoraria;

    @Column(nullable = false)
    private String natureza;

    public SolicitacaoAtividade() {}

    public SolicitacaoAtividade(SolicitacaoValidacao solicitacao, Long atividadeId,
                                 String titulo, Integer cargaHoraria, String natureza) {
        this.solicitacao = solicitacao;
        this.atividadeId = atividadeId;
        this.titulo = titulo;
        this.cargaHoraria = cargaHoraria;
        this.natureza = natureza;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SolicitacaoValidacao getSolicitacao() { return solicitacao; }
    public void setSolicitacao(SolicitacaoValidacao solicitacao) { this.solicitacao = solicitacao; }

    public Long getAtividadeId() { return atividadeId; }
    public void setAtividadeId(Long atividadeId) { this.atividadeId = atividadeId; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Integer getCargaHoraria() { return cargaHoraria; }
    public void setCargaHoraria(Integer cargaHoraria) { this.cargaHoraria = cargaHoraria; }

    public String getNatureza() { return natureza; }
    public void setNatureza(String natureza) { this.natureza = natureza; }
}
