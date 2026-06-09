/**
 * Firestore Full Restore Script
 *
 * Restaura un backup generado con backup-firestore.js.
 * Respeta los IDs originales y revive los Timestamps.
 *
 * Uso:
 *   node scripts/restore-firestore.js backup-2026-06-09.json
 *
 * Opciones:
 *   --collections  Restaurar solo colecciones específicas (separadas por coma)
 *   --dry-run      Simular sin escribir
 *
 * Ejemplos:
 *   node scripts/restore-firestore.js backup-prev-migracion.json
 *   node scripts/restore-firestore.js backup.json --collections amigos,simpatizantes,visitas
 *   node scripts/restore-firestore.js backup.json --dry-run
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { Timestamp } = require('firebase-admin/firestore');

// ─── Config ────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'service-account.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ No se encuentra ${SERVICE_ACCOUNT_PATH}`);
  console.error('   Ejecutá: grep FIREBASE_SERVICE_ACCOUNT_BASE64 .env | cut -d= -f2- | base64 -d > service-account.json');
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

const inputFile = args.find((a) => !a.startsWith('--')) || args[0];
const collectionsFilter = getArg('--collections');
const dryRun = args.includes('--dry-run');

if (!inputFile || inputFile === '--dry-run') {
  console.error('❌ Indicá el archivo de backup a restaurar');
  console.error('   Uso: node scripts/restore-firestore.js backup.json');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`❌ No se encuentra el archivo: ${inputFile}`);
  process.exit(1);
}

// ─── Revive Timestamps ─────────────────────────────────────────────────────
function reviveDatesDeep(value) {
  if (Array.isArray(value)) {
    return value.map(reviveDatesDeep);
  }

  // Timestamp serializado
  if (
    value &&
    typeof value === 'object' &&
    '_seconds' in value &&
    '_nanoseconds' in value &&
    Object.keys(value).length === 2
  ) {
    return new Timestamp(value._seconds, value._nanoseconds);
  }

  if (value && typeof value === 'object') {
    const fixed = {};
    for (const key in value) {
      fixed[key] = reviveDatesDeep(value[key]);
    }
    return fixed;
  }

  return value;
}

// ─── Import ────────────────────────────────────────────────────────────────
const BATCH_LIMIT = 150;

/**
 * Determina si un array de objetos es una subcolección (todos tienen "id")
 */
function looksLikeSubcollection(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string'
  );
}

async function importCollectionRecursive(ref, data) {
  let batch = db.batch();
  let operationCount = 0;
  let totalDocs = 0;

  async function commitBatch() {
    if (operationCount === 0) return;
    if (dryRun) {
      console.log(`   [dry-run] Batch de ${operationCount} docs (omitido)`);
      operationCount = 0;
      return;
    }
    await batch.commit();
    batch = db.batch();
    operationCount = 0;
  }

  for (const doc of data) {
    if (!doc || typeof doc !== 'object') continue;

    const { id, ...docData } = doc;
    const subcollections = {};

    // Separar subcolecciones del resto de los campos
    for (const key in docData) {
      if (
        Array.isArray(docData[key]) &&
        looksLikeSubcollection(docData[key])
      ) {
        subcollections[key] = docData[key];
        delete docData[key];
      }
    }

    const docRef = id ? ref.doc(String(id)) : ref.doc();
    const fixedData = reviveDatesDeep(docData);
    batch.set(docRef, fixedData);
    operationCount++;
    totalDocs++;

    if (operationCount >= BATCH_LIMIT) {
      await commitBatch();
    }

    // Subcolecciones (fuera del batch porque son otros refs)
    for (const subColName in subcollections) {
      await importCollectionRecursive(
        docRef.collection(subColName),
        subcollections[subColName]
      );
    }
  }

  await commitBatch();
  return totalDocs;
}

// ─── Main ──────────────────────────────────────────────────────────────────
(async () => {
  try {
    const backup = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    let collectionsToRestore = Object.keys(backup);

    if (collectionsFilter) {
      const names = collectionsFilter.split(',').map((s) => s.trim());
      const missing = names.filter((n) => !collectionsToRestore.includes(n));
      if (missing.length > 0) {
        console.warn(`⚠️  Colecciones no encontradas en el backup: ${missing.join(', ')}`);
      }
      collectionsToRestore = names.filter((n) => collectionsToRestore.includes(n));
    }

    if (dryRun) {
      console.log('═══════ DRY RUN — no se escribirá nada ═══════\n');
    }

    for (const colName of collectionsToRestore) {
      const docs = backup[colName];
      if (!Array.isArray(docs)) {
        console.warn(`⚠️  Saltando ${colName}: no es un array`);
        continue;
      }

      process.stdout.write(`${dryRun ? '🔍' : '📥'} ${colName}...`);
      const count = await importCollectionRecursive(
        db.collection(colName),
        docs
      );
      console.log(` ${count} documentos`);
    }

    if (dryRun) {
      console.log('\n⚠️  DRY RUN — nada se escribió. Sacá --dry-run para restaurar de verdad.');
    } else {
      console.log('\n✅ Restauración completada');
    }
  } catch (err) {
    console.error('❌ Error restaurando backup:', err);
    process.exit(1);
  }
})();
