// Inline code and field labels here are authored text from the task package guide.
export function contributionCopy(lang = 'en') {
  const t = (en, zh) => lang === 'zh' ? zh : en;
  return {
    title: t('Contribute a scientific task', '共建科学任务'),
    intro: t('Set a scientific goal for an agent. Give it the starting materials and say what evidence would convince a colleague that it succeeded.', '为智能体提出一个科学目标，提供开展研究所需的材料，并说明什么证据足以让同行相信它完成了任务。'),
    prepare: t('Prepare a submission', '准备提交'),
    guide: t('Task package guide', '任务包指南'),
    authorship: t('Authorship', '署名规则'),
    levels: t('Scientific levels', '科学任务层级'),
    package: t('One task package', '一题一包'),
    platform: t('Duanyan ReX', '端砚 ReX'),
    goalsTitle: t('What would count as success?', '什么结果算完成任务？'),
    evidenceLabel: t('Evidence to include', '验收依据'),
    goals: [
      {
        level: 1,
        goal: t('Choose a measurement, analysis or experiment that calls for scientific judgment. Describe the observations, tools and limits the agent will work with.', '选取一项需要专业判断的测量、分析或实验。说明智能体能获得哪些观测、能使用哪些工具，以及有哪些限制。'),
        evidence: t('Name the output and the reference measurement, tolerance or control that would make it usable.', '写明交付物，并给出相应的参照测量、误差容限或实验对照。'),
      },
      {
        level: 2,
        goal: t('Identify a question the closest published work leaves open. State the claim the agent could establish by resolving it.', '找出最相关的已发表研究仍未回答的问题，说明解答它能够确立什么科学结论。'),
        evidence: t('Describe the observation, comparison or proof that would settle the question and how a second team could check it.', '说明哪种观测、比较或证明能够回答问题，以及另一个团队可以怎样验证。'),
      },
      {
        level: 3,
        goal: t('Frame a question that could reveal a previously unknown phenomenon, mechanism or principle. Say what such a discovery could explain or predict.', '提出一个可能揭示未知现象、机制或原理的问题。说明这项发现一旦成立，能够解释或预测什么。'),
        evidence: t('Explain what would distinguish a first discovery from a known effect and how an independent group could test it.', '说明怎样的证据能将首次发现与已有现象区分开，以及独立团队可以怎样检验它。'),
      },
    ],
    submitTitle: t('Prepare your submission', '准备提交材料'),
    submitIntro: t('Submit one ZIP per task in English or Chinese. On Duanyan ReX, open <span lang="zh-Hans">提交科学问题</span> (Submit a scientific question).', '每道题单独打包为一个 ZIP，中文、英文均可。在端砚 ReX 选择「提交科学问题」即可提交。'),
    submit: t('Submit a task via Duanyan ReX', '前往端砚 ReX 提交'),
    template: t('Contributor guide and template (Chinese)', '共建文档与任务包模板'),
    details: [
      [
        t('Team and collaboration', '团队与合作信息'),
        t('Provide a contact for the submitting team. Under <span lang="zh-Hans">合作来源</span> (collaboration source), select <span lang="zh-Hans">学术合作</span> (academic collaboration).', '填写提交团队的联系人。在「合作来源」中选择「学术合作」。'),
      ],
      [
        t('Proposed level', '建议层级'),
        t('Use L1 for a scientific workflow, L2 for a verifiable breakthrough or L3 for a foundational discovery. If the level is unclear, choose <span lang="zh-Hans">暂不确定</span> (undecided). Describe the scientific target in your own words so reviewers can confirm the classification.', '科研流程选 L1，可验证的科学突破选 L2，奠基性发现选 L3。如果难以判断，可以选「暂不确定」，用自己的话写清科学目标，供审核时确认。'),
      ],
      [
        t('Package contents', '任务包内容'),
        t('Place <code>task_package/</code> at the archive root, alongside any supplementary materials. Identify the inputs, runtime, expected output and success conditions. If some materials are still in preparation, select the corresponding completeness option and say where you would like help.', '将 <code>task_package/</code> 放在 ZIP 根目录，补充材料放在同级。写清输入、运行环境、预期产物与验收条件。如果材料仍在准备，可在表单中选择对应的完整度，注明希望获得哪些协助。'),
      ],
      [
        t('Permissions and follow-up', '授权与后续沟通'),
        t('Record access conditions, attribution and redistribution terms. The form asks separately about task execution, use for model improvement and public release. Keep the submitted version so the team can refer to it when discussing review or revisions.', '注明数据获取条件、署名要求和再分发条款。在表单中分别填写是否允许执行评测、用于模型改进及公开发布。保留提交时的任务包版本，供后续讨论审核意见和修改时使用。'),
      ],
    ],
    participationTitle: t('Authorship and participation', '参与方式与论文署名'),
    participationIntro: t('Help shape the benchmark by contributing tasks from your field or coordinating scientific review.', '你可以从自己的领域中提出科学任务，也可以协调同行参与科学审核。'),
    creditLink: t('Read the authorship guide', '查看参与及署名规则'),
    participants: t('Participants', '共建参与者'),
    participantRole: t('Participants develop scientific tasks. Three tasks accepted into the benchmark qualify a participant for co-authorship of the AFE paper.', '参与者负责设计科学任务。本人贡献的三道题通过审核并被基准收录后，即具备 AFE 论文的共同作者资格。'),
    chairs: t('Area chairs', '领域主席'),
    chairRole: t('Area chairs recruit at least five participants, help define fields and workflows, and review tasks at project milestones.', '领域主席招募至少五位参与者，协助划分领域与科研流程，并在项目关键阶段审核题目。'),
  };
}

