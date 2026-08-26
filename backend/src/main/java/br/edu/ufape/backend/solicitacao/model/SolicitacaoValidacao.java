package br.edu.ufape.backend.solicitacao.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitacoes_validacao")
public class SolicitacaoValidacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "estudante_id", nullable = false)
    private Long estudanteId;

    @CreationTimestamp
    @Column(name = "data_submissao", nullable = false, updatable = false)
    private LocalDateTime dataSubmissao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSolicitacao status = StatusSolicitacao.SUBMETIDA;

    @Column(columnDefinition = "TEXT")
    private String justificativa;

    @Column(name = "avaliador_id")
    private Long avaliadorId;

    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SolicitacaoAtividade> itens = new ArrayList<>();

    public SolicitacaoValidacao() {}

    public SolicitacaoValidacao(Long estudanteId) {
        this.estudanteId = estudanteId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEstudanteId() { return estudanteId; }
    public void setEstudanteId(Long estudanteId) { this.estudanteId = estudanteId; }

    public LocalDateTime getDataSubmissao() { return dataSubmissao; }
    public void setDataSubmissao(LocalDateTime dataSubmissao) { this.dataSubmissao = dataSubmissao; }

    public StatusSolicitacao getStatus() { return status; }
    public void setStatus(StatusSolicitacao status) { this.status = status; }

    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }

    public Long getAvaliadorId() { return avaliadorId; }
    public void setAvaliadorId(Long avaliadorId) { this.avaliadorId = avaliadorId; }

    public LocalDateTime getDataAvaliacao() { return dataAvaliacao; }
    public void setDataAvaliacao(LocalDateTime dataAvaliacao) { this.dataAvaliacao = dataAvaliacao; }

    public List<SolicitacaoAtividade> getItens() { return itens; }
    public void setItens(List<SolicitacaoAtividade> itens) { this.itens = itens; }
}
