// src/data/dnd2024/index.js — Point d'entrée du système D&D 2024
//
// Assemble espèces, classes, sorts, dons et règles en un seul objet `dnd2024`.
// Portage du module `systems/dnd2024` du RPG Character Creator.

import { dnd2024Species } from './species';
import { dnd2024Classes } from './classes';
import { dnd2024Rules } from './rules';
import { dnd2024Spells } from './spells';
import { dnd2024Feats } from './feats';

export const dnd2024 = {
  id: 'dnd2024',
  name: 'Donjons & Dragons 2024',
  description:
    'La version 2024 du Manuel du Joueur D&D — règles révisées, classes rééquilibrées, et espèces redéfinies.',
  version: '2024',
  species: dnd2024Species,
  classes: dnd2024Classes,
  spells: dnd2024Spells,
  feats: dnd2024Feats,
  rules: dnd2024Rules,
};

// Un seul système pour l'instant, mais on garde un registre pour rester extensible.
const SYSTEMS = { dnd2024 };

export function getSystem(id = 'dnd2024') {
  return SYSTEMS[id] ?? dnd2024;
}
