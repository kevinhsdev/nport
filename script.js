
"use strict";

/* =========================================
   PORTFÓLIO NATHALIA LEMES
   SISTEMAS DEMONSTRATIVOS
========================================= */

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const KEY = "nathalia_portfolio_v3";

const APP_NAMES = {
  care: "CareDrop",
  diabetes: "Controle de Diabetes",
  neo: "NeoLogix",
  nina: "NINA Tecnologia"
};

const CONTROLS = [
  "Utilizar senhas fortes",
  "Habilitar autenticação multifator",
  "Realizar backups periódicos",
  "Atualizar sistemas e aplicações",
  "Controlar permissões de acesso",
  "Registrar e tratar incidentes",
  "Treinar colaboradores",
  "Revisar políticas de segurança"
];

let currentApp = null;
let lastFocus = null;
let toastTimeout;

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
}

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

function money(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function localDate() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString().slice(0, 16);
}

function formatDate(value) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Data inválida"
    : date.toLocaleString("pt-BR");
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function stat(label, value) {
  return `
    <div class="stat">
      <strong>${escapeHTML(value)}</strong>
      <span>${escapeHTML(label)}</span>
    </div>
  `;
}

function emptyRow(columns) {
  return `
    <tr>
      <td class="empty" colspan="${columns}">
        Nenhum registro encontrado.
      </td>
    </tr>
  `;
}

function deleteButton(type, id) {
  return `
    <button type="button"
      class="btn danger small"
      data-delete="${type}"
      data-id="${escapeHTML(id)}">
      Excluir
    </button>
  `;
}

function toast(message) {
  const element = $("#toast");

  element.textContent = message;
  element.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    element.classList.remove("visible");
  }, 2500);
}

/* =========================================
   DADOS FICTÍCIOS INICIAIS
========================================= */

function initialData() {
  const idosoId = newId();
  const pacienteId = newId();

  return {
    care: {
      idosos: [
        {
          id: idosoId,
          nome: "Maria Oliveira (exemplo)",
          idade: 74,
          responsavel: "Ana Oliveira"
        }
      ],
      medicamentos: [
        {
          id: newId(),
          idosoId,
          nome: "Medicamento demonstrativo",
          dose: "Dose de exemplo",
          horario: "08:00",
          administrado: false
        }
      ]
    },

    diabetes: {
      pacientes: [
        {
          id: pacienteId,
          nome: "Paciente Exemplo",
          tipo: "DM2"
        }
      ],
      medicoes: [
        {
          id: newId(),
          pacienteId,
          valor: 110,
          data: localDate(),
          contexto: "Jejum"
        }
      ]
    },

    neo: {
      equipamentos: [
        {
          id: newId(),
          nome: "Switch central (exemplo)",
          setor: "TI",
          tipo: "Switch",
          custo: 1800,
          status: "Planejado"
        },
        {
          id: newId(),
          nome: "Firewall (exemplo)",
          setor: "TI",
          tipo: "Firewall",
          custo: 2500,
          status: "Planejado"
        }
      ]
    },

    nina: {
      incidentes: [
        {
          id: newId(),
          titulo: "Simulação de e-mail suspeito",
          severidade: "Média",
          status: "Em análise",
          data: new Date().toISOString()
        }
      ],
      checklist: {}
    }
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));

    if (
      saved &&
      Array.isArray(saved.care?.idosos) &&
      Array.isArray(saved.care?.medicamentos) &&
      Array.isArray(saved.diabetes?.pacientes) &&
      Array.isArray(saved.diabetes?.medicoes) &&
      Array.isArray(saved.neo?.equipamentos) &&
      Array.isArray(saved.nina?.incidentes)
    ) {
      saved.nina.checklist ??= {};
      return saved;
    }
  } catch (error) {
    console.warn("Erro ao carregar dados:", error);
  }

  return initialData();
}

let db = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error(error);
    toast("Não foi possível salvar neste navegador.");
    return false;
  }
}

/* =========================================
   MENU E NAVEGAÇÃO
========================================= */

$("#year").textContent = new Date().getFullYear();

$("#menu-btn").addEventListener("click", () => {
  const menu = $("#nav-links");
  const open = menu.classList.toggle("open");

  $("#menu-btn").setAttribute(
    "aria-expanded",
    String(open)
  );
});

