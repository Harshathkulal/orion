"use client";

import { Sheet,SheetTitle, SheetContent } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";

export default function MobileSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTitle/>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar onNavigate={() => setOpen(false)}/>
      </SheetContent>
    </Sheet>
  );
}
