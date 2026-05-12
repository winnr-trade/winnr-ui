import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { socials, docsLink } from "@/config/constants";

export function Footer() {
  return (
    <footer className="w-full pt-8 pb-4 px-6 border-t border-border bg-background/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Logo className="h-5" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-px bg-border/60 hidden sm:block" />
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:block">
              Home Of Information Markets
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={docsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <Link href={socials.x} target="_blank" className="hover:opacity-70 transition-opacity">
            <Image src="/x.svg" alt="X (Twitter)" width={16} height={16} className="dark:invert" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
        <p suppressHydrationWarning>© {new Date().getFullYear()} WINNR. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-10">
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