$$(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    $("#nav-links").classList.remove("open");
    $("#menu-btn").setAttribute("aria-expanded", "false");
  });
});

function openApp(name) {
  if (!APP_NAMES[name]) return;

  lastFocus = document.activeElement;
  currentApp = name;

  $$(".app-page").forEach(page => {
    page.hidden = true;
  });

  $("#app-" + name).hidden = false;
  $("#app-title").textContent = APP_NAMES[name];

  $("#overlay").hidden = false;
  document.body.classList.add("modal-open");

  $(".app-body").scrollTop = 0;

  renderAll();
  $("#close-app").focus();
}

function closeApp() {
  $("#overlay").hidden = true;
  document.body.classList.remove("modal-open");
  currentApp = null;

  if (lastFocus?.isConnected) {
    lastFocus.focus();
  }
}

$$("[data-app]").forEach(button => {
  button.addEventListener("click", () => {
    openApp(button.dataset.app);
  });
});

$("#close-app").addEventListener("click", closeApp);

document.addEventListener("keydown", event => {
  if (!currentApp) return;

  if (event.key === "Escape") {
    closeApp();
    return;
  }

  if (event.key !== "Tab") return;

  const controls = [...$(".app-window").querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled])'
  )].filter(element => element.getClientRects().length > 0);

  if (!controls.length) return;

  const first = controls[0];
  const last = controls[controls.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement === last
  ) {
    event.preventDefault();
    first.focus();
  }
});

/* =========================================
   CAREDROP - CADASTRAR IDOSO
========================================= */

$("#form-idoso").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);

  const nome = values.nome.trim();
  const responsavel = values.responsavel.trim();
  const idade = Number(values.idade);

  if (
    !nome ||
    !responsavel ||
    !Number.isInteger(idade) ||
    idade < 0 ||
    idade > 130
  ) {
    toast("Verifique os dados do idoso.");
    return;
  }

  db.care.idosos.push({
    id: newId(),
    nome,
    idade,
    responsavel
  });

  save();
  form.reset();
  renderCare();
  toast("Idoso cadastrado!");
});

/* CAREDROP - MEDICAMENTOS */

$("#form-med").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);

  const exists = db.care.idosos.some(
    idoso => idoso.id === values.idosoId
  );

  if (
    !exists ||
    !values.nome.trim() ||
    !values.dose.trim() ||
    !values.horario
  ) {
    toast("Preencha os dados do medicamento.");
    return;
  }

  db.care.medicamentos.push({
    id: newId(),
    idosoId: values.idosoId,
    nome: values.nome.trim(),
    dose: values.dose.trim(),
    horario: values.horario,
    administrado: false
  });

  save();
  form.reset();
  renderCare();
  toast("Medicamento cadastrado!");
});

function renderCare() {
  const idosos = db.care.idosos;
  const meds = db.care.medicamentos;

  const pendentes = meds.filter(
    med => !med.administrado
  ).length;

  $("#care-stats").innerHTML =
    stat("Idosos cadastrados", idosos.length) +
    stat("Medicamentos", meds.length) +
    stat("Pendentes", pendentes);

  const select = $("#select-idoso");
  const selected = select.value;

  select.innerHTML =
    '<option value="">Selecione</option>' +
    idosos.map(idoso => `
      <option value="${escapeHTML(idoso.id)}">
        ${escapeHTML(idoso.nome)}
      </option>
    `).join("");

  if (idosos.some(i => i.id === selected)) {
    select.value = selected;
  }

  $("#lista-idosos").innerHTML =
    idosos.map(idoso => `
      <tr>
        <td>${escapeHTML(idoso.nome)}</td>
        <td>${idoso.idade}</td>
        <td>${escapeHTML(idoso.responsavel)}</td>
        <td>${deleteButton("idoso", idoso.id)}</td>
      </tr>
    `).join("") || emptyRow(4);

  $("#lista-med").innerHTML =
    meds.map(med => {
      const idoso = idosos.find(
        i => i.id === med.idosoId
      );

      return `
        <tr>
          <td>${escapeHTML(idoso?.nome || "Não encontrado")}</td>
          <td>${escapeHTML(med.nome)}</td>
          <td>${escapeHTML(med.dose)}</td>
          <td>${escapeHTML(med.horario)}</td>
          <td>${med.administrado ? "Administrado" : "Pendente"}</td>
          <td>
            <button type="button"
              class="btn outline small"
              data-med="${escapeHTML(med.id)}">
              ${med.administrado ? "Desmarcar" : "Marcar administrado"}
            </button>
            ${deleteButton("med", med.id)}
          </td>
        </tr>
      `;
    }).join("") || emptyRow(6);
}

