import { z } from "zod";

// Ukrainian phone number validation (accepts +380 or 0 prefix)
const phoneRegex = /^(\+?380|0)\d{9}$/;

export const checkoutSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Ім'я є обов'язковим полем")
      .min(2, "Ім'я має містити принаймні 2 символи")
      .max(30, "Ім'я не повинно перевищувати 30 символів")
      .regex(
        /^[а-яА-ЯёЁa-zA-Z'`'-]+$/u,
        "Ім'я може містити тільки літери, апострофи та дефіси"
      ),

    lastName: z
      .string()
      .min(1, "Прізвище є обов'язковим полем")
      .min(2, "Прізвище має містити принаймні 2 символи")
      .max(30, "Прізвище не повинно перевищувати 30 символів")
      .regex(
        /^[а-яА-ЯёЁa-zA-Z'`'-]+$/u,
        "Прізвище може містити тільки літери, апострофи та дефіси"
      ),

    phone: z
      .string()
      .min(1, "Номер телефону є обов'язковим")
      .regex(
        phoneRegex,
        "Введіть коректний номер телефону (наприклад +380501234567)"
      )
      .refine((val) => val !== "+380", "Введіть повний номер телефону"),

    email: z
      .string()
      .email("Введіть коректну електронну адресу")
      .or(z.literal("")) // Allow empty string for optional email
      .optional(),

    paymentMethod: z.enum(["online", "cash_on_delivery"], {
      message: "Будь ласка, оберіть спосіб оплати",
    }),

    city: z
      .object({
        Ref: z.string(),
        Description: z.string(),
      })
      .nullable()
      .refine((val) => val !== null, "Будь ласка, оберіть населений пункт"),

    warehouse: z.any().nullable().optional(), // Flexible for NovaPoshtaWarehouse

    customAddress: z.string().optional(),
  })
  .refine(
    (data) =>
      data.warehouse ||
      (data.customAddress && data.customAddress.trim().length > 0),
    {
      message: "Будь ласка, оберіть відділення або введіть адресу доставки",
      path: ["warehouse"],
    }
  );

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
