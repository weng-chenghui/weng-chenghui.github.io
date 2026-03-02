---
layout: post
title: "Poker as MPC, Part 4: When the Function Fights Back"
date: 2026-03-02
---

[Part 3](/2026/03/02/poker-as-mpc-part-3.html) made the mapping precise. The abstract MPC framework gives us a commuting square: execution context $E$, protocol map $\pi\_S$, ideal functionality $f$, reconstruction $\rho$. The correctness condition $\mathbb{E}\_\Omega[\rho \circ \pi\_S] = f \circ \pi\_X$ holds in expectation. The diagram commutes. Everything checks out.

But it commutes too easily. The correctness condition quantifies over all inputs — every possible strategy profile, every possible hand combination. It says the protocol faithfully computes $f$ no matter what inputs the parties supply. This is the right guarantee when inputs are data: social security numbers, bids, medical records. When inputs are *strategies*, the interesting question is not whether the protocol computes $f$ correctly, but which inputs rational players actually supply. Part 3 promised the ambient diagram next. This detour turned out to be logically prior.

## The silent poker game

Consider a stripped-down card game. Each of $n$ players is dealt one card from a deck. Each antes one chip. Then, simultaneously and without communication, each player decides: *show* or *drop*. If you show, you enter the showdown. Among all players who show, the highest card wins the pot. If you drop, you forfeit your ante. If you are the only one who shows, you win by default.

This is poker with no betting rounds. No observation of opponents' actions, no signaling, no bluffing. Structurally, it is non-interactive MPC: the protocol map factors as $\pi\_S = \prod\_i g\_i$, where each $g\_i$ depends only on player $i$'s hand and strategy. Everyone commits their action simultaneously.

**Case 1: showing is free.** If there is no extra cost to show (you just reveal your card and enter the showdown), then showing weakly dominates dropping for every hand. Drop loses your ante for certain. Show gives you a non-negative probability of winning the pot, and in the worst case — you hold the lowest possible card and everyone else shows — you lose only the same ante you would have lost by dropping.[^freeshow] So every rational player shows, regardless of hand strength. The game collapses to $f\_{\text{show}}$. Non-interactive MPC "works" here, vacuously, because there is no strategic choice to make.

**Case 2: showing costs an extra bet $b$.** Now showing requires committing an additional $b$ chips beyond the ante. Dropping costs only the ante. A player with a weak hand might prefer to cut their losses. But here is where it gets interesting: your optimal threshold — the worst hand you are willing to show — depends on how many opponents will show, and that depends on *their* thresholds, which depend on yours.

If everyone else shows only strong hands, the bar for profitably showing goes up. If everyone else drops frequently, the bar comes down because you are more likely to win by default or face weak competition. Nash equilibrium exists[^nash] — a fixed point where everyone's threshold is a best response to everyone else's — but no player has a dominant strategy. The optimal action depends on the joint behavior.

**The observation.** In this card game, introducing a non-trivial strategic choice (where the optimal action depends on card quality and the cost-benefit tradeoff) immediately produces strategy interdependence. This is suggestive, not a general theorem. But it is not a coincidence either. The Gibbard-Satterthwaite theorem[^gs] shows that dominant-strategy mechanisms are structurally rare: beyond restricted domains like single-peaked preferences, most interesting functions do not admit protocols where each party's optimal input is independent of others' inputs.

**Contrast: dice rolling and Vickrey auctions.** Dice rolling is the trivial case — $X\_i$ is a singleton, there is nothing to compute from and nothing to protect. The right non-interactive contrast is a Vickrey auction[^vickrey]: each bidder has a private valuation, the function $f$ awards the item to the highest bidder at the second-highest price, and bidding your true valuation is a dominant strategy. Non-trivial $f$, private inputs, but no interaction needed. The NI-MPC diagram commutes at the dominant-strategy equilibrium. Poker, with its interdependent strategies, does not have this luxury.

## The exogenous assumption

