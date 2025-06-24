package paf.cookingapp.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "follows")
public class Follow {
    @Id
    private String id;
    private String followerId;
    private String followingId;
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters
    public String getId() { return id; }
    public String getFollowerId() { return followerId; }
    public String getFollowingId() { return followingId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setFollowerId(String followerId) { this.followerId = followerId; }
    public void setFollowingId(String followingId) { this.followingId = followingId; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
