export function validateTarget(ctx, target) {
  const binding = ctx.sessions.binding(target.sessionId);
  if (!binding || binding !== target.binding || binding.session.getSnapshot().subagent !== null) {
    throw new Error('原会话已关闭或当前会话不支持添加附件，请重新打开相册');
  }
  const input = ctx.conversation.input.for(binding.ctx);
  if (['adjudicating', 'submitting'].includes(input.state.getSnapshot().phase)) {
    throw new Error('原会话正在发送，请稍后重试');
  }
  return input;
}

export function attachFiles(ctx, target, files) {
  if (!files.length) throw new Error('没有可添加的媒体文件');
  const input = validateTarget(ctx, target);
  let drafts = [];
  try {
    drafts = ctx.conversation.createDrafts(target.sessionId, files, true);
    if (!input.addAttachments(drafts.map(draft => draft.id))) throw new Error('会话暂时无法接收附件，请稍后重试');
  } catch (error) {
    for (const draft of drafts) ctx.conversation.releaseDraftAttachment(draft.id);
    throw error;
  }
}
