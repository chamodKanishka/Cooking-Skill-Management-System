package paf.cookingapp.demo.repository;

import paf.cookingapp.demo.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    @Query("{'courseName': ?0}")
    List<LearningPlan> findByCourseName(String courseName);
    
    @Query("{'templateType': ?0}")
    List<LearningPlan> findByTemplateType(String templateType);
    
    List<LearningPlan> findByUserId(String userId);
}