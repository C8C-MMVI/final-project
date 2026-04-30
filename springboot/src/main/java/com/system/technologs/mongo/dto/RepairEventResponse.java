package com.system.technologs.mongo.dto;

import com.system.technologs.mongo.model.RepairEvent;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RepairEventResponse {

    private String eventId;
    private Long requestId;
    private String status;
    private Long changedBy;
    private String changedByUsername;
    private String note;
    private Instant createdAt;

    /** Static factory — maps a RepairEvent document → response DTO. */
    public static RepairEventResponse from(RepairEvent event) {
        return RepairEventResponse.builder()
                .eventId(event.getId())
                .requestId(event.getRequestId())
                .status(event.getStatus())
                .changedBy(event.getChangedBy())
                .changedByUsername(event.getChangedByUsername())
                .note(event.getNote())
                .createdAt(event.getCreatedAt())
                .build();
    }
}