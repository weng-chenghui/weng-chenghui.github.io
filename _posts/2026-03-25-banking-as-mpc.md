---
layout: post
title: "Banking as MPC: Money, Secrecy, and the Algebra of Transactions"
date: 2026-03-25
---

Think about what money hides. Not the numeric value — that is public, printed on the bill or displayed on the screen. What money hides is *history*: who paid whom, for what, in what sequence. The full chain of hands a bill has passed through. And here is the strange part: we have a whole science called secure multi-party computation built to hide exactly this kind of information. Bank accounts and MPC protocols are solving the same problem in different ways — one with cryptography, one with law and ledgers.

This is a natural but underexplored analogy. Bank accounts are parties. Transactions are protocol messages. The secret each party holds is not a number but a *view* of the interaction graph. The question is: how much of the global graph can an adversary reconstruct from a local view?

## The security hierarchy of money

Cash is information-theoretically secure. A banknote carries no metadata about its history.[^cash] The information about who held it before you simply does not exist in the physical object. This is the monetary analogue of a one-time pad. A bank account that only receives and dispenses cash inherits this property: every deposit and withdrawal is an independent event, no counterparty information exists.

The moment an account sends money to another account, metadata is created — an edge in the transaction graph. With few transfers, an adversary gets a sparse subgraph: inference is possible but noisy. With many transfers, the graph becomes dense, patterns emerge, and the adversary can reconstruct the interaction history with high probability.

| Mechanism | Security level | Analogy |
|-----------|---------------|---------|
| Cash only | Information-theoretic | One-time pad — no metadata exists |
| Bank account, cash only | Information-theoretic | Each deposit/withdrawal is independent |
| Bank account, few transfers | Statistical | Sparse subgraph, hard to infer |
| Bank account, many transfers | Deterministic | Dense graph reveals structure |

These terms are used by analogy with cryptographic security notions, not as formal equivalents. In standard cryptography, "statistical security" means negligible statistical distance from ideal, and "computational security" means indistinguishability under polynomial-time adversaries. Here the usage is informal: "statistical" means partial information leakage, "deterministic" means full reconstruction is feasible.

## Money laundering as attempted computational security

In standard cryptography, computational security arises from mathematical hardness: the computation required to extract the secret exceeds any feasible budget. Money laundering attempts something analogous — making a transaction graph *look* random by routing funds through many intermediaries, shell companies, and jurisdictions.

But there is a fundamental bottleneck. To achieve cryptographic-strength obfuscation, the transaction graph would need to be computationally indistinguishable from a random graph of the same size. This requires super-polynomially many transactions, each passing through a banking system with finite throughput, regulatory overhead, and service fees. The banking system cannot execute the equivalent of a pseudorandom function. Money laundering achieves, at best, a weak form of computational security — enough to frustrate underfunded investigators, but nowhere near cryptographic strength.

## The algebraic structure

Suppose we have $N$ bank accounts. What algebraic structure do their transactions form?

**Generators are directed transfers.** A transaction is not an action by a single account — it is a directed pair: $A$ sends money to $B$. The natural generators are the $N(N-1)$ directed edges $(A \to B)$ for distinct accounts $A, B$. A transaction sequence is a word in these generators: $(A \to B)(B \to C)(A \to C)$ means $A$ pays $B$, then $B$ pays $C$, then $A$ pays $C$. The operation is concatenation.

**Non-abelian.** $(A \to B)(B \to A) \neq (B \to A)(A \to B)$: the order of transfers matters, because intermediate balances differ and may determine whether subsequent transfers are even possible. So we have a non-commutative structure.

**A monoid, not a group.** In a group, every element has an inverse. But banking transactions are irreversible — there is no transfer that "undoes" $(A \to B)$.[^irreversible] A chargeback creates a *new* transaction $(B \to A)$, which is a different generator, not the inverse of the original. The algebraic structure is therefore a **free monoid** on the directed-transfer generators: all finite words, with concatenation, but no cancellation.[^freemonoid]

If we idealize — allowing formal inverses, pretending every transaction can be reversed — we get the free group $F_M$ on $M = N(N-1)$ generators.[^freegroup] This is a useful abstraction for studying the combinatorial structure of transaction sequences, but it is an idealization. The monoid is the honest model.

No real banking system is even a free monoid. Accounts have balance constraints (you cannot send money you do not have), regulatory limits (transaction caps, velocity checks), and temporal ordering (transactions are serialized). These constraints impose relations, collapsing the free monoid to a quotient.

## From free groups to RAAGs