/* =========================================
   DIABETES - PACIENTES
========================================= */

$("#form-paciente").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);

  if (!values.nome.trim()) {
    toast("Informe o nome do paciente.");
    return;
  }

  db.diabetes.pacientes.push({
    id: newId(),
    nome: values.nome.trim(),
    tipo: values.tipo
  });

  save();
  form.reset();
  renderDiabetes();
  toast("Paciente cadastrado!");
});

/* DIABETES - GLICEMIA */

$("#form-glicemia").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);
  const valor = Number(values.valor);

  const exists = db.diabetes.pacientes.some(
    p => p.id === values.pacienteId
  );

  const timestamp = new Date(values.data).getTime();

  if (
    !exists ||
    !Number.isFinite(valor) ||
    valor < 1 ||
    valor > 1000 ||
    !Number.isFinite(timestamp) ||
    timestamp > Date.now()
  ) {
    toast("Verifique a medição e a data.");
    return;
  }

  db.diabetes.medicoes.push({
    id: newId(),
    pacienteId: values.pacienteId,
    valor,
    data: values.data,
    contexto: values.contexto
  });

  save();
  form.reset();
  $("#data-glicemia").value = localDate();
  renderDiabetes();
  toast("Medição registrada!");
});

$("#filtro-paciente").addEventListener(
  "change",
  renderDiabetes
);

function average(readings, days) {
  const now = Date.now();
  const start = now - days * 86400000;

  const filtered = readings.filter(item => {
    const timestamp = new Date(item.data).getTime();

    return timestamp >= start && timestamp <= now;
  });

  if (!filtered.length) return "—";

  const sum = filtered.reduce(
    (total, item) => total + item.valor,
    0
  );

  return (sum / filtered.length).toFixed(1) + " mg/dL";
}

function renderDiabetes() {
  const patients = db.diabetes.pacientes;
  const readings = db.diabetes.medicoes;

  const select = $("#select-paciente");
  const previous = select.value;

  select.innerHTML =
    '<option value="">Selecione</option>' +
    patients.map(patient => `
      <option value="${escapeHTML(patient.id)}">
        ${escapeHTML(patient.nome)}
      </option>
    `).join("");

  if (patients.some(p => p.id === previous)) {
    select.value = previous;
  }

  const filter = $("#filtro-paciente");
  const oldFilter = filter.value;

  filter.innerHTML =
    '<option value="">Todos os pacientes</option>' +
    patients.map(patient => `
      <option value="${escapeHTML(patient.id)}">
        ${escapeHTML(patient.nome)}
      </option>
    `).join("");

  if (patients.some(p => p.id === oldFilter)) {
    filter.value = oldFilter;
  }

  const visible = readings
    .filter(item =>
      !filter.value || item.pacienteId === filter.value
    )
    .sort((a, b) =>
      new Date(b.data) - new Date(a.data)
    );

  $("#diabetes-stats").innerHTML =
    stat("Medições", visible.length) +
    stat("Média 7 dias", average(visible, 7)) +
    stat("Média 30 dias", average(visible, 30));

  $("#lista-pacientes").innerHTML =
    patients.map(patient => `
      <tr>
        <td>${escapeHTML(patient.nome)}</td>
        <td>${escapeHTML(patient.tipo)}</td>
        <td>${deleteButton("paciente", patient.id)}</td>
      </tr>
    `).join("") || emptyRow(3);

  $("#lista-glicemia").innerHTML =
    visible.map(item => {
      const patient = patients.find(
        p => p.id === item.pacienteId
      );

      return `
        <tr>
          <td>${escapeHTML(patient?.nome || "Não encontrado")}</td>
          <td>${item.valor} mg/dL</td>
          <td>${escapeHTML(formatDate(item.data))}</td>
          <td>${escapeHTML(item.contexto)}</td>
          <td>${deleteButton("medicao", item.id)}</td>
        </tr>
      `;
    }).join("") || emptyRow(5);
}

