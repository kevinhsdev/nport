"use client";

import { Check, Download, RotateCcw, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Project } from "@/lib/content";
import {
  CONTROLS,
  destructive,
  formatDate,
  initialData,
  localDate,
  money,
  newId,
  toast,
  update,
  useDB,
  type DB,
} from "@/lib/store";
import { AppWindow, Button, Field, Loading, Panel, Select, Stats, Table } from "./ui";

const values = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  return Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
};

function Del({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  return (
    <Button variant="danger" size="sm" aria-label={`Excluir ${label}`} onClick={onConfirm}>
      <Trash2 size={14} strokeWidth={1.75} aria-hidden />
    </Button>
  );
}

const formGrid = "grid gap-4 sm:grid-cols-2 [&>button]:justify-self-start sm:[&>button]:self-end";

/* ---------------- CareDrop ---------------- */

function Care({ db, compact }: { db: DB; compact?: boolean }) {
  const { idosos, medicamentos: meds } = db.care;
  const nomeDe = (id: string) => idosos.find((i) => i.id === id)?.nome ?? "Não encontrado";

  const addIdoso = (e: FormEvent<HTMLFormElement>) => {
    const v = values(e);
    const idade = Number(v.idade);
    if (!v.nome.trim() || !v.responsavel.trim() || !Number.isInteger(idade) || idade < 0 || idade > 130)
      return toast("Confira nome, responsável e idade (0 a 130).");
    update((d) => void d.care.idosos.push({ id: newId(), nome: v.nome.trim(), idade, responsavel: v.responsavel.trim() }));
    e.currentTarget.reset();
    toast("Idoso cadastrado.");
  };

  const addMed = (e: FormEvent<HTMLFormElement>) => {
    const v = values(e);
    if (!idosos.some((i) => i.id === v.idosoId) || !v.nome.trim() || !v.dose.trim() || !v.horario)
      return toast("Escolha o idoso e preencha medicamento, dose e horário.");
    update((d) =>
      void d.care.medicamentos.push({ id: newId(), idosoId: v.idosoId, nome: v.nome.trim(), dose: v.dose.trim(), horario: v.horario, administrado: false }),
    );
    e.currentTarget.reset();
    toast("Medicamento adicionado.");
  };

  const toggle = (id: string) =>
    update((d) => {
      const m = d.care.medicamentos.find((x) => x.id === id);
      if (m) m.administrado = !m.administrado;
    });

  const agenda = [...meds].sort((a, b) => a.horario.localeCompare(b.horario));

  return (
    <div className="grid gap-8">
      <Stats items={[["Idosos", idosos.length], ["Medicamentos", meds.length], ["Pendentes", meds.filter((m) => !m.administrado).length]]} />

      {!compact && (
        <div className="grid gap-8 lg:grid-cols-2">
          <Panel title="Cadastrar idoso">
            <form onSubmit={addIdoso} className={formGrid}>
              <Field label="Nome" name="nome" required maxLength={100} />
              <Field label="Idade" name="idade" type="number" min={0} max={130} required />
              <Field label="Responsável" name="responsavel" required maxLength={100} />
              <Button type="submit">Cadastrar</Button>
            </form>
          </Panel>
          <Panel title="Adicionar medicamento">
            <form onSubmit={addMed} className={formGrid}>
              <Select label="Idoso" name="idosoId" required defaultValue="">
                <option value="">Selecione</option>
                {idosos.map((i) => (
                  <option key={i.id} value={i.id}>{i.nome}</option>
                ))}
              </Select>
              <Field label="Medicamento" name="nome" required maxLength={100} />
              <Field label="Dose" name="dose" required maxLength={60} />
              <Field label="Horário" name="horario" type="time" required />
              <Button type="submit">Adicionar</Button>
            </form>
          </Panel>
        </div>
      )}

      <Panel title="Agenda de hoje" aside={<span className="text-xs text-muted">registro manual, sem alertas</span>}>
        <ul className="grid gap-2">
          {agenda.length === 0 && <li className="py-6 text-center text-sm text-muted">Nenhum medicamento na agenda.</li>}
          {agenda.map((m) => (
            <li key={m.id} className="flex items-center gap-4 rounded-2xl border border-line/70 bg-ink/40 px-4 py-3">
              <span className="font-mono text-lg tabular-nums text-lav">{m.horario}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.9375rem] text-fg">{m.nome}</span>
                <span className="block truncate text-[0.8125rem] text-muted">{m.dose} · {nomeDe(m.idosoId)}</span>
              </span>
              <button
                type="button"
                onClick={() => toggle(m.id)}
                aria-pressed={m.administrado}
                className={`press inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium ${
                  m.administrado ? "border-pink bg-pink text-pink-ink" : "border-line text-fg hover:border-pink/60"
                }`}
              >
                <Check size={14} strokeWidth={2.25} aria-hidden className={m.administrado ? "" : "opacity-40"} />
                {m.administrado ? "Administrado" : "Marcar dado"}
              </button>
              {!compact && (
                <Del label={m.nome} onConfirm={() => destructive("Medicamento excluído.", (d) => void (d.care.medicamentos = d.care.medicamentos.filter((x) => x.id !== m.id)))} />
              )}
            </li>
          ))}
        </ul>
      </Panel>

      {!compact && (
        <Panel title="Idosos cadastrados">
          <Table head={["Nome", "Idade", "Responsável", ""]} empty={!idosos.length}>
            {idosos.map((i) => (
              <tr key={i.id}>
                <td className="text-fg">{i.nome}</td>
                <td>{i.idade}</td>
                <td className="text-muted">{i.responsavel}</td>
                <td className="text-right">
                  <Del
                    label={i.nome}
                    onConfirm={() =>
                      destructive("Idoso e medicamentos excluídos.", (d) => {
                        d.care.idosos = d.care.idosos.filter((x) => x.id !== i.id);
                        d.care.medicamentos = d.care.medicamentos.filter((x) => x.idosoId !== i.id);
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      )}
    </div>
  );
}

/* ---------------- Diabetes ---------------- */

function average(list: { valor: number; data: string }[], days: number) {
  const now = Date.now();
  const r = list.filter((m) => {
    const t = new Date(m.data).getTime();
    return t >= now - days * 864e5 && t <= now;
  });
  return r.length ? `${(r.reduce((s, m) => s + m.valor, 0) / r.length).toFixed(0)} mg/dL` : "—";
}

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function Diabetes({ db, compact }: { db: DB; compact?: boolean }) {
  const { pacientes, medicoes } = db.diabetes;
  const [filtro, setFiltro] = useState("");
  const f = pacientes.some((p) => p.id === filtro) ? filtro : "";
  const nomeDe = (id: string) => pacientes.find((p) => p.id === id)?.nome ?? "Não encontrado";
  const visiveis = medicoes.filter((m) => !f || m.pacienteId === f).sort((a, b) => +new Date(b.data) - +new Date(a.data));

  const addPaciente = (e: FormEvent<HTMLFormElement>) => {
    const v = values(e);
    if (!v.nome.trim()) return toast("Informe o nome do paciente.");
    update((d) => void d.diabetes.pacientes.push({ id: newId(), nome: v.nome.trim(), tipo: v.tipo }));
    e.currentTarget.reset();
    toast("Paciente cadastrado.");
  };

  const addMedicao = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const v = values(e);
    const valor = Number(v.valor);
    const t = new Date(v.data).getTime();
    if (!pacientes.some((p) => p.id === v.pacienteId) || !(valor >= 1 && valor <= 1000) || !Number.isFinite(t) || t > Date.now())
      return toast("Confira paciente, valor (1 a 1000) e data, que não pode estar no futuro.");
    update((d) => void d.diabetes.medicoes.push({ id: newId(), pacienteId: v.pacienteId, valor, data: v.data, contexto: v.contexto }));
    form.reset();
    (form.elements.namedItem("data") as HTMLInputElement).value = localDate();
    toast("Medição registrada.");
  };

  const exportar = () => {
    if (!visiveis.length) return toast("Não há medições para exportar.");
    const rows = [["Paciente", "Glicemia mg/dL", "Data", "Contexto"], ...visiveis.map((m) => [nomeDe(m.pacienteId), m.valor, formatDate(m.data), m.contexto])];
    const csv = "﻿" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "historico_glicemia.csv" });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Histórico exportado.");
  };

  return (
    <div className="grid gap-8">
      <Stats items={[["Medições", visiveis.length], ["Média 7 dias", average(visiveis, 7)], ["Média 30 dias", average(visiveis, 30)]]} />

      {!compact && (
        <div className="grid gap-8 lg:grid-cols-2">
          <Panel title="Cadastrar paciente">
            <form onSubmit={addPaciente} className={formGrid}>
              <Field label="Nome" name="nome" required maxLength={100} />
              <Select label="Tipo" name="tipo">
                <option>DM1</option>
                <option>DM2</option>
                <option>Pré-diabetes</option>
              </Select>
              <Button type="submit">Cadastrar</Button>
            </form>
          </Panel>
          <Panel title="Registrar glicemia">
            <form onSubmit={addMedicao} className={formGrid}>
              <Select label="Paciente" name="pacienteId" required defaultValue="">
                <option value="">Selecione</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </Select>
              <Field label="Valor (mg/dL)" name="valor" type="number" min={1} max={1000} required />
              <Field label="Data e hora" name="data" type="datetime-local" required defaultValue={localDate()} />
              <Select label="Contexto" name="contexto">
                <option>Jejum</option>
                <option>Pré-refeição</option>
                <option>Pós-refeição</option>
                <option>Outro</option>
              </Select>
              <Button type="submit">Registrar</Button>
            </form>
          </Panel>
        </div>
      )}

      <Panel
        title="Histórico de medições"
        aside={
          !compact && (
            <div className="flex items-center gap-2">
              <Select aria-label="Filtrar por paciente" value={f} onChange={(e) => setFiltro(e.target.value)} className="h-9 w-44 text-sm">
                <option value="">Todos os pacientes</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </Select>
              <Button variant="ghost" size="sm" onClick={exportar}>
                <Download size={14} aria-hidden /> CSV
              </Button>
            </div>
          )
        }
      >
        <Table head={["Paciente", "Glicemia", "Data", "Contexto", ...(compact ? [] : [""])]} empty={!visiveis.length}>
          {visiveis.slice(0, compact ? 4 : undefined).map((m) => (
            <tr key={m.id}>
              <td className="text-fg">{nomeDe(m.pacienteId)}</td>
              <td className="font-mono text-lav">{m.valor} mg/dL</td>
              <td className="text-muted">{formatDate(m.data)}</td>
              <td className="text-muted">{m.contexto}</td>
              {!compact && (
                <td className="text-right">
                  <Del label="medição" onConfirm={() => destructive("Medição excluída.", (d) => void (d.diabetes.medicoes = d.diabetes.medicoes.filter((x) => x.id !== m.id)))} />
                </td>
              )}
            </tr>
          ))}
        </Table>
      </Panel>

      {!compact && (
        <Panel title="Pacientes">
          <Table head={["Nome", "Tipo", ""]} empty={!pacientes.length}>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td className="text-fg">{p.nome}</td>
                <td className="text-muted">{p.tipo}</td>
                <td className="text-right">
                  <Del
                    label={p.nome}
                    onConfirm={() =>
                      destructive("Paciente e medições excluídos.", (d) => {
                        d.diabetes.pacientes = d.diabetes.pacientes.filter((x) => x.id !== p.id);
                        d.diabetes.medicoes = d.diabetes.medicoes.filter((x) => x.pacienteId !== p.id);
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </Table>
          <p className="text-[0.8125rem] text-muted">Médias apenas informativas. Este protótipo não oferece avaliação, diagnóstico ou orientação médica.</p>
        </Panel>
      )}
    </div>
  );
}

/* ---------------- NeoLogix ---------------- */

const TOPOLOGY = ["Internet", "Roteador de borda", "Firewall", "Switch central", "Switches de acesso e servidores"];

function Neo({ db, compact }: { db: DB; compact?: boolean }) {
  const eq = db.neo.equipamentos;

  const add = (e: FormEvent<HTMLFormElement>) => {
    const v = values(e);
    const custo = Number(v.custo);
    if (!v.nome.trim() || !Number.isFinite(custo) || custo < 0) return toast("Confira o nome e o custo do equipamento.");
    update((d) => void d.neo.equipamentos.push({ id: newId(), nome: v.nome.trim(), setor: v.setor, tipo: v.tipo, custo, status: v.status }));
    e.currentTarget.reset();
    toast("Equipamento adicionado.");
  };

  const setStatus = (id: string, status: string) =>
    update((d) => {
      const it = d.neo.equipamentos.find((x) => x.id === id);
      if (it) it.status = status;
    });

  return (
    <div className="grid gap-8">
      <Stats items={[["Equipamentos", eq.length], ["Ativos", eq.filter((x) => x.status === "Ativo").length], ["Custo total", money(eq.reduce((s, x) => s + x.custo, 0))]]} />

      {!compact && (
        <Panel title="Cadastrar equipamento">
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>button]:justify-self-start lg:[&>button]:self-end">
            <Field label="Equipamento" name="nome" required maxLength={100} />
            <Select label="Setor" name="setor">
              {["Administrativo/RH", "Financeiro", "Comercial", "TI", "Servidores"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Tipo" name="tipo">
              {["Computador", "Switch", "Roteador", "Firewall", "Servidor", "Impressora", "Outro"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Field label="Custo (R$)" name="custo" type="number" min={0} step="0.01" required />
            <Select label="Status" name="status">
              {["Planejado", "Ativo", "Manutenção"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Button type="submit">Adicionar</Button>
          </form>
        </Panel>
      )}

      <div className={compact ? "grid gap-8" : "grid gap-8 lg:grid-cols-[1fr_16rem]"}>
        <Panel title="Inventário">
          <Table head={["Equipamento", "Setor", "Custo", "Status", ...(compact ? [] : [""])]} empty={!eq.length}>
            {eq.map((x) => (
              <tr key={x.id}>
                <td className="text-fg">{x.nome}<span className="block text-xs text-muted">{x.tipo}</span></td>
                <td className="text-muted">{x.setor}</td>
                <td className="font-mono text-lav">{money(x.custo)}</td>
                <td>
                  <Select aria-label={`Status de ${x.nome}`} value={x.status} onChange={(e) => setStatus(x.id, e.target.value)} className="h-9 w-36 text-sm">
                    {["Planejado", "Ativo", "Manutenção"].map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </td>
                {!compact && (
                  <td className="text-right">
                    <Del label={x.nome} onConfirm={() => destructive("Equipamento excluído.", (d) => void (d.neo.equipamentos = d.neo.equipamentos.filter((y) => y.id !== x.id)))} />
                  </td>
                )}
              </tr>
            ))}
          </Table>
        </Panel>
        {!compact && (
          <Panel title="Topologia conceitual">
            <ol className="relative grid gap-3 before:absolute before:top-4 before:bottom-4 before:left-[0.6875rem] before:w-px before:bg-line">
              {TOPOLOGY.map((n, i) => (
                <li key={n} className="relative flex items-center gap-3 text-sm">
                  <span className={`z-10 grid size-[1.375rem] place-items-center rounded-full border text-[0.6875rem] font-mono ${i === 0 ? "border-pink text-pink" : "border-line bg-surface text-muted"}`}>{i + 1}</span>
                  <span className="text-fg">{n}</span>
                </li>
              ))}
            </ol>
            <p className="text-[0.8125rem] text-muted">Diagrama acadêmico; não representa monitoramento em tempo real.</p>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ---------------- NINA ---------------- */

const sevColor: Record<string, string> = { Baixa: "text-muted", Média: "text-lav", Alta: "text-pink", Crítica: "text-danger font-medium" };

function Nina({ db, compact }: { db: DB; compact?: boolean }) {
  const { incidentes, checklist } = db.nina;
  const feitos = CONTROLS.filter((c) => checklist[c]).length;

  const add = (e: FormEvent<HTMLFormElement>) => {
    const v = values(e);
    if (!v.titulo.trim()) return toast("Descreva o incidente.");
    update((d) => void d.nina.incidentes.push({ id: newId(), titulo: v.titulo.trim(), severidade: v.severidade, status: v.status, data: new Date().toISOString() }));
    e.currentTarget.reset();
    toast("Incidente registrado.");
  };

  const setStatus = (id: string, status: string) =>
    update((d) => {
      const it = d.nina.incidentes.find((x) => x.id === id);
      if (it) it.status = status;
    });

  const checklistEl = (
    <Panel title="Checklist de segurança" aside={<span className="font-mono text-sm tabular-nums text-lav">{feitos}/{CONTROLS.length}</span>}>
      <ul className="grid gap-1 sm:grid-cols-2">
        {CONTROLS.map((c) => (
          <li key={c}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm text-fg transition-colors hover:bg-white/[0.03]">
              <input type="checkbox" className="size-4" checked={!!checklist[c]} onChange={(e) => update((d) => void (d.nina.checklist[c] = e.target.checked))} />
              {c}
            </label>
          </li>
        ))}
      </ul>
    </Panel>
  );

  return (
    <div className="grid gap-8">
      <Stats items={[["Incidentes", incidentes.length], ["Não resolvidos", incidentes.filter((x) => x.status !== "Resolvido").length], ["Controles", `${feitos}/${CONTROLS.length}`]]} />

      {!compact && (
        <Panel title="Registrar incidente">
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end [&>button]:justify-self-start">
            <Field label="Descrição" name="titulo" required maxLength={150} />
            <Select label="Severidade" name="severidade">
              {["Baixa", "Média", "Alta", "Crítica"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Status" name="status">
              {["Aberto", "Em análise", "Resolvido"].map((s) => <option key={s}>{s}</option>)}
            </Select>
            <Button type="submit">Registrar</Button>
          </form>
        </Panel>
      )}

      {compact ? (
        checklistEl
      ) : (
        <>
          <Panel title="Incidentes registrados">
            <Table head={["Incidente", "Severidade", "Status", "Data", ""]} empty={!incidentes.length}>
              {incidentes.map((x) => (
                <tr key={x.id}>
                  <td className="text-fg">{x.titulo}</td>
                  <td className={sevColor[x.severidade] ?? "text-muted"}>{x.severidade}</td>
                  <td>
                    <Select aria-label={`Status de ${x.titulo}`} value={x.status} onChange={(e) => setStatus(x.id, e.target.value)} className="h-9 w-36 text-sm">
                      {["Aberto", "Em análise", "Resolvido"].map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  </td>
                  <td className="text-muted">{formatDate(x.data)}</td>
                  <td className="text-right">
                    <Del label={x.titulo} onConfirm={() => destructive("Incidente excluído.", (d) => void (d.nina.incidentes = d.nina.incidentes.filter((y) => y.id !== x.id)))} />
                  </td>
                </tr>
              ))}
            </Table>
          </Panel>
          {checklistEl}
        </>
      )}
    </div>
  );
}

/* ---------------- Entry ---------------- */

const key: Record<Project["slug"], keyof DB> = { caredrop: "care", diabetes: "diabetes", neologix: "neo", nina: "nina" };
const views = { caredrop: Care, diabetes: Diabetes, neologix: Neo, nina: Nina };

export function DemoBody({ slug, compact }: { slug: Project["slug"]; compact?: boolean }) {
  const db = useDB();
  if (!db) return <Loading />;
  const View = views[slug];
  return <View db={db} compact={compact} />;
}

export function Demo({ project }: { project: Project }) {
  const restore = () =>
    destructive("Exemplos restaurados.", (d) => {
      const k = key[project.slug];
      (d as Record<keyof DB, unknown>)[k] = initialData()[k];
    });
  return (
    <AppWindow
      title={project.name}
      footer={
        <>
          <span>Use somente dados fictícios.</span>
          <Button variant="ghost" size="sm" onClick={restore}>
            <RotateCcw size={13} aria-hidden /> Restaurar exemplos
          </Button>
        </>
      }
    >
      <DemoBody slug={project.slug} />
    </AppWindow>
  );
}
