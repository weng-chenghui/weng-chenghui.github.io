---
layout: post
title: "Inverting the Formalization Workflow"
date: 2026-03-12
---

At a workshop, a speaker made a point that landed with the room. Theorem proving, he argued, is not feasible for many industries. The timelines are too long. The expertise required is too specialized. Unless you are building something where full verification is non-negotiable, like nuclear safety systems, model checking[^modelcheck] is the pragmatic path: automatic, push-button, good enough for most properties you care about.

The audience nodded. I did too. The timelines he cited are real. But months later, after working with AI-assisted formalization on my own projects, I kept coming back to a question: what if the timeline is the part that changes?

## The long march from idea to proof

Cryptographic protocol design moves slowly from concept to verified implementation. The timescales are measured in years.

TLS 1.3[^tls13] took roughly four years from the first IETF drafts in 2014 to the publication of RFC 8446 in August 2018. Formal analysis ran in parallel. Cremers et al.[^cremerstls] performed a comprehensive symbolic analysis using Tamarin. Bhargavan et al.[^bhargavantls] implemented and proved the record layer using F\*[^fstar]. These were major research efforts by specialized teams, not side projects.

The Messaging Layer Security protocol[^mls] followed a similar arc. Initial discussions began around 2016, the IETF working group was chartered in 2018, and RFC 9420 was published in July 2023. The formal analysis by Wallez et al.[^wallez] on TreeSync, the group membership component, appeared at USENIX Security 2023 and won a Distinguished Paper Award. The Noise Protocol Framework[^noise] tells the same story: Trevor Perrin began the design around 2013, the specification reached its current revision in 2018, and Kobeissi et al.[^noiseexplorer] published the first fully automated formal verification of Noise handshake patterns in 2019 using ProVerif[^proverif]. Five to seven years from concept to formal analysis, every time.

The timeline problem is not limited to new protocols. Even without full formalization, just finding bugs in existing schemes takes years of expert attention. Josh Benaloh proposed Dense Probabilistic Encryption[^benaloh] in 1994. Sixteen years later, Fousse, Lafourcade, and Alnuaimi[^fousse] discovered that the original key generation description was incorrect, potentially causing ambiguous decryption. In e-voting applications, where Benaloh's scheme is widely used, this bug could invert election results. Sixteen years from publication to bug discovery, via pen-and-paper analysis, not formalization.

This opens a second angle. AI-prototyped formal verification could not only accelerate designing new protocols but also systematically audit existing ones. Formalization forces every assumption to be explicit. A machine-checked model of Benaloh's scheme would have surfaced the key generation condition immediately, because the prover would refuse to complete the correctness proof without it. The bug hid for sixteen years precisely because pen-and-paper proofs allow implicit assumptions to slip through.

## The tools we have

Every formal verification tool for crypto protocols makes tradeoffs. Here is the landscape.

On the symbolic side, ProVerif[^proverif] and Tamarin[^tamarin] both analyze protocols in the Dolev-Yao model[^dy] but make different bets. ProVerif, developed by Bruno Blanchet, is automatic: you write the protocol model, press a button, and get a result. It translates protocols into Horn clauses[^horn] and handles an unbounded number of sessions, which is essential for protocol analysis. The cost is precision. The Horn clause abstraction is an over-approximation that can report false attacks not corresponding to real protocol executions. ProVerif also cannot natively model associative-commutative operators[^ac], which means Diffie-Hellman key exchange[^dh] requires approximations rather than exact modeling. Tamarin, developed by Meier, Schmidt, Cremers, and Basin, handles Diffie-Hellman natively through built-in equational theories and avoids some of ProVerif's false-attack problems. The cost is interactivity: Tamarin often requires the user to supply proof strategies or lemmas to guide the search.

On the computational side, EasyCrypt[^easycrypt] and CryptoVerif[^cryptoverif] work in the model cryptographers actually use[^compmodel]: probabilistic polynomial-time adversaries, negligible advantages, reduction-based proofs. EasyCrypt, developed by Barthe et al., can express these arguments formally, but the user must guide the high-level proof structure interactively while SMT solvers handle lower-level reasoning. CryptoVerif, also by Blanchet, offers more automation through game transformations[^gametransform] but has its own restrictions on what protocols and properties it can handle.

The tension is clear. Automatic tools sacrifice expressiveness. Expressive tools sacrifice automation. No single tool covers the full space.

