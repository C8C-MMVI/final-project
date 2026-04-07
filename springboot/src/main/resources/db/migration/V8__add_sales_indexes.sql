-- Sales transactions
CREATE INDEX idx_sales_transactions_shop_id 
    ON sales_transactions(shop_id);
CREATE INDEX idx_sales_transactions_customer_id 
    ON sales_transactions(customer_id);
CREATE INDEX idx_sales_transactions_date 
    ON sales_transactions(transaction_date);

-- Sales items
CREATE INDEX idx_sales_items_transaction_id 
    ON sales_items(transaction_id);
CREATE INDEX idx_sales_items_item_id 
    ON sales_items(item_id);