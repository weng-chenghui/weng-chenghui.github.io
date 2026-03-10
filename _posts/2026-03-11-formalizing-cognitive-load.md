---
layout: post
title: "Formalizing Cognitive Load"
date: 2026-03-11
---

Try booking a calendar event by typing a message to an AI agent. "Schedule a meeting with Alice next Tuesday at 2pm for one hour about the Q2 roadmap." Now try doing the same thing with a calendar widget: click the day, drag to set the time, type the title, add the attendee. The calendar widget is faster and less error-prone. The difference is not preference. It is cognitive load.

The text interface forces you to hold the entire event structure in working memory and serialize it into a sentence. The calendar widget offloads spatial and temporal reasoning to the visual field. You see the week, you see the time slots, you see what is already booked. The widget does not make you smarter. It makes the task demand less from your cognition.

Chat is the default interface for AI agents. It is universal, flexible, and terrible for most structured tasks. I think agents could reason formally about cognitive load and choose the right interface for each task. Here is what that might look like.

## Cognitive load theory, informally

Cognitive load theory[^sweller] describes how mental effort is distributed during learning and task performance. Sweller's original framework distinguishes intrinsic load, the complexity inherent in the task itself, from extraneous load, the overhead imposed by how the task is presented: the interface, the instructions, the unnecessary steps. Later work[^sweller98] added a third type: germane load, the effort spent building useful mental models, the productive kind of cognitive work.

The theory rests on a well-established empirical foundation. Working memory has limited capacity. Miller's[^miller] classic estimate was seven plus or minus two items. Cowan's[^cowan] revision, now widely accepted, puts the effective limit at four plus or minus one. These are not rough guesses. They are regularities measured across thousands of experiments over seventy years.

Fitts's law[^fitts] adds another piece: the time to move to a target depends logarithmically on the ratio of distance to target size. This governs every pointing task in every interface. Hick's law[^hick] says decision time increases logarithmically with the number of choices. These are not guidelines. They are quantitative relationships with known parameters.

The key property of all these findings is stability. They describe the human cognitive and motor system, which changes on evolutionary timescales. A formalization built on these foundations will not be invalidated by next quarter's software release.

## From heuristics to theorems

Today, UX designers apply cognitive load theory as guidelines. The Nielsen Norman Group[^nng] publishes heuristics like "minimize extraneous cognitive load" and "chunk information to fit working memory limits." Laws of UX[^lawsofux] catalogs principles like Hick's law and Miller's law as design guidelines. These are useful. They are also not machine-checkable.

A guideline says "minimize extraneous load." A theorem would say: "For a task with *n* independent parameters where *n* exceeds working memory capacity, a form-based UI has strictly lower extraneous cognitive load than a free-text interface." The guideline suggests. The theorem proves.

What would it take to move from guidelines to theorems? Three things. First, cognitive load needs to be a formally defined quantity, not just a metaphor. Second, UI patterns need formal representations with load properties. Third, we need axioms connecting task structure to cognitive demands. All three are achievable because the empirical foundations are quantitative and stable.

## A sketch of what this looks like

Here is a rough formal sketch in Lean-style pseudocode. This is not a finished formalization. It is a sketch of the kind of reasoning that becomes possible.

```
-- Working memory capacity (Cowan's limit)
axiom wm_capacity : ℝ
axiom wm_capacity_bound : 3 ≤ wm_capacity ∧ wm_capacity ≤ 5

-- A task with independent parameters the user must specify
structure Task where
  independent_params : ℕ

-- UI patterns produce different extraneous loads for the same task
structure UIPattern where
  extraneous_load : Task → ℝ

-- Two UI patterns for the same task
axiom text_ui : UIPattern
axiom form_ui : UIPattern

-- Free-text serialization forces all params into working memory
axiom text_ui_load (t : Task) :
  text_ui.extraneous_load t = ↑t.independent_params

-- A structured form externalizes params, loading only the active field
axiom form_ui_load (t : Task) :
  form_ui.extraneous_load t = 1

-- When params exceed capacity, the form UI is strictly better
theorem form_beats_text (t : Task)
    (h : ↑t.independent_params > wm_capacity) :
    form_ui.extraneous_load t < text_ui.extraneous_load t := by
  simp [form_ui_load, text_ui_load]
  linarith [wm_capacity_bound]
```

The theorem says something precise: when a task has more independent parameters than working memory can hold, a structured form interface produces lower extraneous cognitive load than a free-text interface. This is something most UX designers know intuitively. The difference is that the formal version is machine-checkable and composable with other formal results.

Several things about this sketch are intentionally simplified. Cognitive load is modeled as a real number when in practice it is multidimensional. The axiom that text input loads all parameters simultaneously is an approximation. A real formalization would need richer task models, attention allocation, and transfer between modalities. But the structure of the argument, axioms from cognitive science grounding provable claims about UI design, is sound.

## What exists today

Nobody has assembled the pieces for this kind of formalization. They exist separately.

Cognitive load theory is well-established in UX practice but remains entirely informal[^nng]. Designers apply it through heuristics, usability testing, and pattern libraries. There is no formal specification of what cognitive load *is* in a mathematical sense that a proof assistant could work with.

Formal verification has been applied to human-interactive systems, but primarily for safety-critical domains. Curzon et al.[^curzon] used model checking to verify properties of interactive medical devices, asking questions like "can the user reach a dangerous state through any sequence of actions?" This is closer to what I am describing, but it focuses on safety properties rather than cognitive load optimization.

