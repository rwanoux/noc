// Import document classes.
import { nocActor } from "./documents/actor.mjs";
import { nocItem } from "./documents/item.mjs";
import { nocCombat } from "./helpers/noc-combat.js";

// Import sheet classes.__ACTORS
import { nocActorSheetPersonnage } from "./sheets/actors/actor-sheet-personnage.mjs";
import { nocActorSheetRouage } from "./sheets/actors/actor-sheet-rouage.mjs";
import { nocActorSheetCabale } from "./sheets/actors/actor-sheet-cabale.mjs";
import { nocActorSheetAutre } from "./sheets/actors/actor-sheet-autre.mjs";
import { nocActorSheetCreature } from "./sheets/actors/actor-sheet-creature.mjs";

// import items sheet
import { nocItemSheetArchetype } from "./sheets/items/item-sheet-archetype.mjs";
import { nocItemSheetTheme } from "./sheets/items/item-sheet-theme.mjs";
import { nocItemSheetArme } from "./sheets/items/item-sheet-arme.mjs";
import { nocItemSheetOutil } from "./sheets/items/item-sheet-outil.mjs";
import { nocItemSheetObjetUsuel } from "./sheets/items/item-sheet-objetusuel.mjs";
import { nocItemSheetDocumentAdministratif } from "./sheets/items/item-sheet-documentAdministratif.mjs";
import { nocItemSheetArmure } from "./sheets/items/item-sheet-armure.mjs";

// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { NOC } from "./helpers/config.mjs";
import CompteurFiel from "./compteursFiel/compteurFiel.mjs";
import { registerNocSettings } from "./registerSettings.mjs";
import { SocketManager } from "./socketManager.mjs";
import { objetDieu } from "./objectDieu.mjs";
import { registerHelpers } from './helpers/handlebarHelpers.js';
import { nocUtility } from './noc-utility.js';




/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {
  game.socketManager = new SocketManager;

  // Special NOC settings
  registerNocSettings();
  //handlebar custom helpers
  registerHelpers();
  //CONFIG.debug.hooks = true

  //manage socket messages
  game.socket.on("system.noc", async (sockmsg) => {
    try {
      game.socketManager.manageReceived(sockmsg);

    } catch (e) {
      console.error('game.socket.on("system.noc") Exception: ', sockmsg, ' => ', e)
    }
  });
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.noc = {
    nocActor,
    nocItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.NOC = NOC;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = nocActor;
  CONFIG.Item.documentClass = nocItem;
  CONFIG.Combat.documentClass = nocCombat;

  //modifying compendium banners
  CONFIG.Actor.compendiumBanner = "systems/noc/asset/ui/actor_tab.png"
  CONFIG.Cards.compendiumBanner = "systems/noc/asset/ui/card_tab.png"
  CONFIG.Item.compendiumBanner = "systems/noc/asset/ui/item_tab.png"
  CONFIG.JournalEntry.compendiumBanner = "systems/noc/asset/ui/journal_tab.png"
  CONFIG.Scene.compendiumBanner = "systems/noc/asset/ui/scene_tab.png"
  CONFIG.RollTable.compendiumBanner = "systems/noc/asset/ui/table_tab.png"
  CONFIG.Macro.compendiumBanner = "systems/noc/asset/ui/macro_tab.png"

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("noc", nocActorSheetPersonnage, {
    types: ["personnage"],
    makeDefault: true,
    label: "fiche de personnage"
  });
  Actors.registerSheet("noc", nocActorSheetRouage, {
    types: ["rouage"],
    makeDefault: true,
    label: "fiche de rouage"
  });
  Actors.registerSheet("noc", nocActorSheetCabale, {
    types: ["cabale"],
    makeDefault: true,
    label: "fiche de cabale"
  });
  Actors.registerSheet("noc", nocActorSheetAutre, {
    types: ["autre"],
    makeDefault: true,
    label: "fiche d'Autre"
  });
  Actors.registerSheet("noc", nocActorSheetCreature, {
    types: ["creature"],
    makeDefault: true,
    label: "fiche de créature"
  });


  // ITEMS sheet registering
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("noc", nocItemSheetOutil, {
    types: ["outil"],
    makeDefault: true,
    label: "fiche d'outil"
  });
  Items.registerSheet("noc", nocItemSheetObjetUsuel, {
    types: ["objetusuel"],
    makeDefault: true,
    label: "fiche d'objet usuel"
  });
  Items.registerSheet("noc", nocItemSheetArchetype, {
    types: ["archetype"],
    makeDefault: true,
    label: "fiche d'archetype"
  });
  Items.registerSheet("noc", nocItemSheetArme, {
    types: ["arme"],
    makeDefault: true,
    label: "fiche d'arme"
  });
  Items.registerSheet("noc", nocItemSheetDocumentAdministratif, {
    types: ["document administratif"],
    makeDefault: true,
    label: "fiche de document administratif"
  });
  Items.registerSheet("noc", nocItemSheetTheme, {
    types: ["thème"],
    makeDefault: true,
    label: "fiche de theme"
  });
  Items.registerSheet("noc", nocItemSheetArmure, {
    types: ["armure"],
    makeDefault: true,
    label: "fiche d'armure'"
  });

  // Preload Handlebars templates.
  preloadHandlebarsTemplates();

  CONFIG.ui.compteur = CompteurFiel
  nocUtility.init()
  objetDieu.init();

  CONFIG.debug.hooks = false;


});



