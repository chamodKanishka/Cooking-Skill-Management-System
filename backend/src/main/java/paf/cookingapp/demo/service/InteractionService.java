package paf.cookingapp.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import paf.cookingapp.demo.model.Interaction;
import paf.cookingapp.demo.repository.InteractionRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InteractionService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private InteractionRepository interactionRepository;

    public Interaction updateComment(String commentId, String newContent) {
        Query query = new Query(Criteria.where("id").is(commentId));
        Interaction comment = mongoTemplate.findOne(query, Interaction.class);
        
        if (comment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        
        comment.setContent(newContent);
        return mongoTemplate.save(comment);
    }

    public void deleteComment(String commentId) {
        Query query = new Query(Criteria.where("id").is(commentId));
        if (!mongoTemplate.exists(query, Interaction.class)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found");
        }
        mongoTemplate.remove(query, Interaction.class);
    }
}
