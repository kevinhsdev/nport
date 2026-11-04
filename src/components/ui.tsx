import { KanbanSquare, Network, ShieldCheck } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { icon, type Tech } from "@/lib/content";

const lucideMap = { kanban: KanbanSquare, network: Network, shield: ShieldCheck };

export function TechIcon({ tech, size = 20 }: { tech: Pick<Tech, "icon" | "lucide" | "name">; size?: number }) {
  if (tech.icon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={icon(tech.icon)} alt="" width={size} height={size} className="shrink-0" />;
  }
  const L = lucideMap[tech.lucide ?? "network"];
  return <L aria-hidden size={size} strokeWidth={1.75} className="shrink-0 text-lav" />;
}

type BtnProps = ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger"; size?: "sm" | "md" };

export const btnClass = (variant: BtnProps["variant"] = "primary", size: BtnProps["size"] = "md") =>
  [
    "press inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none",
    "disabled:opacity-40 disabled:pointer-events-none",
    size === "sm" ? "h-8 px-3.5 text-[0.8125rem]" : "h-11 px-5 text-[0.9375rem]",
    variant === "primary" && "bg-pink text-pink-ink hover:bg-[#f6a3d2]",
    variant === "ghost" && "border border-line text-fg hover:border-muted/60 hover:bg-white/[0.03]",
    variant === "danger" && "text-danger hover:bg-danger/10",
  ]
    .filter(Boolean)
    .join(" ");

export function Button({ variant, size, className = "", type = "button", ...rest }: BtnProps) {
  return <button type={type} className={`${btnClass(variant, size)} ${className}`} {...rest} />;
}

const fieldClass =
  "h-11 w-full min-w-0 rounded-xl border border-line bg-ink px-3.5 text-[0.9375rem] text-fg placeholder:text-muted/70 transition-colors duration-200 hover:border-muted/50 focus:border-pink focus:outline-none";

export function Field({ label, ...rest }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm text-muted">
      {label}
      <input className={fieldClass} {...rest} />
    </label>
  );
}

export function Select({ label, children, className = "", ...rest }: ComponentProps<"select"> & { label?: string }) {
  const el = (
    <select className={`${fieldClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 fill=%22none%22 stroke=%22%23bcb7ce%22 stroke-width=%221.6%22><path d=%22m1 1.5 5 5 5-5%22/></svg>')] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9 ${className}`} {...rest}>
      {children}
    </select>
  );
  if (!label) return el;
  return (
    <label className="grid gap-1.5 text-sm text-muted">
      {label}
      {el}
    </label>
  );
}

export function Stats({ items }: { items: [label: string, value: ReactNode][] }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 px-3 py-3.5 sm:px-5">
          <dt className="truncate text-xs text-muted sm:text-[0.8125rem]">{label}</dt>
          <dd className="mt-0.5 font-mono text-[0.9375rem] font-medium tabular-nums break-words text-fg sm:text-xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty: boolean }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm tabular-nums">
        <thead>
          <tr className="border-b border-line text-[0.8125rem] text-muted">
            {head.map((h) => (
              <th key={h} scope="col" className="py-2.5 pr-4 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line/60 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-middle">
          {empty ? (
            <tr>
              <td colSpan={head.length} className="text-center text-muted">
                Nenhum registro ainda. Use o formulário acima para criar o primeiro.
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Panel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="grid content-start gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[0.9375rem] font-semibold tracking-tight text-fg">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function AppWindow({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-surface [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06),0_50px_100px_-40px_rgba(0,0,0,0.75)]">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-raised/60 px-5 py-3">
        <span className="text-sm font-medium text-fg">{title}</span>
        <span className="hidden font-mono text-xs text-muted sm:inline">dados fictícios · salvos neste navegador</span>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
      {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-muted">{footer}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="h-64 animate-pulse rounded-2xl bg-raised/50" aria-label="Carregando demonstração" />;
}
