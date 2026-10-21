/**
 * Éditeur de la bibliothèque des effets de Fiel (MJ uniquement).
 */
import { bibliotheque, enregistrerBibliotheque, EFFETS_FIEL_DEFAUT, listeTalents, nouvelEffet } from "./bibliotheque.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

const TYPES_IMMEDIATS = {
  perdition: { label: "Perdition", cles: { blessures: "Blessures", trauma: "Trauma", noirceur: "Noirceur", traque: "Traque" } },
  reserve: { label: "Réserve", cles: { espoir: "Espoir", vecu: "Vécu", singularite: "Singularité" } },
  menace: { label: "Menace", cles: {} },
  cabale: { label: "Cabale (perdition)", cles: { blessures: "Dégradation", traque: "Traque", noirceur: "Noirceur", trauma: "Division" } },
  fatigue: { label: "Fatigue (Espoir −1 ou fatigué)", cles: {} }
};
const PORTEES = { tous: "Tous les personnages", heros: "Héros seulement", rouages: "Rouages seulement" };

export class EditeurBibliothequeFiel extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "noc-bibliotheque-fiel",
    classes: ["noc", "bibliotheque-fiel"],
    window: { title: "Bibliothèque des effets de Fiel", icon: "fa-solid fa-book", resizable: true },
    position: { width: 900, height: 700 },
    actions: {
      choisir: EditeurBibliothequeFiel.#onChoisir,
      ajouter: EditeurBibliothequeFiel.#onAjouter,
      dupliquer: EditeurBibliothequeFiel.#onDupliquer,
      supprimer: EditeurBibliothequeFiel.#onSupprimer,
      ajouterModificateur: EditeurBibliothequeFiel.#onAjouterModificateur,
      ajouterImmediat: EditeurBibliothequeFiel.#onAjouterImmediat,
      retirerLigne: EditeurBibliothequeFiel.#onRetirerLigne,
      enregistrer: EditeurBibliothequeFiel.#onEnregistrer,
      retablir: EditeurBibliothequeFiel.#onRetablir
    }
  };

  static PARTS = {
    main: { template: "systems/noc/templates/window_app/bibliotheque-fiel.hbs" }
  };

  liste = null;
  selection = null;
  modifie = false;

  async _prepareContext() {
    this.liste ??= foundry.utils.deepClone(bibliotheque());
    this.selection ??= this.liste[0]?.id ?? null;
    const categories = [...new Set(this.liste.map(e => e.categorie || "Sans catégorie"))];
    const effet = this.liste.find(e => e.id === this.selection) ?? null;
    return {
      modifie: this.modifie,
      groupes: categories.map(c => ({
        categorie: c,
        effets: this.liste.filter(e => (e.categorie || "Sans catégorie") === c)
          .map(e => ({ id: e.id, nom: e.nom, actif: e.id === this.selection }))
      })),
      categories,
      effet,
      talents: listeTalents(),
      portees: PORTEES,
      types: TYPES_IMMEDIATS,
      modificateurs: (effet?.modificateurs ?? []).map((mod, i) => ({ ...mod, index: i })),
      immediats: (effet?.immediats ?? []).map((imm, i) => ({
        ...imm, index: i, cles: TYPES_IMMEDIATS[imm.type]?.cles ?? {},
        avecCle: Object.keys(TYPES_IMMEDIATS[imm.type]?.cles ?? {}).length > 0,
        avecValeur: imm.type !== "fatigue",
        avecReduction: imm.type === "perdition"
      }))
    };
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    // toute modification d'un champ met à jour la copie de travail
    this.element.querySelectorAll(".edition [data-champ]").forEach(el => {
      el.addEventListener("change", () => {
        this._lireFormulaire();
        // changer de type d'effet immédiat modifie les champs proposés
        if (el.dataset.champ === "type" || el.dataset.champ === "categorie" || el.dataset.champ === "nom") this.render();
      });
    });
  }

  _effet() {
    return this.liste.find(e => e.id === this.selection) ?? null;
  }

  /** Recopie le formulaire d'édition dans l'effet sélectionné */
  _lireFormulaire() {
    const effet = this._effet();
    if (!effet) return;
    const zone = this.element.querySelector(".edition");
    const val = sel => zone.querySelector(sel);
    effet.nom = val('[data-champ="nom"]').value.trim() || "Sans nom";
    effet.categorie = val('[data-champ="categorie"]').value.trim() || "Sans catégorie";
    effet.description = val('[data-champ="description"]').value;
    effet.notes = val('[data-champ="notes"]').value;
    effet.aggravations = {};
    zone.querySelectorAll('[data-champ="aggravation"]').forEach(c => { if (c.checked) effet.aggravations[c.dataset.cle] = true; });
    effet.modificateurs = [...zone.querySelectorAll(".ligne-modificateur")].map(l => ({
      talent: l.querySelector('[data-champ="talent"]').value,
      valeur: Number(l.querySelector('[data-champ="valeur"]').value) || 0,
      portee: l.querySelector('[data-champ="portee"]').value
    }));
    effet.immediats = [...zone.querySelectorAll(".ligne-immediat")].map(l => {
      const type = l.querySelector('[data-champ="type"]').value;
      const cles = Object.keys(TYPES_IMMEDIATS[type]?.cles ?? {});
      const cleChamp = l.querySelector('[data-champ="cle"]')?.value;
      return {
        type,
        cle: cles.includes(cleChamp) ? cleChamp : (cles[0] ?? ""),
        valeur: Number(l.querySelector('[data-champ="valeur"]')?.value) || 0,
        reduction: !!l.querySelector('[data-champ="reduction"]')?.checked
      };
    });
    this.modifie = true;
  }

  static #onChoisir(event, target) {
    this._lireFormulaire();
    this.selection = target.dataset.id;
    this.render();
  }

  static #onAjouter() {
    this._lireFormulaire();
    const e = nouvelEffet();
    this.liste.push(e);
    this.selection = e.id;
    this.modifie = true;
    this.render();
  }

  static #onDupliquer() {
    this._lireFormulaire();
    const source = this._effet();
    if (!source) return;
    const copie = foundry.utils.deepClone(source);
    copie.id = foundry.utils.randomID();
    copie.nom = `${source.nom} (copie)`;
    this.liste.push(copie);
    this.selection = copie.id;
    this.modifie = true;
    this.render();
  }

  static async #onSupprimer() {
    const effet = this._effet();
    if (!effet) return;
    const ok = await DialogV2.confirm({ window: { title: "Supprimer un effet" }, content: `<p>Supprimer « ${effet.nom} » de la bibliothèque ?</p>` });
    if (!ok) return;
    this.liste = this.liste.filter(e => e.id !== effet.id);
    this.selection = this.liste[0]?.id ?? null;
    this.modifie = true;
    this.render();
  }

  static #onAjouterModificateur() {
    this._lireFormulaire();
    this._effet()?.modificateurs.push({ talent: "action.combat", valeur: -1, portee: "tous" });
    this.render();
  }

  static #onAjouterImmediat() {
    this._lireFormulaire();
    this._effet()?.immediats.push({ type: "perdition", cle: "blessures", valeur: 1, reduction: true });
    this.render();
  }

  static #onRetirerLigne(event, target) {
    this._lireFormulaire();
    const effet = this._effet();
    const liste = target.dataset.liste;
    effet?.[liste]?.splice(Number(target.dataset.index), 1);
    this.render();
  }

  static async #onEnregistrer() {
    this._lireFormulaire();
    await enregistrerBibliotheque(this.liste);
    this.modifie = false;
    ui.notifications.info("Bibliothèque des effets de Fiel enregistrée.");
    this.render();
  }

  static async #onRetablir() {
    const ok = await DialogV2.confirm({
      window: { title: "Rétablir la liste par défaut" },
      content: "<p>Remplacer toute la bibliothèque par la liste par défaut ? Les effets ajoutés ou modifiés seront perdus.</p>"
    });
    if (!ok) return;
    this.liste = foundry.utils.deepClone(EFFETS_FIEL_DEFAUT);
    this.selection = this.liste[0]?.id ?? null;
    await enregistrerBibliotheque(this.liste);
    this.modifie = false;
    this.render();
  }
}

export function ouvrirBibliothequeFiel() {
  if (!game.user.isGM) return ui.notifications.warn("La bibliothèque est réservée au MJ.");
  ui.nocBibliothequeFiel ??= new EditeurBibliothequeFiel();
  ui.nocBibliothequeFiel.liste = null;
  return ui.nocBibliothequeFiel.render({ force: true });
}
