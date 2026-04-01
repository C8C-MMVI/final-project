package com.system.technologs.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "shop_id")
    private Long shopId;

    @NotBlank
    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "category")
    private String category;

    @Min(0)
    @Column(name = "quantity")
    private Integer quantity = 0;

    @DecimalMin("0.00")
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;
}
