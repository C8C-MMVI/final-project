package com.system.technologs.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "repair_sales")
public class RepairSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long saleId;

    // Links to repair_requests owned by PHP — just a plain FK column, no JPA join
    @Column(name = "request_id", nullable = false, unique = true)
    private Long requestId;

    @Column(name = "shop_id", nullable = false)
    private Long shopId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    // Auto-calculated from sum of item subtotals
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod;

    @Column(name = "sold_at", nullable = false)
    private LocalDate soldAt;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RepairSaleItem> items = new ArrayList<>();

    // ── Constructors ──────────────────────────────────────────────────────
    public RepairSale() {}

    // ── Getters & Setters ─────────────────────────────────────────────────
    public Long getSaleId()                   { return saleId; }
    public void setSaleId(Long saleId)        { this.saleId = saleId; }

    public Long getRequestId()                { return requestId; }
    public void setRequestId(Long requestId)  { this.requestId = requestId; }

    public Long getShopId()                   { return shopId; }
    public void setShopId(Long shopId)        { this.shopId = shopId; }

    public Long getCustomerId()               { return customerId; }
    public void setCustomerId(Long customerId){ this.customerId = customerId; }

    public Long getStaffId()                  { return staffId; }
    public void setStaffId(Long staffId)      { this.staffId = staffId; }

    public BigDecimal getAmount()             { return amount; }
    public void setAmount(BigDecimal amount)  { this.amount = amount; }

    public String getPaymentMethod()                    { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod)  { this.paymentMethod = paymentMethod; }

    public LocalDate getSoldAt()              { return soldAt; }
    public void setSoldAt(LocalDate soldAt)   { this.soldAt = soldAt; }

    public List<RepairSaleItem> getItems()              { return items; }
    public void setItems(List<RepairSaleItem> items)    { this.items = items; }
}