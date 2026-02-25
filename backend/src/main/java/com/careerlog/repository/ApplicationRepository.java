package com.careerlog.repository;

import com.careerlog.model.Application;
import com.careerlog.model.Application.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByUserId(String userId, Pageable pageable);

    List<Application> findByUserIdAndStatus(String userId, ApplicationStatus status);

    @Query("SELECT a FROM Application a WHERE a.userId = :userId AND " +
           "(LOWER(a.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> findByUserIdAndSearchTerm(@Param("userId") String userId,
                                               @Param("search") String search,
                                               Pageable pageable);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.userId = :userId AND a.applicationDate >= :startDate")
    long countByUserIdAndApplicationDateAfter(@Param("userId") String userId,
                                             @Param("startDate") LocalDate startDate);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.userId = :userId GROUP BY a.status")
    List<Object[]> getApplicationStatusBreakdown(@Param("userId") String userId);

    @Query("SELECT DATE_TRUNC('week', a.applicationDate), COUNT(a) FROM Application a " +
           "WHERE a.userId = :userId AND a.applicationDate >= :startDate " +
           "GROUP BY DATE_TRUNC('week', a.applicationDate) ORDER BY DATE_TRUNC('week', a.applicationDate)")
    List<Object[]> getApplicationsPerWeek(@Param("userId") String userId,
                                        @Param("startDate") LocalDate startDate);

    boolean existsByUserIdAndCompanyNameAndJobTitle(String userId, String companyName, String jobTitle);
}