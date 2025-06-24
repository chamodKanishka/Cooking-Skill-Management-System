package paf.cookingapp.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "interactions")
public class Interaction {
    public static final String TYPE_LIKE = "LIKE";
    public static final String TYPE_COMMENT = "COMMENT";

    @Id
    private String id;
    
    // Post related fields
    private String postId;      // ID of the post that was interacted with
    private String postOwnerId; // ID of the user who owns the post
    
    // Interaction user
    private String userId;      // ID of the user who performed the interaction
    private String username;    // Username of the user who performed the interaction
    
    // Interaction details
    private String type;        // Type of interaction (LIKE or COMMENT)
    private String content;     // Content for comments
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Notification status
    private boolean read = false;
    
    // Getters
    public String getId() { return id; }
    public String getPostId() { return postId; }
    public String getPostOwnerId() { return postOwnerId; }
    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getType() { return type; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isRead() { return read; }
    
    // Setters
    public void setId(String id) { this.id = id; }
    public void setPostId(String postId) { this.postId = postId; }
    public void setPostOwnerId(String postOwnerId) { this.postOwnerId = postOwnerId; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setType(String type) { this.type = type; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setRead(boolean read) { this.read = read; }
}
