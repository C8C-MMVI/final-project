package com.system.technologs.service;

import com.system.technologs.model.InventoryItem;
import com.system.technologs.repository.InventoryItemRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;

    // Get all items by shop
    public List<InventoryItem> getItemsByShop(Long shopId) {
        return inventoryItemRepository.findByShopId(shopId);
    }

    // Get all items by shop and category
    public List<InventoryItem> getItemsByShopAndCategory(Long shopId, String category) {
        return inventoryItemRepository.findByShopIdAndCategory(shopId, category);
    }

    // Get single item
    public InventoryItem getItemById(Long itemId) {
        return inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found with id: " + itemId));
    }

    // Create item
    public InventoryItem createItem(InventoryItem item) {
        return inventoryItemRepository.save(item);
    }

    // Update item
    public InventoryItem updateItem(Long itemId, InventoryItem updated) {
        InventoryItem existing = getItemById(itemId);
        existing.setItemName(updated.getItemName());
        existing.setCategory(updated.getCategory());
        existing.setQuantity(updated.getQuantity());
        existing.setPrice(updated.getPrice());
        return inventoryItemRepository.save(existing);
    }

    // Delete item
    public void deleteItem(Long itemId) {
        InventoryItem existing = getItemById(itemId);
        inventoryItemRepository.delete(existing);
    }
}