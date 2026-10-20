import {createContext, useContext, useState} from "react";

const TouchContext = createContext({
  supportsHover: false
});

export default function TouchProvider({children}) {

  const [supportsHover, setSupportsHover] = useState(getDefaultHover());

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function onKeyDown(e) {
    if (e.key === 'Alt') {
      setSupportsHover(false)
    }
  }

  function onKeyUp(e) {
    if (e.key === 'Alt') {
      setSupportsHover(getDefaultHover())
    }
  }

  function getDefaultHover() {
    return window.matchMedia('(hover: hover)').matches;
  }

  return (
    <TouchContext.Provider value={{
      supportsHover: supportsHover,
    }}>
      <div
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      >
        {children}
      </div>
    </TouchContext.Provider>
  )
}

export function useTouchContext() {
  return useContext(TouchContext);
}