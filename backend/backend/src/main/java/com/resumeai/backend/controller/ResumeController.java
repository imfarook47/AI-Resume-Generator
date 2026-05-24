package com.resumeai.backend.controller;

import com.resumeai.backend.entity.Resume;
import com.resumeai.backend.repository.ResumeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeRepository resumeRepository;

    // SAVE RESUME
    @PostMapping("/save")
    public String saveResume(
            @RequestBody Resume resume
    ) {

        if (resume == null) {

            return "Resume payload is missing";
        }

        // SET CURRENT DATE
        resume.setCreatedDate(
                LocalDate.now()
        );

        // SAVE TO DATABASE
        resumeRepository.save(resume);

        return "Resume saved successfully";
    }

    // GET USER RESUME HISTORY
    @GetMapping("/user/{email}")
    public List<Resume> getUserResumes(
            @PathVariable String email
    ) {

        return resumeRepository
                .findByEmail(email);
    }
}