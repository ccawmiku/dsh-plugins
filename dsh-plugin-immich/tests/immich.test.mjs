import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { formatDuration } from '../src/media.mjs';
import { ImmichClient, durationSeconds } from '../src/immich.mjs';

async function server(t, handler) {
  const instance = createServer(handler);
  await new Promise(resolve => instance.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { instance.close(resolve); instance.closeAllConnections(); }));
  return 'http://127.0.0.1:' + instance.address().port;
}

const asset = id => ({ id, type: 'IMAGE', originalFileName: id + '.jpg' });

test('timeline uses supported DTO fields and explicit nextPage, including a full final page', async t => {
  const origin = await server(t, async (request, response) => {
    assert.equal(request.headers['x-api-key'], 'secret');
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks));
    assert.equal(request.url, '/api/search/metadata');
    assert.deepEqual(body, { page: 2, size: 2, visibility: 'timeline', withDeleted: false, withExif: true, order: 'desc' });
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ assets: { items: [asset('a'), asset('b')], total: 0, nextPage: null } }));
  });
  const client = new ImmichClient({ config: { immichUrl: origin + '/api/', apiKey: 'secret' } });
  const result = await client.getTimeline({ page: '2', size: '2' });
  assert.equal(result.page, 2);
  assert.equal(result.total, 0);
  assert.equal(result.hasMore, false);
});

test('smart pagination sends page, size and type and keeps an empty later page in smart mode', async t => {
  const bodies = [];
  const origin = await server(t, async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    bodies.push(JSON.parse(Buffer.concat(chunks)));
    assert.equal(request.url, '/api/search/smart');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ assets: { items: [], nextPage: null } }));
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'secret' } });
  const result = await client.search({ query: 'cats', page: 2, size: 3, type: 'video' });
  assert.equal(result.smartSearch, true);
  assert.equal(result.hasMore, false);
  assert.equal(bodies[0].page, 2);
  assert.equal(bodies[0].size, 3);
  assert.equal(bodies[0].type, 'VIDEO');
  assert.equal('clip' in bodies[0], false);
});

test('automatic search falls back when ML is disabled; filename mode bypasses ML', async t => {
  const paths = [];
  const origin = await server(t, async (request, response) => {
    paths.push(request.url);
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    if (request.url.endsWith('/smart')) { response.writeHead(400).end(); return; }
    const body = JSON.parse(Buffer.concat(chunks));
    assert.equal(body.originalFileName, 'IMG_123');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ assets: { items: [asset('match')], nextPage: '2' } }));
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'secret' } });
  const result = await client.search({ query: 'IMG_123' });
  assert.equal(result.mode, 'filename');
  assert.equal(result.hasMore, true);
  await client.search({ query: 'IMG_123', mode: 'filename', page: 2 });
  assert.deepEqual(paths, ['/api/search/smart', '/api/search/metadata', '/api/search/metadata']);
});

test('authorization failures are not hidden by legacy or filename fallbacks', async t => {
  const paths = [];
  const origin = await server(t, (request, response) => { paths.push(request.url); response.writeHead(403).end(); });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'secret' } });
  await assert.rejects(client.getTimeline(), /403/);
  await assert.rejects(client.search({ query: 'cat' }), /403/);
  assert.deepEqual(paths, ['/api/search/metadata', '/api/search/smart']);
});

test('connection test authenticates the stored key before accepting a public version response', async t => {
  const origin = await server(t, (request, response) => {
    if (request.url.includes('/search/')) { response.writeHead(401).end(); return; }
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ major: 2, minor: 0, patch: 0 }));
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'invalid' } });
  await assert.rejects(client.testConnection(), /401/);
});

test('connection test normalizes URL and supports 0.x version numbers', async t => {
  const origin = await server(t, (request, response) => {
    assert.equal(request.headers['x-api-key'], 'stored');
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(request.url.includes('/search/') ? { assets: { items: [] } } : { major: 0, minor: 99, patch: 1 }));
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'stored' } });
  assert.equal((await client.testConnection(origin.replace('http://', '') + '/api/')).version, '0.99.1');
});

test('redirects keep API keys on the configured origin', async t => {
  let leaked = false;
  const other = await server(t, (request, response) => { leaked = true; response.end(); });
  const origin = await server(t, (request, response) => {
    response.writeHead(302, { location: request.url.includes('external') ? other : '/api/image' }).end();
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'private-key' } });
  await assert.rejects(client.getOriginalResponse('external'), /其他服务器/);
  assert.equal(leaked, false);
});

test('same-origin thumbnail redirect succeeds without exposing credentials to the browser', async t => {
  const origin = await server(t, (request, response) => {
    assert.equal(request.headers['x-api-key'], 'private-key');
    if (request.url.includes('/thumbnail')) response.writeHead(302, { location: '/api/preview' }).end();
    else response.end('image');
  });
  const client = new ImmichClient({ config: { immichUrl: origin, apiKey: 'private-key' } });
  assert.equal(await (await client.getThumbnailResponse('image')).text(), 'image');
});

test('duration parsing uses Immich timestamps or milliseconds', () => {
  assert.equal(durationSeconds('00:01:02.500'), 62.5);
  assert.equal(durationSeconds(9334), 9.334);
  assert.equal(durationSeconds('100'), 0.1);
  assert.equal(durationSeconds('invalid'), 0);
  assert.equal(formatDuration(100), '00:00');
  assert.equal(formatDuration(9334), '00:09');
  assert.equal(formatDuration('01:02:03.400'), '1:02:03');
});
