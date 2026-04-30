package com.system.technologs.mongo.repository;

import com.system.technologs.mongo.model.RepairEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairEventRepository extends MongoRepository<RepairEvent, String> {

    /** Full timeline for one repair, newest first. */
    List<RepairEvent> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}