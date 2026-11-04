import { ArrowDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { CopyEmail } from "@/components/chrome";
import { HeroShader } from "@/components/HeroShader";
import { ProjectStage } from "@/components/ProjectStage";
import { btnClass, TechIcon } from "@/components/ui";
import { getProject, profile, skillGroups } from "@/lib/content";

const wrap = "mx-auto max-w-[76rem] px-5 sm:px-8";

const heroFacts = ["4º semestre", "Formatura dez/2028", "Inglês intermediário", "Jacareí — SP"];

function ExtLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 transition-colors ${className}`}>
      {children}
      <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden />
    </a>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <HeroShader />
        <div className={`${wrap} relative flex min-h-[100svh] flex-col items-center justify-center pt-28 pb-24 text-center`}>
        <p className="rise inline-flex items-center gap-2 rounded-full border border-pink/35 bg-pink/[0.07] py-1 pr-3.5 pl-3 text-sm text-pink">
          <span className="relative flex size-2" aria-hidden>
            <span className="absolute inset-0 animate-ping rounded-full bg-pink opacity-60 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-pink" />
          </span>
          Disponível para estágio em TI
        </p>
        <h1 className="rise display mt-7 text-[clamp(3.5rem,11vw,6rem)]" style={{ "--i": 1 } as React.CSSProperties}>
          {profile.name}
        </h1>
        <p
          className="rise heading mt-5 max-w-[30ch] text-[clamp(1.375rem,2.6vw,2rem)] text-muted"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Engenharia de Software na UMC.{" "}
          <span className="text-fg">Quatro sistemas que funcionam, prontos para testar.</span>
        </p>
        <ul className="rise mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.9375rem] text-muted" style={{ "--i": 3 } as React.CSSProperties}>
          {heroFacts.map((f) => (
            <li key={f} className="whitespace-nowrap">{f}</li>
          ))}
        </ul>

        <div className="rise mt-10 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 4 } as React.CSSProperties}>
          <Link href="#projetos" className={btnClass("primary")}>
            Ver os projetos <ArrowDown size={16} aria-hidden />
          </Link>
          <CopyEmail />
        </div>
        <div className="rise mt-5 flex gap-6 text-[0.9375rem] text-muted" style={{ "--i": 4 } as React.CSSProperties}>
          <ExtLink href={profile.linkedin} className="hover:text-fg">LinkedIn</ExtLink>
          <ExtLink href={profile.github} className="hover:text-fg">GitHub</ExtLink>
        </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projetos" className={`${wrap} pt-16 sm:pt-24`}>
        <h2 className="heading max-w-[18ch] text-[clamp(2.5rem,6vw,4.5rem)]">Quatro sistemas. Todos funcionando.</h2>
        <p className="mt-6 max-w-[36rem] text-lg text-muted">
          Use cada um aqui mesmo enquanto rola a página. Os dados são fictícios e ficam salvos só no seu navegador.
        </p>
        <div className="mt-8 lg:mt-0">
          <ProjectStage />
        </div>
      </section>

      {/* Skills */}
      <section id="habilidades" className={`${wrap} border-t border-line/60 py-24 sm:py-32`}>
        <h2 className="heading max-w-[16ch] text-[clamp(2.5rem,6vw,4.5rem)]">Ferramentas, e onde usei cada uma.</h2>
        <div className="mt-16 grid gap-16">
          {skillGroups.map((g) => (
            <div key={g.title} className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:gap-12">
              <h3 className="text-lg font-semibold tracking-tight text-fg lg:pt-5">{g.title}</h3>
              <ul className="divide-y divide-line/60 border-t border-line/60">
                {g.skills.map((s) => (
                  <li key={s.name} className="grid grid-cols-[2.5rem_1fr] items-center gap-x-4 gap-y-2 py-5 sm:grid-cols-[2.5rem_1fr_auto]">
                    <span className="grid size-10 place-items-center rounded-xl border border-line/70 bg-raised/50">
                      <TechIcon tech={s} size={22} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-fg">{s.name}</span>
                      <span className="block text-[0.9375rem] text-muted">{s.what}</span>
                    </span>
                    {s.proof.length > 0 && (
                      <span className="col-start-2 flex flex-wrap gap-2 sm:col-start-3 sm:justify-end">
                        {s.proof.map((slug) => (
                          <Link
                            key={slug}
                            href={`/projetos/${slug}/`}
                            className="press rounded-full border border-line px-3 py-1 text-[0.8125rem] text-lav hover:border-lav/60"
                          >
                            {getProject(slug)!.name}
                          </Link>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="sobre" className={`${wrap} border-t border-line/60 py-24 sm:py-32`}>
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <h2 className="heading text-[clamp(2.5rem,6vw,4.5rem)]">Sobre mim</h2>
            <p className="mt-10 text-[clamp(1.375rem,2.4vw,1.75rem)] leading-snug tracking-tight text-fg">
              Moro em Jacareí e estudo Engenharia de Software na Universidade de Mogi das Cruzes. Na graduação, desenvolvo projetos de
              programação, banco de dados, prototipação, redes e segurança da informação.
            </p>
            <p className="mt-6 max-w-[36rem] text-muted">
              Procuro um estágio para aprender com profissionais da área e participar de projetos reais. Meus interesses são
              desenvolvimento de sistemas, aplicações web, modelagem de dados e interfaces digitais.
            </p>
          </div>
          <dl className="self-end border-t border-line/60">
            {profile.facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[9.5rem_1fr] gap-4 border-b border-line/60 py-4 text-[0.9375rem]">
                <dt className="text-muted">{f.label}</dt>
                <dd className="text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Contact */}
      <section id="contato" className="bg-pink text-pink-ink">
        <div className={`${wrap} py-24 sm:py-36`}>
          <h2 className="display text-[clamp(3.25rem,10vw,6rem)]">Vamos conversar?</h2>
          <p className="mt-6 max-w-[34rem] text-xl leading-relaxed text-pink-ink/80">
            Estou buscando meu primeiro estágio em TI. O jeito mais rápido de falar comigo é por e-mail.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-12 inline-block text-[clamp(1.5rem,4.6vw,3rem)] font-semibold tracking-tight underline decoration-pink-ink/30 decoration-2 underline-offset-[0.18em] transition-[text-decoration-color] hover:decoration-pink-ink"
          >
            {profile.email}
          </a>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <CopyEmail tone="pink" />
            <div className="flex gap-6 px-2 text-[0.9375rem] font-medium">
              <ExtLink href={profile.linkedin} className="hover:opacity-70">LinkedIn</ExtLink>
              <ExtLink href={profile.github} className="hover:opacity-70">GitHub</ExtLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