Standard MPC treats the ideal functionality $f$ as exogenous: fixed before protocol design, evaluated for correctness against all possible inputs. The correctness condition $\mathbb{E}\_\Omega[\rho \circ \pi\_S] = f \circ \pi\_X$ is universal — it holds for any $(x\_1, \ldots, x\_n) \in \prod\_i X\_i$, not just "good" or "rational" inputs. This is the right formulation when you are computing a tax return or running an auction. The inputs are what they are. The protocol's job is to handle all of them faithfully.

When the inputs are strategies, the universal quantifier is still correct — the protocol should compute $f$ faithfully for any strategy profile — but it becomes insufficient. Among the uncountably many strategy profiles in $\prod\_i (H\_i \times \Sigma\_i)$, only a measure-zero set are Nash equilibria. The rest will never be supplied by rational players. The correctness diagram tells you nothing about *which* equilibria are reachable, and different equilibria produce different payoff vectors. Protocol fidelity and equilibrium selection are orthogonal questions. The diagram answers the first and is silent on the second.

## The three-level diagram

$f$ is fixed. It is a map from strategy profiles to expected payoff vectors. It does not change when you change the protocol structure. What changes is which inputs rational players select.

Under an interactive protocol $\mathcal{P}\_{\text{int}}$ — poker with betting rounds — players observe actions, update beliefs, and converge toward Nash equilibria that exploit the information from betting. Bluffing, slow-playing, check-raising: these are equilibrium strategies that exist because players can condition on observed behavior. Under a silent protocol $\mathcal{P}\_{\text{silent}}$ — the simultaneous show-or-drop game — players commit to strategies before seeing anything. Only threshold strategies are equilibria.

$\text{NE}(\mathcal{P}\_{\text{int}}) \neq \text{NE}(\mathcal{P}\_{\text{silent}})$ as subsets of $\prod\_i \Sigma\_i$. Therefore, in general, $f(\sigma^{\ast}\_{\text{int}}) \neq f(\sigma^{\ast}\_{\text{silent}})$. The effective payoff vector differs because the protocol structure determines which equilibria are reachable, and different equilibria evaluate $f$ at different points.

An analogy: $f$ is a polynomial. The polynomial does not change when you change the domain you evaluate it on. But the roots — the equilibrium points — are determined by the polynomial together with the constraints on the domain. The protocol structure is the domain constraint. Different constraints, different roots, different effective outputs. The polynomial itself is invariant.

This gives us a three-level diagram. Part 3's MPC correctness square sits inside a larger rectangle that adds the equilibrium selection layer on top:

<figure style="text-align: center; margin: 2em 0;">
<img src="/assets/diagrams/part4-three-level.svg" alt="Three-level diagram: equilibrium selection layer over MPC correctness square" style="max-width: 320px; width: 100%;">
</figure>

**Three levels, two commutativity conditions.**

The *inner square* (bottom two rows) is Part 3's MPC correctness: $\mathbb{E}\_\Omega[\rho \circ \pi\_S] = f \circ \pi\_X$. It commutes for all inputs, equilibrium or not. This is protocol fidelity. It says the protocol computes $f$ correctly regardless of what strategies the players choose.

The *outer rectangle* (all three rows) adds the equilibrium layer: $\phi\_\mathcal{G}(h) = f(h, \sigma^{\ast}(h))$. This says the effective outcome under rational play — what happens when players in game $\mathcal{G}$ supply their equilibrium strategies — equals what the protocol produces when those same equilibrium strategies are supplied. The outer rectangle commutes at equilibrium.

The *embedding arrow* is the map $h \mapsto (h, \sigma^{\ast}(h))$. A behavioral strategy $\sigma\_i^{\ast}$ is a function from hands to action distributions, chosen ex-ante from $\text{NE}(\mathcal{G})$. Given a realized hand $h\_i$, we evaluate $\sigma\_i^{\ast}(h\_i)$ to get the action distribution. This is well-typed: $\sigma^{\ast}$ is a function, $h$ is an argument, and $(h, \sigma^{\ast}(h))$ is a point in $\prod\_i (H\_i \times \Sigma\_i) = \prod\_i X\_i$.

