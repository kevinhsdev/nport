"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Check, Copy, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "@/lib/content";
import { dismissToast, toast, useToast } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ anchors: { offset: -72 }, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

const links = [
  ["Projetos", "/#projetos"],
  ["Habilidades", "/#habilidades"],
  ["Sobre", "/#sobre"],
  ["Contato", "/#contato"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? "border-b border-white/[0.06] bg-ink/72 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[76rem] items-center justify-between gap-6 px-5 sm:px-8" aria-label="Principal">
        <Link href="/" className="text-[0.9375rem] font-semibold tracking-tight">
          {profile.name}
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-muted transition-colors duration-200 hover:text-fg">
              {label}
            </Link>
          ))}
          <a href={`mailto:${profile.email}`} className="press inline-flex h-9 items-center rounded-full bg-pink px-4 text-sm font-medium text-pink-ink hover:bg-[#f6a3d2]">
            Fale comigo
          </a>
        </div>
        <button
          type="button"
          className="press -mr-2 grid size-10 place-items-center rounded-full text-fg md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="border-t border-white/[0.06] px-5 pt-2 pb-6 md:hidden"
          >
            {links.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-line/60 py-4 text-2xl font-semibold tracking-tight">
                {label}
              </Link>
            ))}
            <a href={`mailto:${profile.email}`} className="press mt-6 inline-flex h-11 items-center rounded-full bg-pink px-5 font-medium text-pink-ink">
              Fale comigo
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function CopyEmail({ tone = "dark" }: { tone?: "dark" | "pink" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setDone(true);
      toast("E-mail copiado.");
      setTimeout(() => setDone(false), 1800);
    } catch {
      location.href = `mailto:${profile.email}`;
    }
  };
  const cls =
    tone === "pink"
      ? "border-pink-ink/25 text-pink-ink hover:bg-pink-ink/[0.06]"
      : "border-line text-fg hover:border-muted/60 hover:bg-white/[0.03]";
  return (
    <button type="button" onClick={copy} className={`press inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-[0.9375rem] ${cls}`}>
      <span className="font-mono text-[0.875rem]">{profile.email}</span>
      <span className="relative size-4" aria-hidden>
        <Copy size={16} strokeWidth={1.75} className={`absolute inset-0 transition-[opacity,transform,filter] duration-200 ${done ? "scale-50 opacity-0 blur-[2px]" : ""}`} />
        <Check size={16} strokeWidth={2} className={`absolute inset-0 transition-[opacity,transform,filter] duration-200 ${done ? "" : "scale-50 opacity-0 blur-[2px]"}`} />
      </span>
      <span className="sr-only">{done ? "copiado" : "copiar e-mail"}</span>
    </button>
  );
}

export function Toaster() {
  const t = useToast();
  const reduce = useReducedMotion();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {t && (
          <motion.div
            key={t.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96, transition: { duration: 0.18 } }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/10 bg-raised/90 py-2 pr-2 pl-5 text-sm text-fg shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          >
            {t.message}
            {t.action ? (
              <button
                type="button"
                className="press h-8 rounded-full bg-pink px-3.5 text-[0.8125rem] font-medium text-pink-ink"
                onClick={() => {
                  t.action!.run();
                  dismissToast();
                }}
              >
                {t.action.label}
              </button>
            ) : (
              <span className="w-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
