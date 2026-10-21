/**
 * Qualité et Défaut.
 *
 * Qualité : un talent +1. Défaut : un talent -1.
 * Le talent choisi est enregistré dans system.qualites.talentPath et
 * system.defauts.talentPath ("system.talents.<domaine>.<talent>").
 * Le bonus est calculé à la préparation du personnage, sans effet actif.
 */
import { libelleTalent, talentsDuSysteme } from "./archetypes.mjs";

const TYPES = {
  qualite: { cle: "qualites", valeur: 1, nom: "qualité", titre: "Qualité" },
  defaut: { cle: "defauts", valeur: -1, nom: "défaut", titre: "Défaut" }
};

/** "system.talents.action.combat" → "action.combat" (ou null) */
function cleTalent(talentPath) {
  const m = /^system\.talents\.([^.]+)\.([^.]+)$/.exec(talentPath ?? "");
  return m ? `${m[1]}.${m[2]}` : null;
}

/** Description lisible pour la fiche, ex. "combat (+1)" */
export function descriptionQualite(data, type) {
  const cle = cleTalent(data?.talentPath);
  if (!cle) return null;
  const v = TYPES[type].valeur;
  const nom = libelleTalent(cle);
  return `${nom.charAt(0).toUpperCase()}${nom.slice(1)} (${v > 0 ? "+" : ""}${v})`;
}

/** Applique qualité et défaut au personnage (appelé à la préparation) */
export function appliquerQualites(actor) {
  if (actor.type !== "personnage") return;
  actor.overrides ??= {};
  for (const type of Object.values(TYPES)) {
    const data = actor.system[type.cle];
    if (!data || data.effectId) continue; // ancien format : l'effet actif s'en charge encore
    const cle = cleTalent(data.talentPath);
    if (!cle) continue;
    const [dom, tal] = cle.split(".");
    const t = actor.system.talents?.[dom]?.[tal];
    if (!t) continue;
    t.niveau = (Number(t.niveau) || 0) + type.valeur;
    foundry.utils.setProperty(actor.overrides, `system.talents.${dom}.${tal}.niveau`, t.niveau);
  }
}

/** Fenêtre de choix du talent, puis enregistrement */
export async function choisirQualite(actor, type) {
  const def = TYPES[type];
  const actuel = cleTalent(actor.system[def.cle]?.talentPath);
  const options = Object.entries(talentsDuSysteme()).map(([dom, talents]) =>
    `<optgroup label="${dom}">` +
    Object.entries(talents).map(([tal, t]) =>
      `<option value="${dom}.${tal}" ${actuel === `${dom}.${tal}` ? "selected" : ""}>${t.label}</option>`).join("") +
    `</optgroup>`).join("");

  const choix = await foundry.applications.api.DialogV2.wait({
    window: { title: `${def.titre} de ${actor.name}` },
    classes: ["nocDialog"],
    content: `<p>Choisissez le talent ${type === "qualite" ? "augmenté de 1" : "réduit de 1"}.</p>
      <div class="form-group"><select name="talent">${options}</select></div>`,
    buttons: [
      { action: "ok", label: "Valider", icon: "fa-solid fa-check", default: true,
        callback: (event, button) => button.form.elements.talent.value },
      { action: "cancel", label: "Annuler", icon: "fa-solid fa-times", callback: () => null }
    ],
    rejectClose: false
  });
  if (!choix) return;
  return enregistrerQualite(actor, type, choix);
}

/** Enregistre (ou efface, si cle est vide) la qualité ou le défaut */
export async function enregistrerQualite(actor, type, cle) {
  const def = TYPES[type];
  const ancien = actor.system[def.cle];
  if (ancien?.effectId && actor.effects.get(ancien.effectId)) {
    await actor.deleteEmbeddedDocuments("ActiveEffect", [ancien.effectId]);
  }
  const tal = cle ? cle.split(".")[1] : "";
  return actor.update({
    [`system.${def.cle}.talentPath`]: cle ? `system.talents.${cle}` : "",
    [`system.${def.cle}.targetTalent`]: tal,
    [`system.${def.cle}.label`]: cle ? libelleTalent(cle) : "",
    [`system.${def.cle}.isDefault`]: type === "defaut",
    [`system.${def.cle}.effectData`]: {},
    [`system.${def.cle}.effectId`]: ""
  });
}

/* -------------------------------------------- */
/*  Conversion des anciennes qualités/défauts    */
/* -------------------------------------------- */

export const VERSION_MIGRATION_QUALITES = 1;

/** Convertit un personnage en conservant exactement ses scores affichés */
async function migrerPersonnage(actor) {
  if (actor.type !== "personnage") return false;
  const majActeur = {};
  const effetsASupprimer = [];
  for (const type of Object.values(TYPES)) {
    const data = actor._source.system?.[type.cle];
    if (!data?.effectId) continue;
    const effet = actor.effects.get(data.effectId);
    const cle = cleTalent(data.talentPath);
    // Ce que l'ancien effet ajoutait, et ce que le nouveau calcul ajoutera
    let ancien = 0;
    if (effet && !effet.disabled) {
      for (const ch of (effet.system?.changes ?? effet.changes ?? [])) {
        if (ch.key === `${data.talentPath}.niveau`) ancien += Number(ch.value) || 0;
      }
    }
    const nouveau = cle ? type.valeur : 0;
    if (cle && ancien !== nouveau) {
      const chemin = `${data.talentPath}.niveau`;
      const base = Number(majActeur[chemin] ?? foundry.utils.getProperty(actor._source, chemin)) || 0;
      majActeur[chemin] = base + ancien - nouveau;
    }
    if (effet) effetsASupprimer.push(effet.id);
    majActeur[`system.${type.cle}.effectId`] = "";
    majActeur[`system.${type.cle}.effectData`] = {};
    if (cle) majActeur[`system.${type.cle}.label`] = libelleTalent(cle);
  }
  if (!Object.keys(majActeur).length) return false;
  if (effetsASupprimer.length) await actor.deleteEmbeddedDocuments("ActiveEffect", effetsASupprimer);
  await actor.update(majActeur);
  return true;
}

/** Conversion unique des qualités et défauts du monde (MJ uniquement) */
export async function migrerQualites() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationQualites") ?? 0) >= VERSION_MIGRATION_QUALITES) return;
  const acteurs = [...game.actors];
  for (const scene of game.scenes) {
    for (const token of scene.tokens) if (!token.actorLink && token.actor) acteurs.push(token.actor);
  }
  const erreurs = [];
  for (const actor of acteurs) {
    try { await migrerPersonnage(actor); }
    catch (e) { erreurs.push(actor.name); console.error("NOC | conversion qualités", actor.name, e); }
  }
  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion des qualités incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationQualites", VERSION_MIGRATION_QUALITES);
}
