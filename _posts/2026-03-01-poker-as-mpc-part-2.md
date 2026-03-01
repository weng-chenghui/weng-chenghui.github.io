---
layout: post
title: "Poker as MPC, Part 2: Beyond Yao"
date: 2026-03-01
---

[Last time](/2026/03/01/poker-as-mpc.html) I mapped poker to Yao's millionaire problem. Clean analogy. Private inputs, a public function, output revelation without exposing the losers' hands. It works.

But it is too clean. It misses what makes poker actually interesting.

Yao's problem assumes the parties want to learn the output. They run the protocol faithfully, they get the answer, done. Poker is not like that at all. In poker, the interesting part is everything players do to prevent each other from learning the output correctly.

## The showdown ranking is already decided

Here is the thing I kept circling back to. Once the dealer deals the cards, the *showdown ranking* is determined. If every player stayed in to the end and turned their cards over, $\text{argmax}(\text{score}(h_i))$ would tell you who wins. That much is fixed at deal time.

But the showdown ranking is not the result. The result is who gets the chips and how many. And that depends on what players actually *do*: who bets, who folds, who bluffs, how large the pot grows. Two identical deals can produce completely different chip transfers. The cards fix the parameters. They do not fix the outcome.

This requires refining the Part 1 mapping. There I wrote $f(h_1, \ldots, h_n) = \text{argmax}(\text{score}(h_i))$, treating cards as the private inputs to the computation. That is correct for the showdown, but the showdown is only one possible endpoint. The actual computation is $f(s_1(h_1), \ldots, s_n(h_n))$, where each $s_i$ is player $i$'s strategy, parameterized by their hand $h_i$. The cards are not the secret inputs. They are parameters that shape each player's strategy function. The strategy itself is the secret input.

## Actions as prediction poisoning

In a standard MPC protocol, a malicious adversary[^malicious] might tamper with messages, substitute inputs, or abort early. These attacks target the computation itself. The adversary tries to make $f$ evaluate incorrectly or to learn more than the output.

Poker players do none of this. They cannot change the cards. They cannot alter the hand-ranking function. They cannot peek at other players' private inputs. But their actions are not mere commentary on a finished computation. Each bet, raise, and fold is a step in evaluating $f(s_1, \ldots, s_n)$. The strategies are the inputs, and the strategies unfold through play. The computation is happening in real time.

A big bet says "I am strong." A slow call says "I am uncertain." A check-raise says "I was hiding strength." Each of these is a signal[^signaling] designed to shift an opponent's posterior, but not just their belief about the showdown ranking. What is really being poisoned is the opponent's model of your *strategy*. If they misread your strategy, they misplay their own, and the actual outcome shifts.

This has a Bayesian persuasion[^persuasion] flavor, but with a critical difference. In textbook Bayesian persuasion, the state of the world is fixed and the sender designs signals to shift beliefs about that fixed state. In poker, the outcome genuinely changes based on the actions taken. A successful bluff does not just make the opponent *believe* you will win. It makes you actually win. The persuasion changes the computation, not just the belief about it.

The other difference from the textbook setup is that in poker, everyone is simultaneously a sender and a receiver. Every player is trying to make opponents misread their strategy while also trying to accurately read everyone else's. It is persuasion in all directions at once, where the thing being persuaded about is itself shaped by the persuasion.

## A new kind of adversary

This does not fit neatly into the existing MPC adversary taxonomy.

The honest-but-curious adversary follows the protocol and tries to learn extra information. The malicious adversary deviates from the protocol arbitrarily. The covert adversary[^covert] deviates but only if the probability of getting caught is low enough. The rational adversary[^rational] maximizes a utility function and deviates only when it is profitable.

None of these quite capture what poker players do. A poker player does not deviate from the protocol. Betting, raising, folding: these are all legal moves within the rules. The "corruption" is the game itself. The adversary model is baked into the protocol specification.

If we broaden what counts as a "message" to include everything a player uses to update their beliefs, then yes, players are corrupting each other's message channels. Bets, timing tells, physical behavior, table history: all of it is information, and all of it is strategically manipulated. But this "corruption" is not a security violation. It is the entire point.

The closest existing work I have found sits at the intersection of several threads. Rational cryptography[^halpern] gives adversaries utility functions. Garay, Katz, and collaborators[^rpd] formalize protocol design against incentive-driven adversaries. Hunter[^hunter] models belief manipulation in security protocols. Gradwohl, Livne, and Rosen[^sequential] study sequential rationality in cryptographic settings, and Hubacek, Nielsen, and Rosen[^cheaptalk] explore the limits of cryptographic cheap talk[^ct].

