# 🗄️ Створення таблиць Supabase - Покрокова інструкція

## ✅ Поточний статус

- ✅ Supabase проект: `gtizpymstxfjyidhzygd.supabase.co`
- ✅ API ключ налаштовано
- ✅ Підключення працює
- ⏳ **Потрібно створити таблиці**

## 📋 Покрокова інструкція

### Крок 1: Відкрийте Supabase Dashboard

1. Перейдіть на: https://supabase.com/dashboard
2. Увійдіть в свій акаунт
3. Виберіть проект: `gtizpymstxfjyidhzygd`

### Крок 2: Відкрийте SQL Editor

1. В лівому меню натисніть **"SQL Editor"**
2. Натисніть **"New query"** (Новий запит)

### Крок 3: Скопіюйте та вставте SQL

Скопіюйте весь наведений нижче SQL код:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric not null,
    stock int not null default 0,
    image_url text,
    brand text,
    capacity text,
    created_at timestamp with time zone default now()
);

-- Orders table
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_email text,
    customer_phone text,
    city text not null,
    branch text not null,
    payment_method text not null,
    total_amount numeric not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at timestamp with time zone default now()
);

-- Order items table
create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id),
    quantity int not null,
    price numeric not null,
    created_at timestamp with time zone default now()
);

-- Indexes for better performance
create index if not exists idx_products_name on products(name);
create index if not exists idx_products_brand on products(brand);
create index if not exists idx_orders_customer_name on orders(customer_name);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- Row Level Security (RLS) policies
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Allow public read access to products
create policy "Products are viewable by everyone" on products
    for select using (true);

-- Allow public insert access to orders and order_items
create policy "Anyone can create orders" on orders
    for insert with check (true);

create policy "Anyone can create order items" on order_items
    for insert with check (true);

-- Allow public read access to orders (for order confirmation)
create policy "Orders are viewable by everyone" on orders
    for select using (true);

create policy "Order items are viewable by everyone" on order_items
    for select using (true);
```

### Крок 4: Виконайте SQL

1. Натисніть кнопку **"Run"** (Виконати)
2. Дочекайтесь завершення виконання
3. Ви повинні побачити повідомлення **"Success"**

### Крок 5: Перевірте створення таблиць

1. В лівому меню натисніть **"Table Editor"**
2. Ви повинні побачити 3 таблиці:
   - `products`
   - `orders`
   - `order_items`

## 🧪 Тестування після створення

### Тест 1: Перевірка підключення

```bash
npm run test:supabase
```

**Очікуваний результат:**

```
🧪 Testing Supabase connection...
✅ Database connected successfully!
✅ Products table accessible. Found 0 products.
✅ Orders table accessible. Found 0 orders.
🎉 Supabase integration test completed successfully!
```

### Тест 2: Міграція продуктів

```bash
npm run migrate
```

**Очікуваний результат:**

```
🚀 Starting products migration to Supabase...
✅ Migrated product: PowerMax 20000мАг Швидка Зарядка
✅ Migrated product: Кабель USB-C 2m
... (більше продуктів)
🎉 All products migrated successfully!
```

### Тест 3: Запуск сервера

```bash
npm run dev
```

## 📊 Структура створених таблиць

### Таблиця `products`

- `id` - UUID (первинний ключ)
- `name` - Назва товару
- `description` - Опис товару
- `price` - Ціна
- `stock` - Кількість на складі
- `image_url` - URL зображення
- `brand` - Бренд
- `capacity` - Ємність
- `created_at` - Дата створення

### Таблиця `orders`

- `id` - UUID (первинний ключ)
- `customer_name` - Ім'я клієнта
- `customer_email` - Email клієнта
- `customer_phone` - Телефон клієнта
- `city` - Місто
- `branch` - Відділення
- `payment_method` - Спосіб оплати
- `total_amount` - Загальна сума
- `status` - Статус замовлення
- `created_at` - Дата створення

### Таблиця `order_items`

- `id` - UUID (первинний ключ)
- `order_id` - ID замовлення (зв'язок)
- `product_id` - ID товару (зв'язок)
- `quantity` - Кількість
- `price` - Ціна за одиницю
- `created_at` - Дата створення

## 🔧 Доступні команди

- `npm run test:supabase` - Тест підключення
- `npm run migrate` - Міграція продуктів
- `npm run check:schema` - Перевірка структури таблиць
- `npm run dev` - Запуск сервера розробки

## ✅ Перевірка успішності

Ви будете знати, що все працює, коли:

1. ✅ `npm run test:supabase` показує всі зелені галочки
2. ✅ `npm run migrate` успішно мігрує всі продукти
3. ✅ `npm run dev` запускається без помилок
4. ✅ Продукти завантажуються на сайті
5. ✅ Замовлення можуть створюватися та зберігатися в Supabase

## 🆘 Вирішення проблем

### Якщо міграція не працює:

- Перевірте, що всі таблиці створені успішно
- Переконайтеся, що назви колонок відповідають схемі
- Перевірте RLS політики

### Якщо підключення не працює:

- Перевірте правильність API ключа
- Переконайтеся, що проект Supabase активний
- Перевірте змінні середовища

---

**Статус**: ⏳ Потрібно створити таблиці  
**Наступний крок**: Виконати SQL в Supabase dashboard
