// Loot: what the museum keeps in glass. Every display case holds one
// bottled sound in a tier — Common (Brass Echo, 40 coins), Rare (Silver
// Whisper, 120) or Legendary (Golden Voice, 320) — and the night's pedestal
// holds the one sound that matters, worth the night's target value. Loot in
// the pockets is worth coins; coins buy tools and Shadowcraft upgrades; the
// target is what the getaway van is waiting for.
import { LOOT_TIERS } from './config.js';

export const LOOT_NAMES = {
  common: ['Brass Echo', 'Copper Sigh', 'Tin Giggle', 'Bronze Hush', 'Pewter Murmur'],
  rare: ['Silver Whisper', 'Crystal Chime', 'Velvet Footstep', 'Moonlit Hum', 'Ivory Note'],
  legendary: ['Golden Voice', 'The First Thunder', 'A Phoenix Cry', 'The Ocean\u2019s Secret', 'Starlight Carol'],
};

/** Value of a case's tier in coins. */
export function caseValue(tier) {
  return LOOT_TIERS[tier].value;
}

/** The display colour of a tier. */
export function tierColor(tier) {
  return LOOT_TIERS[tier].color;
}

/** A human name for a case, from its tier and its index in the room. */
export function caseName(c, index) {
  const names = LOOT_NAMES[c.tier];
  return names[index % names.length];
}

/** How many cases are still sealed in this room. */
export function casesLeft(room) {
  return room.cases.filter((c) => !c.opened).length;
}

/** Total coins the thief has carried out across the whole campaign. */
export function campaignCoins(state) {
  return state.thief.coins + state.bankedCoins;
}

/** Score for a night: target value, side loot, time bonus, ghost bonus. */
export function nightScore(state, secondsTaken) {
  const target = state.night.targetValue;
  const side = state.thief.loot.reduce((sum, item) => sum + item.value, 0);
  const timeBonus = Math.max(0, Math.round((300 - secondsTaken) * 2));
  const ghostBonus = state.thief.ghost ? 250 : 0;
  return { target, side, timeBonus, ghostBonus, total: target + side + timeBonus + ghostBonus };
}
