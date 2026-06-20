const content = {
  ja: {
    metaTitle: "櫻本 晃弘 | Academic Profile",
    siteTitle: "櫻本 晃弘",
    nav: {
      home: "ホーム",
      about: "自己紹介",
      research: "研究",
      education: "経歴",
      publications: "業績",
      projects: "プロジェクト",
      contact: "連絡先"
    },
    hero: {
      eyebrow: "Academic Profile",
      name: "櫻本 晃弘",
      nameReading: "Akihiro Sakuramoto",
      affiliation: "北陸先端科学技術大学院大学 AI知性領域 博士前期課程",
      tagline: "ヒューマンロボットインタラクション / マルチモーダル対話分析 / 実環境HRI",
      summary: "実世界の人とロボットの関わりを、行動・感情・対話の手がかりから理解することを目指しています。研究者、共同研究者、採用担当者が必要な情報へすぐアクセスできるようにまとめています。"
    },
    buttons: {
      contact: "Contact",
      cv: "CV"
    },
    profileCard: {
      label: "研究テーマ",
      focus: "Human-AI Interaction、対話品質評価、実環境マルチモーダルデータ。"
    },
    sections: {
      about: { kicker: "About", title: "自己紹介" },
      research: { kicker: "Research", title: "研究関心" },
      education: { kicker: "CV", title: "学歴・経験" },
      publications: { kicker: "Publications", title: "研究業績" },
      projects: { kicker: "Projects", title: "プロジェクト" },
      contact: { kicker: "Contact", title: "連絡先・リンク" }
    },
    about: {
      // TODO: Edit this introduction when your profile changes.
      text: "北陸先端科学技術大学院大学の博士前期課程に所属しています。実環境におけるヒューマンロボットインタラクション、マルチモーダル対話分析、対話品質の評価に関心があります。"
    },
    researchKeywords: [
      "ヒューマンロボットインタラクション",
      "実環境HRI",
      "マルチモーダル対話分析",
      "ラポール推定",
      "感情・対話状態の計算的理解",
      "大規模言語モデル",
      "プライバシーを考慮したデータ収集",
      "行動予測"
    ],
    timeline: [
      {
        year: "2024-現在",
        title: "北陸先端科学技術大学院大学 AI知性領域 博士前期課程"
      },
      {
        year: "TODO",
        title: "学部・高専などの学歴を追加"
      },
      {
        year: "TODO",
        title: "研究補助、インターン、その他の経験を追加"
      }
    ],
    publications: {
      empty: "研究業績は今後追加予定です。",
      entries: []
    },
    projects: {
      empty: "プロジェクトは今後追加予定です。"
    },
    contacts: [
      // TODO: Replace TODO values with your real contact information.
      { label: "大学メール", value: "TODO", href: "" },
      { label: "個人メール", value: "TODO", href: "" },
      { label: "GitHub", value: "TODO", href: "" },
      { label: "Google Scholar", value: "TODO", href: "" },
      { label: "ORCID", value: "TODO", href: "" },
      { label: "LinkedIn", value: "TODO", href: "" }
    ],
    footer: {
      built: "Built with GitHub Pages."
    }
  },
  en: {
    metaTitle: "Akihiro Sakuramoto | Academic Profile",
    siteTitle: "Akihiro Sakuramoto",
    nav: {
      home: "Home",
      about: "About",
      research: "Research",
      education: "Education",
      publications: "Publications",
      projects: "Projects",
      contact: "Contact"
    },
    hero: {
      eyebrow: "Academic Profile",
      name: "Akihiro Sakuramoto",
      nameReading: "",
      affiliation: "Master's Student in Human-AI Interaction, Japan Advanced Institute of Science and Technology (JAIST)",
      tagline: "Human-Robot Interaction / Multimodal Interaction Analysis / Real-world HRI",
      summary: "I study how people and robots interact in real-world settings through behavioral, affective, and conversational signals. This website collects profile information for researchers, collaborators, conference participants, and recruiters."
    },
    buttons: {
      contact: "Contact",
      cv: "CV"
    },
    profileCard: {
      label: "Research Focus",
      focus: "Human-AI Interaction, interaction quality, and real-world multimodal data."
    },
    sections: {
      about: { kicker: "About", title: "About" },
      research: { kicker: "Research", title: "Research Interests" },
      education: { kicker: "CV", title: "Education / Experience" },
      publications: { kicker: "Publications", title: "Publications" },
      projects: { kicker: "Projects", title: "Projects" },
      contact: { kicker: "Contact", title: "Contact / Links" }
    },
    about: {
      // TODO: Edit this introduction when your profile changes.
      text: "I am a master's student at JAIST. My research interests include real-world human-robot interaction, multimodal interaction analysis, and computational approaches to understanding interaction quality."
    },
    researchKeywords: [
      "Human-Robot Interaction",
      "Real-world HRI",
      "Multimodal Interaction Analysis",
      "Rapport Prediction",
      "Affective Computing",
      "Large Language Models",
      "Privacy-aware Data Collection",
      "Behavior Prediction"
    ],
    timeline: [
      {
        year: "2024-Present",
        title: "Master's Student, AI Science Area, Japan Advanced Institute of Science and Technology (JAIST)"
      },
      {
        year: "TODO",
        title: "Add bachelor's degree"
      },
      {
        year: "TODO",
        title: "Add research assistant, internship, or other experience"
      }
    ],
    publications: {
      empty: "Publications will be added here.",
      entries: []
    },
    projects: {
      empty: "Projects will be added here."
    },
    contacts: [
      // TODO: Use anti-spam email format such as name [at] domain.
      { label: "University Email", value: "TODO", href: "" },
      { label: "Personal Email", value: "TODO", href: "" },
      { label: "GitHub", value: "TODO", href: "" },
      { label: "Google Scholar", value: "TODO", href: "" },
      { label: "ORCID", value: "TODO", href: "" },
      { label: "LinkedIn", value: "TODO", href: "" }
    ],
    footer: {
      built: "Built with GitHub Pages."
    }
  }
};

