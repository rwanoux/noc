/**
 * Armes : type (contact / distance), dégâts, munitions et traits.
 *
 * - system.adistance : false = Contact, true = Distance
 * - system.degatsBase : dégâts chiffrés ; au contact, ils s'ajoutent à la Constitution
 * - system.traitsArme : cases à cocher (et valeur X pour les traits chiffrés)
 * Les champs historiques system.degats (formule) et system.traits (texte) sont
 * recalculés à partir de ces données, pour les jets et l'affichage.
 */

/** Traits d'arme : libellé, trait chiffré ou non, explication (d'après le livre de base) */
export const TRAITS_ARMES = {
  choc: {
    label: "Choc", chiffre: false,
    description: "La cible ne subit pas de Blessures : elle compare son niveau de Constitution aux dégâts de l'arme. S'il est supérieur ou égal, elle perd l'Action principale de son prochain tour ; s'il est inférieur, elle sombre dans l'inconscience pendant 3 rounds."
  },
  complexe: {
    label: "Complexe", chiffre: false,
    description: "Si ce type d'arme ne fait pas partie de ceux que le personnage maîtrise en Combat, son talent Combat est réduit de 2 pour l'utiliser."
  },
  long: {
    label: "Long", chiffre: false,
    description: "Face à un adversaire au corps-à-corps qui n'a pas lui-même d'arme longue, le personnage peut relancer, au premier tour de combat, les dés de ses jets d'attaque et de parade qui n'ont pas donné 1."
  },
  perforant: {
    label: "Perforant", chiffre: false,
    description: "Une attaque réussie inflige au moins 2 points de Blessures à une cible sans armure, même si sa Constitution ramène les dégâts à 1 ou moins."
  },
  longuePortee: {
    label: "Longue portée", chiffre: false,
    description: "Les malus de portée ne s'appliquent qu'à partir du double des distances normales (et du quadruple pour une arme à Très longue portée)."
  },
  recurrent: {
    label: "Récurrent", chiffre: false,
    description: "Une cible touchée qui subit au moins 1 point de Blessures doit consacrer son Action principale à se débarrasser de la source (eau ou couverture contre le feu, par exemple) ; sinon elle subit à nouveau les Blessures du tour précédent, plus 1."
  },
  tranchant: {
    label: "Tranchant", chiffre: false,
    description: "Une attaque réussie inflige au moins 1 point de Blessures à une cible sans armure, même si sa Constitution ramène les dégâts à 0 ou moins."
  },
  contrainte: {
    label: "Contrainte", chiffre: true,
    description: "La cible ne subit aucun dégât, mais lors de son prochain tour elle doit opposer sa Constitution à la valeur X avant chaque action ; en cas d'échec, l'action est perdue."
  },
  energieNoire: {
    label: "Énergie noire", chiffre: true,
    description: "L'arme inflige X points de Blessures supplémentaires, réduits par le talent Lumière de la cible et de ses alliés à portée d'aura (minimum 0)."
  },
  multiple: {
    label: "Multiple", chiffre: true,
    description: "L'arme touche X fois : la première touche inflige les dégâts de l'arme, chaque touche suivante 1 point de moins ; les touches qui tomberaient sous 1 sont ignorées. Avec une arme à feu, la première touche vise la cible principale, les suivantes peuvent viser des cibles à moins de X mètres (dégâts réduits par leur couvert). Les dégâts bonus de Précision ne s'appliquent qu'à la première touche ; l'effet Étendue peut augmenter X."
  },
  quantique: {
    label: "Quantique", chiffre: true,
    description: "Quand la cible est touchée, l'attaquant lance X dés de destin (pouvant produire des gouttes de Fiel) ; leurs succès s'ajoutent aux dégâts, réduits par le talent Lumière de la cible et de ses alliés à portée d'aura (minimum 0)."
  }
};

const CONSTITUTION = "@talents.action.constitution.niveau";

export function traitsArmeVides() {
  const t = {};
  for (const [cle, def] of Object.entries(TRAITS_ARMES)) t[cle] = def.chiffre ? { actif: false, valeur: 0 } : false;
  return t;
}

/** Texte lisible des traits, ex. "Perforant, Multiple (2)" */
export function texteTraits(traitsArme) {
  const parties = [];
  for (const [cle, def] of Object.entries(TRAITS_ARMES)) {
    const t = traitsArme?.[cle];
    if (def.chiffre ? t?.actif : t) parties.push(def.chiffre ? `${def.label} (${Number(t.valeur) || 0})` : def.label);
  }
  return parties.join(", ");
}

