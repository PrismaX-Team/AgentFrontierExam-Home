# 栏目与编辑说明

## v0.1 页面

| 页面 | 读者可以做什么 |
| --- | --- |
| Home · `/` | 用可选的金字塔探索科学目标与科研活动，或浏览四张不同学科与不同交付物的题卡。页末有共建入口与可横向浏览的领域委员会名录。 |
| Tasks · `/tasks/` | 首屏可查看领域、任务类型和层级分布。L1 点阵按领域与科研活动查题，手机可从领域索引表头切到点阵。L2、L3 在首题收录前显示为禁用的「建设中」标签，原有直达链接可查看各层的示意图与共建标准。收录后可按领域浏览研究问题。各层共用下方每页十题的任务目录。 |
| Task · `/tasks/<id>/` | 阅读问题目标、交付物与分类。已有详细简报的题目还列出起始材料与验收证据。有记录时显示题包版本。学科与活动链接都可继续查找相关题。 |
| Contribute · `/contribute/` | 三张分层图页标出 L1、L2、L3 可申报的目标，汇入同一种任务包。随后按层级比较验收证据，准备 ZIP 并交给端砚 ReX。 |
| Task package guide · `/contribute/task-package/` | 按五种题包组成阅读 Harbor 示例。示例与十三处旁注并排，手机顺序排布。页面内可直达每个文件、归档布局和交付要求。 |
| Authorship · `/authorship/` | 属于 Contribute 栏目。阅读参与者署名、领域委员会招募、入库计数、论文与 FAQ，或从页内导航查看委员。 |
| Contributors · `/contributors/` | 按项目领导团队、领域委员会和任务贡献者翻阅姓名与所属机构。领导团队姓名旁的星号表示「学术通讯」（For scientific correspondence）。 |

Results 的编辑标准是可比较的实验、任务版本、分母与运行条件，可参阅[出版计划](publication-plan.md)。首页任务展示和目录均从同一份数据生成。逐题的归档位置、领域标签和科学层级依据记录在[题卡溯源](task-selection.md)。

每个页面都有同路径的 `/zh/` 中文版。切换语言会带上查询和章节锚点。英文共建页沿用 `/contribute/`，早期比较稿 `/contribute2/` 的书签也会到达这里。