export function guideCopy(lang) {
  const t = (en, zh) => lang === 'zh' ? zh : en;
  return {
    title: t('Task package guide', '任务包指南'),
    intro: t('A task package gives an agent a scientific question, an environment to work in and a way to tell whether the result holds up. Follow a North Sea storm-surge forecasting example through the files of a Harbor package.', '一个任务包包括科学问题、智能体的工作环境和检验结果的方法。下面以北海风暴增水预报为例，逐个说明 Harbor 任务包中的文件及其作用。'),
    template: t('Contributor guide and template (Chinese)', '共建文档与任务包模板'),
    submit: t('Submission instructions', '提交说明'),
    files: t('Package files', '任务包文件'),
    layout: t('Archive layout', '压缩包结构'),
    before: t('Before uploading', '上传前核对'),
    layoutIntro: t('Start with <code>AFE_task_package_template_v1.0.1.zip</code>, attached at the end of the contributor guide. It targets Harbor 0.25.0 on Linux, with an independent verifier. The folder below shows the files used in the forecasting example.', '从共建文档末尾下载 <code>AFE_task_package_template_v1.0.1.zip</code>。模板面向 Linux 上的 Harbor 0.25.0，评分在独立的验证环境中运行。以下是预报示例的文件结构。'),
    treeLabel: t('Example ZIP contents', '示例 ZIP 的文件结构'),
    supplemental: t('Place the agent instructions, environment and verifier together under <code>task_package/</code>. An optional sibling folder, <code lang="zh-Hans">补充材料/</code>, can hold a background paper, explanatory figures or other supporting material.', '将题面、运行环境和验证程序都放在 <code>task_package/</code> 下。如有背景论文、说明图或其他参考资料，可在同级建立 <code>补充材料/</code> 目录。'),
    preflight: t('Read the instructions from the agent’s perspective. Does it receive the inputs the question promises? Can it write the requested artifact to the declared path? Does the verifier apply exactly the criteria in the instructions?', '从智能体的角度重读题面。它能否取得题目承诺的输入？能否把产物写到指定路径？验证程序执行的是否正是题面写明的标准？'),
    permissions: t('Keep the scoring code and its dependencies with the package. Describe any external data access, licensing or computing requirements. If an input or part of the verifier is still being prepared, identify it in the form’s material-completeness field.', '将评分代码和依赖随包提供，写明外部数据的获取方式、许可和算力要求。若部分输入或验证程序仍在准备，请在表单的材料完整度一栏注明。'),
    prepare: t('Prepare the ZIP for Duanyan ReX', '准备 ZIP 并前往端砚提交'),
  };
}

