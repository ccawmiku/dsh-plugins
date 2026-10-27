import { createElement as h, useEffect, useRef } from 'react'
import { ConfigPanel } from './settings.js'

const NS = 'videoInput'
const zh = {add:'添加视频',description:'上传多个视频，随问题一起发送给当前模型',invalid:'请选择 MP4、MOV、WebM、MKV、AVI、MPEG、3GP 或 WMV 视频。',unavailable:'当前对话暂时无法添加视频，请等待发送完成后重试。',failure:'视频未能加入附件区，请重试。'}
const en = {add:'Add videos',description:'Attach multiple videos to the current model',invalid:'Choose MP4, MOV, WebM, MKV, AVI, MPEG, 3GP or WMV videos.',unavailable:'This conversation cannot accept videos now. Try again after submission.',failure:'Could not attach the videos. Please try again.'}
export const inject = ['slots','commandUi','conversation','sessions','locale']
const extensions = /\.(mp4|m4v|mov|webm|mkv|avi|mpeg|mpg|3gp|wmv)$/i

export function VideoIcon({size=16}) {
  return h('svg',{viewBox:'0 0 24 24',width:size,height:size,fill:'none',stroke:'currentColor',strokeWidth:1.6,'aria-hidden':true},
    h('rect',{x:3,y:6,width:12,height:12,rx:3}),h('path',{d:'m15 10 6-4v12l-6-4M7 10l4 2-4 2z'}))
}

/** Keep native upload cards, progress, removal and retries; only the picker is contributed. */
export function apply(ctx) {
  const pickers = new Map()
  ctx.effect(() => ctx.locale.register(NS,{zh,en}))
  const t = ctx.locale.bind(NS)
  const bindings = () => ctx.get('sessions')
  function VideoPicker({useSession}) {
    const id = useSession(session => session?.sessionId)
    const input = useRef(null), selectedBinding = useRef(null)
    useEffect(() => {
      if (!id) return
      const open = () => { selectedBinding.current = bindings().binding(id); input.current?.click() }
      pickers.set(id,open)
      return () => { if (pickers.get(id) === open) pickers.delete(id) }
    },[id])
    const onChange = event => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      const binding = selectedBinding.current
      if (!binding || binding !== bindings().binding(id) || !files.length) return
      const conversation = ctx.get('conversation')
      const shell = conversation.input.for(binding.ctx)
      if (files.some(file => !extensions.test(file.name))) { shell.notify('error',t('invalid')); return }
      let drafts
      try {
        // Use the verified ConversationController upload API instead of Desktop's path-chip intake.
        drafts = conversation.createDrafts(id,files,true)
        if (!shell.addAttachments(drafts.map(draft => draft.id))) {
          for (const draft of drafts) conversation.releaseDraftAttachment(draft.id)
          shell.notify('error',t('unavailable'))
        }
      } catch (_error) {
        for (const draft of drafts ?? []) conversation.releaseDraftAttachment(draft.id)
        shell.notify('error',t('failure'))
      }
    }
    return h('input',{ref:input,type:'file',multiple:true,hidden:true,accept:'.mp4,.m4v,.mov,.webm,.mkv,.avi,.mpeg,.mpg,.3gp,.wmv',onChange,'aria-label':t('add'),'data-dsh-video-picker':''})
  }
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({name:'conversation.input.left',id:'video-picker'},VideoPicker))
  ctx.slots.inject('plugins.row.config', () => ctx.slots.register({name:'plugins.row.config',key:'dsh-video-input#dsh-video-input',
    inject:()=>({language:()=>ctx.locale.getSnapshot().active})},ConfigPanel))
  ctx.effect(() => ctx.commandUi.register({name:'video',label:()=>t('add'),description:()=>t('description'),icon:VideoIcon,
    available:({sessionId}) => {
      const binding = bindings().binding(sessionId)
      return pickers.has(sessionId) && binding?.session.getSnapshot().subagent === null
        && !['adjudicating','submitting'].includes(ctx.conversation.input.for(binding.ctx).state.getSnapshot().phase)
    },
    ui:{kind:'action',run:({sessionId})=>pickers.get(sessionId)?.()},
  }))
  ctx.effect(() => () => pickers.clear())
}
