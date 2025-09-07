import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { checkoutSchema, CheckoutFormData } from "@/lib/validations";
import { NovaPoshtaCity, NovaPoshtaWarehouse } from "@/services/novaPoshtaApi";

export const useCheckoutForm = () => {
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "+380",
      email: "",
      paymentMethod: undefined,
      city: null,
      warehouse: null,
      customAddress: "",
    },
  });

  const { register, watch, setValue, formState, trigger, clearErrors } = form;

  // Watch specific fields for real-time validation
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const phone = watch("phone");
  const email = watch("email");
  const paymentMethod = watch("paymentMethod");
  const city = watch("city");
  const warehouse = watch("warehouse");
  const customAddress = watch("customAddress");

  // Clear errors when fields become valid
  const clearFieldError = (fieldName: keyof CheckoutFormData) => {
    if (formState.errors[fieldName]) {
      clearErrors(fieldName);
    }
  };

  // Handle phone input with +380 prefix logic
  const handlePhoneChange = (value: string) => {
    let processedValue = value;

    // Ensure +380 prefix is always present
    if (!processedValue.startsWith("+380")) {
      processedValue = "+380";
    }

    // Limit to 13 characters (+380XXXXXXXXX)
    if (processedValue.length > 13) {
      processedValue = processedValue.slice(0, 13);
    }

    // Only allow digits after +380
    const digitsAfter380 = processedValue.slice(4);
    if (digitsAfter380 && !/^\d*$/.test(digitsAfter380)) {
      return; // Don't update if non-digits are entered
    }

    setValue("phone", processedValue);
    clearFieldError("phone");
  };

  // Handle city selection
  const handleCitySelect = (city: NovaPoshtaCity | null) => {
    setValue("city", city);
    setValue("warehouse", null); // Reset warehouse when city changes
    clearFieldError("city");
    clearFieldError("warehouse");
  };

  // Handle warehouse selection
  const handleWarehouseSelect = (
    warehouse: NovaPoshtaWarehouse | null,
    customAddress?: string
  ) => {
    setValue("warehouse", warehouse);
    setValue("customAddress", customAddress || "");
    clearFieldError("warehouse");
  };

  // Handle custom address input
  const handleCustomAddressChange = (value: string) => {
    setValue("customAddress", value);
    if (value.trim().length > 0) {
      setValue("warehouse", null);
    }
    clearFieldError("warehouse");
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (value: string) => {
    setValue("paymentMethod", value as "online" | "cod");
    clearFieldError("paymentMethod");
  };

  // Real-time error clearing effect
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && formState.errors[name as keyof CheckoutFormData]) {
        // Trigger validation for the field to check if it's now valid
        trigger(name as keyof CheckoutFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, formState.errors, trigger]);

  // Check if form is valid
  const isFormValid =
    formState.isValid && Object.keys(formState.errors).length === 0;

  return {
    form,
    formState,
    register,
    handlePhoneChange,
    handleCitySelect,
    handleWarehouseSelect,
    handleCustomAddressChange,
    handlePaymentMethodChange,
    clearFieldError,
    isFormValid,
    // Watched values
    firstName,
    lastName,
    phone,
    email,
    paymentMethod,
    city,
    warehouse,
    customAddress,
  };
};
