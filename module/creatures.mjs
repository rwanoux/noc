/**
 * Créatures : l'attaque naturelle (system.attaque) devient une arme de contact
 * possédée par la créature, lancée comme les armes des personnages.
 */

/** "3, tranchant" → { degats: "3", traits: "Tranchant" } */
export function analyserDegats(texte) {
  const parties = String(texte ?? "").split(",").map(p => p.trim()).filter(Boolean);
  const degats = parties.shift() ?? "";
  const traits = parties.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
  return { degats, traits };
}

/** Données d'une arme de contact naturelle à partir de l'ancienne attaque */
export function armeDepuisAttaque(attaque, special = "") {
  const { degats, traits } = analyserDegats(attaque?.degats);
  return {
    name: attaque?.label || "Attaque",
    type: "arme",
    img: "systems/noc/asset/default_icons/arme.webp",
    system: {
      description: special || "",
      adistance: false,
      maitrise: true,
      degats,
      traits
    }
  };
}

export const VERSION_MIGRATION_CREATURES = 1;

async function migrerCreature(actor) {
  if (actor.type !== "creature") return false;
  const attaque = actor.system.attaque;
  if (!attaque?.label && !attaque?.degats) return false;
  if (actor.items.some(i => i.type === "arme")) return false;
  await actor.createEmbeddedDocuments("Item", [armeDepuisAttaque(attaque)]);
  return true;
}

/** Conversion unique des attaques des créatures du monde (MJ uniquement) */
export async function migrerCreatures() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationCreatures") ?? 0) >= VERSION_MIGRATION_CREATURES) return;
  const acteurs = [...game.actors];
  for (const scene of game.scenes) {
    for (const token of scene.tokens) if (!token.actorLink && token.actor) acteurs.push(token.actor);
  }
  const erreurs = [];
  for (const actor of acteurs) {
    try { await migrerCreature(actor); }
    catch (e) { erreurs.push(actor.name); console.error("NOC | conversion créature", actor.name, e); }
  }
  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion des attaques incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationCreatures", VERSION_MIGRATION_CREATURES);
}
