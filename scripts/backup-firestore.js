/**
 * Firestore Full Backup Script
 *
 * Exporta todas las colecciones con subcolecciones a un archivo JSON.
 * Los Timestamps se serializan como { _seconds, _nanoseconds } para
 * poder restaurarse fielmente después.
 *
 * Uso:
 *   node scripts/backup-firestore.js
 *
 * Opciones:
 *   --output   Nombre del archivo de salida (default: backup-{fecha}.json)
 *   --collections  Lista de colecciones específicas separadas por coma
 *
 * Ejemplos:
 *   node scripts/backup-firestore.js
 *   node scripts/backup-firestore.js --output backup-prev-migracion.json
 *   node scripts/backup-firestore.js --collections amigos,miembros,historial
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ─── Config ────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'service-account.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ No se encuentra ${SERVICE_ACCOUNT_PATH}`);
  console.error('   Ejecutá este comando para generarlo desde tu .env:');
  console.error('   grep FIREBASE_SERVICE_ACCOUNT_BASE64 .env | cut -d= -f2- | base64 -d > service-account.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── Args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const outputFile = getArg('--output') || `backup-${new Date().toISOString().slice(0, 10)}.json`;
const collectionsFilter = getArg('--collections');

// ─── Recursive export ──────────────────────────────────────────────────────
async function getCollectionRecursive(ref) {
  const snapshot = await ref.get();
  const result = [];

  for (const doc of snapshot.docs) {
    const docData = { id: doc.id, ...doc.data() };

    // Subcolecciones
    const subcollections = await doc.ref.listCollections();
    for (const subCol of subcollections) {
      docData[subCol.id] = await getCollectionRecursive(subCol);
    }

    result.push(docData);
  }

  return result;
}

// ─── Main ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    const allCollections = await db.listCollections();
    let collectionsToExport = allCollections;

    if (collectionsFilter) {
      const names = collectionsFilter.split(',').map((s) => s.trim());
      collectionsToExport = allCollections.filter((col) =>
        names.includes(col.id)
      );
      const found = collectionsToExport.map((c) => c.id);
      const missing = names.filter((n) => !found.includes(n));
      if (missing.length > 0) {
        console.warn(`⚠️  Colecciones no encontradas: ${missing.join(', ')}`);
      }
    }

    const backup = {};

    for (const col of collectionsToExport) {
      const colName = col.id;
      process.stdout.write(`📦 Exportando ${colName}...`);
      backup[colName] = await getCollectionRecursive(col);
      console.log(` ${backup[colName].length} documentos`);
    }

    fs.writeFileSync(outputFile, JSON.stringify(backup, null, 2));
    console.log(`\n✅ Backup completado: ${outputFile}`);
    console.log(`   Tamaño: ${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.error('❌ Error haciendo backup:', err);
    process.exit(1);
  }
})();
