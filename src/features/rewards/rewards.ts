// Reward rules: 100 points = $5 off, plus a welcome bonus on the first order. Keep in sync with functions/src/shared.ts,
// which is what actually applies them.
export const POINTS_PER_REWARD = 100;
export const REWARD_DOLLARS = 5;
/** Extra points on the first order, if its pre-tax subtotal is at least the minimum. */
export const WELCOME_BONUS_POINTS = 200;
export const WELCOME_BONUS_MIN_SUBTOTAL = 15;

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
