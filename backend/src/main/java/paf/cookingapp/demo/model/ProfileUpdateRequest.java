package paf.cookingapp.demo.model;

import jakarta.validation.constraints.NotBlank;

public class ProfileUpdateRequest {
    private String id;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String bio;
    private String profilePicture;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}
