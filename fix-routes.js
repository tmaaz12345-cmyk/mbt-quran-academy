const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (/\.(ts|js|tsx|jsx)$/.test(file) && (file.startsWith('route') || file.startsWith('page'))) {
      let content = fs.readFileSync(fullPath, 'utf8');

      content = content.replace(/^\s*export\s+const\s+dynamic\s*=.*?;?\r?\n?/gm, '');

      if (!content.includes('export const dynamic = "force-dynamic"')) {
        const importMatches = [...content.matchAll(/^\s*import\s+[\s\S]*?from\s+['"].*?['"];?/gm)];
        
        if (importMatches.length > 0) {
          const lastImport = importMatches[importMatches.length - 1];
          const insertPos = lastImport.index + lastImport[0].length;
          content = content.slice(0, insertPos) + '\nexport const dynamic = "force-dynamic";\n' + content.slice(insertPos);
        } else {
          content = 'export const dynamic = "force-dynamic";\n' + content;
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Successfully fixed: ${fullPath}`);
      }
    }
  }
}

const appDir = path.join(process.cwd(), 'src', 'app');
if (fs.existsSync(appDir)) {
  processDir(appDir);
  console.log('\nAll routes and pages updated successfully!');
} else {
  console.error('src/app directory not found.');
}
