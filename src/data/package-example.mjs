export function packageFiles(lang) {
  const t = (en, zh) => lang === 'zh' ? zh : en;
  return [
    {
      id: 'instructions',
      name: 'instruction.md',
      purpose: t('The question, the evidence available to the agent and the point at which the work is complete.', '写清科学问题、智能体可用的证据，以及什么结果算完成任务。'),
      fields: [
        {
          label: t('Scientific question', '科学问题'),
          prose: t('Forecast hourly storm surge at 24 North Sea tide gauges over the next 72 hours. Use the station records and weather forecasts available at issue time. Improve on the reference forecast in both the northern and southern regions.', '预测未来 72 小时内北海 24 个验潮站逐小时的风暴增水。只使用预报发布时已有的站点记录和天气预报。北部和南部海域的预报误差都要低于参考预报。'),
          heading: t('Make the scientific decision visible', '说明由智能体作出什么科学判断'),
          note: t('The agent chooses a forecasting approach. State the observation window, comparison and geographic scope. For a breakthrough task, add the open question, the closest prior result and the claim that new evidence could establish.', '本题把预报方法交给智能体选择，同时规定观测时段、比较基准和地理范围。突破题还需说明开放问题、最相关的已有成果，以及新的证据可以支持什么结论。')
        },
        {
          label: t('Final deliverable', '最终交付物'),
          code: '/work/output/forecast.csv\n\nstation_id,window_id,lead_hour,surge_cm\nN01,W001,1,12.5\nN01,W001,2,13.1',
          heading: t('Specify an artifact another program can read', '给出可供程序读取的产物格式'),
          note: t('Require one finite prediction in centimetres for every station, forecast window and lead hour from 1 to 72. Explain how missing or duplicate rows are handled. Use the same path and field names in the verifier.', '要求每个站点、每个预报窗口以及第 1 至 72 个预报时效均有一个有限预测值，单位为厘米。说明缺行和重复行如何处理。验证程序中的路径、字段名必须与题面一致。')
        },
        {
          label: t('Acceptance criteria', '验收标准'),
          prose: t('Calculate root mean square error separately for the two regions. The forecast earns 50 points for each region in which its error is strictly below the reference error. Both improvements are required for 100.', '分别计算两个海域的均方根误差。每个海域的误差严格低于参考预报可得 50 分。两个海域都取得改进可得 100 分。'),
          heading: t('Define a complete result before the run', '在运行前定义完整的成功条件'),
          note: t('A pooled average could hide a failure at one coast. This rule makes improvement in each region independently necessary. Define the equivalent comparisons, constraints or expert checks for your question.', '汇总平均值可能掩盖某个海域的偏差。分别评分，才能保证两个海域各自有所改进。为你的任务写出相应的比较方式、约束或专家审核标准。')
        }
      ]
    },
    {
      id: 'configuration',
      name: 'task.toml',
      purpose: t('Task identity, authorship, artifact collection and the resources for solving and scoring.', '记录任务身份、作者、交付物路径以及求解和评分所需资源。'),
      fields: [
        {
          label: t('Identity and artifacts', '任务身份与交付物'),
          code: 'schema_version = "1.4"\nartifacts = ["/work/output"]\n\n[task]\nname = "afe/north-sea-storm-surge"\nversion = "0.1.0"\ndescription = "North Sea storm-surge forecasts"\nauthors = [{ name = "Example coastal research team" }]',
          heading: t('Keep authors and outputs attached to a version', '将作者和产物记录在相应版本中'),
          note: t('Give the task an English short name under afe/, record its contributors and update its version when the package changes. Harbor restores collected artifacts at their declared absolute paths in the independent scoring environment.', '在 afe/ 命名空间下取一个英文短名，记录贡献者，并在任务包变更时更新版本。Harbor 会在独立评分环境中按声明的绝对路径还原收集到的产物。')
        },
        {
          label: t('Scientific metadata', '科学任务元数据'),
          code: '[metadata.afe]\nprotocol_version = "1.0"\nlevel = "L1"\ndomains = ["地球"]\nsupports_over_target = false\n\n[metadata.afe.score_mapping]\nurl = "tests/score.py"\ndescription = "50 points for each region improved."',
          heading: t('Connect the level and score to the objective', '让层级与评分直接对应科学目标'),
          note: t('This bounded forecasting exercise is an L1 workflow in Earth science. Use the domain names specified by the template. Point the score mapping at the implementation of the scientific criteria.', '这个目标明确的预报任务属于地球科学领域的 L1 科研流程题。领域名称以模板为准，评分映射应指向实现验收标准的代码。')
        },
        {
          label: t('Runtime settings', '运行设置'),
          code: '[agent]\ntimeout_sec = 3600\n\n[environment]\nworkdir = "/work"\ncpus = 2\nmemory_mb = 4096\nnetwork_mode = "no-network"\n\n[verifier]\nenvironment_mode = "separate"\ntimeout_sec = 300',
          heading: t('Budget the agent and verifier independently', '分别估算求解与评分资源'),
          note: t('These are excerpts from the configuration. Fill in storage, build limits and verifier resources in the template. Document the software, computing time, data access and any query or observation budget the scientific work requires.', '这里仅节选部分配置。请在模板中补充存储、构建限制和验证程序所需资源，并说明所需软件、计算时间、数据访问方式以及查询或观测次数上限。')
        }
      ]
    },
    {
      id: 'environment',
      name: 'environment/',
      purpose: t('The image, data and tools the agent can use.', '提供智能体可以使用的镜像、数据和工具。'),
      fields: [
        {
          label: t('Dockerfile and inputs', 'Dockerfile 与输入数据'),
          code: 'FROM python:3.11.11-slim-bookworm\nWORKDIR /work\nCOPY input/ /work/input/\nRUN mkdir -p /work/output',
          heading: t('Make the documented inputs available', '将题面提到的输入放入环境'),
          note: t('For this example, input/ holds station IDs and regions, earlier tide-gauge readings, weather forecasts and issue times. Document units and data sources. Copy tools into the image when the task calls for specialist software.', '本例在 input/ 中提供站点编号与分区、历史潮位、天气预报及预报发布时间。标明单位和数据来源。如需专业软件，请在镜像内准备好所需工具。')
        },
        {
          label: t('Evidence boundary', '数据使用范围'),
          prose: t('The agent can use observations up to each forecast issue time. Later water levels and the scored reference forecast are available to the verifier.', '智能体可以使用截至各次预报发布时已有的观测。此后的实测水位与评分所用的参考预报由验证程序使用。'),
          heading: t('Separate solving evidence from scoring evidence', '划清求解与评分各自可用的数据'),
          note: t('For a forecasting task, a temporal cutoff preserves the research question. Specify equivalent boundaries for other tasks. For data with access restrictions, provide the retrieval conditions and the permissions needed to reproduce the evaluation.', '预报任务用时间界限确定智能体在当时能够知道什么。其他任务也应明确相应的数据界限。若数据的获取受限，请说明复现评测所需的条件和授权。')
        }
      ]
    },
    {
      id: 'verification',
      name: 'tests/',
      purpose: t('An independent verifier checks the submitted artifact against the scientific conditions.', '用独立验证程序检查交付物是否满足科学验收条件。'),
      fields: [
        {
          label: 'test.sh',
          code: '#!/bin/sh\nset -eu\nmkdir -p /logs/verifier\npython3 /tests/score.py',
          heading: t('Use a single scoring entry point', '设置统一的评分入口'),
          note: t('Harbor runs tests/test.sh. Build the independent scoring image with tests/Dockerfile. Here score.py reads /work/output/forecast.csv, checks the station, window and lead-hour keys, and compares predictions with held-out observations in each region.', 'Harbor 运行 tests/test.sh，并用 tests/Dockerfile 构建独立的评分镜像。示例中的 score.py 读取 /work/output/forecast.csv，检查站点、窗口和预报时效，再分别与各海域留出的观测值比较。')
        },
        {
          label: '/logs/verifier/afe_result.json',
          code: '{\n  "status": "evaluated",\n  "score": 50,\n  "raw": {"regions_improved": 1, "regions_total": 2}\n}',
          heading: t('Preserve the scientific result', '保留原始科学结果'),
          note: t('A score of 50 records improvement in one region. Keep the original scientific metrics in raw when available. An evaluated score is finite and ranges from 0 to 100, with 100 reserved for meeting every necessary condition.', '本例中 50 分表示一个海域的预报得到改进。如有原始科学指标，请保存在 raw 字段。评测完成后应给出 0 至 100 之间的有限分数，所有必要条件均满足时才得 100 分。')
        },
        {
          label: '/logs/verifier/reward.json',
          code: '{"reward": 0}',
          heading: t('Record full goal attainment', '记录是否完整达成目标'),
          note: t('For the example above, the partial scientific score gives a binary reward of 0. An evaluated score of 100 gives 1. Invalid submissions receive a zero score and reward with an error. A verifier failure or pending human review has a null score and no final reward file.', '本例获得部分科学分数，二元奖励为 0。评测得分达到 100 时奖励为 1。无效提交记录错误，分数与奖励均为 0。验证程序失败或需要人工复核时，分数为 null，不生成最终奖励文件。')
        }
      ]
    },
    {
      id: 'reference',
      name: 'solution/',
      purpose: t('Optional reference methods and their provenance.', '可选，说明参考方法及其出处。'),
      fields: [
        {
          label: 'gtsm/info.json',
          code: '{\n  "name": "Global Tide and Surge Model v3.0",\n  "proposed_at": "2020",\n  "description": "Hydrodynamic tide and surge model.",\n  "source_urls": ["https://doi.org/10.3389/fmars.2020.00263"]\n}',
          heading: t('Give a reference method its own record', '为每种参考方法保留独立记录'),
          note: t('Record the method, date, principle and source. Add its score only after measuring it under the conditions of this task. Store observations or baselines needed by the verifier in its own environment.', '记录方法名称、提出时间、原理和出处。使用本任务的条件实际测量后再填写该方法得分。验证程序依赖的观测或基准数据应放在独立的评分环境中。'),
          source: { label: 'Muis et al., 2020', url: 'https://doi.org/10.3389/fmars.2020.00263' }
        },
        {
          label: t('Register a method in task.toml', '在 task.toml 中登记参考方法'),
          code: '[metadata.afe]\nreference_urls = ["solution/gtsm/info.json"]',
          heading: t('Identify the record the package uses', '指定本任务引用的参考记录'),
          note: t('Add reference_urls to the existing metadata.afe table when supplying a reference method. You can submit an open research question with its scientific objectives, materials and evaluation criteria while a reference solution is still unknown.', '如提供参考方法，请在现有 metadata.afe 表中加入 reference_urls。对于尚无参考解的开放科学问题，也可以提交科学目标、所需材料和验收标准。')
        }
      ]
    }
  ];
}

export function packageTree(lang) {
  const optional = lang === 'zh' ? '（可选）' : '(optional)';
  return `north-sea-storm-surge.zip
├── task_package/
│   ├── instruction.md
│   ├── task.toml
│   ├── environment/
│   │   ├── Dockerfile
│   │   └── input/
│   ├── tests/
│   │   ├── Dockerfile
│   │   ├── test.sh
│   │   └── score.py
│   └── solution/              ${optional}
│       └── gtsm/info.json
└── 补充材料/                    ${optional}`;
}
