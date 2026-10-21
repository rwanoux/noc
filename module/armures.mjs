/**
 * Armures : score d'armure, encombrant (Déplacement -1), limitée, valeur.
 */

/** Boutons +/- génériques d'une fiche (data-champ = chemin de la valeur, minimum 0) */
export function activerCompteurs(html, document) {
  const changer = async (champ, ecart) => {
    const valeur = Math.max(0, (Number(foundry.utils.getProperty(document._source, champ)) || 0) + ecart);
    return document.update({ [champ]: valeur });
  };
  html.find("a.compteur-plus").click(ev => changer(ev.currentTarget.dataset.champ, 1));
  html.find("a.compteur-moins").click(ev => changer(ev.currentTarget.dataset.champ, -1));
}

/** Une armure encombrante réduit de 1 le talent Déplacement de son porteur */
export function appliquerArmures(actor) {
  const t = actor.system.talents?.action?.deplacement;
  if (!t) return;
  if (!actor.items.some(i => i.type === "armure" && i.system.encombrant)) return;
  t.niveau = (Number(t.niveau) || 0) - 1;
  actor.overrides ??= {};
  foundry.utils.setProperty(actor.overrides, "system.talents.action.deplacement.niveau", t.niveau);
}

/** Lit l'ancien champ « traits » : "Encombrant, limité (3)" → { encombrant, limite } */
export function analyserTraitsArmure(traits) {
  const texte = String(traits ?? "");
  const encombrant = /encombrant/i.test(texte);
  const m = /limit[ée]e?\s*\(\s*(\d+)\s*\)/i.exec(texte);
  return { encombrant, limite: m ? Number(m[1]) : 0 };
}

export const VERSION_MIGRATION_ARMURES = 1;

function majArmure(item) {
  if (item.type !== "armure") return null;
  const src = item._source.system;
  if (!src.traits) return null;
  const { encombrant, limite } = analyserTraitsArmure(src.traits);
  return { _id: item.id, "system.encombrant": encombrant, "system.limite": limite || Number(src.limite) || 0, "system.traits": "" };
}

/** Conversion unique des traits d'armure (monde et acteurs, MJ uniquement) */
export async function migrerArmures() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationArmures") ?? 0) >= VERSION_MIGRATION_ARMURES) return;
  const erreurs = [];
  try {
    const maj = game.items.map(majArmure).filter(Boolean);
    if (maj.length) await Item.updateDocuments(maj);
  } catch (e) { erreurs.push("objets du monde"); console.error("NOC | conversion armures", e); }
  for (const actor of game.actors) {
    try {
      const maj = actor.items.map(majArmure).filter(Boolean);
      if (maj.length) await actor.updateEmbeddedDocuments("Item", maj);
    } catch (e) { erreurs.push(actor.name); console.error("NOC | conversion armures", actor.name, e); }
  }
  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion des armures incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationArmures", VERSION_MIGRATION_ARMURES);
}
