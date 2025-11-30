package com.careerlog.service;

import com.careerlog.model.Attachment;
import com.careerlog.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    public List<Attachment> getAttachmentsByApplication(Long applicationId) {
        return attachmentRepository.findByApplicationIdOrderByUploadedAtDesc(applicationId);
    }

    public List<Attachment> getAttachmentsByUser(String userId) {
        return attachmentRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    public Attachment getAttachmentById(Long id, String userId) {
        return attachmentRepository.findById(id)
                .filter(attachment -> {
                    String attachmentUserId = attachment.getApplication().getUserId();
                    return attachmentUserId.equals(userId);
                })
                .orElseThrow(() -> new RuntimeException("Attachment not found or access denied"));
    }

    public Attachment createAttachment(Attachment attachment) {
        log.info("Creating new attachment of type {} for application {}",
                attachment.getType(), attachment.getApplication().getId());

        if (attachment.getUploadedAt() == null) {
            attachment.setUploadedAt(LocalDateTime.now());
        }

        if (attachment.getOriginalFileName() == null) {
            attachment.setOriginalFileName(attachment.getFileName());
        }

        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(Long id, String userId) {
        log.info("Deleting attachment {} for user: {}", id, userId);

        Attachment attachment = getAttachmentById(id, userId);
        attachmentRepository.delete(attachment);
    }

    public List<Attachment> getAttachmentsByApplicationAndType(Long applicationId, Attachment.AttachmentType type) {
        return attachmentRepository.findByApplicationIdAndTypeOrderByUploadedAtDesc(applicationId, type);
    }

    public boolean attachmentExistsForApplication(Long applicationId, String fileName) {
        return attachmentRepository.existsByApplicationIdAndFileName(applicationId, fileName);
    }

    public long getAttachmentCountByApplication(Long applicationId) {
        return attachmentRepository.countByApplicationId(applicationId);
    }

    public Map<String, Long> getAttachmentTypeBreakdown(String userId) {
        List<Attachment> attachments = attachmentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        return attachments.stream()
                .collect(Collectors.groupingBy(
                        attachment -> attachment.getType().getDisplayName(),
                        Collectors.counting()
                ));
    }
}