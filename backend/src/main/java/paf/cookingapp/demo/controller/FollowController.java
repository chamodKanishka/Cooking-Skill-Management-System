package paf.cookingapp.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import paf.cookingapp.demo.model.Follow;
import paf.cookingapp.demo.repository.FollowRepository;
import java.util.Map;

@RestController
@RequestMapping("/api/follow")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FollowController {

    @Autowired
    private FollowRepository followRepository;

    @PostMapping("/{followerId}/{followingId}")
    public ResponseEntity<?> followUser(@PathVariable String followerId, @PathVariable String followingId) {
        if (followerId.equals(followingId)) {
            return ResponseEntity.badRequest().body("Users cannot follow themselves");
        }

        Follow follow = new Follow();
        follow.setFollowerId(followerId);
        follow.setFollowingId(followingId);
        followRepository.save(follow);
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{followerId}/{followingId}")
    public ResponseEntity<?> unfollowUser(@PathVariable String followerId, @PathVariable String followingId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
            .ifPresent(follow -> followRepository.delete(follow));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{followerId}/{followingId}")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @PathVariable String followerId,
            @PathVariable String followingId) {
        boolean isFollowing = followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }
}
