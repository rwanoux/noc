/**
 * Documents administratifs (formulaires du Bureau).
 *
 * Le type de formulaire (system.formulaire) détermine la description générale,
 * le Rang du document et les options propres au formulaire.
 * Les Niveaux de Bureau investis et le temps d'obtention sont recalculés à
 * l'affichage à partir des options choisies.
 * Textes : reformulations du livre de base (dépôt public).
 */

export const FORMULAIRES = {
  port: {
    label: "Autorisation de port",
    description: "Chaque bénéficiaire peut porter un objet doté du trait Limité (X), où X est égal au Rang du demandeur. L'objet est désigné au moment où le formulaire est établi."
  },
  acces: {
    label: "Autorisation d'accès",
    description: "Les bénéficiaires peuvent entrer dans une zone à accès limité, pour un motif déclaré. La visite reste cantonnée aux secteurs prévus et se déroule sous la surveillance de trois membres du personnel ou gardes. Le Rang requis dépend de la zone."
  },
  sortie: {
    label: "Autorisation de sortie",
    description: "Les bénéficiaires peuvent quitter une zone limitée, pour un motif déclaré, après les examens sanitaires obligatoires (un cycle de démarches). Le séjour dehors ne dépasse pas la durée du formulaire, sauf extension. Le Rang requis dépend de la zone."
  },
  requisition: {
    label: "Réquisition",
    description: "Le demandeur mobilise à son profit des ressources officielles : un objet ou un capital, un expert missionné par le Bureau, ou une escorte de Gardes Noirs. Ce qui est perdu ou abîmé, et tout comportement suspect observé, se paie en Traque."
  },
  mandat: {
    label: "Mandat d'investigation",
    description: "Les bénéficiaires peuvent enquêter sur un sujet précis dans un secteur du Bloc. Le mandat a un niveau d'autorité égal au Rang du demandeur : il oblige un citoyen de Rang inférieur à répondre aux questions, et permet de fouiller les affaires et le domicile d'un citoyen dont le Rang est inférieur d'au moins 2 à cette autorité."
  },
  signalement: {
    label: "Fiche de signalement",
    description: "Procédure contre un citoyen de Rang inférieur, qui sait qui le vise. Au bout d'un cycle, le demandeur et la cible confrontent leur Rang : le gagnant inflige une nuisance par succès de marge. Les autorités s'intéressent aussi au demandeur : sa Façade baisse de 1 en usage passif jusqu'à la fin de l'aventure."
  },
  autre: {
    label: "Autre document",
    description: "Document sans effet de règle particulier (certificat, carte, titre d'attribution…). Décrivez-le ci-dessous."
  }
};

export const ZONES_ACCES = {
  1: "Bureaux interdits au public",
  2: "Secteur aux données confidentielles",
  3: "Zone de quarantaine ou militaire",
  4: "Secteur aux données secrètes"
};

export const ZONES_SORTIE = {
  3: "Zone de quarantaine",
  4: "Sortie du Bloc"
};

export const DUREES_SORTIE = {
  formulaire: { label: "Durée du formulaire", rang: 0 },
  mois: { label: "Un mois (Rang +1)", rang: 1 },
  illimitee: { label: "Sans limite de durée (Rang +2)", rang: 2 }
};

export const MODES_REQUISITION = {
  objet: "Objet",
  capital: "Capital (fonds)",
  expert: "Expert",
  escorte: "Escorte"
};

export const NUISANCES = [
  { nom: "Surcharge de travail", texte: "1 Trauma et 1 Blessure par succès de marge investi." },
  { nom: "Interdiction", texte: "ne peut approcher un lieu, un objet ou une personne." },
  { nom: "Sanction professionnelle", texte: "Rang −1." },
  { nom: "Amende", texte: "Fortune −1." },
  { nom: "Signalé", texte: "Façade −1." },
  { nom: "Arrestation", texte: "2 succès minimum : interrogé un quart ; emprisonné un cycle (3), un mois (4) ou définitivement (5)." }
];

const nombre = v => Number(v) || 0;

