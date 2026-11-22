# Task card provenance

The public directory covers 109 L1 scientific workflow packages from the first Taskonomy archive. Every task has an English and Chinese title, scientific brief and deliverable. Fourteen of the original editorial cards are in this edition and retain their URLs and longer descriptions. Four of these appear in the homepage task showcase. [Catalogue data](../src/data/tasks.json)

## Selection and sources

`AFE_Taskonomy_v1/分类说明.md` counts 119 unique packages across ten collections and describes 16 primary workflows. `AFE_Taskonomy_v1/逐题分类.tsv` records the canonical archive path, domain, workflow and rationale for each one. The domain and workflow directories link to the same packages. Use the archive path when tracing a card.

Each record has a stable website `id` and an `archiveKey` matching its package in the inventory. The November 22 publication decision excludes the 10 GDPX records from the public catalogue. The remaining 109 packages span nine collections, 11 scientific fields and 15 research activities, with 43 occupied field–activity intersections. Both languages use the same field and activity keys. [Taxonomy labels](../src/data/taxonomy.mjs)

With the archive mounted, run `node scripts/check-archive.mjs <AFE_Taskonomy_v1 directory>` to verify the published set against the scoped inventory, the original packages and both classification views. The public site builds from the checked-in descriptions.

The table traces the 14 longer editorial briefs in this edition. Paths are relative to `AFE_Taskonomy_v1/original_archive/`. Starting materials, requested outputs and assessment are paraphrased from package instructions.

| Card ID | Source directory | Basis for the card |
| --- | --- | --- |
| `m13-surface-brightness` | `gui_cli/gui/ds9-m13-profile` | Showcase 1. Measure a cluster centre, surface-brightness profile and counting uncertainties from an image in DS9. |
| `brain-connectivity-modules` | `brainarena/legare_2025__Fig_3A` | Showcase 2. Reconstruct a specified paper panel from regional brain connectivity, including its module boundaries and clustering tree. The package README says the study data must be supplied separately. |
| `crystal-stability` | `external_collaboration/tasks/crystal_stability` | Showcase 4. Predict formation energies. The reference energy hull and structural-prototype evaluation set determine the stability classification score. |
| `review-efficient-fine-tuning` | `deepresearch_xhw/tasks/lr_peft_llm_002` | Compare parameter-efficient fine-tuning research from 2019 through 2025 in a structured review. |
| `western-cape-river-corridor` | `gui_cli/gui/qgis-river-buffer` | Showcase 3. Reproject a river network and produce a portable QGIS project with a ten-kilometre corridor. |
| `rain-gauge-diagnostics` | `earth_cql/earthcosci_4e1528ed76e20041` | Diagnose extreme hourly readings with nearby gauges and radar, and assess sensitivity to time scale. |
| `ecological-recovery-shortfall` | `earth_cql/earthcosci_e1e0f2682bc3c4cf` | Estimate cumulative shortfall relative to a reference condition and account for within-study dependence. |
| `cosmic-ray-propagation` | `hep_zju/ams02-boron-carbon-propagation-models` | Compare two proposed slopes with the measured cosmic-ray boron-to-carbon spectrum. |
| `seawater-carbonate-equilibrium` | `earth_cql/earthcosci_dfb2f8ce0264f8fc` | Compare equilibrium calculations over controlled environmental conditions and check them independently. |
| `solar-grid-voltage` | `gui_cli/cli/opendss-pv` | Attribute changes in a daily feeder-voltage curve to solar generation through paired OpenDSS runs. |
| `eeg-selective-decoding` | `external_collaboration/tasks/eeg_mi_selective_gating` | Decide when to accept or abstain from a motor-imagery prediction on a later session, and evaluate coverage subject to an error limit. |
| `zinc-ester-cleavage` | `chem_xsy/tasks/chem_duration_04` | Test explanations for two measured cleavage rates using speciation, rate estimates and computational chemistry. |
| `lung-cancer-trial-evidence` | `deepresearch_xhw/tasks/ma_life_nsclc_neoadjuvant_ici_001` | Extract and pool survival and pathological response evidence separately across eight randomized trials. |
| `identify-filter-circuits` | `gui_cli/cli/ngspice-identification` | Infer wiring and component values from frequency-response measurements and predict a board’s response after a load change. |

## Scientific levels

Decision D44 of 19 November 2026 and `AFE_Control_Board/docs/38_afe_v1_scope_and_taskonomy.md` define L1 as completing a challenging scientific workflow, L2 as resolving an open scientific problem in a verifiable way, and L3 as achieving a major breakthrough of demonstrable significance to the field. The guide treats old package grades as source records and calls for checking individual task objectives and acceptance conditions under the current scheme. The archive TSV classifies each task’s activity. An activity label can link a card to the pyramid independently of a formal scientific level.

The website uses **Foundational discoveries** as the English title for L3. The submission should identify what would be established for the first time, how others could verify it, and which new predictions or lines of inquiry it would open for the field. The cards retain their recorded scientific levels.

The project confirmed on November 22 that all 109 tasks in this release belong to L1. The site records that decision in each task’s `level` field. The L2 and L3 pyramid examples use related L1 workflows to illustrate the evidence a breakthrough would require. Future tasks can carry their own L2 or L3 assignments.

## Package metadata

Fifty-nine cards carry an exact `packageVersion` from the `version` field under `[task]` in the corresponding `task.toml`. The top-level Harbor schema version describes the specification and is omitted from the cards. Source packages, grading code, research data, personal details and review records stay outside the website. The table records the source paths that editors can use to trace these public task summaries. The original archive and the AFE Control Board are internal resources.
