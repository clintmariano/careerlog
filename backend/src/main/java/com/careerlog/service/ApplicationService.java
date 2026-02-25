package com.careerlog.service;

import com.careerlog.model.Application;
import com.careerlog.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public Page<Application> getApplicationsByUser(String userId, Pageable pageable) {
        return applicationRepository.findByUserId(userId, pageable);
    }

    public Page<Application> searchApplications(String userId, String searchTerm, Pageable pageable) {
        return applicationRepository.findByUserIdAndSearchTerm(userId, searchTerm, pageable);
    }

    public Application getApplicationById(Long id, String userId) {
        return applicationRepository.findById(id)
                .filter(app -> app.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));
    }

    public Application createApplication(Application application) {
        log.info("Creating new application for user: {} at company: {}",
                application.getUserId(), application.getCompanyName());

        if (applicationRepository.existsByUserIdAndCompanyNameAndJobTitle(
                application.getUserId(), application.getCompanyName(), application.getJobTitle())) {
            throw new RuntimeException("Duplicate application already exists");
        }

        if (application.getApplicationDate() == null) {
            application.setApplicationDate(LocalDate.now());
        }

        return applicationRepository.save(application);
    }

    public Application updateApplication(Long id, Application applicationDetails, String userId) {
        log.info("Updating application {} for user: {}", id, userId);

        Application existingApplication = getApplicationById(id, userId);

        existingApplication.setCompanyName(applicationDetails.getCompanyName());
        existingApplication.setJobTitle(applicationDetails.getJobTitle());
        existingApplication.setLocation(applicationDetails.getLocation());
        existingApplication.setTechStack(applicationDetails.getTechStack());
        existingApplication.setStatus(applicationDetails.getStatus());
        existingApplication.setSalaryRange(applicationDetails.getSalaryRange());
        existingApplication.setSource(applicationDetails.getSource());
        existingApplication.setDescription(applicationDetails.getDescription());

        return applicationRepository.save(existingApplication);
    }

    public void deleteApplication(Long id, String userId) {
        log.info("Deleting application {} for user: {}", id, userId);

        Application application = getApplicationById(id, userId);
        applicationRepository.delete(application);
    }

    public List<Application> getApplicationsByStatus(String userId, Application.ApplicationStatus status) {
        return applicationRepository.findByUserIdAndStatus(userId, status);
    }

    public long getTotalApplicationsCount(String userId) {
        return applicationRepository.countByUserIdAndApplicationDateAfter(userId, LocalDate.of(2020, 1, 1));
    }

    public Map<String, Long> getApplicationStatusBreakdown(String userId) {
        List<Object[]> results = applicationRepository.getApplicationStatusBreakdown(userId);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> ((Application.ApplicationStatus) result[0]).getDisplayName(),
                        result -> (Long) result[1]
                ));
    }

    public Map<String, Long> getApplicationsPerWeek(String userId, LocalDate startDate) {
        List<Object[]> results = applicationRepository.getApplicationsPerWeek(userId, startDate);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> result[0].toString(),
                        result -> (Long) result[1]
                ));
    }
}