A concrete example illustrates this. Kobeissi et al.'s Noise Explorer[^noiseexplorer] generates ProVerif models automatically for any Noise handshake pattern. This is impressive automation. But because ProVerif cannot model Diffie-Hellman with full associative-commutative properties, and because the generated models do not verify against compromised ephemeral keys, the analysis has known blind spots. The tool-restriction tradeoff is not theoretical. It shows up in practice.

## What changes with AI-prototyped verification

Given all this, here is the workflow I have in mind. You have a protocol idea, or an existing protocol you want to audit. Instead of spending months learning the formalization toolchain and the protocol's domain in sufficient depth to write a formal model from scratch, you use an AI to draft the formal specification. The AI produces a ProVerif or Tamarin model, or an EasyCrypt sketch, based on the protocol description. Then you run the prover. It either checks or it does not.

Three distinct roles. The AI drafts. The theorem prover checks. The human judges whether the result is meaningful and steers the next iteration.

This is not automated theorem proving. That is a separate project entirely. Systems like AlphaProof[^alphaproof] autonomously search for proofs of hard mathematical theorems. What I am describing is more modest: using AI as a rapid prototyping tool for formal models, with the prover as the quality gate and the human as the meaning-maker. You could call it a poor man's AlphaProof, but the goal is fundamentally different. The goal is not to automate proving. It is to make the human formalization workflow faster by offloading the drafting burden.

This connects directly to the ideas in two earlier articles. In [Formalization as a Search Engine for Knowledge]({% post_url 2026-03-10-formalization-as-knowledge-exploration %}), I argued that formalization extends the frontier of what we can explore by providing a quality gate for AI-generated reasoning. In [Formalization as a Verdicting Technique for AI]({% post_url 2026-03-11-formalization-as-verdicting-for-ai %}), I distinguished between fact-checking and verdicting: the prover does not store facts, it checks whether arguments follow from premises. Both ideas apply here. The prover verdicts the AI's draft. The formalization becomes a search engine for protocol vulnerabilities.

There is early evidence that this combination works. CryptoFormalEval[^cryptoformaleval], a recent benchmark by Curaba et al., integrates large language models with formal verification for automated cryptographic protocol vulnerability detection. The results are preliminary, but the direction is clear: AI can draft protocol models that formal tools then check.

## The inverse learning model

So far this sounds like a speed optimization. Draft faster, iterate faster, get to the same place sooner. But something more interesting happens when you flip the order.

The traditional workflow looks like this: study the domain deeply, understand the protocol, understand the security model, understand the formalization tool, and then formalize. Knowledge comes first. Formalization comes second. This is why it takes years. You cannot formalize what you do not understand, and understanding takes time.

In the inverse workflow, AI drafts a formal model of the protocol. The prover checks it. Some parts pass, some fail. The failures are informative: they tell you exactly where the model's assumptions break down, where the security properties do not hold, where the formalization was too coarse. You study the failures. You learn the domain from the structured output of the formalization attempt, not from unstructured reading.

The formalization becomes the learning material. It is scoped, structured, and precise. Instead of reading a hundred pages of protocol specification to understand which assumptions matter, you read the prover's output and see which assumptions the proof depends on. The chicken-and-egg problem dissolves: you needed domain knowledge to formalize, but you needed formalization to verify ideas. AI breaks the cycle by providing a first draft that is good enough to fail informatively.

For researchers with limited time, and most researchers have limited time, this is transformative. A PhD student with a day job cannot spend six months studying a protocol domain before knowing whether their idea has merit. But they can spend an afternoon iterating with AI and a prover, getting structured feedback on which parts of their idea hold up and which do not. The workflow filters gold from delusion quickly, before the major time investment.

## Wide knowledge as advantage

Large language models have a property that is usually framed as a weakness: they know a little about everything and a lot about nothing. Wide but shallow knowledge. For most tasks, this is a liability. For prototyping formal models across domains, it becomes an asset.

Cryptographic protocol design draws on algebra, probability theory, network models, complexity theory, and domain-specific knowledge about the application context. A researcher typically has deep expertise in one or two of these areas and relies on collaborators or literature for the rest. An LLM can sketch connections across all of them simultaneously. The sketches will be rough. Some will be wrong. But the prover filters the hallucinations. What survives the prover's check is at least logically consistent.

The wider the prototype idea's domain requirements, the more the AI can help explore connections that no single researcher would think to try. The prover ensures that breadth does not come at the cost of correctness.

## What this is not

I should be honest about the limitations.

AI-generated formal models are starting points, not expert formalizations. They will miss subtleties that a domain expert would catch. They will sometimes model the wrong properties or make simplifying assumptions that invalidate the analysis. The human still needs to judge whether the formal model captures the right security notion.

