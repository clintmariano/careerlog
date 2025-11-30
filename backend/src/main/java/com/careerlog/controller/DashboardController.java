package com.careerlog.controller;

import com.careerlog.service.ApplicationService;
import com.careerlog.service.ActivityService;
import com.careerlog.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
public class DashboardController {

    private final ApplicationService applicationService;
    private final ActivityService activityService;
    private final AttachmentService attachmentService;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getDashboardOverview(
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching dashboard overview for user: {}", userId);

        Map<String, Object> overview = new HashMap<>();

        // Application statistics
        long totalApplications = applicationService.getTotalApplicationsCount(userId);
        overview.put("totalApplications", totalApplications);

        Map<String, Long> statusBreakdown = applicationService.getApplicationStatusBreakdown(userId);
        overview.put("applicationStatusBreakdown", statusBreakdown);

        // Weekly application trends (last 12 weeks)
        LocalDate twelveWeeksAgo = LocalDate.now().minusWeeks(12);
        Map<String, Long> weeklyApplications = applicationService.getApplicationsPerWeek(userId, twelveWeeksAgo);
        overview.put("weeklyApplications", weeklyApplications);

        // Recent activities
        List<Map<String, Object>> recentActivities = activityService.getRecentActivitiesByUser(userId, 10)
                .stream()
                .map(activity -> {
                    Map<String, Object> activityMap = new HashMap<>();
                    activityMap.put("id", activity.getId());
                    activityMap.put("type", activity.getType().getDisplayName());
                    activityMap.put("dateTime", activity.getDateTime());
                    activityMap.put("companyName", activity.getApplication().getCompanyName());
                    activityMap.put("jobTitle", activity.getApplication().getJobTitle());
                    return activityMap;
                })
                .toList();
        overview.put("recentActivities", recentActivities);

        // Activity statistics
        Map<String, Long> activityTypeBreakdown = activityService.getActivityTypeBreakdown(userId);
        overview.put("activityTypeBreakdown", activityTypeBreakdown);

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/applications-per-week")
    public ResponseEntity<Map<String, Long>> getApplicationsPerWeek(
            @RequestParam(defaultValue = "12") int weeks,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        LocalDate startDate = LocalDate.now().minusWeeks(weeks);

        Map<String, Long> weeklyApplications = applicationService.getApplicationsPerWeek(userId, startDate);
        return ResponseEntity.ok(weeklyApplications);
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");

        List<Map<String, Object>> recentActivities = activityService.getRecentActivitiesByUser(userId, limit)
                .stream()
                .map(activity -> {
                    Map<String, Object> activityMap = new HashMap<>();
                    activityMap.put("id", activity.getId());
                    activityMap.put("type", activity.getType().getDisplayName());
                    activityMap.put("dateTime", activity.getDateTime());
                    activityMap.put("notes", activity.getNotes());
                    activityMap.put("companyName", activity.getApplication().getCompanyName());
                    activityMap.put("jobTitle", activity.getApplication().getJobTitle());
                    activityMap.put("applicationId", activity.getApplication().getId());
                    return activityMap;
                })
                .toList();

        return ResponseEntity.ok(recentActivities);
    }

    @GetMapping("/analytics/status-summary")
    public ResponseEntity<Map<String, Object>> getStatusSummary(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");

        Map<String, Long> statusBreakdown = applicationService.getApplicationStatusBreakdown(userId);
        long totalApplications = statusBreakdown.values().stream().mapToLong(Long::longValue).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalApplications", totalApplications);
        summary.put("statusBreakdown", statusBreakdown);

        // Calculate percentages
        Map<String, Double> statusPercentages = new HashMap<>();
        statusBreakdown.forEach((status, count) -> {
            double percentage = totalApplications > 0 ? (count * 100.0 / totalApplications) : 0.0;
            statusPercentages.put(status, Math.round(percentage * 10.0) / 10.0);
        });
        summary.put("statusPercentages", statusPercentages);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics/activity-trends")
    public ResponseEntity<Map<String, Object>> getActivityTrends(
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");

        Map<String, Long> activityTypeBreakdown = activityService.getActivityTypeBreakdown(userId);
        Map<String, Long> attachmentTypeBreakdown = attachmentService.getAttachmentTypeBreakdown(userId);

        Map<String, Object> trends = new HashMap<>();
        trends.put("activityTypeBreakdown", activityTypeBreakdown);
        trends.put("attachmentTypeBreakdown", attachmentTypeBreakdown);

        return ResponseEntity.ok(trends);
    }
}