"use client";

import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { docsLink, socials } from "@/config/constants";
import { cn } from "@/utils/cn";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return cn(
      "flex items-center w-full px-4 py-4 text-sm font-heading tracking-widest uppercase transition-all duration-200 border-l-2",
      isActive
        ? "text-foreground font-bold border-primary bg-primary/5"
        : "text-muted-foreground font-medium border-transparent hover:text-foreground hover:bg-muted/30 hover:border-border",
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[320px] bg-background/95 backdrop-blur-md border-l border-border/50 p-0 flex flex-col"
      >
        <SheetHeader className="p-6 border-b border-border/20">
          <SheetTitle className="text-left">
            <Logo className="h-6" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col py-6">
          <Link href="/" className={getLinkClasses("/")} onClick={() => setOpen(false)}>
            Markets
          </Link>
          <Link
            href="/portfolio"
            className={getLinkClasses("/portfolio")}
            onClick={() => setOpen(false)}
          >
            Portfolio
          </Link>
          <Link href="/stake" className={getLinkClasses("/stake")} onClick={() => setOpen(false)}>
            Stake
          </Link>
          <a
            href={docsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full px-4 py-4 text-sm font-heading font-medium tracking-widest uppercase transition-all duration-200 border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border mt-4"
            onClick={() => setOpen(false)}
          >
            Docs
          </a>
        </nav>

        <div className="mt-auto p-6 border-t border-border/20 flex items-center justify-between gap-4">
          <p className="text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-muted-foreground/40">
            Winnr - Home of Information Markets
          </p>
          <a
            href={socials.x}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-muted/50 rounded-md transition-colors"
          >
            <Image
              src="/x.svg"
              alt="X (Twitter)"
              width={16}
              height={16}
              className="dark:invert opacity-70 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
