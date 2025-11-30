package com.careerlog.repository;

import com.careerlog.model.Activity;
import com.careerlog.model.Activity.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByApplicationIdOrderByDateTimeDesc(Long applicationId);

    List<Activity> findByApplicationIdAndTypeOrderByDateTimeDesc(Long applicationId, ActivityType type);

    @Query("SELECT a FROM Activity a WHERE a.application.id IN " +
           "(SELECT app.id FROM Application app WHERE app.userId = :userId) " +
           "ORDER BY a.dateTime DESC")
    List<Activity> findByUserIdOrderByDateTimeDesc(@Param("userId") String userId);

    @Query("SELECT a FROM Activity a WHERE a.application.id IN " +
           "(SELECT app.id FROM Application app WHERE app.userId = :userId) " +
           "AND a.dateTime >= :startDate ORDER BY a.dateTime DESC")
    List<Activity> findByUserIdAndDateTimeAfter(@Param("userId") String userId,
                                                @Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.application.id IN " +
           "(SELECT app.id FROM Application app WHERE app.userId = :userId) " +
           "AND a.type = :activityType")
    long countByUserIdAndActivityType(@Param("userId") String userId,
                                     @Param("activityType") ActivityType activityType);

    @Query("SELECT a.type, COUNT(a) FROM Activity a WHERE a.application.id IN " +
           "(SELECT app.id FROM Application app WHERE app.userId = :userId) " +
           "GROUP BY a.type")
    List<Object[]> getActivityTypeBreakdown(@Param("userId") String userId);
}