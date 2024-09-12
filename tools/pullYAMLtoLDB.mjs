import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';
import path from "path";

const MODULE_ID = process.cwd();
const yaml = true;

const packs = await fs.readdir('./src/packs');
for (const pack of packs) {
  if (pack === '.gitattributes') continue;


  const packPath = path.join("./packs", pack);
  const stats = await fs.lstat(packPath); // Utilisation de lstat pour vérifier si c'est un fichier ou un répertoire

  if (!stats.isDirectory()) {
    console.log(`${pack} est un fichier, il est ignoré.`);
    continue; // Si ce n'est pas un répertoire, passer à l'élément suivant
  }

  console.log('Packing ' + pack);
  await compilePack(
    `${MODULE_ID}/src/packs/${pack}`,
    `${MODULE_ID}/packs/${pack}`,
    { yaml }
  );
}