let currentLanguage = "ja";

function getNestedValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function renderText(language) {
  const dictionary = content[language];
  document.documentElement.lang = language;
  document.title = dictionary.metaTitle;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getNestedValue(dictionary, element.dataset.i18n);
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-nav]").forEach((element) => {
    element.textContent = dictionary.nav[element.dataset.nav];
  });
}

function renderKeywords(language) {
  const container = document.querySelector("#researchKeywords");
  container.innerHTML = "";

  content[language].researchKeywords.forEach((keyword) => {
    const card = document.createElement("div");
    card.className = "keyword-card";
    card.textContent = keyword;
    container.appendChild(card);
  });
}

function renderTimeline(language) {
  const container = document.querySelector("#timeline");
  container.innerHTML = "";

  content[language].timeline.forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "timeline-item";
    entry.innerHTML = `
      <div class="timeline-year">${item.year}</div>
      <p class="timeline-title">${item.title}</p>
    `;
    container.appendChild(entry);
  });
}

function renderPublications(language) {
  const container = document.querySelector("#publicationList");
  const emptyState = document.querySelector("#publications .empty-state");
  container.innerHTML = "";

  const entries = content[language].publications.entries;
  emptyState.hidden = entries.length > 0;

  entries.forEach((paper) => {
    const card = document.createElement("article");
    card.className = "publication-card";
    card.innerHTML = `
      <p class="publication-title">${paper.title}</p>
      <p class="publication-meta">${paper.authors}</p>
      <p class="publication-meta">${paper.venue}</p>
    `;
    container.appendChild(card);
  });
}

function renderContacts(language) {
  const container = document.querySelector("#contactLinks");
  container.innerHTML = "";

  content[language].contacts.forEach((link) => {
    const element = document.createElement(link.href ? "a" : "div");
    element.className = "link-card";

    if (link.href) {
      element.href = link.href;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }

    element.innerHTML = `
      <span class="link-label">${link.label}</span>
      <span class="link-value">${link.value}</span>
    `;
    container.appendChild(element);
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  renderText(language);
  renderKeywords(language);
  renderTimeline(language);
  renderPublications(language);
  renderContacts(language);
}

function setupLanguageToggle() {
  const button = document.querySelector("#languageToggle");
  button.addEventListener("click", () => {
    const nextLanguage = currentLanguage === "ja" ? "en" : "ja";
    applyLanguage(nextLanguage);
  });
}

function setupProfilePhotoFallback() {
  const image = document.querySelector("#profilePhoto");
  const placeholder = document.querySelector("#photoPlaceholder");

  image.addEventListener("load", () => {
    placeholder.hidden = true;
  });

  image.addEventListener("error", () => {
    image.classList.add("is-hidden");
    placeholder.hidden = false;
  });
}

setupLanguageToggle();
setupProfilePhotoFallback();
applyLanguage(currentLanguage);
