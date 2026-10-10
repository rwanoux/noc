/**
 * Repères sur la signification des niveaux de talent (personnages et rouages).
 *
 * Descriptions rédigées pour l'aide de jeu à partir du livre de base de NOC :
 * chapitre « Domaines et talents » (niveaux -1 à 4 et plus) et
 * « Effets des talents à haut niveau » (niveaux 6 et 7).
 * Ce sont des reformulations, pas des citations : pour le texte complet,
 * se reporter au livre.
 *
 * Clés de niveau : "-1", "0", "1", "2", "3", "4" (4 et 5), "6" (6 et plus).
 */
export const NIVEAUX_TALENTS = {
  erudition: {
    bureau: {
      "-1": "Le personnage ignore tout de l'Administration. Il vient sans doute d'une campagne reculée, là où le Bureau a moins d'emprise.",
      "0": "Il sait où se procurer ses tickets de rationnement, vers qui se tourner en cas de besoin et qui il vaut mieux ne pas importuner.",
      "1": "Il connaît certaines lois propres au Bloc et sait où se procurer, puis déposer, les formulaires peu courants.",
      "2": "Il connaît les différents services du Bureau, les formulaires rares, les raccourcis administratifs, les combines utiles et les zones floues de la loi.",
      "3": "Il maîtrise les failles du système, connaît les anciens formulaires et repère la plupart des faux documents.",
      "4": "Il connaît des lois anciennes et oubliées, mais toujours applicables, qui peuvent sortir quelqu'un d'une situation délicate.",
      "6": "Il « sent » où se trouve une information, peut produire un faux document même grossier que chacun prendra pour authentique, et déchiffrer une carte perforée du bout des doigts."
    },
    culture: {
      "-1": "Le personnage n'a pas reçu d'éducation de base : il est inculte et lit avec beaucoup de difficulté et de lenteur.",
      "0": "Il connaît le nom des Blocs voisins, se souvient des faits des trois dernières années, des artistes officiels célèbres et des mythes de propagande répandus.",
      "1": "Il a une idée de la géographie du monde, se souvient des faits des dernières décennies, connaît les grands artistes officiels et leurs œuvres, ainsi que des mythes de propagande plus pointus.",
      "2": "Il connaît des détails sur les Blocs voisins et des faits remontant au siècle dernier.",
      "3": "Il connaît des détails sur des Blocs lointains et des faits remontant jusqu'à l'arrivée de l'Artefact.",
      "4": "Il connaît quelques vérités sur ce qu'était le monde avant l'Artefact.",
      "6": "Il accède à des détails inaccessibles sur des événements lointains ou anciens et sent si une information de propagande est vraie ou fausse. Ce Talent mesure aussi sa connaissance de la Gnose et des vérités de l'univers."
    },
    recherche: {
      "-1": "Le personnage est étourdi, désorganisé ou a une mauvaise vue : il égare ses affaires et se perd dans les détails.",
      "0": "Il trouve les éléments évidents, sans faire de rapprochements ni en tirer de déductions.",
      "1": "Il remarque les petits détails, commence à analyser la disposition des choses, fait quelques recoupements subtils et trouve des objets bien cachés.",
      "2": "Il relie ce qui est présent, ce qui manque et l'organisation d'ensemble pour tirer des conclusions qui dépassent le simple constat ; il trouve des objets très bien cachés.",
      "3": "Il déniche les objets soigneusement dissimulés et analyse taches, matières, odeurs, textures, séquences, motifs et singularités.",
      "4": "Il tire des conclusions de la physionomie, de la logique, de l'écriture ou de la typographie, et glane des informations même là où il n'y a pas d'indice.",
      "6": "Il « sent » la présence de preuves et « lit » les lieux : les faits lui apparaissent en visions fulgurantes, comme si son esprit pouvait contempler des fragments du passé."
    },
    societe: {
      "-1": "Le personnage ne connaît même pas les grandes figures du Bloc ; peut-être vient-il d'arriver en ville.",
      "0": "Il connaît les personnalités de son quartier, les enseignes incontournables de la ville et les grands événements.",
      "1": "Il connaît les puissants de la ville, les bonnes adresses et celles à éviter, les faits divers récents et les rendez-vous underground.",
      "2": "Il connaît les figures secondaires de la ville, la vérité officieuse qui se cache derrière les versions officielles et les ragots les plus savoureux.",
      "3": "Il connaît le who's who sur le bout des doigts, ainsi que quelques petits secrets de personnes importantes.",
      "4": "Il sait tout sur tout le monde, connaît la ville comme sa poche et est informé de tout ce qui s'y passe.",
      "6": "Il « sent » qu'un événement majeur vient de se produire dans son Bloc, trouve d'instinct son chemin en ville et se retrouve toujours dans les soirées qui comptent, comme si sa présence attirait les situations intéressantes."
    }
  },
  technique: {
    artefact: {
      "-1": "Le personnage a peur de l'Objet-Dieu, évite de le regarder et le chasse de ses pensées. Sa réserve de Singularité est vide, et chaque manifestation majeure de l'Artefact (Mécanisme violent, Faisceau puissant, pluie de Fiel…) lui inflige 1 point de Trauma.",
      "0": "Il fait la différence entre un Mécanisme et un Grand Mécanisme, sans plus. Sa réserve de Singularité est vide.",
      "1": "Il prédit certains comportements de l'Artefact, comme on devine le temps qu'il fera en observant le ciel. Réserve de Singularité : 2 points au début de chaque séance.",
      "2": "Il lit l'Artefact : il prévoit l'épaisseur et la durée d'une Brume d'après l'intensité d'un Faisceau, anticipe un Mécanisme à partir d'un soubresaut et s'oriente grâce aux motifs de Matière noire. Réserve de Singularité : 3 points.",
      "3": "Il interprète la Matière noire pour s'orienter au cœur des Axes, trouve des raccourcis dans le Dédale, active d'instinct des mécanismes endormis depuis des âges et entend l'Artefact cliqueter dans sa tête. Réserve de Singularité : 4 points.",
      "4": "Il est plus à l'aise dans les Axes qu'à l'air libre et s'y oriente comme guidé par une carte mentale ; l'Artefact réagit à sa présence (portes antiques qui s'ouvrent, ascenseurs qui repartent…). Réserve de Singularité : 5 points.",
      "6": "Un lien évident l'unit à l'Artefact, qui semble réagir à ce qui lui arrive (claquement qui surprend un agresseur, brume qui gêne des poursuivants…). Réserve de Singularité : 5 points ; en dépensant 3 points de Singularité, il peut réduire la Menace de 1."
    },
    artisanat: {
      "-1": "Le personnage ne sait pas coordonner ses dix doigts : planter un clou ou fixer quelque chose droit lui est déjà difficile, et il bricole sans méthode ni bon sens.",
      "0": "Il bricole plus ou moins adroitement et rafistole des objets simples.",
      "1": "Il est habile de ses mains et a de la pratique : il diagnostique les pannes courantes, réalise des ouvrages simples et se débrouille avec des outils à main.",
      "2": "Il réalise des ouvrages solides et de qualité.",
      "3": "Il confectionne des œuvres d'une grande finesse ou d'une conception ingénieuse.",
      "4": "Il maîtrise son art, réalise des chefs-d'œuvre que d'autres exposeront avec fierté, innove et repousse les limites de sa pratique.",
      "6": "Gagné par une puissante inspiration, il peut consacrer un intermède entre deux aventures à créer une Merveille pour 2 points de Progression (Sceau de Seuil, Objet légendaire donnant +1 au Talent approprié, Chef-d'œuvre accordant un point d'Extase supplémentaire, Agrément de Cabale). Une seule Merveille par effet."
    },
    ingenierie: {
      "-1": "Les machines semblent lui en vouloir, et c'est réciproque. Il n'a aucune aptitude pour les mathématiques et ne comprend pas les lois de la nature, qui lui paraissent presque magiques.",
      "0": "Il comprend les grandes lignes du fonctionnement d'un moteur sans pouvoir le démonter, connaît la gravité sans en saisir les principes, et reste interdit devant les merveilles quantiques.",
      "1": "Il diagnostique les pannes courantes, entretient une machine simple, connaît les bases de la physique et de la chimie et entrevoit les fondamentaux de la technologie quantique.",
      "2": "Il entretient et répare la plupart des moteurs ainsi que les engins quantiques, et s'aventure dans les démonstrations métaphysiques de l'Harmonie.",
      "3": "Il conçoit une machine des plans à la réalisation, a sa place dans les laboratoires du Progrès, émet des hypothèses valables sur la mort du champ électrique et dessine de nouveaux appareils quantiques.",
      "4": "Il conçoit, construit et entretient des ensembles de machines fonctionnant de concert (Transacteurs, chaînes de montage complexes) et comprend les fluctuations des mystérieux Orbes quantiques.",
      "6": "Son esprit capte des vérités fondamentales sur les lois de l'univers. Pour 2 points de Progression, il peut consacrer un intermède à créer un Prodige, machine étrange capable d'altérer le réel (accélérer le temps local, faire léviter un objet, altérer la Matière noire, produire des éclairs, volatiliser de la matière), ou ajouter une fonction à un Prodige existant."
    },
    survie: {
      "-1": "Le personnage est casanier ou peu débrouillard : hors du centre-ville, il se perd vite et ne sait ni allumer un feu, ni attraper du gibier, ni boire une eau douteuse.",
      "0": "Il sait se situer s'il dispose de repères suffisants.",
      "1": "Il fabrique de petits pièges, allume un feu avec du matériel sec et les bonnes pierres, et distingue une ruine saine d'un vestige prêt à s'effondrer.",
      "2": "Il s'oriente d'après les reliefs de l'Artefact, chasse du beau gibier, trouve à manger en fouillant les poubelles, entretient un feu dans de mauvaises conditions, trouve de l'eau potable et construit un abri sûr.",
      "3": "Il est aussi à l'aise en périphérie qu'en ville, connaît les vertus des plantes et la valeur nutritive des aliments, bâtit un abri confortable et trouve les meilleurs raccourcis, même dans les Hypogées les plus tortueux.",
      "4": "Il sait réagir aux urgences, connaît les remèdes aux venins les plus rares et développe un lien empathique avec les éléments.",
      "6": "Il est en osmose avec la nature, qui le guide et le protège ; des animaux le suivent et l'aident. Loin des centres-villes, il peut dépenser des points de Contact pour obtenir de petites faveurs de la part d'animaux (guide, défense le temps d'une scène…)."
    }
  },
  action: {
    combat: {
      "-1": "Le personnage a sans doute peur du sang, de la douleur ou des armes : en situation de conflit, il tremble, se fige, s'affole et perd tous ses moyens.",
      "0": "Il porte des coups maladroits et sans conviction. Il ne sait pas se battre et n'en viendra aux mains qu'en dernier recours.",
      "1": "Il frappe fort et évite de s'exposer ; il pratique peut-être un sport de combat ou vit dans un secteur violent. Il garde un certain sang-froid, mais n'a sans doute jamais tué.",
      "2": "Il mène un combat avec technique et lucidité. Habitué à la violence, il sait se servir d'une arme et n'a pas peur d'infliger ni d'endurer la douleur.",
      "3": "Il se bat avec grâce et méthode : combattant hors pair, tueur professionnel ou soldat d'élite. L'adrénaline est pour lui une drogue.",
      "4": "Il domine le champ de bataille : guerrier virtuose à l'instinct exceptionnel, le maniement des armes lui semble inné et il pense naturellement en termes tactiques.",
      "6": "C'est un dieu de la guerre : le champ de bataille devient pour lui un terrain d'expression, où il enchaîne prouesses surhumaines et manœuvres géniales, comme dans une danse de mort légendaire."
    },
    constitution: {
      "-1": "Le personnage est frêle et chétif (ou bien c'est un enfant ou un vieillard) ; il a du mal à soulever plus de quelques kilos.",
      "0": "Stature moyenne : il porte une trentaine de kilos pendant moins de dix minutes et soulève au maximum une cinquantaine de kilos.",
      "1": "Il est costaud : il porte une cinquantaine de kilos une dizaine de minutes, soulève jusqu'à cent kilos et n'est pas douillet.",
      "2": "C'est une armoire à glace : il porte un homme de gabarit moyen une dizaine de minutes, soulève jusqu'à deux cents kilos, encaisse bien les coups et supporte la douleur.",
      "3": "C'est un colosse : il porte une centaine de kilos une dizaine de minutes, soulève jusqu'à trois cents kilos ; la plupart des coups semblent glisser sur lui.",
      "4": "C'est un titan, parmi les hommes les plus forts du monde : il soulève jusqu'à quatre cents kilos et semble insensible à la douleur.",
      "6": "Force surhumaine, digne des champions de légende : il porte un homme sur chaque épaule pendant plusieurs minutes et soulève un cheval."
    },
    deplacement: {
      "-1": "Le personnage est sans doute âgé, obèse ou impotent : il met une trentaine de secondes au cent mètres, peine à franchir un muret, ne peut pas être discret et s'épuise en quelques minutes.",
      "0": "Moins de 15 secondes au cent mètres, environ 4 mètres en saut en longueur. Il s'épuise après quelques dizaines de minutes d'effort ; en avançant très lentement, il échappe à un observateur inattentif.",
      "1": "Bonne forme : moins de 13 secondes au cent mètres, 5 mètres en longueur. Il tient une heure ou deux d'effort et, en progressant lentement, peut tromper un individu attentif.",
      "2": "Athlète accompli : moins de 12 secondes, 6 mètres en longueur. Il tient plusieurs heures d'effort et peut tromper l'ouïe d'un individu sur ses gardes.",
      "3": "Athlète rare : moins de 11 secondes, 7 mètres en longueur. Il soutient un effort pendant une demi-journée et ses mouvements échappent à la plupart des gardes.",
      "4": "Champion : moins de 10 secondes, 8 mètres en longueur. Il gère son effort sur une journée entière ; ses déplacements sont félins et imperceptibles.",
      "6": "Prouesses surhumaines : il court plus vite que tout humain, franchit des gouffres, grimpe presque partout, jusqu'aux murs et plafonds, et ne s'épuise jamais. Il peut accomplir deux actions annexes par tour."
    },
    instinct: {
      "-1": "Le personnage a sans doute un sérieux handicap sensoriel, ou il est simplement tête en l'air : des éléments évidents lui échappent souvent.",
      "0": "Il est sur ses gardes quand le danger est manifeste, mais pas toujours attentif : il lui arrive d'être perdu dans ses pensées, de rater des points importants ou d'être surpris.",
      "1": "Il est à l'affût : naturellement attentif, les sens aiguisés, il remarque parfois des faits singuliers qui échapperaient au commun des mortels.",
      "2": "Il ne se relâche jamais : toujours sur ses gardes, difficile à surprendre, il guette constamment ce qui cloche.",
      "3": "Il lit les signes : sixième sens animal, sommeil léger. Il relie une odeur diffuse et un bruit anodin pour anticiper un danger autrement indétectable.",
      "4": "Il pressent : des sensations muettes l'avertissent d'un danger ou d'un détail suspect avant que ses sens ne puissent les percevoir (tireur embusqué au loin, ennemi qui approche).",
      "6": "Ses sensations sont si aiguës qu'il en tire des informations : il identifie la nature d'un danger et perçoit un détail remarquable dans la pièce voisine. Son instinct ne l'avertit plus seulement, il lui parle."
    }
  },
  statut: {
    contact: {
      "-1": "Le personnage n'a pas de contacts mais un ennemi (groupe, Direction, créancier…) et commence le jeu avec une séquelle de Traque.",
      "0": "Personne ordinaire : il peut demander de menus services à ses proches, mais ne connaît personne de bien placé prêt à se compromettre pour lui. Sa réserve de Faveur est vide.",
      "1": "Il a un réseau dans son milieu professionnel ou sa communauté : un ou deux Contacts, entre lesquels il répartit 2 points de Faveur.",
      "2": "Il entretient un réseau solide et varié : un à trois contacts, entre lesquels il répartit 4 points de Faveur.",
      "3": "Il est au centre d'un maillage complexe où chaque contact a son propre réseau : un à quatre contacts, 6 points de Faveur.",
      "4": "Il gravite autour de nombreux groupes, services et conspirations : un à cinq contacts, 8 points de Faveur (10 au niveau 5).",
      "6": "Son influence est telle que certains contacts forment autour de lui un culte, une armée ou une cohorte de fidèles. Il récupère 2 points de Faveur au début de chaque scène."
    },
    "façade": {
      "-1": "Le personnage a déjà un casier judiciaire bien rempli, ou son apparence le rend particulièrement suspect et remarquable.",
      "0": "C'est un citoyen lambda, bien connu et bien fiché.",
      "1": "Il a l'air quelconque : il cache ses traces, se fait envoyer son courrier dans des boîtes fantômes, a un domicile difficile à trouver et des voisins qui le préviennent des visiteurs louches.",
      "2": "Il semble inoffensif : paranoïaque, il brouille les pistes, est connu du Bureau sous plusieurs noms et adresses, cache sa planque au fond d'un dédale et dispose d'informateurs involontaires.",
      "3": "Il a l'air à sa place partout : véritable ombre, son dossier a été remplacé dans le Fichier, sa planque est un jeu de piste plein de passages, de verrous et de pièges, et la rue lui prête mille visages.",
      "4": "Il est invisible : son identité réelle est effacée du Fichier depuis longtemps ; il peut se procurer une nouvelle identité en quelques heures et vit dans une forteresse secrète (Hypogées, bâtiment abandonné, zone de quarantaine).",
      "6": "Le destin le protège : les vérifications sont interrompues, les preuves se perdent, les témoins oublient son visage et ses voisins l'avertissent. Sauf action particulièrement voyante, personne ne peut remonter jusqu'à lui."
    },
    fortune: {
      "-1": "Le personnage est pauvre : studio miteux ou chambre de foyer, loyers en retard, à peine de quoi se nourrir, aucune fantaisie possible.",
      "0": "Classe moyenne : appartement loué en faubourg ou petit studio, de quoi se nourrir, se vêtir et se déplacer, des loisirs simples (musées officiels, spectacles, quelques verres).",
      "1": "Aisé : appartement en centre-ville ou petite maison, employé de ménage, son propre moyen de transport, clubs aisés, opéra et petites vacances annuelles.",
      "2": "Riche : duplex en ville ou belle maison en banlieue, domestiques, résidence secondaire, véhicules de prestige, soirées sélectes et sports coûteux.",
      "3": "Très riche : hôtel particulier ou manoir, plusieurs résidences, trois ou quatre véhicules, personnel nombreux, collection d'art et belle bibliothèque, tous les loisirs possibles.",
      "4": "Immeubles, hôtels particuliers, domaine privé formant une enclave, nombreux véhicules dont un yacht, un zeppelin ou un train personnel pour quitter le Bloc ; mécène généreux, y compris envers le Bureau.",
      "6": "Sa fortune dépasse le monde réel : à mesure qu'il explore le Dédale, la Destinée lui révèle un héritage immémorial (royaumes personnels, peuples serviteurs, antiques objets de pouvoir)."
    },
    rang: {
      "-1": "Paria ou Sans-Rang (classe la plus basse, chercheur limogé, artiste disgracié…) : il serait chassé d'une soirée mondaine, subit mépris et défiance, et ne peut compter sur la bienveillance de personne.",
      "0": "Aucun statut particulier : il n'a guère d'autorité, sauf peut-être dans son cadre professionnel.",
      "1": "Un peu d'influence : il peut compter sur l'appui ou l'obéissance des citoyens de rang inférieur dans le cadre de sa fonction (sous-officier de la Garde Noire, vérificateur de l'Effort, émissaire d'un puissant…).",
      "2": "Il a le bras long et un grade important (officier de la Garde Noire, secrétaire d'un Recteur, proche d'un puissant).",
      "3": "Il a le bras très long : son grade lui confère une aura qui dépasse sa fonction et touche tous les rangs inférieurs (préfet du Diktat, docte du Progrès, général de la Garde Noire, magnat de la presse, parrain de la pègre…).",
      "4": "Son influence s'étend à toutes les strates de la société et son autorité est souvent multiple ; à son nom, l'homme de la rue se sent mal à l'aise.",
      "6": "Son influence n'est plus liée à son statut social : il inspire par lui-même une autorité telle que les créatures de rang inférieur sont prêtes à lui obéir."
    }
  },
  ame: {
    extase: {
      "-1": "Seul et sans loisir, peut-être rabat-joie ou dépressif : lors d'un moment de calme, lui ou un autre Héros volontaire regagne 1 point d'Espoir de moins.",
      "0": "Il a une famille qu'il retrouve avec plaisir ou un passe-temps (boire un verre, jouer, danser…) : il sait tuer le temps.",
      "1": "Une famille heureuse, une passion ou un vice (sport, méditation, alcool, jeu, lecture…) égaient ses jours : il sait s'amuser.",
      "2": "Une belle romance, une passion dévorante ou une addiction lui servent d'exutoire face à l'horreur ; il connaît les bonnes adresses pour s'y adonner intensément.",
      "3": "Il a sans doute plusieurs sources d'Extase : bonheur familial, passion amoureuse, rites, substances, cercle d'amis…",
      "4": "Il dispose de moyens hors du commun pour s'extraire du monde (famille parfaite, psychotropes puissants, havre personnel…), au prix peut-être d'un peu de sa lucidité.",
      "6": "Il n'a plus besoin d'artifices : il irradie une aura apaisante et enthousiasmante qui fait de lui un havre, même au cœur de l'enfer."
    },
    folie: {
      "-1": "Son esprit est fragile, par nature ou à cause d'une vie trop protégée : les chocs le marquent plus profondément que les autres.",
      "0": "Citoyen de ce monde dur, habitué à la violence et à l'oppression ordinaires, il n'a cependant jamais vu de massacre, approché un Autre ni subi d'interrogatoire de la Police Secrète.",
      "1": "Il a un certain vécu : affrontement contre des Autres, proche perdu à cause de la Noirceur, séjour dans les cachots… cette épreuve l'a rendu plus résilient.",
      "2": "Il vit avec la folie (artiste halluciné, clandestin paranoïaque, vétéran de la Ligne) et a l'habitude d'affronter ses démons.",
      "3": "Il vit dans son propre monde, selon ses propres valeurs ; ce qui traumatise les autres lui paraît un mal nécessaire. Seules les situations extrêmes l'affectent.",
      "4": "Les drames humains n'ont pas plus d'importance à ses yeux que ceux d'une fourmilière : les pires carnages sont des dommages collatéraux et l'étrange est son quotidien.",
      "6": "Il trouve de l'intérêt, voire de la joie, dans les situations extrêmes et puise énergie et informations dans ses traumatismes et visions. Avec au moins 3 points de Trauma, il gagne +1 à tous ses scores de Domaine."
    },
    sensibilite: {
      "-1": "Totalement dépourvu de Sensibilité, il méprise les impressions des autres, qu'il met sur le compte d'une imagination débordante.",
      "0": "Il crée des œuvres médiocres et ne saisit que le sens évident d'une œuvre ; il a parfois ressenti des impressions troublantes sans savoir les interpréter.",
      "1": "Inspiré, il perçoit le message derrière un tableau ou un poème et sent dans l'air les grands événements, sous forme de malaise ou d'euphorie inexplicable.",
      "2": "Ses œuvres émeuvent ; il entend le non-dit, ressent les émotions d'une œuvre ou d'une situation et détecte les changements d'ambiance ou d'énergie, avec un peu d'avance.",
      "3": "Il bouleverse une foule, perçoit les variations récentes ou à venir, apprend des choses sur un artiste par ses œuvres ou sur une situation par son ambiance ; l'art le plonge dans des états extatiques.",
      "4": "Il crée des chefs-d'œuvre historiques, ressent les moindres nuances, sait depuis quand un lieu est touché par la Noirceur et pourquoi, voit les liens entre les gens et prévoit les variations d'énergie des heures à l'avance.",
      "6": "Il voit littéralement ce que les autres ignorent : la Noirceur lui apparaît comme une aura sinistre, et des voix lui révèlent le sens caché des choses, les liens entre les êtres et parfois des événements à venir."
    },
    tenebres: {
      "-1": "Victime née, il paraît fragile et haïssable aux yeux des Autres et attire ceux qui cherchent les ennuis ; ses tentatives d'intimidation font rire ses ennemis.",
      "0": "Une proie ordinaire pour l'envahisseur : les Autres ne lui accordent aucun traitement particulier, et il n'intimide guère que les lâches, sauf s'il est armé.",
      "1": "Il impressionne les citoyens peu résolus ; les Autres flairent chez lui quelque chose de familier, assez pour hésiter à le tuer.",
      "2": "Il dégage une aura de crainte que les gens évitent de provoquer ; les Autres lui portent une attention particulière et semblent vouloir l'attirer vers un Axe.",
      "3": "Son regard ou son attitude inquiètent même les plus endurcis ; le malaise qu'il dégage pousse les Autres à le traiter avec une forme de respect.",
      "4": "Son âme est écrasante : il soumet ses semblables, et même les Autres le craignent, évitent le conflit et lui font comprendre que quelque chose l'attend dans l'Artefact.",
      "6": "Son aura s'étend à ses alliés situés à moins de 10 mètres, qui reçoivent le même traitement de la part des Autres. Les ombres l'aident : en situation de stress, l'obscurité peut réduire de moitié la portée des lumières et lui donner +1 en Déplacement pour les manœuvres furtives."
    }
  },
  social: {
    charisme: {
      "-1": "Repoussant et désagréable (sans forcément être laid), il pousse les gens à écourter toute rencontre.",
      "0": "Physiquement banal, sans atout ni défaut marquant, il a du mal à enflammer un auditoire ou à convaincre des inconnus.",
      "1": "Il charme et fait douter : sympathique, il attire l'attention et tire de petits avantages des personnes qui n'ont pas de préjugé contre lui.",
      "2": "Il séduit et convainc : très beau ou très charismatique, il atténue les préjugés et obtient de petites faveurs de gens qui ne devraient rien lui accorder, sans les mettre en danger.",
      "3": "Il trouble : fascinant, ses interlocuteurs cherchent à lui plaire et font leur possible pour lui, dans les limites de leurs prérogatives.",
      "4": "Il subjugue : on est prêt à commettre de petits délits ou des actes déraisonnables pour lui.",
      "6": "Ses interlocuteurs tombent sous son emprise : ils sont prêts à presque tout pour lui (délits sérieux, actes absurdes) tant que leur vie n'est pas menacée, et restent hantés par son souvenir."
    },
    conviction: {
      "-1": "Il est faible : il cède à ses émotions, et sa peur de l'échec, de la douleur ou de l'abandon le pousse vite à la délation ou à la soumission.",
      "0": "Il a des convictions, mais n'est pas prêt à se mettre en danger pour elles.",
      "1": "Une mission, des principes ou un objectif le protègent de la plupart des pressions et tentations du quotidien ; c'est quelqu'un de confiance.",
      "2": "Hautement déterminé, peut-être entraîné à résister à la pression, il est prêt à presque tout sacrifier pour ses objectifs.",
      "3": "Il incarne une mission : il sait que céder aurait des conséquences terribles pour lui et ses proches, et peu de choses comptent plus que sa cause.",
      "4": "Rien ne passe avant ses objectifs ; même la torture de ses proches ne le ferait pas plier.",
      "6": "Sa détermination gagne le cœur de ses alliés : ceux qui partagent sa mission bénéficient de +1 à leur propre Conviction."
    },
    psychologie: {
      "-1": "Dépourvu d'empathie (pathologie, culture très différente, isolement…), il se trompe souvent sur les intentions d'autrui et multiplie les gaffes.",
      "0": "Il imagine l'effet qu'une situation marquante produira généralement sur les gens.",
      "1": "Empathique et intuitif, il se met à la place des autres pour prévoir leurs réactions et repère certains signes trahissant leur état d'esprit.",
      "2": "Il combine instinct et connaissances sur les marqueurs émotionnels pour repérer des signes qui échappent à la plupart des gens.",
      "3": "Il détecte la plupart des signes non verbaux et les met en relation pour dresser des profils et tirer des hypothèses utiles sur ses interlocuteurs.",
      "4": "Il décrypte la psychologie d'une personne en l'observant, comme un technicien comprend une machine : convictions, événements marquants, envies et secrets.",
      "6": "Observer quelqu'un lui apporte des visions, des sensations et des certitudes sur son passé, ses intentions, ses désirs, ses secrets et ses peurs."
    },
    tromperie: {
      "-1": "Il ne sait pas ou ne peut pas mentir (interdit culturel, ou symptômes très visibles : sueur, gestes, voix tremblante).",
      "0": "Il est tendu quand il ment : voix légèrement changée, regard fuyant, gestes nerveux. Il improvise un mensonge à peu près cohérent, mais s'embrouille dans les détails.",
      "1": "Il arrange la vérité à son avantage, comme dans une négociation, mais son malaise se voit vite quand l'enjeu grandit.",
      "2": "Il improvise dans un rôle préparé et retient les détails qui crédibilisent un mensonge, même sous pression : acteur, espion ou agent infiltré.",
      "3": "Il contrôle les signes physiologiques qui pourraient le trahir (pupilles, rythme cardiaque, micro-expressions) et déjoue les détecteurs de mensonges de la Garde Noire.",
      "4": "Il incarne son mensonge : ses interlocuteurs en sont si convaincus qu'ils ajoutent eux-mêmes des détails et deviennent les témoins de faits imaginaires.",
      "6": "Le hasard lui fournit des preuves (témoin providentiel, sosie…) et fait disparaître celles qui le trahiraient ; ses mensonges semblent même altérer les perceptions de ses interlocuteurs."
    }
  },
  vie: {
    apaisement: {
      "-1": "Maladroit, cynique ou vicieux, il crée des tensions dans le groupe : à chaque moment de calme, un Héros désigné par la Loi regagne 1 point de Trauma de moins.",
      "0": "Il improvise face à la détresse d'autrui, sans expérience des situations de crise.",
      "1": "À l'écoute, doux et subtil, il calme les troubles et les doutes et trouve les mots et les gestes qui soulagent.",
      "2": "Il allège la souffrance mentale grâce à des techniques apprises (rhéteur de la Voie, syndicaliste, thérapeute) et sait quoi faire quand vient la crise.",
      "3": "Il aide à surmonter un traumatisme grave ; sa voix, son odeur ou son visage captent l'attention et rassurent.",
      "4": "Il guérit les plaies de l'âme : il évoque un foyer familier et partage la souffrance de la victime pour la guider jusqu'au bout du tunnel.",
      "6": "Avatar terrestre de la Matriarche, sa simple présence apaise. En dépensant 1 point d'Espoir, il guérit une séquelle de Trauma."
    },
    ferveur: {
      "-1": "Il a baissé les bras et ne croit plus au salut de l'humanité. Réserve d'Espoir : 1 point.",
      "0": "Vaillant, mais découragé par les grosses difficultés. Réserve d'Espoir : 3 points.",
      "1": "Il croit sincèrement à la victoire et son élan est communicatif. Réserve d'Espoir : 5 points.",
      "2": "Il vit pour voir son camp l'emporter et trouve dans chaque petite victoire une raison de continuer. Réserve d'Espoir : 7 points.",
      "3": "Émissaire de la victoire à venir, il n'en doute jamais ; les échecs ne sont pour lui que des leçons. Réserve d'Espoir : 9 points.",
      "4": "Prophète de sa cause, sa présence chasse le doute chez ses alliés. Réserve d'Espoir : 10 points ; ses points d'Espoir donnent autant de dés de destin que son niveau de Ferveur, au lieu de 3.",
      "6": "Il incarne l'espoir au point que sa seule évocation ranime la flamme de ses alliés : il peut leur Donner de l'espoir quelle que soit la distance, sans même communiquer avec eux."
    },
    lumiere: {
      "-1": "Son âme n'est qu'une étincelle vacillante, privée de bonté et de vertu : un terrain fertile pour l'envahisseur.",
      "0": "Il a des failles, une part d'ombre où les ténèbres peuvent germer.",
      "1": "Il n'a pas cédé au cynisme ambiant : vertueux, il est prompt à aider, défendre ou soulager son prochain.",
      "2": "Il porte une part du fardeau du monde et fait de sa vie un combat contre l'état de siège (dispensaire, œuvre de charité, armée, administration).",
      "3": "Croisé de la Lumière, son esprit chevaleresque est un rempart contre la Noirceur ; il est habité par un amour profond de la vie.",
      "4": "Phare dans la nuit, il attire les âmes en peine, et les Autres le perçoivent comme une singularité à éviter.",
      "6": "Brasier dans les ténèbres, sa présence fait souffrir les Autres : ils subissent 1 point de Blessures par round tant qu'ils restent dans son aura."
    },
    soins: {
      "-1": "Il souffre d'une phobie (sang, corps, blessures) ou ne connaît que des remèdes traditionnels inefficaces, voire dangereux.",
      "0": "Il ne connaît que la médecine populaire et quelques remèdes de grand-mère ; il est démuni face à toute blessure sérieuse.",
      "1": "Il prend en charge les blessures et affections modérées : formation médicale d'infirmier, de soldat vétéran ou de guérisseur de faubourg.",
      "2": "Il prend en charge les blessures et affections sérieuses : professionnel du soin, médecin au Census ou sur les théâtres d'opération de la Garde Noire.",
      "3": "Il prend en charge les blessures et affections graves : professionnel spécialisé, chercheur du Census ou médecin vétéran de la Garde.",
      "4": "Il prend en charge les blessures et affections critiques : pour lui la médecine est un art ; il repère des anomalies qui échappent à ses confrères et opère avec précision dans des conditions extrêmes.",
      "6": "Il comprend le corps humain comme une machine dont il aurait les plans : il diagnostique d'un regard, découvre des remèdes à des maladies incurables et répare organes et tendons. En dépensant 1 point d'Espoir, il guérit une séquelle de Blessures."
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