The natural intermediate structure is a right-angled Artin group (RAAG).[^raag] A RAAG is defined by a graph $\Gamma$: the vertices are generators, and two generators commute if and only if they are connected by an edge. The extremes are:

- $\Gamma$ is the complete graph: every pair commutes, giving the free abelian group $\mathbb{Z}^M$.
- $\Gamma$ is the empty graph: no pair commutes, giving the free group $F_M$.
- Anything in between: partial commutativity dictated by the graph.

In the banking model, we can work at the level of accounts rather than individual directed transfers. Draw an edge in $\Gamma$ between accounts $A$ and $B$ if their transaction histories are independent — that is, if the order in which transfers involving $A$ and transfers involving $B$ occur does not affect the global state. Two accounts that never interact have independent histories, so their generators commute. Two accounts that transact with each other have order-dependent histories, so they do *not* commute.

This means $\Gamma$ is the *complement* of the interaction graph: accounts connected by at least one transfer are *not* connected in $\Gamma$. Accounts that have never interacted are connected in $\Gamma$ (they commute).

The RAAG $A_\Gamma$ captures the commutativity structure of the banking network. And here is the connection to cryptography: Flores, Kahrobaei, and Koberda[^floraag] proposed cryptographic protocols based on RAAGs, exploiting two hardness results:

1. The **Subgroup Isomorphism Problem** is undecidable for certain RAAGs.[^subiso]
2. The **Group Homomorphism Problem** for RAAGs reduces to the **Graph Homomorphism Problem**, which is NP-complete.[^graphhom]

These are exactly the kinds of hardness guarantees you want for a computational-security argument. If reconstructing the full transaction graph from a local view reduces to an NP-complete graph problem, then the privacy guarantee has a complexity-theoretic foundation, not just an empirical one.

## The dynamic RAAG

There is a subtlety that the standard RAAG framework does not capture: the graph $\Gamma$ evolves. At time $t_0$, before any transactions, $\Gamma$ is the complete graph (all accounts commute, because none have interacted). Each transaction removes an edge from $\Gamma$ — the two transacting accounts no longer commute. The group changes from $\mathbb{Z}^N$ toward $F_N$ as the transaction graph fills in.

This is a dynamic RAAG: a time-indexed family $\{A_{\Gamma_t}\}_{t \geq 0}$ where $\Gamma_t$ is monotonically losing edges. The security of each account's privacy degrades monotonically as the transaction graph densifies — which matches the intuitive security hierarchy from the first section.

## The global and local views: an MPC framing

The MPC framing makes the views precise. The **ideal functionality** is the complete transaction graph — all edges, all timestamps, all amounts. This is what the government (or a fully cooperating set of banks) can see. It is the global view.

Each account holder sees their **local view**: the star subgraph centered on their account. They know their own transactions and counterparties but not the transactions between other accounts. This is exactly the MPC notion of a party's view in a protocol execution.

**Security** means that the local view does not reveal more than it should. In MPC terms: the real-world view is simulatable from the ideal-world output restricted to that party's share. In the banking model: knowing your own transaction history should not allow you to infer the transaction history between other accounts.

The RAAG structure gives this a group-theoretic formulation. Each account holder knows the subword of the transaction sequence that involves their generators. Reconstructing the full transaction sequence from a single account's subword is the **transaction reconstruction problem** — a search problem whose complexity depends on the graph $\Gamma$. This is not the standard group-theoretic Membership Problem (which asks whether a word belongs to a subgroup), but a harder inversion problem: given a projection, recover the preimage.[^reconstructionnote]

The adversarial model here is semi-honest: banks follow the protocol but may learn from the data they observe. Account holders see only their star subgraph. Collusion between an account holder and a bank effectively promotes the account holder to the global view — which is why banking regulation focuses heavily on preventing insider access.

The RAAG framework tells us when privacy degrades and how hard reconstruction is. But it leaves a different question unanswered: what can this slow, auditable, fuel-driven system actually *compute*? The answer connects back to privacy: the banking system computes exactly what it can audit.

## The banking system as a computer

So far we have treated the banking network as an MPC protocol — a system that hides secrets. But there is a second way to look at it: the banking system *is* a computer. A very particular kind of computer.

Every computation platform makes tradeoffs along a few axes: throughput, latency, cost per operation, programmability, auditability, and integrity guarantees. The banking system sits at an extreme point in this tradeoff space, one that neither cloud computing nor blockchain occupies.

