import { describe, expect, it } from 'vitest';
import { buildShareUrl, parseLaunchParams } from './launch';

describe('launch params', () => {
  it('defaults to the editor', () => {
    const p = parseLaunchParams('', '');
    expect(p).toMatchObject({ embed: false, boardUrl: null, pinSlug: null, at: null, readOnly: false });
  });

  it('reads embed, board, pin and view', () => {
    const p = parseLaunchParams(
      '?embed=1&board=https%3A%2F%2Fcdn.example.com%2Fb.json&pin=ha-noi-2',
      ''
    );
    expect(p).toMatchObject({
      embed: true,
      boardUrl: 'https://cdn.example.com/b.json',
      pinSlug: 'ha-noi-2',
      readOnly: true,
    });
    expect(parseLaunchParams('?at=120,-40,1.5', '').at).toEqual({ center: { x: 120, y: -40 }, zoom: 1.5 });
  });

  it('a board link alone is read-only, and #pin= still works', () => {
    expect(parseLaunchParams('?board=x.json', '').readOnly).toBe(true);
    expect(parseLaunchParams('', '#pin=idea').pinSlug).toBe('idea');
  });

  it('round-trips through buildShareUrl', () => {
    const url = buildShareUrl({
      baseUrl: 'https://draw.example.com/',
      boardUrl: 'https://cdn.example.com/b.json',
      pinSlug: 'idea-2',
      embed: true,
    });
    const u = new URL(url);
    const p = parseLaunchParams(u.search, u.hash);
    expect(p).toMatchObject({ embed: true, boardUrl: 'https://cdn.example.com/b.json', pinSlug: 'idea-2' });

    const view = buildShareUrl({ baseUrl: 'https://d/', at: { center: { x: 10.4, y: 20.6 }, zoom: 0.756 } });
    expect(view).toBe('https://d/?at=10%2C21%2C0.76');
    expect(parseLaunchParams(new URL(view).search, '').at).toEqual({ center: { x: 10, y: 21 }, zoom: 0.76 });
  });
});