What varies with protocol structure: different games $\mathcal{G}$ (interactive vs. silent) yield different $\text{NE}(\mathcal{G})$, hence different $\sigma^{\ast}$, hence different top rows $\phi\_\mathcal{G}$. The inner square is invariant across protocol structures. The outer rectangle changes because the embedding arrow changes.

**The equilibrium selection problem.** $\text{NE}(\mathcal{G})$ is generally a correspondence — set-valued, not single-valued. Multiple equilibria may coexist, and the diagram commutes for any $\sigma^{\ast} \in \text{NE}(\mathcal{G})$, but different choices yield different effective outcomes $\phi\_\mathcal{G}$. The correct typing is $\text{NE}: \mathcal{G} \rightrightarrows \prod\_i \Sigma\_i$, a set-valued map from game specifications to strategy profiles.

In two-player zero-sum poker, the maximin strategy is essentially unique[^minimax] — both players have a well-defined optimal strategy, and equilibrium selection is not an issue. In the general case (multiplayer, non-zero-sum), equilibrium selection is an open problem. We note this and do not pretend to resolve it. The diagram commutes for each equilibrium; which equilibrium obtains is a separate question.

## What betting rounds buy

Interactive poker's betting rounds expand the set of reachable equilibria by enabling three things that no silent protocol can provide:

1. **Conditioning on observed behavior.** A player can respond to a bet — call, raise, fold — based on what opponents have done. This creates contingent strategies that are simply inexpressible in the simultaneous-move game.

2. **Signaling and counter-signaling.** Bluffing, slow-playing, and check-raising are equilibrium strategies that exploit the information channel created by sequential play. A bluff is a costly signal designed to induce a fold. A check-raise is a counter-signal designed to exploit opponents who interpret checks as weakness. None of these exist in the silent game.

3. **Incremental belief refinement.** Each betting round reveals partial information. Players update posteriors across pre-flop, flop, turn, and river. By the final round, a player's model of opponents' ranges has been refined through multiple rounds of observation. This graduated revelation of information allows finer strategic discrimination.

This is not just "more communication." It changes the achievable payoff vectors. Interactive poker's equilibria can achieve outcomes — extracting value from weak opponents through well-timed bluffs, minimizing losses by reading strength signals early — that no silent-protocol equilibrium can reach. The set $\\{f(\sigma^{\ast}) : \sigma^{\ast} \in \text{NE}(\mathcal{P}\_{\text{int}})\\}$ is strictly richer than $\\{f(\sigma^{\ast}) : \sigma^{\ast} \in \text{NE}(\mathcal{P}\_{\text{silent}})\\}$.

## The literature

The idea that protocol structure and equilibrium selection interact is not new. Izmalkov, Micali, and Lepinski[^iml] showed that cryptographic protocols can implement "rational secure computation" — the equilibria of the real game (with the cryptographic protocol) correspond to the equilibria of the ideal game (with a trusted mediator computing $f$). This is exactly our outer rectangle: the effective outcome under the real protocol matches the effective outcome under the ideal functionality, at equilibrium. They use the simulation paradigm; the three-level diagram makes the same correspondence visual and diagrammatic.

Halpern and Teague[^ht] showed that standard cryptographic definitions break under rationality — a result we touched on in Part 2. Abraham, Dolev, Gonen, and Halpern[^adgh] combined rational and Byzantine adversary models into $k$-resilient Nash equilibria. Dodis, Halevi, and Rabin[^dhr] studied how cryptography can eliminate mediators in strategic games. Kol and Naor[^kn] identified composition problems for rational protocols, where backward induction attacks unravel sequential guarantees. Our contribution, if it is one, is not a new theorem. It is using the poker analogy to make the gap between protocol fidelity (the inner square) and equilibrium selection (the outer rectangle) concrete and visible.

## The necessary and the sufficient

The correctness diagram is necessary but not sufficient. It guarantees fidelity: if you supply inputs, the protocol computes $f$ on those inputs. It does not guarantee rationality: it says nothing about which inputs rational agents will supply. The three-level diagram captures both, but only by adding the equilibrium selection layer — a layer that is well-typed but, in the general case, set-valued and underdetermined.

