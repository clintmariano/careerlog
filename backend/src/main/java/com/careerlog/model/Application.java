package com.careerlog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    @Column(nullable = false)
    private String companyName;

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    @Column(nullable = false)
    private String jobTitle;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Column(length = 500)
    private String techStack;

    @NotNull(message = "Application date is required")
    @Column(nullable = false)
    private LocalDate applicationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Size(max = 100, message = "Salary range must not exceed 100 characters")
    private String salaryRange;

    @Size(max = 200, message = "Source must not exceed 200 characters")
    private String source;

    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Activity> activities;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Attachment> attachments;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ApplicationStatus.APPLIED;
        }
    }

    public enum ApplicationStatus {
        APPLIED("Applied"),
        PHONE_SCREEN("Phone Screen"),
        TECHNICAL_INTERVIEW("Technical Interview"),
        BEHAVIORAL_INTERVIEW("Behavioral Interview"),
        FINAL_ROUND("Final Round"),
        OFFER("Offer"),
        REJECTED("Rejected"),
        WITHDRAWN("Withdrawn");

        private final String displayName;

        ApplicationStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}