/** Recalcule la formule de dégâts et le texte des traits (à la préparation de l'objet) */
export function deriverArme(item) {
  const s = item.system;
  if (!s.formatV2) return;
  const n = Number(s.degatsBase) || 0;
  s.degats = s.adistance ? `${n}` : `${CONSTITUTION} + ${n}`;
  s.traits = texteTraits(s.traitsArme);
}

/**
 * Lecture de l'ancien format (formule et texte libre) → nouvelles données.
 * constitution : pour une arme de contact dont les dégâts étaient un nombre fixe
 * (attaque naturelle de créature), la part de Constitution est déduite.
 */
export function conversionArme(src, constitution = null) {
  const sys = src.system ?? src;
  const texte = String(sys.traits ?? "");
  const traitsArme = traitsArmeVides();
  for (const [cle, def] of Object.entries(TRAITS_ARMES)) {
    const motif = def.label.normalize("NFD").replace(/[̀-ͯ]/g, "");
    const re = new RegExp(motif.replace(/ /g, "\\s+") + (def.chiffre ? "\\s*(?:\\(\\s*(\\d+)\\s*\\))?" : ""), "i");
    const m = re.exec(texte.normalize("NFD").replace(/[̀-ͯ]/g, ""));
    if (!m) continue;
    // « Long » ne doit pas être confondu avec « Longue portée »
    if (cle === "long" && /^longue/i.test(texte.normalize("NFD").replace(/[̀-ͯ]/g, "").slice(m.index))) {
      const autre = /(^|[^a-z])long([^a-z]|$)/i.exec(texte.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/longue\s+portee/ig, ""));
      if (!autre) continue;
    }
    traitsArme[cle] = def.chiffre ? { actif: true, valeur: Number(m[1]) || 0 } : true;
  }
  const limite = /limit[ée]e?\s*\(\s*(\d+)\s*\)/i.exec(texte);
  const degats = String(sys.degats ?? "");
  const nombre = /(-?\d+)\s*$/.exec(degats.trim());
  return {
    "system.formatV2": true,
    "system.degatsBase": (() => {
      const n = nombre ? Number(nombre[1]) : 0;
      const fixe = /^\s*-?\d+\s*$/.test(degats);
      return (fixe && !sys.adistance && constitution !== null) ? n - (Number(constitution) || 0) : n;
    })(),
    "system.traitsArme": traitsArme,
    "system.limite": limite ? Number(limite[1]) : (Number(sys.limite) || 0)
  };
}

/* -------------------------------------------- */
/*  Conversion des armes existantes              */
/* -------------------------------------------- */

export const VERSION_MIGRATION_ARMES = 2;

/** Version 2 : valeur par défaut des traits chiffrés à 0 (au lieu de 1) pour les traits non cochés */
function majValeursParDefaut(item) {
  if (item.type !== "arme" || !item._source.system.formatV2) return null;
  const maj = {};
  for (const [cle, def] of Object.entries(TRAITS_ARMES)) {
    const t = item._source.system.traitsArme?.[cle];
    if (def.chiffre && t && !t.actif && Number(t.valeur) === 1) maj[`system.traitsArme.${cle}.valeur`] = 0;
  }
  return Object.keys(maj).length ? { _id: item.id, ...maj } : null;
}

function majArme(item) {
  if (item.type !== "arme") return null;
  if (item._source.system.formatV2) return majValeursParDefaut(item);
  const constitution = item.parent?.type === "creature"
    ? item.parent._source.system?.talents?.action?.constitution?.niveau ?? 0 : null;
  return { _id: item.id, ...conversionArme(item._source, constitution) };
}

export async function migrerArmes() {
  if (!game.user.isGM) return;
  if ((game.settings.get("noc", "migrationArmes") ?? 0) >= VERSION_MIGRATION_ARMES) return;
  const erreurs = [];
  try {
    const maj = game.items.map(majArme).filter(Boolean);
    if (maj.length) await Item.updateDocuments(maj);
  } catch (e) { erreurs.push("objets du monde"); console.error("NOC | conversion armes", e); }
  for (const actor of game.actors) {
    try {
      const maj = actor.items.map(majArme).filter(Boolean);
      if (maj.length) await actor.updateEmbeddedDocuments("Item", maj);
    } catch (e) { erreurs.push(actor.name); console.error("NOC | conversion armes", actor.name, e); }
  }
  if (erreurs.length) {
    ui.notifications.error(`NOC : conversion des armes incomplète pour ${erreurs.join(", ")}. Voir la console (F12).`, { permanent: true });
    return;
  }
  await game.settings.set("noc", "migrationArmes", VERSION_MIGRATION_ARMES);
}
