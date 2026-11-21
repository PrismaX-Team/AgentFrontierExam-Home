# 栏目与编辑说明

## v0.1 页面

| 页面 | 读者可以做什么 |
| --- | --- |
| Home · `/` | 用可选的金字塔探索科学目标与科研活动，或浏览四张不同学科与不同交付物的精选题卡。页末有共建入口与按领域编排的顾问委员会名录。 |
| Tasks · `/tasks/` | 领域与科研活动组成矩阵，格内数字链接到对应的任务。来自金字塔的入口保留所选活动。搜索、领域与活动可组合，筛选地址可以分享。 |
| Task · `/tasks/<id>/` | 阅读起始材料、交付物与验收证据。确有来源时列出题包版本和出处。学科与活动链接都可继续查找相关题。 |
| Contribute · `/contribute/` | 了解科学流程题与突破题，准备一个 ZIP，进入唯一的端砚 ReX 提交入口。关键中文表单字段附有英文说明。 |
| Task package guide · `/contribute/task-package/` | 按五种题包组成阅读 Harbor 示例。示例与十三处旁注并排，手机顺序排布。页面内可直达每个文件、归档布局和交付要求。 |
| Authorship · `/authorship/` | 阅读参与者署名、Area Chair 招募、入库计数、论文与 FAQ，或从页内导航查看顾问委员会。 |

Results 的编辑标准是可比较的实验、任务版本、分母与运行条件，可参阅[出版计划](publication-plan.md)。四张精选题和目录均从同一份数据生成。逐题的归档位置、领域标签和科学层级依据记录在[题卡溯源](task-selection.md)。

## 金字塔题卡配图

金字塔中的七种活动各关联一道实际归档题。L2 在没有正式定级题目时，展示宇宙线传播模型的假设检验。L3 对应生态恢复的跨研究证据综合。这两处的卡片注明 Related workflow，旁边保留各层级需要提交的证据。未来有确切定级的题目时，优先展示该级别的题卡与配图。

M13 采用已署名的哈勃照片，脑连接、量子实验与晶体沿用精选区的示意图。其余五幅均为[本站绘制的科研示意图](../scripts/illustrate-activities.py)，分别展示三类微调方法、汇合处融并的河流缓冲带、河道验证点与候选路线、两种幂律与观测误差，以及生态恢复路径下的累积缺口。每幅图的任务详情页均有说明。河网、曲线和观测点用来说明方法，未采用源研究的数据。

## 共建与署名依据

