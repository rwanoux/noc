/**
 * Archétypes et thèmes.
 *
 * Les thèmes font partie de l'archétype (system.themes). Quand un archétype est
 * glissé sur un personnage, le joueur choisit l'un de ses thèmes
 * (system.themeChoisi). Les bonus de l'archétype et du thème choisi sont
 * calculés directement à la préparation du personnage, sans effets actifs.
 */

/* -------------------------------------------- */
/*  Outils                                       */
/* -------------------------------------------- */

/** Liste des talents du système : { domaine: { talent: {label} } } */
export function talentsDuSysteme() {
  return game.model?.Actor?.personnage?.talents
    ?? game.system.template?.Actor?.templates?.talents?.talents
    ?? game.actors?.find(a => a.type === "personnage")?.system.talents
    ?? {};
}

/** Domaines du système (avec leur libellé) */
export function domainesDuSysteme() {
  return game.model?.Actor?.personnage?.domaines
    ?? game.system.template?.Actor?.templates?.domaines?.domaines
    ?? game.actors?.find(a => a.type === "personnage")?.system.domaines
    ?? {};
}

/** Libellé lisible d'un talent "domaine.talent" */
export function libelleTalent(cle) {
  const [dom, tal] = String(cle).split(".");
  return talentsDuSysteme()[dom]?.[tal]?.label ?? tal ?? cle;
}

function talentExiste(cle, talents = talentsDuSysteme()) {
  if (typeof cle !== "string") return false;
  const [dom, tal] = cle.split(".");
  return !!talents[dom]?.[tal];
}

/** Nettoie la liste des talents d'un thème (ancien format désordonné inclus) */
export function nettoyerTalentsTheme(liste) {
  const talents = talentsDuSysteme();
  const parCle = new Map();
  for (const t of Array.isArray(liste) ? liste : []) {
    if (!t || typeof t !== "object") continue;
    const valeur = Number(t.value);
    if (!talentExiste(t.talent, talents) || !valeur) continue;
    parCle.set(t.talent, valeur);
  }
  return [...parCle].map(([talent, value]) => ({ talent, value }));
}

/** Crée un thème propre à partir de n'importe quelle source */
export function creerTheme({ id, nom, description = "", talents = [] } = {}) {
  return {
    id: id || foundry.utils.randomID(),
    nom: nom || "Nouveau thème",
    description: description || "",
    talents: nettoyerTalentsTheme(talents)
  };
}

/** Convertit un ancien thème lié (flags.noc.linkedThemes) */
function themeDepuisLien(lien) {
  return creerTheme({
    id: lien.id,
    nom: lien.name ?? lien.itemData?.name,
    description: lien.itemData?.system?.description,
    talents: lien.itemData?.system?.talents
  });
}

/** Convertit un ancien objet de type « thème » */
export function themeDepuisItem(item) {
  const data = item.toObject ? item.toObject() : item;
  return creerTheme({
    nom: data.name,
    description: data.system?.description,
    talents: data.system?.talents
  });
}

/**
 * Prépare les données d'un archétype à l'ancien format :
 * thèmes liés → system.themes, suppression des effets actifs.
 * Renvoie les modifications à appliquer (ou null si rien à faire).
 */
export function conversionArchetype(source) {
  const changements = {};
  const liens = source.flags?.noc?.linkedThemes;
  if (!Array.isArray(source.system?.themes) || (!source.system.themes.length && liens?.length)) {
    changements["system.themes"] = (liens ?? []).map(themeDepuisLien);
  }
  if (source.system?.themeChoisi === undefined) changements["system.themeChoisi"] = "";
  if (liens !== undefined) changements["flags.noc.-=linkedThemes"] = null;
  return Object.keys(changements).length ? changements : null;
}

/* -------------------------------------------- */
/*  Calcul des bonus                             */
/* -------------------------------------------- */

/**
 * Bonus d'un archétype (et de son thème choisi).
 * @returns {{domaines: Object<string,number>, talents: Object<string,number>}}
 */