/** Bénéficiaires sous forme de liste (l'ancien format était un simple texte) */
export function listeBeneficiaires(system) {
  const b = system?.beneficiaires;
  let liste = Array.isArray(b) ? [...b] : (typeof b === "string" && b ? [b] : []);
  liste = liste.map(x => String(x ?? ""));
  while (liste.length < 2) liste.push("");
  return liste;
}

/** Rang du héros qui porte le document (1 si le document n'a pas de porteur) */
export function rangDuPorteur(item) {
  const niveau = item.actor?.system?.talents?.statut?.rang?.niveau;
  return item.actor && niveau !== undefined ? nombre(niveau) : 1;
}

/** Tous les calculs affichés par la fiche */
export function calculerDocument(item) {
  const s = item.system;
  const type = FORMULAIRES[s.formulaire] ? s.formulaire : "autre";
  const beneficiaires = listeBeneficiaires(s);
  const rangBase = rangDuPorteur(item);
  const rangSup = nombre(s.rangSup);
  const rang = rangBase + rangSup;
  const duree = Math.max(1, nombre(s.duree) || 1);

  // Effets de Bureau : [libellé, niveaux]
  const effets = [];
  const ajouter = (label, niveaux) => { if (niveaux > 0) effets.push({ label, niveaux }); };
  ajouter(`Outrepasser son Rang (+${rangSup})`, 2 * rangSup);
  ajouter(`Durée (+${duree - 1} cycle${duree > 2 ? "s" : ""})`, duree - 1);
  ajouter(`Bénéficiaires (+${Math.max(0, beneficiaires.length - 2)})`, Math.max(0, beneficiaires.length - 2));

  const calc = { type, rangBase, rangSup, rang, duree, beneficiaires, porteur: !!item.actor };
  let rangDocument = rang;

  switch (type) {
    case "port": {
      const bonus = nombre(s.port?.bonusX);
      calc.limiteX = rang + bonus;
      ajouter(`Limité (X) +${bonus}`, bonus);
      break;
    }
    case "acces": {
      const zone = Math.min(4, Math.max(1, nombre(s.acces?.zone) || 1));
      rangDocument = zone;
      if (s.acces?.nonLimite) ajouter("Circulation non limitée à un secteur", 1);
      if (s.acces?.sansSurveillance) ajouter("Circulation sans surveillance", 2);
      break;
    }
    case "sortie": {
      const zone = nombre(s.sortie?.zone) === 4 ? 4 : 3;
      rangDocument = zone + (DUREES_SORTIE[s.sortie?.duree]?.rang ?? 0);
      if (s.sortie?.exoneration) ajouter("Exonération des examens de sortie", 1);
      break;
    }
    case "requisition": {
      calc.valeurMax = rang;
      calc.capital = rang + 1;
      calc.niveauExpert = rang + 1;
      calc.gardes = rang;
      break;
    }
    case "mandat": {
      const bonusA = nombre(s.mandat?.bonusAutorite);
      const bonusC = nombre(s.mandat?.bonusCitoyens);
      calc.autorite = rang + bonusA;
      calc.citoyens = 1 + bonusC;
      calc.rangInterrogation = calc.autorite - 1;
      calc.rangFouille = calc.autorite - 2;
      ajouter(`Niveau d'autorité +${bonusA}`, 2 * bonusA);
      ajouter(`Citoyens visés +${bonusC}`, bonusC);
      break;
    }
    case "signalement": {
      if (s.signalement?.bonusStatut) ajouter("+1 au Domaine Statut pour la confrontation", 1);
      if (s.signalement?.priseRapide) ajouter("Prise d'effet en un quart", 1);
      calc.delai = s.signalement?.priseRapide ? "un quart" : "un cycle";
      break;
    }
  }

  calc.formulaire = type !== "autre";
  calc.rangDocument = rangDocument;
  calc.rangInsuffisant = calc.formulaire && rang < rangDocument;
  calc.effets = effets;
  calc.niveauxBureau = effets.reduce((t, e) => t + e.niveaux, 0);
  calc.heures = 3 + 2 * effets.length;
  return calc;
}
