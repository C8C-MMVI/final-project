package com.system.technologs.dto;

import java.math.BigDecimal;
import java.util.List;

// ── Request DTO ───────────────────────────────────────────────────────────
// Matches the POST body described in the spec
public class CreateSaleRequest {

    private Long   requestId;
    private Long   shopId;
    private Long   customerId;
    private Long   staffId;
    private String paymentMethod;
    private List<ItemDTO> items;

    // ── Nested item DTO ───────────────────────────────────────────────────
    public static class ItemDTO {
        private String     description;
        private Integer    quantity;
        private BigDecimal unitPrice;

        public String     getDescription()                    { return description; }
        public void       setDescription(String description)  { this.description = description; }

        public Integer    getQuantity()                       { return quantity; }
        public void       setQuantity(Integer quantity)       { this.quantity = quantity; }

        public BigDecimal getUnitPrice()                      { return unitPrice; }
        public void       setUnitPrice(BigDecimal unitPrice)  { this.unitPrice = unitPrice; }
    }

    // ── Getters & Setters ─────────────────────────────────────────────────
    public Long   getRequestId()                      { return requestId; }
    public void   setRequestId(Long requestId)        { this.requestId = requestId; }

    public Long   getShopId()                         { return shopId; }
    public void   setShopId(Long shopId)              { this.shopId = shopId; }

    public Long   getCustomerId()                     { return customerId; }
    public void   setCustomerId(Long customerId)      { this.customerId = customerId; }

    public Long   getStaffId()                        { return staffId; }
    public void   setStaffId(Long staffId)            { this.staffId = staffId; }

    public String getPaymentMethod()                          { return paymentMethod; }
    public void   setPaymentMethod(String paymentMethod)      { this.paymentMethod = paymentMethod; }

    public List<ItemDTO> getItems()                   { return items; }
    public void          setItems(List<ItemDTO> items){ this.items = items; }
}