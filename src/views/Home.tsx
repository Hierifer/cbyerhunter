import React from 'react'
import { useState, useEffect } from 'react';
import Header from '../components/Header'
import GameGenerator from '@/modules/hex-engine/game';
import Singleton from '../../utils/singleton'
import { Button, List } from "@arco-design/web-react/lib";
import "@arco-design/web-react/dist/css/arco.css"


// singleton 不要放在渲染函数里。在组件被刷新时会被刷新
const SGG = Singleton(GameGenerator)
let gg: GameGenerator

const Home = () => {
  const [debugMode, setDebugMode] = useState(true)
  const [debugSignal, setDebugSignal] = useState(1)
  

  useEffect(() => {
    init()
  }, [])

  function DebugPanel(){
    if(gg ){
      console.log(gg)
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

  function init(){
    gg = new SGG({
      target: 'ggTarget',
      options: {
        debugSignal: setDebugSignal
      }
    })
  }

  function onRender(id: string, phase: string, actualDuration: number, baseDuration: number, startTime: number, commitTime: number) {
    console.log(id, phase, actualDuration, baseDuration, startTime, commitTime);
  }

  return (
    <React.Fragment>
      <React.Profiler id="homepage" onRender={onRender}>
        <div className="absolute h-full z-10">
          <div className="absolute bottom-0">
            <Button type="primary"  onClick={() => { setDebugMode(!debugMode) }} > Debug {debugMode? 'ON' : 'OFF'}</Button>
          </div>
          <DebugPanel />
        </div>
        <main id='ggTarget' className="relative">
        </main>
      </React.Profiler>
    </React.Fragment>
  );
};

export default Home
