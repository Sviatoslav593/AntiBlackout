-- Додаємо категорії з XML фіду
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Акумулятори та powerbank', NULL),
(3, 'Портативні батареї', 1),
(14, 'Зарядки та кабелі', NULL),
(15, 'Мережеві зарядні пристрої', 14),
(16, 'Кабелі usb', 14),
(80, 'Бездротові зарядні пристрої', 14)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  parent_id = EXCLUDED.parent_id;
