(function () {
  'use strict';
  var filters = Array.from(document.querySelectorAll('[data-filter]'));
  var cards = Array.from(document.querySelectorAll('.journal-card'));
  var labels = { all: ['すべて', 'All'], research: ['研究', 'Research'], math: ['数学／統計', 'Math / Statistics'], technology: ['技術／AI', 'Technology / AI'], society: ['社会分析', 'Society'], notes: ['お知らせ', 'Updates'] };
  var photos = document.querySelector('.journal-photos');
  function photoCount() {
    var en = document.documentElement.lang === 'en';
    document.querySelector('.photo-count').textContent = document.querySelectorAll('.journal-photo-card').length + (en ? ' records ' : '件 ') + (photos.open ? '−' : '＋');
  }
  photos.addEventListener('toggle', photoCount);
  function render() {
    photoCount();
    var en = document.documentElement.lang === 'en';
    var key = location.hash.slice(1);
    if (!labels[key] || key === 'notes') key = 'all';
    var count = 0;
    cards.forEach(function (card) {
      card.hidden = key !== 'all' && card.dataset.category !== key;
      if (!card.hidden) count++;
      var date = card.querySelector('time');
      var now = new Date();
      var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      var days = Math.floor((today - Date.parse(date.dateTime)) / 86400000);
      date.title = date.dateTime;
      date.textContent = days < 0 ? date.dateTime : days === 0 ? (en ? 'Today' : '今日') : en ? days + (days === 1 ? ' day ago' : ' days ago') : days + '日前';

    });
    filters.forEach(function (link) {
      var category = link.dataset.filter;
      var total = cards.filter(function (card) { return category === 'all' || card.dataset.category === category; }).length;
      link.textContent = labels[category][en ? 1 : 0] + ' ';
      var badge = document.createElement('span'); badge.textContent = total; link.appendChild(badge);
      if (category === key) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    document.querySelector('#journal-result-heading').textContent = key === 'all' ? (en ? 'All articles' : 'すべての記事') : labels[key][en ? 1 : 0];
    document.querySelector('#journal-count').textContent = count + (en ? (count === 1 ? ' article · Newest first' : ' articles · Newest first') : '件 · 新しい順');
    document.querySelector('.journal-empty').hidden = count > 0;
    document.querySelector('.journal-empty-title').textContent = en ? 'Articles are on the way' : '記事は準備中です';
    document.querySelector('.journal-empty-description').textContent = key === 'math' ? (en ? 'Notes on mathematics and statistics will appear here.' : '数学や統計の学習ノートを、ここにまとめていきます。') : (en ? 'Notes on AI and other technologies will appear here.' : 'AIやさまざまな技術の仕組み・発展を、ここにまとめていきます。');
    document.querySelector('.journal-reset').textContent = en ? 'View all articles →' : 'すべての記事を見る →';
    document.querySelector('.journal-about').textContent = en ? 'About the author →' : '自己紹介 →';
    document.querySelector('.journal-bio').textContent = en ? 'Reading research, learning mathematics, and thinking about technology and society. Notes from an ongoing learning journey.' : '研究を読み、数学を学び、技術と社会を考える。学びの途中のメモを残しています。';
  }
  document.querySelector('.journal-main').addEventListener('click', function (event) {
    var link = event.target.closest('[data-filter], .journal-reset');
    if (!link) return;
    event.preventDefault(); history.pushState(null, '', link.getAttribute('href')); render();
  });
  window.addEventListener('popstate', render);
  window.addEventListener('hashchange', render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  render();
}());
