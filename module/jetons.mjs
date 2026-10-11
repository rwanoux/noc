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

/**
 * Statut « mort » posé automatiquement quand les Blessures atteignent leur maximum,
 * et retiré quand elles redescendent. Exécuté par un seul MJ (le MJ actif).
 */
async function verifierMort(actor) {
  if (!actor || !game.users.activeGM?.isSelf) return;
  const b = actor.system?.perditions?.blessures;
  if (!b) return;
  const max = Number(b.max) || 0;
  const mort = max > 0 && (Number(b.value) || 0) >= max;
  const statut = CONFIG.specialStatusEffects?.DEFEATED ?? "dead";
  if (mort === actor.statuses?.has(statut)) return;
  await actor.toggleStatusEffect(statut, { active: mort, overlay: true });
}

export function enregistrerStatutMort() {
  Hooks.on("updateActor", (actor, changes) => {
    if (foundry.utils.hasProperty(changes, "system.perditions.blessures")) verifierMort(actor);
  });
  // jetons non liés : leurs modifications passent par le jeton
  Hooks.on("updateToken", (token, changes) => {
    if (foundry.utils.hasProperty(changes, "delta.system.perditions.blessures")) verifierMort(token.actor);
  });
}
