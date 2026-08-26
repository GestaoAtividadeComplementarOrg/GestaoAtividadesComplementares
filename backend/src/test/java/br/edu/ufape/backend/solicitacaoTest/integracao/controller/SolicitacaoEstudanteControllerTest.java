package br.edu.ufape.backend.solicitacaoTest.integracao.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import br.edu.ufape.backend.atividade.model.AtividadeComplementar;
import br.edu.ufape.backend.atividade.model.Categoria;
import br.edu.ufape.backend.atividade.model.Natureza;
import br.edu.ufape.backend.atividade.repository.AtividadeComplementarRepository;
import br.edu.ufape.backend.autenticacao.dto.CadastroUsuarioRequest;
import br.edu.ufape.backend.autenticacao.service.JwtService;
import br.edu.ufape.backend.certificados.model.Certificado;
import br.edu.ufape.backend.usuario.contrato.UsuarioContrato;
import br.edu.ufape.backend.usuario.model.Avaliador;
import br.edu.ufape.backend.usuario.model.Estudante;
import br.edu.ufape.backend.usuario.model.Role;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@Transactional
class SolicitacaoEstudanteControllerTest {

    private static final String URL_SOLICITACOES = "/api/v1/solicitacoes";

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioContrato usuarioContrato;

    @Autowired
    private AtividadeComplementarRepository atividadeRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    private Estudante cadastrarEstudanteERetornar(String email) throws Exception {
        CadastroUsuarioRequest cadastro = new CadastroUsuarioRequest();
        cadastro.setNome("Estudante Solicitacao");
        cadastro.setEmail(email);
        cadastro.setSenha("senha1234");
        cadastro.setRole(Role.ESTUDANTE);

        mockMvc.perform(post("/api/v1/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cadastro)))
                .andExpect(status().isCreated());

        return (Estudante) usuarioContrato.buscarPorEmail(email).orElseThrow();
    }

    private String criarAvaliadorERetornarToken(String email) {
        usuarioContrato.salvar(new Avaliador("Avaliador Teste", email, "hash-senha",
                "REG-002", "Extensao"));
        return jwtService.generateToken(email);
    }

    @Test
    @DisplayName("Caminho feliz: Deve criar solicitação de validação com sucesso e retornar 201 Created com payload correto")
    void deveCriarSolicitacaoComSucesso() throws Exception {
        String email = "estudante.solicitacao.sucesso@ufape.edu.br";
        Estudante estudante = cadastrarEstudanteERetornar(email);
        String token = jwtService.generateToken(email);

        AtividadeComplementar atividade = new AtividadeComplementar(
                "Curso de Spring Boot",
                "UFAPE",
                LocalDate.of(2026, 8, 10),
                30,
                Natureza.ACC,
                Categoria.ENSINO,
                new Certificado("certificado.pdf", "application/pdf", 1024L, "/tmp/cert1.pdf"),
                estudante
        );
        atividadeRepository.save(atividade);

        mockMvc.perform(post(URL_SOLICITACOES)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("SUBMETIDA"))
                .andExpect(jsonPath("$.dataSubmissao").exists())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].atividadeId").value(atividade.getId()))
                .andExpect(jsonPath("$.itens[0].titulo").value("Curso de Spring Boot"))
                .andExpect(jsonPath("$.itens[0].cargaHoraria").value(30))
                .andExpect(jsonPath("$.itens[0].natureza").value("ACC"));
    }

    @Test
    @DisplayName("Negativo: Deve retornar 409 Conflict quando o estudante já possui uma solicitação em aberto")
    void deveRetornarConflictQuandoJaExisteSolicitacaoEmAberto() throws Exception {
        String email = "estudante.solicitacao.duplicada@ufape.edu.br";
        Estudante estudante = cadastrarEstudanteERetornar(email);
        String token = jwtService.generateToken(email);

        AtividadeComplementar atividade = new AtividadeComplementar(
                "Seminário de IA",
                "UFAPE",
                LocalDate.of(2026, 8, 12),
                20,
                Natureza.ACC,
                Categoria.PESQUISA,
                new Certificado("certificado2.pdf", "application/pdf", 2048L, "/tmp/cert2.pdf"),
                estudante
        );
        atividadeRepository.save(atividade);

        // Primeira submissão com sucesso
        mockMvc.perform(post(URL_SOLICITACOES)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isCreated());

        // Segunda submissão deve conflitar
        mockMvc.perform(post(URL_SOLICITACOES)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Negativo: Deve retornar 422 Unprocessable Entity quando estudante não possuir atividades cadastradas")
    void deveRetornarUnprocessableEntityQuandoEstudanteNaoPossuiAtividades() throws Exception {
        String email = "estudante.sem.atividades@ufape.edu.br";
        cadastrarEstudanteERetornar(email);
        String token = jwtService.generateToken(email);

        mockMvc.perform(post(URL_SOLICITACOES)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("Negativo: Deve retornar 403 Forbidden quando usuário autenticado for Avaliador")
    void deveRetornarForbiddenQuandoUsuarioForAvaliador() throws Exception {
        String tokenAvaliador = criarAvaliadorERetornarToken("avaliador.solicitacao@ufape.edu.br");

        mockMvc.perform(post(URL_SOLICITACOES)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenAvaliador))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Negativo: Deve retornar 401 Unauthorized quando não houver cabeçalho de autorização")
    void deveRetornarUnauthorizedQuandoNaoAutenticado() throws Exception {
        mockMvc.perform(post(URL_SOLICITACOES))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
