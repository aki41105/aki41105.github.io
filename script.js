const content = {
  ja: {
    metaTitle: "櫻本晃弘 / Sakuramoto Akihiro",
    siteTitle: "櫻本 晃弘",
    nav: {
      home: "ホーム",
      research: "研究",
      career: "経歴",
      publications: "業績",
      projects: "プロジェクト",
      gallery: "ギャラリー",
      resources: "資料",
      contact: "連絡先"
    },
    hero: {
      eyebrow: "Academic Profile",
      name: "櫻本 晃弘",
      nameReading: "Sakuramoto Akihiro / Akihiro Sakuramoto",
      affiliation: "北陸先端科学技術大学院大学 AI知性領域 博士前期課程",
      tagline: "ヒューマンロボットインタラクション / 社会的信号処理 / マルチモーダルインタラクション",
      summary: "櫻本晃弘（Sakuramoto Akihiro / Akihiro Sakuramoto）は、北陸先端科学技術大学院大学の博士前期課程に所属し、実環境HRI、マルチモーダル対話分析、対話品質評価に取り組んでいます。研究者、共同研究者、採用担当者が必要な情報へすぐアクセスできるようにまとめています。",
      updatedLabel: "最終更新",
      updatedDate: "2026年6月28日",
      updatedText: "経歴・業績ステータス・ギャラリー情報を整理しました。"
    },
    buttons: {
      contact: "Contact",
      cv: "CV"
    },
    sections: {
      research: { kicker: "Research", title: "研究紹介" },
      career: { kicker: "Career", title: "経歴" },
      researchActivities: { kicker: "Research Activities", title: "研究活動" },
      education: { kicker: "Education", title: "学歴" },
      experience: { kicker: "Experience", title: "経験・活動" },
      publications: { kicker: "Publications", title: "研究業績" },
      projects: { kicker: "Projects", title: "プロジェクト" },
      gallery: { kicker: "Gallery", title: "ギャラリー・近況メモ" },
      resources: { kicker: "Resources", title: "資料リンク" },
      contact: { kicker: "Contact", title: "連絡先・リンク" }
    },
    researchOverview: "実環境 HRI を対象に，社会的信号処理とマルチモーダルインタラクションの観点から，人とロボットの相互行為を分析しています。研究内容の詳細は順次整理します。",
    researchActivitiesTimeline: [
      {
        year: "2025年-現在",
        title: "サイバーエージェント AI Lab との共同研究",
        detail: "実店舗で収集された接客ロボット対話データを対象に，実環境HRIにおける対話品質評価の研究を推進。"
      },
      {
        year: "2025年8月-2026年1月",
        title: "グループ副テーマ研究",
        detail: "グループ副テーマとして実施した研究活動に取り組み，最終レポートを作成。"
      }
    ],
    educationTimeline: [
      {
        year: "2025年4月-現在",
        title: "北陸先端科学技術大学院大学 AI知性領域 博士前期課程"
      },
      {
        year: "2021年4月-2025年3月",
        title: "富山大学 工学部 工学科 電気電子工学コース"
      }
    ],
    experienceTimeline: [
      {
        year: "2025年9月",
        title: "日産自動車株式会社 技術系インターンシップ",
        detail: "車両性能領域「自動運転/先進運転支援性能実験（AD/ADAS）」に参加。（5日間）",
        titleHref: "gallery-nissan.html"
      },
      {
        year: "2025年8月-2025年9月",
        title: "株式会社FUJI 2025年度インターンシップ",
        detail: "クリームはんだ印刷機内で発生する不良のAI画像判定に取り組み，データ収集とアルゴリズム開発を経験。（3週間）"
      },
      {
        year: "2024年2月-2024年3月",
        title: "奈良先端科学技術大学院大学（NAIST）ロボットラーニング研究室 インターンシップ",
        detail: "強化学習を用いたロボット操作課題に取り組む。（約4週間）",
        titleHref: "gallery-naist.html"
      },
      {
        year: "2023年",
        title: "NHK学生ロボコン2023 本選出場",
        detail: "富山大学ロボコンプロジェクトに所属し，ROS，C言語，Pythonを用いたロボット制御を担当。"
      }
    ],
    publications: {
      empty: "研究業績は今後追加予定です。",
      groups: [
        {
          title: "国際会議",
          entries: []
        },
        {
          title: "国内学会",
          entries: [
            {
              title: "実環境 HRI における対話の質評価に向けたマルチモーダル ラポール推定モデルの検討",
              authors: "櫻本晃弘 (Sakuramoto Akihiro), 林貴斗, 三好遼, 岡藤勇希, 岡田将吾",
              venue: "画像の認識・理解シンポジウム（MIRU）, ポスター発表（査読なし）, 2026年8月"
            }
          ]
        },
        {
          title: "受賞・採択",
          entries: [
            {
              title: "北陸先端科学技術大学院大学学生給付奨学金 一般採用",
              authors: "櫻本晃弘",
              venue: "成績優秀のため採用, 2025-2026"
            }
          ]
        }
      ]
    },
    projects: {
      empty: "プロジェクトは今後追加予定です。"
    },
    gallery: {
      empty: "写真や近況メモは今後追加予定です。",
      entries: [
        {
          date: "2026",
          title: "図書館の風景",
          text: "研究プロフィールの雰囲気に合わせて選んだ，知的で温かい空間の写真。",
          image: "assets/header-library.jpg?v=20260628-1",
          href: "assets/header-library.jpg",
          alt: "曲線状の本棚が広がる温かい雰囲気の図書館",
          tags: ["Photo", "Research Life"]
        },
        {
          id: "gallery-nissan",
          date: "2025年9月",
          title: "日産インターンシップ",
          text: "技術系インターンシップ期間中の厚木での記録。厚木家，さわやか，新時代，麺や食堂 厚木本店。",
          image: "assets/nissan-atsugiya.jpg?v=20260628-2",
          href: "gallery-nissan.html",
          alt: "日産インターン期間中に食べた厚木家のラーメン",
          tags: ["Internship", "Atsugi", "Food"]
        },
        {
          id: "gallery-naist",
          date: "2024年2月-3月",
          title: "NAISTインターンシップ",
          text: "ロボットラーニング研究室でのインターン期間中に撮影した，NAISTキャンパスと滞在中の記録。",
          image: "assets/naist-sign-gate.jpg?v=20260628-2",
          href: "gallery-naist.html",
          alt: "NAISTキャンパス入口の風景",
          tags: ["Internship", "NAIST", "Research Life"]
        }
      ]
    },
    resources: {
      empty: "論文執筆や研究に役立つ資料リンクをここに追加予定です。",
      entries: [
        { label: "石原尚 note", value: "研究・執筆・発表の基礎", href: "https://note.com/hisashi_is", icon: "link" }
      ]
    },
    contacts: [
      // TODO: Replace TODO values with your real contact information.
      { label: "大学メール", value: "s2510069 [at] jaist.ac.jp", href: "", icon: "mail" },
      { label: "個人メール", value: "sakuramoto.may [at] gmail.com", href: "", icon: "mail" },
      { label: "GitHub", value: "aki41105", href: "https://github.com/aki41105", icon: "github", rel: "me" },
      { label: "Google Scholar", value: "TODO", href: "", icon: "scholar" },
      { label: "researchmap", value: "プロフィール検索", href: "https://researchmap.jp/search?q=%E6%AB%BB%E6%9C%AC%E6%99%83%E5%BC%98", icon: "link" },
      { label: "ORCID", value: "0009-0006-7932-0219", href: "https://orcid.org/0009-0006-7932-0219", icon: "orcid", rel: "me" },
      { label: "LinkedIn", value: "Profile", href: "https://www.linkedin.com/in/akihiro-sakuramoto-37024b328/", icon: "linkedin", rel: "me" },
      { label: "岡田研究室", value: "Lab Website", href: "https://www.jaist.ac.jp/~okada-s/index.html", icon: "link" }
    ],
    footer: {
      built: "Built with GitHub Pages."
    }
  },
  en: {
    metaTitle: "Akihiro Sakuramoto / Sakuramoto Akihiro",
    siteTitle: "Akihiro Sakuramoto",
    nav: {
      home: "Home",
      research: "Research",
      career: "Career",
      publications: "Publications",
      projects: "Projects",
      gallery: "Gallery",
      resources: "Resources",
      contact: "Contact"
    },
    hero: {
      eyebrow: "Academic Profile",
      name: "Akihiro Sakuramoto",
      nameReading: "櫻本晃弘 / Sakuramoto Akihiro",
      affiliation: "Master's Student in Human-AI Interaction, Japan Advanced Institute of Science and Technology (JAIST)",
      tagline: "Human-Robot Interaction / Social Signal Processing / Multimodal Interaction",
      summary: "Akihiro Sakuramoto (Sakuramoto Akihiro / 櫻本晃弘) is a master's student at JAIST studying real-world Human-Robot Interaction, multimodal interaction analysis, and computational approaches to interaction quality. This website collects profile information for researchers, collaborators, conference participants, and recruiters.",
      updatedLabel: "Last updated",
      updatedDate: "June 28, 2026",
      updatedText: "Career, publication status, and gallery information were organized."
    },
    buttons: {
      contact: "Contact",
      cv: "CV"
    },
    sections: {
      research: { kicker: "Research", title: "Research Overview" },
      career: { kicker: "Career", title: "Career" },
      researchActivities: { kicker: "Research Activities", title: "Research Activities" },
      education: { kicker: "Education", title: "Education" },
      experience: { kicker: "Experience", title: "Experience & Activities" },
      publications: { kicker: "Publications", title: "Publications" },
      projects: { kicker: "Projects", title: "Projects" },
      gallery: { kicker: "Gallery", title: "Gallery / Notes" },
      resources: { kicker: "Resources", title: "Resources" },
      contact: { kicker: "Contact", title: "Contact / Links" }
    },
    researchOverview: "I study real-world HRI through social signal processing and multimodal interaction, focusing on how people and robots relate to one another in everyday settings. More detailed project descriptions will be added as they are organized.",
    researchActivitiesTimeline: [
      {
        year: "2025-Present",
        title: "Joint Research with CyberAgent AI Lab",
        detail: "Studying real-world HRI and interaction quality evaluation using in-store customer-service robot interaction data."
      },
      {
        year: "Aug. 2025-Jan. 2026",
        title: "Group Sub-theme Research Project",
        detail: "Worked on a group sub-theme research activity and prepared the final report."
      }
    ],
    educationTimeline: [
      {
        year: "Apr. 2025-Present",
        title: "Master's Student, AI Science Area, Japan Advanced Institute of Science and Technology (JAIST)"
      },
      {
        year: "Apr. 2021-Mar. 2025",
        title: "Electrical and Electronic Engineering Course, Department of Engineering, Faculty of Engineering, University of Toyama"
      }
    ],
    experienceTimeline: [
      {
        year: "Sep. 2025",
        title: "Technical Internship, Nissan Motor Corporation",
        detail: "Participated in an AD/ADAS and vehicle dynamics performance experimentation program in the vehicle performance area. (5 days)",
        titleHref: "gallery-nissan.html"
      },
      {
        year: "Aug. 2025-Sep. 2025",
        title: "Internship, FUJI Corporation",
        detail: "Worked on AI-based image inspection for defects occurring inside solder paste printers, including data collection and algorithm development. (3 weeks)"
      },
      {
        year: "Feb. 2024-Mar. 2024",
        title: "Internship, Robot Learning Laboratory, Nara Institute of Science and Technology (NAIST)",
        detail: "Worked on robot manipulation tasks using reinforcement learning. (about 4 weeks)",
        titleHref: "gallery-naist.html"
      },
      {
        year: "2023",
        title: "NHK Student Robocon 2023 Finalist",
        detail: "Worked on robot control in the University of Toyama Robocon Project using ROS, C, and Python."
      }
    ],
    publications: {
      empty: "Publications will be added here.",
      groups: [
        {
          title: "International Conferences",
          entries: []
        },
        {
          title: "Domestic Conferences",
          entries: [
            {
              title: "A Multimodal Rapport Estimation Model for Evaluating Interaction Quality in Real-World HRI",
              authors: "Akihiro Sakuramoto (Sakuramoto Akihiro), Takato Hayashi, Ryo Miyoshi, Yuki Okafuji, Shogo Okada",
              venue: "Meeting on Image Recognition and Understanding (MIRU), Poster presentation (non-peer-reviewed), Aug. 2026"
            }
          ]
        },
        {
          title: "Awards",
          entries: [
            {
              title: "JAIST Student Grant Scholarship",
              authors: "Akihiro Sakuramoto",
              venue: "Awarded for academic excellence, 2025-2026"
            }
          ]
        }
      ]
    },
    projects: {
      empty: "Projects will be added here."
    },
    gallery: {
      empty: "Photos and short notes will be added here.",
      entries: [
        {
          date: "2026",
          title: "Library Scene",
          text: "A warm, knowledge-rich space selected to match the atmosphere of this research profile.",
          image: "assets/header-library.jpg?v=20260628-1",
          href: "assets/header-library.jpg",
          alt: "Curved bookshelves inside a warm library atrium",
          tags: ["Photo", "Research Life"]
        },
        {
          id: "gallery-nissan",
          date: "Sep. 2025",
          title: "Nissan Internship",
          text: "Photos from the technical internship period in Atsugi, including Atsugiya, Sawayaka, Shinjidai, and Menya Shokudo Atsugi Main Shop.",
          image: "assets/nissan-atsugiya.jpg?v=20260628-2",
          href: "gallery-nissan.html",
          alt: "A bowl of ramen at Atsugiya during the Nissan internship",
          tags: ["Internship", "Atsugi", "Food"]
        },
        {
          id: "gallery-naist",
          date: "Feb.-Mar. 2024",
          title: "NAIST Internship",
          text: "Campus and daily-life photos from the internship at the Robot Learning Laboratory, NAIST.",
          image: "assets/naist-sign-gate.jpg?v=20260628-2",
          href: "gallery-naist.html",
          alt: "Entrance area of the NAIST campus",
          tags: ["Internship", "NAIST", "Research Life"]
        }
      ]
    },
    resources: {
      empty: "Writing and research resource links will be added here.",
      entries: [
        { label: "Hisashi Ishihara on note", value: "Research, writing, and presentation basics", href: "https://note.com/hisashi_is", icon: "link" }
      ]
    },
    contacts: [
      // TODO: Use anti-spam email format such as name [at] domain.
      { label: "University Email", value: "s2510069 [at] jaist.ac.jp", href: "", icon: "mail" },
      { label: "Personal Email", value: "sakuramoto.may [at] gmail.com", href: "", icon: "mail" },
      { label: "GitHub", value: "aki41105", href: "https://github.com/aki41105", icon: "github", rel: "me" },
      { label: "Google Scholar", value: "TODO", href: "", icon: "scholar" },
      { label: "researchmap", value: "Profile Search", href: "https://researchmap.jp/search?q=Sakuramoto%20Akihiro", icon: "link" },
      { label: "ORCID", value: "0009-0006-7932-0219", href: "https://orcid.org/0009-0006-7932-0219", icon: "orcid", rel: "me" },
      { label: "LinkedIn", value: "Profile", href: "https://www.linkedin.com/in/akihiro-sakuramoto-37024b328/", icon: "linkedin", rel: "me" },
      { label: "Okada Laboratory", value: "Lab Website", href: "https://www.jaist.ac.jp/~okada-s/index.html", icon: "link" }
    ],
    footer: {
      built: "Built with GitHub Pages."
    }
  }
};

