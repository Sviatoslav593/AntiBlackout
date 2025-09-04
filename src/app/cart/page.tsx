import Layout from "@/components/Layout";
import Cart from "@/components/Cart";

export const metadata = {
  title: "Кошик покупок - AntiBlackout",
  description: "Переглядайте товари у вашому кошику та оформляйте замовлення",
};

export default function CartPage() {
  return (
    <Layout>
      <Cart />
    </Layout>
  );
}
