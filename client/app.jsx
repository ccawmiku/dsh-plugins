import React, { useState, useEffect, useRef, useCallback } from 'react';
import { css } from './styles.js';
import { mentionQuery } from '../shared/chat.mjs';

const modes = [['auto', '自动选择'], ['native', '原视频直传'], ['frames', '抽帧 + 声音转写']];
export async function request(path, options) {
  const response = await fetch('/api/salon/' + path, { ...options, headers: { ...(options?.body instanceof File ? {} : { 'content-type': 'application/json' }), 'x-salon-client': '1', ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `请求失败 ${response.status}`);
  return data;
}
const act = body => request('action', { method: 'POST', body: JSON.stringify(body) });
const mediaURL = (id, part = 'poster') => '/api/salon/media?id=' + encodeURIComponent(id) + '&part=' + encodeURIComponent(part);
const clock = at => new Date(at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
const quantity = n => n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'k' : String(n);
function Avatar({ character, large = false }) {
  const avatar = character?.avatar || '✧';
  return <span className={'avatar' + (large ? ' large' : '')} style={{ '--role': character?.color }}>{/^https?:\/\//.test(avatar) ? <img src={avatar} alt={character?.name || ''} referrerPolicy="no-referrer" /> : avatar}</span>;
}
function Modal({ title, children, footer, close }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    const handle = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const elements = [...ref.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')];
        const first = elements[0], last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handle); ref.current.querySelector('button')?.focus();
    return () => { document.removeEventListener('keydown', handle); previous?.focus(); };
  }, []);
  return <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}><section ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title}><header className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="关闭" onClick={close}>×</button></header><div className="modal-body">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}</section></div>;
}
function Field({ label, note, children, full }) { return <label className={'field' + (full ? ' full' : '')}><span>{label}</span>{children}{note && <small>{note}</small>}</label>; }
function Toggle({ label, note, value, onChange }) { return <label className="toggle-field"><span><strong>{label}</strong>{note && <small>{note}</small>}</span><input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} /></label>; }
function ModelFields({ catalog, provider, model, set, prefix = '', inherited = false }) {
  const selected = catalog.find(p => p.id === provider);
  return <><Field label={prefix + '提供方'}><select value={provider} onChange={e => { set('provider', e.target.value); set('model', ''); }}><option value="">{inherited ? '沿用默认提供方' : '选择 DSH 提供方'}</option>{catalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label={prefix + '模型'} note="可从目录选择，也可直接输入模型 ID"><input value={model} onChange={e => set('model', e.target.value)} list={'salon-models-' + prefix + provider} placeholder={inherited ? '沿用默认模型' : '选择或输入模型'} /><datalist id={'salon-models-' + prefix + provider}>{selected?.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</datalist></Field></>;
}
function Settings({ snapshot, catalog, done, error, notify }) {
  const [form, setForm] = useState({ ...snapshot.settings });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const save = async () => { setSaving(true); try { await act({ action: 'settings', patch: form }); notify('沙龙设置已保存'); done(); } catch (e) { error(e.message); } finally { setSaving(false); } };
  const input = (key, type = 'text') => <input type={type} value={form[key]} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)} />;
  return <Modal title="沙龙设置" close={done} footer={<><button className="secondary" onClick={done}>取消</button><button className="primary" onClick={save} disabled={saving}>保存设置</button></>}>
    <h3 className="section-title">你和她们</h3><div className="form-grid"><Field label="沙龙名称">{input('title')}</Field><Field label="怎么称呼你">{input('userName')}</Field><Field label="你的设定" full note="性别、身份、与你们的关系都由你决定。"><textarea value={form.userPersona} onChange={e => set('userPersona', e.target.value)} placeholder="在这里介绍你自己，也可以先留空。" /></Field><ModelFields catalog={catalog} provider={form.defaultProvider} model={form.defaultModel} set={(k, v) => set(k === 'provider' ? 'defaultProvider' : 'defaultModel', v)} /></div>
    <h3 className="section-title">上下文与记忆</h3><div className="form-grid"><Field label="目标上下文（tokens）" note="默认 500,000；模型实际容量更小时按实际容量处理，界面标注估算值。">{input('contextTokens', 'number')}</Field><Field label="单次最大输出（tokens）">{input('maxOutputTokens', 'number')}</Field><Field label="开始整理旧对话的占用比例" note="0.85 表示达到可用预算的 85% 后整理，原始聊天永久保留。">{input('compressionTrigger', 'number')}</Field><p className="field">群聊会持续自然接话，由成员自己判断何时结束；你可以随时插话或停止。</p></div>
    <h3 className="section-title">一起看本地视频</h3><div className="form-grid"><Field label="默认视频方式"><select value={form.videoMode} onChange={e => set('videoMode', e.target.value)}>{modes.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></Field><Field label="抽帧间隔（秒）">{input('frameInterval', 'number')}</Field><Field label="最多画面帧数">{input('maxFrames', 'number')}</Field><Field label="画面宽度（像素）">{input('frameWidth', 'number')}</Field><Field label="Gemini 原生接口地址（可选）" note="默认从角色的 DSH 提供方读取；中转站必须支持原生 generateContent。">{input('nativeBaseURL')}</Field><Field label="DSH 凭据变量名（可选）" note="这里只填已保存的变量名，不能填密钥本身。">{input('nativeKeyRef')}</Field><ModelFields catalog={catalog} provider={form.videoProvider} model={form.videoModel} prefix="声音转写" inherited set={(k, v) => set(k === 'provider' ? 'videoProvider' : 'videoModel', v)} /></div>
    <Toggle label="抽帧时也转写声音" note="使用上面选定的 Gemini 通道；没有声音材料会明确标注，也可以给视频手动补字幕。" value={form.transcribeAudio} onChange={v => set('transcribeAudio', v)} /><Toggle label="允许视频直传失败后改用抽帧" note="默认关闭。开启后仍会在消息下方标注回退原因。" value={form.allowVideoFallback} onChange={v => set('allowVideoFallback', v)} />
    <h3 className="section-title">平时也想找你聊聊</h3><Toggle label="允许主动聊天" note="她们可以主动在群里接话或单独找你，不需要有新视频。宿主关闭时不会运行。" value={form.autoChat} onChange={v => set('autoChat', v)} /><div className="form-grid"><Field label="最短间隔（分钟）">{input('autoMinMinutes', 'number')}</Field><Field label="最长间隔（分钟）">{input('autoMaxMinutes', 'number')}</Field><Field label="主动私聊的概率（0–1）">{input('autoPrivateChance', 'number')}</Field><Field label="时区">{input('timezone')}</Field><Field label="安静时段开始（可留空）">{input('quietStart', 'time')}</Field><Field label="安静时段结束（可留空）">{input('quietEnd', 'time')}</Field></div>
  </Modal>;
}
function CharacterEditor({ character, catalog, done, error, notify }) {
  const [form, setForm] = useState({ ...character });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const save = async () => { setSaving(true); try { await act({ action: 'character', id: character.id, patch: form }); notify('她的设定已保存，之后的回复会使用新设定'); done(); } catch (e) { error(e.message); } finally { setSaving(false); } };
  return <Modal title={character.name + ' · 角色设定'} close={done} footer={<><button className="secondary" onClick={done}>取消</button><button className="primary" onClick={save} disabled={saving}>保存设定</button></>}><div className="form-grid"><Field label="名字"><input value={form.name} onChange={e => set('name', e.target.value)} /></Field><Field label="身份"><input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></Field><Field label="头像（表情或图片 URL）"><input value={form.avatar} onChange={e => set('avatar', e.target.value)} /></Field><Field label="代表色"><input type="color" value={form.color} onChange={e => set('color', e.target.value)} /></Field><Field label="完整人设" full note="人设始终保留在上下文中；自动整理记忆不会改写这里。"><textarea style={{ minHeight: 230 }} value={form.persona} onChange={e => set('persona', e.target.value)} /></Field><Field label="兴趣" full><input value={form.interests} onChange={e => set('interests', e.target.value)} /></Field><ModelFields catalog={catalog} provider={form.provider} model={form.model} set={set} prefix="角色" inherited /><Field label="看视频的方式"><select value={form.videoMode} onChange={e => set('videoMode', e.target.value)}><option value="inherit">沿用沙龙设置</option>{modes.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></Field><Field label="推理档位（模型支持的名称，可空）"><input value={form.reasoningEffort} onChange={e => set('reasoningEffort', e.target.value)} /></Field><Field label={'主动程度 · ' + form.initiative}><input type="range" min="0" max="1" step="0.05" value={form.initiative} onChange={e => set('initiative', Number(e.target.value))} /></Field><Field label="表达温度（0–2）"><input type="number" min="0" max="2" step="0.05" value={form.temperature} onChange={e => set('temperature', Number(e.target.value))} /></Field></div><Toggle label="参与沙龙" note="暂停参与会保留她的设定、记忆与私聊记录。" value={form.enabled} onChange={v => set('enabled', v)} /></Modal>;
}
function MemoryPanel({ snapshot, initialId, roomId, done, refresh, error, notify }) {
  const [id, setId] = useState(initialId || snapshot.characters[0].id), [tab, setTab] = useState('memory');
  const [draft, setDraft] = useState(null), [busy, setBusy] = useState(false);
  const character = snapshot.characters.find(c => c.id === id);
  const room = snapshot.room, summary = room.summaries?.find(s => s.id === room.summaryId);
  const [summaryDraft, setSummaryDraft] = useState(summary?.text || '');
  useEffect(() => setSummaryDraft(summary?.text || ''), [summary?.id]);
  async function doAction(body, message) { setBusy(true); try { await act(body); await refresh(); if (message) notify(message); } catch (e) { error(e.message); } finally { setBusy(false); } }
  const fresh = () => setDraft({ text: '', keys: '', scope: roomId === 'group' ? 'group' : `dm:${id}`, pinned: false });
  return <Modal title="记忆、日记与故事" close={done} footer={<><button className="secondary" disabled={busy} onClick={() => doAction({ action: 'compact', roomId }, '本会话的旧对话已整理；原文仍保留')}>整理本会话摘要</button><a className="secondary" href="/api/salon/export" download>导出全部记录</a></>}><div className="tabs">{[['memory', '她的记忆'], ['diary', '她的日记'], ['summary', '本会话摘要']].map(([v, t]) => <button key={v} className={tab === v ? 'active' : ''} onClick={() => setTab(v)}>{t}</button>)}</div>{tab !== 'summary' && <select aria-label="选择角色" value={id} onChange={e => { setId(e.target.value); setDraft(null); }}>{snapshot.characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
    {tab === 'memory' && <><div style={{ marginTop: 15 }}><button className="secondary" onClick={fresh}>＋ 添加记忆 / 世界设定</button></div>{draft && <div className="form-grid" style={{ marginTop: 18 }}><Field label="记忆正文" full><textarea value={draft.text} onChange={e => setDraft({ ...draft, text: e.target.value })} /></Field><Field label="记忆范围"><select value={draft.scope} onChange={e => setDraft({ ...draft, scope: e.target.value })}><option value="group">公开经历，可在群里提起</option><option value={`dm:${id}`}>私密，只在你们私聊时使用</option></select></Field><Field label="唤起关键词（逗号分隔）"><input value={draft.keys} onChange={e => setDraft({ ...draft, keys: e.target.value })} /></Field><div className="full"><Toggle label="始终记住" value={draft.pinned} onChange={v => setDraft({ ...draft, pinned: v })} /><button className="primary" disabled={busy} onClick={async () => { await doAction({ action: 'memory', characterId: id, ...draft }, '记忆已保存'); setDraft(null); }}>保存这条记忆</button></div></div>}
    {[...character.memories].sort((a, b) => b.at - a.at).map(m => <article className="memory-entry" key={m.id}><div className="memory-tags"><span>{m.scope === 'group' ? '公开经历' : '仅你们私聊'}{m.pinned ? ' · 常驻' : ''}</span><span>{clock(m.at)}</span></div><p>{m.text}</p>{m.keys?.length > 0 && <small>关键词：{m.keys.join('、')}</small>}<div className="memory-actions"><button onClick={() => setDraft({ ...m, keys: (m.keys || []).join('，') })}>编辑</button><button disabled={busy} onClick={() => { if (confirm('删除这条记忆？原聊天记录会保留。')) doAction({ action: 'memory', characterId: id, id: m.id, remove: true }); }}>删除</button></div><details><summary>来源记录</summary><small>{m.sourceIds?.length ? m.sourceIds.join(' / ') : '你手动添加的设定'}</small></details></article>)}{!character.memories.length && <p className="empty-small">一起聊过之后，她会慢慢记住值得留下的事情。</p>}</>}
    {tab === 'diary' && <>{[...character.diaries].reverse().map(d => <article className="memory-entry" key={d.id}><div className="memory-tags">{d.scope === 'group' ? '群聊之后' : '私聊之后'} · {clock(d.at)}</div><p>{d.text}</p></article>)}{!character.diaries.length && <p className="empty-small">她的第一篇日记还没写下。</p>}</>}
    {tab === 'summary' && <><p style={{ color: '#9f91aa', fontSize: 12, marginBottom: 15 }}>旧对话接近上下文预算时才会整理。人设、相关长期记忆和最近原文分别保留；摘要可以编辑、回退。</p>{summary ? <><textarea aria-label="当前摘要" style={{ minHeight: 260 }} value={summaryDraft} onChange={e => setSummaryDraft(e.target.value)} /><div className="card-actions" style={{ marginTop: 12 }}><button disabled={busy} onClick={() => doAction({ action: 'summary', roomId, text: summaryDraft }, '摘要已保存')}>保存摘要</button><button disabled={busy} onClick={() => doAction({ action: 'summary', roomId, restore: true }, '已回退到上一版摘要')}>回退上一版</button></div><small>{room.summaries.length} 个版本 · 当前整理至消息 {summary.throughId}</small></> : <p className="empty-small">上下文还很充足，目前保留完整原文。</p>}{snapshot.contextMetrics.map(m => <p className="inline-stat" key={m.characterId}>{snapshot.characters.find(c => c.id === m.characterId)?.name}：输入约 {quantity(m.estimatedInput)} / 可用 {quantity(m.budget)} tokens；目标 {quantity(m.target)}，模型上限 {m.modelLimit ? quantity(m.modelLimit) : '未披露'}，视频预留 {quantity(m.mediaReserve)}</p>)}</>}
  </Modal>;
}

export function SalonApp({ demo = false }) {
  const [snapshot, setSnapshot] = useState(null), [catalog, setCatalog] = useState([]), [roomId, setRoomId] = useState('group');
  const [drafts, setDrafts] = useState({}), [attachments, setAttachments] = useState({}), [all, setAll] = useState(false);
  const [modal, setModal] = useState(null), [error, setError] = useState(''), [toast, setToast] = useState(''), [uploading, setUploading] = useState(false), [older, setOlder] = useState([]), [sending, setSending] = useState(false);
  const [readAt, setReadAt] = useState(() => { try { return JSON.parse(localStorage.getItem('dsh-salon-read-at') || '{}'); } catch { return {}; } });
  const [mention, setMention] = useState(null), [mentionIndex, setMentionIndex] = useState(0);
  const chatInput = useRef();
  const scroll = useRef(), fileInput = useRef(), roomRef = useRef(roomId), sticky = useRef(true), toastTimer = useRef();
  roomRef.current = roomId;
  const notify = value => { setToast(value); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4000); };
  const refresh = useCallback(async () => {
    const id = roomRef.current;
    const next = await request('state?room=' + encodeURIComponent(id));
    if (id === roomRef.current) setSnapshot(next);
  }, []);
  useEffect(() => {
    let mounted = true, timer;
    const poll = async () => { try { if (mounted) await refresh(); } catch (e) { if (mounted) setError(e.message); } finally { if (mounted) timer = setTimeout(poll, 900); } };
    poll(); request('catalog').then(v => { if (mounted) setCatalog(v); }).catch(e => { if (mounted) setError(e.message); });
    return () => { mounted = false; clearTimeout(timer); clearTimeout(toastTimer.current); };
  }, []);
  const changeRoom = id => { setRoomId(id); roomRef.current = id; setOlder([]); setError(''); setMention(null); sticky.current = true; refresh().catch(e => setError(e.message)); };
  useEffect(() => { if (sticky.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight; }, [snapshot?.revision, roomId, older.length]);
  const setDraft = value => setDrafts(d => ({ ...d, [roomId]: value }));
  const closeModal = () => { setModal(null); refresh().catch(e => setError(e.message)); };
  const selected = attachments[roomId];
  const current = snapshot?.characters.find(c => `dm:${c.id}` === roomId);
  const job = snapshot?.jobs.find(j => j.roomId === roomId);
  const configured = snapshot && (snapshot.settings.defaultProvider && snapshot.settings.defaultModel || snapshot.characters.some(c => c.provider && c.model));
  async function send() {
    if (sending || (job && roomId !== 'group')) return;
    setSending(true); setError('');
    const id = roomId, text = drafts[id] || '', video = attachments[id];
    try {
      await act({ action: 'send', roomId: id, text, mediaIds: video ? [video.id] : [], all });
      setMention(null);
      setDrafts(d => ({ ...d, [id]: '' })); setAttachments(a => ({ ...a, [id]: null })); sticky.current = true; await refresh();
    } catch (e) { setError(e.message); } finally { setSending(false); }
  }
  async function upload(file) {
    if (!file) return;
    const targetRoom = roomRef.current;
    setUploading(true); setError('');
    try { const video = await request('upload?name=' + encodeURIComponent(file.name), { method: 'POST', body: file }); setAttachments(a => ({ ...a, [targetRoom]: video })); await refresh(); notify('视频已加入资料库，发送后她们才会观看'); }
    catch (e) { setError(e.message); } finally { setUploading(false); }
  }
  async function doAct(body) { try { await act(body); await refresh(); } catch (e) { setError(e.message); } }
  const characters = snapshot?.characters || [];
  const mentionCandidates = !mention || modal ? [] : [
    ...(roomId === 'group' ? [{ id: 'everyone', name: '全体', subtitle: '请所有可用成员先回应', avatar: '✦' }] : []),
    ...characters.filter(c => c.enabled && (roomId === 'group' || roomId === `dm:${c.id}`)),
  ].filter(c => (c.name + c.subtitle).toLowerCase().includes(mention.query.toLowerCase()));
  const syncMention = (value, caret) => { setMention(mentionQuery(value, caret)); setMentionIndex(0); };
  function insertMention(character) {
    if (!mention) return;
    const value = drafts[roomId] || '';
    const inserted = '@' + character.name + ' ';
    setDraft(value.slice(0, mention.start) + inserted + value.slice(mention.end));
    const caret = mention.start + inserted.length;
    setMention(null);
    requestAnimationFrame(() => { chatInput.current?.focus(); chatInput.current?.setSelectionRange(caret, caret); });
  }
  function openMentions() {
    const value = drafts[roomId] || '', start = chatInput.current?.selectionStart ?? value.length, end = chatInput.current?.selectionEnd ?? start;
    // A separating space keeps the mention distinct from emails and ordinary text.
    const prefix = value.slice(0, start), added = prefix && !/[\s，。！？、：:；;]$/.test(prefix) ? ' @' : '@';
    const next = prefix + added + value.slice(end), caret = start + added.length;
    setDraft(next); setMention({ start: caret - 1, end: caret, query: '' }); setMentionIndex(0);
    requestAnimationFrame(() => { chatInput.current?.focus(); chatInput.current?.setSelectionRange(caret, caret); });
  }
  function chatKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (mention && mentionCandidates.length) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setMentionIndex(i => (i + (event.key === 'ArrowDown' ? 1 : -1) + mentionCandidates.length) % mentionCandidates.length); return; }
      if (event.key === 'Enter' && !event.shiftKey || event.key === 'Tab') { event.preventDefault(); insertMention(mentionCandidates[mentionIndex % mentionCandidates.length]); return; }
      if (event.key === 'Escape') { event.preventDefault(); setMention(null); return; }
    }
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
  }
  useEffect(() => {
    if (!snapshot || snapshot.room.id !== roomId || document.visibilityState !== 'visible') return;
    const at = snapshot.room.messages.at(-1)?.at || 0;
    if (at > (readAt[roomId] || 0)) setReadAt(previous => {
      const next = { ...previous, [roomId]: at }; try { localStorage.setItem('dsh-salon-read-at', JSON.stringify(next)); } catch {} return next;
    });
  }, [snapshot?.room.id, snapshot?.room.messages.at(-1)?.id, roomId]);
  const unread = id => (snapshot?.rooms.find(r => r.id === id)?.lastAt || 0) > (readAt[id] || 0);
  const messages = snapshot ? [...older.filter(m => !snapshot.room.messages.some(n => n.id === m.id)), ...snapshot.room.messages] : [];
  const messageView = (m, partial = false) => {
    const c = characters.find(c => c.id === m.speaker), user = m.speaker === 'user';
    return <article key={m.id} className={'message' + (user ? ' user' : '') + (m.error ? ' error' : '') + (partial ? ' typing' : '') + (m.speaker === 'system' ? ' system' : '')}>
      <button className="icon-button" style={{ padding: 0 }} aria-label={c ? '私聊' + c.name : '用户'} onClick={() => { if (c) changeRoom('dm:' + c.id); }}><Avatar character={c || { avatar: user ? '你' : '!' }} /></button><div style={{ minWidth: 0 }}><div className="meta"><span style={{ color: c?.color }}>{user ? snapshot.settings.userName : c?.name || '沙龙提示'}</span><time>{partial ? '正在输入' : clock(m.at)}</time>{m.automatic && <span>主动找你</span>}</div><div className="bubble">{m.mediaIds?.map(id => { const v = snapshot.media.find(v => v.id === id); return v && <button key={id} className="chat-video" onClick={() => setModal({ type: 'video', id })}><img src={mediaURL(id)} alt={v.name} /><span>▷ {v.name} · {Math.round(v.duration)}s</span></button>; })}{m.text || <span className="typing-dots">···</span>}</div>{m.transport && <div className="transport">{m.transport.mode === 'native' ? '◈ 原视频直传 · ' + (m.transport.audio || '原视频') : `▧ ${m.transport.frames} 帧 · ${m.transport.audio}`}{m.transport.fallbackReason && <details><summary>直传失败后已回退</summary>{m.transport.fallbackReason}</details>}{m.transport.warning && <details><summary>声音材料未完整提供</summary>{m.transport.warning}</details>}</div>}{m.retry && <button className="memory-link" onClick={() => doAct({ action: 'send', roomId, text: '请重新回应刚才的消息。', characterId: m.retry.characterId, mediaIds: m.retry.mediaIds })}>重试这位角色</button>}</div>
    </article>;
  };
  return <div className="salon" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!modal) upload(e.dataTransfer.files[0]); }}><style>{css}</style>{!snapshot ? <div className="loading">{error || '正在推开沙龙的门…'}</div> : <>
    <nav className="rail" aria-label="沙龙会话"><div className="brand"><span className="brand-mark">✦</span><h1>{snapshot.settings.title}</h1><p>THE LITTLE SALON</p></div><div className="nav-label">SHARED MOMENTS</div><button className={'room-button' + (roomId === 'group' ? ' active' : '')} onClick={() => changeRoom('group')}><Avatar character={{ avatar: '✦', color: '#d3b3d6' }} /><span className="room-text"><strong>沙龙客厅</strong><small>大家都在这里</small></span>{unread('group') && <span className="room-dot" />}</button><div className="nav-label">JUST BETWEEN US</div>{characters.map(c => <button key={c.id} className={'room-button' + (roomId === 'dm:' + c.id ? ' active' : '')} onClick={() => changeRoom('dm:' + c.id)}><Avatar character={c} /><span className="room-text"><strong>{c.name}</strong><small>{c.subtitle}</small></span>{(snapshot.jobs.some(j => j.roomId === 'dm:' + c.id) || unread('dm:' + c.id)) && <span className="room-dot" />}</button>)}<div className="nav-footer"><button className="subtle" onClick={() => setModal({ type: 'library' })}>▧ <span className="nav-text">视频资料库</span></button><button className="subtle" onClick={() => setModal({ type: 'memory', id: current?.id })}>◇ <span className="nav-text">记忆与日记</span></button><button className="subtle" onClick={() => setModal({ type: 'settings' })}>⚙ <span className="nav-text">沙龙设置</span></button></div></nav>
    <main className="main">{demo && <div className="demo-banner">演示模式 · 回复为测试样例，不连接真实模型</div>}<header className="topbar"><div><h2>{current ? '与' + current.name + '的私语' : '沙龙客厅'}</h2><p>{current ? '只有你和她知道的那些事。' : `${characters.filter(c => c.enabled).length} 位成员 · 想说什么，就说什么。`}</p></div><div className="top-actions"><span className="pill">{quantity(snapshot.settings.contextTokens)} 上下文</span><button className={'pill' + (snapshot.settings.autoChat ? ' on' : '')} onClick={() => doAct({ action: 'settings', patch: { autoChat: !snapshot.settings.autoChat } })}>{snapshot.settings.autoChat ? '● 自由聊天中' : '○ 主动聊天已暂停'}</button><button className="icon-button" aria-label={current ? '编辑角色' : '沙龙设置'} onClick={() => setModal(current ? { type: 'character', id: current.id } : { type: 'settings' })}>⚙</button></div></header>
    <div className="chat-scroll" ref={scroll} onScroll={() => { const el = scroll.current; sticky.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; }}>
      {!configured && <div className="onboarding"><span>她们已来到沙龙。选好 DSH 模型，就可以开始认识彼此。</span><button className="primary" onClick={() => setModal({ type: 'settings' })}>选择模型</button></div>}
      {snapshot.room.count > messages.length && <button className="secondary load-history" onClick={async () => { sticky.current = false; try { const records = await request('history?room=' + encodeURIComponent(roomId) + '&before=' + messages[0].id); setOlder(v => [...records, ...v]); } catch (e) { setError(e.message); } }}>翻看更早的聊天</button>}
      {!messages.length && <section className="empty"><div className="eyebrow">A LITTLE TIME TOGETHER</div><h2>{current ? current.name + '正在等你' : '四个人，一间客厅，还有你。'}</h2><p>{current ? '这里的对话与记忆，会留在你们之间。' : '分享一段视频，聊一件小事。\n让熟悉从今天的一句话开始。'}</p><div className="portraits">{(current ? [current] : characters).map(c => <button key={c.id} title={'与' + c.name + '私聊'} onClick={() => changeRoom('dm:' + c.id)}><Avatar character={c} large /></button>)}</div><div className="prompts">{['今天大家都在做什么？', '先来互相认识一下吧', '给我讲一件有趣的小事'].map(t => <button className="chip" key={t} onClick={() => setDraft(t)}>{t}</button>)}</div></section>}
      {messages.map(m => messageView(m))}{job && Object.entries(job.partials).map(([id, p]) => messageView({ id: 'partial-' + id, speaker: id, text: p.text, at: Date.now() }, true))}{job?.phase === '整理自己的记忆' && <p className="inline-stat">她们在写下刚才值得记住的事情…</p>}
    </div>{error && <div className="alert" role="alert"><span style={{ flex: 1 }}>{error}</span><button className="icon-button" aria-label="关闭提示" onClick={() => setError('')}>×</button></div>}
    <div className="composer-wrap">{mentionCandidates.length > 0 && <div id="salon-mentions" className="mention-menu" role="listbox" aria-label="点名成员">{mentionCandidates.map((c, i) => <button key={c.id} type="button" role="option" aria-selected={i === mentionIndex % mentionCandidates.length} className={i === mentionIndex % mentionCandidates.length ? 'selected' : ''} onMouseDown={e => e.preventDefault()} onClick={() => insertMention(c)}><Avatar character={c} /><span><strong>@{c.name}</strong><small>{c.subtitle}</small></span></button>)}<small className="mention-hint">↑↓ 选择 · Enter / Tab 插入 · Esc 关闭</small></div>}<div className="composer">{selected && <div className="attachment-strip">▧ {selected.name}<button className="icon-button" aria-label="移除待发视频" onClick={() => setAttachments(a => ({ ...a, [roomId]: null }))}>×</button></div>}<textarea ref={chatInput} aria-label="聊天消息" aria-autocomplete="list" aria-controls={mentionCandidates.length ? 'salon-mentions' : undefined} aria-expanded={Boolean(mentionCandidates.length)} placeholder={uploading ? '正在把视频放进沙龙…' : current ? '悄悄和' + current.name + '说点什么…' : '和大家说点什么，或拖入一段视频…'} value={drafts[roomId] || ''} onChange={e => { setDraft(e.target.value); syncMention(e.target.value, e.target.selectionStart); }} onClick={e => syncMention(e.currentTarget.value, e.currentTarget.selectionStart)} onKeyDown={chatKeyDown} /><div className="composer-tools"><button className="icon-button" aria-label="点名成员" onClick={openMentions}>@</button><button className="icon-button" aria-label="添加本地视频" disabled={uploading} onClick={() => fileInput.current.click()}>＋</button><button className="icon-button" aria-label="唤醒一位角色" disabled={Boolean(job)} onClick={() => doAct({ action: 'wake', roomId })}>✦</button>{roomId === 'group' && <label className="check-inline"><input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />都说两句</label>}<span className="spacer" />{job && <button className="danger" onClick={() => doAct({ action: 'stop', roomId })}>停止</button>}<button className="primary" disabled={sending || uploading || Boolean(job && roomId !== 'group') || (!(drafts[roomId] || '').trim() && !selected)} onClick={send}>{job && roomId === 'group' ? '插话 ↗' : '发送 ↗'}</button></div></div><div className="composer-note"><span>{job ? job.phase : current ? '独立私聊 · 私密记忆不会自动进入群聊' : 'Enter 发送 · Shift + Enter 换行 · @名字点名'}</span><span>{snapshot.settings.videoMode === 'native' ? '原视频直传' : snapshot.settings.videoMode === 'frames' ? '抽帧 + 声音转写' : '两种视频通道均可用'}</span></div></div><input ref={fileInput} type="file" accept="video/*,.mkv,.m4v" hidden onChange={e => { upload(e.target.files[0]); e.target.value = ''; }} /></main>
    <aside className="aside"><div className="aside-label">在这里的她们</div>{characters.map(c => <article className="character-card" key={c.id}><div className="character-row"><Avatar character={c} /><div><strong>{c.name}</strong><small>{c.subtitle}</small></div></div><p>{c.interests || '还在等待自己的故事。'}</p><div className="card-actions"><button onClick={() => changeRoom('dm:' + c.id)}>私下聊聊</button><span style={{ color: '#504458' }}>·</span><button onClick={() => setModal({ type: 'character', id: c.id })}>角色设定</button><span style={{ color: '#504458' }}>·</span><button onClick={() => setModal({ type: 'memory', id: c.id })}>记忆</button></div></article>)}<button className="memory-link" style={{ marginTop: 16 }} onClick={async () => { try { const v = await act({ action: 'add-character' }); await refresh(); setModal({ type: 'character', id: v.id }); } catch (e) { setError(e.message); } }}>＋ 邀请新成员</button><p className="aside-note">她们记得共同的经历，<br />也各自珍藏与你的私语。</p><div className="status-row">下一次主动聊天<br />{snapshot.settings.autoChat && configured ? clock(snapshot.nextAutoAt) : '等待开启或选择模型'}</div>{snapshot.activity.at(-1) && <details style={{ marginTop: 15 }}><summary className="inline-stat">最近运行提示</summary>{snapshot.activity.slice(-5).map((a, i) => <p key={i} className="inline-stat">{a.text}</p>)}</details>}</aside>
    {modal?.type === 'settings' && <Settings snapshot={snapshot} catalog={catalog} done={closeModal} error={setError} notify={notify} />}
    {modal?.type === 'character' && characters.find(c => c.id === modal.id) && <CharacterEditor key={modal.id} character={characters.find(c => c.id === modal.id)} catalog={catalog} done={closeModal} error={setError} notify={notify} />}
    {modal?.type === 'memory' && <MemoryPanel snapshot={snapshot} initialId={modal.id} roomId={roomId} done={closeModal} refresh={refresh} error={setError} notify={notify} />}
    {modal?.type === 'library' && <Modal title="视频资料库" close={closeModal}><p style={{ color: '#a394ae', fontSize: 12, marginBottom: 18 }}>只观看你放进来的本地视频。选择后，还可以加一句想对她们说的话。</p><button className="secondary" disabled={uploading} onClick={() => fileInput.current.click()}>{uploading ? '正在导入…' : '＋ 导入本地视频'}</button><div className="video-library" style={{ marginTop: 18 }}>{snapshot.media.map(v => <article className="video-tile" key={v.id}><img src={mediaURL(v.id)} alt={v.name} /><div className="content"><h3>{v.name}</h3><p>{Math.round(v.duration)} 秒 · {v.width}×{v.height}</p><button className="secondary" onClick={() => setModal({ type: 'video', id: v.id })}>查看</button><button className="primary" onClick={() => { setAttachments(a => ({ ...a, [roomId]: v })); closeModal(); }}>一起看</button></div></article>)}</div>{!snapshot.media.length && <p className="empty-small">还没有视频。拖进来或点击上方导入。</p>}</Modal>}
    {modal?.type === 'video' && <VideoPanel video={snapshot.media.find(v => v.id === modal.id)} done={closeModal} error={setError} notify={notify} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </>}</div>;
}

function VideoPanel({ video, done, error, notify }) {
  const [notes, setNotes] = useState(video?.notes || '');
  return <Modal title={video?.name || '视频'} close={done} footer={<button className="primary" onClick={async () => { try { await act({ action: 'transcript', id: video.id, text: notes }); notify('字幕与备注已保存'); done(); } catch (e) { error(e.message); } }}>保存字幕与备注</button>}><video controls src={mediaURL(video.id, 'original')} poster={mediaURL(video.id)} /><Field label="字幕 / 声音描述 / 备注" note="可直接粘贴 SRT、VTT 或文字。抽帧模式优先使用这里的材料。"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="可留空，抽帧时尝试从音轨转写。" /></Field></Modal>;
}
