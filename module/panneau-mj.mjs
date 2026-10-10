/**
 * Panneau du MJ : actions sur les personnages ciblés, le Fiel et la Menace.
 * Fenêtre réservée au MJ (ApplicationV2), ouverte depuis la barre d'outils.
 */

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Perditions et talent qui en réduit l'effet (d'après le livre de base) */
export const PERDITIONS = {
  blessures: { label: "Blessures", reduction: null },
  trauma: { label: "Trauma", reduction: { domaine: "ame", talent: "folie", label: "Folie" } },
  noirceur: { label: "Noirceur", reduction: { domaine: "vie", talent: "lumiere", label: "Lumière" } },
  traque: { label: "Traque", reduction: { domaine: "statut", talent: "façade", label: "Façade" } }
};

/** Effets de Fiel (CONFIG.NOC.effetsFiel) et leur application mécanique */
const EFFETS_FIEL = {
  "Fatigue": { cle: "fatigue" },
  "Intervention de l’Artefact": { cle: "artefact", perdition: "noirceur", points: 2 },
  "Tension": { cle: "tension", perdition: "trauma", points: 2 },
  "Traque": { cle: "traque", perdition: "traque", points: 2 },
  "Bouleversement administratif": { cle: "bouleversement" },
  "Coup du sort": { cle: "coupDuSort" },
  "Événement inattendu": { cle: "evenement" }
};

const nombre = v => Number(v) || 0;

/* -------------------------------------------- */
/*  Fiel et Menace                               */
/* -------------------------------------------- */

/** Fixe le nombre de gouttes de Fiel (0 à 35) ; la Menace en découle (1 par tranche de 5) */
export async function fixerFiel(gouttes) {
  const fiel = foundry.utils.deepClone(game.settings.get("noc", "compteurFiel") ?? {});
  const avant = { gouttes: nombre(fiel.gouttes), menace: nombre(fiel.menace) };
  fiel.gouttes = Math.max(0, Math.min(35, Math.round(nombre(gouttes))));
  fiel.menace = Math.trunc(fiel.gouttes / 5);
  await game.settings.set("noc", "compteurFiel", fiel);
  if (ui.compteur) {
    ui.compteur.object = fiel;
    ui.compteur.render(true);
  }
  game.socketManager?.launchSocket("renderCompteur", {});
  Hooks.callAll("updatedFiel", ui.compteur, fiel);
  return { avant, apres: { gouttes: fiel.gouttes, menace: fiel.menace } };
}

export function etatFiel() {
  const fiel = game.settings.get("noc", "compteurFiel") ?? {};
  return { gouttes: nombre(fiel.gouttes), menace: nombre(fiel.menace) };
}

/* -------------------------------------------- */
/*  États durables : fatigue, bouleversement     */
/* -------------------------------------------- */

/** Applique les états durables à la préparation de l'acteur */
export function appliquerEtats(actor) {
  const etats = actor.flags?.noc ?? {};
  if (!etats.fatigue && !etats.bouleversement) return;
  actor.overrides ??= {};
  for (const [dom, liste] of Object.entries(actor.system.talents ?? {})) {
    for (const [tal, t] of Object.entries(liste ?? {})) {
      let malus = 0;
      if (etats.fatigue) malus += 1;
      if (etats.bouleversement && dom === "statut") malus += 1;
      if (!malus) continue;
      t.niveau = nombre(t.niveau) - malus;
      foundry.utils.setProperty(actor.overrides, `system.talents.${dom}.${tal}.niveau`, t.niveau);
    }
  }
}

/* -------------------------------------------- */
/*  Messages                                     */
/* -------------------------------------------- */

async function message(titre, lignes, { public: estPublic = false, texte = "" } = {}) {
  const contenu = `<h3>${titre}</h3>${texte ? `<p>${texte}</p>` : ""}`
    + (lignes.length ? `<ul>${lignes.map(l => `<li>${l}</li>`).join("")}</ul>` : "");
  const data = { speaker: { alias: "La Loi" }, content: contenu };
  if (!estPublic) data.whisper = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
  return ChatMessage.create(data);
}

/* -------------------------------------------- */
/*  Actions sur les acteurs                      */
/* -------------------------------------------- */

