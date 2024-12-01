package com.proj_demo.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.SecureRandom;
import java.util.Base64;

public class SecurityUtils {

    private static final BCryptPasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    /**
     * Hashes a plaintext password using BCrypt.
     *
     * @param plainPassword The plaintext password.
     * @return The hashed password.
     * @throws IllegalArgumentException if the plainPassword is null or empty.
     */
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isBlank()) {
            throw new IllegalArgumentException("Password cannot be null or empty.");
        }
        return PASSWORD_ENCODER.encode(plainPassword);
    }

    /**
     * Verifies a plaintext password against a hashed password.
     *
     * @param plainPassword The plaintext password.
     * @param hashedPassword The hashed password.
     * @return True if the password matches; otherwise, false.
     * @throws IllegalArgumentException if either password is null or empty.
     */
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || plainPassword.isBlank() ||
            hashedPassword == null || hashedPassword.isBlank()) {
            throw new IllegalArgumentException("Passwords cannot be null or empty.");
        }
        return PASSWORD_ENCODER.matches(plainPassword, hashedPassword);
    }

    /**
     * Generates a secure random token for authentication or other purposes.
     *
     * @param length The length of the token in bytes.
     * @return A base64-encoded secure token.
     * @throws IllegalArgumentException if the length is less than 16 bytes.
     */
    public static String generateSecureToken(int length) {
        if (length < 16) {
            throw new IllegalArgumentException("Token length must be at least 16 bytes for security.");
        }
        try {
            SecureRandom secureRandom = new SecureRandom();
            byte[] tokenBytes = new byte[length];
            secureRandom.nextBytes(tokenBytes);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate secure token.", e);
        }
    }

    /**
     * Validates the strength of a password.
     *
     * @param password The password to validate.
     * @return True if the password is strong; otherwise, false.
     */
    public static boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false; // Minimum length check
        }
        // Regex to ensure at least one uppercase, one lowercase, one digit, and one special character
        String strongPasswordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(strongPasswordPattern);
    }
}