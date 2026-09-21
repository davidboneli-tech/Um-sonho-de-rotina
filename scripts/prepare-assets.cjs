const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const names = ['David', 'Fabi', 'Helena', 'Laura'];
const lines = names.map(name => {
  const file = `assets/people/Avatar_${name}.png`;
  return `  ${name}: require(${JSON.stringify(fs.existsSync(path.join(root, file)) ? '../'+file : '../assets/icon.png')}),`;
});
const suggestion = fs.existsSync(path.join(root, 'assets/fabi/Fabi_Sugestao.png')) ? '../assets/fabi/Fabi_Sugestao.png' : '../assets/icon.png';
fs.writeFileSync(path.join(root, 'src/avatars.generated.ts'), `// Generated locally; never commit personal portraits.\nexport const people: Record<string, number> = {\n${lines.join('\n')}\n};\nexport const fabiSuggestion = require(${JSON.stringify(suggestion)});\n`);
