package com.careerlog.controller;

import com.careerlog.model.Attachment;
import com.careerlog.service.AttachmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByApplication(@PathVariable Long applicationId,
                                                                       @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Fetching attachments for application {} by user: {}", applicationId, userId);

        List<Attachment> attachments = attachmentService.getAttachmentsByApplication(applicationId);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Attachment>> getAttachmentsByUser(
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching recent attachments for user: {}", userId);

        List<Attachment> attachments = attachmentService.getAttachmentsByUser(userId)
                .stream()
                .limit(limit)
                .toList();

        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachment(@PathVariable Long id,
                                                    @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Fetching attachment {} for user: {}", id, userId);

        Attachment attachment = attachmentService.getAttachmentById(id, userId);
        return ResponseEntity.ok(attachment);
    }

    @PostMapping
    public ResponseEntity<Attachment> createAttachment(@Valid @RequestBody Attachment attachment,
                                                       @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Creating new attachment for user: {}", userId);

        Attachment createdAttachment = attachmentService.createAttachment(attachment);
        return ResponseEntity.ok(createdAttachment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Deleting attachment {} for user: {}", id, userId);

        attachmentService.deleteAttachment(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/application/{applicationId}/type/{type}")
    public ResponseEntity<List<Attachment>> getAttachmentsByApplicationAndType(
            @PathVariable Long applicationId,
            @PathVariable Attachment.AttachmentType type,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching {} attachments for application {} by user: {}", type, applicationId, userId);

        List<Attachment> attachments = attachmentService.getAttachmentsByApplicationAndType(applicationId, type);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/analytics/type-breakdown")
    public ResponseEntity<Map<String, Long>> getAttachmentTypeBreakdown(
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching attachment type breakdown for user: {}", userId);

        Map<String, Long> breakdown = attachmentService.getAttachmentTypeBreakdown(userId);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/application/{applicationId}/count")
    public ResponseEntity<Map<String, Long>> getAttachmentCountByApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching attachment count for application {} by user: {}", applicationId, userId);

        long count = attachmentService.getAttachmentCountByApplication(applicationId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}