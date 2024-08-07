import React from 'react'
import { useState, useEffect } from 'react';
import Header from '../components/Header'
import GameGenerator from '@/modules/hex-engine/game';
import Singleton from '../../utils/singleton'
import { Button, List } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css"


// singleton 不要放在渲染函数里。在组件被刷新时会被刷新
const SGG = Singleton(GameGenerator)

const Home = () => {
  let gmObj: GameGenerator
  const [debugMode, setDebugMode] = useState(false)
  

  useEffect(() => {
    init()
  }, [])

  function DebugPanel(){
      return debugMode?(
        <div>
          <div id="debugObject"></div>
        </div>
      ) : null
  }

  function init(){
    const tmp = new SGG({
      target: 'ggTarget'
    })
    if(Object.keys(tmp).length > 0){
      gmObj = tmp
    }
  }

  function onRender(id: string, phase: string, actualDuration: number, baseDuration: number, startTime: number, commitTime: number) {
    console.log(id, phase, actualDuration, baseDuration, startTime, commitTime);
  }

  return (
    <React.Fragment>
      <React.Profiler id="homepage" onRender={onRender}>
        <div className="absolute h-full">
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
