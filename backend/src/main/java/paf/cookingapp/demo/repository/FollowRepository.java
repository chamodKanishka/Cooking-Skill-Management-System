package paf.cookingapp.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import paf.cookingapp.demo.model.Follow;
import java.util.Optional;

public interface FollowRepository extends MongoRepository<Follow, String> {
    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
}
