---
layout: post
title: "Formalization as a Search Engine for Knowledge"
date: 2026-03-10
---

There is never enough time.

I keep a list of things I want to understand properly. It covers chemistry, finance, music theory, type systems, protocol design. The list only grows. Every time I close one rabbit hole, two more open up. The honest truth is that I will never have time to take a full course in each of these fields. Some people can. I cannot.

For years, search engines were the workaround. You grab what you need when you need it. It is the cooking analogy: you do not get a culinary degree to make dinner. You look up the recipe, buy the ingredients, figure out the tricky step, and move on. Search engines turned the entire internet into an ingredient shelf. Good enough for most things.

## AI changes the kitchen

AI agents[^agent] changed the game in a way that search engines never did. A search engine hands you ten links and wishes you luck. An AI agent can read across domains, connect ideas, and sketch out how concepts from one field map onto another. It is like having a sous chef who can also invent recipes from cuisines you have never tried.

I have been using this workflow more and more: ask an AI to explore how an idea from one domain connects to a formalism I already know. The results are often surprisingly good. Sometimes they are completely wrong.

That last part is the problem.

## The confidence trap

Large language models[^llm] are fluent. They produce well-structured, plausible-sounding reasoning that reads like it was written by someone who understands the material. But fluency is not correctness. LLM hallucination[^hallucination] is well-documented: the model generates text that is coherent and confidently stated but factually wrong. In technical domains, this is dangerous precisely because the errors look right: a wrong proof step, a misapplied theorem, a subtly incorrect formula, all invisible to casual reading. I need something that checks the actual logic.

## Formalization as the verdict

For domains that can be expressed formally, theorem provers[^thmprover] offer something no amount of "sounds right" can substitute: a mechanized check of logical correctness down to foundational axioms.

If I write a claim in Rocq[^rocq] or Lean[^lean], either it type-checks or it does not. There is no middle ground, no "well, it is mostly correct." The proof assistant will reject a subtly flawed argument just as firmly as an obviously wrong one. This is the property that makes formalization valuable as a verification layer for AI-generated reasoning.

The workflow looks like this: use AI to explore how a concept from a new domain might be formalized. Prototype the formalization. Run it through the proof assistant. See what passes and what fails. Review the failures, because they tell me where the AI's understanding was shallow or wrong. Fix the formalization, iterate, and eventually you have verified foundations. Those verified results then become solid ground for the AI to build on further. It is a ratchet that only moves forward.

## Widening the frontier

Here is where this diverges from what most people think of when they hear "AI and theorem proving."

There is an impressive and growing body of work on AI systems that prove hard mathematical theorems. AlphaProof[^alphaproof] from DeepMind achieved silver-medal performance at the International Mathematical Olympiad. Aristotle[^aristotle] from Harmonic reached gold-medal level. DeepSeek-Prover-V2[^deepseek] hit 88.9% on the MiniF2F benchmark[^minif2f]. Llemma[^llemma], COPRA[^copra], and Lean Copilot[^leancopilot] have all pushed the state of the art in AI-assisted proof search. These are remarkable achievements.

But they all target the same goal: proving harder theorems in domains that are already formalized, primarily pure mathematics. The goal is depth.

What I am describing is different. It is about width. What if we could extend formalization into domains that have not traditionally been formalized at all? Not to prove harder theorems in algebra, but to formalize the basic building blocks of chemistry, or finance, or legal reasoning, and then use that formalization as a quality gate for AI-generated reasoning in those domains.

The academic term for this is autoformalization[^autoformalization]: translating informal knowledge into formal representations. Szegedy[^szegedy] argued in 2020 that autoformalization could be a path toward more general AI. Wu et al.[^wu] showed in 2022 that large language models can already do some of this translation. A recent survey by Mensfelt et al.[^mensfelt] categorizes autoformalization efforts across math, logic, planning, and knowledge representation. The pieces are coming together.

## What this looks like in practice

