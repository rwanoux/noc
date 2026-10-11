/**
 * Calcul des Blessures infligées aux cibles d'une attaque réussie
 * (affiché dans le chat ; le MJ les reporte lui-même, sans report automatique).
 *
 * Règles (livre p. 251-252) :
 * - Blessures = dégâts de l'arme − Constitution − Armure de la cible
 *   (une Constitution négative augmente les dégâts) ;
 * - Perforant / Tranchant : au moins 2 / 1 Blessure(s) contre une cible sans armure ;
 * - Quantique et Énergie noire : s'ajoutent, réduits par la Lumière de la cible
 *   (celle des alliés à portée d'aura n'est pas comptée automatiquement) ;
 * - Multiple (X) : X touches, chacune 1 point de moins que la précédente (minimum 1) ;
 * - Choc et Contrainte : pas de Blessures.
 * Un joueur ne peut pas modifier la fiche d'un adversaire : la modification passe alors par le MJ.
 */

const nombre = v => Number(v) || 0;

/** Score d'armure de la cible (la meilleure armure qu'elle porte) */
function armureDe(actor) {
  return actor.items.filter(i => i.type === "armure").reduce((m, i) => Math.max(m, nombre(i.system.armure)), 0);
}

/** Calcule les Blessures infligées à chaque cible ; renvoie la liste pour le chat */
export function calculerBlessures(rollData, cibles) {
  const traits = rollData.arme?.system?.traitsArme ?? {};
  if (traits.choc || traits.contrainte?.actif) {
    return cibles.slice(0, 1).map(c => ({ ...c, points: 0, sansBlessures: true, detail: traits.choc ? "Choc : pas de Blessures" : "Contrainte : pas de Blessures" }));
  }
  const nbTouches = traits.multiple?.actif ? Math.max(1, nombre(traits.multiple.valeur)) : 1;
  const resultats = cibles.map(c => ({ ...c, points: 0, touches: [] }));
  for (let k = 0; k < nbTouches; k++) {
    // une seule cible : toutes les touches ; plusieurs : réparties dans l'ordre
    const r = resultats[k % resultats.length];
    const actor = fromUuidSync(r.actorUuid);
    if (!actor) continue;
    const cons = nombre(actor.system.talents?.action?.constitution?.niveau);
    const armure = armureDe(actor);
    let base = nombre(rollData.degatsArme) - cons - armure;
    if (armure === 0 && traits.perforant) base = Math.max(base, 2);
    if (armure === 0 && traits.tranchant) base = Math.max(base, 1);
    base = Math.max(0, base);
    const lumiere = nombre(actor.system.talents?.vie?.lumiere?.niveau);
    const surnaturel = nombre(rollData.quantique?.succes) + nombre(rollData.energieNoire);
    const extra = surnaturel > 0 ? Math.max(0, surnaturel - lumiere) : 0;
    let points = base + extra;
    if (k > 0) {
      // touche suivante : 1 point de moins que la précédente, ignorée sous 1
      const precedente = resultats.flatMap(x => x.touches).at(-1) ?? points;
      points = precedente - 1;
      if (points < 1) break;
    }
    r.touches.push(points);
    r.cons ??= cons; r.armure ??= armure; r.lumiere ??= lumiere;
    r.points += points;
    r.detail = `dégâts ${rollData.degatsArme} − Const. ${cons} − Armure ${armure}`
      + (surnaturel > 0 ? ` ; quantique/énergie noire ${surnaturel} − Lumière ${lumiere}` : "")
      + (r.touches.length > 1 ? ` ; touches ${r.touches.join(" + ")}` : "");
  }
  // prévision affichée dans le chat : avant → après (cibles non touchées écartées)
  const touchees = resultats.filter(r => r.touches.length);
  for (const r of touchees) {
    const p = fromUuidSync(r.actorUuid)?.system.perditions?.blessures;
    if (!p) continue;
    r.avant = nombre(p.value);
    r.max = nombre(p.max) || 10;
    r.apres = Math.min(r.max, r.avant + r.points);
  }
  return touchees;
}

/** Ajoute des Blessures à un acteur ; renvoie [avant, après, max] */
export async function ajouterBlessures(actor, points) {
  const p = actor.system.perditions?.blessures;
  if (!p || points <= 0) return null;
  const avant = nombre(p.value);
  const max = nombre(p.max) || 10;
  const apres = Math.min(max, avant + points);
  if (apres !== avant) await actor.update({ "system.perditions.blessures.value": apres });
  return [avant, apres, max];
}

/** Applique les Blessures calculées : directement si possible, sinon par le MJ */
export async function appliquerBlessures(resultats) {
  for (const r of resultats) {
    if (!r.points) continue;
    const actor = fromUuidSync(r.actorUuid);
    if (!actor) continue;
    if (actor.isOwner) await ajouterBlessures(actor, r.points);
    else if (game.users.activeGM) game.socketManager.launchSocket("appliquerBlessures", { actorUuid: r.actorUuid, points: r.points });
    else ui.notifications.warn(`Aucun MJ connecté : les Blessures de ${r.nom} n'ont pas pu être reportées.`);
  }
}

/** Texte des Blessures : « 3 + 6 = 9 » (Blessures + marge de succès utilisée en Précision) */
export function texteBlessures(b, marge) {
  if (b.sansBlessures) return b.detail;
  const m = Math.max(0, Number(marge) || 0);
  return m > 0 ? `${b.points} + ${m} = ${b.points + m}` : `${b.points}`;
}

/** Message réservé au MJ : Constitution, Armure et Lumière des cibles touchées */
export async function messageMJCibles(rollData) {
  const gms = ChatMessage.getWhisperRecipients("GM");
  if (!gms.length) return;
  let lignes;
  if (!rollData.blessures?.length) {
    // personne n'a été ciblé : dégâts bruts de l'arme, à réduire par la Loi
    const parts = [`arme ${Number(rollData.degatsArme) || 0}`];
    if (rollData.quantique?.succes) parts.push(`quantique ${rollData.quantique.succes}`);
    if (rollData.energieNoire) parts.push(`énergie noire ${rollData.energieNoire}`);
    const marge = Math.max(0, Number(rollData.margin) || 0);
    lignes = `<li><span style="font-weight:bold">Cible inconnue</span><br>Dégâts : ${parts.join(" + ")}${marge ? ` + marge ${marge}` : ""}`
      + `<br><small>À réduire par la Constitution et l'Armure de la cible (quantique et énergie noire : par sa Lumière).</small></li>`;
  } else lignes = rollData.blessures.map(b =>
    `<li><span style="font-weight:bold">${b.nom}</span> : Constitution ${b.cons ?? "—"}, Armure ${b.armure ?? "—"}, Lumière ${b.lumiere ?? "—"}`
    + `<br>Blessures : ${b.texte ?? b.points}`
    + (b.detail && !b.sansBlessures ? `<br><small>${b.detail}</small>` : "") + `</li>`).join("");
  await ChatMessage.create({
    content: `<div class="nocRoll"><h4>Cibles de ${rollData.alias ?? ""} — ${rollData.arme?.name ?? ""}</h4><ul class="cibles-mj">${lignes}</ul></div>`,
    whisper: gms.map(u => u.id),
    speaker: ChatMessage.getSpeaker({ alias: "Loi" })
  });
}

/** Cibles actuelles de l'utilisateur (jetons ciblés) */
export function ciblesActuelles() {
  return Array.from(game.user.targets ?? [])
    .filter(t => t.actor)
    .map(t => ({ nom: t.name ?? t.actor.name, actorUuid: t.actor.uuid }));
}
