const path = require("path");
const root = path.resolve(__dirname, "..");
const { chromium } = require(root + "/node_modules/playwright");
const fs = require("fs");
const http = require("http");
fs.mkdirSync(path.join(root, "tests/screenshots"), { recursive: true });
const server = http.createServer((req, res) => {
  const name = path.join(
    root,
    "web-build",
    decodeURIComponent(
      req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0],
    ),
  );
  try {
    const bytes = fs.readFileSync(name);
    const ext = path.extname(name);
    res.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".html": "text/html",
        ".png": "image/png",
        ".ttf": "font/ttf",
      }[ext] || "application/octet-stream",
    );
    res.end(bytes);
  } catch {
    res.statusCode = 404;
    res.end();
  }
});
(async () => {
  await new Promise((r) => server.listen(8099, "127.0.0.1", r));
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.SONHO_BROWSER_PATH || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("http://127.0.0.1:8099");
  await p.getByLabel("PIN de seis dígitos", { exact: true }).fill("284619");
  await p.getByLabel("Repita seu PIN", { exact: true }).fill("284619");
  await p.getByRole("button", { name: "Criar acesso", exact: true }).click();
  await p
    .getByRole("button", {
      name: "Guardei o código · Abrir agenda",
      exact: true,
    })
    .click({ timeout: 30000 });
  await p
    .getByRole("button", { name: "+ Novo compromisso", exact: true })
    .click();
  await p.getByLabel("Título", { exact: true }).fill("Aula de violão");
  await p
    .getByLabel("Anotações", { exact: true })
    .fill("Estudar a música e levar a partitura.");
  await p
    .getByRole("checkbox", {
      name: "Destacar no calendário mensal",
      exact: true,
    })
    .click();
  await p.getByRole("button", { name: "Salvar evento", exact: true }).click();
  await p
    .getByRole("button", { name: "Abrir Aula de violão", exact: true })
    .click();
  await p.getByRole("button", { name: "Editar evento", exact: true }).click();
  await p.getByLabel("Título", { exact: true }).fill("Violão editado");
  await p.getByRole("button", { name: "Salvar evento", exact: true }).click();
  await p
    .getByRole("button", { name: "Abrir Violão editado", exact: true })
    .waitFor();
  await p.screenshot({ path: root + "/tests/screenshots/hoje.png" });
  await p.getByRole("tab", { name: "Objetivos", exact: true }).click();
  await p.getByRole("button", { name: "+ Nova meta", exact: true }).click();
  await p
    .getByLabel("O que você quer fazer?", { exact: true })
    .fill("Caminhar");
  await p.getByRole("button", { name: "Salvar objetivo", exact: true }).click();
  await p
    .getByRole("button", { name: "Registrar atividade", exact: true })
    .click();
  await p
    .getByLabel("Quantos minutos você realizou?", { exact: true })
    .fill("45");
  await p.getByRole("button", { name: "Registrar", exact: true }).click();
  await p.getByText("45 de 600 minutos", { exact: true }).waitFor();
  await p.screenshot({ path: root + "/tests/screenshots/objetivos.png" });
  await p.getByRole("tab", { name: "Rotinas", exact: true }).click();
  await p.getByRole("button", { name: "Medicamentos", exact: true }).click();
  for (const name of ["Exemplo A", "Exemplo B"]) {
    await p
      .getByRole("button", { name: "+ Cadastrar medicamento", exact: true })
      .click();
    await p.getByLabel("Nome do medicamento", { exact: true }).fill(name);
    await p
      .getByLabel("Dose conforme sua orientação", { exact: true })
      .fill("Dose fictícia para teste");
    await p
      .getByRole("button", { name: "Salvar medicamento", exact: true })
      .click();
  }
  await p.getByRole("button", { name: "Tomei", exact: true }).first().click();
  await p.getByRole("button", { name: "Sim, tomei", exact: true }).click();
  if (
    (await p.getByRole("button", { name: "Tomei", exact: true }).count()) !== 1
  )
    throw new Error("Confirmação afetou outro medicamento");
  await p.screenshot({ path: root + "/tests/screenshots/medicamentos.png" });
  await p.reload();
  await p.getByLabel("PIN de seis dígitos", { exact: true }).fill("284619");
  await p
    .getByRole("button", { name: "Abrir minha agenda", exact: true })
    .click();
  await p
    .getByRole("button", { name: "Abrir Violão editado", exact: true })
    .waitFor({ timeout: 30000 });
  await p.getByRole("tab", { name: "Calendário", exact: true }).click();
  await p.screenshot({ path: root + "/tests/screenshots/calendario.png" });
  await p.getByRole("tab", { name: "Ajustes", exact: true }).click();
  await p.getByRole("button", { name: "Lavanda", exact: true }).first().click();
  await p
    .getByRole("button", { name: "Aplicar alterações", exact: true })
    .click();
  await p.getByText("Alterações aplicadas.", { exact: true }).waitFor();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(
    "PASS: PIN, evento, edição, meta, registro, doses independentes, persistência e tema.",
  );
  await b.close();
  server.close();
})();