| Property | Cloud computing | Blockchain (Ethereum) | Banking system |
|----------|----------------|-----------------------|----------------|
| Throughput | Very high ($>10^6$ ops/s) | Medium (~30 TPS) | Very low (~1 TPS per account) |
| Cost per operation | ~$0 | Gas (~\$0.01--\$50) | Service fees (~\$0.10--\$30) |
| Programmability | Arbitrary code | Smart contracts (Turing-complete) | Fixed instruction set (send, receive) |
| Audit | Opt-in logging | Full, public | Full, regulatory (private) |
| Latency | Milliseconds | Seconds to minutes | Hours to days |
| Integrity model | Trust the provider | Cryptographic consensus | Legal and regulatory enforcement |

Cloud computing is fast, cheap, and programmable, but auditability is opt-in and integrity depends on trusting the provider. Blockchain is slower and more expensive, but gains public auditability and cryptographic integrity. The banking system is slower still and even less programmable, but every operation is recorded in a tamper-resistant ledger backed by legal enforcement, and the cost per operation is paid in real economic value.

This is a Turing machine stripped down to a conservative counter machine. The instruction set is minimal: deposit, withdraw, transfer. There are no loops, no conditionals, no user-defined functions. Every state transition costs fuel (transaction fees) and is recorded in a ledger that regulators can inspect. The system is not designed to compute. It is designed to *settle* — and it turns out that settling is a computation with very specific properties.

## Fuel-driven computation

The transaction fee is not incidental. It is constitutive. Every operation on the banking computer costs real money, paid by the party initiating the operation. This makes the banking system a **fuel-driven** computation model: you cannot execute a program without burning economic value at each step.

Ethereum formalized this idea with gas.[^ethgas] Every EVM opcode has a gas cost. Adding two numbers costs 3 gas. Sending a transaction costs 21,000 gas. The gas mechanism solves the halting problem economically: an infinite loop is theoretically possible but financially impossible, because it would require infinite gas. Computation terminates not because the machine enforces it, but because the fuel runs out.

The banking system achieves the same effect without the formalism. Transaction fees, minimum balance requirements, and velocity limits are the banking system's gas schedule. They bound computation not by cryptographic mechanism but by economic friction. The result is the same: only computations that someone is willing to pay for get executed.

But there is a difference in who benefits from the fuel. In Ethereum, gas fees compensate validators — the nodes that maintain consensus. In banking, transaction fees compensate the banks — the institutions that maintain the ledger and the legal infrastructure around it. The fuel does not secure a decentralized protocol. It funds a centralized (or federated) service. This means the banking computer has no intrinsic motivation to increase its computational throughput. Unlike cloud providers competing on performance or blockchains competing on transaction speed, banks compete on trust, regulatory compliance, and service quality. The computational capacity of the banking system is a side effect of its settlement function, not a goal.

## What the banking computer computes

Given the constraints — low throughput, high latency, full audit, fuel cost, minimal instruction set — what computations are natural for this machine, and where does it fail?

The banking system excels at **settlement and clearing**: a clearinghouse takes pairwise obligations among $N$ parties and computes the minimal set of net transfers that settles all debts — a flow problem executed slowly, with full auditability.[^clearing] It excels at **commitment schemes**: escrow is a commitment where the binding property is enforced by contract law rather than computational hardness.[^escrow] It excels at **time-locked computations**: cooling-off periods, vesting schedules, and settlement windows are not lag but built-in delay functions that give parties time to detect fraud and raise disputes.[^timelock] And it serves as an **auditable voting machine**: shareholder votes, creditor votes in bankruptcy, and syndicated loan decisions are multi-party computations where the banking system provides authenticated channels, full auditability, and legal finality.[^voting]

The common thread: these are all computations where integrity and auditability matter more than speed, and where temporal structure is part of the specification. The banking computer has `sleep()` as a first-class primitive.

By contrast, the banking system fails at anything requiring high throughput (it cannot execute a pseudorandom function or sort a list), programmability (the instruction set is fixed — no smart contracts, no loops[^smartcontracts]), or privacy from the platform itself (banks see everything, regulators see everything banks see). This last point inverts MPC's usual goal: the privacy guarantee runs only against other account holders, not against the computing infrastructure.

## The computation-theoretic position

The banking system occupies a precise niche in the space of computation models. It is:

