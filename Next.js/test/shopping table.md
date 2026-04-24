-- =========================
-- 기존 객체 삭제
-- =========================
drop table if exists payments;
drop table if exists order_items;
drop table if exists orders;
drop table if exists cart_items;
drop table if exists carts;
drop table if exists products;

drop sequence if exists products_id_seq;
drop sequence if exists carts_id_seq;
drop sequence if exists cart_items_id_seq;
drop sequence if exists orders_id_seq;
drop sequence if exists order_items_id_seq;
drop sequence if exists payments_id_seq;


-- =========================
-- 시퀀스 생성
-- =========================
create sequence products_id_seq start 1;
create sequence carts_id_seq start 1;
create sequence cart_items_id_seq start 1;
create sequence orders_id_seq start 1;
create sequence order_items_id_seq start 1;
create sequence payments_id_seq start 1;


-- =========================
-- 1. 상품 테이블
-- =========================
create table products (
    id numeric(20,0) primary key default nextval('products_id_seq'),
    name varchar(200) not null,
    description text,
    price numeric(12,2) not null check (price >= 0),
    stock numeric(20,0) not null default 0 check (stock >= 0),
    sku varchar(100) unique,
    image_url text,
    is_active boolean not null default true,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index idx_products_name on products(name);
create index idx_products_is_active on products(is_active);


-- =========================
-- 2. 장바구니 테이블
-- FK 없이 user_id만 보관
-- =========================
create table carts (
    id numeric(20,0) primary key default nextval('carts_id_seq'),
    user_id numeric(20,0) not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index idx_carts_user_id on carts(user_id);


-- =========================
-- 3. 장바구니 상품 테이블
-- FK 제거, 숫자 컬럼만 연결용으로 사용
-- =========================
create table cart_items (
    id numeric(20,0) primary key default nextval('cart_items_id_seq'),
    cart_id numeric(20,0) not null,
    product_id numeric(20,0) not null,
    quantity numeric(20,0) not null check (quantity > 0),
    unit_price numeric(12,2) not null check (unit_price >= 0),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),

    constraint uq_cart_product unique (cart_id, product_id)
);

create index idx_cart_items_cart_id on cart_items(cart_id);
create index idx_cart_items_product_id on cart_items(product_id);


-- =========================
-- 4. 주문 테이블
-- FK 없이 user_id만 사용
-- =========================
create table orders (
    id numeric(20,0) primary key default nextval('orders_id_seq'),
    user_id numeric(20,0) not null,
    order_number varchar(50) not null unique,

    order_status varchar(30) not null default 'PENDING'
        check (order_status in (
            'PENDING',
            'PAID',
            'PREPARING',
            'SHIPPED',
            'DELIVERED',
            'CANCELLED',
            'REFUNDED'
        )),

    total_product_amount numeric(12,2) not null default 0 check (total_product_amount >= 0),
    shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
    discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
    final_amount numeric(12,2) not null default 0 check (final_amount >= 0),

    receiver_name varchar(100),
    receiver_phone varchar(30),
    shipping_address text,
    shipping_message text,

    ordered_at timestamp not null default now(),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(order_status);
create index idx_orders_ordered_at on orders(ordered_at);


-- =========================
-- 5. 주문 상품 테이블
-- FK 제거
-- =========================
create table order_items (
    id numeric(20,0) primary key default nextval('order_items_id_seq'),
    order_id numeric(20,0) not null,
    product_id numeric(20,0) not null,
    product_name varchar(200) not null,
    unit_price numeric(12,2) not null check (unit_price >= 0),
    quantity numeric(20,0) not null check (quantity > 0),
    total_price numeric(12,2) not null check (total_price >= 0),
    created_at timestamp not null default now()
);

create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);


-- =========================
-- 6. 결제내역 테이블
-- FK 제거, user_id / order_id 숫자값만 저장
-- =========================
create table payments (
    id numeric(20,0) primary key default nextval('payments_id_seq'),
    user_id numeric(20,0) not null,
    order_id numeric(20,0) not null,

    payment_key varchar(100) unique,
    payment_method varchar(30) not null
        check (payment_method in (
            'CARD',
            'BANK_TRANSFER',
            'VIRTUAL_ACCOUNT',
            'KAKAO_PAY',
            'NAVER_PAY',
            'TOSS_PAY',
            'ETC'
        )),

    payment_status varchar(30) not null default 'READY'
        check (payment_status in (
            'READY',
            'DONE',
            'FAILED',
            'CANCELLED',
            'PARTIAL_CANCELLED'
        )),

    amount numeric(12,2) not null check (amount >= 0),
    approved_at timestamp,
    failed_at timestamp,
    cancelled_at timestamp,
    fail_reason text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
);

create index idx_payments_user_id on payments(user_id);
create index idx_payments_order_id on payments(order_id);
create index idx_payments_status on payments(payment_status);
create index idx_payments_payment_key on payments(payment_key);

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row
execute function set_updated_at();

drop trigger if exists trg_carts_updated_at on carts;
create trigger trg_carts_updated_at
before update on carts
for each row
execute function set_updated_at();

drop trigger if exists trg_cart_items_updated_at on cart_items;
create trigger trg_cart_items_updated_at
before update on cart_items
for each row
execute function set_updated_at();

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
before update on orders
for each row
execute function set_updated_at();

drop trigger if exists trg_payments_updated_at on payments;
create trigger trg_payments_updated_at
before update on payments
for each row
execute function set_updated_at();

insert into products (name, description, price, stock, sku, image_url, is_active)
values
('반팔 티셔츠', '기본 반팔 티셔츠', 19900.00, 100, 'TS-001', 'https://example.com/tshirt.jpg', true),
('청바지', '슬림핏 청바지', 49900.00, 50, 'JE-001', 'https://example.com/jeans.jpg', true),
('운동화', '러닝화', 89000.00, 30, 'SH-001', 'https://example.com/shoes.jpg', true),
('후드집업', '사계절용 후드집업', 59000.00, 40, 'HD-001', 'https://example.com/hoodie.jpg', true),
('볼캡', '심플 로고 볼캡', 25000.00, 70, 'CP-001', 'https://example.com/cap.jpg', true),
('양말 세트', '데일리 양말 5족 세트', 12900.00, 200, 'SK-001', 'https://example.com/socks.jpg', true),
('맨투맨', '오버핏 맨투맨', 39000.00, 60, 'MT-001', 'https://example.com/sweatshirt.jpg', true),
('패딩점퍼', '겨울용 패딩점퍼', 129000.00, 20, 'PD-001', 'https://example.com/padding.jpg', true),
('슬리퍼', '편한 쿠션 슬리퍼', 17900.00, 80, 'SL-001', 'https://example.com/slipper.jpg', true),
('백팩', '노트북 수납 백팩', 69000.00, 35, 'BP-001', 'https://example.com/backpack.jpg', true);