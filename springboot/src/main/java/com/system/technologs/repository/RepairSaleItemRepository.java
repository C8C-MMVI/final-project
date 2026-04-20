package com.system.technologs.repository;

import com.system.technologs.model.RepairSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairSaleItemRepository extends JpaRepository<RepairSaleItem, Long> {

    List<RepairSaleItem> findBySale_SaleId(Long saleId);
}