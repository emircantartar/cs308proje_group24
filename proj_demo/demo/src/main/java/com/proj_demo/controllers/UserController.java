package com.proj_demo.controllers;

import com.proj_demo.models.User;
import com.proj_demo.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        try {
            boolean success = userService.registerUser(user);
            if (success) {
                return ResponseEntity.ok("User registered successfully.");
            } else {
                return ResponseEntity.badRequest().body("Failed to register user. Email might already be in use.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while registering the user.");
        }
    }

    // Login a user
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(
            @RequestParam String email,
            @RequestParam String password) {
        try {
            boolean success = userService.loginUser(email, password);
            if (success) {
                return ResponseEntity.ok("Login successful.");
            } else {
                return ResponseEntity.badRequest().body("Invalid email or password.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while logging in.");
        }
    }

    // Get user profile by ID
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}