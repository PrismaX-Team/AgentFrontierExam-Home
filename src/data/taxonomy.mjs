const labels = new Map([
  ['Life sciences', '生命科学'],
  ['Chemistry', '化学'],
  ['Materials science', '材料科学'],
  ['Physics', '物理学'],
  ['Astronomy', '天文学'],
  ['Earth science', '地球科学'],
  ['Energy', '能源'],
  ['Information science', '信息科学'],
  ['Neuroscience', '神经科学'],
  ['Medicine', '医学'],
  ['Mathematics', '数学'],
  ['Literature review and synthesis', '文献调研与综述'],
  ['Quantitative evidence synthesis', '跨研究定量综合'],
  ['Data preparation and visualization', '数据制备与可视化'],
  ['Data quality assessment', '数据质量核查'],
  ['Measurement and statistical analysis', '数据测量与统计分析'],
  ['Parameter inference and calibration', '参数反演与校准'],
  ['Modelling and simulation', '建模计算与仿真'],
  ['Mechanisms and hypothesis testing', '机理分析与假设检验'],
  ['Property and outcome prediction', '性质与结局预测'],
  ['Binding pose prediction', '结合构象预测'],
  ['Candidate screening and ranking', '候选筛选与排序'],
  ['Scientific design and optimization', '科学对象设计与优化'],
  ['Experimental and study design', '实验与方案设计'],
  ['Method development and evaluation', '方法开发与评估'],
  ['Active search and decision strategies', '主动搜索与决策策略'],
  ['Figure and analysis reproduction', '论文图表与分析复现'],
]);

// Preserve shared filter URLs and the shorter labels on the homepage pyramid.
export const activityAliases = {
  'Literature review': 'Literature review and synthesis',
  'Evidence synthesis': 'Quantitative evidence synthesis',
  'Data preparation': 'Data preparation and visualization',
  'Data quality': 'Data quality assessment',
  'Data analysis': 'Measurement and statistical analysis',
  'Parameter inference': 'Parameter inference and calibration',
  'Simulation': 'Modelling and simulation',
  'Hypothesis testing': 'Mechanisms and hypothesis testing',
  'Property prediction': 'Property and outcome prediction',
  'Experimental design': 'Experimental and study design',
  'Model validation': 'Method development and evaluation',
  'Decision strategy': 'Active search and decision strategies',
  'Figure reproduction': 'Figure and analysis reproduction',
};

export function canonicalAxis(value) {
  return Object.hasOwn(activityAliases, value) ? activityAliases[value] : value;
}

export function axisLabel(value, lang = 'en') {
  const canonical = canonicalAxis(value);
  return lang === 'zh' ? labels.get(canonical) ?? canonical : canonical;
}
