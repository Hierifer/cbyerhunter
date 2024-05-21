import React from 'react'
import { useState, useEffect } from 'react';
import Header from '../components/Header'
import GameGenerator from './pixi';
import Singleton from '../../utils/singleton'
import { Button, List } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";


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
    let tmp = new SGG({
      target: 'ggTarget'
    })
    if(Object.keys(tmp).length > 0){
      gmObj = tmp
    }
  }

  return (
    <React.Fragment>
      <div className="absolute h-full">
        <div className="absolute bottom-0">
          <Button type="primary"  onClick={() => { setDebugMode(!debugMode) }} > Debug {debugMode? 'ON' : 'OFF'}</Button>
        </div>
        <DebugPanel />
      </div>
      <main id='ggTarget'>
      </main>
    </React.Fragment>
  );
};

export default Home
