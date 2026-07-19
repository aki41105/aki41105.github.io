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
  if (!savedTheme) savedTheme = 'dark';
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

  var translations = {
    '.brand > span:last-child': 'Akihiro Sakuramoto',
    '.site-nav a[href="#research"]': 'Research',
    '.site-nav a[href="#career"]': 'Career',
    '.site-nav a[href="#publications"]': 'Publications',
    '.site-nav a[href="#projects"]': 'Projects',
    '.site-nav a[href="#gallery"]': 'Gallery',
    '.site-nav a[href="#resources"]': 'Resources',
    '.site-nav a[href="#contact"]': 'Contact',
    '.hero h1': 'Akihiro Sakuramoto',
    '.name-reading': '櫻本晃弘 / Sakuramoto Akihiro',
    '.affiliation': "Master's Student, AI Science Area, Japan Advanced Institute of Science and Technology (JAIST)",
    '.hero .summary': 'I study human-robot interaction, social signal processing, and multimodal interaction, with a focus on understanding the quality of human-robot relationships in real-world HRI.',
    '.update-note-label': 'Last updated',
    '.update-note-date': 'July 19, 2026',
    '.update-note-text': 'Now writing on note and Qiita — see Contact.',
    '#research h2': 'Research Overview',
    '#research .lede': 'I study real-world HRI through social signal processing and multimodal interaction. In particular, I aim to evaluate interaction quality quantitatively by estimating rapport—the quality of the relationship—in customer-service dialogue.',
    '#career h2': 'Career',
    '#education .career-group-sub': 'Education',
    '#education .timeline-item:nth-child(1) .timeline-year': 'Apr. 2025 – Present',
    '#education .timeline-item:nth-child(1) .timeline-title': 'Japan Advanced Institute of Science and Technology (JAIST), M.S. Student, AI Science Area',
    '#education .timeline-item:nth-child(2) .timeline-year': 'Apr. 2021 – Mar. 2025',
    '#education .timeline-item:nth-child(2) .timeline-title a': 'University of Toyama, B.E., Electrical and Electronic Engineering Course, Faculty of Engineering',
    '#research-activities .career-group-sub': 'Research Activities',
    '#research-activities .timeline-item:nth-child(1) .timeline-year': 'Oct. 2025 – Present',
    '#research-activities .timeline-item:nth-child(1) .timeline-title': 'Joint research with CyberAgent AI Lab. Studying real-world HRI and interaction quality evaluation using in-store customer-service robot interaction data.',
    '#research-activities .timeline-item:nth-child(2) .timeline-year': 'Aug. 2025 – Jan. 2026',
    '#research-activities .timeline-item:nth-child(2) .timeline-title a': 'Preserving lessons from the Noto Peninsula Earthquake through digital twin technology',
    '#research-activities .timeline-item:nth-child(2) .timeline-detail': 'Conducted interviews in Ipponsugi Shopping Street, Nanao, organized local challenges and lessons from the earthquake, and examined ways to preserve and share those findings with digital twin technology in a final report.',
    '#experience .career-group-sub': 'Experience',
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
    '#memberships .career-group-sub': 'Professional Memberships',
    '#memberships .timeline-year': '2026 – Present',
    '#memberships .timeline-title a': 'Student Member, Association for Computing Machinery (ACM)',
    '#publications h2': 'Publications',
    '#publications .publication-list > div:nth-child(1) .publication-group-title': 'Domestic Conference',
    '#publications .publication-list > div:nth-child(1) .publication-title': 'A Multimodal Rapport Estimation Model for Evaluating Interaction Quality in Real-World HRI',
    '#publications .publication-list > div:nth-child(1) .publication-meta': 'Sakuramoto A., Hayashi T., Miyoshi R., Okafuji Y., Okada S.',
    '#publications .publication-list > div:nth-child(1) .publication-venue': 'Meeting on Image Recognition and Understanding (MIRU), Poster presentation (not peer-reviewed), Aug. 2026',
    '#publications .publication-list > div:nth-child(2) .publication-group-title': 'Awards and Grants',
    '#publications .publication-list > div:nth-child(2) .publication-title': 'JAIST Student Grant Scholarship, General Selection',
    '#publications .publication-list > div:nth-child(2) .publication-meta': 'Akihiro Sakuramoto',
    '#publications .publication-list > div:nth-child(2) .publication-venue': 'Awarded for academic excellence, 2025–2026',
    '#projects h2': 'Projects',
    '.projects-note': 'In preparation — planned for autumn 2026.',
    '.projects-excuse': '…a cat ran off with the materials.',
    '#gallery h2': 'Gallery / Blog',
    '#gallery a[href="blog-hri2026-analysis.html"] .gallery-date': 'Jul. 1, 2026',
    '#gallery a[href="blog-hri2026-analysis.html"] .gallery-title': 'Reading 127 HRI 2026 Papers',
    '#gallery a[href="blog-hri2026-analysis.html"] .gallery-text': 'A title-and-abstract based overview of topic clusters across HRI 2026 Full Research Papers.',
    '#gallery a[href="blog-start.html"] .gallery-date': 'Jun. 29, 2026',
    '#gallery a[href="blog-start.html"] .gallery-title': 'Starting a Blog',
    '#gallery a[href="blog-start.html"] .gallery-text': 'A place for short notes on research, making things, and everyday observations.',
    '#gallery a[href="gallery-library.html"] .gallery-title': 'Library Scene',
    '#gallery a[href="gallery-library.html"] .gallery-text': 'Photos from a circular library space and meals during the visit.',
    '#gallery a[href="gallery-expo-osaka.html"] .gallery-date': 'Sep. 27, 2025',
    '#gallery a[href="gallery-expo-osaka.html"] .gallery-title': 'Osaka Expo',
    '#gallery a[href="gallery-expo-osaka.html"] .gallery-text': 'Photos from a visit to Expo 2025 Osaka, including venue scenes and meals.',
    '#gallery a[href="gallery-nissan.html"] .gallery-date': 'Sep. 2025',
    '#gallery a[href="gallery-nissan.html"] .gallery-title': 'Nissan Internship',
    '#gallery a[href="gallery-nissan.html"] .gallery-text': 'Scenes from an engineering internship in Atsugi, including meals and a night view with the NISSAN logo.',
    '#gallery a[href="gallery-fuji.html"] .gallery-date': 'Aug.–Sep. 2025',
    '#gallery a[href="gallery-fuji.html"] .gallery-title': 'FUJI Corporation',
    '#gallery a[href="gallery-fuji.html"] .gallery-text': 'Scenes from the 2025 internship, including work on AI-based image inspection.',
    '#gallery a[href="gallery-nanao.html"] .gallery-date': 'Sep. 2025',
    '#gallery a[href="gallery-nanao.html"] .gallery-title': 'Nanao Fieldwork',
    '#gallery a[href="gallery-nanao.html"] .gallery-text': 'Fieldwork in Nanao on preserving lessons from the Noto Peninsula Earthquake.',
    '#gallery a[href="gallery-owara-kazenobon-2024.html"] .gallery-date': 'Sep. 2024',
    '#gallery a[href="gallery-owara-kazenobon-2024.html"] .gallery-title': 'Owara Kaze no Bon',
    '#gallery a[href="gallery-owara-kazenobon-2024.html"] .gallery-text': 'Evening streets, lanterns, dance, and stage performances in Yatsuo, Toyama.',
    '#gallery a[href="gallery-naist.html"] .gallery-date': 'Feb.–Mar. 2024',
    '#gallery a[href="gallery-naist.html"] .gallery-title': 'NAIST Internship',
    '#gallery a[href="gallery-naist.html"] .gallery-text': 'Scenes from the NAIST campus and daily life during an internship in the Robot Learning Laboratory.',
    '#gallery a[href="gallery-robocon.html"] .gallery-title': 'NHK Student Robocon 2023 Finalist',
    '#gallery a[href="gallery-robocon.html"] .gallery-text': 'Photos from the final tournament with the University of Toyama Robocon Project.',
    '#gallery a[href="gallery-toyama-university.html"] .gallery-date': '2021–2025',
    '#gallery a[href="gallery-toyama-university.html"] .gallery-title': 'University of Toyama',
    '#gallery a[href="gallery-toyama-university.html"] .gallery-text': 'Campus life, Toyama city, and meals photographed during my undergraduate years.',
    '#gallery a[href="gallery-wsj-2019.html"] .gallery-date': 'Aug. 2019',
    '#gallery a[href="gallery-wsj-2019.html"] .gallery-title': '24th World Scout Jamboree (24WSJ)',
    '#gallery a[href="gallery-wsj-2019.html"] .gallery-text': 'Photos from participating in 24WSJ in the United States, including venue scenes and meals.',
    '#resources h2': 'Resources',
    '#resources a[href="https://github.com/aki41105/my-docs"] .card-kicker': 'Private Notes (owner only)',
    '#resources a[href="https://github.com/aki41105/my-docs"] .link-value': 'my-docs — sign-in required ↗',
    '#resources a[href="https://www.jaist.ac.jp/misc/circles/raboratorai/"] .card-kicker': 'Raboratorai',
    '#resources a[href="https://www.jaist.ac.jp/misc/circles/raboratorai/"] .link-value': 'JAIST official circle website ↗',
    '#resources a[href="https://note.com/hisashi_is"] .card-kicker': 'Hisashi Ishihara on note',
    '#resources a[href="https://note.com/hisashi_is"] .link-value': 'Research, writing, and presentation basics ↗',
    '#contact h2': 'Contact / Links',
    '#contact .contact-card:nth-child(1) .contact-label-text': 'University Email',
    '#contact .contact-card:nth-child(2) .contact-label-text': 'Personal Email',
    '#contact a[href^="https://researchmap.jp/"] .link-value': 'Profile Search ↗',
    '#contact a[href="https://www.jaist.ac.jp/~okada-s/index.html"] .contact-label-text': 'Okada Laboratory',
    '.colophon-note': 'Proofread by one calico cat.',
    '.colophon-footnote': '* Cats have walked across manuscripts since a pawprinted codex of Dubrovnik, 1445.'
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
    document.title = language === 'en' ? 'Akihiro Sakuramoto / Sakuramoto Akihiro' : '櫻本晃弘 / Sakuramoto Akihiro';
    languageToggle.textContent = language === 'en' ? '日本語' : 'English';
    languageToggle.setAttribute('aria-label', language === 'en' ? '日本語に切り替え' : 'Switch to English');
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
