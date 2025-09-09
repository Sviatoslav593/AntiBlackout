"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ImportPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    setImportResult(null);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setImportResult(result);
      } else {
        setError(result.error || "Import failed");
      }
    } catch (err) {
      setError("Network error during import");
      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>XML Import Tool</CardTitle>
          <CardDescription>
            Import products from XML feed and normalize categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What this import will do:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>🧹 Clean up all existing products and categories</li>
              <li>
                🏗️ Create 2 normalized categories: "Портативні батареї" and
                "Зарядки та кабелі"
              </li>
              <li>📥 Import products from XML feed with characteristics</li>
              <li>
                🔄 Map categoryId 1,3 → "Портативні батареї" and 14,16 →
                "Зарядки та кабелі"
              </li>
              <li>💾 Save product characteristics as JSONB for display</li>
            </ul>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 font-medium">
                ✅ Import completed successfully!
              </p>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Total products in XML: {importResult.stats?.totalProducts}
                </p>
                <p>
                  Processed products: {importResult.stats?.processedProducts}
                </p>
                <p>Inserted products: {importResult.stats?.insertedProducts}</p>
                <p>
                  Categories created: {importResult.stats?.categoriesCreated}
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? "Importing..." : "Start XML Import"}
          </Button>

          {isImporting && (
            <div className="text-center text-sm text-muted-foreground">
              <p>⏳ This may take a few minutes...</p>
              <p>Check the browser console for detailed progress.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