Consider chemical reaction network theory[^crnt]. Feinberg's work[^feinberg] established rigorous mathematical foundations: stoichiometric conservation laws, graph topology of reaction networks, and results like the Deficiency Zero Theorem[^defzero] that guarantee equilibrium behavior for certain network structures. These are mathematical statements with clear formal content. What if I could express them as Lean or Rocq conjectures and let a proof assistant verify which properties hold?

Or consider finance. The Fundamental Theorem of Asset Pricing[^ftap] connects the absence of arbitrage to the existence of equivalent martingale measures[^martingale]. Put-call parity, binomial pricing models, net present value calculations. These all have precise mathematical formulations. Formalizing them would mean that when an AI agent reasons about a financial model, I could check whether its reasoning is actually consistent with the foundational theory, not just plausible-sounding.

Music theory offers another example. Xenakis showed in *Formalized Music*[^xenakis] that mathematical structures, stochastic processes, set theory, group theory, apply directly to composition. If the math is there, formalization can follow.

The point is not that any of these are easy. The point is that AI can help explore these connections faster than a single person ever could, and formalization provides the quality check that AI alone cannot.

## The bigger picture

This idea is not isolated. Kleppmann[^kleppmann] predicted in late 2025 that AI will make formal verification go mainstream, arguing that the precision of formal methods is the natural complement to the imprecision of LLMs. Zhang et al.[^hou] make an explicit case that trustworthy AI agents require integrating LLMs with formal methods.

There is also a longer history here. Doug Lenat spent nearly four decades building Cyc[^cyc], a symbolic knowledge base encoding commonsense reasoning. In one of his final papers, Lenat and Marcus[^lenat] argued that Cyc and LLMs are complementary: LLMs are fluent but inconsistent, symbolic systems are rigorous but brittle. Combining them covers each other's weaknesses. The broader neuro-symbolic AI[^neurosymbolic] research program pursues exactly this integration, from systematic reviews of the field[^nsreview] to applications in legal reasoning[^nslegal] and ontological knowledge[^nsontology].

## What this is not

I should be honest about the limitations.

Not everything can be formalized. Many domains resist it because the concepts are too vague, too context-dependent, or too poorly understood to pin down in a formal language. Even in domains where formalization is possible in principle, the gap between "formalizable" and "usefully formalized in practice" is enormous. Writing good formal specifications is hard. It requires deep understanding of both the domain and the proof assistant. AI can help bridge that gap, but it cannot eliminate it.

This is also not a claim that formalization replaces domain expertise. A proof assistant can tell you that a theorem follows from its premises. It cannot tell you whether the premises are the right ones to care about. That judgment still requires a human who understands the domain.

What formalization does offer is a ratchet. Once something is verified, it stays verified. You can build on it with confidence. And as AI gets better at exploring new domains and prototyping formalizations, the frontier of what has been verified can expand faster than any individual could push it alone. Not by solving harder problems in well-trodden territory, but by bringing the tools of verification to places they have never been.

That seems worth trying.

## Notes

[^agent]: An AI agent is a system that uses a large language model to autonomously perform multi-step tasks, including searching for information, writing code, and reasoning across domains. For a survey, see: L. Wang et al., "A Survey on Large Language Model based Autonomous Agents," arXiv:2308.11432, 2023.

[^llm]: Large language models are neural networks trained on massive text corpora that generate text by predicting the next token in a sequence. Key examples include GPT-4 (OpenAI), Claude (Anthropic), and Gemini (Google DeepMind).

[^hallucination]: LLM hallucination refers to the phenomenon where language models generate text that is fluent and confident but factually incorrect or fabricated. See: Z. Ji et al., "Survey of Hallucination in Natural Language Generation," *ACM Computing Surveys*, 55(12):1--38, 2023.

[^thmprover]: A theorem prover, or proof assistant, is software that mechanically checks whether a mathematical proof is correct relative to a set of axioms and inference rules. The two most prominent systems are Coq/Rocq and Lean.

