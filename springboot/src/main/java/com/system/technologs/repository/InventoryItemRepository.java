package com.system.technologs.repository;

import com.system.technologs.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    // Get all inventory items belonging to a specific shop
    List<InventoryItem> findByShopId(Long shopId);

    // Find items by category within a shop
    List<InventoryItem> findByShopIdAndCategory(Long shopId, String category);
}