Symbolic verification[^symbmodel] does not equal computational security[^compmodel]. A ProVerif proof in the Dolev-Yao model[^dy] tells you something meaningful, but it operates in an idealized world where cryptographic primitives are perfect. A computational proof in EasyCrypt is stronger but harder to obtain. The gap between these models is well-understood in the research community but easy to forget when the tools feel automatic.

This workflow does not eliminate peer review. It accelerates pre-review iteration. You still need experts to evaluate whether the formalization is meaningful and whether the security properties are the right ones to verify.

And it works best for protocols built from well-understood primitives. If your protocol relies on a novel cryptographic assumption, the AI will have little to draw on, and the formalization tools may not support the required equational theories. The closer your protocol is to standard constructions, the more this workflow helps.

The speaker at the workshop was right about current timescales. Five to seven years from protocol concept to formal verification is too slow for most industries. But I think he was describing the workflow, not the problem. That part can change.

## Notes

[^modelcheck]: Model checking is an automated verification technique that exhaustively explores all reachable states of a finite-state system to determine whether a given specification holds. It provides counterexamples when properties are violated. The main limitation is state-space explosion for large or infinite systems. See: E.M. Clarke, O. Grumberg, D.A. Peled, *Model Checking*, MIT Press, 1999.

[^tls13]: E. Rescorla, "The Transport Layer Security (TLS) Protocol Version 1.3," RFC 8446, August 2018. [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc8446)

