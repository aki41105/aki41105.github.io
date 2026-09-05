const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const api = require('../personal-links.js');
const source = fs.readFileSync(path.join(__dirname, '../personal-links.js'), 'utf8');

function storage(initial = {}) {
  return {
    data: new Map(Object.entries(initial)),
    failRead: false,
    failWrite: false,
    getItem(key) {
      if (this.failRead) throw new Error('Blocked');
      return this.data.has(key) ? this.data.get(key) : null;
    },
    setItem(key, value) {
      if (this.failWrite) throw new Error('Quota exceeded');
      this.data.set(key, value);
    }
  };
}
const link = { title: 'Example account', url: 'https://example.com/account' };

test('normalizes valid HTTPS links and rejects unsafe schemes and credentials', () => {
  assert.deepEqual(api.normalizeLink({ title: ' Notes ', url: ' HTTPS://EXAMPLE.COM ' }), { title: 'Notes', url: 'https://example.com/' });
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/test', '//example.com', 'http://example.com', 'https://user:pass@example.com/', 'https://user@example.com/', 'https://example.com/\nsecret', 'not a URL']) {
    assert.throws(() => api.normalizeLink({ title: 'Test', url }), { code: 'invalid' });
  }
  for (const input of [null, {}, { title: '', url: link.url }, { title: 'x'.repeat(81), url: link.url }, { title: 'Test', url: 'https://example.com/' + 'x'.repeat(2048) }]) {
    assert.throws(() => api.normalizeLink(input), { code: 'invalid' });
  }
});

test('starts empty and persists, deduplicates, and removes only its own bookmarks', () => {
  const data = storage({ 'classical-lang': 'en', 'classical-theme': 'dark' });
  assert.deepEqual(api.readLinks(data), []);
  api.addLink(data, link);
  api.addLink(data, { title: 'Second', url: 'https://example.org/' });
  api.addLink(data, { title: 'Renamed', url: link.url });
  assert.equal(api.readLinks(data).length, 2);
  assert.equal(api.readLinks(data)[0].title, 'Renamed');
  api.removeLink(data, link.url);
  assert.deepEqual(api.readLinks(data), [{ title: 'Second', url: 'https://example.org/' }]);
  assert.equal(data.getItem('classical-lang'), 'en');
  assert.equal(data.getItem('classical-theme'), 'dark');
  api.removeLink(data, 'https://example.org/');
  assert.deepEqual(api.readLinks(data), []);
});

test('does not overwrite malformed or dangerous stored data', () => {
  for (const raw of ['broken', 'null', '{}', '[{}]', JSON.stringify([{ title: 'Bad', url: 'javascript:alert(1)' }]), JSON.stringify([null])]) {
    const data = storage({ [api.storageKey]: raw });
    assert.throws(() => api.readLinks(data), { code: 'corrupt' });
    assert.throws(() => api.addLink(data, link), { code: 'corrupt' });
    assert.throws(() => api.removeLink(data, link.url), { code: 'corrupt' });
    assert.equal(data.getItem(api.storageKey), raw);
  }
});

test('read and write failures preserve stored bookmarks', () => {
  const data = storage();
  api.addLink(data, link);
  const saved = data.getItem(api.storageKey);
  data.failWrite = true;
  assert.throws(() => api.addLink(data, { title: 'Second', url: 'https://example.org/' }), { code: 'storage' });
  assert.throws(() => api.removeLink(data, link.url), { code: 'storage' });
  assert.equal(data.getItem(api.storageKey), saved);
  data.failRead = true;
  assert.throws(() => api.readLinks(data), { code: 'storage' });
});

test('enforces a bounded collection without blocking an existing label update', () => {
  const data = storage();
  for (let index = 0; index < 50; index++) api.addLink(data, { title: String(index), url: `https://example.com/${index}` });
  assert.throws(() => api.addLink(data, link), { code: 'limit' });
  api.addLink(data, { title: 'Updated', url: 'https://example.com/0' });
  assert.equal(api.readLinks(data).length, 50);
});

