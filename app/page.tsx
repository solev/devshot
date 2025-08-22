"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ImageTool } from "@/components/image-tool"
import { useImageStore } from "@/lib/store";
import { LandingPage } from "@/components/landing-page";
import { useImagePaste } from "@/hooks/use-image-paste";

export default function Page() {
  const { isBlobAdded } = useImageStore();
  
  // Global paste handling
  useImagePaste();

  if(!isBlobAdded()) 
    return <LandingPage />;

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-svh w-full bg-white">
          <div className="mx-auto max-w-[120rem] px-4 py-6 md:px-8">
            <h1 className="text-xl font-semibold text-stone-800 mb-4">Make your screenshots beautiful</h1>
            <ImageTool />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
