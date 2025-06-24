package paf.cookingapp.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import paf.cookingapp.demo.model.Post;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
    List<Post> findAllByOrderByCreatedAtDesc();
}
