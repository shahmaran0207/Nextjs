-- orders 테이블 CHECK 제약조건 수정
ALTER TABLE test.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE test.orders ADD CONSTRAINT orders_order_status_check 
  CHECK (order_status IN ('PENDING','PAID','SHIPPED','DELIVERED','CONFIRMED','CANCELLED','RETURN_REQUEST','RETURN_COMPLETED'));

-- order_items 테이블 CHECK 제약조건 수정
ALTER TABLE test.order_items DROP CONSTRAINT IF EXISTS order_items_item_status_check;
ALTER TABLE test.order_items ADD CONSTRAINT order_items_item_status_check 
  CHECK (item_status IN ('PAID','SHIPPING','DELIVERED','CONFIRMED','CANCELLED','RETURN_REQUEST','RETURN_COMPLETED'));
