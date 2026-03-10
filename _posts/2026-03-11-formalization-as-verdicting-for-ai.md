---
layout: post
title: "Formalization as a Verdicting Technique for AI"
date: 2026-03-11
---

AI agents produce outputs. How do we know they are correct?

There are two approaches that sound similar but are structurally different: embedding symbolic knowledge bases to ground AI outputs, and using formalization to verdict them. Both aim to make AI more trustworthy. They work in fundamentally different ways, and the difference matters for what comes next.

## Fact-checking vs. verdicting

The Cyc[^cyc] approach, pursued for over four decades by Doug Lenat, encodes commonsense knowledge in a machine-readable form. The idea is straightforward: if you tell the system that Paris is in France, that water freezes at zero degrees Celsius, that humans have two eyes, then the system can catch outputs that contradict these facts. Lenat and Marcus[^lenat] argued that this kind of symbolic grounding is exactly what LLMs[^llm] lack. LLMs generate plausible text but have no mechanism for consistency. A symbolic knowledge base is rigid but reliable. Combine them and you cover each other's weaknesses.

This is fact-checking. The knowledge base acts as a ground truth lookup. "Is this claim consistent with what we know?" It is valuable. It is also limited to what has been encoded.

Formalization is different. Instead of asking "is this fact true?", it asks "does this output satisfy these properties?" A theorem prover[^thmprover] does not store facts about the world. It checks whether a proof follows from its premises according to formal rules of inference. If I claim that a function never returns a negative number, I can state that as a theorem in Lean[^lean] or Rocq[^rocq] and either prove it or fail to. The proof assistant does not know what negative numbers mean in my domain. It only knows whether the logical argument is valid.

The analogy is spell-check versus type-check. Spell-check catches surface errors by comparing against a dictionary. Type-check catches structural errors by verifying that operations are consistent. Both are useful. They catch different classes of mistakes. Fact-checking is spell-check for AI. Formalization is type-check.

## What is missing: formalization know-how

Cyc encodes *what is true*. This is necessary but not sufficient. What agents also need is knowledge about *how to formalize*.

Consider a concrete example. Suppose an agent needs to generate code for a user interface that respects human cognitive constraints. The agent needs to know things about human cognition: working memory has limited capacity, visual search time increases with the number of items, motor movement time depends on target size and distance. These are empirical facts that could live in a knowledge base like Cyc.

But the agent also needs to know how to *formalize* these facts. How do you turn "working memory has limited capacity" into an axiom that a proof assistant can use? What type should cognitive load have? What invariants should a UI component satisfy? How do you state a theorem that compares two interface designs?

This is formalization strategy, and it is a different kind of knowledge entirely. It is not a fact about the world. It is knowledge about how to translate domain understanding into formal representations. A vector database[^vectordb] cannot help here because semantic similarity is the wrong retrieval mechanism for formal axioms. A knowledge graph[^kg] is closer, since it encodes structured logical relationships, but it still stores facts rather than formalization strategies.

## Cyc, vector databases, and the formalization gap

A vector database stores embeddings and retrieves by similarity. "Find chunks that feel related to my query." This is powerful for unstructured information retrieval, which is why RAG[^rag] pipelines use it. But similarity is not entailment. Two statements can be semantically similar and logically contradictory. A vector database cannot follow multi-step reasoning chains or verify consistency.

Cyc and knowledge graphs store structured logical relationships with inference capabilities. Cyc in particular uses a formal ontology and inference engine to reason over millions of assertions. OpenCyc[^opencyc], the open-source subset, contained roughly 239,000 concepts and 2 million assertions. Archived copies exist online but the project is effectively dormant. There is no plug-and-play integration with modern AI agent frameworks.

Neither tool encodes what would actually help an agent do formalization work: knowledge about *how to take a messy domain and identify the types, invariants, and proof obligations that would make formal verification possible*. This is the formalization gap. We have databases of facts and databases of embeddings, but no database of formalization strategies.

