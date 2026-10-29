// Reward rules: 100 points = $5 off. Keep in sync with functions/src/shared.ts,
// which is what actually applies them.
export const POINTS_PER_REWARD = 100;
export const REWARD_DOLLARS = 5;

/** Dollars off the balance is worth now, and points still needed for the next $5. */
export function rewardProgress(points: number) {
  const rewards = Math.floor(points / POINTS_PER_REWARD);
  const intoNext = points % POINTS_PER_REWARD;
  return {
    dollarsOff: rewards * REWARD_DOLLARS,
    intoNext,
    toNext: POINTS_PER_REWARD - intoNext,
  };
}
