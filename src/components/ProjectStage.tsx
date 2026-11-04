"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/lib/content";
import { DemoBody } from "./demos";
import { AppWindow, btnClass, TechIcon } from "./ui";

gsap.registerPlugin(ScrollTrigger);

function Window({ project }: { project: Project }) {
  return (
    <AppWindow title={project.name}>
      <div data-lenis-prevent className="-m-1 h-[27rem] overflow-y-auto p-1">
        <DemoBody slug={project.slug} compact />
      </div>
    </AppWindow>
  );
}

function Copy({ p }: { p: Project }) {
  return (
    <>
      <h3 className="heading text-[clamp(2.5rem,5vw,4rem)]">{p.name}</h3>
      <p className="heading mt-2 text-[clamp(1.375rem,2.4vw,1.875rem)] text-muted">{p.tagline}</p>
      <p className="mt-6 max-w-[34rem] text-muted">{p.problem}</p>
      <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted" aria-label="Tecnologias">
        <li className="text-lav">{p.category}</li>
        {p.stack.map((t) => (
          <li key={t.name} className="flex items-center gap-2">
            <TechIcon tech={t} size={18} />
            {t.name}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/projetos/${p.slug}/`} className={btnClass("primary")}>
          Ver estudo de caso <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href={`/projetos/${p.slug}/#demo`} className={btnClass("ghost")}>
          Testar o sistema completo
        </Link>
      </div>
    </>
  );
}

export function ProjectStage() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" },
      (ctx) => {
        const { desktop, motion } = ctx.conditions as { desktop: boolean; motion: boolean };
        if (!desktop) return;
        gsap.utils.toArray<HTMLElement>("[data-step]", root.current).forEach((el, i) =>
          ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setActive(i) }),
        );
        if (motion) {
          gsap.fromTo(
            "[data-stage-window]",
            { clipPath: "inset(10% 8% 10% 8% round 48px)", scale: 0.94 },
            {
              clipPath: "inset(0% 0% 0% 0% round 28px)",
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top 90%", end: "top 20%", scrub: true },
            },
          );
        }
      },
      root,
    );
    return () => mm.revert();
  }, []);

  const p = projects[active];

  return (
    <div ref={root} className="relative lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div>
        {projects.map((proj, i) => (
          <article key={proj.slug} data-step className="py-16 lg:flex lg:min-h-[88svh] lg:flex-col lg:justify-center lg:py-0">
            <div className={`transition-opacity duration-500 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
              <Copy p={proj} />
            </div>
            <div className="mt-10 lg:hidden">
              <Window project={proj} />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-[calc(50svh-17.5rem)]">
          <div data-stage-window className="will-change-[clip-path,transform]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p.slug}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                <Window project={p} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-5 flex justify-center gap-2" aria-hidden>
            {projects.map((x, i) => (
              <span key={x.slug} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-pink" : "w-1.5 bg-line"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
