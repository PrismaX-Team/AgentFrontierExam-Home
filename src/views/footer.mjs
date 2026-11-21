const citation = `@misc{agentfrontierexam2026,
  author = {{Agent Frontier Exam Team}},
  title = {{Agent Frontier Exam}},
  year = {2026},
  howpublished = {Benchmark website},
  url = {https://prismax-team.github.io/AgentFrontierExam-Home/}
}`;

export function footer() {
  return `<footer class="site-footer"><div class="site-frame footer-inner">
    <div class="footer-partners">
      <a href="https://www.shlab.org.cn/"><img class="partner-lab" src="/assets/partners/shanghai-ai-lab.webp" width="460" height="50" alt="Shanghai Artificial Intelligence Laboratory"></a>
      <a href="https://discovery-home.intern-ai.org.cn/home/"><img class="partner-duanyan" src="/assets/partners/duanyan.svg" width="115" height="32" alt="Duanyan · 书生端砚"></a>
    </div>
    <div class="footer-resources">
      <a href="https://github.com/PrismaX-Team/AgentFrontierExam-Home">GitHub</a>
      <a href="https://huggingface.co/">Hugging Face</a>
      <span class="footer-citation"><a data-citation href="data:application/x-bibtex;charset=utf-8,${encodeURIComponent(citation)}" download="agent-frontier-exam.bib">Citation (.bib)</a><span class="visually-hidden" role="status" data-citation-status></span></span>
      <a class="footer-contact" href="mailto:interndiscovery@pjlab.org.cn" aria-label="Contact us at interndiscovery@pjlab.org.cn">interndiscovery@pjlab.org.cn</a>
    </div>
  </div></footer>`;
}