export function authorshipCopy(lang) {
  const t = (en, zh) => lang === 'zh' ? zh : en;
  return {
    breadcrumb: t('Authorship', '署名规则'),
    title: t('Authorship and participation', '参与方式与论文署名'),
    intro: t('Researchers contribute the questions that define Agent Frontier Exam. Participants turn scientific work into tasks. Area chairs bring colleagues together and help review what each task measures.', 'Agent Frontier Exam 的题目由研究者共同提出。参与者把真实科研工作写成可评测的任务，领域主席召集同行，审核每道题实际检验的科学能力。'),
    contribute: t('Contribute a task', '参与任务共建'),
    join: t('Become an area chair', '成为领域主席'),
    contents: t('On this page', '本页内容'),
    participants: t('Participant credit', '共建者的署名资格'),
    chairs: t('Area chair recruitment', '领域主席招募'),
    accepted: t('Task acceptance', '题目收录'),
    paper: t('The AFE paper', 'AFE 论文'),
    faq: t('Frequently asked questions', '常见问题'),
    committee: t('Advisory Committee', '顾问委员会'),
    threshold: t('A participant becomes a co-author of the AFE paper when three of their tasks have passed review and entered the benchmark.', '本人贡献的三道题通过审核并被基准收录后，即可成为 AFE 论文的共同作者。'),
    firstTask: t('You can start with one question. For a scientific workflow, identify a decision that requires expertise and the evidence that would distinguish good work. For a breakthrough question, identify the gap in current research and the conditions under which another researcher could verify an advance.', '你可以从一道题开始。科研流程题应明确哪一步需要专业判断，以及哪些证据可用于评价结果。突破题应指出已有研究留下的空白，并说明同行可以在什么条件下验证新进展。'),
    record: t('Each task has its own author record. List the people who developed the task under <code>[task].authors</code> in <code>task.toml</code>. For a joint submission, confirm individual credit with the coordinating team.', '每道题都单独记录作者。请在 <code>task.toml</code> 的 <code>[task].authors</code> 中列出参与开发该题的人员。多人共同提交时，请与协调团队确认每位参与者的贡献记录。'),
    recordLink: t('See where to record task authors', '查看任务作者的填写位置'),
    chairIntro: t('Area chairs (ACs) connect the project with research communities they know well. The role has three responsibilities.', '领域主席（Area Chair，AC）联系自己熟悉的科研社群，承担以下三项职责。'),
    responsibilities: [
      [
        t('Recruit at least five participants', '招募至少五位参与者'),
        t('Invite colleagues who can turn work from their fields into scientific tasks. Researchers with different instruments, methods or kinds of evidence can broaden the set of questions a field contributes.', '邀请同行把各自领域的研究工作转化为科学任务。熟悉不同仪器、方法和证据的研究者，可以从多个角度丰富本领域的题目。'),
      ],
      [
        t('Help define fields and workflows', '协助划分学科领域和科研流程'),
        t('Work with the team on the classification of scientific domains and workflows. Draw on examples from your discipline to clarify where a task belongs and which research decision it tests.', '与项目团队共同梳理领域和科研流程，结合本学科实例说明每道题的归属，以及它检验的是哪一步科研判断。'),
      ],
      [
        t('Review tasks at project milestones', '参与阶段性科学审核'),
        t('Assess the scientific goal, the evidence available and whether the proposed evaluation supports the claim. Bring field-specific concerns to the authors while they can still revise the package.', '审核科学目标、可用证据，以及验收方式能否支持所得结论。及时向作者反馈本领域的专业意见，便于修改任务包。'),
      ],
    ],
    joinIntro: t('To discuss an area chair role, introduce your field and the kinds of tasks you can review in the contributor WeChat group. The coordinating team can confirm the scope of the role and how your contributions will be credited.', '有意担任领域主席的研究者，可以在共建者微信群介绍自己的学科背景和能够审核的题型。协调团队会与你确认职责范围和贡献记录方式。'),
    joinLink: t('Find the contributor WeChat group', '查看共建者微信群'),
    counts: t('When a task counts', '何时计入已收录任务'),
    review: t('After submission, reviewers consider the scientific value of the question, the level, the resources and the evidence required for evaluation. They may ask the authors for a revised verifier, further observations or a more precise success condition.', '提交之后，审核者会评估问题的科学价值、任务层级、所需资源与验收依据。审核意见可能包括调整验证程序、补充观测数据或进一步明确成功条件。'),
    example: t('If two tasks have been accepted and a third is awaiting validation data, the participant has two accepted tasks. Once the team confirms inclusion of the third, the participant meets the co-authorship requirement.', '例如，某位参与者的两道题已收录，第三道仍在等待验证数据，此时已收录数量为两道。团队确认收录第三道后，该参与者即达到共同作者门槛。'),
    changes: t('When discussing a revision or checking an acceptance record, give the task name, version, submitting team and a short account of what changed.', '沟通修改或核对收录记录时，请提供题名、版本、提交团队，以及修改内容的简要说明。'),
    paperIntro: t('Engineers at Shanghai AI Laboratory and on the AFE team maintain and update the benchmark. The team plans to submit a paper describing the work to a leading AI conference or to <em>Nature</em>.', '上海人工智能实验室及 AFE 团队的工程师共同维护和更新基准。团队计划将介绍这一工作的论文投稿至人工智能领域的主要会议或《自然》（<em>Nature</em>）。'),
    order: t('The contributor guide records the participant co-authorship threshold and the duties of an area chair. Discuss author order, shared task credit and credit for chairing directly with the coordinating team.', '共建文档说明了参与者取得共同作者资格的门槛和领域主席的职责。关于作者排序、共同出题和领域主席工作的贡献认定，请直接与协调团队沟通。'),
    guide: t('Read the contributor guide (Chinese)', '阅读共建文档'),
    questions: [
      {
        question: t('Can I contribute one task at a time?', '可以一次只提交一道题吗？'),
        answer: t('Yes. Submit one ZIP per task. Your participation record accumulates as individual tasks are accepted.', '可以。每道题单独提交一个 ZIP。各题被收录后，逐道计入你的贡献记录。'),
        link: { href: '/contribute/#submit', label: t('Read the submission instructions', '查看提交说明') },
      },
      {
        question: t('What if I have the science but need help building the package?', '我有科学问题，但需要协助制作任务包，如何参与？'),
        answer: t('On Duanyan, select <span lang="zh-Hans">部分材料待补充</span> (materials to follow) or <span lang="zh-Hans">需协助构建任务</span> (help needed to build the task). Describe what already exists and what you still need. For example, specify how to access the observations if the remaining work is to build the scoring environment.', '在端砚选择「部分材料待补充」或「需协助构建任务」，说明已有的材料以及需要哪些支持。例如，如果还需搭建评分环境，请先写明观测数据的获取方式。'),
      },
      {
        question: t('Can my team contribute data licensed only for evaluation?', '仅获准用于评测的数据能用于共建吗？'),
        answer: t('Document the source, access conditions and attribution. Declare permission for execution, use in model improvement and public release separately on the submission form. The project checks the applicable permissions before making material public.', '请记录数据来源、获取条件和署名要求，并在提交表单中分别说明是否允许执行评测、用于模型改进和公开发布。项目会在公开材料之前核对相应授权。'),
      },
      {
        question: t('Can a negative scientific finding satisfy a task?', '否定性的科学发现也能算完成任务吗？'),
        answer: t('Yes, if testing the hypothesis or establishing a limitation is the objective. Set the coverage, controls and quality checks in advance so another researcher can judge whether the evidence supports the finding.', '可以。若科学目标是检验假设或确定某一方法的局限，可预先约定研究范围、对照和质量标准，让其他研究者据此判断证据是否支持结论。'),
      },
      {
        question: t('Who can confirm credit for a shared task?', '多人共同出题，由谁确认个人贡献？'),
        answer: t('Contact the coordinating team with the task name, version and the contributions of each person listed in the package. The team can confirm how the accepted task is recorded for each participant.', '请向协调团队提供题名、版本以及包内所列每位作者的贡献。团队会协助确认该任务获收录后如何计入各参与者的记录。'),
        communityLink: t('Contact the contributor community', '联系共建者社群'),
      },
    ],
  };
}
