/**
 * Autres : Classe Exo, Énergie Noire, domaines et talents.
 *
 * - Classe Exo entre 1 et 7 (7 par défaut).
 * - Énergie Noire déduite = 8 - Classe Exo, sauf si le MJ la force
 *   (system.energieNoire.forcee).
 * - Domaine = 2 + Énergie Noire + individualisation du MJ ;
 *   Talent  = Énergie Noire + individualisation du MJ, sauf Lumière
 *   (livre p. 280 : l'Énergie noire s'ajoute à tout sauf à la Lumière).
 *   Les valeurs enregistrées des domaines et talents sont ces individualisations,
 *   qui restent donc appliquées quand l'Énergie Noire change.
 */

export const CLASSE_EXO_MIN = 1;
export const CLASSE_EXO_MAX = 7;

export function classeExo(valeur) {
  const n = Number(valeur);
  if (!Number.isFinite(n)) return CLASSE_EXO_MAX;
  return Math.min(CLASSE_EXO_MAX, Math.max(CLASSE_EXO_MIN, Math.round(n)));
}

export function energieNoireDeduite(classe) {
  return 8 - classeExo(classe);
}

function estForcee(v) {
  return v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));
}

/** Énergie Noire effective à partir des données enregistrées */
export function energieNoire(systemSource) {
  const forcee = systemSource?.energieNoire?.forcee;
  return estForcee(forcee) ? Number(forcee) : energieNoireDeduite(systemSource?.classeExo?.value);
}

/** Calcul à la préparation de l'acteur */
export function appliquerAutre(actor) {
  if (actor.type !== "autre") return;
  const s = actor.system;
  actor.overrides ??= {};
  const set = (chemin, v) => foundry.utils.setProperty(actor.overrides, chemin, v);

  s.classeExo.value = classeExo(s.classeExo.value);
  const deduite = energieNoireDeduite(s.classeExo.value);
  const en = estForcee(s.energieNoire.forcee) ? Number(s.energieNoire.forcee) : deduite;
  s.energieNoire.value = en;
  s.energieNoire.deduite = deduite;
  s.energieNoire.estForcee = estForcee(s.energieNoire.forcee);
  set("system.energieNoire.value", en);

  for (const [dom, d] of Object.entries(s.domaines ?? {})) {
    d.individualisation = Number(d.value) || 0;
    d.value = 2 + en + d.individualisation;
    set(`system.domaines.${dom}.value`, d.value);
  }
  for (const [dom, liste] of Object.entries(s.talents ?? {})) {
    for (const [tal, t] of Object.entries(liste ?? {})) {
      t.individualisation = Number(t.niveau) || 0;
      t.niveau = (dom === "vie" && tal === "lumiere" ? 0 : en) + t.individualisation;
      set(`system.talents.${dom}.${tal}.niveau`, t.niveau);
    }
  }
}

/* -------------------------------------------- */
/*  Conversion des Autres existants              */
/* -------------------------------------------- */

export const VERSION_MIGRATION_AUTRES = 3;

/** Valeurs de base « neutres » d'un Autre : Classe Exo 7, aucune individualisation */
function majAutreNeuf(src) {
  const maj = { "system.classeExo.value": CLASSE_EXO_MAX, "system.energieNoire.forcee": null };
  for (const dom of Object.keys(src.domaines ?? {})) maj[`system.domaines.${dom}.value`] = 0;
  for (const [dom, liste] of Object.entries(src.talents ?? {})) {
    for (const tal of Object.keys(liste ?? {})) maj[`system.talents.${dom}.${tal}.niveau`] = 0;
  }
  return maj;
}

/** Toutes les valeurs (domaines, talents) d'un Autre sont-elles égales à celles indiquées ? */
function toutesValeurs(src, domaine, talent) {
  const doms = Object.values(src.domaines ?? {}).every(d => (Number(d.value) || 0) === domaine);
  const tals = Object.values(src.talents ?? {}).every(l => Object.values(l ?? {}).every(t => (Number(t.niveau) || 0) === talent));
  return doms && tals;
}

