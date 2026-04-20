package com.system.technologs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "repair_sale_items")
public class RepairSaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    private RepairSale sale;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    // Auto-calculated: quantity × unit_price
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    // ── Constructors ──────────────────────────────────────────────────────
    public RepairSaleItem() {}

    // ── Getters & Setters ─────────────────────────────────────────────────
    public Long getItemId()                   { return itemId; }
    public void setItemId(Long itemId)        { this.itemId = itemId; }

    public RepairSale getSale()               { return sale; }
    public void setSale(RepairSale sale)      { this.sale = sale; }

    public String getDescription()                    { return description; }
    public void setDescription(String description)    { this.description = description; }

    public Integer getQuantity()              { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice()                  { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice)    { this.unitPrice = unitPrice; }

    public BigDecimal getSubtotal()                   { return subtotal; }
    public void setSubtotal(BigDecimal subtotal)      { this.subtotal = subtotal; }
}