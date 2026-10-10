/**
 * Jetons : ronds (anneau dynamique) et sans rotation du dessin, par défaut.
 */

export const REGLAGES_JETON = {
  "ring.enabled": true,
  lockRotation: true
};

/** Réglages à appliquer au jeton prototype d'un nouvel acteur */
export function jetonParDefaut() {
  return Object.fromEntries(Object.entries(REGLAGES_JETON).map(([k, v]) => [`prototypeToken.${k}`, v]));
}

/** Tout jeton posé sur une scène est rond et ne tourne pas (modifiable ensuite jeton par jeton) */
export function enregistrerJetons() {
  Hooks.on("preCreateToken", (jeton) => {
    jeton.updateSource(REGLAGES_JETON);
  });
}

export const VERSION_MIGRATION_JETONS = 2;

/** Conversion unique : acteurs du monde et jetons déjà posés (MJ uniquement) */
export async function migrerJetons() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationJetons") ?? 0) >= VERSION_MIGRATION_JETONS) return;
  try {
    const acteurs = game.actors.map(a => ({ _id: a.id, ...jetonParDefaut() }));
    if (acteurs.length) await Actor.updateDocuments(acteurs);
    for (const scene of game.scenes) {
      const jetons = scene.tokens.map(t => ({ _id: t.id, ...REGLAGES_JETON }));
      if (jetons.length) await scene.updateEmbeddedDocuments("Token", jetons);
    }
    await game.settings.set("noc", "migrationJetons", VERSION_MIGRATION_JETONS);
  } catch (e) {
    console.error("NOC | conversion des jetons", e);
    ui.notifications.error("NOC : conversion des jetons incomplète. Voir la console (F12).", { permanent: true });
  }
}
