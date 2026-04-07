-- Users
CREATE INDEX idx_users_role 
    ON users(role);
CREATE INDEX idx_users_status 
    ON users(status);

-- Shops
CREATE INDEX idx_shops_owner_id 
    ON shops(owner_id);
CREATE INDEX idx_shops_shop_name 
    ON shops(shop_name);

-- Shop requests
CREATE INDEX idx_shop_requests_user_id 
    ON shop_requests(user_id);
CREATE INDEX idx_shop_requests_status 
    ON shop_requests(status);

-- Shop technicians
CREATE INDEX idx_shop_technicians_shop_id 
    ON shop_technicians(shop_id);
CREATE INDEX idx_shop_technicians_technician_id 
    ON shop_technicians(technician_id);

-- Repair requests
CREATE INDEX idx_repair_requests_shop_id 
    ON repair_requests(shop_id);
CREATE INDEX idx_repair_requests_customer_id 
    ON repair_requests(customer_id);
CREATE INDEX idx_repair_requests_technician_id 
    ON repair_requests(technician_id);
CREATE INDEX idx_repair_requests_status 
    ON repair_requests(status);

-- Inventory
CREATE INDEX idx_inventory_items_shop_id 
    ON inventory_items(shop_id);
CREATE INDEX idx_inventory_items_category 
    ON inventory_items(category);

-- Notifications
CREATE INDEX idx_notifications_user_id 
    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read 
    ON notifications(is_read);