/** Valeurs absolues → individualisations, scores affichés conservés */
async function migrerAutre(actor) {
  if (actor.type !== "autre") return false;
  const src = actor._source.system;
  // Autre jamais renseigné (ancienne Classe Exo par défaut 1, tout à 0) : on repart de la Classe Exo 7
  if ((Number(src.classeExo?.value) || 1) === 1 && toutesValeurs(src, 0, 0)) {
    await actor.update(majAutreNeuf(src));
    return true;
  }
  const en = energieNoireDeduite(src.classeExo?.value);
  const maj = { "system.classeExo.value": classeExo(src.classeExo?.value), "system.energieNoire.forcee": null };

  // l'ancienne surcharge (+2 sur un talent, par effet actif) est intégrée puis retirée
  const surcharges = actor.effects.filter(e => e.name === "surcharge" || e.label === "surcharge");
  const bonusSurcharge = {};
  for (const e of surcharges) {
    if (e.disabled) continue;
    for (const ch of (e.system?.changes ?? e.changes ?? [])) {
      bonusSurcharge[ch.key] = (bonusSurcharge[ch.key] ?? 0) + (Number(ch.value) || 0);
    }
  }

  for (const [dom, d] of Object.entries(src.domaines ?? {})) {
    maj[`system.domaines.${dom}.value`] = (Number(d.value) || 0) - (2 + en);
  }
  for (const [dom, liste] of Object.entries(src.talents ?? {})) {
    for (const [tal, t] of Object.entries(liste ?? {})) {
      const cle = `system.talents.${dom}.${tal}.niveau`;
      maj[cle] = (Number(t.niveau) || 0) + (bonusSurcharge[cle] ?? 0) - en;
    }
  }
  if (surcharges.length) await actor.deleteEmbeddedDocuments("ActiveEffect", surcharges.map(e => e.id));
  if (actor.flags?.noc?.surcharge !== undefined) maj["flags.noc.-=surcharge"] = null;
  await actor.update(maj);
  return true;
}

/**
 * Version 2 : un Autre jamais renseigné, déjà converti avec l'ancienne Classe Exo 1
 * (individualisations -9 sur les domaines et -7 sur les talents), repart de la Classe Exo 7.
 */
async function corrigerAutreConverti(actor) {
  if (actor.type !== "autre") return false;
  const src = actor._source.system;
  if ((Number(src.classeExo?.value) || 1) !== 1 || !toutesValeurs(src, -9, -7)) return false;
  await actor.update(majAutreNeuf(src));
  return true;
}

/**
 * Version 3 : la Lumière ne reçoit plus l'Énergie noire. Une individualisation négative
 * (héritée de la conversion) est ramenée au score qui s'affichait ; sinon elle est gardée telle quelle.
 */
async function corrigerLumiere(actor) {
  if (actor.type !== "autre") return false;
  const src = actor._source.system;
  const n = Number(src.talents?.vie?.lumiere?.niveau) || 0;
  if (n >= 0) return false;
  await actor.update({ "system.talents.vie.lumiere.niveau": n + energieNoire(src) });
  return true;
}

/** Conversion unique des Autres du monde (MJ uniquement) */
export async function migrerAutres() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationAutres") ?? 0) >= VERSION_MIGRATION_AUTRES) return;
  const acteurs = [...game.actors];
  // les jetons non liés héritent de leur acteur, déjà converti ci-dessus
  const version = game.settings.get("noc", "migrationAutres") ?? 0;
  const erreurs = [];
  for (const actor of acteurs) {
    try {
      if (version < 1) await migrerAutre(actor);
      else if (version < 2) await corrigerAutreConverti(actor);
      if (version < 3) await corrigerLumiere(actor);
    }
    catch (e) { erreurs.push(actor.name); console.error("NOC | conversion Autre", actor.name, e); }
  }
  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion des Autres incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationAutres", VERSION_MIGRATION_AUTRES);
}
