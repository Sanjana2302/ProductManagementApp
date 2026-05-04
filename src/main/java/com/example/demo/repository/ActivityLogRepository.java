package com.example.demo.repository;

import com.example.demo.entity.ActivityLog;
import com.example.demo.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserOrderByTimestampDesc(User user, Pageable pageable);
}
