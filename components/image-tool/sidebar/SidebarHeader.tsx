"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Grip } from "lucide-react";

export function SidebarHeader({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Grip className="h-4 w-4 text-stone-500" />
        <span className="block font-medium text-xs text-stone-700">Image Settings</span>
      </div>
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-stone-600" onClick={onReset}>
          Reset all
        </Button>
      </div>
    </div>
  );
}
