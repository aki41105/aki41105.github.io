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
      card.querySelector('.journal-category').textContent = labels[card.dataset.category][en ? 1 : 0];
      card.querySelector('.journal-read').textContent = en ? 'Read article ↗' : '記事を読む ↗';
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
    document.querySelector('.journal-heading h1').textContent = en ? 'Blog' : 'ブログ';
    document.querySelector('.journal-heading > p:last-child').textContent = en ? 'Readings, learning, and reflections on research, mathematics, technology, and society.' : '読んだこと、学んだこと、考えたこと。研究から数学、技術、社会の動きまで。';
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
