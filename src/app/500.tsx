import Link from "next/link";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function ServerError() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">500</h1>
          <h2 className="text-2xl font-semibold mb-4">
            Внутрішня помилка сервера
          </h2>
          <p className="text-muted-foreground mb-8">
            Вибачте, сталася неочікувана помилка. Спробуйте пізніше.
          </p>
          <Link href="/">
            <Button size="lg">Повернутися на головну</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
