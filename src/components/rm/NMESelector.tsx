"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NMEOption } from "@/types/resource-management";

interface NMESelectorProps {
  nmes: NMEOption[];
  selectedId?: string;
}

export function NMESelector({ nmes, selectedId }: NMESelectorProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    router.push(`/rm/nme?nme=${value}`);
  };

  const selectedNme = nmes.find((n) => n.id === selectedId);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-600">Select NME:</label>
      <Select value={selectedId} onValueChange={handleChange}>
        <SelectTrigger className="w-[320px] bg-white">
          <SelectValue placeholder="Choose an NME to view resources...">
            {selectedNme && (
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {selectedNme.code}
                </span>
                <span>{selectedNme.name}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {nmes.map((nme) => (
            <SelectItem key={nme.id} value={nme.id}>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {nme.code}
                </span>
                <span>{nme.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