let currentLanguage = "ja";

const icons = {
  mail: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.8 5.6h14.4c1.1 0 2 .9 2 2v8.8c0 1.1-.9 2-2 2H4.8c-1.1 0-2-.9-2-2V7.6c0-1.1.9-2 2-2Zm7.2 7.2 7.2-5.2H4.8l7.2 5.2Zm0 2.1L4.4 9.4v7c0 .22.18.4.4.4h14.4c.22 0 .4-.18.4-.4v-7L12 14.9Z"></path>
    </svg>
  `,
  github: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.86 8.34 6.84 9.69.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.71 0 0 .84-.28 2.75 1.05A9.34 9.34 0 0 1 12 6.93c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"></path>
    </svg>
  `,
  scholar: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3 1.9 8.6 12 14.2l8.1-4.5V15h2V8.6L12 3Zm-5.7 9.6v3.2c0 1.8 2.55 3.2 5.7 3.2s5.7-1.4 5.7-3.2v-3.2L12 15.8l-5.7-3.2Z"></path>
    </svg>
  `,
  orcid: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.7 7.2a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Zm.9 3.4v6.2H7.8v-6.2h1.8Zm3.2 0h2.4c1.9 0 3.2 1.2 3.2 3.1s-1.3 3.1-3.2 3.1h-2.4v-6.2Zm1.8 1.5v3.2h.5c.9 0 1.5-.55 1.5-1.6s-.6-1.6-1.5-1.6h-.5Z"></path>
    </svg>
  `,
  linkedin: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.2 3.2h13.6c1.1 0 2 .9 2 2v13.6c0 1.1-.9 2-2 2H5.2c-1.1 0-2-.9-2-2V5.2c0-1.1.9-2 2-2Zm3.2 15v-7.7H6.1v7.7h2.3ZM7.25 9.45c.75 0 1.35-.6 1.35-1.34 0-.75-.6-1.35-1.35-1.35-.74 0-1.34.6-1.34 1.35 0 .74.6 1.34 1.34 1.34Zm10.65 8.75v-4.15c0-2.22-1.18-3.25-2.75-3.25-1.27 0-1.84.7-2.16 1.19v-1.49h-2.3v7.7h2.3v-4.3c0-1.13.21-2.22 1.61-2.22 1.38 0 1.4 1.29 1.4 2.29v4.23h1.9Z"></path>
    </svg>
  `,
  link: `
    <svg class="link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M10.2 13.8a1 1 0 0 1 0-1.42l3.5-3.5a2.8 2.8 0 1 1 3.96 3.96l-1.25 1.25a1 1 0 1 1-1.42-1.41l1.25-1.25a.8.8 0 1 0-1.13-1.14l-3.5 3.5a1 1 0 0 1-1.41 0Zm3.6-3.6a1 1 0 0 1 0 1.42l-3.5 3.5a2.8 2.8 0 0 1-3.96-3.96L7.59 9.9A1 1 0 0 1 9 11.32l-1.25 1.25a.8.8 0 0 0 1.13 1.14l3.5-3.5a1 1 0 0 1 1.41 0Z"></path>
    </svg>
  `
};

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

function renderResearchOverview(language) {
  const container = document.querySelector("#researchOverview");
  container.textContent = content[language].researchOverview;
}

function renderTimeline(containerId, entries) {
  const container = document.querySelector(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = "";

  entries.forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "timeline-item";
    const detail = item.detail ? `<p class="timeline-detail">${item.detail}</p>` : "";
    const title = item.titleHref
      ? `<a class="timeline-title timeline-title-link" href="${item.titleHref}">${item.title}</a>`
      : `<p class="timeline-title">${item.title}</p>`;
    entry.innerHTML = `
      <div class="timeline-year">${item.year}</div>
      <div class="timeline-content">
        ${title}
        ${detail}
      </div>
    `;
    container.appendChild(entry);
  });
}

function renderPublications(language) {
  const container = document.querySelector("#publicationList");
  const emptyState = document.querySelector("#publications .empty-state");
  container.innerHTML = "";

  const groups = content[language].publications.groups;
  const hasEntries = groups.some((group) => group.entries.length > 0);
  emptyState.hidden = hasEntries;

  groups.forEach((group) => {
    if (group.entries.length === 0) {
      return;
    }

    const groupElement = document.createElement("section");
    groupElement.className = "publication-group";
    groupElement.innerHTML = `<h3 class="publication-group-title">${group.title}</h3>`;

    group.entries.forEach((paper) => {
      const card = document.createElement("article");
      card.className = "publication-card";
      card.innerHTML = `
        <p class="publication-title">${paper.title}</p>
        <p class="publication-meta">${paper.authors}</p>
        <p class="publication-meta">${paper.venue}</p>
      `;
      groupElement.appendChild(card);
    });

    container.appendChild(groupElement);
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
      element.rel = link.rel ? `${link.rel} noopener noreferrer` : "noopener noreferrer";
    }

    const icon = link.icon ? icons[link.icon] : "";
    const valueClass = link.href ? "link-value link-value-action" : "link-value";

    element.innerHTML = `
      <span class="link-label">${icon}${link.label}</span>
      <span class="${valueClass}">${link.value}</span>
    `;
    container.appendChild(element);
  });
}

function renderResources(language) {
  const container = document.querySelector("#resourceLinks");
  const emptyState = document.querySelector("#resourcesEmpty");
  container.innerHTML = "";

  const entries = content[language].resources.entries;
  emptyState.hidden = entries.length > 0;

  entries.forEach((link) => {
    const element = document.createElement(link.href ? "a" : "div");
    element.className = "link-card";

    if (link.href) {
      element.href = link.href;
      element.target = "_blank";
      element.rel = link.rel ? `${link.rel} noopener noreferrer` : "noopener noreferrer";
    }

    const icon = link.icon ? icons[link.icon] : "";
    const valueClass = link.href ? "link-value link-value-action" : "link-value";

    element.innerHTML = `
      <span class="link-label">${icon}${link.label}</span>
      <span class="${valueClass}">${link.value}</span>
    `;
    container.appendChild(element);
  });
}

function renderGallery(language) {
  const container = document.querySelector("#galleryList");
  const emptyState = document.querySelector("#galleryEmpty");
  container.innerHTML = "";

  const entries = content[language].gallery.entries;
  emptyState.hidden = entries.length > 0;

  entries.forEach((item) => {
    const card = document.createElement(item.href ? "a" : "article");
    card.className = "gallery-card";
    if (item.id) {
      card.id = item.id;
    }
    if (item.href) {
      card.href = item.href;
    }
    const tags = item.tags.map((tag) => `<span>${tag}</span>`).join("");

    card.innerHTML = `
      <img src="${item.image}" alt="${item.alt}">
      <div class="gallery-card-body">
        <p class="gallery-date">${item.date}</p>
        <h3 class="gallery-title">${item.title}</h3>
        <p class="gallery-text">${item.text}</p>
        <div class="gallery-tags">${tags}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

function applyLanguage(language) {
  currentLanguage = language;
  renderText(language);
  renderResearchOverview(language);
  renderTimeline("#researchActivityTimeline", content[language].researchActivitiesTimeline);
  renderTimeline("#educationTimeline", content[language].educationTimeline);
  renderTimeline("#experienceTimeline", content[language].experienceTimeline);
  renderPublications(language);
  renderGallery(language);
  renderResources(language);
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

  const showPhoto = () => {
    image.classList.remove("is-hidden");
    placeholder.hidden = true;
  };

  const showPlaceholder = () => {
    image.classList.add("is-hidden");
    placeholder.hidden = false;
  };

  image.addEventListener("load", showPhoto);
  image.addEventListener("error", showPlaceholder);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showPhoto();
    } else {
      showPlaceholder();
    }
  }
}

