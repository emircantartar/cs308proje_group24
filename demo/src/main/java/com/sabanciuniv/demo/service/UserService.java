package com.sabanciuniv.demo.service;

import com.sabanciuniv.demo.model.User;
import com.sabanciuniv.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(User user) {
        // Encrypt the user's password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Assign default role if not set
        if (user.getRoles().isEmpty()) {
            user.addRole("CUSTOMER"); // Assign default role
        }

        // Save the user
        userRepository.save(user);
    }
}