/* -------------------------------------------- */
/*  custom pause                                  */
/* -------------------------------------------- */
Hooks.on("renderPause", () => {
  let pauseImg = document.querySelector('#pause img');
  pauseImg.setAttribute('src', 'systems/noc/asset/images/pause.webp');
  pauseImg.style.width = "20vw";
  pauseImg.style.height = "20vw";
  pauseImg.style.left = "40vw";
  pauseImg.style.top = "-10vw";

  pauseImg.style.opacity = "1";

  TweenMax.to(pauseImg, 10, { rotation: 360, repeat: -1, ease: Quad.easeInOut });

});




/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */
Hooks.once("ready", async function () {


  // rendering compteur de fiel
  ui.compteur.render(true);


  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  objetDieu.produceMecanisme();
})

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.noc.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "noc.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}
Hooks.on("preAddFiel", async (app, fiel) => {
  if (await game.settings.get("noc", "displayDroplet")) {
    objetDieu.displayDroplet();
    game.socketManager.launchSocket("displayDroplet", {});
  }

})
// creations de boutons lien dans l'onglet settings

Hooks.on("changeSidebarTab", (app) => {
  if (app.id !== "settings") return;
  if (app.element.querySelector("#noc-legal")) return;

  let content = `
<h4 class="divider"> Liens Utiles</h4>
<a  target="_blank" class="button" href="https://sethmes-editions.com/noc/">
<img style="    filter: drop-shadow(0px 0px 6px white);
    display: inline-block;
    height: 1.5rem;
    aspect-ratio: 1;
    position: relative;" src="systems/noc/asset/logoSethmes.webp">
le site de l'éditeur
</a>
<p>
Les éditions Sethmes autorisent l'utilisation de ce système NOC pour Foundry VTT à destination de parties privées mais aussi lors d'actual play, en live ou redifféré gratuit, sur les plateformes de streaming et sites web d'hébergement vidéo à la condition que soient mentionnés NOC et SETHMES.
</p>
<p>Cette utilisation ne peut être considérée comme une cession de droit, mais une tolérance d'usage.
</p>
<button>
<a  target="_blank" href="https://discord.gg/pPSDNJk">
<i class="fa-brands fa-discord"></i>
le discord francophone de foundry</a>
</button>

`
  let div = document.createElement("div");
  div.id = "noc-legal"
  div.innerHTML = content
  app.element.querySelector("[data-help-docs]").append(div);

})