function setupScrollSpy() {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a[data-nav]"));
  const sectionEntries = navLinks
    .map((link) => ({
      id: link.dataset.nav,
      link,
      section: document.querySelector(`#${link.dataset.nav}`)
    }))
    .filter((entry) => entry.section);

  if (sectionEntries.length === 0) {
    return;
  }

  let activeId = "";
  let ticking = false;

  const setActiveSection = (sectionId) => {
    if (!sectionId || sectionId === activeId) {
      return;
    }

    activeId = sectionId;

    sectionEntries.forEach(({ id, link }) => {
      const isActive = id === sectionId;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const activeLink = sectionEntries.find((entry) => entry.id === sectionId)?.link;
    if (activeLink && nav && nav.scrollWidth > nav.clientWidth) {
      activeLink.scrollIntoView({ block: "nearest", inline: "center" });
    }
  };

  const getCurrentSectionId = () => {
    const headerHeight = header?.getBoundingClientRect().height ?? 0;
    const threshold = headerHeight + Math.min(240, window.innerHeight * 0.35);
    const isAtPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    if (isAtPageEnd) {
      return sectionEntries[sectionEntries.length - 1].id;
    }

    return sectionEntries.reduce((currentId, entry) => {
      const top = entry.section.getBoundingClientRect().top;
      return top <= threshold ? entry.id : currentId;
    }, sectionEntries[0].id);
  };

  const updateActiveSection = () => {
    ticking = false;
    setActiveSection(getCurrentSectionId());
  };

  const requestUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("hashchange", requestUpdate);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(requestUpdate, 120);
    });
  });

  requestUpdate();
}

setupLanguageToggle();
setupProfilePhotoFallback();
applyLanguage(currentLanguage);
setupScrollSpy();
