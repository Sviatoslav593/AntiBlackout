"use client";

import { useState } from "react";

const API_BASE_URL = "https://api.novaposhta.ua/v2.0/json/";
const API_KEY = "c8be07eac251641182e5575f8ee0da40";

interface ApiTestResult {
  success: boolean;
  data: unknown[];
  errors: string[];
  warnings: string[];
  info: string[];
}

export default function ApiTestPage() {
  const [result, setResult] = useState<ApiTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testDirectAPI = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Testing direct Nova Poshta API...");

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: API_KEY,
          modelName: "Address",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: "Київ",
          },
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as ApiTestResult;
      console.log("API Response:", data);

      setResult(data);
    } catch (err: unknown) {
      console.error("API Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testAPIWithoutSearch = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      console.log("Testing API without search parameter...");

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: API_KEY,
          modelName: "Address",
          calledMethod: "getCities",
          methodProperties: {},
        }),
      });

      const data = (await response.json()) as ApiTestResult;
      console.log("API Response (no search):", data);

      setResult(data);
    } catch (err: unknown) {
      console.error("API Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Direct API Test</h1>

      <div className="space-y-4">
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test API with 'Київ' search"}
        </button>

        <button
          onClick={testAPIWithoutSearch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? "Testing..." : "Test API without search"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">API Response:</h3>
          <div className="space-y-2">
            <p>
              <strong>Success:</strong>{" "}
              {result.success ? "✅ true" : "❌ false"}
            </p>
            {result.errors && result.errors.length > 0 && (
              <div>
                <strong>Errors:</strong>
                <ul className="list-disc ml-4">
                  {result.errors.map((error: string, index: number) => (
                    <li key={index} className="text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.data && (
              <div>
                <strong>Data count:</strong> {result.data.length}
                {result.data.length > 0 && (
                  <div className="mt-2">
                    <strong>First city:</strong>
                    <pre className="text-sm bg-white p-2 rounded mt-1">
                      {JSON.stringify(result.data[0], null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer font-bold">
              Full Response (click to expand)
            </summary>
            <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <div className="text-sm space-y-1">
          <p>
            <strong>API URL:</strong> {API_BASE_URL}
          </p>
          <p>
            <strong>API Key:</strong> {API_KEY}
          </p>
          <p>
            <strong>Test 1:</strong> Search for "Київ"
          </p>
          <p>
            <strong>Test 2:</strong> Get all cities (no search)
          </p>
        </div>
      </div>
    </div>
  );
}
