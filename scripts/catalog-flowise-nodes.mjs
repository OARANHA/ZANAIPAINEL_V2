// Node 18+
// Gera catálogo de nodes: categoria, label, descrição, path, inputs/outputs (best-effort)
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const NODES_DIR = path.join(ROOT, 'Flowise', 'packages', 'components', 'nodes');

function read(file){ 
  try { 
    return fs.readFileSync(file, 'utf8'); 
  } catch { 
    return ''; 
  } 
}

function extractLabel(src){
  const a = src.match(/this\.label\s*=\s*['"]([\s\S]*?)['"]/);
  if (a) return a[1].trim();
  const b = src.match(/\bname\s*:\s*['"]([\s\S]*?)['"]/);
  return b ? b[1].trim() : '';
}

function extractDescription(src){
  const a = src.match(/this\.description\s*=\s*['"]([\s\S]*?)['"]/);
  if (a) return a[1].trim();
  const b = src.match(/\bdescription\s*:\s*['"]([\s\S]*?)['"]/);
  return b ? b[1].trim() : '';
}

// tenta capturar arrays de inputs/outputs em padrões comuns
function extractArrayLiteral(src, key){
  const re = new RegExp(`${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
  const m = src.match(re);
  return m ? m[1]
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g,' ')
    .slice(0, 400) // não exagerar
    : '';
}

function isNodeTsFile(src){ 
  return /implements\s+INode\b/.test(src); 
}

function walk(dir){
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes:true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.isFile() && e.name.endsWith('.ts')) {
      const content = read(full);
      if (isNodeTsFile(content)) out.push({ full, content });
    }
  }
  return out;
}

if (!fs.existsSync(NODES_DIR)) {
  console.error('Pasta não encontrada:', NODES_DIR);
  console.log('Por favor, clone o Flowise primeiro:');
  console.log('git clone https://github.com/FlowiseAI/Flowise.git');
  process.exit(1);
}

const files = walk(NODES_DIR);

const rows = files.map(({ full, content }) => {
  const rel = path.relative(ROOT, full).replace(/\\/g,'/');
  const parts = rel.split('/');
  const i = parts.indexOf('nodes');
  const categoria = i >= 0 && parts[i+1] ? parts[i+1] : '';
  const label = extractLabel(content) || path.basename(full, '.ts');
  const desc = extractDescription(content);
  const inputs = extractArrayLiteral(content, 'this.inputs') || extractArrayLiteral(content, 'inputs');
  const outputs = extractArrayLiteral(content, 'this.outputs') || extractArrayLiteral(content, 'outputs');
  return { categoria, label, desc, path: rel, inputs, outputs };
}).sort((a,b)=> a.categoria.localeCompare(b.categoria) || a.label.localeCompare(b.label));

fs.writeFileSync(path.join(ROOT, 'catalog.flowise.nodes.json'), JSON.stringify(rows, null, 2), 'utf8');

const md = [
  '# Catálogo de Nodes — Flowise',
  `Total: **${rows.length}**`,
  '',
  '| Categoria | Node | Descrição | Inputs (best-effort) | Outputs (best-effort) | Path |',
  '|---|---|---|---|---|---|',
  ...rows.map(r => `| ${r.categoria} | ${r.label} | ${r.desc?.replace(/\|/g,'\\|')||''} | ${r.inputs?.replace(/\|/g,'\\|')||''} | ${r.outputs?.replace(/\|/g,'\\|')||''} | ${r.path} |`)
].join('\n');

fs.writeFileSync(path.join(ROOT, 'catalog.flowise.nodes.md'), md, 'utf8');

console.log('OK → catalog.flowise.nodes.json + catalog.flowise.nodes.md');
console.log(`Total de nodes catalogados: ${rows.length}`);