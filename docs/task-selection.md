# Task card provenance

The v0.1 directory contains 16 editorial task cards drawn from eight collections. Its four showcases illustrate different scientific activities and different forms of evidence. The directory data is in [tasks.json](../src/data/tasks.json).

## Selection and sources

`AFE_Taskonomy_v1/分类说明.md` counts 119 unique packages across ten collections and describes 16 primary workflows. `AFE_Taskonomy_v1/逐题分类.tsv` records the canonical archive path, domain, workflow and rationale for each one. The domain and workflow directories link to the same packages. Use the archive path when tracing a card.

Paths in the table are relative to `AFE_Taskonomy_v1/original_archive/`. For each entry, the English title, starting material, requested output and evidence are paraphrased from its `instruction.md`. The workflow tag summarizes the task’s primary activity in the TSV. The two ALE entries have a suggested discipline in the TSV and await an official domain assignment. Their cards use those subject labels for browsing.

| Card ID | Source directory | Basis for the card |
| --- | --- | --- |
| `m13-surface-brightness` | `gui_cli/gui/ds9-m13-profile` | Showcase 1. Measure a cluster centre, surface-brightness profile and counting uncertainties from an image in DS9. |
| `brain-connectivity-modules` | `brainarena/legare_2025__Fig_3A` | Showcase 2. Reconstruct a specified paper panel from regional brain connectivity, including its module boundaries and clustering tree. The package README says the study data must be supplied separately. |
| `quantum-circuit-experiment-design` | `ale_v1009_top10/tasks/computing_math-qcompile-dynamic-circuit-experiment-design-02` | Showcase 3. Choose five experiments on a calibrated quantum processor, allocating measurements under a time budget. Suggested discipline is physics. |
| `crystal-stability` | `external_collaboration/tasks/crystal_stability` | Showcase 4. Predict formation energies. The reference energy hull and structural-prototype evaluation set determine the stability classification score. |
| `review-efficient-fine-tuning` | `deepresearch_xhw/tasks/lr_peft_llm_002` | Compare parameter-efficient fine-tuning research from 2019 through 2025 in a structured review. |
| `western-cape-river-corridor` | `gui_cli/gui/qgis-river-buffer` | Reproject a river network and produce a portable QGIS project with a ten-kilometre corridor. |
| `river-routing-models` | `ale_v1009_top10/tasks/geospatial-hydro-flow-accumulation-inverse-inference-02` | Compare drainage-routing predictions against independent channel controls in two regions. Suggested discipline is Earth science. |
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

The current records consulted do not provide a post-D44 level assignment for these 16 packages. Their `level` fields are null. This includes the older L1 metadata on the crystal, EEG, literature-review and clinical synthesis packages. The verified Earth Co-Scientist collection explicitly leaves formal levels pending in `AFE_Control_Board/AFE_1_0_verified/earth_cql/README.md`. Numerical difficulty and the ligand identifier L2 in the zinc task have separate meanings.

The guide illustrates L1 with faint-star recovery. The matching task brief in `AFE_Control_Board/cli_harbor_v0_2/tasks/sextractor-recovery/` evaluates faint sources and close pairs across exposures. The first archive’s `gui_cli/cli/sextractor-catalog/` instead requires a catalogue, a background image and two morphology-selected samples in a single field. The M13 card describes a third scientific activity. An L1 assignment for the illustration cannot be attached to either archive task on the strength of their shared subject or software.

## Package metadata

Eight cards carry an exact `packageVersion` from the `version` field under `[task]` in the corresponding `task.toml`. The top-level Harbor schema version describes the specification and is omitted from the cards. Source packages, grading code, research data, personal details and review records stay outside the website. The table records the source paths that editors can use to trace these public task summaries. The original archive and the AFE Control Board are internal resources.