[^cremerstls]: C. Cremers, M. Horvat, J. Hoyland, S. Scott, T. van der Merwe, "A Comprehensive Symbolic Analysis of TLS 1.3," *ACM Conference on Computer and Communications Security (CCS)*, pp. 1773--1788, 2017. [doi.org](https://doi.org/10.1145/3133956.3134063)

[^bhargavantls]: K. Bhargavan, A. Delignat-Lavaud, C. Fournet, M. Kohlweiss, J. Pan, J. Protzenko, A. Rastogi, N. Swamy, S. Zanella-Beguelin, J.K. Zinzindohoue, "Implementing and Proving the TLS 1.3 Record Layer," *IEEE Symposium on Security and Privacy (S&P)*, 2017. [ieeexplore.ieee.org](https://ieeexplore.ieee.org/document/7958593/)

[^fstar]: F\* is a general-purpose functional programming language with effects aimed at program verification. It generates proofs that are checked by the Z3 SMT solver. Developed at Microsoft Research and INRIA. [fstar-lang.org](https://www.fstar-lang.org/)

[^mls]: R. Barnes, B. Beurdouche, R. Robert, J. Millican, E. Omara, K. Cohn-Gordon, "The Messaging Layer Security (MLS) Protocol," RFC 9420, July 2023. [datatracker.ietf.org](https://datatracker.ietf.org/doc/rfc9420/)

[^wallez]: T. Wallez, J. Protzenko, B. Beurdouche, K. Bhargavan, "TreeSync: Authenticated Group Management for Messaging Layer Security," *32nd USENIX Security Symposium*, 2023. Won the Distinguished Paper Award and co-won the Internet Defense Prize. [usenix.org](https://www.usenix.org/conference/usenixsecurity23/presentation/wallez)

[^noise]: T. Perrin, "The Noise Protocol Framework," Revision 34, July 2018. [noiseprotocol.org](https://noiseprotocol.org/noise.html)

[^noiseexplorer]: N. Kobeissi, G. Nicolas, K. Bhargavan, "Noise Explorer: Fully Automated Modeling and Verification for Arbitrary Noise Protocols," *IEEE European Symposium on Security and Privacy (EuroS&P)*, pp. 356--370, 2019. [ieeexplore.ieee.org](https://ieeexplore.ieee.org/abstract/document/8806757)

[^proverif]: B. Blanchet, "An Efficient Cryptographic Protocol Verifier Based on Prolog Rules," *14th IEEE Computer Security Foundations Workshop (CSFW-14)*, pp. 82--96, 2001.

[^horn]: Horn clauses are a restricted form of first-order logic where each clause has at most one positive literal. ProVerif encodes protocol behavior as Horn clauses and uses resolution to derive reachable states. The abstraction is sound but incomplete: it may report attacks that do not correspond to real protocol executions. See: B. Blanchet, "Modeling and Verifying Security Protocols with the Applied Pi Calculus and ProVerif," *Foundations and Trends in Privacy and Security*, 1(1--2):1--135, 2016.

[^ac]: Associative-commutative operators satisfy $$a \circ (b \circ c) = (a \circ b) \circ c$$ and $$a \circ b = b \circ a$$. XOR and modular exponentiation have these properties. AC unification is NP-complete, making native support in automated tools computationally expensive. ProVerif requires equational theories to be subterm-convergent, which AC theories are not.

[^dh]: Diffie-Hellman key exchange, introduced by Whitfield Diffie and Martin Hellman in 1976, allows two parties to establish a shared secret over an insecure channel. The algebraic properties of modular exponentiation are associative and commutative, which is why ProVerif cannot model it exactly. See: W. Diffie, M. Hellman, "New Directions in Cryptography," *IEEE Transactions on Information Theory*, 22(6):644--654, 1976.

[^tamarin]: S. Meier, B. Schmidt, C. Cremers, D. Basin, "The TAMARIN Prover for the Symbolic Analysis of Security Protocols," *Computer Aided Verification (CAV)*, LNCS vol. 8044, pp. 696--701, Springer, 2013. [doi.org](https://doi.org/10.1007/978-3-642-39799-8_48)

[^easycrypt]: G. Barthe, B. Gregoire, S. Heraud, S. Zanella-Beguelin, "Computer-Aided Security Proofs for the Working Cryptographer," *CRYPTO 2011*, LNCS vol. 6841, pp. 71--90, Springer, 2011. For a tutorial, see: G. Barthe et al., "EasyCrypt: A Tutorial," *FOSAD 2012/2013*, LNCS vol. 8604, Springer, 2014. [springer.com](https://link.springer.com/chapter/10.1007/978-3-319-10082-1_6)

[^compmodel]: The computational model of cryptographic security treats adversaries as probabilistic polynomial-time Turing machines and defines security through negligible advantages. Security proofs are reductions: breaking the protocol implies breaking an underlying hardness assumption. This is the standard model used in modern cryptography.

[^symbmodel]: The symbolic model, also called the Dolev-Yao model, treats cryptographic primitives as perfect black boxes. Encryption cannot be broken without the key, hashing is collision-free, and so on. This simplification enables automation but does not capture implementation-level vulnerabilities or attacks exploiting algebraic properties of the primitives.

[^cryptoverif]: B. Blanchet, "A Computationally Sound Mechanized Prover for Security Protocols," *IEEE Symposium on Security and Privacy (S&P)*, pp. 140--154, 2006. [bblanche.gitlabpages.inria.fr](https://bblanche.gitlabpages.inria.fr/publications/BlanchetOakland06.pdf)

[^gametransform]: Game-based proofs in cryptography proceed by transforming the original security game through a sequence of steps, each changing the game slightly, until the final game is one whose security is trivially analyzable. CryptoVerif automates some of these transformations. See: V. Shoup, "Sequences of Games: A Tool for Taming Complexity in Security Proofs," Cryptology ePrint Archive 2004/332, 2004.

[^dy]: D. Dolev, A.C. Yao, "On the Security of Public Key Protocols," *IEEE Transactions on Information Theory*, 29(2):198--208, 1983. The foundational paper defining the attacker model used in symbolic protocol analysis: the adversary controls the network completely and can intercept, modify, and inject messages. [ieeexplore.ieee.org](https://ieeexplore.ieee.org/document/1056650/)

[^benaloh]: J. Benaloh, "Dense Probabilistic Encryption," *Proceedings of the Workshop on Selected Areas of Cryptography (SAC)*, pp. 120--128, 1994. [sacworkshop.org](https://sacworkshop.org/proc/SAC_94_006.pdf)

[^fousse]: L. Fousse, P. Lafourcade, M. Alnuaimi, "Benaloh's Dense Probabilistic Encryption Revisited," *AFRICACRYPT 2011*, LNCS vol. 6737, pp. 348--362, Springer, 2011. [springer.com](https://link.springer.com/chapter/10.1007/978-3-642-21969-6_22)

[^alphaproof]: T. Hubert, R. Mehta, L. Sartran et al., "Olympiad-level formal mathematical reasoning with reinforcement learning," *Nature*, 2025. AlphaProof achieved silver-medal performance at the 2024 International Mathematical Olympiad. [nature.com](https://www.nature.com/articles/s41586-025-09833-y)

[^cryptoformaleval]: C. Curaba, D. D'Ambrosi, A. Minisini, N. Perez-Campanero Antolin, "CryptoFormalEval: Integrating LLMs and Formal Verification for Automated Cryptographic Protocol Vulnerability Detection," arXiv:2411.13627, 2024. [arxiv.org](https://arxiv.org/abs/2411.13627)
