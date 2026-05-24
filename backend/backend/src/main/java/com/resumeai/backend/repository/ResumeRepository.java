package com.resumeai.backend.repository;

import com.resumeai.backend.entity.Resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository
        extends JpaRepository<Resume, Long> {

    List<Resume> findByEmail(
            String email
    );
}