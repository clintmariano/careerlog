package com.careerlog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @NotNull(message = "Activity type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;

    @NotNull(message = "Date and time is required")
    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Size(max = 500, message = "Location must not exceed 500 characters")
    private String location;

    @Column(length = 1000)
    private String participants;

    private Integer durationMinutes;

    public enum ActivityType {
        APPLICATION_SUBMITTED("Application Submitted"),
        PHONE_SCREEN("Phone Screen"),
        TECHNICAL_INTERVIEW("Technical Interview"),
        BEHAVIORAL_INTERVIEW("Behavioral Interview"),
        SYSTEM_DESIGN("System Design Interview"),
        CODING_TEST("Coding Test"),
        TAKE_HOME_ASSIGNMENT("Take Home Assignment"),
        FINAL_ROUND("Final Round Interview"),
        OFFER_CALL("Offer Call"),
        REJECTION("Rejection"),
        FOLLOW_UP_EMAIL("Follow-up Email"),
        NETWORKING_COFFEE("Networking Coffee"),
        INFO_SESSION("Information Session"),
        REFERENCE_CHECK("Reference Check"),
        OTHER("Other");

        private final String displayName;

        ActivityType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}