- **Sub-Turing**: a conservative counter machine without zero-test — more expressive than a finite automaton (balances are unbounded integers) but strictly weaker than a Turing machine (no conditional branching on empty balance). The instruction set is fixed: deposit, withdraw, transfer.
- **Fuel-bounded**: every operation costs real economic value. Computation terminates because fuel is finite, not because the machine enforces halting.
- **Fully traced**: every state transition is recorded in a tamper-resistant (but not cryptographically tamper-proof) ledger. The execution trace is the primary output, not a side effect.
- **Legally enforced**: integrity comes from the legal system, not from cryptographic proofs or consensus protocols. This is a different trust model — not trustless, but trust-compelled.
- **Latency-positive**: high latency is a design feature for computations that require temporal separation. The machine is optimized for slow, deliberate state transitions where each step has real-world consequences.

This is not a general-purpose computer. It is a special-purpose settlement engine that happens to be Turing-incomplete, fuel-driven, and fully auditable. The interesting question is not whether it can compute everything — it obviously cannot — but what class of computations it handles *better* than any general-purpose alternative. The answer appears to be: multi-party state transitions where auditability, legal finality, and temporal structure matter more than speed or expressiveness.

Blockchain tried to generalize this model by adding programmability (smart contracts) and removing the trusted intermediary (decentralized consensus). Ethereum is, in this framing, an attempt to upgrade the banking counter machine to a Turing-complete machine while preserving the fuel-driven and fully-traced properties. The cost was enormous: gas fees, MEV, congestion, and a $10^5$--$10^7$× slowdown relative to native computation.[^evmcost] Whether the tradeoff is worth it depends on whether you need programmability more than you need legal enforcement — and for most financial settlement, you do not.

## Can transfers alone compute?

We called the banking system sub-Turing. This deserves precision, because the exact computational boundary determines what the system can hide. If it could compute arbitrary functions, the transaction graph could encode arbitrary information, and reconstruction would be arbitrarily hard. If it is restricted to a decidable class, then auditing becomes mechanical — privacy and auditability become two sides of the same coin. The banking system has one real instruction: *transfer*. Account $A$ sends amount $x$ to account $B$. That is it. No arithmetic on balances, no conditionals, no loops — just move money from here to there. The question is: how much computation can you extract from transfers alone?

### Accounts as registers, transfers as instructions

The natural formal model is a **counter machine**.[^countermachine] A counter machine has $N$ registers, each holding a non-negative integer, and a finite-state controller that issues instructions. The standard Minsky machine uses three instructions: increment a register, decrement a register (with a branch on zero), and halt. Minsky proved in 1961 that two counters with these instructions suffice for Turing completeness.[^minsky]

Bank accounts map directly to registers. Balances are non-negative integers (in the smallest currency unit). A transfer of amount 1 from account $A$ to account $B$ is a paired instruction: decrement($A$), increment($B$). Money is conserved — the total across all registers is invariant. This is already a constraint that standard counter machines do not have. In a Minsky machine, you can increment one register without decrementing another. In the banking model, every increment is paired with a decrement. The system is **conservative**: it is a counter machine where the sum of all registers is a constant of motion.

This conservation law is not incidental. It is the defining property that separates "money" from "data." A register in a Minsky machine holds an abstract number. A bank account holds a *conserved quantity*. You cannot create money by incrementing a register; you can only move it. This makes the banking machine a strict subset of counter machines.

### The zero-test question

The gap between sub-Turing and Turing-complete hinges on a single capability: the **zero-test**. A counter machine with increment, decrement, and zero-test (branch if a register is empty) is Turing-complete with just two registers. A counter machine with only increment and decrement — no zero-test — is strictly weaker.

Does the banking system have a zero-test? On the surface, no. A transfer instruction does not branch. But consider what happens when a transfer *fails*: if account $A$ has insufficient funds, the transfer is rejected. The sender learns that their balance is below the transfer amount. This is not a zero-test, but it is a **threshold test**: "is the balance of register $A$ at least $x$?"

A threshold test is strictly more powerful than no test and, in some encodings, equivalent to a zero-test. If you attempt to transfer the entire balance of account $A$ (an amount you can query), and then attempt to transfer 1 more unit, the failure of the second transfer confirms the balance is exactly zero. With this two-step probe, the banking system has an effective zero-test — but only for the account holder's own register, and only at the cost of an actual transfer (fuel) plus a failed transfer (which may also cost a fee).

This gives us a conditional: if the banking system allows transfer-and-branch-on-failure, it has the computational power of an **inhibitor Petri net**, which is Turing-complete.[^inhibitor] If it does not — if failures are simply silent rejections with no programmatic branching — then we are in the territory of plain Petri nets and **vector addition systems** (VAS), which are strictly sub-Turing but still computationally non-trivial.[^vas]

