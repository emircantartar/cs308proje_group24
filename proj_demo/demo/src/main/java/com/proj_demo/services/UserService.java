package com.proj_demo.services;

import com.proj_demo.models.User;
import com.proj_demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    // Constructor-based injection
    @Autowired
    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new user.
     *
     * @param user The user object containing the user's details.
     * @return True if the user was successfully registered; false if the email already exists.
     */
    public boolean registerUser(User user) {
        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return false; // Email is already registered
        }

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return true;
    }

    /**
     * Logs in a user.
     *
     * @param email          The user's email.
     * @param plainPassword  The plain text password.
     * @return True if the login credentials are correct; false otherwise.
     */
    public boolean loginUser(String email, String plainPassword) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false; // User not found
        }

        // Verify the password
        return passwordEncoder.matches(plainPassword, user.getPassword());
    }

    /**
     * Fetches a user's profile by ID.
     *
     * @param userId The ID of the user.
     * @return The user object if found; null otherwise.
     */
    public User getUserById(String userId) {
        return userRepository.findById(userId).orElse(null);
    }
}