/**
 * Repères sur la signification des niveaux de talent (personnages et rouages).
 *
 * Résumés rédigés pour l'aide de jeu à partir du livre de base de NOC :
 * chapitre « Domaines et talents » (niveaux -1 à 4 et plus) et
 * « Effets des talents à haut niveau » (niveaux 6 et 7).
 * Ce ne sont pas des citations : pour le texte complet, se reporter au livre.
 *
 * Clés de niveau : "-1", "0", "1", "2", "3", "4" (4 et 5), "6" (6 et plus).
 */
export const NIVEAUX_TALENTS = {
  erudition: {
    bureau: {
      "-1": "Ignore tout de l'Administration ; sans doute venu de la campagne.",
      "0": "Sait où obtenir ses tickets et qui solliciter (ou éviter).",
      "1": "Connaît quelques lois du Bloc et les formulaires peu courants.",
      "2": "Connaît les services, les formulaires rares et les raccourcis administratifs.",
      "3": "Exploite les failles de l'Administration et repère la plupart des faux.",
      "4": "Connaît des lois oubliées mais toujours valables, capables de sauver quelqu'un.",
      "6": "Sent où se cache une information ; ses faux, même grossiers, passent pour vrais."
    },
    culture: {
      "-1": "Sans éducation de base ; lit avec grande peine.",
      "0": "Connaît les Blocs voisins, l'actualité récente et la propagande courante.",
      "1": "Notions de géographie mondiale et d'histoire des dernières décennies.",
      "2": "Détails sur les Blocs voisins et l'histoire du siècle passé.",
      "3": "Détails sur des Blocs lointains, jusqu'à l'arrivée de l'Artefact.",
      "4": "Entrevoit des vérités sur le monde d'avant l'Artefact.",
      "6": "Accède à des faits lointains ou cachés, démêle le vrai de la propagande ; mesure aussi la connaissance de la Gnose."
    },
    recherche: {
      "-1": "Distrait et désordonné, se perd dans les détails.",
      "0": "Trouve l'évident, sans faire de recoupements.",
      "1": "Remarque les petits détails, fait quelques recoupements, trouve les objets bien cachés.",
      "2": "Relie présences, absences et ensemble pour en tirer de vraies conclusions.",
      "3": "Trouve ce qui est bien dissimulé ; analyse traces, matières et motifs.",
      "4": "Conclut à partir de presque rien : graphologie, logique, physionomie.",
      "6": "Perçoit les preuves et « voit » le passé d'un lieu en visions fugaces."
    },
    societe: {
      "-1": "Ne connaît même pas les grandes figures du Bloc.",
      "0": "Connaît les figures de son quartier et les grands événements.",
      "1": "Connaît les puissants, les bonnes et mauvaises adresses, les rendez-vous discrets.",
      "2": "Connaît les seconds couteaux, l'envers des versions officielles et les ragots.",
      "3": "Connaît tout le gratin et quelques secrets des gens importants.",
      "4": "Sait tout sur tout le monde ; connaît la ville par cœur.",
      "6": "Pressent les grands événements du Bloc et se trouve toujours là où il faut."
    }
  },
  technique: {
    artefact: {
      "-1": "Craint l'Objet-Dieu ; Singularité vide ; les grandes manifestations de l'Artefact lui infligent du Trauma.",
      "0": "Distingue tout juste un Mécanisme d'un Grand Mécanisme ; Singularité vide.",
      "1": "Prévoit certains comportements de l'Artefact ; Singularité 2.",
      "2": "Lit l'Artefact (Brumes, Faisceaux, Mécanismes) et s'oriente à la Matière noire ; Singularité 3.",
      "3": "S'oriente dans les Axes, trouve des raccourcis, réveille des mécanismes ; Singularité 4.",
      "4": "Plus à l'aise dans les Axes qu'au grand air ; l'Artefact semble l'aider ; Singularité 5.",
      "6": "L'Artefact réagit à ce qui lui arrive ; Singularité 5 ; 3 points de Singularité pour baisser la Menace de 1."
    },
    artisanat: {
      "-1": "Maladroit de ses mains ; planter un clou est déjà un défi.",
      "0": "Bricole tant bien que mal et rafistole des objets simples.",
      "1": "Habile ; diagnostique les pannes courantes et produit un travail correct.",
      "2": "Réalise des ouvrages solides et de qualité.",
      "3": "Crée des pièces fines ou ingénieuses.",
      "4": "Maître de son art : chefs-d'œuvre et innovations.",
      "6": "Inspiré : peut créer des Merveilles (2 points de Progression par création, lors d'un intermède)."
    },
    ingenierie: {
      "-1": "Les machines et les sciences lui échappent totalement.",
      "0": "Comprend le principe d'un moteur sans pouvoir le démonter ; démuni face au quantique.",
      "1": "Entretient une machine simple ; bases de physique et de chimie.",
      "2": "Répare la plupart des moteurs et les engins quantiques.",
      "3": "Conçoit des machines et des appareils quantiques ; à sa place au Progrès.",
      "4": "Maîtrise des ensembles complexes et comprend les Orbes quantiques.",
      "6": "Reçoit des révélations sur les lois de l'univers : peut créer des Prodiges (2 points de Progression)."
    },
    survie: {
      "-1": "Perdu hors du centre-ville, incapable de se débrouiller dehors.",
      "0": "Se repère s'il dispose de bons repères.",
      "1": "Petits pièges, feu, repérage des ruines dangereuses.",
      "2": "S'oriente sur les reliefs de l'Artefact, chasse, trouve eau et abri.",
      "3": "Aussi à l'aise en périphérie qu'en ville ; plantes, abris, raccourcis des Hypogées.",
      "4": "Réagit aux urgences, connaît les remèdes rares, lien empathique avec les éléments.",
      "6": "En osmose avec la nature ; les animaux l'aident (faveurs à l'écart des villes)."
    }
  },
  action: {
    combat: {
      "-1": "Paniqué par la violence, le sang ou les armes.",
      "0": "Ne sait pas se battre ; coups maladroits.",
      "1": "Frappe fort et garde son sang-froid ; n'a sans doute jamais tué.",
      "2": "Combat avec technique ; habitué à la violence et aux armes.",
      "3": "Combattant d'élite, tueur professionnel ou soldat d'exception.",
      "4": "Virtuose qui domine le champ de bataille.",
      "6": "Un dieu de la guerre aux prouesses surhumaines."
    },
    constitution: {
      "-1": "Frêle ; peine à soulever quelques kilos.",
      "0": "Carrure moyenne : porte environ 30 kg, soulève environ 50 kg.",
      "1": "Costaud : porte environ 50 kg, soulève environ 100 kg.",
      "2": "Très costaud : porte un homme, soulève environ 200 kg ; encaisse bien.",
      "3": "Colosse : porte environ 100 kg, soulève environ 300 kg ; les coups glissent sur lui.",
      "4": "Parmi les plus forts du monde : soulève environ 400 kg ; presque insensible à la douleur.",
      "6": "Force légendaire : un homme sur chaque épaule, soulève un cheval."
    },
    deplacement: {
      "-1": "Performances physiques très faibles ; s'épuise vite ; jamais discret.",
      "0": "Moins de 15 s au cent mètres ; discret s'il avance lentement.",
      "1": "Bonne forme : moins de 13 s ; trompe un garde attentif en allant lentement.",
      "2": "Athlète : moins de 12 s ; échappe à l'ouïe d'un garde sur ses gardes.",
      "3": "Athlète rare : moins de 11 s ; effort d'une demi-journée.",
      "4": "Champion : moins de 10 s ; mouvements félins et imperceptibles.",
      "6": "Prouesses surhumaines, ne s'épuise jamais ; deux actions annexes par tour."
    },
    instinct: {
      "-1": "Rate souvent l'évidence.",
      "0": "Vigilant seulement face à un danger manifeste.",
      "1": "Attentif, aux sens aiguisés.",
      "2": "Toujours sur ses gardes ; difficile à surprendre.",
      "3": "Sixième sens : relie indices ténus et danger imminent.",
      "4": "Pressent le danger avant que ses sens ne le perçoivent.",
      "6": "Son instinct lui révèle aussi la nature du danger ou du détail."
    }
  },
  statut: {
    contact: {
      "-1": "Un ennemi plutôt que des contacts ; commence avec une séquelle de Traque.",
      "0": "Personne de bien placé ; réserve de Faveur vide.",
      "1": "Petit réseau ; 2 points de Faveur.",
      "2": "Réseau solide et varié ; 4 points de Faveur.",
      "3": "Au centre d'un maillage de réseaux ; 6 points de Faveur.",
      "4": "Gravite autour de nombreux groupes ; 8 points de Faveur (10 au niveau 5).",
      "6": "Ses contacts deviennent une cohorte de fidèles ; regagne 2 points de Faveur à chaque scène."
    },
    "façade": {
      "-1": "Casier chargé ou apparence suspecte.",
      "0": "Citoyen ordinaire, bien connu et bien fiché.",
      "1": "Passe inaperçu ; cache ses traces et son domicile.",
      "2": "Paranoïaque : identités multiples, planque cachée, informateurs.",
      "3": "Une ombre : dossier remplacé, planque truffée de pièges.",
      "4": "Invisible : identité effacée, faux papiers en quelques heures.",
      "6": "Le destin le protège : impossible de remonter jusqu'à lui, sauf grossière erreur."
    },
    fortune: {
      "-1": "Pauvre, logement misérable, retard de loyer.",
      "0": "Classe moyenne, loisirs simples.",
      "1": "Aisé : logement en ville, véhicule, petites vacances.",
      "2": "Riche : belle maison, domestiques, résidence secondaire.",
      "3": "Très riche : hôtel particulier, plusieurs résidences, collection d'art.",
      "4": "Immeubles, domaine privé, véhicule permettant de quitter le Bloc ; mécène.",
      "6": "Héritier d'un héritage mythique que le Dédale lui révèle peu à peu."
    },
    rang: {
      "-1": "Paria ou Sans-Rang, méprisé de tous.",
      "0": "Aucun statut particulier.",
      "1": "Un peu d'autorité dans le cadre de sa fonction.",
      "2": "Grade important, le bras long.",
      "3": "Autorité qui dépasse sa fonction et impressionne tous les inférieurs.",
      "4": "Influence dans toutes les strates de la société.",
      "6": "Autorité naturelle à laquelle les créatures de rang inférieur obéissent."
    }
  },
  ame: {
    extase: {
      "-1": "Aucun exutoire ; lui ou un allié regagne 1 point d'Espoir de moins au calme.",
      "0": "Une famille ou un loisir pour décompresser.",
      "1": "Une passion ou un vice qui égaie ses jours.",
      "2": "Une passion dévorante ou une addiction, véritable exutoire.",
      "3": "Plusieurs sources d'Extase.",
      "4": "Des moyens hors du commun de se couper du monde.",
      "6": "Irradie une aura qui fait de lui un havre, même en enfer."
    },
    folie: {
      "-1": "Esprit vulnérable aux chocs.",
      "0": "Habitué à la dureté du monde, sans avoir vécu l'horreur.",
      "1": "A traversé une épreuve marquante qui l'a endurci.",
      "2": "Vit avec ses démons.",
      "3": "Vit selon ses propres valeurs ; seul l'extrême l'atteint.",
      "4": "Regard détaché sur les drames humains.",
      "6": "Puise de la force dans l'horreur : +1 à tous ses Domaines s'il a 3 points de Trauma ou plus."
    },
    sensibilite: {
      "-1": "Totalement fermé à l'invisible et aux impressions d'autrui.",
      "0": "Peu réceptif ; œuvres médiocres.",
      "1": "Inspiré ; saisit le sens caché d'une œuvre, pressent les grands changements.",
      "2": "Ses œuvres émeuvent ; ressent émotions et ambiances.",
      "3": "Bouleverse une foule ; lit un artiste à travers ses œuvres.",
      "4": "Chefs-d'œuvre ; perçoit les moindres nuances ; sent d'où vient la Noirceur.",
      "6": "Voit littéralement l'invisible : auras de Noirceur, voix qui révèlent le sens caché."
    },
    tenebres: {
      "-1": "Victime née ; ses tentatives d'intimidation font rire.",
      "0": "Humain ordinaire aux yeux des Autres.",
      "1": "Impressionne un peu ; les Autres hésitent à le tuer.",
      "2": "Inspire la crainte ; les Autres veulent l'attirer dans un Axe.",
      "3": "Inquiète les plus endurcis ; respecté des Autres.",
      "4": "Âme écrasante ; même les Autres le craignent.",
      "6": "Son aura protège ses alliés proches ; les ténèbres l'aident."
    }
  },
  social: {
    charisme: {
      "-1": "Repoussant ; on écourte toute rencontre.",
      "0": "Banal ; peine à convaincre des inconnus.",
      "1": "Sympathique ; obtient de petits avantages.",
      "2": "Séduisant et convaincant ; atténue les préjugés.",
      "3": "Fascinant ; on cherche à lui plaire.",
      "4": "Subjugue : on commet de petites folies pour lui.",
      "6": "Emprise émotionnelle durable sur ses interlocuteurs."
    },
    conviction: {
      "-1": "Faible ; cède vite à la peur.",
      "0": "A des convictions, mais ne se met pas en danger pour elles.",
      "1": "Des principes qui le protègent des tentations ordinaires.",
      "2": "Très déterminé, entraîné à résister à la pression.",
      "3": "Incarne sa mission ; presque rien ne compte davantage.",
      "4": "Rien ne le fera plier.",
      "6": "Ses alliés qui partagent sa mission gagnent +1 en Conviction."
    },
    psychologie: {
      "-1": "Aucune empathie ; se méprend souvent sur autrui.",
      "0": "Devine l'effet d'une situation forte sur les gens.",
      "1": "Empathique ; prévoit la plupart des réactions.",
      "2": "Repère des signes émotionnels qui échappent aux autres.",
      "3": "Dresse des profils à partir des signes paraverbaux.",
      "4": "Décrypte une personne comme une machine : désirs, secrets.",
      "6": "Visions et certitudes sur le passé, les désirs et les peurs d'un sujet."
    },
    tromperie: {
      "-1": "Incapable de mentir sans se trahir.",
      "0": "Nerveux quand il ment ; mensonges fragiles.",
      "1": "Arrange la vérité, mais se trahit si l'enjeu monte.",
      "2": "Professionnel du faux-semblant, tient un rôle des heures.",
      "3": "Contrôle ses réactions physiques ; trompe les détecteurs.",
      "4": "Si crédible que les autres renforcent ses mensonges.",
      "6": "Le hasard confirme ses dires ; ses mensonges altèrent les perceptions."
    }
  },
  vie: {
    apaisement: {
      "-1": "Cynique ou maladroit : un Héros regagne 1 point de Trauma de moins au calme.",
      "0": "Démuni face à la détresse d'autrui.",
      "1": "À l'écoute ; trouve les mots qui soulagent.",
      "2": "Maîtrise des techniques pour apaiser les esprits.",
      "3": "Aide à surmonter un traumatisme grave.",
      "4": "Guérit les plaies de l'âme en partageant la souffrance.",
      "6": "Avatar de la Matriarche : 1 point d'Espoir pour guérir une séquelle de Trauma."
    },
    ferveur: {
      "-1": "A baissé les bras ; Espoir 1.",
      "0": "Vaillant mais se décourage ; Espoir 3.",
      "1": "Croit en la victoire, élan communicatif ; Espoir 5.",
      "2": "Vit pour la victoire de son camp ; Espoir 7.",
      "3": "Émissaire de la victoire à venir ; Espoir 9.",
      "4": "Prophète de sa cause ; Espoir 10 ; ses points d'Espoir donnent autant de dés de destin que sa Ferveur.",
      "6": "Peut Donner de l'espoir à ses alliés quelle que soit la distance."
    },
    lumiere: {
      "-1": "Âme vacillante, terrain fertile pour l'envahisseur.",
      "0": "Des failles où les ténèbres peuvent germer.",
      "1": "Reste vertueux et secourable.",
      "2": "Consacre sa vie à combattre l'état de siège.",
      "3": "Croisé de la Lumière, rempart contre la Noirceur.",
      "4": "Phare dans la nuit ; les Autres l'évitent.",
      "6": "Brasier : les Autres dans son aura subissent 1 point de Blessures par round."
    },
    soins: {
      "-1": "Phobie du sang ou remèdes douteux.",
      "0": "Remèdes de grand-mère seulement.",
      "1": "Soigne les blessures et affections modérées.",
      "2": "Soigne les blessures et affections sérieuses.",
      "3": "Soigne les blessures et affections graves.",
      "4": "Soigne les blessures et affections critiques, même en conditions extrêmes.",
      "6": "Compréhension innée du corps : 1 point d'Espoir pour guérir une séquelle de Blessures."
    }
  }
};

/** Description du niveau d'un talent, ou "" si inconnue */
export function descriptionNiveauTalent(domaine, talent, niveau) {
  const t = NIVEAUX_TALENTS[domaine]?.[talent];
  if (!t) return "";
  const n = Number(niveau) || 0;
  const cle = n <= -1 ? "-1" : n >= 6 ? "6" : n >= 4 ? "4" : String(n);
  const intitule = cle === "6" ? "Niveau 6 et plus" : cle === "4" ? "Niveau 4-5" : `Niveau ${cle}`;
  return `${intitule} : ${t[cle]}`;
}
