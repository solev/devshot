import * as React from "react";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import { useImagePaste } from "@/hooks/use-image-paste";

export function LandingPage() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  // Use the global paste hook which also provides processFile
  const { processFile } = useImagePaste();

  const handleFileSelect = (file: File) => {
    if (file && file.type.includes("image")) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <main className="min-h-svh w-full bg-gradient-to-br from-stone-50 to-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-stone-900 mb-6">
            Make your screenshots{" "}
            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              beautiful
            </span>
          </h1>
          <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
            Transform your boring screenshots into stunning visuals with
            beautiful frames, backgrounds, and effects. No design skills
            required.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-stone-200">
              <div className="text-2xl mb-3">🎨</div>
              <h3 className="font-semibold text-stone-800 mb-2">
                Beautiful Frames
              </h3>
              <p className="text-sm text-stone-600">
                Choose from elegant device frames and custom borders
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-stone-200">
              <div className="text-2xl mb-3">✨</div>
              <h3 className="font-semibold text-stone-800 mb-2">
                Stunning Backgrounds
              </h3>
              <p className="text-sm text-stone-600">
                Gradients, patterns, and waves to make your shots pop
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-stone-200">
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="font-semibold text-stone-800 mb-2">AI-Powered</h3>
              <p className="text-sm text-stone-600">
                Smart suggestions to enhance your screenshots automatically
              </p>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="relative w-full max-w-4xl mx-auto">
          <div
            className={cn(
              "relative flex items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer bg-white/70 backdrop-blur-sm",
              isDragging
                ? "border-rose-400 bg-rose-50/70 scale-[1.02]"
                : "border-stone-300 hover:border-stone-400 hover:bg-white/90"
            )}
            style={{ height: "400px" }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
          >
            <div className="flex flex-col items-center text-center space-y-4 p-8">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                  isDragging ? "bg-rose-100" : "bg-stone-100"
                )}
              >
                <ImagePlus
                  className={cn(
                    "size-8 transition-colors duration-300",
                    isDragging ? "text-rose-500" : "text-stone-400"
                  )}
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold text-stone-800">
                  {isDragging
                    ? "Drop your image here"
                    : "Drop your screenshot here"}
                </h3>
                <p className="text-stone-600 max-w-md">
                  Drag and drop your image, paste from clipboard, or click to
                  browse files
                </p>
              </div>

              {/* Keyboard shortcuts */}
              <div className="flex items-center gap-4 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded-md bg-stone-200 text-stone-700 font-mono text-xs">
                    ⌘V
                  </kbd>
                  <span>Paste</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded-md bg-stone-200 text-stone-700 font-mono text-xs">
                    Click
                  </kbd>
                  <span>Browse</span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              id="screenshot-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Additional tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-stone-500 mb-4">
              Supported formats: PNG, JPG, GIF, WebP
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-stone-400">
              <span>• Perfect for code screenshots</span>
              <span>• Great for app mockups</span>
              <span>• Ideal for social media</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
