package paf.cookingapp.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import paf.cookingapp.demo.model.Interaction;

public interface InteractionRepository extends MongoRepository<Interaction, String> {
}
