"use client";

import { useSyncExternalStore } from "react";

/* ---------- Types (same shape as the original site, so saved data keeps loading) ---------- */

export type Idoso = { id: string; nome: string; idade: number; responsavel: string };
export type Med = { id: string; idosoId: string; nome: string; dose: string; horario: string; administrado: boolean };
export type Paciente = { id: string; nome: string; tipo: string };
export type Medicao = { id: string; pacienteId: string; valor: number; data: string; contexto: string };
export type Equip = { id: string; nome: string; setor: string; tipo: string; custo: number; status: string };
export type Incidente = { id: string; titulo: string; severidade: string; status: string; data: string };

export type DB = {
  care: { idosos: Idoso[]; medicamentos: Med[] };
  diabetes: { pacientes: Paciente[]; medicoes: Medicao[] };
  neo: { equipamentos: Equip[] };
  nina: { incidentes: Incidente[]; checklist: Record<string, boolean> };
};

const KEY = "nathalia_portfolio_v3";

export const CONTROLS = [
  "Utilizar senhas fortes",
  "Habilitar autenticação multifator",
  "Realizar backups periódicos",
  "Atualizar sistemas e aplicações",
  "Controlar permissões de acesso",
  "Registrar e tratar incidentes",
  "Treinar colaboradores",
  "Revisar políticas de segurança",
];

/* ---------- Helpers ---------- */

export const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);

export const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const localDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const formatDate = (v: string) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "Data inválida" : d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export function initialData(): DB {
  const idosoId = newId();
  const pacienteId = newId();
  return {
    care: {
      idosos: [{ id: idosoId, nome: "Maria Oliveira (exemplo)", idade: 74, responsavel: "Ana Oliveira" }],
      medicamentos: [
        { id: newId(), idosoId, nome: "Medicamento demonstrativo", dose: "Dose de exemplo", horario: "08:00", administrado: false },
      ],
    },
    diabetes: {
      pacientes: [{ id: pacienteId, nome: "Paciente Exemplo", tipo: "DM2" }],
      medicoes: [{ id: newId(), pacienteId, valor: 110, data: localDate(), contexto: "Jejum" }],
    },
    neo: {
      equipamentos: [
        { id: newId(), nome: "Switch central (exemplo)", setor: "TI", tipo: "Switch", custo: 1800, status: "Planejado" },
        { id: newId(), nome: "Firewall (exemplo)", setor: "TI", tipo: "Firewall", custo: 2500, status: "Planejado" },
      ],
    },
    nina: {
      incidentes: [
        { id: newId(), titulo: "Simulação de e-mail suspeito", severidade: "Média", status: "Em análise", data: new Date().toISOString() },
      ],
      checklist: {},
    },
  };
}

/* ---------- Store ---------- */

let db: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (
      s &&
      Array.isArray(s.care?.idosos) &&
      Array.isArray(s.care?.medicamentos) &&
      Array.isArray(s.diabetes?.pacientes) &&
      Array.isArray(s.diabetes?.medicoes) &&
      Array.isArray(s.neo?.equipamentos) &&
      Array.isArray(s.nina?.incidentes)
    ) {
      s.nina.checklist ??= {};
      return s;
    }
  } catch {
    /* corrupted storage falls back to examples */
  }
  return initialData();
}

function set(next: DB) {
  db = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    toast("Não foi possível salvar neste navegador.");
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => (db ??= load());

/** null during server render / hydration, the live DB afterwards. */
export const useDB = () => useSyncExternalStore(subscribe, getSnapshot, () => null);

export function update(fn: (draft: DB) => void) {
  const draft = structuredClone(getSnapshot());
  fn(draft);
  set(draft);
}

/** Destructive change with an undo toast instead of confirm(). */
export function destructive(message: string, fn: (draft: DB) => void) {
  const prev = getSnapshot();
  update(fn);
  toast(message, { label: "Desfazer", run: () => set(prev) });
}

/* ---------- Toast ---------- */

export type Toast = { id: number; message: string; action?: { label: string; run: () => void } };
let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const toastListeners = new Set<() => void>();
const emitToast = () => toastListeners.forEach((l) => l());

export function toast(message: string, action?: Toast["action"]) {
  current = { id: Date.now(), message, action };
  emitToast();
  clearTimeout(timer);
  timer = setTimeout(dismissToast, action ? 5000 : 2600);
}
export function dismissToast() {
  current = null;
  emitToast();
}
export const useToast = () =>
  useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => current,
    () => null,
  );
