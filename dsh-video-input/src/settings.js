import { createElement as h, useEffect, useRef, useState } from 'react'

const fields = [
  ['enabled','checkbox','启用视频处理','Enable video processing'],
  ['autoFallback','checkbox','不支持时自动抽帧','Automatically fall back to frames'],
  ['maxVideos','number','视频数量上限（含历史）','Video limit including history',1,64],
  ['maxVideoBytes','number','单视频大小上限（MiB）','Per-video size limit (MiB)',1,2047,1,1048576],
  ['maxDirectBytes','number','直传总大小上限（MiB）','Direct-upload total limit (MiB)',1,512,1,1048576],
  ['maxFrames','number','抽帧总数量上限','Total frame limit',1,20],
  ['frameInterval','number','目标采样间隔（秒）','Target sample interval (seconds)',0.1,3600,0.1],
  ['frameWidth','number','抽帧图片宽度','Frame width',128,2048],
  ['frameCacheEntries','number','抽帧缓存条目数','Frame cache entries',0,128],
  ['timeoutMs','number','处理超时（秒）','Processing timeout (seconds)',1,1800,1,1000],
  ['ffmpegPath','text','FFmpeg 路径','FFmpeg path'],
  ['ffprobePath','text','FFprobe 路径','FFprobe path'],
]

/** An atomic, revision-guarded form on the plugin's own configuration page. */
export function ConfigPanel({view,form,language}) {
  const en = !String(language?.() ?? 'zh').startsWith('zh')
  const [draft,setDraft] = useState({}),[dirty,setDirty] = useState(false),[saving,setSaving] = useState(false),[notice,setNotice] = useState('')
  const revision = useRef(undefined)
  const state = form?.state
  useEffect(()=>{
    if (state?.status !== 'ready' || dirty) return
    setDraft({...state.value});revision.current=state.revision
  },[state?.revision,state?.status,dirty])
  if(view==='summary') return h('span',null,en?'Video upload and automatic frame fallback settings':'视频上传、自动抽帧与大小限制设置')
  if(!form || state?.status!=='ready') return h('p',{role:'status'},en?'Configuration is unavailable. Enable the plugin and try again.':'配置暂不可用，请启用插件后重试。')
  const change=(key,value)=>{setDraft(old=>({...old,[key]:value}));setDirty(true);setNotice('')}
  const save=async event=>{
    event.preventDefault();setSaving(true);setNotice('')
    try {
      const ok=await form.mutate(Object.entries(draft).map(([key,value])=>({op:'set',path:[key],value})),revision.current)
      if(ok){setDirty(false);setNotice(en?'Saved. Applies to the next video request.':'已保存，从下一次视频请求生效。')}
      else setNotice(en?'Could not save; the configuration may have changed. Reopen this page and try again.':'保存失败，配置可能已被其他窗口修改；请重新打开本页后重试。')
    } catch(_error){setNotice(en?'Could not save. Please try again.':'保存失败，请重试。')}
    finally{setSaving(false)}
  }
  const inputStyle={padding:'8px 10px',border:'1px solid var(--dsw-alias-border-l4)',borderRadius:8,background:'var(--dsw-alias-bg-layer-1)',color:'var(--dsw-alias-label-primary)',font:'inherit',width:'100%',boxSizing:'border-box'}
  return h('form',{onSubmit:save,style:{display:'grid',gap:16,maxWidth:600,color:'var(--dsw-alias-label-primary)'}},
    ...fields.map(([key,type,zh,label,min,max,step=1,scale=1])=>h('label',{key,style:{display:'grid',gap:6}},
      h('span',null,en?label:zh),h('input',{type,value:type==='checkbox'?undefined:type==='number'?(draft[key]===undefined?'':draft[key]/scale):draft[key]??'',
        checked:type==='checkbox'?Boolean(draft[key]):undefined,disabled:saving||!state.writable,required:type!=='checkbox',min,max,step:type==='number'?step:undefined,
        style:type==='checkbox'?{justifySelf:'start'}:inputStyle,onChange:event=>change(key,type==='checkbox'?event.target.checked:type==='number'?Math.round(Number(event.target.value)*scale*10)/10:event.target.value)}))),
    h('p',{style:{color:'var(--dsw-alias-label-secondary)',margin:0}},en?'Frame fallback omits audio. FFmpeg and FFprobe must be installed on the DSH host.':'抽帧模式不包含声音。FFmpeg 与 FFprobe 需要安装在运行 DSH 后端的设备上。'),
    h('button',{type:'submit',disabled:saving||!dirty||!state.writable,style:{...inputStyle,width:'fit-content',cursor:'pointer'}},saving?(en?'Saving…':'保存中…'):(en?'Save':'保存')),
    notice?h('p',{role:'status'},notice):null)
}
