package com.learning.lms.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // --- ADMIN ENDPOINTS ---
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // --- PUBLIC ENDPOINTS ---
                        .requestMatchers("/api/auth/**", "/uploads/**", "/error", "/ws/**", "/api/chat/upload", "/api/public/**").permitAll()

                        // --- SPECIFIC GET ENDPOINTS ---
                        .requestMatchers(HttpMethod.GET, "/api/plans/**", "/api/users/**", "/api/posts/**", "/api/portfolio/**").permitAll()

                        // --- AUTHENTICATED ---
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 1. Define base allowed origins (Localhost + Production)
        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.add("http://localhost:5173");
        allowedOrigins.add("http://localhost:3000");
        allowedOrigins.add("https://skillsyncfrontend.vercel.app"); // <--- Explicitly Added

        // 2. Check for ENV variable just in case, but don't rely on it solely
        String envFrontendUrl = System.getenv("FRONTEND_URL");
        if (envFrontendUrl != null && !envFrontendUrl.isBlank()) {
            allowedOrigins.add(envFrontendUrl);
        }

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}