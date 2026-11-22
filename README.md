# Agent Frontier Exam

Agent Frontier Exam evaluates AI agents on scientific work, from demanding research workflows to verifiable breakthroughs. This repository contains the English and Chinese Taskonomy website and its editorial documentation.

**[Visit the Agent Frontier Exam website](https://prismax-team.github.io/AgentFrontierExam-Home/).** GitHub Pages publishes the site from this public repository. Each push to `main` builds the site, checks it and deploys the result.

The first offline edition is available in the [v0.1 release](https://github.com/PrismaX-Team/AgentFrontierExam-Home/releases/tag/v0.1.0). Run `npm run package:offline` to build a self-contained copy of the current bilingual site.

![Four scientific task cards showing a star cluster, a connectivity matrix, a quantum circuit and a crystal lattice](review/v0.1-showcase.png)

## Explore the site

- The pyramid links scientific workflows, scientific breakthroughs and foundational discoveries to examples. Selecting a solid brings that level forward. The three sectors at the centre of L1 each open a different activity. A faded solid opens its own level. The complete pyramid beside **All levels**, the surrounding paper and Escape return to the assembled view.
- The directory covers all 119 archived tasks. It shows field and activity counts, explains the three scientific levels, and includes a field-by-activity matrix. Search or filter the text index, ten briefs per page. Selected examples carry a photograph or a scientific diagram.
- Contribute illustrates how a workflow, breakthrough or foundational discovery fits in a task package. It links to Duanyan ReX, the annotated Harbor guide and the authorship guide.
- Choose **中文** or **EN** in the header to open the same page in the other language, including the current catalogue filters. Search matches terms from either language. The sun and moon control switches the colour scheme. The site follows the system appearance until the reader makes a choice.
- The footer links to Shanghai AI Laboratory, Duanyan, project resources and the contact address. **Copy citation** copies a BibTeX entry for the benchmark website.

## Run locally

Use Node.js 24 and npm. The website has no external runtime or build dependencies.

```sh
npm run dev
```

Open `http://127.0.0.1:4173/`. To choose a port, run `npm run dev -- --port 8080`.

| Command | Output |
| --- | --- |
| `npm run build` | A static site in `dist/`, suitable for a domain root or a subdirectory |
| `npm run check` | Rebuilds the site and checks page links, anchors, illustrations and pyramid destinations |
| `npm run package:offline` | A complete, self-contained site in `dist-offline/agent-frontier-exam-v0.1.html` |

## Editorial documents

| Topic | Document |
| --- | --- |
| Release scope and publication process | [Publication plan](docs/publication-plan.md) |
| Scientific levels, pyramid geometry and interactions | [Homepage and pyramid](docs/home-and-pyramid.md) |
| Routes, community materials and sources | [Pages and editorial sources](docs/pages-and-sources.md) |
| Task selection, package provenance and scientific-level evidence | [Task card provenance](docs/task-selection.md) |
| Current edition and next editorial decisions | [项目现状](项目现状.md) |

The earlier [motion study](review/pyramid-motion.mp4) and [interactive design study](review/pyramid-study.html) document the evolution of the homepage. The [earlier AFE portal](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/) has its own repository and release cycle.
