/**
 * Migration: Add amigos/amigosAsistieron fields to historial records
 *
 * Los registros viejos tienen simpatizantes/simpatizantesAsistieron.
 * Agregamos los nuevos campos amigos/amigosAsistieron con los mismos valores.
 * Los campos legacy se conservan para backward compat.
 *
 * Uso:
 *   node scripts/migrate-historial-amigos.js --dry-run
 *   node scripts/migrate-historial-amigos.js --execute
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '..', 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const execute = args.includes('--execute');

if (!dryRun && !execute) {
  console.log('Modo: --dry-run (default)');
  console.log('Para ejecutar: node scripts/migrate-historial-amigos.js --execute\n');
}

(async () => {
  try {
    const snap = await db.collection('historial').orderBy('fecha', 'desc').get();
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const doc of snap.docs) {
      const data = doc.data();

      // Ya tiene amigos? skip
      if (data.amigos !== undefined && data.amigosAsistieron !== undefined) {
        skipped++;
        continue;
      }

      const newFields = {};

      if (data.simpatizantes !== undefined && data.amigos === undefined) {
        newFields.amigos = data.simpatizantes;
      }
      if (Array.isArray(data.simpatizantesAsistieron) && !data.amigosAsistieron) {
        newFields.amigosAsistieron = data.simpatizantesAsistieron;
      }

      if (Object.keys(newFields).length === 0) {
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`[DRY-RUN] ${doc.id} (${data.fecha}) → amigos: ${newFields.amigos ?? '—'}, amigosAsistieron: ${newFields.amigosAsistieron?.length ?? 0} items`);
      } else {
        await doc.ref.update(newFields);
        console.log(`✅ ${doc.id} (${data.fecha}) → amigos: ${newFields.amigos}, amigosAsistieron: ${newFields.amigosAsistieron?.length ?? 0} items`);
      }
      updated++;
    }

    console.log(`\nResultados:`);
    console.log(`  Total: ${snap.size} registros`);
    console.log(`  Actualizados: ${updated}`);
    console.log(`  Saltados (ya migrados): ${skipped}`);
    console.log(`  Errores: ${errors}`);

    if (dryRun) {
      console.log(`\n⚠️  DRY RUN — nada se modificó. Ejecutá con --execute para aplicar.`);
    } else {
      console.log(`\n✅ Migración completada.`);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
