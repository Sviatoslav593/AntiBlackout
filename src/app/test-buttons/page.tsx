"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TestButtonsPage() {
  const [clickCount, setClickCount] = useState(0);
  const [lastClicked, setLastClicked] = useState("");

  const handleClick = (buttonName: string) => {
    setClickCount((prev) => prev + 1);
    setLastClicked(buttonName);
    console.log(`Button clicked: ${buttonName}`);
  };

  return (
    <div>
      <Header />

      <div className="container py-8 mt-16">
        <h1 className="text-2xl font-bold mb-8">Button Test Page</h1>

        <div className="bg-white p-6 border rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">Click Counter Test</h2>
          <p className="mb-4">Total clicks: {clickCount}</p>
          <p className="mb-4">Last clicked: {lastClicked}</p>

          <div className="space-x-4">
            <Button onClick={() => handleClick("Test Button 1")}>
              Test Button 1
            </Button>
            <Button
              onClick={() => handleClick("Test Button 2")}
              variant="outline"
            >
              Test Button 2
            </Button>
            <Button
              onClick={() => handleClick("Test Button 3")}
              variant="secondary"
            >
              Test Button 3
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 border border-yellow-200 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Header & Footer Button Test
          </h2>
          <p className="mb-4">
            Try clicking buttons in the header (menu, cart, search, favorites)
            and footer links. If they don&apos;t work, check the browser console
            for errors.
          </p>

          <div className="space-y-2">
            <p>
              <strong>What to test:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Header menu button (mobile)</li>
              <li>Header cart button</li>
              <li>Header search button</li>
              <li>Header favorites button</li>
              <li>Footer navigation links</li>
              <li>Footer social media links</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 p-6 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            Browser Console Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser Developer Tools (F12 or right-click → Inspect)</li>
            <li>Go to Console tab</li>
            <li>Click buttons and check for error messages</li>
            <li>Look for JavaScript errors or warnings</li>
          </ol>
        </div>
      </div>

      <Footer />
    </div>
  );
}
