package paf.cookingapp.demo.repository;

import paf.cookingapp.demo.model.LearningProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningProgressRepository extends MongoRepository<LearningProgress, String> {
    @Query("{'courseName': ?0}")
    List<LearningProgress> findByCourseName(String courseName);
    
    @Query("{'templateType': ?0}")
    List<LearningProgress> findByTemplateType(String templateType);
    
    List<LearningProgress> findByUserId(String userId);
}
