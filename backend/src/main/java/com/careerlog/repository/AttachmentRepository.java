package com.careerlog.repository;

import com.careerlog.model.Attachment;
import com.careerlog.model.Attachment.AttachmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByApplicationIdOrderByUploadedAtDesc(Long applicationId);

    List<Attachment> findByApplicationIdAndTypeOrderByUploadedAtDesc(Long applicationId, AttachmentType type);

    @Query("SELECT a FROM Attachment a WHERE a.application.id IN " +
           "(SELECT app.id FROM Application app WHERE app.userId = :userId) " +
           "ORDER BY a.uploadedAt DESC")
    List<Attachment> findByUserIdOrderByUploadedAtDesc(@Param("userId") String userId);

    boolean existsByApplicationIdAndFileName(Long applicationId, String fileName);

    long countByApplicationId(Long applicationId);
}