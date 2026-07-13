// src/data/dnd2024/rules.js — Règles de calcul D&D 2024
//
// Portage JS du module de règles du RPG Character Creator.
// Chaque fonction correspond à une règle du Manuel du Joueur 2024.

export const dnd2024Rules = {
  // Modificateur : (statistique - 10) ÷ 2, arrondi à l'inférieur
  // ex: STR 16 → (16-10)/2 = 3 → +3
  getModifier: (statValue) => {
    return Math.floor((statValue - 10) / 2);
  },

  // PV au niveau 1 = valeur maximale du dé de vie + modificateur CON
  // ex: Guerrier (d10) avec CON 16 (mod +3) → 10 + 3 = 13 PV
  getStartingHP: (hitDie, conScore) => {
    const conMod = Math.floor((conScore - 10) / 2);
    return hitDie + conMod;
  },

  // Classe d'Armure de base (sans armure) = 10 + modificateur DEX
  getBaseAC: (dexScore) => {
    const dexMod = Math.floor((dexScore - 10) / 2);
    return 10 + dexMod;
  },

  // Bonus de maîtrise selon le niveau (inchangé par rapport à la 5e)
  getProficiencyBonus: (level) => {
    if (level <= 4) return 2;
    if (level <= 8) return 3;
    if (level <= 12) return 4;
    if (level <= 16) return 5;
    return 6;
  },
};
