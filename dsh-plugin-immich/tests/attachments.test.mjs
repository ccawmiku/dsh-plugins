import test from 'node:test';
import assert from 'node:assert/strict';
import { attachFiles, validateTarget } from '../client/attachments.mjs';

function fixture({ phase = 'idle', subagent = null, accept = true } = {}) {
  const binding = { ctx: {}, session: { getSnapshot: () => ({ subagent }) } };
  const calls = [], released = [];
  const shell = {
    state: { getSnapshot: () => ({ phase }) },
    addAttachments: ids => { calls.push(ids); return accept; }
  };
  const ctx = {
    sessions: { binding: () => binding },
    conversation: {
      input: { for: () => shell },
      createDrafts: (id, files, inline) => { calls.push([id, files, inline]); return files.map((file, i) => ({ id: 'draft-' + i })); },
      releaseDraftAttachment: id => released.push(id)
    }
  };
  return { ctx, target: { sessionId: 'original-session', binding }, calls, released };
}

test('native upload adds every file to the captured session using forced inline drafts', () => {
  const { ctx, target, calls } = fixture();
  const files = [{ name: 'photo.jpg' }, { name: 'video.mp4' }];
  attachFiles(ctx, target, files);
  assert.deepEqual(calls, [['original-session', files, true], ['draft-0', 'draft-1']]);
});

test('native upload releases all created drafts when the composer rejects attachments', () => {
  const { ctx, target, released } = fixture({ accept: false });
  assert.throws(() => attachFiles(ctx, target, [{}, {}]), /无法接收附件/);
  assert.deepEqual(released, ['draft-0', 'draft-1']);
});

test('native upload does not allocate drafts for stale, busy or subagent sessions', () => {
  for (const options of [{ phase: 'submitting' }, { phase: 'adjudicating' }, { subagent: {} }]) {
    const { ctx, target, calls } = fixture(options);
    assert.throws(() => attachFiles(ctx, target, [{}]));
    assert.equal(calls.length, 0);
  }
  const { ctx, target } = fixture();
  ctx.sessions.binding = () => ({ ...target.binding });
  assert.throws(() => validateTarget(ctx, target), /原会话已关闭/);
});