## Stable axiom sources

Not every domain is equally suitable for formalization. Some domains change faster than you can formalize them. Business rules shift quarterly. API contracts break with each release. Regulatory frameworks get amended.

But some domains are remarkably stable. Empirical facts can serve as axioms if they change on timescales much longer than the formalization work itself. The human body is a particularly good example. The structure of human cognition, the capacity of working memory, the mechanics of visual attention, the motor control characteristics described by Fitts's law[^fitts], these change on evolutionary timescales, not software release cycles. A formalization of cognitive load built today will not be invalidated by a patch next quarter.

This stability matters because formalization is expensive. You want to invest the effort where the axioms will hold. The human body, and human cognition in particular, is one of the most stable axiom sources available.

Formalization work still evolves. Axioms get refined as understanding deepens. Initial formalizations will be too coarse, and later versions will add nuance. But the underlying biology stays put. The iteration is in how precisely we capture what is already true, not in chasing a moving target.

The formalization gap is not a missing dataset. It is a missing discipline: the practice of translating stable domain knowledge into formal representations that proof assistants can work with. Closing it requires building not just knowledge bases but formalization strategies, and applying them first where the axioms are most stable.

One domain where this matters concretely is how AI agents decide what interface to show a user. That is the subject of a [companion article]({% post_url 2026-03-11-formalizing-cognitive-load %}).

## Notes

[^cyc]: Cyc is a long-running artificial intelligence project that attempts to encode commonsense knowledge in a machine-usable form. Initiated by Doug Lenat in 1984, it uses a formal ontology and inference engine to reason over millions of assertions. See: D.B. Lenat, "CYC: A Large-Scale Investment in Knowledge Infrastructure," *Communications of the ACM*, 38(11):33--38, 1995.

[^lenat]: D. Lenat, G. Marcus, "Getting from Generative AI to Trustworthy AI: What LLMs might learn from Cyc," arXiv:2308.04445, 2023. Argues that LLMs and symbolic systems like Cyc are complementary. [arxiv.org](https://arxiv.org/abs/2308.04445)

[^llm]: Large language models are neural networks trained on massive text corpora that generate text by predicting the next token in a sequence. For a survey of LLM hallucination, see: Z. Ji et al., "Survey of Hallucination in Natural Language Generation," *ACM Computing Surveys*, 55(12):1--38, 2023.

[^thmprover]: A theorem prover, or proof assistant, is software that mechanically checks whether a mathematical proof is correct relative to a set of axioms and inference rules. The two most prominent systems are Rocq (formerly Coq) and Lean.

[^lean]: Lean is a theorem prover and programming language developed by Leonardo de Moura. Lean 4 is the current version. [lean-lang.org](https://lean-lang.org/)

[^rocq]: Rocq (formerly Coq) is an interactive theorem prover based on the Calculus of Inductive Constructions. [rocq-prover.org](https://rocq-prover.org/)

[^vectordb]: Vector databases store high-dimensional embeddings and retrieve items by cosine similarity or other distance metrics. They underpin retrieval-augmented generation (RAG) pipelines for LLMs.

[^kg]: Knowledge graphs represent information as typed entities and relationships, enabling structured queries and logical inference. Examples include Wikidata, DBpedia, and enterprise knowledge graphs.

[^rag]: Retrieval-augmented generation (RAG) is a technique where an LLM retrieves relevant documents from an external store before generating a response, grounding its output in specific source material. See: P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," *NeurIPS*, 2020.

[^opencyc]: OpenCyc was the open-source subset of the Cyc knowledge base, containing approximately 239,000 concepts and 2 million assertions. The project has been largely dormant since Cycorp shifted focus to commercial applications.

[^fitts]: P.M. Fitts, "The information capacity of the human motor system in controlling the amplitude of movement," *Journal of Experimental Psychology*, 47(6):381--391, 1954. Fitts's law predicts that movement time increases logarithmically with the ratio of distance to target size.