But no existing framework combines all of this into a single adversary model where the sole attack vector is corrupting other parties' Bayesian posteriors through strategic signaling, without any tampering with computation, messages, or inputs. The pieces are all there. The combination is not.

## The spectrum of views

Here is another way to see what is going on.

The global view is what you would see if you turned all cards face up. You would know the showdown ranking and, with it, the optimal strategy profile: the Nash equilibrium play given perfect information. But you would not know the actual outcome, because the actual outcome still requires the strategies to be executed. The zero-interaction view tells you what *should* happen under optimal play. It does not tell you what *will* happen.

Each player's local view is different. They see their own cards. They see the community cards as they are revealed. And they see the full history of every action every player has taken. Their model of each opponent's strategy is conditioned on all of this.

So every view, from the omniscient global view to any player's local view, is a point on a spectrum. The spectrum is parameterized by how much of the action history you condition on. The global view conditions on nothing and gives you the strategy profile that rational play would dictate. A player who just sat down conditions only on their own cards. A player deep into the hand conditions on their cards plus every bet, raise, check, and fold that has happened so far.

The interesting thing is that conditioning on more information does not always improve your model of opponents' strategies. If the information has been strategically poisoned, more data can make your estimate worse. This is the whole mechanism of a successful bluff: the target conditions on a false signal and arrives at a worse model than if they had ignored the signal entirely.

## The action trace as an integral

Think of all the player actions in a single hand as forming a trace[^trace]. Every bet, check, call, raise, and fold, in order, from every player. This is the protocol transcript.

The final chip distribution is a functional[^functional] of this trace. It is not determined by the cards alone. If it were, there would be no folding, no bluffing, no poker. The cards determine who would win at showdown, but the trace determines who actually wins the pot, and how big that pot is.

Each micro-decision along the trace contributes a differential step to the final outcome. A hesitation that telegraphs weakness. A bet size that signals confidence. A fold that surrenders equity. Each one shifts the eventual chip transfer by some amount.

This has a path integral[^pathintegral] flavor. The outcome is not determined by endpoints alone but by the entire path of interactions. Two hands with the same cards and the same board can produce completely different chip transfers depending on the action trace. The integral over the path is what matters.

## Micro-rounds and macro-rounds

Within a single betting round, each new piece of information triggers a local re-evaluation. A raise forces you to update your estimate of an opponent's range. A long pause before calling suggests uncertainty. A snap-call suggests strength or indifference.

These are micro-rounds. They are not formal protocol rounds in the game-theoretic sense, but they are real updates to each player's information set[^infoset]. Every micro-round produces a new local posterior, and the player's next action is a function of that updated belief.

The macro-round is one full hand of poker. It starts with the deal, runs through all the betting rounds, and ends with a showdown or with everyone but one player having folded. At the macro level, the round determines who gains chips and who loses them. If someone loses everything, they are forced to abort: they are out of the game. This is bankruptcy as protocol abort.

The meta-game across many macro-rounds introduces yet another layer. Each player's expected number of remaining rounds is itself an expected value that updates after every hand. A player with a big stack has a long expected horizon. A player on a short stack has a narrow one. This expected survival horizon shapes strategy at every level: it changes which micro-decisions are rational, which in turn changes the trace, which in turn changes the final chip distribution.

## What this is and what it is not

I want to be honest about the same thing I was honest about last time. This is a lens, not a theory.

The observation that poker's showdown ranking is fixed at deal time is not new. Poker players call this "running it twice"[^runtwice] or calculating equity. The idea that players manipulate each other's beliefs through betting is the foundation of game-theoretic poker analysis going back decades.

What is new, at least to me, is noticing that these observations map onto specific open questions in the intersection of MPC and game theory. The "prediction-poisoning adversary" is not a named concept in the literature, but it sits at a well-defined intersection of Bayesian persuasion, rational cryptography, and strategic signaling. The pieces exist. Connecting them through the poker analogy makes the gap visible.

Yao asks: can we compute $f$ without revealing inputs? Poker asks: given that the parameters are fixed but the strategies are private, how does strategic interaction shape both the computation and others' beliefs about it? The outcome is not pre-computed. It is emergent from the strategy interaction, and the strategies themselves are the secret inputs that the MPC is evaluating.

Different question. Surprisingly similar structure. And the second question does not yet have a formal framework.

## Notes

