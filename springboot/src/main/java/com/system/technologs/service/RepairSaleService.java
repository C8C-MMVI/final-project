package com.system.technologs.service;

import com.system.technologs.dto.CreateSaleRequest;
import com.system.technologs.model.RepairSale;
import com.system.technologs.model.RepairSaleItem;
import com.system.technologs.repository.RepairSaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class RepairSaleService {

    private final RepairSaleRepository saleRepo;

    public RepairSaleService(RepairSaleRepository saleRepo) {
        this.saleRepo = saleRepo;
    }

    // ── Create sale ───────────────────────────────────────────────────────
    @Transactional
    public RepairSale createSale(CreateSaleRequest req) {

        // ── 1. Validate required fields first (before any DB call) ────────
        if (req.getRequestId() == null)
            throw new IllegalArgumentException("requestId is required");
        if (req.getShopId() == null)
            throw new IllegalArgumentException("shopId is required");
        if (req.getCustomerId() == null)
            throw new IllegalArgumentException("customerId is required");
        if (req.getPaymentMethod() == null || req.getPaymentMethod().isBlank())
            throw new IllegalArgumentException("paymentMethod is required");
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new IllegalArgumentException("At least one item is required");

        // ── 2. Duplicate sale guard (now safe — requestId is not null) ────
        if (saleRepo.existsByRequestId(req.getRequestId())) {
            throw new IllegalStateException(
                "A sale already exists for repair request #" + req.getRequestId()
            );
        }

        // ── 3. Build the sale ─────────────────────────────────────────────
        RepairSale sale = new RepairSale();
        sale.setRequestId(req.getRequestId());
        sale.setShopId(req.getShopId());
        sale.setCustomerId(req.getCustomerId());
        sale.setStaffId(req.getStaffId());        // nullable — technician may be unassigned
        sale.setPaymentMethod(req.getPaymentMethod());
        sale.setSoldAt(LocalDate.now());

        // ── 4. Build items and accumulate total ───────────────────────────
        List<RepairSaleItem> items = new ArrayList<>();
        BigDecimal           total = BigDecimal.ZERO;

        for (CreateSaleRequest.ItemDTO dto : req.getItems()) {
            if (dto.getDescription() == null || dto.getDescription().isBlank())
                throw new IllegalArgumentException("Item description is required");
            if (dto.getQuantity() == null || dto.getQuantity() <= 0)
                throw new IllegalArgumentException("Item quantity must be positive");
            if (dto.getUnitPrice() == null || dto.getUnitPrice().compareTo(BigDecimal.ZERO) < 0)
                throw new IllegalArgumentException("Item unit price must be non-negative");

            RepairSaleItem item = new RepairSaleItem();
            item.setSale(sale);
            item.setDescription(dto.getDescription());
            item.setQuantity(dto.getQuantity());
            item.setUnitPrice(dto.getUnitPrice());

            BigDecimal subtotal = dto.getUnitPrice()
                .multiply(BigDecimal.valueOf(dto.getQuantity()));
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            items.add(item);
        }

        sale.setItems(items);
        sale.setAmount(total);

        return saleRepo.save(sale);
    }

    // ── Queries ───────────────────────────────────────────────────────────
    public List<RepairSale> getAllSales() {
        return saleRepo.findAll();
    }

    public RepairSale getSaleById(Long saleId) {
        return saleRepo.findById(saleId)
            .orElseThrow(() -> new IllegalArgumentException("Sale not found: " + saleId));
    }

    public RepairSale getSaleByRequestId(Long requestId) {
        return saleRepo.findByRequestId(requestId)
            .orElseThrow(() -> new IllegalArgumentException(
                "No sale found for repair request #" + requestId));
    }

    public List<RepairSale> getSalesByShop(Long shopId) {
        return saleRepo.findByShopId(shopId);
    }

    public List<RepairSale> getSalesByCustomer(Long customerId) {
        return saleRepo.findByCustomerId(customerId);
    }
}