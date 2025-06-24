package paf.cookingapp.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import paf.cookingapp.demo.model.User;
import paf.cookingapp.demo.repository.UserRepository;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id) {
        return userRepository.findById(id)
            .map(user -> {
                // Create a response without sensitive information
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("username", user.getUsername());
                response.put("fullName", user.getFullName());
                response.put("bio", user.getBio());
                response.put("profilePicture", user.getProfilePicture());
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.notFound().build());
    }    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        String searchQuery = query.trim().toLowerCase();
        String[] searchTerms = searchQuery.split("\\s+");
        
        List<Criteria> criteriaList = new ArrayList<>();
        for (String term : searchTerms) {
            // Don't quote the search term to allow partial matches
            String regexPattern = ".*" + term + ".*";
            Pattern pattern = Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE);
            
            criteriaList.add(new Criteria().orOperator(
                Criteria.where("username").regex(pattern),
                Criteria.where("fullName").regex(pattern),
                Criteria.where("email").regex(pattern),
                Criteria.where("bio").regex(pattern)
            ));
        }        // Combine all criteria with AND operator (each term must match something)
        Criteria combinedCriteria = new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));
        Query mongoQuery = new Query(combinedCriteria);
        List<User> users = mongoTemplate.find(mongoQuery, User.class);

        // Map users to DTOs without sensitive information
        List<Map<String, Object>> userDTOs = users.stream()
            .map(user -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", user.getId());
                dto.put("username", user.getUsername());
                dto.put("fullName", user.getFullName());
                dto.put("bio", user.getBio());
                dto.put("profilePicture", user.getProfilePicture());
                return dto;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }
}
