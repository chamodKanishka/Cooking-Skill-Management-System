package paf.cookingapp.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import paf.cookingapp.demo.model.Interaction;
import paf.cookingapp.demo.model.Post;
import paf.cookingapp.demo.model.User;
import paf.cookingapp.demo.repository.InteractionRepository;
import paf.cookingapp.demo.repository.PostRepository;
import paf.cookingapp.demo.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import java.util.List;
import java.util.Map;
import paf.cookingapp.demo.service.InteractionService;
import org.springframework.web.server.ResponseStatusException;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import java.util.HashMap;
import java.time.LocalDateTime;

@RestController
@CrossOrigin(
    origins = "http://localhost:3000",
    allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With"},
    exposedHeaders = {"Access-Control-Allow-Origin"},
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    },
    allowCredentials = "true"
)
@RequestMapping("/api")
public class InteractionController {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private InteractionService interactionService;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Likes endpoints
    @PostMapping("/likes")
    public ResponseEntity<?> createLike(@RequestBody Map<String, String> request) {
        try {
            String postIdStr = request.get("postId");
            String userId = request.get("userId");
            
            if (postIdStr == null || userId == null || postIdStr.trim().isEmpty() || userId.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "postId and userId are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Convert to Long for Post lookup
            Long postIdLong;
            try {
                postIdLong = Long.parseLong(postIdStr);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid post ID format"));
            }

            // Get post details using numeric ID
            // Get post using the PostService's getPostByPostId method
            Post post = mongoTemplate.findOne(
                org.springframework.data.mongodb.core.query.Query.query(
                    Criteria.where("postId").is(postIdLong)
                ),
                Post.class
            );
            if (post == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
            }

            // Check for existing like
            Query existingLikeQuery = new Query(
                Criteria.where("postId").is(postIdStr)
                    .and("userId").is(userId)
                    .and("type").is(Interaction.TYPE_LIKE)
            );
            
            if (mongoTemplate.exists(existingLikeQuery, Interaction.class)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Like already exists"));
            }

            // Get user details
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

            // Create like
            Interaction like = new Interaction();
            like.setPostId(postIdStr);  // Keep as String in Interaction
            like.setPostOwnerId(post.getUserId());
            like.setUserId(userId);
            like.setUsername(user.getUsername());
            like.setType(Interaction.TYPE_LIKE);
            like.setCreatedAt(LocalDateTime.now());
            like.setRead(false);

            Interaction savedLike = interactionRepository.save(like);
            return ResponseEntity.ok(savedLike);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating like: " + e.getMessage()));
        }
    }

    @DeleteMapping("/likes/by-post/{postId}/user/{userId}")
    public ResponseEntity<?> deleteLike(@PathVariable String postId, @PathVariable String userId) {
        try {
            // Convert postId to Long and verify it's valid
            Long postIdLong;
            try {
                postIdLong = Long.parseLong(postId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid post ID format"));
            }

            // Verify post exists
            Post post = mongoTemplate.findOne(
                org.springframework.data.mongodb.core.query.Query.query(
                    Criteria.where("postId").is(postIdLong)
                ),
                Post.class
            );
            if (post == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
            }

            // Find and delete the like
            Query query = new Query(
                Criteria.where("postId").is(postId)
                    .and("userId").is(userId)
                    .and("type").is(Interaction.TYPE_LIKE)
            );
            
            Interaction like = mongoTemplate.findOne(query, Interaction.class);
            if (like == null) {
                return ResponseEntity.notFound().build();
            }
            
            mongoTemplate.remove(query, Interaction.class);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting like: " + e.getMessage()));
        }
    }

    @GetMapping("/likes/count-by-post/{postId}")
    public ResponseEntity<?> getLikeCountByPost(@PathVariable String postId) {
        try {
            Query query = new Query(
                Criteria.where("postId").is(postId)
                    .and("type").is(Interaction.TYPE_LIKE)
            );
            long count = mongoTemplate.count(query, Interaction.class);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error getting like count: " + e.getMessage()));
        }
    }

    @GetMapping("/likes/by-post/{postId}/user/{userId}")
    public ResponseEntity<?> checkUserLiked(@PathVariable String postId, @PathVariable String userId) {
        try {
            // First verify post exists
            Long postIdLong;
            try {
                postIdLong = Long.parseLong(postId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid post ID format"));
            }

            Post post = mongoTemplate.findOne(
                org.springframework.data.mongodb.core.query.Query.query(
                    Criteria.where("postId").is(postIdLong)
                ),
                Post.class
            );
            if (post == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
            }

            Query query = new Query(
                Criteria.where("postId").is(postId)
                    .and("userId").is(userId)
                    .and("type").is(Interaction.TYPE_LIKE)
            );
            boolean hasLiked = mongoTemplate.exists(query, Interaction.class);
            return ResponseEntity.ok(hasLiked);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error checking like status: " + e.getMessage()));
        }
    }

    // Comments endpoints
    @GetMapping("/comments/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable String postId) {
        try {
            // Verify post exists to fail fast if the post doesn't exist
            Long postIdLong;
            try {
                postIdLong = Long.parseLong(postId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid post ID format"));
            }

            // First check if post exists
            Post post = mongoTemplate.findOne(
                Query.query(Criteria.where("postId").is(postIdLong)),
                Post.class
            );
            if (post == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
            }

            // Then get comments for the post
            Query query = new Query(
                Criteria.where("postId").is(postId)
                    .and("type").is(Interaction.TYPE_COMMENT)
            );
            query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
            
            List<Interaction> comments = mongoTemplate.find(query, Interaction.class);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching comments: " + e.getMessage()));
        }
    }

    @PostMapping("/comments/{postId}")
    public ResponseEntity<?> createComment(@PathVariable String postId, @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String content = request.get("content");
            
            if (userId == null || content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId and content are required"));
            }

            // Convert to Long for Post lookup
            Long postIdLong;
            try {
                postIdLong = Long.parseLong(postId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid post ID format"));
            }

            // Get post details using numeric ID
            Post post = mongoTemplate.findOne(
                Query.query(Criteria.where("postId").is(postIdLong)),
                Post.class
            );
            if (post == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Post not found"));
            }

            // Get user details for username
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

            Interaction comment = new Interaction();
            comment.setPostId(postId);
            comment.setPostOwnerId(post.getUserId());
            comment.setUserId(userId);
            comment.setUsername(user.getUsername());
            comment.setType(Interaction.TYPE_COMMENT);
            comment.setContent(content);
            comment.setCreatedAt(LocalDateTime.now());
            comment.setRead(false);
            
            Interaction savedComment = interactionRepository.save(comment);
            return ResponseEntity.ok(savedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating comment: " + e.getMessage()));
        }
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable String commentId, @RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "content is required"));
            }
            
            Interaction updatedComment = interactionService.updateComment(commentId, content);
            return ResponseEntity.ok(updatedComment);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating comment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        try {
            interactionService.deleteComment(commentId);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error deleting comment: " + e.getMessage()));
        }
    }

    // Notifications endpoints
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(
        @RequestParam String userId,
        @RequestParam(defaultValue = "false") boolean unreadOnly,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        try {
            // Query directly using postOwnerId since it's stored in the interaction
            Criteria criteria = new Criteria();
            criteria.andOperator(
                Criteria.where("postOwnerId").is(userId),  // Get interactions for posts owned by this user
                Criteria.where("userId").ne(userId),       // Interaction is not by the user themselves
                Criteria.where("type").in(Interaction.TYPE_LIKE, Interaction.TYPE_COMMENT) // Only like and comment interactions
            );

            if (unreadOnly) {
                criteria = criteria.and("read").is(false);
            }

            // Build query with pagination and sort by most recent first
            Query query = Query.query(criteria)
                .with(Sort.by(Sort.Direction.DESC, "createdAt"))
                .skip(page * size)
                .limit(size);

            List<Interaction> notifications = mongoTemplate.find(query, Interaction.class);
            
            // Mark notifications as read if they weren't already
            if (!notifications.isEmpty() && !unreadOnly) {
                Query updateQuery = Query.query(criteria.and("read").is(false));
                Update update = Update.update("read", true);
                mongoTemplate.updateMulti(updateQuery, update, Interaction.class);
            }

            // Get post info for each notification with proper post lookup
            return ResponseEntity.ok(notifications.stream()
                .map(notification -> {
                    Map<String, Object> enriched = new HashMap<>();
                    enriched.put("id", notification.getId());
                    enriched.put("username", notification.getUsername());  // Changed from userId to username
                    enriched.put("type", notification.getType());
                    enriched.put("content", notification.getContent());
                    enriched.put("createdAt", notification.getCreatedAt());
                    enriched.put("read", notification.isRead());
                    
                    // Add user profile picture
                    User user = userRepository.findById(notification.getUserId())
                        .orElse(null);
                    if (user != null && user.getProfilePicture() != null) {
                        enriched.put("profilePicture", user.getProfilePicture());
                    }

                    // Find associated post
                    Post post = mongoTemplate.findOne(
                        Query.query(Criteria.where("id").is(notification.getPostId())),
                        Post.class
                    );
                    
                    if (post != null) {
                        Map<String, Object> postInfo = new HashMap<>();
                        postInfo.put("id", post.getId());
                        postInfo.put("title", post.getTitle());
                        if (post.getMediaUrls() != null && !post.getMediaUrls().isEmpty()) {
                            postInfo.put("thumbnailUrl", post.getMediaUrls().get(0));
                        }
                        enriched.put("post", postInfo);
                    }

                    return enriched;
                })
                .collect(Collectors.toList()));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error fetching notifications: " + e.getMessage()));
        }
    }

    @GetMapping("/notifications/unread/count")
    public ResponseEntity<?> getUnreadNotificationsCount(@RequestParam String userId) {
        try {
            // Build criteria for counting unread notifications using postOwnerId
            Criteria criteria = new Criteria();
            criteria.andOperator(
                Criteria.where("postOwnerId").is(userId),   // Get interactions for posts owned by this user
                Criteria.where("userId").ne(userId),        // Interaction is not by the user themselves
                Criteria.where("type").in(Interaction.TYPE_LIKE, Interaction.TYPE_COMMENT), // Only like and comment interactions
                Criteria.where("read").is(false)           // Only unread notifications
            );

            Query query = Query.query(criteria);
            long count = mongoTemplate.count(query, Interaction.class);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error getting unread count: " + e.getMessage()));
        }
    }
}
