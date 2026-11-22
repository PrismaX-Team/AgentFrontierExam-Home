// The photograph and schematics provide visual context for the selected briefs.
export const plates = {
  'm13-surface-brightness': {
    file:'m13.jpg', alt:'Packed blue and amber stars in the globular cluster Messier 13.',
    caption:'Hubble view of Messier 13. NASA, ESA and the Hubble Heritage Team (STScI/AURA).',
    href:'https://science.nasa.gov/asset/hubble/hubble-acswfpc2-image-of-globular-cluster-m13/',
  },
  'brain-connectivity-modules': {
    file:'connectivity.webp', alt:'A schematic block matrix with a branching dendrogram above it.',
    caption:'Schematic co-assignment matrix and its hierarchical clustering.',
  },
  'crystal-stability': {
    file:'lattice.webp', alt:'Two species of atoms arranged on a repeating three-dimensional lattice.',
    caption:'Illustration of a crystal lattice with two atomic sites.',
  },
  'review-efficient-fine-tuning': {
    file:'fine-tuning-methods.webp', alt:'Three diagrams compare learned prompt embeddings, a bottleneck adapter and a low-rank weight update.',
    caption:'Schematic comparison of learned prompt embeddings, bottleneck adapters and low-rank weight updates in language models.',
  },
  'western-cape-river-corridor': {
    file:'river-corridor.webp', alt:'Branches of a river network meet inside a continuous band of land.',
    caption:'Schematic river network with equal-width buffers merged at confluences.',
  },
  'cosmic-ray-propagation': {
    file:'cosmic-ray-models.webp', alt:'Two power-law lines cross a set of schematic boron-to-carbon ratios with uncertainty bars.',
    caption:'Illustration of two power-law predictions for the boron-to-carbon ratio as rigidity increases. Markers and uncertainties are schematic.',
  },
  'ecological-recovery-shortfall': {
    file:'ecological-recovery.webp', alt:'Two recovery paths connect the same observations. The shaded area measures shortfall below a reference condition.',
    caption:'Illustrative recovery trajectories through two observations. The shaded area shows the cumulative shortfall for the solid trajectory.',
  },
};

const chineseCaptions = {
  'm13-surface-brightness': ['M13 球状星团中密集的蓝色和琥珀色恒星。', '哈勃望远镜拍摄的 M13。图源为 NASA、ESA 和哈勃遗产团队（STScI/AURA）。'],
  'brain-connectivity-modules': ['分块矩阵上方的树状图表示脑区之间的聚类关系。', '脑区共分配矩阵及其层次聚类示意图。'],
  'crystal-stability': ['两种原子在三维晶格中周期性排列。', '包含两类原子位点的晶格示意图。'],
  'review-efficient-fine-tuning': ['三幅图对比可学习的提示嵌入、瓶颈适配器和低秩权重更新。', '语言模型中三种参数高效微调方法的示意图。'],
  'western-cape-river-corridor': ['不同河流支流汇入一条连续的河岸缓冲带。', '等宽缓冲区在河流交汇处合并的示意图。'],
  'cosmic-ray-propagation': ['两条幂律曲线穿过标有不确定度的硼碳比示意数据点。', '两种幂律模型给出的硼碳比随刚度变化的预测。图中数据点和误差棒用于示意。'],
  'ecological-recovery-shortfall': ['两条恢复轨迹连接同一组观测点，阴影表示相对参照状态的缺口。', '连接两次观测的生态恢复轨迹。阴影表示实线轨迹相对参照状态的累积缺口。'],
};

export function plateFor(id, lang = 'en') {
  const art = plates[id];
  if (!art || lang !== 'zh') return art;
  const [alt, caption] = chineseCaptions[id];
  return {...art, alt, caption};
}
