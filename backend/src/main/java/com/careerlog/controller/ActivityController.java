package com.careerlog.controller;

import com.careerlog.model.Activity;
import com.careerlog.service.ActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}")
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Activity>> getActivitiesByApplication(@PathVariable Long applicationId,
                                                                     @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Fetching activities for application {} by user: {}", applicationId, userId);

        List<Activity> activities = activityService.getActivitiesByApplication(applicationId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Activity>> getActivitiesByUser(
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching recent activities for user: {}", userId);

        List<Activity> activities = activityService.getRecentActivitiesByUser(userId, limit);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable Long id,
                                              @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Fetching activity {} for user: {}", id, userId);

        Activity activity = activityService.getActivityById(id, userId);
        return ResponseEntity.ok(activity);
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(@Valid @RequestBody Activity activity,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Creating new activity for user: {}", userId);

        Activity createdActivity = activityService.createActivity(activity);
        return ResponseEntity.ok(createdActivity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable Long id,
                                                  @Valid @RequestBody Activity activityDetails,
                                                  @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Updating activity {} for user: {}", id, userId);

        Activity updatedActivity = activityService.updateActivity(id, activityDetails, userId);
        return ResponseEntity.ok(updatedActivity);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id,
                                               @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaim("sub");
        log.info("Deleting activity {} for user: {}", id, userId);

        activityService.deleteActivity(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/application/{applicationId}/type/{type}")
    public ResponseEntity<List<Activity>> getActivitiesByApplicationAndType(
            @PathVariable Long applicationId,
            @PathVariable Activity.ActivityType type,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching {} activities for application {} by user: {}", type, applicationId, userId);

        List<Activity> activities = activityService.getActivitiesByApplicationAndType(applicationId, type);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/analytics/recent")
    public ResponseEntity<List<Activity>> getRecentActivities(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching activities from last {} days for user: {}", days, userId);

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Activity> activities = activityService.getActivitiesByUserSince(userId, startDate)
                .stream()
                .limit(limit)
                .toList();

        return ResponseEntity.ok(activities);
    }

    @GetMapping("/analytics/type-breakdown")
    public ResponseEntity<Map<String, Long>> getActivityTypeBreakdown(
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        log.info("Fetching activity type breakdown for user: {}", userId);

        Map<String, Long> breakdown = activityService.getActivityTypeBreakdown(userId);
        return ResponseEntity.ok(breakdown);
    }

    @GetMapping("/analytics/count/{type}")
    public ResponseEntity<Map<String, Long>> getActivityCountByType(
            @PathVariable Activity.ActivityType type,
            @AuthenticationPrincipal Jwt jwt) {

        String userId = jwt.getClaim("sub");
        long count = activityService.getActivityCountByType(userId, type);

        return ResponseEntity.ok(Map.of("count", count));
    }
}