---
layout: post
title: "Poker as MPC, Part 3: The Correctness Diagram"
date: 2026-03-02
---

[Part 1](/2026/03/01/poker-as-mpc.html) mapped poker to Yao's millionaire problem: private hands, a public ranking function, output revelation without exposing the losers' cards. [Part 2](/2026/03/01/poker-as-mpc-part-2.html) refined this by observing that the cards are not really the secret inputs — they are parameters that shape each player's strategy function, and the strategy itself is the secret input.

Both parts were informal. They pointed at structural parallels without pinning down exactly which objects correspond to which. This time I want to be precise. There is an abstract MPC framework[^framework] that describes any protocol as a commuting square of morphisms. The question is: can we instantiate that square for poker, and if so, what does it tell us?

The answer is yes, but it requires care. Getting the types right took several passes. The corrected version is what follows.

## The framework

The framework models one protocol execution by an *execution context* $E = (\prod_i X_i) \times \Omega$. Here $X_i$ is the input space for party $i$, $\Omega$ is an ancilla space parameterizing one execution (random coins, shared randomness, whatever the protocol needs beyond the inputs), and their Cartesian product is the total space of everything that determines a single run.

A protocol is then specified by four morphisms arranged in a commuting square:

```
        π_S
  E ──────────→ ∏ S_i
  │               │
  │ π_X           │ ρ
  ↓               ↓
 ∏ X_i ────────→  Y
        f
```

$\pi_X: E \to \prod_i X_i$ is the projection that forgets the ancilla. $\pi_S: E \to \prod_i S_i$ is the protocol map, sending a full execution to per-party local contexts (partial results). $f: \prod_i X_i \to Y$ is the ideal functionality — what we want to compute. And $\rho: \prod_i S_i \to Y$ is reconstruction — how to recover the output from the local contexts.

Correctness means the square commutes: $\rho \circ \pi_S = f \circ \pi_X$. Following the top-right path (run the protocol, then reconstruct) gives the same answer as following the left-bottom path (extract inputs, then compute the ideal function). The output map $\pi_{\text{out}} = f \circ \pi_X$ is insensitive to $\Omega$ by construction — this is what "ancilla-independent" means.

## First attempt: cards as inputs

Start with the Part 1 model. Each player holds cards $h_i$. The function is $f_{\text{show}}(h_1, \ldots, h_n) = \text{argmax}_i(\text{score}(h_i))$: who has the best hand. The output is the winner's identity.

| MPC | Poker (Part 1) |
|---|---|
| $X_i$ | Hand cards $h_i$ |
| $\Omega$ | Community cards $c$ |
| $f$ | $f_{\text{show}} = \text{argmax}(\text{score}(h_i, c))$ |
| $Y$ | Winner index $\{1, \ldots, n\}$ |

This works for the showdown. If every player stays in and turns their cards over, $f_{\text{show}}$ determines who wins. But what are the local contexts $S_i$? In this model there is nothing for the protocol to do — there is no strategy, no betting, no folding. The "protocol" is just "reveal all cards and compare." The square commutes trivially, but it captures only the most degenerate sub-game of poker.

This is $f_{\text{show}}$. It is not wrong. It is just the showdown, not the game.

## Second attempt: cards plus strategies as inputs

The fix from Part 2 is to include strategy as a private input. Each player's input is now a pair $(h_i, \sigma_i)$: their hand cards $h_i \in H_i$ and their strategy $\sigma_i \in \Sigma_i(h_i)$, where $\sigma_i$ maps information sets to distributions over actions. The strategy is parameterized by the hand but is a separate object — what a player *has* versus what a player *does* are distinct.

The full mapping:

| MPC | Symbol | Poker |
|---|---|---|
| Party $i$ | $i \in \{1,\ldots,n\}$ | Player $i$ |
| Input space | $X_i$ | $(h_i, \sigma_i)$: hand cards plus strategy |
| Joint input | $\prod_i X_i$ | All hands, all strategies |
| Ancilla | $\Omega$ | $(c, r_1, \ldots, r_n)$: community cards plus each player's random coins |
| Execution context | $E = \prod_i X_i \times \Omega$ | All hands, all strategies, community cards, all random coins |
| Local context | $S_i$ | Player $i$'s realized action sequence (the ordered trace of actions $i$ actually took) |
| Output | $Y$ | $\mathbb{R}^n$: expected chip redistribution vector with $\sum_i y_i = 0$ |

And the morphisms:

| Symbol | Poker |
|---|---|
| $\pi_X: E \to \prod_i X_i$ | Forget community cards and random coins |
| $\pi_S: E \to \prod_i S_i$ | Execute the game: produce each player's realized action sequence |
| $f: \prod_i X_i \to Y$ | Compute expected payoff by integrating over $\Omega$ |
| $\rho: \prod_i S_i \to Y$ | Replay the action traces to determine chip redistribution |

Three design decisions deserve explanation.

