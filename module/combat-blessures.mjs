/**
 * Calcul des Blessures infligées aux cibles d'une attaque réussie, pour le MJ
 * (message privé ; le MJ reporte lui-même les Blessures, pas de report automatique).
 *
 * Règles (livre p. 251-252) :
 * - Blessures = dégâts de l'arme + marge (Précision, 1re cible) − Constitution − Armure
 *   (une Constitution négative augmente les dégâts ; minimum 0) ;
 * - Perforant / Tranchant : au moins 2 / 1 Blessure(s) contre une cible sans armure ;
 * - Quantique et Énergie noire : réduits par la Lumière de la cible (minimum 0 ;
 *   les alliés à portée d'aura ne sont pas comptés automatiquement) ;
 * - Multiple (X) : X touches, chacune 1 point de moins que la précédente (ignorée sous 1) ;
 * - Choc et Contrainte : pas de Blessures.
 */

const nombre = v => Number(v) || 0;

/** Score d'armure de la cible (la meilleure armure qu'elle porte) */
function armureDe(actor) {
  return actor.items.filter(i => i.type === "armure").reduce((m, i) => Math.max(m, nombre(i.system.armure)), 0);
}

/** Calcule, pour chaque cible, les lignes du message du MJ */
export function calculerBlessures(rollData, cibles) {
  const traits = rollData.arme?.system?.traitsArme ?? {};
  const surnaturel = nombre(rollData.quantique?.succes) + nombre(rollData.energieNoire);
  const nbTouches = traits.multiple?.actif ? Math.max(1, nombre(traits.multiple.valeur)) : 1;
  // sans Multiple, l'attaque ne touche que la première cible
  const touchees = cibles.slice(0, nbTouches);
  return touchees.map((c, i) => {
    const actor = fromUuidSync(c.actorUuid);
    const r = { ...c, cons: null, armure: null, lumiere: null, lignes: [] };
    if (!actor) return r;
    r.cons = nombre(actor.system.talents?.action?.constitution?.niveau);
    r.armure = armureDe(actor);
    r.lumiere = nombre(actor.system.talents?.vie?.lumiere?.niveau);
    if (traits.choc || traits.contrainte?.actif) {
      r.lignes.push(traits.choc ? "Choc : pas de Blessures (comparer la Constitution aux dégâts)" : "Contrainte : pas de Blessures");
      return r;
    }
    const arme = nombre(rollData.degatsArme);
    const marge = i === 0 ? Math.max(0, nombre(rollData.margin)) : 0;
    let physique = Math.max(0, arme + marge - r.cons - r.armure);
    let minimum = "";
    if (r.armure === 0 && traits.perforant && physique < 2) { physique = 2; minimum = " (minimum Perforant)"; }
    if (r.armure === 0 && traits.tranchant && physique < 1) { physique = 1; minimum = " (minimum Tranchant)"; }
    r.lignes.push(`Dégâts ${arme} (arme)${marge ? ` + ${marge} (marge)` : ""} − ${r.cons} (Const.) − ${r.armure} (Armure) = ${physique}${minimum}`);
    let total = physique;
    if (surnaturel > 0) {
      const reduit = Math.max(0, surnaturel - r.lumiere);
      r.lignes.push(`Quantique/Énergie noire ${surnaturel} − ${r.lumiere} (Lumière) = ${reduit}`);
      total += reduit;
    }
    // Multiple sur une seule cible : touches suivantes
    if (nbTouches > 1 && cibles.length === 1) {
      const touches = [total];
      for (let k = 1; k < nbTouches && total - k >= 1; k++) touches.push(total - k);
      if (touches.length > 1) r.lignes.push(`Multiple : touches ${touches.join(", ")}`);
    } else if (nbTouches > 1 && i > 0) {
      r.lignes.push(`Multiple : touche n° ${i + 1} (1 point de moins par touche précédente)`);
    }
    return r;
  });
}

/** Message réservé au MJ : attributs des cibles et calcul des Blessures */
export async function messageMJCibles(rollData) {
  const gms = ChatMessage.getWhisperRecipients("GM");
  if (!gms.length) return;
  let lignes;
  if (!rollData.blessures?.length) {
    // personne n'a été ciblé : dégâts bruts de l'arme, à réduire par la Loi
    const parts = [`${Number(rollData.degatsArme) || 0} (arme)`];
    const marge = Math.max(0, Number(rollData.margin) || 0);
    if (marge) parts.push(`${marge} (marge)`);
    const surnaturel = nombre(rollData.quantique?.succes) + nombre(rollData.energieNoire);
    lignes = `<li><span style="font-weight:bold">Cible inconnue</span><br>Dégâts ${parts.join(" + ")} − Const. − Armure`
      + (surnaturel ? `<br>Quantique/Énergie noire ${surnaturel} − Lumière` : "") + `</li>`;
  } else {
    lignes = rollData.blessures.map(b =>
      `<li><span style="font-weight:bold">${b.nom}</span> : Constitution ${b.cons ?? "—"}, Armure ${b.armure ?? "—"}, Lumière ${b.lumiere ?? "—"}`
      + b.lignes.map(l => `<br>${l}`).join("") + `</li>`).join("");
  }
  const attaquant = rollData.alias || game.actors.get(rollData.actorId)?.name || "";
  await ChatMessage.create({
    content: `<div class="nocRoll"><h4>${attaquant} — ${rollData.arme?.name ?? ""}</h4><ul class="cibles-mj">${lignes}</ul></div>`,
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
