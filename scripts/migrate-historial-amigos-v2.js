/**
 * Migration v2: Merge visitas into amigos for historial records
 *
 * Los registros viejos tenían simpatizantes + visitas como campos separados.
 * En el modelo unificado, amigos = simpatizantes + visitas.
 *
 * Corrige los 62 registros donde amigos quedó con solo simpatizantes.
 *
 * Uso:
 *   node scripts/migrate-historial-amigos-v2.js --dry-run
 *   node scripts/migrate-historial-amigos-v2.js --execute
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
  console.log('Para ejecutar: node scripts/migrate-historial-amigos-v2.js --execute\n');
}

(async () => {
  try {
    const snap = await db.collection('historial').orderBy('fecha', 'desc').get();
    let corregidos = 0;
    let yaCorrectos = 0;
    let sinVisitas = 0;
    let errores = 0;

    for (const doc of snap.docs) {
      const data = doc.data();
      const tieneVisitas = data.visitas !== undefined;
      const visitasCount = data.visitas ?? 0;
      const simpatizantesCount = data.simpatizantes ?? 0;
      const sumaReal = simpatizantesCount + visitasCount;
      const amigosActual = data.amigos ?? 0;

      // Si no tiene campo visitas, no necesita corrección
      if (!tieneVisitas) {
        sinVisitas++;
        continue;
      }

      // Si ya es correcto, skip
      if (amigosActual === sumaReal) {
        yaCorrectos++;
        continue;
      }

      // Construir amigosAsistieron combinado
      const simpatizantesList = Array.isArray(data.simpatizantesAsistieron) ? data.simpatizantesAsistieron : [];
      const visitasList = Array.isArray(data.visitasAsistieron) ? data.visitasAsistieron : [];
      const amigosAsistieronCombinado = [...simpatizantesList, ...visitasList];

      const updateFields = {
        amigos: sumaReal,
        amigosAsistieron: amigosAsistieronCombinado,
      };

      if (dryRun) {
        console.log(
          `[DRY-RUN] ${data.fecha} | simpatizantes: ${simpatizantesCount} + visitas: ${visitasCount} = ${sumaReal} | ` +
          `amigos estaba: ${amigosActual} | asistentes: ${amigosAsistieronCombinado.length} (${simpatizantesList.length} simpat + ${visitasList.length} visit)`
        );
      } else {
        await doc.ref.update(updateFields);
        console.log(
          `✅ ${data.fecha} | ${simpatizantesCount} + ${visitasCount} = ${sumaReal} → amigos actualizado`
        );
      }
      corregidos++;
    }

    console.log(`\nResultados:`);
    console.log(`  Total registros:         ${snap.size}`);
    console.log(`  Sin campo visitas:       ${sinVisitas} (no necesitan cambio)`);
    console.log(`  Ya correctos (amigos OK): ${yaCorrectos}`);
    console.log(`  Corregidos:              ${corregidos}`);
    console.log(`  Errores:                 ${errores}`);

    if (dryRun) {
      console.log(`\n⚠️  DRY RUN — nada se modificó. Ejecutá con --execute para aplicar.`);
    } else {
      console.log(`\n✅ Migración v2 completada.`);
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
