package com.system.technologs.controller;

import com.system.technologs.model.InventoryItem;
import com.system.technologs.service.InventoryItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    // GET /api/inventory/shop/{shopId}
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<InventoryItem>> getItemsByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(inventoryItemService.getItemsByShop(shopId));
    }

    // GET /api/inventory/shop/{shopId}/category/{category}
    @GetMapping("/shop/{shopId}/category/{category}")
    public ResponseEntity<List<InventoryItem>> getItemsByCategory(
            @PathVariable Long shopId,
            @PathVariable String category) {
        return ResponseEntity.ok(inventoryItemService.getItemsByShopAndCategory(shopId, category));
    }

    // GET /api/inventory/{itemId}
    @GetMapping("/{itemId}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long itemId) {
        return ResponseEntity.ok(inventoryItemService.getItemById(itemId));
    }

    // POST /api/inventory
    @PostMapping
    public ResponseEntity<InventoryItem> createItem(@Valid @RequestBody InventoryItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryItemService.createItem(item));
    }

    // PUT /api/inventory/{itemId}
    @PutMapping("/{itemId}")
    public ResponseEntity<InventoryItem> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryItemService.updateItem(itemId, item));
    }

    // DELETE /api/inventory/{itemId}
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        inventoryItemService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }
}