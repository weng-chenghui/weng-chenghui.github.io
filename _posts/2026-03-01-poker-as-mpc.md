---
layout: post
title: "Poker as MPC"
date: 2026-03-01
---

When you have a hammer, everything looks like a nail.

I was watching a cartoon yesterday and there was a poker scene. Nothing special, just characters bluffing and trash-talking over a hand. But somewhere between the river card and the showdown, my brain did the thing it always does: it started modeling the game as a multi-party computation[^mpc] protocol.

This is what happens when you spend years formalizing MPC. You stop seeing card games. You start seeing private inputs, evaluation rounds, and output revelation.

## The observation

Here is the setup. Every poker round, each player holds private cards. There is a public function that everyone agrees on: hand rankings. The round evaluates who has the best hand, and the pot transfers to the winner. That is it.

Strip away the felt table and the chip tricks, and you get something that looks a lot like Yao's millionaire problem[^yao]. Two millionaires want to know who is richer without revealing their actual wealth. Generalize it to n parties, replace "richer" with "better hand," and you have a poker showdown.

| | Yao's millionaires | Poker round |
|---|---|---|
| **Private input** | wealth | hand strength |
| **Public function** | argmax | argmax |
| **Output** | who is richest | who wins |
| **Hidden after** | actual wealth values | actual hand strengths |

The function $f(h_1, \ldots, h_n) = \text{argmax}(\text{score}(h_i))$ is agreed on before anyone sits down. The inputs are private. The output reveals only who won, not what the losers held. In poker you can even muck your cards and never show them.

## Virtual ownership

This is the part that caught me. A player sitting with a single chip left can go all-in and, if they win, walk away with a pile of chips worth many times their stack. Before the hand is resolved, that player "virtually owns" all those potential chips, weighted by probability.

More precisely, their expected value is:

$$E[\text{pot} \times \mathbf{1}(f \text{ outputs } i) \mid \text{hand}_i]$$

This is a local, conditional expected value[^condexp]. It can be much larger than the physical stack in front of them.

But from the global view? Total chips on the table are conserved. There is no virtual surplus. The sum of everyone's expected value, unconditionally, equals the total chips in play.

The gap between local conditional expectation and global conservation is exactly the kind of information asymmetry that makes MPC interesting in the first place. Private inputs create divergent local beliefs about the output. The protocol resolves them into a single deterministic outcome.

## Betting as protocol rounds

Now here is where it gets fun. In standard MPC, all parties are assumed to want the output. They run the protocol, they get the answer, done.

Poker is different. Players can fold. They can choose to abort the protocol partway through, forfeiting their claim on the output.

Betting rounds are communication rounds where players selectively reveal partial information. A big bet signals strength. A check signals weakness, or maybe it signals strength pretending to be weakness. The information is noisy, strategic, and deliberately misleading.

Bluffing, in this framing, is sending a false signal during a protocol round to induce another party to abort. You raise big with a bad hand. Your opponent, updating on the signal, decides the expected value of continuing is negative. They fold. You win the pot without ever evaluating $f$.

This maps to something called "MPC with rational abort,"[^abort] which is a real area of research. The idea that protocol participants might choose not to complete the computation based on intermediate information is well-studied, just not usually in the context of card games.

## Coalition breaks the security model

A coalition in poker is just players sharing private inputs before $f$ is evaluated.

If two players show each other their cards, they can compute much better estimates of $P(f \text{ outputs } i)$ for every player $i$ at the table. They know more cards are "dead," so they can narrow down what opponents might hold. They can coordinate abort strategies: one player folds a marginal hand so the other can extract maximum value.

This is collusion as input-sharing, and it directly breaks the security guarantees of the protocol. The game is only "fair" under the assumption that players do not share private inputs. In MPC terms, the protocol is secure against honest-but-curious[^semihonest] adversaries who do not collude.

Notice that coalition only helps because poker has constrained information. If the game were pure randomness, like rolling fair dice, sharing information gives zero advantage. There are no private inputs that affect the output in a useful way. This is the information-theoretic point: MPC is only useful when $f$ depends on multiple parties' private inputs in a non-trivial way.

## The multi-round game

One hand of poker is one MPC evaluation. But a full poker game is a sequence of these evaluations with state carried forward. Your chip count after round $k$ becomes the stake for round $k+1$. The meta-objective, owning all the chips, is an objective over many composed MPC instances, not a single function evaluation.

