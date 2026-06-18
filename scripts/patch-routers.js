const fs = require('fs');
const path = require('path');

const HOOK_PATH_ABSOLUTE = path.resolve(__dirname, '../src/hooks/useSafeRouter.ts');

const targets = [
  'src/modules/home/components/HomeQuickActions.tsx',
  'src/modules/home/components/HomeHeader.tsx',
  'src/modules/communications/components/PublicationsCarousel.tsx',
  'src/modules/chat/screens/ChatListScreen.tsx',
  'src/modules/visits/screens/VisitsScreen.tsx',
  'src/modules/visits/screens/VisitTypeScreen.tsx',
  'src/modules/visits/screens/VisitDataScreen.tsx',
  'src/modules/visits/screens/VisitQrScreen.tsx',
  'src/modules/visits/screens/VisitPreviewScreen.tsx',
  'src/modules/visits/screens/EventDataScreen.tsx',
  'src/modules/visits/screens/EventQrScreen.tsx',
  'src/modules/packages/screens/PackagesScreen.tsx',
  'src/modules/finances/components/PendingQuotasList.tsx',
  'src/modules/finances/components/HomeFinances/BalanceCard.tsx',
];

for (const relPath of targets) {
  const absPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(absPath)) {
    console.log('[SKIP] No existe:', relPath);
    continue;
  }
  
  let content = fs.readFileSync(absPath, 'utf8');

  // Skip if already patched
  if (content.includes('useSafeRouter')) {
    console.log('[SKIP] Ya parcheado:', relPath);
    continue;
  }

  if (!content.includes('useRouter')) {
      console.log('[SKIP] No usa useRouter:', relPath);
      continue;
  }

  // Calculate relative path to the new hook
  const fileDir = path.dirname(absPath);
  let relativeImportPath = path.relative(fileDir, path.resolve(__dirname, '../src/hooks/useSafeRouter'));
  relativeImportPath = relativeImportPath.replace(/\\/g, '/');
  if (!relativeImportPath.startsWith('.')) {
    relativeImportPath = './' + relativeImportPath;
  }

  // 1. Reemplazar la importacion de expo-router de ser necesario
  // Hay casos como: import { useRouter, useFocusEffect } from "expo-router";
  // Convertiremos eso en dos lineas o sacamos useRouter
  content = content.replace(/import\s*\{\s*(.*?)\s*\}\s*from\s*['"]expo-router['"];/g, (match, importsStr) => {
    const importsArray = importsStr.split(',').map(s => s.trim());
    if (importsArray.includes('useRouter')) {
      const filtered = importsArray.filter(s => s !== 'useRouter');
      const safeRouterImport = `import { useSafeRouter } from "${relativeImportPath}";\n`;
      
      if (filtered.length > 0) {
        return safeRouterImport + `import { ${filtered.join(', ')} } from "expo-router";`;
      } else {
        return safeRouterImport;
      }
    }
    return match; // No se uso useRouter importado asi
  });

  // 2. Reemplazar const router = useRouter() por useSafeRouter()
  content = content.replace(/useRouter\(\)/g, 'useSafeRouter()');

  // Guardar archivo
  fs.writeFileSync(absPath, content, 'utf8');
  console.log('[OK] Parcheado:', relPath);
}
