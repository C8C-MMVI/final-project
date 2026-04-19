package com.system.technologs.controller;

import com.system.technologs.model.User;
import com.system.technologs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // ── GET /api/users ──
    // Get all users (Admin only)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "users", users
        ));
    }

    // ── GET /api/users/{id} ──
    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(
            @PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "user", user
        ));
    }

    // ── GET /api/users/role/{role} ──
    // Get users by role
    @GetMapping("/role/{role}")
    public ResponseEntity<Map<String, Object>> getUsersByRole(
            @PathVariable String role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "users", users
        ));
    }

    // ── GET /api/users/status/{status} ──
    // Get users by status
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getUsersByStatus(
            @PathVariable String status) {
        List<User> users = userService.getUsersByStatus(status);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "users", users
        ));
    }

    // ── PATCH /api/users/{id}/status ──
    // Update user status (Admin only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Status is required."
            ));
        }

        User updated = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User status updated successfully.",
            "user", updated
        ));
    }

    // ── PATCH /api/users/{id}/role ──
    // Update user role (Admin only)
    @PatchMapping("/{id}/role")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String role = body.get("role");
        if (role == null || role.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Role is required."
            ));
        }

        User updated = userService.updateUserRole(id, role);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User role updated successfully.",
            "user", updated
        ));
    }

    // ── DELETE /api/users/{id} ──
    // Delete user (Admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User deleted successfully."
        ));
    }
}