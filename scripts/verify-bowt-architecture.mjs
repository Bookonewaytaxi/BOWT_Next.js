import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'pages/routes/[slug].jsx',
  'src/screens/RouteDetailsPage.jsx',
  'src/services/RouteService.js',
  'src/services/LinkService.js',
  'src/services/FaqService.js',
  'src/services/IntentService.js',
  'src/utils/RouteImportProcessor.js',
  'src/utils/RouteImportService.js',
  'src/lib/routeFaqs.js',
  'src/lib/schema/faqSchema.js',
  'src/lib/schema/schemaComposer.js',
  'pages/llms.txt.js',
];

const requiredSnippets = [
  ['pages/routes/[slug].jsx', "fallback: 'blocking'"],
  ['pages/routes/[slug].jsx', 'revalidate: 3600'],
  ['pages/routes/[slug].jsx', 'getApprovedFaqs'],
  ['src/screens/RouteDetailsPage.jsx', 'composeRoutePageSchema'],
  ['src/screens/RouteDetailsPage.jsx', 'approvedFaqs'],
  ['src/lib/schema/schemaComposer.js', 'buildFaqSchema'],
  ['src/utils/RouteImportProcessor.js', 'MAX_IMPORT_ROWS'],
  ['src/utils/RouteImportService.js', 'fetchAllExistingRoutes'],
  ['src/utils/RouteImportService.js', 'generatedSlug'],
  ['pages/llms.txt.js', 'getAllActiveRoutes'],
  ['pages/llms.txt.js', 'Cache-Control'],
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

for (const [file, snippet] of requiredSnippets) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(snippet)) failures.push(`Missing required contract in ${file}: ${snippet}`);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!packageJson.scripts?.build) failures.push('package.json must expose a build script');
if (!packageJson.scripts?.lint) failures.push('package.json must expose a lint script');

if (failures.length) {
  console.error('BOWT architecture verification FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BOWT architecture verification PASSED (${requiredFiles.length} required files, ${requiredSnippets.length} contracts).`);
