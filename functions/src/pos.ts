// Functions the POS calls. Every one requires the POS login (role: "pos").
// Each order earns once and redeems once: transaction ids earn_<orderId> /
// redeem_<orderId> / reverse_<orderId> make every call safe to retry.
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  db,
  MAX_REWARD_STEPS,
  memberRef,
  normalizePhone,
  POINTS_PER_DOLLAR,
  POINTS_PER_REWARD,
  requireId,
  requirePos,
  REWARD_DOLLARS,
  transactionRef,
} from "./shared.js";

type MemberSummary = { uid: string; name: string; phone: string; points: number };

/** Find a member by QR (uid) or by phone number. Input: { uid } or { phone }. */
export const lookupMember = onCall(async (request): Promise<{ member: MemberSummary }> => {
  requirePos(request);
  const { uid: rawUid, phone: rawPhone } = (request.data ?? {}) as {
    uid?: unknown;
    phone?: unknown;
  };

  let uid: string;
  if (rawUid !== undefined) {
    uid = requireId(rawUid, "uid");
  } else {
    const phone = normalizePhone(rawPhone);
    if (!phone) throw new HttpsError("invalid-argument", "Enter a 10-digit phone number.");
    const phoneDoc = await db().doc(`phoneNumbers/${phone}`).get();
    if (!phoneDoc.exists) throw new HttpsError("not-found", "No member with this phone number.");
    uid = phoneDoc.get("uid") as string;
  }

  const snap = await memberRef(uid).get();
  if (!snap.exists) throw new HttpsError("not-found", "Member not found.");
  const m = snap.data() as { name: string; phone: string; points: number };
  return { member: { uid, name: m.name, phone: m.phone, points: m.points ?? 0 } };
});

/**
 * 1 point per $1 of the pre-tax subtotal (whole points, rounded down), once per order.
 * Input: { uid, orderId, subtotal }. Calling again for the same order changes nothing.
 */
export const earnPoints = onCall(async (request) => {
  requirePos(request);
  const data = (request.data ?? {}) as { uid?: unknown; orderId?: unknown; subtotal?: unknown };
  const uid = requireId(data.uid, "uid");
  const orderId = requireId(data.orderId, "orderId");
  const subtotal = data.subtotal;
  if (
    typeof subtotal !== "number" ||
    !Number.isFinite(subtotal) ||
    subtotal < 0 ||
    subtotal > 100_000
  ) {
    throw new HttpsError("invalid-argument", "subtotal must be a dollar amount.");
  }
  // Small epsilon so float noise (41.99999999) doesn't lose a point.
  const points = Math.floor(subtotal * POINTS_PER_DOLLAR + 1e-9);

  return db().runTransaction(async (tx) => {
    const mRef = memberRef(uid);
    const tRef = transactionRef(uid, `earn_${orderId}`);
    const [member, existing] = await Promise.all([tx.get(mRef), tx.get(tRef)]);
    if (!member.exists) throw new HttpsError("not-found", "Member not found.");
    const balance = (member.get("points") as number) ?? 0;

    if (existing.exists) {
      return { pointsEarned: existing.get("points") as number, balance, alreadyEarned: true };
    }
    if (points === 0) return { pointsEarned: 0, balance, alreadyEarned: false };

    tx.create(tRef, { type: "earn", points, orderId, subtotal, createdAt: Timestamp.now() });
    tx.update(mRef, { points: FieldValue.increment(points) });
    return { pointsEarned: points, balance: balance + points, alreadyEarned: false };
  });
});

/**
 * Spend points for a discount: each step is 100 points = $5 off. Once per order.
 * Input: { uid, orderId, steps }. Returns the dollar discount for the POS to apply.
 */
export const redeemPoints = onCall(async (request) => {
  requirePos(request);
  const data = (request.data ?? {}) as { uid?: unknown; orderId?: unknown; steps?: unknown };
  const uid = requireId(data.uid, "uid");
  const orderId = requireId(data.orderId, "orderId");
  const steps = data.steps;
  if (
    typeof steps !== "number" ||
    !Number.isInteger(steps) ||
    steps < 1 ||
    steps > MAX_REWARD_STEPS
  ) {
    throw new HttpsError(
      "invalid-argument",
      `steps must be a whole number from 1 to ${MAX_REWARD_STEPS}.`,
    );
  }
  const cost = steps * POINTS_PER_REWARD;
  const discount = steps * REWARD_DOLLARS;

  return db().runTransaction(async (tx) => {
    const mRef = memberRef(uid);
    const tRef = transactionRef(uid, `redeem_${orderId}`);
    const [member, existing] = await Promise.all([tx.get(mRef), tx.get(tRef)]);
    if (!member.exists) throw new HttpsError("not-found", "Member not found.");
    const balance = (member.get("points") as number) ?? 0;

    if (existing.exists) {
      return {
        pointsRedeemed: -(existing.get("points") as number),
        discount: existing.get("discount") as number,
        balance,
        alreadyRedeemed: true,
      };
    }
    if (balance < cost) {
      throw new HttpsError(
        "failed-precondition",
        `Not enough points: has ${balance}, needs ${cost}.`,
      );
    }

    tx.create(tRef, {
      type: "redeem",
      points: -cost,
      orderId,
      discount,
      createdAt: Timestamp.now(),
    });
    tx.update(mRef, { points: FieldValue.increment(-cost) });
    return { pointsRedeemed: cost, discount, balance: balance - cost, alreadyRedeemed: false };
  });
});

/**
 * Order cancelled: removes points it earned and refunds points it redeemed, once.
 * Input: { uid, orderId }. The balance never goes below 0: if the earned points were
 * already spent, only what's left is removed (the record shows what was applied).
 */
export const reverseOrder = onCall(async (request) => {
  requirePos(request);
  const data = (request.data ?? {}) as { uid?: unknown; orderId?: unknown };
  const uid = requireId(data.uid, "uid");
  const orderId = requireId(data.orderId, "orderId");

  return db().runTransaction(async (tx) => {
    const mRef = memberRef(uid);
    const rRef = transactionRef(uid, `reverse_${orderId}`);
    const [member, earned, redeemed, existing] = await Promise.all([
      tx.get(mRef),
      tx.get(transactionRef(uid, `earn_${orderId}`)),
      tx.get(transactionRef(uid, `redeem_${orderId}`)),
      tx.get(rRef),
    ]);
    if (!member.exists) throw new HttpsError("not-found", "Member not found.");
    const balance = (member.get("points") as number) ?? 0;

    if (existing.exists) {
      return { pointsChanged: existing.get("points") as number, balance, alreadyReversed: true };
    }
    if (!earned.exists && !redeemed.exists) {
      return { pointsChanged: 0, balance, alreadyReversed: false };
    }

    // Undo both: earn was +N (now -N), redeem was -N (now +N).
    const fullChange =
      -((earned.get("points") as number | undefined) ?? 0) -
      ((redeemed.get("points") as number | undefined) ?? 0);
    // Stop at 0 instead of going negative.
    const change = Math.max(fullChange, -balance);

    tx.create(rRef, { type: "reverse", points: change, orderId, createdAt: Timestamp.now() });
    tx.update(mRef, { points: FieldValue.increment(change) });
    return { pointsChanged: change, balance: balance + change, alreadyReversed: false };
  });
});
