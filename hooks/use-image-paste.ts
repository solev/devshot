import * as React from "react";
import { useImageStore } from "@/lib/store";

export function useImagePaste() {
  const { setBlob, setUploadedBlob, updateBlobDimensions } = useImageStore();

  const processFile = React.useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const src = e.target.result as string;
        setBlob({ src });
        setUploadedBlob(file);
        
        // Get image dimensions
        try {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const nw = img.naturalWidth || img.width;
            const nh = img.naturalHeight || img.height;
            // Update dimensions in store
            updateBlobDimensions(nw, nh);
            URL.revokeObjectURL(url);
          };
          img.onerror = () => URL.revokeObjectURL(url);
          img.src = url;
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  }, [setBlob, setUploadedBlob, updateBlobDimensions]);

  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.kind === "file" && item.type.includes("image")) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFile]);

  return { processFile };
}
