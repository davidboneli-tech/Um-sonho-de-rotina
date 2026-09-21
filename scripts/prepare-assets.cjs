const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const names = ['David', 'Fabi', 'Helena', 'Laura'];
const lines = names.map(name => {
  const file = `assets/people/Avatar_${name}.png`;
  return `  ${name}: require(${JSON.stringify(!process.env.SONHO_PUBLIC_BUILD && !process.argv.includes("--public") && fs.existsSync(path.join(root, file)) ? '../'+file : '../assets/icon.png')}),`;
});
const suggestion = !process.env.SONHO_PUBLIC_BUILD && !process.argv.includes("--public") && fs.existsSync(path.join(root, 'assets/fabi/Fabi_Sugestao.png')) ? '../assets/fabi/Fabi_Sugestao.png' : '../assets/icon.png';
fs.writeFileSync(path.join(root, 'src/avatars.generated.ts'), `// Generated locally; never commit personal portraits.\nexport const people: Record<string, number> = {\n${lines.join('\n')}\n};\nexport const fabiSuggestion = require(${JSON.stringify(suggestion)});\n`);

const scenes = { suggestion: 'Sugestao', attention: 'Atencao_a_meta', walk: 'Caminhada', celebrate: 'Comemoracao', rest: 'Descanso', read: 'Leitura', reminder: 'Lembrete' };
const sceneLines = Object.entries(scenes).map(([key, name]) => {
  const file = `assets/fabi/Fabi_${name}.png`;
  const available = !process.env.SONHO_PUBLIC_BUILD && !process.argv.includes('--public') && fs.existsSync(path.join(root, file));
  return `  ${key}: require(${JSON.stringify(available ? '../'+file : '../assets/icon.png')}),`;
});
fs.appendFileSync(path.join(root, 'src/avatars.generated.ts'), `export const fabiScenes = {\n${sceneLines.join('\n')}\n};\n`);
