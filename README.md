# Agent Frontier Exam

Agent Frontier Exam evaluates AI agents on scientific work, from demanding research workflows to verifiable breakthroughs. This repository contains the English, light-theme Taskonomy website and its editorial documentation.

**[Open the private v0.1 release](https://github.com/PrismaX-Team/AgentFrontierExam-Home/releases/tag/v0.1.0).** Download `agent-frontier-exam-v0.1.html` and open it in a browser to explore the whole site. The ZIP in the same release contains the static site with its original directory structure.

![Four scientific task cards showing a star cluster, a connectivity matrix, a quantum circuit and a crystal lattice](review/v0.1-showcase.png)

## Explore the site

- Select a layer of the rotating pyramid. L1 opens seven research activities, each with a related task and a link to its activity in the directory. L2 and L3 explain the scientific goal and the evidence a breakthrough would require.
- Explore 16 task briefs by field and research activity. Four illustrated showcases lead to the same briefs as the directory. Each brief covers starting materials, the required deliverable and how success is assessed.
- Read the annotated Harbor task package guide, submit a workflow or breakthrough task through Duanyan ReX, or visit the authorship page for participant credit and area chair recruitment.

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
| Release scope and criteria for opening the new portal to the public | [Publication plan](docs/publication-plan.md) |
| Scientific levels, pyramid geometry and interactions | [Homepage and pyramid](docs/home-and-pyramid.md) |
| Routes, community materials and sources | [Pages and editorial sources](docs/pages-and-sources.md) |
| Task selection, package provenance and scientific-level evidence | [Task card provenance](docs/task-selection.md) |
| Current edition and next editorial decisions | [项目现状](项目现状.md) |

The earlier [motion study](review/pyramid-motion.mp4) and [interactive design study](review/pyramid-study.html) document the evolution of the homepage. The [public AFE portal](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/) has its own repository and release cycle.