**Strategy in $X_i$, not the game tree.** The game tree (the rules of Texas Hold'em, the betting structure, the allowed actions) is common knowledge. It is the public protocol specification. What is private is (a) the cards $h_i$ and (b) the strategy $\sigma_i$. Earlier drafts confused the public game tree with private information by putting decision trees in $X_i$. Now $X_i$ cleanly separates private input from public structure.

**Randomness in $\Omega$, not $X_i$.** Mixed strategies require randomness. A player who bluffs with probability 0.3 needs a random coin $r_i$ to determine whether this particular hand is a bluff. Where does $r_i$ live? It lives in $\Omega$, not $X_i$. The strategy $\sigma_i$ says "bluff 30% of the time." The coin $r_i$ says "this time, yes." Crucially, the ideal functionality $f$ must be ancilla-independent: it integrates out all the randomness in $\Omega$ and returns the expected payoff. If $r_i$ were in $X_i$, $f$ would depend on the coin flip and we would lose ancilla-independence.

**$Y = \mathbb{R}^n$, not $\mathbb{Z}^n$.** Nash equilibria are mixed. The ideal functionality returns the *expected* chip redistribution under the strategy profile, not the chip count from a single play. A single realization might see player 1 win \$200 or lose \$50. The ideal output is the expectation over all ancilla realizations: community cards and random coins.

## Does the diagram commute?

Here is where it gets interesting. Take a single point $e \in E$. Following the top-right path: $\rho(\pi_S(e))$ gives the actual chip redistribution for that specific play — the concrete dollars won and lost when these particular community cards fell and these particular random coins determined the bluffs. Following the left-bottom path: $f(\pi_X(e))$ gives the *expected* chip redistribution over all possible community cards and random coins.

These are not equal. For any single play, the realized outcome differs from the expected outcome. That is what variance is.

But the diagram commutes in expectation over $\Omega$:

$$\mathbb{E}_\Omega[\rho \circ \pi_S] = f \circ \pi_X$$

This is exactly the standard MPC correctness condition when $\Omega$ carries a probability measure. The protocol is correct if, averaging over the ancilla, reconstruction recovers the ideal output. A single poker hand is noisy. Over many hands with the same strategy profiles, the average chip transfer converges to the ideal.[^lln]

## Why betting rounds are necessary

In non-interactive MPC (NI-MPC), the protocol map $\pi_S$ factors as a product $\prod_i g_i$, where each $g_i: X_i \times \Omega_i \to S_i$ depends only on party $i$'s input and ancilla. Each player selects their action sequence independently, without seeing anyone else's actions.

This produces a correct protocol if and only if the game has a *dominant strategy equilibrium*: each player's optimal strategy is independent of what the other players do. Poker does not have this. Calling beats a bluff. Folding beats a value bet. Optimal play depends critically on opponents' observed actions. Therefore:

$$\rho \circ (\textstyle\prod_i g_i) \neq f \qquad \text{in general}$$

Poker requires interactive protocol rounds. The betting rounds — pre-flop, flop, turn, river — are not decorative. They are the communication rounds of an interactive MPC protocol. In each round, players observe actions (bets, raises, checks) and update their strategies accordingly. This is what drives local strategies toward mutual best responses and makes the diagram approximately commute.

There is one caveat. When a player holds the nuts[^nuts] with all community cards revealed, they *do* have a locally dominant strategy: maximize the pot. In this sub-game, the NI-MPC diagram commutes locally. But players do not know they hold the nuts until all community cards are revealed, and other players' strategies remain interdependent. Local commutativity in a sub-game does not extend to the full game.

## The subsumption

$f_{\text{show}}$ and $f_{\text{strat}}$ are not rival definitions. They are points on a spectrum.

| Layer | Symbol | Definition | What it captures |
|---|---|---|---|
| Showdown | $f_{\text{show}}: \prod_i H_i \to \{1,\ldots,n\}$ | $\text{argmax}_i(\text{score}(h_i))$ | Who has the best hand |
| Strategic | $f_{\text{strat}}: \prod_i (H_i \times \Sigma_i) \to \mathbb{R}^n$ | Expected chip redistribution under the strategy profile | Who gets how many chips |

$f_{\text{show}}$ is a degenerate case of $f_{\text{strat}}$ where every player's strategy is "always call to showdown." Under that strategy profile, $f_{\text{strat}}$ reduces to: compute $f_{\text{show}}$, award the pot to the winner. Part 1 was not wrong — it was a restriction to the simplest possible strategy profile, one where no player ever folds or bluffs.

## What this buys us

The correctness diagram is the simplest layer of the abstract MPC framework. It says only that the protocol computes the right function. It says nothing about what information leaks along the way, who learns what about whom, or how strategic signals corrupt opponents' beliefs.

Those questions belong to the *ambient diagram*: the extension of the base square with observation morphisms $\pi_A: E \to B_A$ for corruption patterns $A$, and with the information-geometric tools for analyzing what views reveal. The prediction poisoning from Part 2 — where a bluff shifts an opponent's posterior about your strategy — corresponds to analyzing the fibers of those observation maps. The information sets of extensive-form game theory correspond to the adversarial view spaces $B_A$.

That is for next time.

## Notes

[^framework]: The diagrammatic framework I am referring to works in $\mathbf{Set}_\kappa$ and models an $n$-party protocol as a commuting square: execution context $E = (\prod_i X_i) \times \Omega$, protocol map $\pi_S: E \to \prod_i S_i$, input projection $\pi_X: E \to \prod_i X_i$, ideal functionality $f: \prod_i X_i \to Y$, and reconstruction $\rho: \prod_i S_i \to Y$. Correctness is $\rho \circ \pi_S = f \circ \pi_X$. Security extends the base square with adversarial observation morphisms. See Definition 1.1 in: C.-H. Weng, "A Diagrammatic Framework for MPC Protocols: Uniform Description and Information-Geometric Security Analysis," research notes, 2025.

[^lln]: This is a law-of-large-numbers statement. The realized chip redistribution in a single hand is a random variable (random over $\Omega$) whose expectation is the ideal output $f(\pi_X(e))$. Over many independent hands with the same inputs, the sample average converges. In practice, poker players call this "running good" or "running bad" — short-term variance around long-term expectation.

[^nuts]: The "nuts" is the best possible hand given the community cards. A player holding the nuts cannot lose at showdown. Their optimal strategy — maximize the pot — is independent of opponents' strategies (though the *execution* of that strategy, i.e., how much to bet, still involves reading opponents' willingness to call). This is a local dominant strategy in the game-theoretic sense.