/* EXPORTAR CSV */

function csvValue(value) {
  const text = String(value ?? "");
  return '"' + text.replace(/"/g, '""') + '"';
}

$("#exportar-csv").addEventListener("click", () => {
  const filter = $("#filtro-paciente").value;

  const readings = db.diabetes.medicoes.filter(
    item => !filter || item.pacienteId === filter
  );

  if (!readings.length) {
    toast("Não há medições para exportar.");
    return;
  }

  const rows = [
    ["Paciente", "Glicemia mg/dL", "Data", "Contexto"]
  ];

  readings.forEach(item => {
    const patient = db.diabetes.pacientes.find(
      p => p.id === item.pacienteId
    );

    rows.push([
      patient?.nome || "",
      item.valor,
      formatDate(item.data),
      item.contexto
    ]);
  });

  const csv = "\uFEFF" + rows.map(
    row => row.map(csvValue).join(";")
  ).join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "historico_glicemia.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  toast("Histórico exportado!");
});

/* =========================================
   NEOLOGIX - EQUIPAMENTOS
========================================= */

$("#form-equipamento").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);
  const custo = Number(values.custo);

  if (
    !values.nome.trim() ||
    !Number.isFinite(custo) ||
    custo < 0
  ) {
    toast("Verifique os dados do equipamento.");
    return;
  }

  db.neo.equipamentos.push({
    id: newId(),
    nome: values.nome.trim(),
    setor: values.setor,
    tipo: values.tipo,
    custo,
    status: values.status
  });

  save();
  form.reset();
  renderNeo();
  toast("Equipamento cadastrado!");
});

function renderNeo() {
  const equipment = db.neo.equipamentos;

  const total = equipment.reduce(
    (sum, item) => sum + item.custo,
    0
  );

  const active = equipment.filter(
    item => item.status === "Ativo"
  ).length;

  $("#neo-stats").innerHTML =
    stat("Equipamentos", equipment.length) +
    stat("Ativos", active) +
    stat("Custo total", money(total));

  $("#lista-equipamentos").innerHTML =
    equipment.map(item => `
      <tr>
        <td>${escapeHTML(item.nome)}</td>
        <td>${escapeHTML(item.setor)}</td>
        <td>${escapeHTML(item.tipo)}</td>
        <td>${escapeHTML(money(item.custo))}</td>
        <td>
          <select data-equip-status="${escapeHTML(item.id)}">
            ${["Planejado", "Ativo", "Manutenção"]
              .map(status => `
                <option value="${status}"
                  ${item.status === status ? "selected" : ""}>
                  ${status}
                </option>
              `).join("")}
          </select>
        </td>
        <td>${deleteButton("equipamento", item.id)}</td>
      </tr>
    `).join("") || emptyRow(6);
}

/* =========================================
   NINA - INCIDENTES
========================================= */

$("#form-incidente").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = formData(form);

  if (!values.titulo.trim()) {
    toast("Informe a descrição do incidente.");
    return;
  }

  db.nina.incidentes.push({
    id: newId(),
    titulo: values.titulo.trim(),
    severidade: values.severidade,
    status: values.status,
    data: new Date().toISOString()
  });

  save();
  form.reset();
  renderNina();
  toast("Incidente registrado!");
});

