import React from 'react'
import { useState, useEffect } from 'react';
import Header from '../components/Header'
import GameGenerator from '@/modules/hex-engine/game';
import Singleton from '@/modules/hex-engine/utils/singleton'
import { Button, List, Modal } from "@arco-design/web-react/lib";
import "@arco-design/web-react/dist/css/arco.css"
import Editor from '@/modules/matrix-editor/layouts/Editor';


// singleton 不要放在渲染函数里。在组件被刷新时会被刷新
const SGG = Singleton(GameGenerator)
let gg: GameGenerator



const Home = () => {
  const [debugMode, setDebugMode] = useState(false)
  const [debugSignal, setDebugSignal] = useState(1)

  useEffect(() => {
    init()
  }, [])

  function DebugPanel(){
    if(!gg){
      return
    }
      
    return debugMode?(
      <div style={{ backgroundColor: "lightblue"}}>
        <div id="debugObject">
          <List>
            {
              gg && gg.getDebugGameObjects().map((item) => {

                return (<List.Item key={item.id}>
                  { JSON.stringify(item.getDebugObject()) }
                </List.Item>)
              })
            }
          </List>
        </div>
      </div>
    ) : null
  }
  const signalSend = (event: string, param: Record<string, any>) => {
    if(event === 'game-over'){
      Modal.confirm({
        title: '游戏结束',
        content:
          '点击重新游戏',
        okButtonProps: {
          status: 'success',
        },
        onOk: () => {
          gg.restart()
        },
      });
    }  
  }

  function init(){
    gg = new SGG({
      target: 'ggTarget',
      options: {
        debugSignal: setDebugSignal,
        baseSignalSend: signalSend,
      }
    })
  }

  function onRender(id: string, phase: string, actualDuration: number, baseDuration: number, startTime: number, commitTime: number) {
    //console.log(id, phase, actualDuration, baseDuration, startTime, commitTime);
  }

  return (
    <React.Fragment>
      <React.Profiler id="homepage" onRender={onRender}>
        {/* <Editor>

        </Editor> */}
        <div className="absolute h-full z-10">
          <div className="absolute bottom-0">
            <Button onClick={() => gg.restart()}>重新开始</Button>
            <Button type="primary"  onClick={() => { setDebugMode(!debugMode) }} > Debug {debugMode? 'ON' : 'OFF'}</Button>
          </div>
          <DebugPanel />
        </div>
        <main id='ggTarget' className="relative scene" />
      </React.Profiler>
    </React.Fragment>
  );
};


export default Home
