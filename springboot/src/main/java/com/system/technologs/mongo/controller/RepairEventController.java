package com.system.technologs.mongo.controller;

import com.system.technologs.mongo.dto.CreateRepairEventRequest;
import com.system.technologs.mongo.dto.RepairEventResponse;
import com.system.technologs.mongo.service.RepairEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for repair event timeline (MongoDB-backed).
 *
 * GET  /api/events/timeline/{requestId}  — fetch history
 * POST /api/events/timeline              — append an event
 */
@RestController
@RequestMapping("/api/events/timeline")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "true")
public class RepairEventController {

    private final RepairEventService service;

    @GetMapping("/{requestId}")
    public ResponseEntity<Map<String, Object>> getTimeline(@PathVariable Long requestId) {
        List<RepairEventResponse> events = service.getTimeline(requestId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "events",  events
        ));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addEvent(
            @Valid @RequestBody CreateRepairEventRequest req) {

        RepairEventResponse saved = service.addEvent(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success",  true,
                "event_id", saved.getEventId(),
                "message",  "Event recorded."
        ));
    }
}