/** Modifie une perdition ; renvoie une ligne de compte rendu */
async function modifierPerdition(actor, perdition, points, { soigner = false, reduire = true } = {}) {
  const p = actor.system.perditions?.[perdition];
  if (!p) return `${actor.name} : pas de ${PERDITIONS[perdition].label}`;
  const def = PERDITIONS[perdition];
  let effectifs = nombre(points);
  let note = "";
  if (!soigner && reduire && def.reduction) {
    const niveau = nombre(actor.system.talents?.[def.reduction.domaine]?.[def.reduction.talent]?.niveau);
    effectifs = Math.max(0, effectifs - Math.max(0, niveau));
    note = ` (${def.reduction.label} ${niveau})`;
  }
  const avant = nombre(p.value);
  const apres = soigner
    ? Math.max(nombre(p.min), avant - effectifs)
    : Math.min(nombre(p.max) || 10, avant + effectifs);
  if (apres !== avant) await actor.update({ [`system.perditions.${perdition}.value`]: apres });
  return `${actor.name} — ${def.label} : ${avant} → ${apres}${note}`;
}

/* -------------------------------------------- */
/*  Fenêtre                                      */
/* -------------------------------------------- */

export class PanneauMJ extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "noc-panneau-mj",
    classes: ["noc", "panneau-mj"],
    tag: "div",
    window: { title: "Panneau du MJ", icon: "fa-solid fa-sliders", resizable: true },
    position: { width: 560, height: "auto" },
    actions: {
      infliger: PanneauMJ.#onInfliger,
      soigner: PanneauMJ.#onSoigner,
      fiel: PanneauMJ.#onFiel,
      effetFiel: PanneauMJ.#onEffetFiel,
      leverEtat: PanneauMJ.#onLeverEtat,
      etapeMJ: PanneauMJ.#onEtapeMJ,
      toutCocher: PanneauMJ.#onToutCocher
    }
  };

  static PARTS = {
    main: { template: "systems/noc/templates/window_app/panneau-mj.hbs" }
  };

  /** identifiants des acteurs cochés (par défaut : tous les personnages) */
  cibles = null;
  reductions = true;

  _personnages() {
    return game.actors.filter(a => a.type === "personnage");
  }

  async _prepareContext() {
    const personnages = this._personnages();
    if (this.cibles === null) this.cibles = new Set(personnages.map(a => a.id));
    const selection = canvas?.tokens?.controlled?.map(t => t.actor).filter(Boolean) ?? [];
    return {
      personnages: personnages.map(a => ({
        id: a.id, nom: a.name, img: a.img,
        coche: this.cibles.has(a.id),
        perditions: Object.keys(PERDITIONS).map(k => ({ label: PERDITIONS[k].label, valeur: nombre(a.system.perditions?.[k]?.value) })),
        fatigue: !!a.flags?.noc?.fatigue,
        bouleversement: !!a.flags?.noc?.bouleversement
      })),
      nbSelection: selection.length,
      perditions: Object.entries(PERDITIONS).map(([cle, d]) => ({ cle, label: d.label, reduction: d.reduction?.label })),
      reductions: this.reductions,
      fiel: etatFiel(),
      effetsFiel: (CONFIG.NOC.effetsFiel ?? []).map(e => ({ nom: e.name, description: e.description, connu: !!EFFETS_FIEL[e.name] }))
    };
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    const html = this.element;
    html.querySelectorAll("input.cible").forEach(c => c.addEventListener("change", ev => {
      const id = ev.currentTarget.dataset.actorId;
      if (ev.currentTarget.checked) this.cibles.add(id); else this.cibles.delete(id);
    }));
    html.querySelector("input.reductions")?.addEventListener("change", ev => { this.reductions = ev.currentTarget.checked; });
  }

  /** Acteurs ciblés : cochés, plus les jetons sélectionnés si demandé */
  _cibles() {
    const acteurs = [...(this.cibles ?? [])].map(id => game.actors.get(id)).filter(Boolean);
    const avecSelection = this.element.querySelector("input.avec-selection")?.checked;
    if (avecSelection) {
      for (const t of canvas?.tokens?.controlled ?? []) if (t.actor && !acteurs.includes(t.actor)) acteurs.push(t.actor);
    }
    if (!acteurs.length) ui.notifications.warn("Aucun personnage ciblé.");
    return acteurs;
  }

  _valeur(perdition) {
    return nombre(this.element.querySelector(`input.points[data-perdition="${perdition}"]`)?.value);
  }

  static async #onInfliger(event, target) { return this._perditions(target.dataset.perdition, false); }
  static async #onSoigner(event, target) { return this._perditions(target.dataset.perdition, true); }

  async _perditions(perdition, soigner) {
    const points = this._valeur(perdition);
    if (!points) return ui.notifications.warn("Indiquez un nombre de points.");
    const lignes = [];
    for (const a of this._cibles()) lignes.push(await modifierPerdition(a, perdition, points, { soigner, reduire: this.reductions }));
    if (!lignes.length) return;
    await message(`${soigner ? "Soins" : "Perdition"} : ${PERDITIONS[perdition].label} ${soigner ? "−" : "+"}${points}`, lignes);
    this.render();
  }

  static async #onFiel(event, target) {
    const delta = nombre(target.dataset.delta);
    const { avant, apres } = await fixerFiel(etatFiel().gouttes + delta);
    await message("Fiel", [`Gouttes : ${avant.gouttes} → ${apres.gouttes}`, `Menace : ${avant.menace} → ${apres.menace}`]);
    this.render();
  }

  static async #onEtapeMJ(event, target) {
    const etape = target.dataset.etape;
    const g = etatFiel().gouttes;
    const cible = { calme: g - 1, seance: g - 5, scenario: 0 }[etape];
    const titres = { calme: "Moment de calme", seance: "Début de séance", scenario: "Début de scénario" };
    const { avant, apres } = await fixerFiel(cible);
    await message(`${titres[etape]} (Loi)`, [`Gouttes : ${avant.gouttes} → ${apres.gouttes}`, `Menace : ${avant.menace} → ${apres.menace}`]);
    this.render();
  }

  static async #onEffetFiel(event, target) {
    const nom = target.dataset.effet;
    const def = EFFETS_FIEL[nom];
    const config = (CONFIG.NOC.effetsFiel ?? []).find(e => e.name === nom);
    const lignes = [];
    const acteurs = def?.cle === "coupDuSort" || def?.cle === "evenement" ? [] : this._cibles();
    if (def?.perdition) {
      for (const a of acteurs) lignes.push(await modifierPerdition(a, def.perdition, def.points, { reduire: this.reductions }));
    } else if (def?.cle === "fatigue") {
      for (const a of acteurs) {
        const espoir = nombre(a.system.reserves?.espoir?.value);
        if (espoir > 0) {
          await a.update({ "system.reserves.espoir.value": espoir - 1 });
          lignes.push(`${a.name} — Espoir : ${espoir} → ${espoir - 1}`);
        } else {
          await a.setFlag("noc", "fatigue", true);
          lignes.push(`${a.name} — fatigué : −1 à tous ses talents jusqu'au prochain moment de calme`);
        }
      }
    } else if (def?.cle === "bouleversement") {
      for (const a of acteurs) {
        await a.setFlag("noc", "bouleversement", true);
        lignes.push(`${a.name} — talents de Statut −1, contacts inaccessibles`);
      }
    }
    // effets de Fiel : message visible par tous
    await message(`Effet de Fiel : ${nom}`, lignes, { public: true, texte: config?.description ?? "" });
    this.render();
  }

  static async #onLeverEtat(event, target) {
    const etat = target.dataset.etat;
    const libelles = { fatigue: "Fatigue", bouleversement: "Bouleversement administratif" };
    const lignes = [];
    for (const a of this._cibles()) {
      if (a.flags?.noc?.[etat]) {
        await a.unsetFlag("noc", etat);
        lignes.push(a.name);
      }
    }
    await message(`${libelles[etat]} levé`, lignes.length ? lignes : ["Aucun personnage concerné"]);
    this.render();
  }

  static async #onToutCocher(event, target) {
    const tous = target.dataset.tous === "1";
    this.cibles = new Set(tous ? this._personnages().map(a => a.id) : []);
    this.render();
  }
}

/** Ouvre le panneau (MJ uniquement) */
export function ouvrirPanneauMJ() {
  if (!game.user.isGM) return ui.notifications.warn("Le panneau est réservé au MJ.");
  ui.nocPanneauMJ ??= new PanneauMJ();
  return ui.nocPanneauMJ.render({ force: true });
}

/** Bouton dans la barre d'outils des jetons (MJ uniquement) */
export function enregistrerBoutonPanneau() {
  Hooks.on("getSceneControlButtons", controls => {
    if (!game.user.isGM) return;
    const outil = {
      name: "nocPanneauMJ",
      title: "Panneau du MJ",
      icon: "fa-solid fa-sliders",
      button: true,
      visible: true,
      onChange: () => ouvrirPanneauMJ(),
      onClick: () => ouvrirPanneauMJ()
    };
    if (Array.isArray(controls)) {
      // ancien format (tableau)
      const jetons = controls.find(c => c.name === "token");
      jetons?.tools.push(outil);
    } else {
      const jetons = controls.tokens ?? controls.token;
      if (!jetons) return;
      outil.order = Object.keys(jetons.tools ?? {}).length;
      jetons.tools[outil.name] = outil;
    }
  });
}
