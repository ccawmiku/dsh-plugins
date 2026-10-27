// @vitest-environment jsdom
import { afterEach,expect,it,vi } from 'vitest'
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { ConfigPanel } from '../src/settings.js'
afterEach(cleanup)
it('saves complete scaled settings atomically and keeps the original revision after an external change',async()=>{
  const value={enabled:true,autoFallback:true,maxVideos:8,maxVideoBytes:536870912,maxDirectBytes:67108864,maxFrames:8,frameInterval:2,frameWidth:1024,frameCacheEntries:16,timeoutMs:180000,ffmpegPath:'ffmpeg',ffprobePath:'ffprobe'}
  const mutate=vi.fn(async()=>true)
  const form={state:{status:'ready',writable:true,revision:3,value},mutate}
  const props={view:'page',form,language:()=> 'zh'}
  const view=render(createElement(ConfigPanel,props))
  fireEvent.change(screen.getByLabelText('直传总大小上限（MiB）'),{target:{value:'32'}})
  view.rerender(createElement(ConfigPanel,{...props,form:{...form,state:{...form.state,revision:4,value:{...value,maxDirectBytes:12582912}}}}))
  expect(screen.getByLabelText('直传总大小上限（MiB）').value).toBe('32')
  fireEvent.click(screen.getByRole('button',{name:'保存',exact:true}))
  await waitFor(()=>expect(mutate).toHaveBeenCalledOnce())
  expect(mutate.mock.calls[0][1]).toBe(3)
  expect(mutate.mock.calls[0][0]).toContainEqual({op:'set',path:['maxDirectBytes'],value:33554432})
})
