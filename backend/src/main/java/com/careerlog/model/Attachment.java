package com.careerlog.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @NotNull(message = "Attachment type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentType type;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name must not exceed 255 characters")
    @Column(nullable = false)
    private String fileName;

    @Size(max = 500, message = "Original file name must not exceed 500 characters")
    private String originalFileName;

    @Size(max = 100, message = "Content type must not exceed 100 characters")
    private String contentType;

    private Long fileSizeBytes;

    @NotBlank(message = "Blob URL is required")
    @Column(nullable = false, length = 1000)
    private String blobUrl;

    @NotNull(message = "Uploaded at timestamp is required")
    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    public enum AttachmentType {
        RESUME("Resume"),
        COVER_LETTER("Cover Letter"),
        PORTFOLIO("Portfolio"),
        TRANSCRIPT("Transcript"),
        CERTIFICATION("Certification"),
        WORK_SAMPLES("Work Samples"),
        ASSIGNMENT_SUBMISSION("Assignment Submission"),
        OTHER("Other");

        private final String displayName;

        AttachmentType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}