This is sequential composition[^composition] of MPC protocols with evolving stakes. Each round is independent in terms of private inputs (fresh cards), but dependent in terms of what is at risk.

## The honest disclaimer

I should be honest about what this is and what it is not.

The proper framework for poker is an extensive-form game of incomplete information[^extensive]. Bayesian game theory[^bayesian] handles everything here with more precision and more established results. Counterfactual Regret Minimization[^cfr] is the algorithm that actually solved poker variants. The concept of "virtual ownership" is just equity[^equity] in standard poker math.

The MPC lens does not add new computational tools for analyzing poker. What it does, at least for someone who thinks in protocols, is offer a clean structural parallel. Each round as an argmax evaluation. Betting as protocol communication with rational abort. Collusion as input-sharing that breaks security. These are not new insights about poker, but they are natural translations for anyone who has spent enough time in the MPC world.

When you have a hammer, everything looks like a nail. Sometimes the nail was already hammered in by someone else using a different tool. But it is still satisfying to notice it is there.

## Notes

[^mpc]: Secure multi-party computation allows $n$ parties to jointly compute a function $f(x_1, \ldots, x_n)$ over their private inputs without revealing anything beyond the output. Introduced by Yao for the two-party case and generalized by Goldreich, Micali, and Wigderson. See: A. Yao, "Protocols for Secure Computations," *FOCS*, 1982; O. Goldreich, S. Micali, A. Wigderson, "How to Play any Mental Game," *STOC*, 1987. [DOI:10.1145/28395.28420](https://doi.org/10.1145/28395.28420)

[^yao]: The millionaire problem is the canonical example of secure two-party computation: two parties wish to determine who is wealthier without revealing their actual wealth. A. Yao, "Protocols for Secure Computations," *Proceedings of the 23rd IEEE Symposium on Foundations of Computer Science*, 1982.

[^condexp]: The conditional expected value $E[X \mid Y]$ is the expected value of a random variable $X$ given knowledge of $Y$. It is a fundamental concept in probability theory. For a textbook treatment, see e.g. Chapter 4 of R. Durrett, *Probability: Theory and Examples*, Cambridge University Press.

[^abort]: In standard MPC, all parties are assumed to complete the protocol. "Fairness with abort" and rational models of protocol participation study what happens when parties may choose to stop early based on intermediate information. See: Y. Aumann, Y. Lindell, "Security Against Covert Adversaries: Efficient Protocols for Realistic Adversaries," *TCC*, 2007. [ePrint:2007/060](https://eprint.iacr.org/2007/060)

[^semihonest]: The honest-but-curious (or semi-honest) adversary model assumes parties follow the protocol correctly but may try to learn extra information from the transcript. This is distinguished from the malicious model where parties may deviate arbitrarily. See: O. Goldreich, *Foundations of Cryptography, Volume 2: Basic Applications*, Cambridge University Press, 2004.

[^composition]: Sequential composition of protocols asks whether security is preserved when protocols are run one after another, with outputs of earlier executions potentially influencing later ones. The standard framework is Canetti's Universal Composability. R. Canetti, "Security and Composition of Multiparty Cryptographic Protocols," *Journal of Cryptology*, 13(1):143-202, 2000. [DOI:10.1007/s001459910006](https://doi.org/10.1007/s001459910006)

[^extensive]: An extensive-form game represents sequential decision-making with a game tree. When players have private information, it becomes a game of incomplete information. Formalized by H. Kuhn, "Extensive Games and the Problem of Information," *Contributions to the Theory of Games, Vol. II*, Princeton University Press, 1953.

[^bayesian]: Bayesian games model situations where players have private types drawn from a known prior distribution. J. Harsanyi, "Games with Incomplete Information Played by 'Bayesian' Players, I-III," *Management Science*, 14(3,5,7), 1967-1968. [DOI:10.1287/mnsc.14.3.159](https://doi.org/10.1287/mnsc.14.3.159)

[^cfr]: Counterfactual Regret Minimization is a self-play algorithm for finding Nash equilibria in extensive-form games. It powered the AI systems that defeated professional poker players. M. Zinkevich, M. Johanson, M. Bowling, C. Piccione, "Regret Minimization in Games with Incomplete Information," *NIPS*, 2007.

[^equity]: In poker, equity is a player's expected share of the pot based on their probability of winning, given current information. For a rigorous treatment, see: B. Chen, J. Ankenman, *The Mathematics of Poker*, ConJelCo, 2006.