目录概览、矩阵合计和逐题摘要使用同一份数据。圆盘各仓等角，色液面积与领域题量成正比。方槽等容，液位与该活动题量成正比。两图各以本组最大题量作为满量。塔的满量为题库总数，每层色液所占的容积反映该层的任务比例。本版 109 题均为 L1，L2 和 L3 显示空容器与零值。图旁列出全部类别和准确题数。三个视图可直接分享，切换语言后仍停在所选视图。常规题目以一致的文字行排列，首页任务展示和对应的详情页共用科学配图。[任务类型分布](https://prismax-team.github.io/AgentFrontierExam-Home/zh/tasks/?view=types) · [层级分布](https://prismax-team.github.io/AgentFrontierExam-Home/zh/tasks/?view=levels) · [同类目录参考](https://hub.harborframework.com/datasets)

## 标志与页脚

AFE 页眉和浏览器标签共用三层金字塔标志。页脚的实验室横标取自项目论文排版素材 `paper_writing/paper/imgs/logo_lab.png`，端砚横标沿用 ReX 官网的浅底原图。两个标志分别链接到机构和平台首页。[上海人工智能实验室](https://www.shlab.org.cn/) · [端砚原始标志](https://discovery-home.intern-ai.org.cn/home/shared/assets/logos/duanyan-default.svg)

GitHub 链接指向本站仓库。Hugging Face 暂链接到平台首页，待项目有公开地址后替换。Copy citation 提供官网的 BibTeX 引用，Contact 地址为 `interndiscovery@pjlab.org.cn`。[本站仓库](https://github.com/PrismaX-Team/AgentFrontierExam-Home) · [Hugging Face](https://huggingface.co/)

## 金字塔题卡配图

金字塔中的七种活动各关联一道实际归档题。L2 在没有正式定级题目时，展示宇宙线传播模型的假设检验。L3 对应生态恢复的跨研究证据综合。这两处的卡片注明 Related workflow，旁边保留各层级需要提交的证据。未来有确切定级的题目时，优先展示该级别的题卡与配图。

M13 采用已署名的哈勃照片，脑连接和晶体任务使用各自的示意图。其余四幅图分别展示三类微调方法、汇合处融并的河流缓冲带、两种幂律与观测误差，以及生态恢复路径下的累积缺口。每道题的详情页均有图注，说明照片来源或示意图所表达的研究方法。[图示生成脚本](../scripts/illustrate-activities.py)

## 共建与署名依据

2026-11-20 核读的飞书指南为修订 1098。征题同时覆盖有挑战的科学流程和突破类科研问题。流程按 L1 申报，突破按目标选择 L2 或 L3，也可以选择暂不确定。端砚表单的合作来源选学术合作。中英文共建页将这些选项与科学目标放在一起讲清楚。[AFE 共建指南](https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f) · [端砚 ReX](https://discovery-home.intern-ai.org.cn/home/event/rex/index.html)

任务包说明按当前指南的 Harbor 0.25.0 和模板 1.0.1 整理。用一个海岸预报教学例串联五组文件，把对应注解贴在题面片段旁。网站只将提交引向端砚，端砚接收每题一个含 `task_package/` 的 ZIP。共建页档案夹上的 Harbor 链接打开官方格式说明。[Harbor 任务结构](https://docs.harborframework.com/tasks/overview)

同一指南规定成功入库三道题可获得论文共同作者资格。AC 招募至少五位参与者，同时参与科学领域和流程分类及阶段评审。参与者与 AC 各自的贡献、共同供题与计数问题在独立署名页说明。[署名依据](https://aicarrier.feishu.cn/wiki/L7dCwf0R0iGaWfkPCpWca5nCn9f)

## 贡献者与委员肖像

飞书 Committee 表记录三组成员的顺序、机构和领导组的星号。读者可向标星的成员咨询项目的科学问题。成员可兼任多个角色，展示其在相应角色下登记的机构。中英文名录使用表内同一英文姓名或拼音，机构随页面语言显示。名录按角色分组的排版参考 Terminal-Bench-Science。[站内名录数据](../src/data/contributors.mjs) · [排版参考](https://www.terminal-bench-science.ai/contributors)

首页和署名页的横幅直接读取同一份 Area Committee 名单。照片从本地资源加载，已有主页的委员可点击，缺照片时显示本人姓名的首字母。未登记的机构留空。宋纯锋的肖像来自本人主页，刘绵莘的肖像来自南京信息工程大学的讲者名录。[宋纯锋](https://cf-song.github.io/) · [刘绵莘讲者资料](https://imic.nuist.edu.cn/MICS/MICS2023/tyjz.htm) · [刘绵莘学术主页](https://openreview.net/profile?id=~Mianxin_Liu1)

曹清龙和余家骏的肖像由项目团队提供。周宇浩的肖像取自四川大学研究中心，中心名录里登记的 Google Scholar 主页与项目团队提供的链接一致。[曹清龙个人主页](https://qinglongcao.xyz/) · [四川大学研究中心成员名录](https://center.dicalab.cn/1020/) · [周宇浩 Google Scholar](https://scholar.google.com/citations?user=bGKF2tUAAAAJ&hl=en)

以下为早期项目积累的肖像来源。当前委员身份按 Committee 表更新。[旧站顾问委员会](https://prismax-team.github.io/AgentFrontierExam-Tasks/en/#academic-committee) · [ReX 项目名册](https://github.com/PrismaX-Team/Rex-Analysis/blob/main/content/committee.json)

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
| Authorship 与委员会资料 | 复用经核实的角色、公开名单和个人主页，按中英两版编排署名说明与参与入口。 |
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
