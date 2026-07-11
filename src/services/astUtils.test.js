import { describe, it, expect } from 'vitest';
import { toHTML } from './astUtils';

describe('toHTML XSS hardening', () => {
  it('escapes the img src attribute to prevent breakout', () => {
    const out = toHTML([{ type: 'img', content: 'x" onerror="alert(1)' }]);
    // The double quote is escaped, so onerror stays inside the src value.
    expect(out).not.toMatch(/onerror="alert/);
    expect(out).toContain('&quot;');
  });

  it('drops dangerous URL schemes in img src', () => {
    const out = toHTML([{ type: 'img', content: 'javascript:alert(1)' }]);
    expect(out).not.toContain('javascript:');
  });

  it('never emits a tag for an unknown/untrusted node type', () => {
    const out = toHTML([{ type: 'script', content: 'alert(1)' }]);
    expect(out).not.toMatch(/<script/i);
  });

  it('neutralizes </style> breakout inside style content', () => {
    const out = toHTML([{ type: 'style', content: '</style><img src=x onerror=alert(1)>' }]);
    expect(out).not.toMatch(/<\/style>\s*<img/i);
  });

  it('escapes text content of leaf tags', () => {
    const out = toHTML([{ type: 'h1', content: '<b>hi</b>' }]);
    expect(out).toContain('&lt;b&gt;hi&lt;/b&gt;');
  });

  it('renders valid containers and http image sources', () => {
    const out = toHTML([{ type: 'body', children: [{ type: 'img', content: 'https://ex.com/a.png' }] }]);
    expect(out).toContain('<body>');
    expect(out).toContain('src="https://ex.com/a.png"');
  });

  it('renders text content of list items and spans (bukan hilang)', () => {
    const out = toHTML([
      { type: 'ul', children: [{ type: 'li', content: 'Item Satu' }] },
      { type: 'span', content: 'teks span' },
    ]);
    expect(out).toContain('<li>Item Satu</li>');
    expect(out).toContain('<span>teks span</span>');
  });

  it('renders text before children in a container (mis. section berlabel)', () => {
    const out = toHTML([{ type: 'section', content: 'Judul Bagian', children: [{ type: 'p', content: 'isi' }] }]);
    expect(out).toContain('<section>Judul Bagian<p>isi</p></section>');
  });

  it('renders new leaf & void tags: blockquote, code, hr, br', () => {
    const out = toHTML([
      { type: 'blockquote', content: 'kutipan' },
      { type: 'code', content: "x=1" },
      { type: 'hr' },
      { type: 'br' },
    ]);
    expect(out).toContain('<blockquote>kutipan</blockquote>');
    expect(out).toContain('<code>x=1</code>');
    expect(out).toContain('<hr />');
    expect(out).toContain('<br />');
  });
});
