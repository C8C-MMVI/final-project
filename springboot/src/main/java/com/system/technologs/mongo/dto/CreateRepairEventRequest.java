package com.system.technologs.mongo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRepairEventRequest {

    @NotNull(message = "requestId is required")
    private Long requestId;

    @NotBlank(message = "status is required")
    private String status;

    @NotNull(message = "changedBy is required")
    private Long changedBy;

    @NotBlank(message = "changedByUsername is required")
    private String changedByUsername;

    private String note; // optional
}