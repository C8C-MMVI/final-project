package com.system.technologs.mongo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

/**
 * MongoDB document — "repair_events" collection.
 * One document per status transition on a repair request.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "repair_events")
public class RepairEvent {

    @Id
    private String id;

    @Indexed
    @Field("request_id")
    private Long requestId;

    private String status;

    @Field("changed_by")
    private Long changedBy;

    @Field("changed_by_username")
    private String changedByUsername;

    private String note;

    @Builder.Default
    @Field("created_at")
    private Instant createdAt = Instant.now();
}