/**
 * Bibliothèque des effets de Fiel.
 *
 * Un effet :
 * {
 *   id, nom, categorie, description,
 *   modificateurs: [{ talent: "action.deplacement", valeur: -1, portee: "tous" | "heros" | "rouages" }],
 *   immediats:     [{ type: "perdition"|"reserve"|"menace"|"cabale"|"fatigue", cle, valeur, reduction }],
 *   aggravations:  { blessures, trauma, noirceur, traque },   // +1 quand un héros en subit au moins 1
 *   notes: "effet à gérer à la main"
 * }
 * La bibliothèque est enregistrée dans le monde (réglage noc.bibliothequeFiel) ;
 * tant qu'elle n'a pas été modifiée, la liste par défaut ci-dessous est utilisée.
 * Les effets actifs sont enregistrés par niveau de Menace dans noc.compteurFiel.effetActif.
 */

const m = (talent, valeur = -1, portee = "tous") => ({ talent, valeur, portee });
const tous = (...talents) => talents.map(t => m(t));

/** Descriptions reformulées (livre de base et liste d'effets de Fiel fournie par le MJ) */
export const EFFETS_FIEL_DEFAUT = [
  // --- Livre de base
  { id: "lb-bouleversement", nom: "Bouleversement administratif", categorie: "Livre de base",
    description: "L'Administration est frappée de démence : services fusionnés ou supprimés, formulaires invalidés, personnels mutés. Les talents de Statut des Héros sont réduits de 1 pour le prochain cycle, et ils ne peuvent pas faire appel à leurs Contacts.",
    modificateurs: [m("statut.contact", -1, "heros"), m("statut.façade", -1, "heros"), m("statut.fortune", -1, "heros"), m("statut.rang", -1, "heros")],
    immediats: [], aggravations: {}, notes: "Contacts inutilisables pendant le cycle." },
  { id: "lb-coup-du-sort", nom: "Coup du sort", categorie: "Livre de base",
    description: "À force de défier le destin, il se venge : l'action échoue de façon totale et critique, quel que soit le niveau du personnage, et le met en grande difficulté.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "À appliquer sur l'action en cours." },
  { id: "lb-evenement", nom: "Événement inattendu", categorie: "Livre de base",
    description: "La Loi ou le scénario peuvent prévoir ici un effet néfaste particulier, qui se déclenche.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Effet propre au scénario." },
  { id: "lb-fatigue", nom: "Fatigue", categorie: "Livre de base",
    description: "La fatigue se fait sentir : les Héros et leurs alliés perdent 1 point d'Espoir. Celui dont la réserve d'Espoir est déjà vide devient fatigué (−1 à tous ses talents) jusqu'à son prochain moment de calme.",
    modificateurs: [], immediats: [{ type: "fatigue" }], aggravations: {}, notes: "" },
  { id: "lb-artefact", nom: "Intervention de l'Artefact", categorie: "Livre de base",
    description: "Comme attiré par l'action des Héros, l'Artefact se manifeste (Faisceau, Brume, lumières quantiques qui vacillent, Mécanisme…). Chaque Héros subit 2 points de Noirceur, réduits de 1 par niveau de Lumière (le sien ou celui d'un allié dont il est dans l'aura).",
    modificateurs: [], immediats: [{ type: "perdition", cle: "noirceur", valeur: 2, reduction: true }], aggravations: {}, notes: "" },
  { id: "lb-tension", nom: "Tension", categorie: "Livre de base",
    description: "Le stress use la volonté : chaque Héros subit 2 points de Trauma, moins son niveau de Folie.",
    modificateurs: [], immediats: [{ type: "perdition", cle: "trauma", valeur: 2, reduction: true }], aggravations: {}, notes: "" },
  { id: "lb-traque", nom: "Traque", categorie: "Livre de base",
    description: "Dans l'ombre, la Direction de la Sécurité s'intéresse aux agissements des Héros : chacun reçoit 2 points de Traque, moins son niveau de Façade.",
    modificateurs: [], immediats: [{ type: "perdition", cle: "traque", valeur: 2, reduction: true }], aggravations: {}, notes: "" },

  // --- Action
  { id: "ac-citadelle", nom: "La Citadelle", categorie: "Action",
    description: "La Garde est en alerte : les patrouilles doublent, les soldats deviennent durs et soupçonneux, la population s'inquiète. Tous les personnages subissent −1 en Façade, et en Déplacement pour se déplacer discrètement.",
    modificateurs: tous("statut.façade"), immediats: [], aggravations: {}, notes: "−1 en Déplacement pour les déplacements furtifs (à appliquer à la main)." },
  { id: "ac-bete", nom: "La Bête", categorie: "Action",
    description: "L'agressivité gagne les esprits ; banlieues et faubourgs s'embrasent, les règlements de comptes se multiplient. Les Rouages opposés aux Héros gagnent +1 en Constitution.",
    modificateurs: [m("action.constitution", 1, "rouages")], immediats: [], aggravations: {}, notes: "Le bonus s'applique à tous les Rouages : l'ignorer pour les alliés." },
  { id: "ac-predateur", nom: "Le Prédateur", categorie: "Action",
    description: "Une pluie grasse trouble les sens et les ténèbres s'épaississent. Tous les personnages subissent −1 en Instinct.",
    modificateurs: tous("action.instinct"), immediats: [], aggravations: {}, notes: "" },
  { id: "ac-boucher", nom: "Le Boucher", categorie: "Action",
    description: "Un vent de haine souffle : crimes violents en hausse, bandes et fous en chasse. Quand les Héros et leurs alliés subissent au moins 1 point de Blessures, ils en reçoivent 1 de plus.",
    modificateurs: [], immediats: [], aggravations: { blessures: true }, notes: "" },

  // --- Statut
  { id: "st-piege", nom: "Le Piège", categorie: "Statut",
    description: "D'antiques forces des ténèbres guettent les moindres gestes des Héros ; dehors, l'Artefact se déchaîne. La Menace augmente de 1.",
    modificateurs: [], immediats: [{ type: "menace", valeur: 1 }], aggravations: {}, notes: "" },
  { id: "st-pacte", nom: "Le Pacte", categorie: "Statut",
    description: "L'influence de l'envahisseur atteint les Héros : quelques minutes durant, du Fiel pur coule dans leurs veines, comme l'averse qui s'abat sur le quartier. Les Héros subissent une séquelle de Noirceur.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Séquelle de Noirceur à appliquer à chaque Héros." },
  { id: "st-chasse", nom: "La Chasse", categorie: "Statut",
    description: "L'œil de l'envahisseur se pose sur les Héros ; les forces du mal resserrent leur étau et les agents du Bureau quadrillent les rues. Rester à l'air libre inflige 1 point de Traque par heure.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "1 point de Traque par heure passée à l'air libre." },
  { id: "st-cerbere", nom: "Le Cerbère", categorie: "Statut",
    description: "Les ombres vacillent, un grondement traverse l'espace et le temps : les Autres attaquent la ville. Un Autre traque les Héros et attaquera avant la fin du quart en cours ; sa classe Exo est égale au niveau de Menace actuel.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Préparer un Autre de classe Exo = Menace." },

  // --- Technique
  { id: "te-mecanisme", nom: "Le Mécanisme", categorie: "Technique",
    description: "Les réorganisations à la surface de l'Artefact s'accélèrent ; les hommes sont mal à l'aise, les animaux terrifiés. Tous les personnages subissent −1 en Artefact et en Ingénierie ; les Héros perdent 1 point de Singularité.",
    modificateurs: tous("technique.artefact", "technique.ingenierie"), immediats: [{ type: "reserve", cle: "singularite", valeur: -1 }], aggravations: {}, notes: "" },
  { id: "te-mystere", nom: "Le Mystère", categorie: "Technique",
    description: "Les savants du Progrès font de la ville leur laboratoire et installent leurs machines dans les rues, sous la garde des Gardes Noirs. Les dés de destin produisent du Fiel sur 1 ou 2.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Fiel sur 1 ou 2 aux dés de destin (à compter à la main)." },
  { id: "te-entropie", nom: "L'Entropie", categorie: "Technique",
    description: "La vétusté gagne tout : fissures, incendies, machines à l'arrêt. Tous les personnages subissent −1 en Artisanat et en Survie.",
    modificateurs: tous("technique.artisanat", "technique.survie"), immediats: [], aggravations: {}, notes: "" },
  { id: "te-souillure", nom: "La Souillure", categorie: "Technique",
    description: "Fumées d'usine, eaux empoisonnées, petites secousses qui font couler le Fiel. Il faut deux fois plus de temps pour bénéficier d'un moment de calme.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Durée des moments de calme doublée." },

  // --- Social
  { id: "so-emprise", nom: "L'Emprise", categorie: "Social",
    description: "Haut-parleurs et crieurs de la Voie appellent à la vigilance contre les opposants ; la dénonciation sera récompensée. Tous les personnages subissent −1 en Charisme et en Tromperie.",
    modificateurs: tous("social.charisme", "social.tromperie"), immediats: [], aggravations: {}, notes: "" },
  { id: "so-rumeur", nom: "La Rumeur", categorie: "Social",
    description: "Le Bureau annonce qu'un tueur terrifiant rôde ; le récit de ses crimes lance des citoyens à sa poursuite. Quand les Héros et leurs alliés subissent au moins 1 point de Traque, ils en reçoivent 1 de plus.",
    modificateurs: [], immediats: [], aggravations: { traque: true }, notes: "" },
  { id: "so-delateur", nom: "Le Délateur", categorie: "Social",
    description: "La paranoïa s'installe, chacun surveille chacun et la Police Secrète se montre davantage. Tous les personnages subissent −1 en Psychologie et en Façade.",
    modificateurs: tous("social.psychologie", "statut.façade"), immediats: [], aggravations: {}, notes: "" },
  { id: "so-voie", nom: "La Voie", categorie: "Social",
    description: "Campagne de propagande : prêches de la Voie dans les haut-parleurs, appels à la communion sur les places. Tous les personnages subissent −1 en Conviction ; les Héros perdent 1 point de Faveur auprès d'un Contact.",
    modificateurs: tous("social.conviction"), immediats: [], aggravations: {}, notes: "Chaque Héros perd 1 point de Faveur auprès d'un Contact." },

  // --- Âme
  { id: "am-cauchemar", nom: "Le Cauchemar", categorie: "Âme",
    description: "La population fait des cauchemars à répétition : visages fatigués, humeur morose. Tous les personnages subissent −1 en Extase ; les Héros perdent 1 point d'Espoir.",
    modificateurs: tous("ame.extase"), immediats: [{ type: "reserve", cle: "espoir", valeur: -1 }], aggravations: {}, notes: "" },
  { id: "am-vent-noir", nom: "Le Vent Noir", categorie: "Âme",
    description: "Un vent strident semble monter des profondeurs de l'Artefact, porteur d'une mélopée malsaine. Tous les personnages subissent −1 en Folie ; rester à l'air libre inflige 1 point de Trauma par heure.",
    modificateurs: tous("ame.folie"), immediats: [], aggravations: {}, notes: "1 point de Trauma par heure passée à l'air libre." },
  { id: "am-demons", nom: "Les Démons", categorie: "Âme",
    description: "Une épidémie de Noirceur frappe la ville ; les cas se multiplient et les pervertis passent à l'acte. Tous les personnages subissent −1 en Lumière ; rester à l'air libre inflige 1 point de Noirceur par heure.",
    modificateurs: tous("vie.lumiere"), immediats: [], aggravations: {}, notes: "1 point de Noirceur par heure passée à l'air libre." },
  { id: "am-spectres", nom: "Les Spectres", categorie: "Âme",
    description: "De vieux souvenirs pénibles hantent les citoyens ; les fantômes du passé s'imposent. Tous les personnages subissent −1 en Sensibilité ; quand les Héros et leurs alliés subissent au moins 1 point de Trauma, ils en reçoivent 1 de plus.",
    modificateurs: tous("ame.sensibilite"), immediats: [], aggravations: { trauma: true }, notes: "" },

  // --- Érudition
  { id: "er-brume", nom: "La Brume", categorie: "Érudition",
    description: "Une brume épaisse voile la vue et embrouille les esprits. Tous les personnages subissent −1 en Recherche.",
    modificateurs: tous("erudition.recherche"), immediats: [], aggravations: {}, notes: "" },
  { id: "er-neant", nom: "Le Néant", categorie: "Érudition",
    description: "Rêves étranges et visions de l'Artefact laissent la population alanguie au réveil. Dépenser un point de Vécu rapporte 1 dé de destin supplémentaire au lieu d'un succès.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "Vécu = 1 dé de destin au lieu d'un succès (à la main)." },
  { id: "er-sceau", nom: "Le Sceau", categorie: "Érudition",
    description: "Les censeurs du Bureau ferment bibliothèques, librairies et journaux. Tous les personnages subissent −1 en Culture, Bureau et Société.",
    modificateurs: tous("erudition.culture", "erudition.bureau", "erudition.societe"), immediats: [], aggravations: {}, notes: "" },
  { id: "er-anatheme", nom: "L'Anathème", categorie: "Érudition",
    description: "Les Vérificateurs de la Voie arrivent ; les détenteurs du savoir secret se cachent, certains sont pris. Tous les personnages subissent −1 en Culture ; les Héros reçoivent 1 point de Traque.",
    modificateurs: tous("erudition.culture"), immediats: [{ type: "perdition", cle: "traque", valeur: 1, reduction: false }], aggravations: {}, notes: "" },

  // --- Vie
  { id: "vi-glas", nom: "Le Glas", categorie: "Vie",
    description: "Un froid glacial ou une chaleur écrasante éprouve les organismes fragiles. Tous les personnages subissent −1 en Soins ; les Héros et leurs alliés récupèrent 1 point de Blessures de moins lors des moments de calme.",
    modificateurs: tous("vie.soins"), immediats: [], aggravations: {}, notes: "Récupération des Blessures réduite de 1 au calme." },
  { id: "vi-peste", nom: "La Peste", categorie: "Vie",
    description: "Une épidémie fulgurante emporte chaque jour des dizaines de victimes. Rester à l'air libre inflige 1 point de Blessures par heure.",
    modificateurs: [], immediats: [], aggravations: {}, notes: "1 point de Blessures par heure passée à l'air libre." },
  { id: "vi-declin", nom: "Le Déclin", categorie: "Vie",
    description: "L'humanité sombre : crimes, bassesses et cruauté remplissent les journaux. Tous les personnages subissent −1 en Lumière ; quand les Héros et leurs alliés subissent au moins 1 point de Noirceur, ils en reçoivent 1 de plus.",
    modificateurs: tous("vie.lumiere"), immediats: [], aggravations: { noirceur: true }, notes: "" },
  { id: "vi-abandon", nom: "L'Abandon", categorie: "Vie",
    description: "La dureté de la situation brise le moral : rues moroses, suicides en hausse. Tous les personnages subissent −1 en Apaisement et en Folie.",
    modificateurs: tous("vie.apaisement", "ame.folie"), immediats: [], aggravations: {}, notes: "" },

  // --- Lumière
  { id: "lu-union", nom: "L'Union", categorie: "Lumière",
    description: "Ce jour coïncide avec de nombreuses fêtes publiques et privées ; un vent de fraternité souffle. Les Héros gagnent 1 point d'Espoir et la Cabale perd 1 point de Division.",
    modificateurs: [], immediats: [{ type: "reserve", cle: "espoir", valeur: 1 }, { type: "cabale", cle: "trauma", valeur: -1 }], aggravations: {}, notes: "" },
  { id: "lu-amour", nom: "L'Amour", categorie: "Lumière",
    description: "Une véritable épiphanie amoureuse gagne la ville ; les couples se forment et se retrouvent. Les Héros gagnent 1 point d'Espoir et la Cabale perd 1 point de Division.",
    modificateurs: [], immediats: [{ type: "reserve", cle: "espoir", valeur: 1 }, { type: "cabale", cle: "trauma", valeur: -1 }], aggravations: {}, notes: "" },
  { id: "lu-lueur", nom: "La Lueur", categorie: "Lumière",
    description: "Un air de printemps redonne force, courage et joie à tout ce qui vit. Les Héros gagnent 1 point d'Espoir et la Cabale perd 1 point de Division.",
    modificateurs: [], immediats: [{ type: "reserve", cle: "espoir", valeur: 1 }, { type: "cabale", cle: "trauma", valeur: -1 }], aggravations: {}, notes: "" },
  { id: "lu-regain", nom: "Le Regain", categorie: "Lumière",
    description: "Les entreprises réussissent, la ville prospère et les stigmates du mal se referment lentement. Les Héros gagnent 1 point d'Espoir et la Cabale perd 1 point de Division.",
    modificateurs: [], immediats: [{ type: "reserve", cle: "espoir", valeur: 1 }, { type: "cabale", cle: "trauma", valeur: -1 }], aggravations: {}, notes: "" }
];

/* -------------------------------------------- */
/*  Accès à la bibliothèque et aux effets actifs */
/* -------------------------------------------- */

export function bibliotheque() {
  const enregistree = game.settings.get("noc", "bibliothequeFiel");
  return Array.isArray(enregistree) && enregistree.length ? enregistree : foundry.utils.deepClone(EFFETS_FIEL_DEFAUT);
}

export async function enregistrerBibliotheque(liste) {
  return game.settings.set("noc", "bibliothequeFiel", liste);
}

export function effetParId(id) {
  return bibliotheque().find(e => e.id === id) ?? null;
}

/** Effets actifs : [{ niveau, effet }] (l'effet est la copie figée au moment de l'activation) */
export function effetsActifs() {
  const fiel = game.settings.get("noc", "compteurFiel") ?? {};
  return Object.values(fiel.effetActif ?? {})
    .filter(e => e?.effet)
    .map(e => ({ niveau: Number(e.niveau) || 0, effet: e.effet }));
}

/* -------------------------------------------- */
/*  Effets permanents sur les acteurs            */
/* -------------------------------------------- */

function concerne(actor, portee) {
  if (portee === "heros") return actor.type === "personnage";
  if (portee === "rouages") return actor.type === "rouage";
  return ["personnage", "rouage", "autre", "creature"].includes(actor.type);
}

/** Malus et bonus de talents des effets de Fiel actifs (à la préparation de l'acteur) */
export function appliquerEffetsFiel(actor) {
  let actifs;
  try { actifs = effetsActifs(); } catch (e) { return; }
  if (!actifs.length) return;
  actor.overrides ??= {};
  for (const { effet } of actifs) {
    for (const mod of effet.modificateurs ?? []) {
      if (!concerne(actor, mod.portee)) continue;
      const [dom, tal] = String(mod.talent).split(".");
      const t = actor.system.talents?.[dom]?.[tal];
      if (!t) continue;
      t.niveau = (Number(t.niveau) || 0) + (Number(mod.valeur) || 0);
      foundry.utils.setProperty(actor.overrides, `system.talents.${dom}.${tal}.niveau`, t.niveau);
    }
  }
}

/** Perditions aggravées par les effets actifs ({ blessures: true, … }) */
export function aggravationsActives() {
  const res = {};
  try {
    for (const { effet } of effetsActifs()) {
      for (const [cle, actif] of Object.entries(effet.aggravations ?? {})) if (actif) res[cle] = true;
    }
  } catch (e) { /* réglages pas encore prêts */ }
  return res;
}

/** Talents proposés dans l'éditeur */
export function listeTalents() {
  const talents = game.system.template?.Actor?.personnage?.talents ?? {};
  return Object.entries(talents).map(([dom, liste]) => ({
    domaine: dom,
    talents: Object.entries(liste).map(([tal, t]) => ({ cle: `${dom}.${tal}`, label: t.label }))
  }));
}

export function nouvelEffet() {
  return {
    id: foundry.utils.randomID(), nom: "Nouvel effet", categorie: "Scénario", description: "",
    modificateurs: [], immediats: [], aggravations: {}, notes: ""
  };
}
