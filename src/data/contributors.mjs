const lab = {en: 'Shanghai Artificial Intelligence Laboratory', zh: '上海人工智能实验室'};
const nanjing = {en: 'Nanjing University', zh: '南京大学'};
const junchengXiao = {
  name: 'Juncheng Xiao',
  affiliations: [
    {en: 'Institute of Physics, Chinese Academy of Sciences', zh: '中国科学院物理研究所'},
    lab,
  ],
};
const shengyuanXu = {
  name: 'Shengyuan Xu',
  affiliations: [{en: 'Shanghai Jiao Tong University', zh: '上海交通大学'}, lab],
};
const kunLi = {name: 'Kun Li', nameZh: '李坤', affiliations: [lab]};
const qinglongCao = {
  name: 'Qinglong Cao', nameZh: '曹清龙', affiliations: [lab],
  portrait: 'qinglong-cao.webp', profile: 'https://qinglongcao.xyz/',
};

// Each group follows its own order and affiliation credits in the Committee sheet.
const leadership = [
  {name: 'Shuo Li', affiliations: [{en: 'Fudan University', zh: '复旦大学'}, lab]},
  junchengXiao,
  shengyuanXu,
  {name: 'Yixin Chen', affiliations: [lab]},
  {...kunLi, handlesCorrespondence: true},
  {name: 'Bo Zhang', affiliations: [lab], handlesCorrespondence: true},
  {name: 'Wenlong Zhang', affiliations: [lab], handlesCorrespondence: true},
];

export const areaCommittee = [
  {
    name: 'Tianfan Fu', nameZh: '符天凡', affiliations: [nanjing],
    field: {en: 'Chemistry and materials', zh: '化学与材料'}, portrait: 'tianfan-fu.webp',
    profile: 'https://scholar.google.com.hk/citations?user=KPQ49w4AAAAJ&hl=zh-CN&oi=ao',
  },
  {
    name: 'Ming Hu', nameZh: '胡铭', affiliations: [{en: 'Monash University', zh: '莫纳什大学'}, lab],
    field: {en: 'Medicine', zh: '医学'}, portrait: 'ming-hu.webp',
    profile: 'https://uni-medical.github.io/gmai-web/zh/team/ming-hu/',
  },
  {
    name: 'Mianxin Liu', nameZh: '刘绵莘', affiliations: [lab],
    field: {en: 'Medical imaging', zh: '医学影像'}, portrait: 'mianxin-liu.webp',
    profile: 'https://openreview.net/profile?id=~Mianxin_Liu1',
  },
  {
    name: 'Zhen Zhao', nameZh: '赵振', affiliations: [lab],
    field: {en: 'Scientific agents', zh: '科学智能体'}, portrait: 'zhen-zhao.webp',
    profile: 'https://scholar.google.com/citations?user=7mpuhO8AAAAJ&hl=en',
  },
  {
    name: 'Fenghua Ling', nameZh: '零丰华', affiliations: [lab],
    field: {en: 'Earth science', zh: '地球科学'}, portrait: 'fenghua-ling.webp',
    profile: 'https://scholar.google.com/citations?user=uRQFvZYAAAAJ&hl=zh-CN',
  },
  {
    name: 'Shufei Zhang', nameZh: '张舒飞', affiliations: [lab],
    field: {en: 'Physics', zh: '物理学'},
    profile: 'https://openreview.net/profile?id=~Shufei_Zhang1',
  },
  {
    name: 'Chunfeng Song', nameZh: '宋纯锋', affiliations: [lab],
    field: {en: 'Neuroscience', zh: '神经科学'}, portrait: 'chunfeng-song.webp',
    profile: 'https://cf-song.github.io/',
  },
  qinglongCao,
  kunLi,
  {
    name: 'Yuhao Zhou', nameZh: '周宇浩',
    affiliations: [{en: 'Sichuan University', zh: '四川大学'}, lab],
    portrait: 'yuhao-zhou.webp', profile: 'https://scholar.google.com/citations?user=bGKF2tUAAAAJ&hl=en',
  },
  {
    name: 'Jiajun Yu', nameZh: '余家骏',
    affiliations: [
      {en: 'Zhejiang University', zh: '浙江大学'},
      {en: 'Shanghai Innovation Institute', zh: '上海创智学院'},
    ],
    portrait: 'jiajun-yu.webp',
  },
];

const taskContributors = [
  {name: 'Laiao Lu', affiliations: [nanjing]},
  {name: 'Sixue Xing', affiliations: [{en: 'University of Notre Dame', zh: '圣母大学'}]},
  {name: 'Zhuofan Xu', affiliations: [nanjing]},
  {name: 'Ling Yue', affiliations: [{en: 'Rensselaer Polytechnic Institute', zh: '伦斯勒理工学院'}]},
  {name: 'Haoyu Zhou', affiliations: [nanjing]},
  {name: 'Wenjie Yu', affiliations: [nanjing]},
  {name: 'Haowen Xu', affiliations: [nanjing]},
  junchengXiao,
  kunLi,
  {...shengyuanXu, affiliations: [lab]},
  qinglongCao,
  {name: 'Ruizhe Chen', affiliations: [lab]},
];

export const contributorGroups = [
  {id: 'project-leadership', title: {en: 'Project Leadership', zh: '项目领导团队'}, members: leadership},
  {id: 'area-committee', title: {en: 'Area Committee', zh: '领域委员会'}, members: areaCommittee},
  {id: 'task-contributors', title: {en: 'Task Contributors', zh: '任务贡献者'}, members: taskContributors},
];
