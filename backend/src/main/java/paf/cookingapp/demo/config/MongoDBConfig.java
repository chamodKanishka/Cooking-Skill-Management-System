package paf.cookingapp.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@Configuration
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@EnableRetry
public class MongoDBConfig {
    private static final Logger logger = LoggerFactory.getLogger(MongoDBConfig.class);
    private boolean isConnected = false;

    @Bean
    CommandLineRunner runner(MongoTemplate mongoTemplate) {
        return args -> {
            int maxRetries = 3;
            int retryCount = 0;
            while (retryCount < maxRetries && !isConnected) {
                try {
                    connectToMongoDB(mongoTemplate);
                    isConnected = true;
                    logger.info("MongoDB connection successful!");
                    System.out.println("Successfully connected to MongoDB!");
                } catch (Exception e) {
                    retryCount++;
                    logger.error("Failed to connect to MongoDB (Attempt " + retryCount + "/" + maxRetries + "): " + e.getMessage());
                    if (retryCount < maxRetries) {
                        Thread.sleep(5000); // Wait 5 seconds before retrying
                    }
                }
            }
        };
    }

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 5000))
    private void connectToMongoDB(MongoTemplate mongoTemplate) {
        mongoTemplate.getDb().getName();
    }

    @GetMapping("/api/db-status")
    public ConnectionStatus getConnectionStatus() {
        return new ConnectionStatus(isConnected);
    }

    public static class ConnectionStatus {
        private final boolean connected;

        public ConnectionStatus(boolean connected) {
            this.connected = connected;
        }

        public boolean isConnected() {
            return connected;
        }
    }
}