function ui(data = storage()) {
  class Element {
    constructor(tag = 'div') { this.tagName = tag; this.children = []; this.attributes = {}; this.listeners = {}; this.textContent = ''; this.value = ''; }
    setAttribute(key, value) { this.attributes[key] = value; }
    getAttribute(key) { return this.attributes[key]; }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    replaceChildren() { this.children = []; }
    appendChild(element) { this.children.push(element); }
    focus() { this.focused = true; }
  }
  const ids = ['personal-links', 'personal-links-list', 'personal-links-empty', 'personal-links-status', 'personal-links-form', 'personal-link-title', 'personal-link-url', 'personal-links-fields'];
  const elements = Object.fromEntries(ids.map(id => [id, new Element()]));
  const heading = new Element('span');
  heading.setAttribute('data-personal-text', 'heading');
  elements['personal-links'].querySelectorAll = () => [heading];
  elements['personal-links-form'].reset = () => {
    elements['personal-link-title'].value = '';
    elements['personal-link-url'].value = '';
  };
  const document = { documentElement: { lang: 'ja' }, getElementById: id => elements[id], createElement: tag => new Element(tag) };
  const callbacks = {};
  const window = { localStorage: data, location: { hash: '#personal-links' }, confirm: () => true, addEventListener: (name, callback) => { callbacks[name] = callback; } };
  let languageChanged;
  class MutationObserver { constructor(callback) { languageChanged = callback; } observe() {} }
  vm.runInNewContext(source, { URL, document, window, MutationObserver });
  function submit(title, url) {
    elements['personal-link-title'].value = title;
    elements['personal-link-url'].value = url;
    let prevented = false;
    elements['personal-links-form'].listeners.submit({ preventDefault() { prevented = true; } });
    assert.ok(prevented, 'Form must never navigate or send bookmark fields');
  }
  return { elements, document, window, callbacks, submit, heading, languageChanged };
}

test('renders titles as inert text, restores saved links, and keeps a new browser empty', () => {
  const data = storage();
  const page = ui(data);
  const title = '<img src=x onerror=alert(1)> "日本語"';
  page.submit(title, link.url);
  const anchor = page.elements['personal-links-list'].children[0].children[0];
  assert.equal(anchor.tagName, 'a');
  assert.equal(anchor.textContent, title);
  assert.equal(anchor.children.length, 0);
  assert.equal(anchor.href, link.url);
  assert.equal(anchor.rel, 'noopener noreferrer');
  assert.equal(anchor.target, '_blank');
  assert.equal(page.elements['personal-link-title'].value, '');
  assert.equal(ui(data).elements['personal-links-list'].children.length, 1);
  assert.equal(ui().elements['personal-links-list'].children.length, 0);
});

test('failed UI writes retain both the visible list and unsaved form input', () => {
  const data = storage();
  api.addLink(data, link);
  const page = ui(data);
  data.failWrite = true;
  page.submit('Unsaved', 'https://example.org/');
  assert.equal(page.elements['personal-links-list'].children.length, 1);
  assert.equal(page.elements['personal-link-title'].value, 'Unsaved');
  assert.match(page.elements['personal-links-status'].textContent, /利用できません/);
  page.elements['personal-links-list'].children[0].children[1].listeners.click();
  assert.equal(page.elements['personal-links-list'].children.length, 1);
  assert.equal(api.readLinks(data).length, 1);
});

test('updates interface language without translating bookmarks or discarding form input', () => {
  const page = ui();
  page.submit('自分のメモ', link.url);
  page.elements['personal-link-title'].value = 'Draft';
  page.document.documentElement.lang = 'en';
  page.languageChanged();
  assert.equal(page.heading.textContent, 'Personal Links');
  assert.equal(page.elements['personal-links-list'].children[0].children[0].textContent, '自分のメモ');
  assert.equal(page.elements['personal-links-list'].children[0].children[1].textContent, 'Remove');
  assert.equal(page.elements['personal-links-status'].textContent, 'Saved in this browser.');
  assert.equal(page.elements['personal-link-title'].value, 'Draft');
});

test('cancellation preserves data, confirmed removal persists, and same-origin tabs refresh', () => {
  const data = storage();
  api.addLink(data, link);
  const page = ui(data);
  page.window.confirm = () => false;
  page.elements['personal-links-list'].children[0].children[1].listeners.click();
  assert.equal(api.readLinks(data).length, 1);
  page.window.confirm = () => true;
  page.elements['personal-links-list'].children[0].children[1].listeners.click();
  assert.equal(api.readLinks(data).length, 0);
  assert.equal(page.elements['personal-links-list'].children.length, 0);
  api.addLink(data, link);
  page.callbacks.storage({ key: api.storageKey });
  assert.equal(page.elements['personal-links-list'].children.length, 1);
});

test('public HTML has empty private controls and safe native-form fallback', () => {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const form = html.match(/<form id="personal-links-form"[\s\S]*?<\/form>/)[0];
  assert.doesNotMatch(form, /\bname\s*=/);
  assert.match(form, /<fieldset[^>]+disabled>/);
  assert.match(html, /<ul[^>]+id="personal-links-list"[^>]*><\/ul>/);
  assert.doesNotMatch(source, /innerHTML|outerHTML|\bfetch\(|XMLHttpRequest|sendBeacon|localStorage\.clear/);
});
