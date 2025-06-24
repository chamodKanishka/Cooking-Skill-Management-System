package paf.cookingapp.demo.controller;

import paf.cookingapp.demo.model.LearningProgress;
import paf.cookingapp.demo.repository.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class LearningProgressController {
    
    private static final Logger logger = LoggerFactory.getLogger(LearningProgressController.class);
    
    @Autowired
    private LearningProgressRepository repository;

    @GetMapping
    public ResponseEntity<?> getAllProgress() {
        logger.info("Attempting to retrieve all progress records...");
        try {
            List<LearningProgress> progress = repository.findAll();
            logger.info("Successfully retrieved {} progress records", progress.size());
            if (progress.isEmpty()) {
                return ResponseEntity.ok(List.of()); // Return empty array instead of null
            }
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            logger.error("Error retrieving progress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "message", "Error retrieving progress records",
                    "error", e.getMessage()
                ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningProgress> getProgressById(@PathVariable String id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProgressByUserId(@PathVariable String userId) {
        logger.info("Attempting to retrieve progress records for user: {}", userId);
        try {
            List<LearningProgress> progress = repository.findByUserId(userId);
            logger.info("Found {} progress records for user {}", progress.size(), userId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            logger.error("Error retrieving progress for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "message", "Error retrieving progress records",
                    "error", e.getMessage()
                ));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProgress(@RequestBody LearningProgress progress) {
        try {
            logger.info("Received progress data: {}", progress);
            
            // Null checks
            if (progress == null) {
                logger.error("Received null progress object");
                return ResponseEntity.badRequest().body("Progress data cannot be null");
            }

            // Validate fields
            if (progress.getTitle() == null || progress.getTitle().trim().isEmpty()) {
                logger.error("Title is missing or empty");
                return ResponseEntity.badRequest().body("Title is required");
            }
            if (progress.getCourseName() == null || progress.getCourseName().trim().isEmpty()) {
                logger.error("Course name is missing or empty");
                return ResponseEntity.badRequest().body("Course name is required");
            }
            if (progress.getTemplateType() == null || progress.getTemplateType().trim().isEmpty()) {
                logger.error("Template type is missing or empty");
                return ResponseEntity.badRequest().body("Template type is required");
            }

            // Clean and prepare data
            progress.setTitle(progress.getTitle().trim());
            progress.setCourseName(progress.getCourseName().trim());
            progress.setDetails(progress.getDetails() != null ? progress.getDetails().trim() : "");
            progress.setTemplateType(progress.getTemplateType().trim().toLowerCase());
            progress.setUserId(progress.getUserId() != null ? progress.getUserId() : "1");

            // Set timestamps with UTC time
            LocalDateTime now = LocalDateTime.now();
            if (progress.getDateCreated() == null) {
                progress.setDateCreated(now);
            }
            if (progress.getLastModified() == null) {
                progress.setLastModified(now);
            }

            // Save and validate response
            LearningProgress savedProgress = repository.save(progress);
            logger.info("Saved progress with dates - created: {}, modified: {}", 
                savedProgress.getDateCreated(), 
                savedProgress.getLastModified());
                
            return ResponseEntity.ok(savedProgress);
            
        } catch (Exception e) {
            logger.error("Error creating progress: ", e);
            String errorMessage = "Error creating progress: " + e.getMessage();
            // Include more detailed error information
            if (e.getCause() != null) {
                errorMessage += " | Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorMessage);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgress> updateProgress(@PathVariable String id, @RequestBody LearningProgress progress) {
        return repository.findById(id)
                .map(existingProgress -> {
                    // Clean up the update data
                    if (progress.getCourseName() != null) {
                        existingProgress.setCourseName(progress.getCourseName().trim());
                    }
                    if (progress.getTitle() != null) {
                        existingProgress.setTitle(progress.getTitle().trim());
                    }
                    if (progress.getDetails() != null) {
                        existingProgress.setDetails(progress.getDetails().trim());
                    }
                    if (progress.getTemplateType() != null) {
                        existingProgress.setTemplateType(progress.getTemplateType().trim().toLowerCase());
                    }
                    
                    existingProgress.setLastModified(LocalDateTime.now());
                    
                    return ResponseEntity.ok(repository.save(existingProgress));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgress(@PathVariable String id) {
        return repository.findById(id)
                .map(progress -> {
                    repository.delete(progress);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

