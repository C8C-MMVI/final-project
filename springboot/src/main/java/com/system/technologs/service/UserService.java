package com.system.technologs.service;

import com.system.technologs.model.User;
import com.system.technologs.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // ── Get All Users ──
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Get User By ID ──
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                    "User not found with id: " + userId));
    }

    // ── Get Users By Role ──
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role);
    }

    // ── Get Users By Status ──
    public List<User> getUsersByStatus(String status) {
        return userRepository.findByStatus(status);
    }

    // ── Update User Status ──
    public User updateUserStatus(Long userId, String status) {
        User user = getUserById(userId);

        List<String> validStatuses = List.of("active", "inactive");
        if (!validStatuses.contains(status)) {
            throw new IllegalArgumentException(
                "Invalid status: " + status);
        }

        user.setStatus(status);
        return userRepository.save(user);
    }

    // ── Update User Role ──
    public User updateUserRole(Long userId, String role) {
        User user = getUserById(userId);

        List<String> validRoles = List.of(
            "admin", "owner", "technician", "customer");
        if (!validRoles.contains(role)) {
            throw new IllegalArgumentException(
                "Invalid role: " + role);
        }

        user.setRole(role);
        return userRepository.save(user);
    }

    // ── Delete User ──
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException(
                "User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
}