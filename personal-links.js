// Optional, device-local bookmarks. Keep actual user links out of this file.
(function () {
  'use strict';

  var storageKey = 'aki41105-personal-links-v1';
  var maxLinks = 50;

  function problem(code) {
    var error = new Error(code);
    error.code = code;
    return error;
  }

  function normalizeLink(link) {
    if (!link || typeof link.title !== 'string' || typeof link.url !== 'string') throw problem('invalid');
    var title = link.title.trim();
    var rawUrl = link.url.trim();
    if (!title || title.length > 80 || rawUrl.length > 2048 || /[\u0000-\u001f\u007f]/.test(title + rawUrl)) throw problem('invalid');
    var url;
    try { url = new URL(rawUrl); } catch (error) { throw problem('invalid'); }
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.href.length > 2048) throw problem('invalid');
    return { title: title, url: url.href };
  }

  function readLinks(storage) {
    var raw;
    try { raw = storage.getItem(storageKey); } catch (error) { throw problem('storage'); }
    if (raw === null) return [];
    try {
      if (typeof raw !== 'string' || raw.length > 300000) throw problem('corrupt');
      var links = JSON.parse(raw);
      if (!Array.isArray(links) || links.length > maxLinks) throw problem('corrupt');
      return links.map(normalizeLink);
    } catch (error) { throw problem('corrupt'); }
  }

  function writeLinks(storage, links) {
    try { storage.setItem(storageKey, JSON.stringify(links)); } catch (error) { throw problem('storage'); }
  }

  function addLink(storage, input) {
    var link = normalizeLink(input);
    var links = readLinks(storage);
    var index = links.findIndex(function (item) { return item.url === link.url; });
    if (index < 0 && links.length >= maxLinks) throw problem('limit');
    if (index < 0) links.push(link);
    else links[index] = link;
    writeLinks(storage, links);
    return links;
  }

  function removeLink(storage, url) {
    var links = readLinks(storage).filter(function (item) { return item.url !== url; });
    writeLinks(storage, links);
    return links;
  }

  // Allow the storage and validation paths to be tested without a browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { storageKey: storageKey, normalizeLink: normalizeLink, readLinks: readLinks, addLink: addLink, removeLink: removeLink };
  }
  if (typeof document === 'undefined') return;
  var panel = document.getElementById('personal-links');
  if (!panel) return;

  var messages = {
    ja: {
      heading: '自分用リンク',
      notice: 'リンクはこのブラウザ内だけに保存します。別の端末には同期されず、ブラウザのデータを消すと失われます。同じブラウザを使う人は閲覧できます。',
      caution: 'パスワードや認証用・機密情報を含むURLは保存しないでください。',
      empty: 'まだリンクを保存していません。',
      addHeading: 'リンクを追加', title: '表示名', url: 'URL（https://）', save: 'このブラウザに保存',
      list: '保存したリンク', remove: '削除', removeLabel: 'このブラウザから削除：',
      confirmRemove: 'このブラウザから次のリンクを削除しますか？\n',
      saved: 'このブラウザに保存しました。', removed: 'このブラウザから削除しました。',
      invalid: '表示名と、有効な https:// から始まるURLを入力してください。ユーザー名・パスワードを含むURLは保存できません。',
      storage: 'ブラウザ内の保存領域を利用できません。保存データは変更していません。',
      corrupt: '保存データを読み込めません。上書きを防ぐため、変更は保存していません。',
      limit: '保存できるリンクは50件までです。'
    },
    en: {
      heading: 'Personal Links',
      notice: 'Links stay in this browser only. They do not sync to other devices and are lost when browser data is cleared. Anyone using this browser can view them.',
      caution: 'Do not store passwords, authentication links, or URLs containing confidential information.',
      empty: 'No links saved in this browser yet.',
      addHeading: 'Add a link', title: 'Label', url: 'URL (https://)', save: 'Save in this browser',
      list: 'Saved links', remove: 'Remove', removeLabel: 'Remove from this browser: ',
      confirmRemove: 'Remove this link from this browser?\n',
      saved: 'Saved in this browser.', removed: 'Removed from this browser.',
      invalid: 'Enter a label and a valid https:// URL without an embedded username or password.',
      storage: 'Browser storage is unavailable. Saved data has not been changed.',
      corrupt: 'Saved data could not be read. No changes were saved, to avoid overwriting it.',
      limit: 'You can save up to 50 links.'
    }
  };
  var links = [];
  var statusKey = '';
  var list = document.getElementById('personal-links-list');
  var empty = document.getElementById('personal-links-empty');
  var status = document.getElementById('personal-links-status');
  var form = document.getElementById('personal-links-form');
  var titleInput = document.getElementById('personal-link-title');
  var urlInput = document.getElementById('personal-link-url');

  function text(key) {
    return messages[document.documentElement.lang === 'en' ? 'en' : 'ja'][key];
  }

  function showStatus(key) {
    statusKey = key;
    status.textContent = key ? text(key) : '';
  }

  function render() {
    panel.querySelectorAll('[data-personal-text]').forEach(function (element) {
      element.textContent = text(element.getAttribute('data-personal-text'));
    });
    list.setAttribute('aria-label', text('list'));
    list.replaceChildren();
    links.forEach(function (link) {
      var item = document.createElement('li');
      item.className = 'personal-links-item';
      var anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.title;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'language-toggle';
      button.textContent = text('remove');
      button.setAttribute('aria-label', text('removeLabel') + link.title);
      button.addEventListener('click', function () {
        if (!window.confirm(text('confirmRemove') + link.title)) return;
        try {
          var updated = removeLink(window.localStorage, link.url);
          links = updated;
          showStatus('removed');
          render();
          titleInput.focus();
        } catch (error) { showStatus(error.code || 'storage'); }
      });
      item.appendChild(anchor);
      item.appendChild(button);
      list.appendChild(item);
    });
    empty.hidden = links.length > 0;
    showStatus(statusKey);
  }

  function refresh() {
    try {
      links = readLinks(window.localStorage);
      showStatus('');
    } catch (error) { showStatus(error.code || 'storage'); }
    render();
  }

  form.addEventListener('submit', function (event) {
    // Inputs intentionally have no name attributes: native fallback must not put URLs in a request.
    event.preventDefault();
    try {
      var updated = addLink(window.localStorage, { title: titleInput.value, url: urlInput.value });
      links = updated;
      form.reset();
      showStatus('saved');
      render();
      titleInput.focus();
    } catch (error) { showStatus(error.code || 'storage'); }
  });
  window.addEventListener('storage', function (event) {
    if (event.key === storageKey || event.key === null) refresh();
  });
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.getElementById('personal-links-fields').disabled = false;
  panel.hidden = false;
  if (window.location.hash === '#personal-links') panel.open = true;
  window.addEventListener('hashchange', function () {
    if (window.location.hash === '#personal-links') panel.open = true;
  });
  refresh();
})();