2026-11-20 核读的飞书指南为修订 1098。征题同时覆盖有挑战的科学流程和突破类科研问题。流程按 L1 申报，突破按目标选择 L2 或 L3，也可以选择暂不确定。端砚表单的合作来源选学术合作。英文页将这些选项与科学目标放在一起讲清楚。[AFE 共建指南](https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f) · [端砚 ReX](https://discovery-home.intern-ai.org.cn/home/event/rex/index.html)

任务包说明按当前指南的 Harbor 0.25.0 和模板 1.0.1 整理。用一个海岸预报教学例串联五组文件，把对应注解贴在题面片段旁。网站只将提交引向端砚，端砚接收每题一个含 `task_package/` 的 ZIP。

同一指南规定成功入库三道题可获得论文共同作者资格。AC 招募至少五位参与者，同时参与科学领域和流程分类及阶段评审。参与者与 AC 各自的贡献、共同供题与计数问题在独立署名页说明。[署名依据](https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f)

## 顾问委员会肖像

首页和署名页共用 [专家名录](../src/data/experts.json)。七位顾问依五个领域编排，英文姓名、机构与研究者主页沿用旧站公示信息。六张照片裁为 4∶5，在页面上降低饱和度，随站点和离线版一同提供。物理组 Shufei Zhang 的原名册照片栏为空，该条目保留姓名、机构及 OpenReview 主页。[旧站顾问委员会](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/#academic-committee) · [ReX 项目名册](https://github.com/PrismaX-Team/Rex-Analysis/blob/main/content/committee.json)

| 姓名 | 旧站公开原图 |
| --- | --- |
| Bo Zhang | [bo-zhang.webp](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/bo-zhang.webp) |
| Wenlong Zhang | [wenlong-zhang.webp](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/wenlong-zhang.webp) |
| Zhen Zhao | [zhen-zhao.jpg](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/zhen-zhao.jpg) |
| Fenghua Ling | [fenghua-ling.webp](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/fenghua-ling.webp) |
| Ming Hu | [ming_hu.webp](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/ming_hu.webp) |
| Tianfan Fu | [tianfan-fu.webp](https://prismax-team.github.io/AgentFrontierExam-Tasks/committee/tianfan-fu.webp) |

## 旧站可复用的材料

| 材料 | 新站怎样用 |
| --- | --- |
| 公开任务身份、版本和署名 | 沿用同一题的身份，逐题核对新 Level 和可公开字段。旧等级作为来源记录保存。 |
| 有旁注的任务包说明 | 沿用阅读形式，用新版 Taskonomy 的流程例子重讲目标与验收，再说明突破题多出的依据。 |
| Authorship 与委员会资料 | 复用经核实的角色、公开名单和个人主页，重新编排成英文独立说明及简洁署名。 |
| 旧首页、账户、Proposal 与 PR 路径 | 新首页用金字塔做主要入口。任务提交直接进端砚。旧站承担已有链接的连续性。 |

[旧官网](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/) · [任务包旁注](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/contribute/task-contract/) · [原署名页](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/authorship/)

## 参考站给我们的具体选择

- **Claude、OpenAI Research** 都把首页最醒目的位置给一个清楚的主张。AFE 采用大字号全名和一条简短引言，用留白在图与文字之间建立主次。字体、配色与图形由 AFE 自行设计。[Claude](https://claude.com/) · [OpenAI Research](https://openai.com/research/)
- **Agents’ Last Exam** 从一句评测目标进入真实工作实例，另给任务、贡献与署名独立入口。AFE 让读者点一块就遇到一题，贡献者也能直接转发署名页。[首页](https://agents-last-exam.org/) · [贡献者 FAQ](https://agents-last-exam.org/faq#authorship)
- **Terminal-Bench** 将浏览任务的操作紧挨项目定义，结果表明确模型、agent 和度量。AFE 在题卡和结果入口保留这种直接性，指标跟随任务与运行版本。[Terminal-Bench](https://www.tbench.ai/)
- **Artificial Analysis** 在图旁写指标含义、单位、方向和版本。AFE 的 Results 用这一做法解释不同类任务各自的成功条件。[Artificial Analysis](https://artificialanalysis.ai/)
- **Sakana AI 的 ALE-Bench** 通过具体优化题和可测目标说明评测为何成立。可借鉴这种“展示输入与结果”的讲题方式。首页构图主要参考此前讨论的 Agents’ Last Exam。[ALE-Bench 项目介绍](https://sakana.ai/ale-bench/)

## 权威资料

共享盘上，以下文件均位于本仓库旁的 `../AFE_Control_Board/`。现行科学定义优先读 D44 与 docs/38。通过内容审查的内部题包还要确认公开授权、版本和展示内容才进入发行清单。公开榜单再关联可复核的同版运行。

| 在控制板内打开 | 用途 |
| --- | --- |
| `docs/03_questions_and_decisions.md` 的 D44 | 2026-11-19 确认的层级与类别 |
| `docs/38_afe_v1_scope_and_taskonomy.md` | 当前定位、科学流程示例与逐题归类原则 |
| `docs/39_unified_format_exploration.md` | 统一题目身份与评分口径的讨论背景，早期等级设想按原日期解读 |
| `cli_harbor_v0_2/tasks/sextractor-recovery/instruction.md` | 历史首页评审稿与征题说明中的暗星案例原题 |