function renderNina() {
  const incidents = db.nina.incidentes;

  const unresolved = incidents.filter(
    item => item.status !== "Resolvido"
  ).length;

  const completed = CONTROLS.filter(
    control => db.nina.checklist[control]
  ).length;

  $("#nina-stats").innerHTML =
    stat("Incidentes", incidents.length) +
    stat("Não resolvidos", unresolved) +
    stat("Controles concluídos", completed + "/" + CONTROLS.length);

  $("#lista-incidentes").innerHTML =
    incidents.map(item => `
      <tr>
        <td>${escapeHTML(item.titulo)}</td>
        <td>${escapeHTML(item.severidade)}</td>
        <td>
          <select data-inc-status="${escapeHTML(item.id)}">
            ${["Aberto", "Em análise", "Resolvido"]
              .map(status => `
                <option value="${status}"
                  ${item.status === status ? "selected" : ""}>
                  ${status}
                </option>
              `).join("")}
          </select>
        </td>
        <td>${escapeHTML(formatDate(item.data))}</td>
        <td>${deleteButton("incidente", item.id)}</td>
      </tr>
    `).join("") || emptyRow(5);

  $("#checklist").innerHTML =
    CONTROLS.map((control, index) => `
      <div class="check-row">
        <input type="checkbox"
          id="control-${index}"
          data-control="${index}"
          ${db.nina.checklist[control] ? "checked" : ""}>
        <label for="control-${index}">
          ${escapeHTML(control)}
        </label>
      </div>
    `).join("");
}

/* =========================================
   EXCLUSÕES E ALTERAÇÕES
========================================= */

document.addEventListener("click", event => {
  const target = event.target.closest("[data-delete]");

  if (target) {
    if (!confirm("Deseja excluir este registro?")) {
      return;
    }

    const type = target.dataset.delete;
    const itemId = target.dataset.id;

    switch (type) {
      case "idoso":
        db.care.idosos = db.care.idosos.filter(
          item => item.id !== itemId
        );

        db.care.medicamentos = db.care.medicamentos.filter(
          item => item.idosoId !== itemId
        );
        break;

      case "med":
        db.care.medicamentos = db.care.medicamentos.filter(
          item => item.id !== itemId
        );
        break;

      case "paciente":
        db.diabetes.pacientes = db.diabetes.pacientes.filter(
          item => item.id !== itemId
        );

        db.diabetes.medicoes = db.diabetes.medicoes.filter(
          item => item.pacienteId !== itemId
        );
        break;

      case "medicao":
        db.diabetes.medicoes = db.diabetes.medicoes.filter(
          item => item.id !== itemId
        );
        break;

      case "equipamento":
        db.neo.equipamentos = db.neo.equipamentos.filter(
          item => item.id !== itemId
        );
        break;

      case "incidente":
        db.nina.incidentes = db.nina.incidentes.filter(
          item => item.id !== itemId
        );
        break;

      default:
        return;
    }

    save();
    renderAll();
    toast("Registro excluído!");
    return;
  }

  const medButton = event.target.closest("[data-med]");

  if (medButton) {
    const med = db.care.medicamentos.find(
      item => item.id === medButton.dataset.med
    );

    if (med) {
      med.administrado = !med.administrado;
      save();
      renderCare();
      toast("Status atualizado!");
    }
  }
});

document.addEventListener("change", event => {
  const target = event.target;

  if (target.matches("[data-equip-status]")) {
    const item = db.neo.equipamentos.find(
      e => e.id === target.dataset.equipStatus
    );

    if (item) {
      item.status = target.value;
      save();
      renderNeo();
      toast("Equipamento atualizado!");
    }
  }

  if (target.matches("[data-inc-status]")) {
    const item = db.nina.incidentes.find(
      e => e.id === target.dataset.incStatus
    );

    if (item) {
      item.status = target.value;
      save();
      renderNina();
      toast("Incidente atualizado!");
    }
  }

  if (target.matches("[data-control]")) {
    const control = CONTROLS[Number(target.dataset.control)];

    if (control !== undefined) {
      db.nina.checklist[control] = target.checked;
      save();
      renderNina();
      toast("Checklist atualizado!");
    }
  }
});

/* =========================================
   RESTAURAR DADOS DE EXEMPLO
========================================= */

$("#restaurar").addEventListener("click", () => {
  if (!currentApp) return;

  if (!confirm(
    "Deseja apagar os registros deste sistema e restaurar os exemplos?"
  )) {
    return;
  }

  const defaults = initialData();

  db[currentApp] = defaults[currentApp];

  save();
  renderAll();

  toast("Exemplos restaurados!");
});

/* =========================================
   INICIALIZAÇÃO
========================================= */

function renderAll() {
  renderCare();
  renderDiabetes();
  renderNeo();
  renderNina();
}

$("#data-glicemia").value = localDate();

renderAll();

console.log("Portfólio Nathalia Lemes iniciado.");
