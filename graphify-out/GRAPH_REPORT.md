# Graph Report - /Users/macintoshhd/Documents/SRSS School Hub/site/src  (2026-07-20)

## Corpus Check
- Corpus is ~4,612 words - fits in a single context window. You may not need a graph.

## Summary
- 19 nodes · 19 edges · 2 communities (1 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Application Structure
- Application Structure

## God Nodes (most connected - your core abstractions)
1. `App()` - 2 edges
2. `navItems` - 1 edges
3. `values` - 1 edges
4. `galleryItems` - 1 edges
5. `learningTabs` - 1 edges
6. `hubs` - 1 edges
7. `aboutMilestones` - 1 edges
8. `humanValues` - 1 edges
9. `admissionSteps` - 1 edges
10. `newsItems` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (2 total, 1 thin omitted)

### Community 0 - "Application Structure"
Cohesion: 0.12
Nodes (13): aboutMilestones, admissionSteps, events, faqs, galleryItems, hubs, humanValues, learningTabs (+5 more)

## Knowledge Gaps
- **13 isolated node(s):** `navItems`, `values`, `galleryItems`, `learningTabs`, `hubs` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `navItems`, `values`, `galleryItems` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Structure` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._