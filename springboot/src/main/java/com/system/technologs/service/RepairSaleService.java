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

        // Rule: one sale per repair only
        if (saleRepo.existsByRequestId(req.getRequestId())) {
            throw new IllegalStateException(
                "A sale already exists for repair request #" + req.getRequestId()
            );
        }

        RepairSale sale = new RepairSale();
        sale.setRequestId(req.getRequestId());
        sale.setShopId(req.getShopId());
        sale.setCustomerId(req.getCustomerId());
        sale.setStaffId(req.getStaffId());
        sale.setPaymentMethod(req.getPaymentMethod());
        sale.setSoldAt(LocalDate.now());

        // Build items, calculate subtotals, accumulate total
        List<RepairSaleItem> items    = new ArrayList<>();
        BigDecimal           total    = BigDecimal.ZERO;

        for (CreateSaleRequest.ItemDTO dto : req.getItems()) {
            RepairSaleItem item = new RepairSaleItem();
            item.setSale(sale);
            item.setDescription(dto.getDescription());
            item.setQuantity(dto.getQuantity());
            item.setUnitPrice(dto.getUnitPrice());

            // subtotal = quantity × unit_price
            BigDecimal subtotal = dto.getUnitPrice()
                .multiply(BigDecimal.valueOf(dto.getQuantity()));
            item.setSubtotal(subtotal);
            total = total.add(subtotal);

            items.add(item);
        }

        // amount auto-calculated from sum of subtotals
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