export function bonusArchetype(systemArchetype, domainesActeur) {
  const bonus = { domaines: {}, talents: {} };
  const s = systemArchetype ?? {};
  const ajouterTalent = (cle, v) => {
    v = Number(v) || 0;
    if (!v || !talentExiste(cle)) return;
    bonus.talents[cle] = (bonus.talents[cle] ?? 0) + v;
  };

  // Domaines : 2, ou la valeur d'affinité si elle est active
  for (const dom of Object.keys(domainesActeur ?? {})) {
    const aff = s.affinite?.[dom];
    bonus.domaines[dom] = aff?.active ? (Number(aff.value) || 0) : 2;
  }
  // Talent majeur : +2
  if (s.talentMajeur && s.talentMajeur !== "null") ajouterTalent(s.talentMajeur, 2);
  // Talents mineurs
  for (const [dom, liste] of Object.entries(s.talentsMineurs ?? {})) {
    for (const [tal, t] of Object.entries(liste ?? {})) ajouterTalent(`${dom}.${tal}`, t?.niveau);
  }
  // Thème choisi
  const theme = (s.themes ?? []).find(t => t.id === s.themeChoisi);
  for (const t of theme?.talents ?? []) ajouterTalent(t.talent, t.value);

  return bonus;
}

/** Applique les bonus de l'archétype au personnage (appelé à la préparation) */
export function appliquerArchetype(actor) {
  if (actor.type !== "personnage") return;
  const archetype = actor.items.find(i => i.type === "archetype");
  if (!archetype) return;
  const bonus = bonusArchetype(archetype.system, actor.system.domaines);
  actor.overrides ??= {};

  for (const [dom, v] of Object.entries(bonus.domaines)) {
    const d = actor.system.domaines?.[dom];
    if (!d) continue;
    d.value = (Number(d.value) || 0) + v;
    foundry.utils.setProperty(actor.overrides, `system.domaines.${dom}.value`, d.value);
  }
  for (const [cle, v] of Object.entries(bonus.talents)) {
    const [dom, tal] = cle.split(".");
    const t = actor.system.talents?.[dom]?.[tal];
    if (!t) continue;
    t.niveau = (Number(t.niveau) || 0) + v;
    foundry.utils.setProperty(actor.overrides, `system.talents.${dom}.${tal}.niveau`, t.niveau);
  }
}

/* -------------------------------------------- */
/*  Choix du thème                               */
/* -------------------------------------------- */

/** Fenêtre de choix du thème. Renvoie l'id du thème, ou null si annulé. */
export async function choisirTheme(archetypeData, actuel = null) {
  const themes = archetypeData.system?.themes ?? [];
  if (!themes.length) return "";
  const esc = foundry.utils.escapeHTML ?? (s => s);
  const lignes = themes.map((t, i) => {
    const detail = t.talents.map(x => `${libelleTalent(x.talent)} ${x.value > 0 ? "+" : ""}${x.value}`).join(", ");
    return `<label class="noc-choix-theme flexrow">
        <input type="radio" name="theme" value="${t.id}" ${(actuel ? t.id === actuel : i === 0) ? "checked" : ""} style="flex:0 0 2em">
        <span><strong>${esc(t.nom)}</strong><br><small>${esc(detail || "aucun talent")}</small></span>
      </label>`;
  }).join("");

  return foundry.applications.api.DialogV2.wait({
    window: { title: `Thème de l'archétype ${archetypeData.name}` },
    classes: ["nocDialog"],
    content: `<p>Choisissez le thème du personnage. Il pourra être changé plus tard depuis la fiche.</p>${lignes}`,
    buttons: [
      { action: "ok", label: "Valider", icon: "fa-solid fa-check", default: true,
        callback: (event, button) => button.form.elements.theme.value },
      { action: "cancel", label: "Annuler", icon: "fa-solid fa-times", callback: () => null }
    ],
    rejectClose: false
  });
}

/* -------------------------------------------- */
/*  Conversion des données existantes            */
/* -------------------------------------------- */

export const VERSION_MIGRATION_ARCHETYPES = 1;

function estAjout(change) {
  const m = change.mode ?? change.type;
  return m === 2 || m === "2" || m === "add";
}
const CLE_BONUS = /^system\.(domaines\.[^.]+\.value|talents\.[^.]+\.[^.]+\.niveau)$/;

