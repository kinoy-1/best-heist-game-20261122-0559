// The getaway: what happens when the Fox reaches the van with the night's
// sound. The van door opens, the score is tallied — target, side loot, a
// time bonus and a ghost bonus for never being seen — the coins are banked,
// the heat rises, and the next gallery unlocks. The getaway is the payoff
// the third criterion asks for: the planning pays off in the open.
import { nightScore } from './loot.js';
import { getawaySpeed } from './crew.js';
import { heatAfterNights, isFinalNight } from './heat.js';

/** Escape: tally the night, bank the coins, open the next gallery. */
export function escapeNight(state, secondsTaken) {
  const breakdown = nightScore(state, secondsTaken);
  state.thief.score += breakdown.timeBonus + breakdown.ghostBonus;
  state.bankedCoins += state.thief.coins;
  state.bankedScore += state.thief.score;
  state.lastBreakdown = breakdown;
  state.nightsDone += 1;
  state.heat = heatAfterNights(state.nightsDone);
  state.screen = isFinalNight(state.nightIndex) ? 'campaign' : 'escaped';
  state.events.push({ type: 'escape', text: `Got away clean — ${breakdown.total} points this night.` });
  return breakdown;
}

/** Seconds the getaway drive takes on screen, before the tally. */
export function getawaySeconds(state) {
  return 2.4 / getawaySpeed(state);
}

/** The campaign's final tally after all seven nights. */
export function campaignTotal(state) {
  return {
    score: state.bankedScore,
    coins: state.bankedCoins,
    nights: state.nightsDone,
    cases: state.totalCasesOpened,
    timesSeen: state.thief.timesSeen,
  };
}
