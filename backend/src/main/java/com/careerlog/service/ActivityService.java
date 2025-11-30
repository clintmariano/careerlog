package com.careerlog.service;

import com.careerlog.model.Activity;
import com.careerlog.repository.ActivityRepository;
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
public class ActivityService {

    private final ActivityRepository activityRepository;

    public List<Activity> getActivitiesByApplication(Long applicationId) {
        return activityRepository.findByApplicationIdOrderByDateTimeDesc(applicationId);
    }

    public List<Activity> getActivitiesByUser(String userId) {
        return activityRepository.findByUserIdOrderByDateTimeDesc(userId);
    }

    public Activity getActivityById(Long id, String userId) {
        return activityRepository.findById(id)
                .filter(activity -> {
                    String activityUserId = activity.getApplication().getUserId();
                    return activityUserId.equals(userId);
                })
                .orElseThrow(() -> new RuntimeException("Activity not found or access denied"));
    }

    public Activity createActivity(Activity activity) {
        log.info("Creating new activity of type {} for application {}",
                activity.getType(), activity.getApplication().getId());

        if (activity.getDateTime() == null) {
            activity.setDateTime(LocalDateTime.now());
        }

        return activityRepository.save(activity);
    }

    public Activity updateActivity(Long id, Activity activityDetails, String userId) {
        log.info("Updating activity {} for user: {}", id, userId);

        Activity existingActivity = getActivityById(id, userId);

        existingActivity.setType(activityDetails.getType());
        existingActivity.setDateTime(activityDetails.getDateTime());
        existingActivity.setNotes(activityDetails.getNotes());
        existingActivity.setLocation(activityDetails.getLocation());
        existingActivity.setParticipants(activityDetails.getParticipants());
        existingActivity.setDurationMinutes(activityDetails.getDurationMinutes());

        return activityRepository.save(existingActivity);
    }

    public void deleteActivity(Long id, String userId) {
        log.info("Deleting activity {} for user: {}", id, userId);

        Activity activity = getActivityById(id, userId);
        activityRepository.delete(activity);
    }

    public List<Activity> getActivitiesByApplicationAndType(Long applicationId, Activity.ActivityType type) {
        return activityRepository.findByApplicationIdAndTypeOrderByDateTimeDesc(applicationId, type);
    }

    public List<Activity> getRecentActivitiesByUser(String userId, int limit) {
        return activityRepository.findByUserIdOrderByDateTimeDesc(userId)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Activity> getActivitiesByUserSince(String userId, LocalDateTime startDate) {
        return activityRepository.findByUserIdAndDateTimeAfter(userId, startDate);
    }

    public Map<String, Long> getActivityTypeBreakdown(String userId) {
        List<Object[]> results = activityRepository.getActivityTypeBreakdown(userId);
        return results.stream()
                .collect(Collectors.toMap(
                        result -> ((Activity.ActivityType) result[0]).getDisplayName(),
                        result -> (Long) result[1]
                ));
    }

    public long getActivityCountByType(String userId, Activity.ActivityType type) {
        return activityRepository.countByUserIdAndActivityType(userId, type);
    }
}