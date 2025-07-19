import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginDialogProps } from "@/types/types";

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login to Continue</DialogTitle>
          <DialogDescription>
            Reached the limit. Please log in to continue using the chat.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={handleLogin}>Log In</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
