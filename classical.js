// Classical redesign — scroll reveal + Japanese/English switch. No dependencies.
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var header = document.querySelector('.site-header');
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.site-nav a'), function (link) {
      link.addEventListener('click', function () {
        document.querySelector('.site-header').classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('classical-theme'); } catch (error) {}
  if (!savedTheme) savedTheme = 'light';
  if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('classical-theme', dark ? 'light' : 'dark'); } catch (error) {}
    });
  }

  if (!reduced) {
    var heroPlate = document.querySelector('.hero-figure .plate');
    if (heroPlate) {
      window.addEventListener('scroll', function () {
        heroPlate.style.transform = 'translateY(' + Math.min(window.scrollY * 0.06, 48) + 'px)';
      }, { passive: true });
    }
    var stroll = document.querySelector('.stroll-wrap');
    if (stroll) stroll.addEventListener('animationiteration', function () { stroll.classList.toggle('flip'); });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.photo-detail-figure img, .analysis-figure > img'), function (image) {
    image.addEventListener('click', function () {
      var backdrop = document.createElement('div');
      backdrop.className = 'lightbox-backdrop';
      var figure = document.createElement('figure');
      var largeImage = document.createElement('img');
      largeImage.src = image.src;
      largeImage.alt = image.alt || '';
      figure.appendChild(largeImage);
      var sourceFigure = image.closest('figure');
      var sourceCaption = sourceFigure && sourceFigure.querySelector('figcaption');
      if (sourceCaption) {
        var caption = document.createElement('p');
        caption.className = 'lightbox-caption';
        caption.textContent = sourceCaption.textContent;
        figure.appendChild(caption);
      }
      backdrop.appendChild(figure);
      function closeLightbox() {
        backdrop.remove();
        document.removeEventListener('keydown', onKeydown);
      }
      function onKeydown(event) { if (event.key === 'Escape') closeLightbox(); }
      backdrop.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', onKeydown);
      document.body.appendChild(backdrop);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.resource-reference-card'), function (card) {
    var link = card.querySelector('.resource-reference-link');
    var title = card.querySelector('.card-title');
    if (!link || !title) return;

    var resourceUrl;
    try { resourceUrl = new URL(link.href); } catch (error) { return; }
    var hostname = resourceUrl.hostname.replace(/^www\./, '');
    var iconSlug = hostname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var titleTextNode = title.firstChild;
    var fallbackText = titleTextNode && titleTextNode.textContent.trim().charAt(0).toUpperCase();

    var icon = document.createElement('span');
    icon.className = 'resource-site-icon';
    icon.setAttribute('aria-hidden', 'true');

    var fallback = document.createElement('span');
    fallback.className = 'resource-site-icon-fallback';
    fallback.textContent = fallbackText || hostname.charAt(0).toUpperCase();
    icon.appendChild(fallback);

    var iconlessHosts = {
      'ipss.go.jp': true,
      'roles.rcast.u-tokyo.ac.jp': true,
      'winet.nwec.go.jp': true
    };
    if (!iconlessHosts[hostname]) {
      var image = document.createElement('img');
      image.alt = '';
      image.width = 28;
      image.height = 28;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.addEventListener('load', function () { icon.classList.add('is-loaded'); });
      image.addEventListener('error', function () { image.remove(); });
      image.src = 'assets/resource-icons/' + iconSlug + '.png';
      icon.appendChild(image);
    }

    card.classList.add('has-site-icon');
    card.insertBefore(icon, title);
  });

  var translations = {
    '.brand > span:last-child': 'Akihiro Sakuramoto',
    '.site-nav a[href="#research"]': 'Research',
    '.site-nav a[href="#career"]': 'Career',
    '.site-nav a[href="#memberships"]': 'Memberships',
    '.site-nav a[href="#publications"]': 'Publications',
    '.site-nav a[href="#resources"]': 'Reading',
    '.site-nav a[href="#contact"]': 'Contact',
    '.hero-kicker': 'Human–Robot Interaction · JAIST',
    '.hero-actions a[href="#contact"]': 'Contact',
    '.hero-actions a[href="assets/cv.pdf"]': 'Curriculum Vitae',
    '.hero-actions a[href="blog.html"]': 'Blog',
    '.hero-actions a[href="animation-lab.html"]': 'Animation Lab',
    '.hero h1': 'Akihiro Sakuramoto',
    '.name-reading': '櫻本晃弘 / Sakuramoto Akihiro',
    '.affiliation': "Master's Student, AI Science Area, Japan Advanced Institute of Science and Technology (JAIST)",
    '.hero .summary': 'I study human-robot interaction, social signal processing, and multimodal interaction, with a focus on understanding the quality of human-robot relationships in real-world HRI.',
    '.update-note-label': 'Last updated',
    '.update-note-date': 'August 28, 2026',
    '.update-note-text': 'Expanded the interactive animation lab with seven new motion sketches.',
    '.hero-figure figcaption span:first-child': 'Portrait — Ishikawa, MMXXVI',
    '.hero-figure figcaption span:last-child': 'fig. 1',
    '#research h2': 'Research Overview',
    '#research .lede': 'I study real-world HRI through social signal processing and multimodal interaction. In particular, I aim to evaluate interaction quality quantitatively by estimating rapport—the quality of the relationship—in customer-service dialogue.',
    '#research .keyword-grid .card:nth-child(1) .card-title': 'Human–Robot Interaction',
    '#research .keyword-grid .card:nth-child(2) .card-title': 'Social Signal Processing',
    '#research .keyword-grid .card:nth-child(3) .card-title': 'Multimodal Interaction',
    '#research .keyword-grid .card:nth-child(4) .card-title': 'Rapport Estimation',
    '#career h2': 'Career',
    '#education .career-group-title': 'Education',
    '#education .timeline-item:nth-child(1) .timeline-year': 'Apr. 2025 – Present',
    '#education .timeline-item:nth-child(1) .timeline-title': 'Japan Advanced Institute of Science and Technology (JAIST), M.S. Student, AI Science Area',
    '#education .timeline-item:nth-child(2) .timeline-year': 'Apr. 2021 – Mar. 2025',
    '#education .timeline-item:nth-child(2) .timeline-title a': 'University of Toyama, B.E., Electrical and Electronic Engineering Course, Faculty of Engineering',
    '#research-activities .career-group-title': 'Research Activities',
    '#research-activities .timeline-item:nth-child(1) .timeline-year': 'Oct. 2025 – Present',
    '#research-activities .timeline-item:nth-child(1) .timeline-title': 'Joint research with CyberAgent AI Lab. Studying real-world HRI and interaction quality evaluation using in-store customer-service robot interaction data.',
    '#research-activities .timeline-item:nth-child(2) .timeline-year': 'Aug. 2025 – Jan. 2026',
    '#research-activities .timeline-item:nth-child(2) .timeline-title a': 'Preserving lessons from the Noto Peninsula Earthquake through digital twin technology',
    '#research-activities .timeline-item:nth-child(2) .timeline-detail': 'Conducted interviews in Ipponsugi Shopping Street, Nanao, organized local challenges and lessons from the earthquake, and examined ways to preserve and share those findings with digital twin technology in a final report.',
    '#experience .career-group-title': 'Experience',
    '#experience .timeline-item:nth-child(1) .timeline-year': 'Sep. 2025',
    '#experience .timeline-item:nth-child(1) .timeline-title a': 'Engineering Internship, Nissan Motor Co., Ltd.',
    '#experience .timeline-item:nth-child(1) .timeline-detail': 'Participated in a five-day vehicle performance internship focused on autonomous driving and advanced driver-assistance system testing (AD/ADAS).',
    '#experience .timeline-item:nth-child(2) .timeline-year': 'Aug. 2025 – Sep. 2025',
    '#experience .timeline-item:nth-child(2) .timeline-title a': '2025 Internship, FUJI Corporation',
    '#experience .timeline-item:nth-child(2) .timeline-detail': 'Worked for three weeks on AI-based image inspection for defects occurring inside solder paste printers, including data collection and algorithm development.',
    '#experience .timeline-item:nth-child(3) .timeline-year': 'Feb. 2024 – Mar. 2024',
    '#experience .timeline-item:nth-child(3) .timeline-title a': 'Internship, Robot Learning Laboratory, Nara Institute of Science and Technology (NAIST)',
    '#experience .timeline-item:nth-child(3) .timeline-detail': 'Worked on robot manipulation tasks using reinforcement learning for approximately four weeks.',
    '#experience .timeline-item:nth-child(4) .timeline-title a': 'NHK Student Robocon 2023 Finalist',
    '#experience .timeline-item:nth-child(4) .timeline-detail': 'Worked on robot control in the University of Toyama Robocon Project using ROS, C, and Python.',
    '#experience .timeline-item:nth-child(5) .timeline-year': 'Aug. 2019',
    '#experience .timeline-item:nth-child(5) .timeline-title a': 'Participant, 24th World Scout Jamboree (24WSJ)',
    '#experience .timeline-item:nth-child(5) .timeline-detail': 'Lived and collaborated with participants from many countries at the World Scout Jamboree in the United States.',
    '#memberships h2': 'Memberships',
    '#memberships .membership-name': 'Association for Computing Machinery (ACM)',
    '#memberships .membership-role': 'Student Member',
    '#memberships .membership-website': 'Official Website',
    '#publications h2': 'Publications',
    '#publications .publication-list > div:nth-child(1) .publication-group-title': 'International Conference',
    '#publications .publication-list > div:nth-child(1) .publication-title a': 'Multimodal Rapport Estimation in Real-World HRI',
    '#publications .publication-list > div:nth-child(1) .publication-meta': 'Sakuramoto A., Hayashi T., Miyoshi R., Okafuji Y., Okada S.',
    '#publications .publication-list > div:nth-child(1) .publication-venue': '28th ACM International Conference on Multimodal Interaction (ICMI 2026), Peer-reviewed, Accepted',
    '#publications .publication-list > div:nth-child(2) .publication-group-title': 'Domestic Conference',
    '#publications .publication-list > div:nth-child(2) .publication-title': 'A Multimodal Rapport Estimation Model for Evaluating Interaction Quality in Real-World HRI',
    '#publications .publication-list > div:nth-child(2) .publication-meta': 'Sakuramoto A., Hayashi T., Miyoshi R., Okafuji Y., Okada S.',
    '#publications .publication-list > div:nth-child(2) .publication-venue': 'Meeting on Image Recognition and Understanding (MIRU), Poster presentation (not peer-reviewed), Aug. 2026',
    '#publications .publication-list > div:nth-child(3) .publication-group-title': 'Awards and Grants',
    '#publications .publication-list > div:nth-child(3) .publication-title': 'JAIST Student Grant Scholarship, General Selection',
    '#publications .publication-list > div:nth-child(3) .publication-meta': 'Akihiro Sakuramoto',
    '#publications .publication-list > div:nth-child(3) .publication-venue': 'Awarded for academic excellence, 2025–2026',
    '#resources h2': 'Reading & Reference Archive',
    '#resources a[href="resources.html#world-analysis"] .card-kicker': 'Politics, Economics & Geopolitics',
    '#resources a[href="resources.html#world-analysis"] .link-value': 'Power, institutions, and the global economy',
    '#resources a[href="resources.html#business-industry"] .card-kicker': 'Business & Industry',
    '#resources a[href="resources.html#business-industry"] .link-value': 'Companies, competition, and industry structures',
    '#resources a[href="resources.html#research-technology"] .card-kicker': 'Research & Technology',
    '#resources a[href="resources.html#research-technology"] .link-value': 'Research and technology trends',
    '#resources a[href="resources.html#culture-entertainment"] .card-kicker': 'Culture & Entertainment',
    '#resources a[href="resources.html#culture-entertainment"] .link-value': 'Works, culture, and entertainment industries',
    '#resources a[href="resources.html#relationships-romance"] .card-kicker': 'Society & Relationships',
    '#resources a[href="resources.html#relationships-romance"] .link-value': 'Care, intimacy, relationships, and society',
    '#resources a[href="resources.html#podcasts"] .card-kicker': 'Podcasts',
    '#resources a[href="resources.html#podcasts"] .link-value': 'Ideas for listening on the move',
    '#resources a[href="resource-archive.html"] .card-kicker': 'Primary Sources & Research Archive',
    '#resources a[href="resource-archive.html"] .link-value': 'Data, sources, and research planning',
    '#contact h2': 'Contact / Links',
    '#contact .contact-card:nth-child(1) .contact-label-text': 'University Email',
    '#contact .contact-card:nth-child(2) .contact-label-text': 'Personal Email',
    '#contact a[href^="https://researchmap.jp/"] .link-value': 'Profile Search',
    '#contact a[href^="https://scholar.google.com/"] .link-value': 'Author Profile',
    '#contact a[href^="https://www.linkedin.com/"] .link-value': 'Profile',
    '#contact a[href="https://www.jaist.ac.jp/~okada-s/index.html"] .contact-label-text': 'Okada Laboratory',
    '#contact a[href="https://www.jaist.ac.jp/~okada-s/index.html"] .link-value': 'Lab Website',
    '.colophon-line': 'Scriptum in Ishikawa, MMXXVI',
    '.colophon-note': 'Proofread by one calico cat.',
    '.colophon-footnote': '* Cats have walked across manuscripts since a pawprinted codex of Dubrovnik, 1445.',
    '.copyright': '© 2026 Akihiro Sakuramoto'
  };

  var languageToggle = document.getElementById('languageToggle');
  var currentLanguage = 'ja';
  try { currentLanguage = localStorage.getItem('classical-lang') || 'ja'; } catch (error) {}

  Object.keys(translations).forEach(function (selector) {
    var element = document.querySelector(selector);
    if (element) element.setAttribute('data-ja-text', element.textContent);
  });

  function applyLanguage(language) {
    Object.keys(translations).forEach(function (selector) {
      var element = document.querySelector(selector);
      if (!element) return;
      element.textContent = language === 'en' ? translations[selector] : element.getAttribute('data-ja-text');
    });
    currentLanguage = language;
    document.documentElement.lang = language;
    document.title = language === 'en' ? 'Akihiro Sakuramoto / Sakuramoto Akihiro' : '櫻本晃弘';
    languageToggle.textContent = language === 'en' ? '日本語' : '英語';
    languageToggle.setAttribute('aria-label', language === 'en' ? '日本語表示に切り替え' : '英語表示に切り替え');
  }

  if (languageToggle) {
    languageToggle.addEventListener('click', function () {
      applyLanguage(currentLanguage === 'ja' ? 'en' : 'ja');
      try { localStorage.setItem('classical-lang', currentLanguage); } catch (error) {}
    });
    if (currentLanguage === 'en') applyLanguage('en');
  }

  var els = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(els, function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var delay = parseFloat(entry.target.getAttribute('data-reveal-delay') || '0');
        entry.target.style.transitionDelay = delay + 's';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }
})();
