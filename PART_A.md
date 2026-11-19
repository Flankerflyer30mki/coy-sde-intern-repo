# Part A: Two core features for Coy

## 1. Let users remove a crush

**The problem.**
Once you add someone to your crush list, there's no way to take them off. But crushes are temporary. A talking stage fizzles, feelings change, or you added someone on impulse. Right now that person stays in your list for good and keeps taking up one of your limited slots. Your only option is to buy more slots, which feels like being punished for something that simply didn't work out.

**The feature.**
A "Remove" option on each crush entry. Removing a crush frees the slot and stops any future match with that person.

**Why it's needed.**
- It reflects how crushes actually work. People move on, and the app should let them.
- Slots are the paid product. If users feel a slot is "wasted" forever, they trust the paywall less, not more.
- Without it, people may stop adding real crushes because the choice feels permanent.

**Privacy and abuse cases I'd design for:**
- **Silent removal.** The other person already got an anonymous heads-up. Removing should never notify them or reveal anything new. Their "someone likes you" signal should quietly expire.
- **Existing matches.** If the two of you have already matched, removing should become an explicit "Unmatch," with a confirmation, rather than a silent delete.
- **Slot cycling.** If removal instantly frees a slot, someone could add a person, wait to see if a match happens, remove them, and repeat. That lets them probe who likes them using only free slots. A cooldown fixes this: the slot frees up after a few days, and the same person can't be re-added for a while. It also protects the paid-slots model.

---

## 2. Resolve crushes to people, not to phone numbers or emails

**The problem: I reproduced this with a friend.**
Coy uses the phone number as the account, with email as an optional verified extra. I tested how the two interact:

1. My friend and I added each other by phone number and matched.
2. We both verified our emails on Coy.
3. We then added each other's verified emails as crushes.

**Expected:** Coy recognizes the same person, so it either says they're already in my list or merges the email entry into our existing match.
**Actual:** a second, separate entry showing no match, using an extra slot.

This suggests crush entries are matched on the raw phone number or email string, not on the account behind it. The same issue means that if I add someone's email and they add my phone number, we may **never match**, even though we both like each other and both identifiers are verified. Neither of us would ever know.

**The feature.**
Every crush entry should resolve to a person's account whenever it matches any of that person's verified identifiers. That includes later on, when someone verifies a new email. When two entries turn out to be the same person, merge them and give the slot back. A match should fire no matter which phone number or email each side used.

**Why it's needed.**
- **It protects the core promise.** Coy exists so mutual crushes find each other. A mutual crush that silently fails to match is the worst possible failure for this product, and users can't even see it to report it.
- **Fairness on paid slots.** Charging twice for the same person, without the user realizing it, will feel unfair once they notice.
- **It makes email verification worth doing.** Right now verifying your email doesn't seem to help you get matched.

**Privacy case I'd design for:**
The merge has to be silent and happen only on my side. If adding an email instantly showed "this person is already in your list as +91…", anyone could use Coy to find out which email belongs to which phone number. The safe behavior is to dedupe quietly in the background and only surface it when the match is already mutual.

---

## A small UI note

On desktop the app still uses a narrow phone-sized layout, and the "How Coy works" explainer sits below the crush list, so new users are unlikely to see it before they need it. Moving it above the list, or into first-time onboarding, would help new users understand the flow.