[^malicious]: In the malicious adversary model for MPC, corrupted parties may deviate arbitrarily from the protocol specification. This is the strongest standard adversary model. See: O. Goldreich, S. Micali, A. Wigderson, "How to Play any Mental Game," *STOC*, 1987. [DOI:10.1145/28395.28420](https://doi.org/10.1145/28395.28420)

[^signaling]: Signaling games model strategic communication where a sender's actions convey information to a receiver. The foundational model is: V. Crawford, J. Sobel, "Strategic Information Transmission," *Econometrica*, 50(6):1431-1451, 1982. [DOI:10.2307/1913390](https://doi.org/10.2307/1913390)

[^persuasion]: Bayesian persuasion formalizes how a sender can design an information structure to optimally shift a receiver's beliefs about a fixed state of the world. E. Kamenica, M. Gentzkow, "Bayesian Persuasion," *American Economic Review*, 101(6):2590-2615, 2011. [DOI:10.1257/aer.101.6.2590](https://doi.org/10.1257/aer.101.6.2590)

[^covert]: The covert adversary model captures parties who are willing to cheat but only if the probability of being detected is sufficiently low. Y. Aumann, Y. Lindell, "Security Against Covert Adversaries: Efficient Protocols for Realistic Adversaries," *TCC*, 2007. [DOI:10.1007/978-3-540-70936-7_8](https://doi.org/10.1007/978-3-540-70936-7_8)

[^rational]: Rational cryptography models protocol participants as utility-maximizing agents rather than arbitrarily malicious ones. Early work includes: J. Halpern, V. Teague, "Rational Secret Sharing and Multiparty Computation," *STOC*, 2004. [DOI:10.1145/1007352.1007447](https://doi.org/10.1145/1007352.1007447)

[^halpern]: J. Halpern, V. Teague, "Rational Secret Sharing and Multiparty Computation," *Proceedings of the 36th Annual ACM Symposium on Theory of Computing*, pp. 623-632, 2004. [DOI:10.1145/1007352.1007447](https://doi.org/10.1145/1007352.1007447)

[^rpd]: J. Garay, J. Katz, U. Maurer, B. Tackmann, V. Zikas, "Rational Protocol Design: Cryptography against Incentive-Driven Adversaries," *FOCS*, 2013. [DOI:10.1109/FOCS.2013.75](https://doi.org/10.1109/FOCS.2013.75)

[^hunter]: A. Hunter, "Belief Manipulation and Message Meaning for Protocol Analysis," *Security Informatics*, 3(15):1-11, 2014. [DOI:10.1186/s13388-014-0015-3](https://doi.org/10.1186/s13388-014-0015-3)

[^sequential]: R. Gradwohl, N. Livne, A. Rosen, "Sequential Rationality in Cryptographic Protocols," *FOCS*, 2010. [DOI:10.1109/FOCS.2010.65](https://doi.org/10.1109/FOCS.2010.65)

[^cheaptalk]: P. Hubacek, J. B. Nielsen, A. Rosen, "Limits on the Power of Cryptographic Cheap Talk," *CRYPTO*, 2013. [DOI:10.1007/978-3-642-40041-4_16](https://doi.org/10.1007/978-3-642-40041-4_16)

[^ct]: Cheap talk refers to costless, non-binding communication in game-theoretic settings. The term originates from: J. Farrell, "Cheap Talk, Coordination, and Entry," *RAND Journal of Economics*, 18(1):34-39, 1987.

[^trace]: In MPC, the protocol transcript is the ordered sequence of all messages exchanged during execution. See: O. Goldreich, *Foundations of Cryptography, Volume 2: Basic Applications*, Cambridge University Press, 2004.

[^functional]: A functional maps a function to a scalar. Here, the chip distribution is a functional of the entire action trace, not just its endpoints. For background on functionals in the context of path-dependent outcomes, see any textbook on functional analysis or calculus of variations.

[^pathintegral]: The path integral formulation of quantum mechanics computes amplitudes by summing contributions from all possible paths, not just the classical trajectory. R. Feynman, A. Hibbs, *Quantum Mechanics and Path Integrals*, McGraw-Hill, 1965. Dover emended edition, 2010. The analogy here is loose: poker outcomes depend on the full action path, not just the initial and final states.

[^infoset]: An information set groups all game states that a player cannot distinguish given their available information. Formalized by H. Kuhn, "Extensive Games and the Problem of Information," *Contributions to the Theory of Games, Vol. II*, Princeton University Press, 1953.

[^runtwice]: "Running it twice" is a practice where, after all betting is complete, the remaining community cards are dealt twice to reduce variance. It highlights that the showdown ranking is a deterministic function of the cards. But by the time players run it twice, the betting is already over: the strategies have been played, the pot size is fixed, and only the showdown resolution remains. The strategic outcome was already determined by the action trace. For poker mathematics, see: B. Chen, J. Ankenman, *The Mathematics of Poker*, ConJelCo, 2006.
