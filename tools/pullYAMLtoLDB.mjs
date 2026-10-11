import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';

const MODULE_ID = process.cwd();
const yaml = true;

const packs = await fs.readdir('./src/packs');
const echecs = [];
for (const pack of packs) {
  if (pack === '.gitattributes') continue;
  console.log('Packing ' + pack);
  try {
    await compilePack(
      `${MODULE_ID}/src/packs/${pack}`,
      `${MODULE_ID}/packs/${pack}`,
      { yaml }
    );
  } catch (e) {
    echecs.push(pack);
    console.error(`  Échec pour ${pack} : ${e.message}`);
  }
}
if (echecs.length) {
  console.error(`\nCompendiums non générés : ${echecs.join(', ')}.`);
  console.error('Cause la plus fréquente : Foundry est encore ouvert et verrouille les compendiums.');
  console.error('Fermez complètement Foundry (pas seulement le monde), puis relancez la commande.');
  process.exitCode = 1;
}
