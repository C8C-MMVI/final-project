package com.system.technologs.mongo.service;

import com.system.technologs.mongo.dto.CreateRepairEventRequest;
import com.system.technologs.mongo.dto.RepairEventResponse;
import com.system.technologs.mongo.model.RepairEvent;
import com.system.technologs.mongo.repository.RepairEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairEventService {

    private final RepairEventRepository repo;

    /** Append a new status-change event. */
    public RepairEventResponse addEvent(CreateRepairEventRequest req) {
        RepairEvent event = RepairEvent.builder()
                .requestId(req.getRequestId())
                .status(req.getStatus())
                .changedBy(req.getChangedBy())
                .changedByUsername(req.getChangedByUsername())
                .note(req.getNote())
                .build();

        return RepairEventResponse.from(repo.save(event));
    }

    /** Full event history for a repair request. */
    public List<RepairEventResponse> getTimeline(Long requestId) {
        return repo.findByRequestIdOrderByCreatedAtDesc(requestId)
                   .stream()
                   .map(RepairEventResponse::from)
                   .collect(Collectors.toList());
    }
}