### The population protocol perspective

There is a more elegant framing. Ignore the balances for a moment and think of the accounts as **agents** that interact pairwise. Each agent has a finite state (its current role in a protocol — sender, receiver, waiting, done). When two agents interact (a transfer occurs), they update their states based on a transition function. This is exactly the **population protocol** model introduced by Angluin, Aspnes, Diamadi, and Fischer.[^popprotocol]

The foundational result of population protocols is sharp: the predicates stably computable by a population of finite-state agents interacting pairwise are exactly the **semilinear predicates** — those expressible in first-order Presburger arithmetic.[^semilinear] Presburger arithmetic is the theory of natural numbers with addition but no multiplication. It can express:

- **Linear thresholds**: "does account $A$ hold more than account $B$?"
- **Conservation laws**: "is the total money in the system equal to $M$?"
- **Modular predicates**: "is the total balance divisible by 3?"
- **Boolean combinations**: "does account $A$ hold at least 100 *and* account $B$ hold at most 50?"

It cannot express:
- **Multiplication**: "is the balance of $A$ equal to the product of the balances of $B$ and $C$?"
- **Exponentiation** or any super-linear function of balances.
- **General recursion**: nothing that requires unbounded memory beyond the registers themselves.

This is a precise characterization of the computational power of transfers alone, under the assumption that accounts have finite state (beyond their balance) and interact pairwise. The banking system, viewed as a population protocol, computes exactly Presburger arithmetic.

### What Presburger arithmetic buys you

Presburger arithmetic is decidable — every sentence in it can be mechanically verified as true or false. This means that any property expressible in the banking-as-population-protocol model is automatically verifiable. Regulators can, in principle, check any semilinear property of the transaction history mechanically. This is a feature, not a limitation: the computations the banking system can perform are exactly the ones it can also *audit*.

Concretely, the semilinear predicates include:

- **Balance invariants**: the total money in a closed set of accounts is conserved across all transactions. This is the fundamental accounting identity, and it is a semilinear statement.
- **Threshold compliance**: no account drops below a minimum balance. This is a conjunction of linear inequalities — semilinear.
- **Flow limits**: the net flow between any two accounts in a given period does not exceed a regulatory cap. This is a bounded difference constraint — semilinear.
- **Proportional distribution**: after a set of transactions, each account in a group holds a share within a specified range of the group total. This involves ratios, which are *not* directly semilinear — but if the proportions are fixed rational numbers (e.g., 50/50 split), the condition reduces to a linear constraint on integer balances, which is semilinear.

