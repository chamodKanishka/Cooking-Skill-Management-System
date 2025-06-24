package paf.cookingapp.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow requests from our frontend
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        
        // Allow all common HTTP methods
        config.addAllowedMethod("*");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Expose headers that frontend might need
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Disposition");
        
        // How long the browser should cache the CORS response
        config.setMaxAge(3600L);
        
        // Apply configuration to all paths
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
