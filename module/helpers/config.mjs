export const NOC = {};

NOC.effetsFiel = [
  {
    name: "Bouleversement administratif",
    description: "La démence frappe une nouvelle fois l’Administration.Des services sont fusionnés ou supprimés, des formulaires invalidés ou ajoutés, des personnels sont mutés.Les Talents du Domaine Statut des Héros sont diminués de 1 pour le prochain cycle.Le personnage ne peut pas recourir à ses Contacts durant cette période."
  },
  {
    name: "Coup du sort",
    description: "à force de provoquer le destin, celui-ci se venge.Que le niveau du personnage soit suffisant ou pas pour accomplir l’action, cette dernière échoue de façon totale, critique, et met le personnage en grande difficulté."
  },
  {
    name: "Événement inattendu",
    description: "dans certaines situations,la Loi ou le scénario peuvent prévoir un effet néfaste spécifique.Il se déclenche alors."
  },
  {
    name: "Fatigue",
    description: "la fatigue se fait sentir. Tous les Héros et leurs alliés perdent 1 point d’Espoir.Un personnage dont la réserve d’Espoir est déjà à 0 devient fatigué et souffre d’un malus de 1 à tous ses Talents tant qu’il n’aura pas passé un moment de calme(voir p. 234)."
  },
  {
    name: "Intervention de l’Artefact",
    description: " comme s’il était attiré par l’action des Héros, l’Artefact se manifeste: un Faisceau balaye le ciel, la Brume se lève, les éclairages quantiques vacillent, un Mécanisme se produit… Chaque Héros subit 2 points de Noirceur.Pour chaque niveau que le Héros possède dans le Talent Lumière, il peut diminuer de 1 la perte subie par lui ou par un autre personnage se trouvant dans son Aura (voir p. 248). L’effet des Talents Lumière de plusieurs personnages peut se cumuler."
  },
  {
    name: "Tension",
    description: "le stress sape la volonté des personnages. Chaque Héros subit 2 points de Trauma, moins son niveau dans le Talent Folie."
  },
  {
    name: "Traque",
    description: "dans les coulisses, la Direction de la Sécurité commence à se poser des questions sur les agissements des personnages.Chaque Héros reçoit 2 points de Traque, moins son niveau dans le Talent Façade."
  }
];
NOC.traitsItems = {
  choc: {
    name: "choc",
    value: null,
    description: "la cible ne subit pas de Blessures mais compare son niveau de Constitution aux dégâts de l’arme. S’il est supérieur ou égal, elle perd l’Action principale de son prochain tour. S’il est inférieur, elle tombe inconsciente durant 3 rounds"
  },
  complexe: {
    name: "complexe",
    value: null,
    description: " le talent de Combat du personnage est diminué de 2 si ce type d’arme ne figure pas dans ceux désignés comme maîtrisés pour son Talent Combat."
  },
  contrainte: {
    name: "contrainte",
    value: 1,
    description: ": la cible ne subit aucun dégât mais à son prochain tour, elle devra confronter sa Constitution à la valeur X avant chaque action. Si elle échoue, elle ne peut pas réaliser l’action et celle-ci est perdue."
  },
  encombrant: {
    name: "encombrant",
    value: null,
    description: "le personnage subit un malus de 1 à son Talent Déplacement."
  },
  energieNoire: {
    name: "énergie noire",
    value: 1,
    description: "l’arme inflige X points de Blessures supplémentaires à la cible. Ces dégâts sont diminués par le niveau de Talent Lumière de cette dernière et de tous ses alliés à portée d’aura (voir p. 248), jusqu’à un minimum de 0."
  },
  limite: {
    name: "limité",
    value: 1,
    description: "si l’objet ne fait pas partie des dotations professionnelles du personnage, son Rang doit être supé- rieur ou égal à X pour qu’il ait le droit de le posséder et de le porter."

  },
  long: {
    name: "long",
    value: null,
    description: "un personnage utilisant une arme longue et affrontant au corps-à-corps un adversaire n’ayant pas lui-même d’arme longue peut relancer les dés n’ayant pas donné un résultat de 1 à ses jets d’attaque et de parade lors du premier tour de combat."
  },
  longuePortee: {
    name: "longue portée",
    value: null,
    description: " les malus dus à la portée ne s’ap- pliquent qu’au double des distances normales, et au qua- druple pour une arme à Très longue portée."
  },
  multiple: {
    name: "multiple",
    value: 2,
    description: "l’arme touche X fois.La première touche inflige autant de points de Blessures que les dégâts de l’arme, la seconde inflige un point de moins, la troi- sième deux points de moins, etc.Si le niveau des Blessures infligées descend ainsi en dessous de 1, les touches supplémentaires sont ignorées.Dans le cas des armes à feu, la première touche doit être affectée à la cible prin - cipale de l’attaque.Les suivantes peuvent être allouées à la même cible ou à toutes cibles situées à moins de X mètres de la première.Si les cibles secondaires disposent d’un couvert, les dommages sont diminués de la valeur de ce dernier.Les dégâts supplémentaires obtenus par l’effet de marge de réussite Précision ne s’appliquent qu’à la première blessure.Rappel : l’effet Étendue de la marge de réussite(voir p. 232) permet d’augmenter la valeur X du trait Multiple lors d’une attaque."
  },
  perforant: {
    name: "perforant",
    value: null,
    description: " si l’attaque est réussie, l’arme inflige au minimum 2 points de Blessures à une cible sans armure, même si sa Constitution réduit les dégâts à 1 ou moins."
  },
  quantique: {
    name: "quantique",
    value: 1,
    description: " lorsque la cible est touchée, l’attaquant doit lancer X dés de destin (qui peuvent générer des gouttes de Fiel). Les succès s’additionnent aux dégâts. Ces dégâts sont diminués par le niveau de Talent Lumière de la cible et de tous ses alliés à portée d’aura (voir p. 248), jusqu’à un minimum de 0. "
  },
  recurrent: {
    name: "récurrent",
    value: null,
    description: "un personnage touché et subissant au moins 1 point de Blessures par l’attaque d’une arme récur- rente doit consacrer son Action principale à s’en débarras- ser par tout moyen approprié (eau ou couverture pour du feu, par exemple), sous peine de subir des points de Bles- sures égaux à ceux subis au tour précédent (du fait de la source de dégâts récurrents) majorés de 1."
  },
  tranchant: {
    name: "tranchant",
    value: null,
    description: " si l’attaque est réussie, l’arme inflige au minimum 1 point de Blessures à une cible sans armure, même si sa Constitution réduit les dégâts à 0 ou moins."
  }
};
NOC.compteur2Step = [0, 0, 0, 0, 0, 5, 5, 5, 8, 8, 10, 10, 10, 10, 10, 10, 10];
NOC.effetsPerditions = {
  blessures: {
    0: {
      label: "",
      seuil: 0,
      deleteEffects: ["perdition-blessure5", "perdition-blessure8", "perdition-blessure10"]
    },
    5: {
      seuil: 5,
      effect: "malusDomaine",
      deleteEffects: ["perdition-blessure8", "perdition-blessure10"],
      flag: "perdition-blessure5",
      label: "Blessé",
      description: `Dès qu’il a subi 5 points de Blessures, le personnage souffre d’un malus de 1 à tous ses niveaux de Domaine.`
    },
    8: {
      seuil: 8,
      effect: "malusTalent",
      deleteEffects: ["perdition-blessure10"],
      flag: "perdition-blessure8",
      sequelle: true,
      label: "Lourdement blessé",
      description: `Si un personnage cumule 8 points de Blessures, il
est lourdement blessé. Il subit un malus de 1 à tous ses
niveaux de Talent. De plus, il gardera des séquelles de cet
événement : l’un de ses points de Blessures devient permanent
et ne pourra pas être soigné.`
    },
    10: {
      seuil: 10,
      label: "Agonisant",
      description: `Si un personnage cumule 10 points de Blessures, il
agonise. Il meurt au bout de dix minutes s’il n’est pas
soigné.`
    }
  },
  trauma: {
    0: {
      label: "",
      seuil: 0,
      deleteEffects: ["perdition-trauma5", "perdition-trauma8", "perdition-trauma10"]
    },
    5: {
      seuil: 5,
      label: "choqué",
      effect: "malusDomaine",
      deleteEffects: ["perdition-trauma8", "perdition-trauma10"],
      flag: "perdition-trauma5",
      description: `Dès qu’un personnage a subi 5 points de Trauma, il est
Choqué. Son état de stress est tel qu’il influe sur ses performances
et sur sa lucidité. Il souffre d’un malus de 1 à
tous ses niveaux de Domaine.`
    },
    8: {
      seuil: 8,
      label: "traumatisé",
      effect: "malusTalent",
      deleteEffects: ["perdition-trauma10"],
      flag: "perdition-trauma8",
      sequelle: true,
      description: `Dès qu’il a subi 8 points de Trauma, le personnage est
Traumatisé. Il souffre d’un malus de 1 à tous ses niveaux
de Talent. De plus, il gardera des séquelles de cet événement
: l’un de ses points de Trauma devient permanent et
ne pourra pas être soigné.`
    },
    10: {
      label: "fou",
      effect: "malusTalent",
      flag: "perdition-trauma10",
      description: `Si un personnage cumule 10 points de Trauma, il
devient Fou. Il tombe en catatonie durant le reste de la
scène. Passé ce cap, son traumatisme est tel qu’il ne sera
plus jouable. Il est définitivement perdu.`
    }
  },
  traque: {
    5: {
      label: "signalé",
      description: `les patrouilles ont le signalement du personnage
qui sera arrêté en cas de contrôle.`
    },
    8: {
      label: "recherché",
      description: `Lorsqu’il a cumulé 8 points de Traque, le personnage est
recherché. Il gardera des séquelles de cet événement :
l’un de ses points de Traque devient permanent et ne
pourra pas être retiré. De plus, il gagne le trait Criminel`
    },
    10: {
      label: "pourchassé",
      description: `Lorsqu’il a cumulé 10 points de Traque, le personnage
est pourchassé. De plus, il gagne le trait Ennemi public.`
    }
  },
  noirceur: {
    5: {
      label: "teinté",
      description: `Lorsqu’il a cumulé 5 points de Noirceur, le personnage
est Teinté. Il doit choisir un trait de noirceur.`
    },
    8: {
      label: "possédé",
      description: `Lorsqu’il a cumulé 8 points de Noirceur, il est Possédé.
De plus, il gardera des séquelles de cet événement : l’un
de ses points de Noirceur devient permanent et ne pourra
pas être soigné. Il doit choisir un trait de noirceur.`

    },
    10: {
      label: "corrompu",
      description: `Lorsqu’il a cumulé 10 points de Noirceur, il est
Corrompu. La Loi en prend le contrôle (à moins que
le joueur n’accepte de jouer ce rôle jusqu’au bout). Le
corrompu fera tout pour rallier un Axe le plus rapidement
possible. S’il y parvient, il disparaît dans l’Artefact
à tout jamais. Il doit choisir un trait de noirceur.`
    }
  },
}
NOC.traitsPerditions = {
  criminel: {
    label: "criminel",
    description: `le personnage est activement recherché. Des
investigateurs se rendent à son travail, interrogent son
entourage, etc.Une équipe du Bureau des Investigations
se met à sa poursuite.`
  },
  ennemi_public: {
    label: "ennemi public",
    description: `le personnage est l’ennemi numéro 1
du Bloc. Des patrouilles sillonnent la ville à sa recherche.
Ses proches et ses collègues sont surveillés. Certains,
violentés ou arrêtés. Son domicile est fouillé sans ménagement.
Cinq équipes du Bureau des Investigations le
recherchent.`
  },
  violence: {
    label: "violence",
    description: `le personnage ne peut pas arrêter un
combat tant qu’il n’a pas occasionné la perte d’au moins
3 points de Blessures à un ennemi (à moins qu’il ne soit
neutralisé avant).`
  }
  ,
  malaise: {
    label: "malaise",
    description: `le personnage est victime de malaises et
nausées. Il a l’impression que son corps est parasité. Lorsqu’il
est victime de n’importe quel effet du Fiel, il perd
un point d’Espoir additionnel. S’il n’en a plus, il devient
Fatigué et subit un niveau de malus à tous ses Talents
jusqu’à ce qu’il bénéficie d’un moment de calme (voir
p. 234).`
  }
  ,
  hallucinations: {
    label: "hallucinations",
    description: `le personnage est victime d’hallucinations.
Il voit des choses terrifiantes qui n’existent pas. Il
entend des voix, sent des choses qui le touchent, perçoit
des odeurs putrides. Lorsqu’il est victime de n’importe
quel effet du Fiel, il subit un point de Trauma additionnel.`
  }
  ,
  mauvais_penchants: {
    label: "mauvais penchants",
    description: `le personnage ne régénère plus
sa jauge d’Espoir qu’en s’adonnant à ses vices. Lors de
chaque moment de calme (voir p. 234), s’il désire recharger
ses réserves ou soigner des points de Blessures, Trauma ou
Noirceur, il doit recevoir un point de Traque.`
  }

}


