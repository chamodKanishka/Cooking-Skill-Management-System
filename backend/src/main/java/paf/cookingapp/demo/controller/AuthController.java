package paf.cookingapp.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import paf.cookingapp.demo.model.User;
import paf.cookingapp.demo.repository.UserRepository;
import paf.cookingapp.demo.security.JwtTokenProvider;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import paf.cookingapp.demo.model.ProfileUpdateRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final String GOOGLE_CLIENT_ID = "351068781419-3pu3srbviiea5oasgf35akgj8nfc8nid.apps.googleusercontent.com";    private final GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
            .build();

    @PostMapping("/register")    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already in use!");
            }
            if (userRepository.existsByUsername(user.getUsername())) {
                return ResponseEntity.badRequest().body("Username is already in use!");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);

            String token = jwtTokenProvider.generateToken(savedUser.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", savedUser);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // For debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }    }    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody Map<String, String> loginRequest) {
        String emailOrUsername = loginRequest.get("email");
        String password = loginRequest.get("password");

        return userRepository.findByEmailOrUsername(emailOrUsername, emailOrUsername)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        String token = jwtTokenProvider.generateToken(user.getEmail());
                        Map<String, Object> response = new HashMap<>();
                        response.put("token", token);
                        response.put("user", user);
                        return ResponseEntity.ok(response);
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("Invalid password");
                    }
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> handleGoogleAuth(@RequestBody Map<String, String> body) {
        try {
            GoogleIdToken idToken = verifier.verify(body.get("credential"));
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                
                User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(email);
                        newUser.setUsername((String) payload.get("name"));
                        // Set a secure random password for Google users
                        newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                        return userRepository.save(newUser);
                    });

                String token = jwtTokenProvider.generateToken(email);
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", user);
                
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body("Invalid Google token");
        } catch (Exception e) {
            e.printStackTrace(); // Add logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing Google authentication: " + e.getMessage());
        }
    }    @PostMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        try {
            return userRepository.findById(request.getId())
                .map(existingUser -> {
                    // Update profile fields
                    existingUser.setFullName(request.getFullName());
                    existingUser.setBio(request.getBio());
                    if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
                        existingUser.setProfilePicture(request.getProfilePicture());
                    }
                    
                    User savedUser = userRepository.save(existingUser);
                    
                    // Create a response object without sensitive information
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", savedUser.getId());
                    response.put("username", savedUser.getUsername());
                    response.put("email", savedUser.getEmail());
                    response.put("fullName", savedUser.getFullName());
                    response.put("bio", savedUser.getBio());
                    response.put("profilePicture", savedUser.getProfilePicture());
                    
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("message", "User not found")));
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Profile update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
}
