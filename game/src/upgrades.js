// Shadowcraft: the upgrade tree the Fox buys between nights with stolen
// coins. Five named tracks, three ranks each, each rank a real change to the
// numbers the other systems read — quieter shoes slow every cone, longer
// smoke stretches every puff, bigger pockets hold more loot, faster hands
// crack cases sooner, steadier nerves drop the alarm faster.
import { UPGRADES } from './config.js';

export function emptyUpgrades() {
  return { shoes: 0, smoke: 0, pockets: 0, hands: 0, nerves: 0 };
}

export function upgradeById(id) {
  return UPGRADES.find((u) => u.id === id);
}

/** The coin cost of the next rank, or null when the track is maxed. */
export function nextUpgradeCost(upgrades, id) {
  const track = upgradeById(id);
  if (!track) return null;
  const rank = upgrades[id] || 0;
  if (rank >= track.maxRank) return null;
  return track.costs[rank];
}

/** Buy one rank. Returns true when the coins covered it. */
export function buyUpgrade(state, id) {
  const cost = nextUpgradeCost(state.upgrades, id);
  if (cost === null) return false;
  if (state.thief.coins < cost) return false;
  state.thief.coins -= cost;
  state.upgrades[id] = (state.upgrades[id] || 0) + 1;
  const track = upgradeById(id);
  state.events.push({ type: 'upgrade', text: `${track.name} rank ${state.upgrades[id]} bought.` });
  return true;
}

/** Total ranks bought across all five tracks. */
export function totalRanks(upgrades) {
  return Object.values(upgrades).reduce((sum, rank) => sum + rank, 0);
}

/** One-line summary of the tree for the night-select screen. */
export function upgradeSummary(upgrades) {
  return UPGRADES.map((track) => `${track.name} ${upgrades[track.id] || 0}/${track.maxRank}`).join('  ·  ');
}