[^rocq]: Rocq (formerly Coq) is an interactive theorem prover based on the Calculus of Inductive Constructions. Originally developed by Thierry Coquand and Gérard Huet at INRIA starting in 1984. [rocq-prover.org](https://rocq-prover.org/)

[^lean]: Lean is a theorem prover and programming language developed by Leonardo de Moura, first at Microsoft Research and now at the Lean Focused Research Organization. Lean 4 is the current version. [lean-lang.org](https://lean-lang.org/)

[^alphaproof]: T. Hubert, R. Mehta, L. Sartran et al., "Olympiad-level formal mathematical reasoning with reinforcement learning," *Nature*, 2025. AlphaProof achieved silver-medal-level performance at the 2024 International Mathematical Olympiad using reinforcement learning in Lean. [nature.com](https://www.nature.com/articles/s41586-025-09833-y)

[^aristotle]: The Harmonic Team, "Aristotle: IMO-level Automated Theorem Proving," arXiv:2510.01346, 2025. Aristotle integrates a Lean proof search system, informal reasoning, and a geometry solver, achieving gold-medal-equivalent performance on the 2025 IMO. [arxiv.org](https://arxiv.org/abs/2510.01346)

[^deepseek]: Z.Z. Ren, Z. Shao, J. Song et al., "DeepSeek-Prover-V2: Advancing Formal Mathematical Reasoning via Reinforcement Learning for Subgoal Decomposition," arXiv:2504.21801, 2025. [arxiv.org](https://arxiv.org/abs/2504.21801)

[^minif2f]: MiniF2F is a benchmark of 488 formal mathematical statements in Lean, Metamath, and Isabelle, drawn from AMC, AIME, and IMO competitions. K. Zheng et al., "MiniF2F: a cross-system benchmark for formal Olympiad-level mathematics," *ICLR*, 2022.

[^llemma]: Z. Azerbayev, H. Schoelkopf et al., "Llemma: An Open Language Model for Mathematics," *ICLR*, 2024. An open-source math LLM trained on the Proof-Pile II dataset. [arxiv.org](https://arxiv.org/abs/2310.10631)

[^copra]: A. Thakur, G. Tsoukalas, Y. Wen, J. Xin, S. Chaudhuri, "An In-Context Learning Agent for Formal Theorem-Proving," *COLM*, 2024. COPRA uses GPT-4 as an in-context proof agent with stateful backtracking search. [arxiv.org](https://arxiv.org/abs/2310.04353)

[^leancopilot]: P. Song, K. Yang, A. Anandkumar, "Lean Copilot: Large Language Models as Copilots for Theorem Proving in Lean," 2024. [arxiv.org](https://arxiv.org/abs/2404.12534)

[^autoformalization]: Autoformalization is the task of automatically translating informal mathematical or logical statements into formal representations that can be checked by a proof assistant. The term encompasses translation from natural language to formal languages like Lean, Rocq, Isabelle, or first-order logic.

[^szegedy]: C. Szegedy, "A Promising Path Towards Autoformalization and General Artificial Intelligence," *Intelligent Computer Mathematics (CICM)*, Lecture Notes in Computer Science vol. 12236, Springer, 2020. [springer.com](https://link.springer.com/chapter/10.1007/978-3-030-53518-6_1)

[^wu]: Y. Wu, A.Q. Jiang, W. Li, M. Rabe, C. Staats, M. Jamnik, C. Szegedy, "Autoformalization with Large Language Models," *NeurIPS*, 2022. [arxiv.org](https://arxiv.org/abs/2205.12615)

[^mensfelt]: A. Mensfelt, D. Tena Cucala, S. Franco, A. Koutsoukou-Argyraki, V. Trencsenyi, K. Stathis, "Towards a Common Framework for Autoformalization," arXiv:2509.09810, 2025. Categorizes autoformalization across math, logic, planning, and knowledge representation. [arxiv.org](https://arxiv.org/abs/2509.09810)

[^crnt]: Chemical Reaction Network Theory is a mathematical framework for analyzing the qualitative behavior of chemical systems based on network structure rather than specific rate constants. It connects graph-theoretic properties of reaction networks to dynamical behavior.

[^feinberg]: M. Feinberg, *Foundations of Chemical Reaction Network Theory*, Applied Mathematical Sciences vol. 202, Springer, 2019. The definitive treatment of CRNT. [springer.com](https://link.springer.com/book/10.1007/978-3-030-03858-8)

[^defzero]: The Deficiency Zero Theorem, due to Horn (1972) and developed by Feinberg, states that for reaction networks satisfying certain structural conditions (deficiency zero, weak reversibility), there exists a unique positive equilibrium in each stoichiometric compatibility class and it is asymptotically stable. See: M. Feinberg, "Chemical reaction network structure and the stability of complex isothermal reactors -- I. The deficiency zero and deficiency one theorems," *Chemical Engineering Science*, 42(10):2229--2268, 1987. [sciencedirect.com](https://www.sciencedirect.com/science/article/pii/0009250987800994)

[^ftap]: The Fundamental Theorem of Asset Pricing establishes that a market is arbitrage-free if and only if there exists an equivalent martingale measure. J.M. Harrison, D.M. Kreps, "Martingales and Arbitrage in Multiperiod Securities Markets," *Journal of Economic Theory*, 20(3):381--408, 1979. [sciencedirect.com](https://www.sciencedirect.com/science/article/abs/pii/0022053179900437)

[^martingale]: A martingale is a stochastic process where the conditional expectation of the next value, given all past values, equals the current value. In finance, an equivalent martingale measure is a probability measure under which discounted asset prices are martingales, encoding the no-arbitrage condition.

[^xenakis]: I. Xenakis, *Formalized Music: Thought and Mathematics in Composition*, Indiana University Press, 1971; revised edition, Pendragon Press, 1992. Originally published in French as *Musiques formelles* in 1963. Xenakis applied stochastic processes, set theory, and group theory to musical composition.

[^kleppmann]: M. Kleppmann, "Prediction: AI will make formal verification go mainstream," December 2025. Argues that AI will dramatically lower the cost of formal verification and that the precision of formal methods naturally complements the imprecision of LLMs. [martin.kleppmann.com](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html)

[^hou]: Y. Zhang, Y. Cai, X. Zuo et al., "Position: Trustworthy AI Agents Require the Integration of Large Language Models and Formal Methods," *ICML*, 2025. arXiv:2412.06512. [arxiv.org](https://arxiv.org/abs/2412.06512)

[^cyc]: Cyc is a long-running artificial intelligence project that attempts to encode commonsense knowledge in a machine-usable form. Initiated by Doug Lenat in 1984, it uses a formal ontology and inference engine to reason over millions of assertions.

[^lenat]: D. Lenat, G. Marcus, "Getting from Generative AI to Trustworthy AI: What LLMs might learn from Cyc," arXiv:2308.04445, 2023. Argues that LLMs and symbolic systems like Cyc are complementary: LLMs are fluent but inconsistent, Cyc is rigorous but brittle. [arxiv.org](https://arxiv.org/abs/2308.04445)

[^neurosymbolic]: Neuro-symbolic AI is a research paradigm that integrates neural network approaches (including LLMs) with symbolic reasoning systems (knowledge graphs, ontologies, formal logic) to combine the strengths of both.

[^nsreview]: B.C. Colelough, W. Regli, "Neuro-Symbolic AI in 2024: A Systematic Review," arXiv:2501.05435, 2025. [arxiv.org](https://arxiv.org/abs/2501.05435)

[^nslegal]: M. Kant, M. Nabi, M. Kant, P. Carlson, M. Ma, "Breakthroughs in LLM Reasoning Show a Path Forward for Neuro-Symbolic Legal AI," Stanford CodeX, December 2024. [law.stanford.edu](https://law.stanford.edu/2024/12/20/breakthroughs-in-llm-reasoning-show-a-path-forward-for-neuro-symbolic-legal-ai/)

[^nsontology]: R.I. Magana Vsevolodovna, M. Monti, "Enhancing Large Language Models through Neuro-Symbolic Integration and Ontological Reasoning," arXiv:2504.07640, 2025. [arxiv.org](https://arxiv.org/abs/2504.07640)