Cognitive architectures have been formalized in higher-order logic. ACT-R[^actr] and Soar[^soar] both have mathematical underpinnings that could in principle be expressed in a proof assistant. But this work has not been connected to UI design decisions.

A recent paper by Longo et al.[^longo] highlights a telling gap: there is no consensus definition of cognitive workload in human-computer interaction. Different researchers measure different things, use different scales, and draw different boundaries around the concept. This is exactly the kind of ambiguity that formalization can resolve. Forcing a formal definition requires making every assumption explicit.

## Beyond screens

Any interaction where a human must process information, make decisions, or coordinate actions has cognitive cost. Agent-to-agent protocols have cognitive implications when a human needs to review or approve the results. Approval workflows impose cognitive load through context switching and information gathering. Even reading a summary produced by an AI agent has cognitive cost that depends on how the information is structured.

A formal theory of cognitive load becomes a foundation for designing *all* agent interactions, not just screen layouts. An agent that can reason about cognitive load can decide when to present options as a list versus a comparison table, when to ask for confirmation versus proceeding autonomously, when to batch notifications versus delivering them individually. These are all cognitive load decisions that agents currently make by heuristic or not at all.

The generalization goes further. Any decision or interaction flow, human-to-agent, agent-to-agent, or human-to-human mediated by agents, can be analyzed through the lens of cognitive cost. Formalizing this cost function means moving from "this feels like too many steps" to "this workflow provably exceeds the cognitive budget for its target user."

## What this is and is not

This is not a claim that all of UX can be formalized. Aesthetics, emotional response, cultural context, and many other factors in design resist formal treatment and probably always will.

This is a claim that the stable empirical properties of human cognition are formalizable. Working memory capacity, attentional limits, motor control characteristics: these are quantitative, well-replicated, and slow-changing. They are exactly the kind of facts that make good axioms.

And this would give AI agents a principled basis for UI decisions they currently lack. Today, when an agent defaults to chat, it is not because chat was the right choice. It is because the agent has no framework for reasoning about alternatives. A formal theory of cognitive load would provide that framework. Not a complete theory of good design, but a necessary foundation: the constraints that any design must satisfy because human cognition demands it.

The human body is a remarkably stable axiom source. That seems worth formalizing.

## Notes

[^sweller]: J. Sweller, "Cognitive Load During Problem Solving: Effects on Learning," *Cognitive Science*, 12(2):257--285, 1988. The foundational paper introducing cognitive load theory, distinguishing intrinsic and extraneous load in instructional design.

[^sweller98]: J. Sweller, J.J.G. van Merrienboer, F.G.W.C. Paas, "Cognitive Architecture and Instructional Design," *Educational Psychology Review*, 10(3):251--296, 1998. Introduced germane cognitive load as a third component alongside intrinsic and extraneous load.

[^miller]: G.A. Miller, "The Magical Number Seven, Plus or Minus Two: Some Limits on Our Capacity for Processing Information," *Psychological Review*, 63(2):81--97, 1956. The classic paper establishing working memory capacity limits.

[^cowan]: N. Cowan, "The Magical Number 4 in Short-Term Memory: A Reconsideration of Mental Storage Capacity," *Behavioral and Brain Sciences*, 24(1):87--114, 2001. Revised the working memory capacity estimate from 7±2 to 4±1, now widely accepted.

[^fitts]: P.M. Fitts, "The information capacity of the human motor system in controlling the amplitude of movement," *Journal of Experimental Psychology*, 47(6):381--391, 1954. Fitts's law: movement time = a + b × log₂(2D/W), where D is distance and W is target width.

[^hick]: W.E. Hick, "On the rate of gain of information," *Quarterly Journal of Experimental Psychology*, 4(1):11--26, 1952. Hick's law: decision time increases logarithmically with the number of choices.

[^nng]: Nielsen Norman Group, "Minimize Cognitive Load to Maximize Usability," [nngroup.com](https://www.nngroup.com/articles/minimize-cognitive-load/). A representative summary of cognitive load principles applied to UX design.

[^lawsofux]: J. Yablonski, *Laws of UX: Using Psychology to Design Better Products & Services*, O'Reilly Media, 2020. Also available at [lawsofux.com](https://lawsofux.com/). Catalogs psychological principles relevant to interface design.

[^curzon]: P. Curzon, A. Blandford, "Formally justifying user-centred design rules: a case study on post-completion errors," *IFM 2004* (Integrated Formal Methods). Uses formal methods to verify properties of interactive systems, particularly in safety-critical medical contexts.

[^actr]: J.R. Anderson, *How Can the Human Mind Occur in the Physical Universe?*, Oxford University Press, 2007. ACT-R (Adaptive Control of Thought-Rational) is a cognitive architecture with mathematical foundations for modeling human cognition.

[^soar]: J.E. Laird, *The Soar Cognitive Architecture*, MIT Press, 2012. Soar is a cognitive architecture for developing systems that exhibit intelligent behavior, with formal underpinnings in problem space theory.

[^longo]: L. Longo, C.D. Wickens, G. Hancock, P.A. Hancock, "Human Mental Workload: A Survey and a Novel Inclusive Definition," *Frontiers in Psychology*, 13:883321, 2022. Highlights the lack of consensus on defining and measuring cognitive workload in HCI.