There is still a missing layer. The correctness diagram says what the protocol computes. It does not say what it *reveals*. The ambient diagram — the extension of the base square with observation morphisms $\pi\_A: E \to B\_A$ for corruption patterns $A$ — is where information leakage, belief manipulation, and the prediction-poisoning adversary from Part 2 live. The three-level diagram sits inside that ambient structure. The inner square is protocol fidelity. The outer rectangle is equilibrium consistency. The ambient extension is information security. Three layers, three different questions, three different commutativity conditions. That is next.

## Notes

[^freeshow]: More precisely: if showing is free, the payoff from showing with hand $h\_i$ is $P(\text{win} \mid h\_i, \text{show}) \cdot (\text{pot}) - \text{ante}$. The payoff from dropping is $-\text{ante}$. Since $P(\text{win} \mid h\_i, \text{show}) \cdot \text{pot} \geq 0$, showing is weakly dominant. With strict inequality whenever there is any positive probability of winning, showing is strictly dominant for all but the worst possible hand (which ties the two actions).

[^nash]: Existence of Nash equilibrium in this finite game follows from Nash's theorem. J. Nash, "Non-Cooperative Games," *Annals of Mathematics*, 54(2):286-295, 1951. [DOI:10.2307/1969529](https://doi.org/10.2307/1969529)

[^gs]: The Gibbard-Satterthwaite theorem shows that any voting rule over three or more alternatives that is strategy-proof (dominant-strategy implementable) and surjective must be dictatorial. A. Gibbard, "Manipulation of Voting Schemes: A General Result," *Econometrica*, 41(4):587-601, 1973; M. Satterthwaite, "Strategy-proofness and Arrow's Conditions," *Journal of Economic Theory*, 10(2):187-217, 1975. The implication for mechanism design is that dominant-strategy mechanisms are structurally constrained to restricted domains (e.g., single-peaked preferences, single-parameter valuations).

[^vickrey]: In a Vickrey (second-price sealed-bid) auction, each bidder's dominant strategy is to bid their true valuation, regardless of others' bids. W. Vickrey, "Counterspeculation, Auctions, and Competitive Sealed Tenders," *Journal of Finance*, 16(1):8-37, 1961. [DOI:10.1111/j.1540-6261.1961.tb02789.x](https://doi.org/10.1111/j.1540-6261.1961.tb02789.x)

[^minimax]: In two-player zero-sum games, the minimax theorem guarantees that both players have optimal strategies and that the value of the game is unique. J. von Neumann, "Zur Theorie der Gesellschaftsspiele," *Mathematische Annalen*, 100(1):295-320, 1928. For poker specifically, the game-theoretic optimal (GTO) strategy is the maximin strategy. In the two-player case, it is essentially unique (up to equivalent strategies at unreached information sets).

[^iml]: S. Izmalkov, S. Micali, M. Lepinski, "Rational Secure Computation and Ideal Mechanism Design," *FOCS*, 2005. [DOI:10.1109/SFCS.2005.64](https://doi.org/10.1109/SFCS.2005.64). They show that cryptographic protocols can implement any mediator in a way that preserves the equilibrium structure of the mediated game.

[^ht]: J. Halpern, V. Teague, "Rational Secret Sharing and Multiparty Computation," *STOC*, 2004. [DOI:10.1145/1007352.1007447](https://doi.org/10.1145/1007352.1007447)

[^adgh]: I. Abraham, D. Dolev, R. Gonen, J. Halpern, "Distributed Computing Meets Game Theory: Robust Mechanisms for Rational Secret Sharing and Multiparty Computation," *PODC*, 2006. [DOI:10.1145/1146381.1146393](https://doi.org/10.1145/1146381.1146393)

[^dhr]: Y. Dodis, S. Halevi, T. Rabin, "A Cryptographic Solution to a Game Theoretic Problem," *CRYPTO*, 2000. [DOI:10.1007/3-540-44598-6_7](https://doi.org/10.1007/3-540-44598-6_7)

[^kn]: G. Kol, M. Naor, "Games for Exchanging Information," *STOC*, 2008. [DOI:10.1145/1374376.1374437](https://doi.org/10.1145/1374376.1374437)
