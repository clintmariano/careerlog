package com.careerlog.controller;

import com.careerlog.model.Application;
import com.careerlog.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<Page<Application>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching applications for user: {} with search term: {}", userId, search);

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Application> applications;
        if (search != null && !search.trim().isEmpty()) {
            applications = applicationService.searchApplications(userId, search.trim(), pageable);
        } else {
            applications = applicationService.getApplicationsByUser(userId, pageable);
        }

        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplication(@PathVariable Long id,
                                                   @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Fetching application {} for user: {}", id, userId);

        Application application = applicationService.getApplicationById(id, userId);
        return ResponseEntity.ok(application);
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(@Valid @RequestBody Application application,
                                                        @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Creating new application for user: {}", userId);

        application.setUserId(userId);
        Application createdApplication = applicationService.createApplication(application);

        return ResponseEntity.ok(createdApplication);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable Long id,
                                                        @Valid @RequestBody Application applicationDetails,
                                                        @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Updating application {} for user: {}", id, userId);

        Application updatedApplication = applicationService.updateApplication(id, applicationDetails, userId);
        return ResponseEntity.ok(updatedApplication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Deleting application {} for user: {}", id, userId);

        applicationService.deleteApplication(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Application>> getApplicationsByStatus(
            @PathVariable Application.ApplicationStatus status,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching applications with status {} for user: {}", status, userId);

        List<Application> applications = applicationService.getApplicationsByStatus(userId, status);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/analytics/status-breakdown")
    public ResponseEntity<Map<String, Long>> getApplicationStatusBreakdown(
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching application status breakdown for user: {}", userId);

        Map<String, Long> breakdown = applicationService.getApplicationStatusBreakdown(userId);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/analytics/weekly-count")
    public ResponseEntity<Map<String, Long>> getApplicationsPerWeek(
            @RequestParam(required = false) Integer weeks,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching weekly application count for user: {}", userId);

        java.time.LocalDate startDate = weeks != null ?
                java.time.LocalDate.now().minusWeeks(weeks) :
                java.time.LocalDate.now().minusMonths(3);

        Map<String, Long> weeklyCount = applicationService.getApplicationsPerWeek(userId, startDate);
        return ResponseEntity.ok(weeklyCount);
    }

    @GetMapping("/analytics/total-count")
    public ResponseEntity<Map<String, Long>> getTotalApplicationsCount(
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        long totalCount = applicationService.getTotalApplicationsCount(userId);

        return ResponseEntity.ok(Map.of("totalApplications", totalCount));
    }
}