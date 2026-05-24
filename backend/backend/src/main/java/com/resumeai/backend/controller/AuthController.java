package com.resumeai.backend.controller;

import com.resumeai.backend.entity.User;
import com.resumeai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // REGISTER
    @PostMapping("/register")
    public String register(
            @RequestBody User user
    ) {

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser != null) {

            return "User already exists";
        }

        userRepository.save(user);

        return "Registration successful";
    }

    // LOGIN
    @PostMapping("/login")
    public String login(
            @RequestBody User user
    ) {

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (existingUser == null) {

            return "User not found";
        }

        if (!existingUser.getPassword()
                .equals(user.getPassword())) {

            return "Invalid password";
        }

        return "Login successful";
    }
}