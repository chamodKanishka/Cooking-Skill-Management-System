package paf.cookingapp.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Document(collection = "learning_plan")
public class LearningPlan {
    @Id
    private String id;
    
    @NotBlank(message = "userId is required")
    private String userId;
    
    @NotBlank(message = "templateType is required")
    private String templateType;
    
    @NotBlank(message = "courseName is required")
    private String courseName;
    
    @NotBlank(message = "title is required")
    private String title;
    
    private String details;
    
    @NotNull(message = "dateCreated is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime dateCreated;
    
    @NotNull(message = "lastModified is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private LocalDateTime lastModified;

    private List<TimelineStep> timeline;

    public LearningPlan() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        this.dateCreated = now;
        this.lastModified = now;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTemplateType() { return templateType; }
    public void setTemplateType(String templateType) { this.templateType = templateType; }

    public String getCourseName() { return courseName == null ? "" : courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getDateCreated() { return dateCreated; }
    public void setDateCreated(LocalDateTime dateCreated) { this.dateCreated = dateCreated; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }

    public List<TimelineStep> getTimeline() { return timeline; }
    public void setTimeline(List<TimelineStep> timeline) { this.timeline = timeline; }

    @Override
    public String toString() {
        return String.format(
            "LearningPlan[id='%s', courseName='%s', title='%s', details='%s', templateType='%s', timeline='%s']",
            id, courseName, title, details, templateType, timeline
        );
    }
}