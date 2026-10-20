/**
 * Panneau du MJ : actions sur les personnages ciblés, le Fiel et la Menace.
 * Fenêtre réservée au MJ (ApplicationV2), ouverte depuis la barre d'outils.
 */

import { bibliotheque, effetParId, effetsActifs } from "./fiel/bibliotheque.mjs";
import { ouvrirBibliothequeFiel } from "./fiel/editeur-bibliotheque.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/** Perditions et talent qui en réduit l'effet (d'après le livre de base) */
export const PERDITIONS = {
  blessures: { label: "Blessures", reduction: null },
  trauma: { label: "Trauma", reduction: { domaine: "ame", talent: "folie", label: "Folie" } },
  noirceur: { label: "Noirceur", reduction: { domaine: "vie", talent: "lumiere", label: "Lumière" } },
  traque: { label: "Traque", reduction: { domaine: "statut", talent: "façade", label: "Façade" } }
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
/*  Effets de Fiel actifs par niveau de Menace   */
/* -------------------------------------------- */

async function enregistrerEffetsActifs(modifier) {
  const fiel = foundry.utils.deepClone(game.settings.get("noc", "compteurFiel") ?? {});
  fiel.effetActif = fiel.effetActif && typeof fiel.effetActif === "object" ? fiel.effetActif : {};
  modifier(fiel.effetActif);
  await game.settings.set("noc", "compteurFiel", fiel);
  if (ui.compteur) { ui.compteur.object = fiel; ui.compteur.render(true); }
  game.socketManager?.launchSocket("renderCompteur", {});
}

/** Arrête l'effet de Fiel d'un niveau de Menace */
export async function arreterEffet(niveau, raison = "") {
  const actif = effetsActifs().find(e => e.niveau === Number(niveau));
  if (!actif) return;
  await enregistrerEffetsActifs(liste => { delete liste[`niveau${niveau}`]; });
  await message(`Fin de l'effet de Fiel : ${actif.effet.nom}`, [], { public: true, texte: raison });
}

/** Arrête les effets dont le niveau dépasse la Menace actuelle */
export async function arreterEffetsAuDessus(menace) {
  for (const { niveau } of effetsActifs()) {
    if (niveau > menace) await arreterEffet(niveau, `La Menace est redescendue sous le niveau ${niveau}.`);
  }
}

/** Active un effet de la bibliothèque au niveau donné et applique ses effets immédiats */
export async function activerEffet(niveau, effet, heros) {
  if (effetsActifs().some(e => e.niveau === Number(niveau))) await arreterEffet(niveau, "Remplacé par un nouvel effet.");
  const copie = foundry.utils.deepClone(effet);
  await enregistrerEffetsActifs(liste => {
    liste[`niveau${niveau}`] = {
      id: `niveau${niveau}`, niveau: Number(niveau), name: `${copie.nom} (Menace ${niveau})`,
      description: copie.description, gmNotes: copie.notes ?? "", effet: copie
    };
  });
  const lignes = [];
  for (const imm of copie.immediats ?? []) {
    if (imm.type === "perdition") {
      for (const a of heros) lignes.push(await modifierPerdition(a, imm.cle, Math.abs(nombre(imm.valeur)), { soigner: nombre(imm.valeur) < 0, reduire: imm.reduction !== false }));
    } else if (imm.type === "reserve") {
      for (const a of heros) {
        const r = a.system.reserves?.[imm.cle];
        if (!r) continue;
        const avant = nombre(r.value);
        const apres = Math.max(0, Math.min(nombre(r.max) || 10, avant + nombre(imm.valeur)));
        if (apres !== avant) await a.update({ [`system.reserves.${imm.cle}.value`]: apres });
        lignes.push(`${a.name} — ${r.label ?? imm.cle} : ${avant} → ${apres}`);
      }
    } else if (imm.type === "fatigue") {
      for (const a of heros) {
        const espoir = nombre(a.system.reserves?.espoir?.value);
        if (espoir > 0) {
          await a.update({ "system.reserves.espoir.value": espoir - 1 });
          lignes.push(`${a.name} — Espoir : ${espoir} → ${espoir - 1}`);
        } else {
          await a.setFlag("noc", "fatigue", true);
          lignes.push(`${a.name} — fatigué : −1 à tous ses talents jusqu'au prochain moment de calme`);
        }
      }
    } else if (imm.type === "cabale") {
      const cabales = new Map();
      for (const a of heros) for (const c of a.cabalesActeurs ?? []) cabales.set(c.id, c);
      for (const c of cabales.values()) {
        const p = c.system.perditions?.[imm.cle];
        if (!p) continue;
        const avant = nombre(p.value);
        const apres = Math.max(nombre(p.min), Math.min(nombre(p.max) || 10, avant + nombre(imm.valeur)));
        if (apres !== avant) await c.update({ [`system.perditions.${imm.cle}.value`]: apres });
        lignes.push(`${c.name} — ${p.label} : ${avant} → ${apres}`);
      }
    } else if (imm.type === "menace") {
      const { avant, apres } = await fixerFiel(etatFiel().gouttes + 5 * nombre(imm.valeur));
      lignes.push(`Menace : ${avant.menace} → ${apres.menace}`);
    }
  }
  await message(`Effet de Fiel (Menace ${niveau}) : ${copie.nom}`, lignes, { public: true, texte: copie.description });
  if (copie.notes) await message(`Notes pour la Loi : ${copie.nom}`, [copie.notes]);
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
    position: { width: 620, height: "auto" },
    actions: {
      infliger: PanneauMJ.#onInfliger,
      soigner: PanneauMJ.#onSoigner,
      points: PanneauMJ.#onPoints,
      fiel: PanneauMJ.#onFiel,
      tirerEffet: PanneauMJ.#onTirerEffet,
      appliquerEffet: PanneauMJ.#onAppliquerEffet,
      arreterEffet: PanneauMJ.#onArreterEffet,
      bibliotheque: () => ouvrirBibliothequeFiel(),
      leverEtat: PanneauMJ.#onLeverEtat,
      etapeMJ: PanneauMJ.#onEtapeMJ,
      toutCocher: PanneauMJ.#onToutCocher
    }
  };

  static PARTS = {
    main: { template: "systems/noc/templates/window_app/panneau-mj.hbs" }
  };

  /** uuid des acteurs cochés (par défaut : tous les personnages) */
  cibles = null;
  reductions = true;
  points = { blessures: 1, trauma: 1, noirceur: 1, traque: 1 };
  /** effet choisi (non encore appliqué) pour chaque niveau de Menace */
  choix = {};
  categorie = "";
  /** onglet affiché : "individus" ou "fiel" */
  onglet = "individus";

  _personnages() {
    return game.actors.filter(a => a.type === "personnage");
  }

  /**
   * Jetons de la scène affichée, hors personnages liés (déjà dans la première liste) :
   * PNJ non liés (même de type personnage), rouages, créatures, Autres.
   */
  _adversaires() {
    const vus = new Set();
    const liste = [];
    for (const t of canvas?.scene?.tokens ?? []) {
      const a = t.actor;
      if (!a || a.type === "cabale" || vus.has(a.uuid)) continue;
      if (a.type === "personnage" && t.actorLink) continue;
      vus.add(a.uuid);
      liste.push({ actor: a, nom: t.name || a.name, img: t.texture?.src || a.img });
    }
    return liste;
  }

  /** Données d'affichage d'une ligne de cible */
  _ligne(a, nom, img) {
    return {
      uuid: a.uuid, nom, img,
      coche: this.cibles.has(a.uuid),
      perditions: Object.keys(PERDITIONS).filter(k => a.system.perditions?.[k])
        .map(k => ({ label: PERDITIONS[k].label, valeur: nombre(a.system.perditions[k].value) })),
      fatigue: !!a.flags?.noc?.fatigue,
      bouleversement: !!a.flags?.noc?.bouleversement
    };
  }

  async _prepareContext() {
    const personnages = this._personnages();
    if (this.cibles === null) this.cibles = new Set(personnages.map(a => a.uuid));
    const fiel = etatFiel();
    const biblio = bibliotheque();
    const categories = [...new Set(biblio.map(e => e.categorie || "Sans catégorie"))];
    const actifs = effetsActifs();
    const niveaux = [];
    for (let n = 1; n <= 7; n++) {
      const actif = actifs.find(e => e.niveau === n)?.effet ?? null;
      const choisi = this.choix[n] ?? "";
      niveaux.push({
        niveau: n,
        atteint: fiel.menace >= n,
        actif: actif ? { nom: actif.nom, description: actif.description, notes: actif.notes } : null,
        choisi,
        groupes: categories.map(c => ({
          categorie: c,
          effets: biblio.filter(e => (e.categorie || "Sans catégorie") === c)
            .map(e => ({ id: e.id, nom: e.nom, selectionne: e.id === choisi }))
        }))
      });
    }
    return {
      personnages: personnages.map(a => this._ligne(a, a.name, a.img)),
      adversaires: this._adversaires().map(x => this._ligne(x.actor, x.nom, x.img)),
      perditions: Object.entries(PERDITIONS).map(([cle, d]) => ({ cle, label: d.label, reduction: d.reduction?.label, points: this.points[cle] ?? 1 })),
      reductions: this.reductions,
      fiel,
      niveaux,
      categories,
      categorie: this.categorie,
      onglet: this.onglet
    };
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    const html = this.element;
    html.querySelectorAll("input.cible").forEach(c => c.addEventListener("change", ev => {
      const id = ev.currentTarget.dataset.uuid;
      if (ev.currentTarget.checked) this.cibles.add(id); else this.cibles.delete(id);
    }));
    // onglets : bascule sans redessiner (les cases cochées restent en place)
    html.querySelectorAll("a.onglet-lien").forEach(lien => lien.addEventListener("click", ev => {
      this.onglet = ev.currentTarget.dataset.onglet;
      html.querySelectorAll("a.onglet-lien, div.onglet-mj").forEach(el =>
        el.classList.toggle("actif", el.dataset.onglet === this.onglet));
    }));
    html.querySelector("input.reductions")?.addEventListener("change", ev => { this.reductions = ev.currentTarget.checked; });
    html.querySelectorAll("select.choix-effet").forEach(sel => sel.addEventListener("change", ev => {
      this.choix[ev.currentTarget.dataset.niveau] = ev.currentTarget.value;
    }));
    html.querySelector("select.categorie-tirage")?.addEventListener("change", ev => { this.categorie = ev.currentTarget.value; });
  }

  /** Acteurs ciblés : ceux cochés dans les deux listes */
  _cibles({ avertir = true } = {}) {
    const acteurs = [...(this.cibles ?? [])].map(uuid => fromUuidSync(uuid)).filter(a => a?.system);
    if (!acteurs.length && avertir) ui.notifications.warn("Aucune cible cochée.");
    return acteurs;
  }

  static #onPoints(event, target) {
    const cle = target.dataset.perdition;
    this.points[cle] = Math.max(1, Math.min(10, (this.points[cle] ?? 1) + nombre(target.dataset.delta)));
    this.render();
  }

  static async #onInfliger(event, target) { return this._perditions(target.dataset.perdition, false); }
  static async #onSoigner(event, target) { return this._perditions(target.dataset.perdition, true); }

  async _perditions(perdition, soigner) {
    const points = this.points[perdition] ?? 1;
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

  static #onTirerEffet(event, target) {
    const n = target.dataset.niveau;
    const candidats = bibliotheque().filter(e => !this.categorie || (e.categorie || "Sans catégorie") === this.categorie);
    if (!candidats.length) return ui.notifications.warn("Aucun effet dans cette catégorie.");
    const effet = candidats[Math.floor(Math.random() * candidats.length)];
    this.choix[n] = effet.id;
    this.render();
  }

  static async #onAppliquerEffet(event, target) {
    const n = Number(target.dataset.niveau);
    const effet = effetParId(this.choix[n]);
    if (!effet) return ui.notifications.warn("Choisissez ou tirez d'abord un effet.");
    const heros = this._cibles({ avertir: false }).filter(a => a.type === "personnage");
    await activerEffet(n, effet, heros);
    delete this.choix[n];
    this.render();
  }

  static async #onArreterEffet(event, target) {
    await arreterEffet(Number(target.dataset.niveau), "Arrêté par la Loi.");
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
    const groupe = target.dataset.groupe === "adversaires"
      ? this._adversaires().map(x => x.actor.uuid) : this._personnages().map(a => a.uuid);
    for (const uuid of groupe) { if (tous) this.cibles.add(uuid); else this.cibles.delete(uuid); }
    this.render();
  }
}