Multiplication is the boundary. Any financial computation that requires multiplying two account balances — interest calculation, for instance, where the interest depends on *both* the principal and the rate, and both are dynamic — falls outside Presburger arithmetic. The banking system cannot natively compute compound interest through transfers alone. It needs an external oracle (the bank's own computer) to calculate the amount, which is then injected into the system as a transfer. The transfer is the *output* of the computation, not the computation itself.

### The hierarchy of banking computation

Putting this together, transfers alone give us a precise hierarchy:

| Model | Capability | Banking analogue |
|-------|-----------|-----------------|
| Plain Petri net / VAS | Reachability decidable but EXPSPACE-hard | Transfers with no failure feedback |
| Population protocol | Semilinear predicates (Presburger arithmetic) | Pairwise transfers with finite-state accounts |
| Inhibitor Petri net | Turing-complete | Transfers with branch-on-insufficient-funds |
| Counter machine (Minsky) | Turing-complete | Unrestricted increment/decrement (not conservative) |

The banking system lives in the middle rows. Without programmatic branching on transfer failure, it computes semilinear predicates — addition, thresholds, modular arithmetic, conservation laws. With branching on failure, it becomes Turing-complete in principle, though the fuel cost per step makes non-trivial programs astronomically expensive.

The deeper point is that the conservatism of money — the fact that transfers preserve total value — restricts the computational model to exactly the class of computations that are inherently auditable. Semilinear predicates are decidable. Conservation laws are checkable. Threshold conditions are verifiable. The banking system computes what it can verify, and nothing more. Whether this is a design choice or an emergent property of money-as-conserved-quantity, the alignment is exact.

## Beyond addition: can we get a field?

The monoid gives us sequential composition. The RAAG gives us partial commutativity. The population protocol gives us Presburger arithmetic — addition, thresholds, modular predicates. But Presburger arithmetic has no multiplication. This is precisely where compound interest, risk-weighted capital, and portfolio optimization live. The boundary between what the banking system can compute natively (semilinear predicates) and what requires an external oracle (anything involving products of balances) is the boundary between addition and multiplication.

Can we push the algebraic structure further? A group gives us one operation. For a ring or a field, we need a second operation compatible with the first.

The natural candidate for "addition" is merging parallel transaction histories: if two disjoint sets of accounts transact independently, their histories can be combined. "Multiplication" would be sequential composition, which is already the monoid operation. But a field requires multiplicative inverses for every nonzero element, meaning every transaction sequence has an "undo" sequence — which banking does not natively support.

There is, however, a path to linear structure. The **cycle space** of the transaction graph — the set of all closed loops of money flow — forms a vector space over $\mathrm{GF}(2)$.[^cyclespace] This is standard algebraic graph theory. The **flow space** — net money flows along edges — lives in a vector space over $\mathbb{Q}$ or $\mathbb{R}$. Neither gives a field directly, but field extensions can be built from the flow algebra.

This connects to network coding[^netcode] and algebraic graph theory rather than group-based cryptography. The semilinear predicates give us addition. A field would give us multiplication. Whether the flow algebra on the transaction graph bridges this gap — and whether such a bridge would enable homomorphic operations on transaction data — is an open question that connects the privacy story (RAAG hardness) to the computation story (Presburger limitations) at their shared boundary.

## What is new here

The existing literature on group-based cryptography[^groupcrypto] uses braid groups, polycyclic groups, and RAAGs as *platforms* for cryptographic protocols. The literature on MPC in banking[^mpcbank] uses MPC to protect customer data during joint analytics. The literature on blockchain as computation[^ethcompute] builds general-purpose world computers with smart contracts. These are separate research programs that do not talk to each other.

Three insights emerge from treating the banking network as simultaneously an MPC protocol and a computation platform.

First, the privacy of banking is not uniform — it degrades monotonically as the transaction graph densifies. The dynamic RAAG framework $\{A_{\Gamma_t}\}$ gives this structure: privacy is the complexity of the transaction reconstruction problem in a RAAG whose commutativity graph loses edges over time. The trajectory from $\mathbb{Z}^M$ (all accounts independent) toward $F_M$ (all accounts entangled) is the trajectory from information-theoretic security to none. The NP-completeness of the underlying graph homomorphism problem provides a worst-case complexity-theoretic floor, though whether real transaction networks hit hard instances on average — the standard cryptographic requirement — remains open.[^avgcase]

Second, the computational power of banking is not a limitation — it is a design feature. The banking system, viewed as a population protocol, computes exactly the semilinear predicates: addition, thresholds, modular arithmetic, conservation laws. These are precisely the predicates that are decidable and therefore mechanically auditable. The conservatism of money — every transfer preserves total value — restricts the system to computations it can verify. Money and auditability are entangled at the level of computation theory.

Third, fuel cost is not overhead — it is the primary mechanism that bounds computation. Banking achieves what blockchains attempt through consensus: computation that terminates, is fully traced, and resists abuse. But it does so at a fraction of the infrastructure cost, by relying on legal enforcement and the economic constraint that every operation must be worth paying for. The banking system is not a slow computer. It is a settlement engine whose slowness is a feature — a built-in `sleep()` that gives parties time to detect errors, raise disputes, and enforce contracts.

## Notes

[^cash]: This is an idealization. Physical banknotes have serial numbers, and sufficiently motivated investigators can trace them. The information-theoretic claim applies to the cash *abstraction*, not to physical implementation. The same distinction holds in cryptography: a one-time pad is information-theoretically secure in the mathematical model, but physical implementations can leak through side channels.

[^freemonoid]: The free monoid on a set $S$ is the set of all finite words in the elements of $S$, with concatenation as the operation and the empty word as identity. Unlike a free group, there are no inverses: once a letter is written, it cannot be cancelled. This is the natural algebraic model for irreversible processes.

[^freegroup]: The free group $F_M$ on $M$ generators is the group of all finite words in the generators and their inverses, with the only relation being cancellation of adjacent inverse pairs. It is the "most non-commutative" group on $M$ generators. In the banking model, $M = N(N-1)$ where $N$ is the number of accounts, since generators are directed transfers. See: W. Magnus, A. Karrass, D. Solitar, *Combinatorial Group Theory*, Dover, 2004.

[^reconstructionnote]: The standard Membership Problem asks: "given a word $w$ and a subgroup $H$, is $w \in H$?" The transaction reconstruction problem is a search variant: "given a projection of $w$ onto generators involving account $A$, recover $w$ (or determine properties of $w$)." This is harder than membership testing and connects to the Conjugacy Search Problem studied in braid group cryptography.

[^avgcase]: NP-completeness is a worst-case guarantee: it says that *some* instances of the problem are hard, not that *typical* instances are. In cryptography, security requires average-case hardness — hardness for random or structured instances. Whether the graph homomorphism instances arising from real transaction networks are hard on average is an open question that would need to be resolved for a rigorous privacy guarantee.

[^raag]: Right-angled Artin groups are also called graph groups or partially commutative groups. The defining presentation is $A_\Gamma = \langle v_1, \ldots, v_n \mid [v_i, v_j] = 1 \text{ if } (v_i, v_j) \in E(\Gamma) \rangle$. See: R. Charney, "An Introduction to Right-Angled Artin Groups," *Geometriae Dedicata*, 125:141--158, 2007. [people.brandeis.edu](https://people.brandeis.edu/~charney/papers/RAAGs.pdf)

[^floraag]: R. Flores, D. Kahrobaei, T. Koberda, "Cryptography with Right-Angled Artin Groups," *Theoretical Computer Science*, 2019. Originally arXiv:1610.06495. [arxiv.org](https://arxiv.org/abs/1610.06495)

[^subiso]: The Subgroup Isomorphism Problem asks: given two finitely generated subgroups of a group $G$, are they isomorphic? For certain RAAGs, this problem is undecidable. See Flores, Kahrobaei, and Koberda, cited above.

[^graphhom]: The Graph Homomorphism Problem asks: given graphs $G$ and $H$, does there exist a graph homomorphism $G \to H$? This is NP-complete in general. For RAAGs, the Group Homomorphism Problem reduces to this graph problem, inheriting its complexity. See: P. Hell, J. Nešetřil, *Graphs and Homomorphisms*, Oxford University Press, 2004.

[^irreversible]: Chargebacks and reversals exist but are not algebraic inverses. A chargeback creates a new transaction, not an annihilation of the original. The transaction graph only grows; edges are never deleted.

[^cyclespace]: The cycle space of a graph $G$ is the kernel of the incidence matrix over $\mathrm{GF}(2)$, or equivalently the first homology group $H_1(G; \mathbb{Z}/2\mathbb{Z})$. Its dimension is $|E| - |V| + c$, where $c$ is the number of connected components. See: R. Diestel, *Graph Theory*, 5th edition, Springer, 2017.

[^netcode]: Network coding allows intermediate nodes in a network to combine incoming packets algebraically rather than simply forwarding them. The algebraic structure is typically a vector space over a finite field. See: R. Ahlswede, N. Cai, S.-Y.R. Li, R.W. Yeung, "Network Information Flow," *IEEE Transactions on Information Theory*, 46(4):1204--1216, 2000.

[^groupcrypto]: For a comprehensive survey of group-based cryptography, see: A.G. Myasnikov, V. Shpilrain, A. Ushakov, *Non-commutative Cryptography and Complexity of Group-theoretic Problems*, AMS Mathematical Surveys and Monographs, vol. 177, 2011. For a recent survey including post-quantum considerations: D. Kahrobaei, R. Flores, "Group-based Cryptography in the Quantum Era," Cryptology ePrint Archive 2022/1161. [eprint.iacr.org](https://eprint.iacr.org/2022/1161.pdf)

[^mpcbank]: Privacy-preserving financial analytics using MPC is an active area. Banks have used MPC for joint anti-money-laundering screening and credit risk assessment without revealing individual customer data. See: D. Bogdanov, S. Laur, J. Willemson, "Sharemind: A Framework for Fast Privacy-Preserving Computations," *ESORICS 2008*, LNCS vol. 5283, Springer, 2008.

[^ethgas]: V. Buterin, "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform," Ethereum White Paper, 2014. The gas mechanism assigns a cost to every EVM opcode, bounding computation economically rather than syntactically. See also: G. Wood, "Ethereum: A Secure Decentralised Generalised Transaction Ledger," Yellow Paper, 2014.

[^clearing]: Multilateral netting reduces gross obligations to net positions. If $N$ parties have pairwise debts, the clearinghouse solves a flow problem to minimize the total number and value of transfers. CLS Bank, which settles foreign exchange transactions, processes over \$5 trillion daily using this principle. See: M. Manning, E. Nier, J. Schanz, eds., *The Economics of Large-Value Payments and Settlement*, Oxford University Press, 2009.

[^escrow]: In legal terms, escrow is a financial arrangement where a third party holds and regulates payment of funds required for two parties involved in a given transaction. In cryptographic terms, it is a commitment scheme where the binding property is enforced by contract law rather than computational hardness.

[^timelock]: The T+2 settlement cycle for securities (two business days between trade and settlement) is a regulatory-mandated delay function. It exists to allow time for error correction, fraud detection, and dispute resolution. The SEC moved from T+3 to T+2 in 2017, and to T+1 in 2024 — each reduction was a major infrastructure project, illustrating how deeply latency is embedded in the system's design.

[^voting]: Publicly auditable MPC formalizes this: Baum, Damgård, and Orlandi showed that any MPC protocol can be made publicly auditable by combining it with a SNARK, allowing external parties to verify correctness without participating in the computation. See: C. Baum, I. Damgård, C. Orlandi, "Publicly Auditable Secure Multi-Party Computation," *SCN 2014*, LNCS vol. 8642, Springer, 2014. [eprint.iacr.org](https://eprint.iacr.org/2014/075.pdf)

[^smartcontracts]: The tension between programmability and security is well-studied. The DAO hack in 2016 exploited a reentrancy vulnerability in a smart contract, resulting in a \$60 million loss. Fixed instruction sets eliminate this class of vulnerability entirely. The banking system's lack of programmability is, from a security perspective, a feature.

[^evmcost]: General-purpose zero-knowledge computation currently runs $10^6$ to $10^7$ times slower than native execution. Even without ZK overhead, EVM execution is roughly $10^5$× slower than equivalent native code due to the consensus and gas-metering overhead. See: P. Dowman, "What is Verifiable Computing?" 2024. [pauldowman.com](https://www.pauldowman.com/posts/what-is-verifiable-computing/)

[^countermachine]: A counter machine is a restricted register machine where each register holds a non-negative integer and the instruction set is limited to increment, decrement, and conditional branching (typically on zero). See: M.L. Minsky, *Computation: Finite and Infinite Machines*, Prentice-Hall, 1967. [Counter machine - Wikipedia](https://en.wikipedia.org/wiki/Counter_machine)

[^minsky]: M.L. Minsky, "Recursive Unsolvability of Post's Problem of 'Tag' and Other Topics in Theory of Turing Machines," *Annals of Mathematics*, 74(3):437--455, 1961. The key result: a counter machine with only two counters and the instructions increment, decrement-with-zero-test, and halt can simulate any Turing machine.

[^inhibitor]: An inhibitor Petri net extends the standard Petri net with inhibitor arcs that allow a transition to fire only when a place is empty (contains zero tokens). This single addition — the zero-test — makes the model Turing-complete. See: G. Ciobanu, G.M. Pinna, "Catalytic Petri Nets Are Turing Complete," *LATA 2012*, LNCS vol. 7183, Springer, 2012. [springer.com](https://link.springer.com/chapter/10.1007/978-3-642-28332-1_17)

[^vas]: Vector addition systems (VAS) are equivalent to Petri nets without inhibitor arcs. The reachability problem for VAS is decidable but EXPSPACE-hard — one of the most celebrated results in theoretical computer science. See: J. Leroux, "The Reachability Problem for Petri Nets Is Not Elementary," *Journal of the ACM*, 69(1):1--28, 2022. The decidability was originally proved by E.W. Mayr in 1981.

[^popprotocol]: D. Angluin, J. Aspnes, Z. Diamadi, M.J. Fischer, R. Peralta, "Computation in Networks of Passively Mobile Finite-State Sensors," *Distributed Computing*, 18(4):235--253, 2006. The original population protocol paper. Agents are anonymous, finite-state, and interact pairwise — a model strikingly similar to bank accounts exchanging transfers.

[^semilinear]: D. Angluin, J. Aspnes, D. Eisenstat, E. Ruppert, "The Computational Power of Population Protocols," *Distributed Computing*, 20(4):279--304, 2007. The main theorem: the predicates stably computable by population protocols are exactly the semilinear predicates, i.e., those definable in first-order Presburger arithmetic (natural numbers with addition, no multiplication). [arxiv.org](https://arxiv.org/abs/cs/0608084)

[^ethcompute]: The framing of Ethereum as a "world computer" originates with V. Buterin. For a critical analysis of Turing completeness claims in blockchain, see discussions on how gas limits make the EVM practically sub-Turing: the set of programs that can execute is bounded by the block gas limit, which is finite and externally set. The machine is Turing-complete in the same sense that a computer with 4 GB of RAM is Turing-complete — theoretically yes, practically no.
