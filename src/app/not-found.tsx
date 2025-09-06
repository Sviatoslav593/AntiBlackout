import Link from "next/link";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Сторінку не знайдено</h2>
          <p className="text-muted-foreground mb-8">
            Вибачте, але сторінка, яку ви шукаєте, не існує.
          </p>
          <Link href="/">
            <Button size="lg">Повернутися на головну</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