/** Ouvre le panneau (MJ uniquement) */
export function ouvrirPanneauMJ() {
  if (!game.user.isGM) return ui.notifications.warn("Le panneau est réservé au MJ.");
  ui.nocPanneauMJ ??= new PanneauMJ();
  return ui.nocPanneauMJ.render({ force: true });
}

/** Le MJ arrête automatiquement les effets au-dessus de la Menace quand elle baisse */
export function enregistrerSuiviMenace() {
  // ligne d'une cible dans le panneau (personnage ou adversaire)
  Handlebars.registerPartial("ligneCibleMJ", `<label class="cible-ligne">
        <input type="checkbox" class="cible" data-uuid="{{uuid}}" {{#if coche}}checked{{/if}}>
        <img src="{{img}}" alt="">
        <span class="nom">{{nom}}</span>
        <span class="resume">{{#each perditions as |x|}}{{x.label}} {{x.valeur}}{{#unless @last}} · {{/unless}}{{/each}}</span>
        {{#if fatigue}}<span class="etat" data-tooltip="Fatigué : −1 à tous les talents">fatigué</span>{{/if}}
        {{#if bouleversement}}<span class="etat" data-tooltip="Bouleversement administratif">bouleversé</span>{{/if}}
      </label>`);
  // la liste des cibles suit la scène et les jetons
  const rafraichir = () => { if (ui.nocPanneauMJ?.rendered) ui.nocPanneauMJ.render(); };
  for (const h of ["canvasReady", "createToken", "deleteToken", "updateToken", "updateActor"]) Hooks.on(h, rafraichir);
  Hooks.on("updatedFiel", async () => {
    if (!game.user.isGM) return;
    await arreterEffetsAuDessus(etatFiel().menace);
    if (ui.nocPanneauMJ?.rendered) ui.nocPanneauMJ.render();
  });
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
