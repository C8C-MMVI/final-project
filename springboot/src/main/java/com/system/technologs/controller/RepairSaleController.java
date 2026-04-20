package com.system.technologs.controller;

import com.system.technologs.dto.CreateSaleRequest;
import com.system.technologs.model.RepairSale;
import com.system.technologs.service.RepairSaleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
public class RepairSaleController {

    private final RepairSaleService saleService;

    public RepairSaleController(RepairSaleService saleService) {
        this.saleService = saleService;
    }

    // ── POST /api/sales ───────────────────────────────────────────────────
    // Create a new sale for a completed repair
    // Body: { requestId, shopId, customerId, staffId, paymentMethod, items[] }
    @PostMapping
    public ResponseEntity<?> createSale(@RequestBody CreateSaleRequest req) {
        try {
            RepairSale created = saleService.createSale(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            // Duplicate sale for same repair
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create sale: " + e.getMessage()));
        }
    }

    // ── GET /api/sales ────────────────────────────────────────────────────
    // All sales (admin use)
    @GetMapping
    public ResponseEntity<List<RepairSale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // ── GET /api/sales/{saleId} ───────────────────────────────────────────
    // Single sale by its own ID
    @GetMapping("/{saleId}")
    public ResponseEntity<?> getSaleById(@PathVariable Long saleId) {
        try {
            return ResponseEntity.ok(saleService.getSaleById(saleId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/sales/by-repair/{requestId} ──────────────────────────────
    // Look up a sale by the originating repair request ID
    @GetMapping("/by-repair/{requestId}")
    public ResponseEntity<?> getSaleByRepair(@PathVariable Long requestId) {
        try {
            return ResponseEntity.ok(saleService.getSaleByRequestId(requestId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/sales/shop/{shopId} ──────────────────────────────────────
    // All sales for a given shop (owner dashboard)
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<RepairSale>> getSalesByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(saleService.getSalesByShop(shopId));
    }

    // ── GET /api/sales/customer/{customerId} ──────────────────────────────
    // All sales for a given customer (customer transactions)
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RepairSale>> getSalesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(saleService.getSalesByCustomer(customerId));
    }
}