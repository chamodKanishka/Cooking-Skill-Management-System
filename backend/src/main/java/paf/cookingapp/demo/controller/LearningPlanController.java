package paf.cookingapp.demo.controller;

import paf.cookingapp.demo.model.LearningPlan;
import paf.cookingapp.demo.repository.LearningPlanRepository;
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
@RequestMapping("/api/plan")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class LearningPlanController {

    private static final Logger logger = LoggerFactory.getLogger(LearningPlanController.class);

    @Autowired
    private LearningPlanRepository repository;

    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        logger.info("Attempting to retrieve all plans...");
        try {
            List<LearningPlan> plans = repository.findAll();
            logger.info("Successfully retrieved {} plans", plans.size());
            if (plans.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            logger.error("Error retrieving plans: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message", "Error retrieving plans",
                            "error", e.getMessage()
                    ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getPlanById(@PathVariable String id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody LearningPlan plan) {
        try {
            logger.info("Received plan data: {}", plan);
            if (plan != null && plan.getTimeline() != null) {
                logger.info("Received timeline: {}", plan.getTimeline());
            } else {
                logger.warn("No timeline received in plan");
            }

            if (plan == null) {
                logger.error("Received null plan object");
                return ResponseEntity.badRequest().body(Map.of("message", "Plan data cannot be null"));
            }

            if (plan.getTitle() == null || plan.getTitle().trim().isEmpty()) {
                logger.error("Title is missing or empty");
                return ResponseEntity.badRequest().body(Map.of("message", "Title is required"));
            }
            if ("course".equalsIgnoreCase(plan.getTemplateType())) {
                if (plan.getCourseName() == null || plan.getCourseName().trim().isEmpty()) {
                    logger.error("Course name is missing or empty for course plan");
                    return ResponseEntity.badRequest().body(Map.of("message", "Course name is required for course plans"));
                }
            }
            if (plan.getTemplateType() == null || plan.getTemplateType().trim().isEmpty()) {
                logger.error("Template type is missing or empty");
                return ResponseEntity.badRequest().body(Map.of("message", "Template type is required"));
            }

            // Clean and prepare data
            plan.setTitle(plan.getTitle() != null ? plan.getTitle().trim() : "");
            plan.setCourseName(plan.getCourseName() != null ? plan.getCourseName().trim() : "");
            plan.setDetails(plan.getDetails() != null ? plan.getDetails().trim() : "");
            plan.setTemplateType(plan.getTemplateType() != null ? plan.getTemplateType().trim().toLowerCase() : "");
            plan.setUserId(plan.getUserId() != null ? plan.getUserId() : "1");

            LocalDateTime now = LocalDateTime.now();
            if (plan.getDateCreated() == null) {
                plan.setDateCreated(now);
            }
            if (plan.getLastModified() == null) {
                plan.setLastModified(now);
            }

            // Log timeline before saving
            logger.info("Timeline before save: {}", plan.getTimeline());
            LearningPlan savedPlan = repository.save(plan);
            logger.info("Saved plan: {}", savedPlan);
            logger.info("Saved plan timeline: {}", savedPlan.getTimeline());
            logger.info("Saved plan with dates - created: {}, modified: {}", savedPlan.getDateCreated(), savedPlan.getLastModified());

            return ResponseEntity.ok(savedPlan);

        } catch (Exception e) {
            logger.error("Error creating plan: ", e);
            String errorMessage = "Error creating plan: " + e.getMessage();
            if (e.getCause() != null) {
                errorMessage += " | Cause: " + e.getCause().getMessage();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", errorMessage));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        return repository.findById(id)
                .map(existingPlan -> {
                    if (plan.getCourseName() != null) {
                        existingPlan.setCourseName(plan.getCourseName().trim());
                    }
                    if (plan.getTitle() != null) {
                        existingPlan.setTitle(plan.getTitle().trim());
                    }
                    if (plan.getDetails() != null) {
                        existingPlan.setDetails(plan.getDetails().trim());
                    }
                    if (plan.getTemplateType() != null) {
                        existingPlan.setTemplateType(plan.getTemplateType().trim().toLowerCase());
                    }

                    existingPlan.setLastModified(LocalDateTime.now());

                    return ResponseEntity.ok(repository.save(existingPlan));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        return repository.findById(id)
                .map(plan -> {
                    repository.delete(plan);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
