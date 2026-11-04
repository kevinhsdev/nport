import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Demo } from "@/components/demos";
import { TechIcon } from "@/components/ui";
import { getProject, projects } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => projects.map((p) => ({ slug: p.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.name, description: `${p.tagline} ${p.summary}` } : {};
}

const wrap = "mx-auto max-w-[76rem] px-5 sm:px-8";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t border-line/60 py-12 lg:grid-cols-[16rem_1fr] lg:gap-12 lg:py-16">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

export default async function ProjectPage({ params }: Props) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];

  const meta: [string, React.ReactNode][] = [
    ["Área", p.category],
    ["Contexto", "Projeto acadêmico · UMC"],
    ...(p.role ? [["Papel", p.role] as [string, React.ReactNode]] : []),
    [
      "Tecnologias",
      <span key="t" className="flex flex-wrap gap-x-4 gap-y-1.5">
        {p.stack.map((t) => (
          <span key={t.name} className="inline-flex items-center gap-1.5">
            <TechIcon tech={t} size={16} /> {t.name}
          </span>
        ))}
      </span>,
    ],
  ];

  return (
    <main>
      <header className={`${wrap} pt-32 pb-16 sm:pt-40`}>
        <Link href="/#projetos" className="press inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft size={15} aria-hidden /> Todos os projetos
        </Link>
        <h1 className="rise display mt-10 text-[clamp(3.25rem,9vw,6rem)]">{p.name}</h1>
        <p className="rise heading mt-3 max-w-[22ch] text-[clamp(1.5rem,3.2vw,2.5rem)] text-muted" style={{ "--i": 1 } as React.CSSProperties}>
          {p.tagline}
        </p>
        <dl className="rise mt-14 grid gap-6 border-t border-line/60 pt-6 text-[0.9375rem] sm:grid-cols-2 lg:grid-cols-4" style={{ "--i": 2 } as React.CSSProperties}>
          {meta.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-muted">{k}</dt>
              <dd className="mt-1 text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        {p.repo && (
          <a href={p.repo} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-pink">
            Ver repositório <ArrowUpRight size={15} aria-hidden />
          </a>
        )}
      </header>

      <section className={wrap}>
        <Row title="O problema">
          <p className="max-w-[40rem] text-[clamp(1.25rem,2vw,1.5rem)] leading-snug tracking-tight">{p.problem}</p>
        </Row>
        <Row title="O que construí">
          <ul className="grid max-w-[44rem] gap-px overflow-hidden rounded-2xl border border-line/60 bg-line/60">
            {p.built.map((b) => (
              <li key={b} className="bg-ink px-5 py-4">{b}</li>
            ))}
          </ul>
        </Row>
        <Row title="Decisões técnicas">
          <ul className="grid max-w-[44rem] gap-4 text-muted">
            {p.decisions.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-lav" aria-hidden />
                {d}
              </li>
            ))}
          </ul>
        </Row>
      </section>

      <section id="demo" className="mt-8 border-t border-line/60 bg-surface/50 py-20 sm:py-28">
        <div className={wrap}>
          <h2 className="heading text-[clamp(2.25rem,5vw,3.5rem)]">Teste o sistema</h2>
          <p className="mt-4 max-w-[36rem] text-muted">
            Esta é a versão completa. Cadastre, edite e exclua à vontade: tudo fica salvo só neste navegador, e dá para restaurar os
            exemplos quando quiser.
          </p>
          <div className="mt-12">
            <Demo project={p} />
          </div>
        </div>
      </section>

      <Link href={`/projetos/${next.slug}/`} className={`${wrap} group block py-24 sm:py-32`}>
        <span className="heading flex flex-wrap items-center gap-x-4 text-[clamp(2.5rem,7vw,5rem)] transition-colors group-hover:text-pink">
          <span className="text-muted">Próximo:</span>
          {next.name}
          <ArrowRight className="size-[0.6em] transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:translate-x-2" strokeWidth={1.5} aria-hidden />
        </span>
      </Link>
    </main>
  );
}
