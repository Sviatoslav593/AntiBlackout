"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface USBCableFiltersProps {
  onFiltersChange: (filters: {
    inputConnector?: string;
    outputConnector?: string;
    cableLength?: string;
  }) => void;
  categoryId?: number;
}

export default function USBCableFilters({
  onFiltersChange,
  categoryId,
}: USBCableFiltersProps) {
  const [inputConnector, setInputConnector] = useState<string>("");
  const [outputConnector, setOutputConnector] = useState<string>("");
  const [cableLength, setCableLength] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Simple options for now
  const inputOptions = ["USB-C", "USB-A", "Micro-USB", "Lightning"];
  const outputOptions = ["USB-C", "USB-A", "Micro-USB", "Lightning"];
  const lengthOptions = ["0.5", "1", "1.5", "2", "3", "5"];

  // Debounced filter change
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange({
        inputConnector: inputConnector || undefined,
        outputConnector: outputConnector || undefined,
        cableLength: cableLength || undefined,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [inputConnector, outputConnector, cableLength, onFiltersChange]);

  const clearFilters = () => {
    setInputConnector("");
    setOutputConnector("");
    setCableLength("");
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Фільтри для кабелів</h4>
      <div className="space-y-3">
        {/* Input Connector */}
        <Select value={inputConnector} onValueChange={setInputConnector}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Вхід (Тип коннектора)" />
          </SelectTrigger>
          <SelectContent>
            {inputOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Output Connector */}
        <Select value={outputConnector} onValueChange={setOutputConnector}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Вихід (Тип коннектора)" />
          </SelectTrigger>
          <SelectContent>
            {outputOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cable Length */}
        <Select value={cableLength} onValueChange={setCableLength}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Довжина кабелю, м" />
          </SelectTrigger>
          <SelectContent>
            {lengthOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option} м
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {(inputConnector || outputConnector || cableLength) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="cursor-pointer w-full"
        >
          Очистити фільтри кабелів
        </Button>
      )}
    </div>
  );
}