/** Convertit un personnage en conservant exactement ses scores affichés */
async function migrerPersonnage(actor) {
  if (actor.type !== "personnage") return false;
  const archetypes = actor.items.filter(i => i.type === "archetype");
  const themes = actor.items.filter(i => i.type === "thème");
  const idsSources = new Set([...archetypes, ...themes].map(i => i.id));
  const effetsActeur = actor.effects.filter(e =>
    [...idsSources].some(id => e.origin?.includes(id)) || /^(archetype|thème)_/.test(e.name ?? ""));
  // Rien à convertir si l'archétype est déjà au nouveau format (ex. jeton d'un acteur déjà converti)
  const ancienFormat = archetypes.some(a => a.effects.size || a.effects.length || a.flags?.noc?.linkedThemes !== undefined);
  if (!themes.length && !effetsActeur.length && !ancienFormat) return false;

  // 1. Ce que les anciens effets ajoutaient
  const ancien = {};
  const compter = eff => {
    if (eff.disabled) return;
    for (const ch of (eff.system?.changes ?? eff.changes ?? [])) {
      if (!estAjout(ch) || !CLE_BONUS.test(ch.key)) continue;
      ancien[ch.key] = (ancien[ch.key] ?? 0) + (Number(ch.value) || 0);
    }
  };
  for (const item of [...archetypes, ...themes]) for (const eff of item.effects) if (eff.transfer !== false) compter(eff);
  effetsActeur.forEach(compter);

  // 2. Nouvelles données de l'archétype
  const archetype = archetypes[0];
  let nouveauBonus = { domaines: {}, talents: {} };
  let majArchetype = null;
  if (archetype) {
    const source = archetype.toObject();
    const conv = conversionArchetype(source) ?? {};
    const listeThemes = foundry.utils.deepClone(conv["system.themes"] ?? source.system.themes ?? []);
    let themeChoisi = source.system.themeChoisi ?? "";
    if (themes.length) {
      const nom = themes[0].name.trim().toLowerCase();
      let t = listeThemes.find(x => x.nom.trim().toLowerCase() === nom);
      if (!t) { t = themeDepuisItem(themes[0]); listeThemes.push(t); }
      themeChoisi = t.id;
    }
    majArchetype = { ...conv, "system.themes": listeThemes, "system.themeChoisi": themeChoisi };
    nouveauBonus = bonusArchetype({ ...source.system, themes: listeThemes, themeChoisi }, actor._source.system.domaines);
  }
  const nouveau = {};
  for (const [d, v] of Object.entries(nouveauBonus.domaines)) nouveau[`system.domaines.${d}.value`] = v;
  for (const [c, v] of Object.entries(nouveauBonus.talents)) {
    const [d, t] = c.split(".");
    nouveau[`system.talents.${d}.${t}.niveau`] = v;
  }

  // 3. Ajuster les valeurs de base pour que les scores affichés ne bougent pas
  const majActeur = {};
  for (const cle of new Set([...Object.keys(ancien), ...Object.keys(nouveau)])) {
    const ecart = (ancien[cle] ?? 0) - (nouveau[cle] ?? 0);
    if (!ecart) continue;
    const base = foundry.utils.getProperty(actor._source, cle);
    if (base === undefined) continue;
    majActeur[cle] = (Number(base) || 0) + ecart;
  }

  // 4. Écriture
  for (const a of archetypes) {
    const ids = a.effects.map(e => e.id);
    if (ids.length) await a.deleteEmbeddedDocuments("ActiveEffect", ids);
  }
  if (effetsActeur.length) await actor.deleteEmbeddedDocuments("ActiveEffect", effetsActeur.map(e => e.id));
  if (archetype && majArchetype) await archetype.update(majArchetype);
  if (themes.length) await actor.deleteEmbeddedDocuments("Item", themes.map(t => t.id));
  if (Object.keys(majActeur).length) await actor.update(majActeur);
  return true;
}

async function migrerArchetypeMonde(item) {
  const conv = conversionArchetype(item.toObject());
  const ids = item.effects.map(e => e.id);
  if (ids.length) await item.deleteEmbeddedDocuments("ActiveEffect", ids);
  if (conv) await item.update(conv);
}

/** Conversion unique des archétypes et personnages du monde (MJ uniquement) */
export async function migrerArchetypes() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationArchetypes") ?? 0) >= VERSION_MIGRATION_ARCHETYPES) return;

  ui.notifications.info("NOC : conversion des archétypes et thèmes en cours, ne fermez pas le monde…");
  const erreurs = [];
  let nb = 0;

  for (const item of game.items.filter(i => i.type === "archetype")) {
    try { await migrerArchetypeMonde(item); }
    catch (e) { erreurs.push(item.name); console.error("NOC | conversion archétype", item.name, e); }
  }
  const acteurs = [...game.actors];
  for (const scene of game.scenes) {
    for (const token of scene.tokens) if (!token.actorLink && token.actor) acteurs.push(token.actor);
  }
  for (const actor of acteurs) {
    try { if (await migrerPersonnage(actor)) nb++; }
    catch (e) { erreurs.push(actor.name); console.error("NOC | conversion personnage", actor.name, e); }
  }

  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationArchetypes", VERSION_MIGRATION_ARCHETYPES);
  ui.notifications.info(`NOC : conversion terminée (${nb} personnage(s) converti(s)).`);
}
