package paf.cookingapp.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import paf.cookingapp.demo.model.User;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailOrUsername(String email, String username);
}
