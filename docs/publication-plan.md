# 出版计划

## v0.1 公开发行

首次接触 AFE 的读者可以从首页了解三个科学目标层级，选择一项科研活动进入真实题目。向下滚动可见四道精选任务。供题者可从顶栏直接查看图示共建指南。所有页面提供中英文和深浅配色。[新版官网](https://prismax-team.github.io/AgentFrontierExam-Home/)

| 阅读路径 | 本版实现 |
| --- | --- |
| 认识 Taskonomy | 全名与短引言配一座可选择的金字塔。L1 展开七类活动，每类都能读到相关题卡并浏览同活动的题。L2 与 L3 讲目标和证据。 |
| 看任务有多不同 | 首页的 Task showcase 并排展示天文测量、神经科学图表复现、量子实验设计和材料预测。四题的输入、产物与成功证据分别写在各自的详情页。 |
| 找到同类工作 | Tasks 展示第一版归档全部 119 题的领域和活动分布。矩阵格通向匹配的简报，目录每页十题，可分享筛选和页码。 |
| 带自己的题来 | Contribute 用档案夹图展示三种科学目标，连接任务包、署名和 AC 招募指南，并通过端砚 ReX 接收每题一个 ZIP。 |

底层七块和中层四块是这一版的几何布局。目录的科研活动来自题库，可以比首页列举的类型更丰富。正式等级对应任务目标和验收证据。待确认等级的题在目录中按活动与领域浏览。[科学层级与积木交互](home-and-pyramid.md) · [本版选题依据](task-selection.md)

## 网站发布与后续更新

- 新版通过 GitHub Pages 公开访问，与旧官网各自发行。网站源码、出版文档和历史设计评审稿存放在独立的公开仓库。推送到 `main` 会触发 GitHub Actions，检查通过后自动发布静态站点。[新版官网](https://prismax-team.github.io/AgentFrontierExam-Home/) · [源码仓库](https://github.com/PrismaX-Team/AgentFrontierExam-Home)
- 首次发行的单文件 HTML 与静态 ZIP 存于 Releases。当前双语版可用 `npm run package:offline` 重新打包。[下载 v0.1](https://github.com/PrismaX-Team/AgentFrontierExam-Home/releases/tag/v0.1.0)
- 后续更新由相应领域 AC 和供题者核对目标、验收、版本、署名与素材授权，网站编辑按逐题来源更新记录。
- Results 进入导航前，需要可复核的实验、任务版本、运行配置、样本范围、指标方向及分母。该页首屏优先展示结果与比较条件。已确认的单项结果可以先随任务发布。

## 内容的维护位置

任务元数据使用 `src/data/tasks.json`。首页精选、金字塔关联和目录详情共用这一份记录。几何块的类别和对应说明在 `src/views/pyramid.mjs` 中维护。社区政策和指南依据详见[栏目与编辑说明](pages-and-sources.md)。
