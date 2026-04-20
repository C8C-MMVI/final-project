package com.system.technologs.repository;

import com.system.technologs.model.RepairSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairSaleRepository extends JpaRepository<RepairSale, Long> {

    // Enforce one-sale-per-repair rule — used before creating
    boolean existsByRequestId(Long requestId);

    // Fetch sale by its linked repair request
    Optional<RepairSale> findByRequestId(Long requestId);

    // All sales for a shop (owner dashboard)
    List<RepairSale> findByShopId(Long shopId);

    // All sales for a customer (customer dashboard)
    List<RepairSale> findByCustomerId(Long customerId);
}