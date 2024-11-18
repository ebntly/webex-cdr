"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSidebar } from "@/components/ui/sidebar";
import { Search } from "lucide-react";

export default function Page() {
  const { setBreadcrumbs } = useSidebar();

  setBreadcrumbs([
    {
      label: 'Home',
      url: '/v0',
    },
    {
      label: 'Trace'
    }
  ]);
  
  return (    
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl">Trace</h1>
      <div>
        <Alert className="lg:w-1/2 sm:w-full">
          <Search className="h4 w-4" />
          <AlertTitle>Nothing to see here</AlertTitle>
          <AlertDescription>You need to find a correlated <a href="/v0/cdr">CDR entry</a>.</AlertDescription>
        </Alert>
      </div>
    </div>
  )
}