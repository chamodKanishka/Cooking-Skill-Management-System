package paf.cookingapp.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;
import paf.cookingapp.demo.model.Post;
import paf.cookingapp.demo.repository.PostRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@Service
public class PostService {
    private static final String POSTS_SEQ_KEY = "posts_sequence";

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private SequenceGeneratorService sequenceGenerator;

    public Post createPost(Post post) {
        post.setPostId(sequenceGenerator.generateSequence(POSTS_SEQ_KEY));
        post.prePersist();
        return postRepository.save(post);
    }

    public Post getPost(String id) {
        return postRepository.findById(id).orElse(null);
    }

    public Post getPostByPostId(Long postId) {
        return mongoTemplate.findOne(
            org.springframework.data.mongodb.core.query.Query.query(
                Criteria.where("postId").is(postId)
            ),
            Post.class
        );
    }

    public Post updatePost(Long postId, String title, String description) {
        Post post = getPostByPostId(postId);
        if (post != null) {
            post.setTitle(title);
            post.setDescription(description);
            post.setUpdatedAt(LocalDateTime.now());
            return postRepository.save(post);
        }
        return null;
    }

    public boolean deletePost(Long postId) {
        Post post = getPostByPostId(postId);
        if (post != null) {
            postRepository.delete(post);
            return true;
        }
        return false;
    }

    public List<Map<String, Object>> getAllPosts() {
        LookupOperation lookupOperation = LookupOperation.newLookup()
                .from("users")
                .localField("userId")
                .foreignField("_id")
                .as("userInfo");

        ProjectionOperation projectionOperation = Aggregation.project()
                .and("_id").as("id")
                .and("postId").as("postId")
                .and("title").as("title")
                .and("description").as("description")
                .and("mediaUrls").as("mediaUrls")
                .and("mediaType").as("mediaType")
                .and("createdAt").as("createdAt")
                .and("updatedAt").as("updatedAt")
                .and("userId").as("userId")
                .and("userInfo._id").as("user.id")
                .and("userInfo.username").as("user.username")
                .and("userInfo.fullName").as("user.fullName")
                .and("userInfo.profilePicture").as("user.profilePicture");

        Aggregation aggregation = Aggregation.newAggregation(
                lookupOperation,
                projectionOperation,
                sort(Sort.Direction.DESC, "createdAt")
        );

        return (List<Map<String, Object>>) (List<?>) mongoTemplate.aggregate(aggregation, "posts", Map.class).getMappedResults();
    }

    public List<Map<String, Object>> getUserPosts(String userId) {
        LookupOperation lookupOperation = LookupOperation.newLookup()
                .from("users")
                .localField("userId")
                .foreignField("_id")
                .as("userInfo");

        ProjectionOperation projectionOperation = Aggregation.project()
                .and("_id").as("id")
                .and("postId").as("postId")
                .and("title").as("title")
                .and("description").as("description")
                .and("mediaUrls").as("mediaUrls")
                .and("mediaType").as("mediaType")
                .and("createdAt").as("createdAt")
                .and("updatedAt").as("updatedAt")
                .and("userId").as("userId")
                .and("userInfo._id").as("user.id")
                .and("userInfo.username").as("user.username")
                .and("userInfo.fullName").as("user.fullName")
                .and("userInfo.profilePicture").as("user.profilePicture");

        Aggregation aggregation = Aggregation.newAggregation(
                match(Criteria.where("userId").is(userId)),
                lookupOperation,
                projectionOperation,
                sort(Sort.Direction.DESC, "createdAt")
        );

        return (List<Map<String, Object>>) (List<?>) mongoTemplate.aggregate(aggregation, "posts", Map.class).getMappedResults();
    }
}
