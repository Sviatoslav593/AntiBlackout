/**
 * Генерація номера замовлення
 */

/**
 * Генерує унікальний номер замовлення
 * Формат: ORD-YYYYMMDD-HHMMSS-XXXX
 * Приклад: ORD-20241207-143022-0001
 */
export function generateOrderNumber(): string {
  const now = new Date();

  // Формат: ORD-YYYYMMDD-HHMMSS-XXXX
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Генеруємо випадковий 4-значний номер для унікальності
  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${randomSuffix}`;
}

/**
 * Альтернативний формат: простий числовий номер
 * Приклад: 20241207143022001
 */
export function generateSimpleOrderNumber(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

/**
 * Генерує номер замовлення на основі UUID
 * Приклад: ORD-a1b2c3d4-e5f6-7890-abcd-ef1234567890
 */
export function generateUUIDOrderNumber(uuid: string): string {
  // Беремо перші 8 символів UUID та додаємо префікс
  const shortUuid = uuid.replace(/-/g, "").substring(0, 8).toUpperCase();
  return `ORD-${shortUuid}`;
}
