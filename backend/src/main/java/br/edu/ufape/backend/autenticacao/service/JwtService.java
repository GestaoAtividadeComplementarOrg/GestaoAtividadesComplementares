package br.edu.ufape.backend.autenticacao.service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	@Value("${jwt.secret}")
	private String jwtSecret;

	@Value("${jwt.expiration-ms}")
	private long jwtExpirationMs;

	public String generateToken(String subject) {
		return generateToken(subject, null);
	}

	public String generateToken(String subject, String role) {
		Map<String, Object> claims = new HashMap<>();
		if (role != null) {
			claims.put("role", role);
		}
		return buildToken(claims, subject);
	}

	@SuppressWarnings("java:S2143") // Requerido pela API do JJWT: issuedAt/expiration usam java.util.Date
	private String buildToken(Map<String, Object> claims, String subject) {
		Instant now = Instant.now();
		Instant expiryDate = now.plusMillis(jwtExpirationMs);

		return Jwts.builder().claims(claims).subject(subject).issuedAt(java.util.Date.from(now))
				.expiration(java.util.Date.from(expiryDate)).signWith(getSigningKey(), Jwts.SIG.HS256).compact();
	}

	public boolean isTokenValid(String token) {
		try {
			extractAllClaims(token);
			return true;
		} catch (JwtException ex) {
			return false;
		}
	}

	public String extractUsername(String token) {
		return extractAllClaims(token).getSubject();
	}

	private Claims extractAllClaims(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
	}

	private SecretKey getSigningKey() {
		byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
