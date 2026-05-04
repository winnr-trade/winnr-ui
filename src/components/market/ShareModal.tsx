"use client";

import { Check, Copy } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const onShareX = () => {
    const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(
      `Predicting on Winnr: ${title}`,
    )}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, "_blank");
  };

  const onShareTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      url,
    )}&text=${encodeURIComponent(`Predicting on Winnr: ${title}`)}`;
    window.open(telegramUrl, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Market"
      description="Share this market with your community"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
            COPY LINK
          </span>
          <div className="flex gap-2">
            <Input
              readOnly
              value={url}
              className="bg-background/50 border-border rounded-none focus-visible:ring-0 focus-visible:border-white h-11 font-sans text-sm"
            />
            <Button
              onClick={onCopy}
              className="bg-primary text-black hover:bg-primary/90 h-11 px-4 rounded-none shrink-0"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">
            SOCIAL MEDIA
          </span>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onShareX}
              variant="outline"
              className="border-border hover:bg-white/5 h-12 rounded-none flex items-center gap-3 font-sans font-bold text-[11px] tracking-widest uppercase"
            >
              <Image src="/x.svg" alt="X" width={14} height={14} className="invert" />X
            </Button>
            <Button
              onClick={onShareTelegram}
              variant="outline"
              className="border-border hover:bg-white/5 h-12 rounded-none flex items-center gap-3 font-sans font-bold text-[11px] tracking-widest uppercase"
            >
              <Image src="/telegram.svg" alt="Telegram" width={20} height={20} className="invert" />
              Telegram
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
