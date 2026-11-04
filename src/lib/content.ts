export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const icon = (name: string) => `${base}/icons/${name}.svg`;

export const profile = {
  name: "Nathalia Lemes",
  fullName: "Nathalia Lemes Gonçalves",
  email: "nathy.lemes2007@gmail.com",
  linkedin: "https://www.linkedin.com/in/nathalia-lemes",
  github: "https://github.com/nathalialemesg",
  facts: [
    { label: "Curso", value: "Engenharia de Software" },
    { label: "Instituição", value: "Universidade de Mogi das Cruzes (UMC)" },
    { label: "Semestre", value: "4º semestre" },
    { label: "Formatura prevista", value: "Dezembro de 2028" },
    { label: "Inglês", value: "Intermediário" },
    { label: "Disponibilidade", value: "Total: presencial, híbrido ou remoto, qualquer turno" },
    { label: "Localização", value: "Jacareí — SP" },
  ],
};

export type Tech = { name: string; icon?: string; lucide?: "kanban" | "shield" | "network" };

export type Project = {
  slug: "caredrop" | "diabetes" | "neologix" | "nina";
  name: string;
  category: string;
  tagline: string;
  summary: string;
  problem: string;
  built: string[];
  decisions: string[];
  stack: Tech[];
  /** Fill when known (ex.: "Projeto em equipe de 4 — responsável pelo front-end"). Hidden while null. */
  role: string | null;
  repo: string | null;
};

const js: Tech = { name: "JavaScript", icon: "javascript-original" };

export const projects: Project[] = [
  {
    slug: "caredrop",
    name: "CareDrop",
    category: "Gestão de cuidados",
    tagline: "Remédio certo, na dose certa, no horário certo.",
    summary: "Cadastro de idosos, medicamentos e horários, com acompanhamento do que já foi administrado.",
    problem:
      "Quem cuida de idosos controla vários medicamentos, doses e horários ao mesmo tempo, e precisa saber a qualquer momento o que já foi dado e o que ainda está pendente.",
    built: [
      "Cadastro de idosos com o responsável por cada um",
      "Agenda de medicamentos por idoso, com dose e horário",
      "Marcação de administrado ou pendente, com contador de pendências",
      "Exclusão em cascata: remover um idoso remove os medicamentos dele",
    ],
    decisions: [
      "Validação antes de salvar: campos obrigatórios e idade entre 0 e 130",
      "Persistência no próprio navegador, sem servidor",
      "Registro manual, sem alertas automáticos, por ser um protótipo acadêmico",
    ],
    stack: [{ name: "Figma (UX/UI)", icon: "figma-original" }, { name: "Scrum", lucide: "kanban" }, js],
    role: null,
    repo: null,
  },
  {
    slug: "diabetes",
    name: "Controle de Diabetes",
    category: "Gestão de saúde",
    tagline: "Cada medição registrada, a tendência à vista.",
    summary: "Registro de pacientes e glicemia, histórico filtrável, médias e exportação de dados.",
    problem:
      "Acompanhar diabetes exige registrar medições com frequência e enxergar a tendência ao longo dos dias, não só o último valor.",
    built: [
      "Cadastro de pacientes por tipo: DM1, DM2 ou pré-diabetes",
      "Registro de glicemia com data, hora e contexto (jejum, pré ou pós-refeição)",
      "Histórico filtrável por paciente, do mais recente ao mais antigo",
      "Médias dos últimos 7 e 30 dias",
      "Exportação do histórico em CSV",
    ],
    decisions: [
      "Projeto original em Python; esta demonstração foi reescrita em JavaScript para rodar no navegador",
      "CSV com separador ponto e vírgula e BOM UTF-8, para abrir certo no Excel em português",
      "Medições com data no futuro são recusadas",
      "Médias apenas informativas: o protótipo não oferece diagnóstico nem orientação médica",
    ],
    stack: [{ name: "Python", icon: "python-original" }, js],
    role: null,
    repo: null,
  },
  {
    slug: "neologix",
    name: "NeoLogix",
    category: "Infraestrutura de TI",
    tagline: "O inventário e a topologia de uma rede corporativa.",
    summary: "Inventário de equipamentos por setor, custos, status e topologia de rede.",
    problem:
      "Planejar a infraestrutura de uma empresa pede saber o que existe, em qual setor está, quanto custa e em que estado se encontra.",
    built: [
      "Cadastro de equipamentos por setor e tipo",
      "Custo total do inventário em reais",
      "Status planejado, ativo ou em manutenção, editável direto na tabela",
      "Topologia conceitual: internet, roteador de borda, firewall, switch central, acesso e servidores",
    ],
    decisions: [
      "Valores formatados em reais com a API Intl do navegador",
      "Status alterado na própria linha, sem formulário extra",
      "Diagrama acadêmico: não representa monitoramento em tempo real",
    ],
    stack: [{ name: "Redes", lucide: "network" }, { name: "Infraestrutura", lucide: "network" }, js],
    role: null,
    repo: null,
  },
  {
    slug: "nina",
    name: "NINA Tecnologia",
    category: "Segurança da informação",
    tagline: "Incidentes registrados, controles acompanhados.",
    summary: "Registro de incidentes, classificação de severidade e checklist de segurança.",
    problem:
      "Uma empresa precisa registrar incidentes de segurança, priorizá-los pela severidade e saber quais controles básicos já adota.",
    built: [
      "Registro de incidentes com severidade e status",
      "Contagem de incidentes ainda não resolvidos",
      "Checklist de oito controles, como MFA, backups e senhas fortes, com progresso",
    ],
    decisions: [
      "Severidade em quatro níveis: baixa, média, alta e crítica",
      "Status do incidente alterado direto na tabela",
      "Exemplo inicial fictício: simulação de e-mail suspeito",
    ],
    stack: [{ name: "Segurança", lucide: "shield" }, { name: "Governança", lucide: "shield" }, js],
    role: null,
    repo: null,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export type Skill = { name: string; icon?: string; lucide?: Tech["lucide"]; what: string; proof: Project["slug"][]; invert?: boolean };

export const skillGroups: { title: string; skills: Skill[] }[] = [
  {
    title: "Linguagens e dados",
    skills: [
      { name: "Python", icon: "python-original", what: "Lógica, funções, CRUD e manipulação de arquivos", proof: ["diabetes"] },
      { name: "Java", icon: "java-original", what: "Fundamentos de orientação a objetos", proof: [] },
      { name: "SQL · PostgreSQL", icon: "postgresql-original", what: "Consultas e modelagem de dados", proof: [] },
      { name: "JavaScript", icon: "javascript-original", what: "Lógica de interface, validação e persistência local", proof: ["caredrop", "diabetes", "neologix", "nina"] },
    ],
  },
  {
    title: "Web e design",
    skills: [
      { name: "HTML e CSS", icon: "html5-original", what: "Páginas semânticas, acessíveis e responsivas", proof: ["caredrop", "diabetes", "neologix", "nina"] },
      { name: "Figma", icon: "figma-original", what: "Prototipação e UX/UI", proof: ["caredrop"] },
    ],
  },
  {
    title: "Processo e infraestrutura",
    skills: [
      { name: "Git e GitHub", icon: "git-original", what: "Versionamento e repositórios", proof: [] },
      { name: "Scrum", lucide: "kanban", what: "Backlog e histórias de usuário", proof: ["caredrop"] },
      { name: "Redes", lucide: "network", what: "Topologia, equipamentos e setores", proof: ["neologix"] },
      { name: "Segurança", lucide: "shield", what: "Riscos, incidentes e políticas", proof: ["nina"] },
    ],
  },
];
