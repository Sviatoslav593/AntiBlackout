import Layout from "@/components/Layout";
import Cart from "@/components/Cart";
import { generateCartMetadata } from "@/lib/seo";

export const metadata = generateCartMetadata();

export default function CartPage() {
  return (
    <Layout>
      <Cart />
    </Layout>
  );
}
export const dynamic = "force-dynamic";
