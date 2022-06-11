---
title: 새로 도입될 React Hooks 알아보기
date: '2018-11-05'
categories:
  - dev
tags:
  - react
---

현재 글을 쓰고 있는 시점 기준으로 React v16.7.0-alpha 에서 새로운 특징이 공개되었다. Hooks라고 불리는 이 기능의 주요 목적은 state나 lifecycle 같은 React의 특징을 클래스를 작성할 필요없이(함수형 컴포넌트로) 사용할 수 있도록 해주는 것이다. 상당히 쓰기 쉽고, 많은 기능들을 지원해주지만 기존 React 작성과는 다른 점이 많아서 사용해보고 알아봐야할 점은 많다. 문서를 읽고 간단한 예제들을 만들며 공부해보았다. [github repo](https://github.com/Godsenal/react-hooks-demo) 에서 간단한 코드들을 볼 수 있고 여기서는 내용을 한 번 알아보자!

<!--more-->

## 시작해보기

먼저 코드를 짜며 사용해보는게 가장 이해하기 쉬울 것 같다. create-react-app을 이용하여 빠르게 시작해보자. (또는 간단한 예제들을 만들어놓은 [github repo](https://github.com/Godsenal/react-hooks-demo)를 보아도 된다.)

```bash
npx create-react-app react-hooks-demo && cd react-hooks-demo
yarn add react@next react-dom@next
```

`@next`를 이용하여 alpha 버전을 받을 수 있다.

시작하기전에 먼저 Hooks의 기본 룰을 알고가는게 좋을 것 같다. Hooks는 기본적으로 state나 react의 다른 특징(lifecycle 등)들을 class를 작성할 필요 없이 사용할 수 있게 해주는 것이다. 이 점을 생각하면 다음 룰들이 이해가 간다.

- Hooks는 React 함수형 컴포넌트에서 호출하여야 한다. (일반적인 javascript 함수에서 호출하면 안된다.)
- 또 Hooks를 사용할 수 있는 곳은 custom Hooks이다.

custom Hooks는 직접 만드는 Hooks로, 잠시 후 사용해 볼 것이다. 이 룰과 기본 목적을 생각하며 Hooks를 사용해보자.

## Basic Hooks

간단한 Hooks들을 먼저 사용해보자. Hooks api들은 [여기](https://reactjs.org/docs/hooks-reference.html)서 볼 수 있다.

### useState

`useState`는 함수형 컴포넌트 안에서 state를 사용할 수 있게 해주는 것이다.

```js:title=Counter.js
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>useState를 이용한 카운터</p>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}

export default Counter;
```

`useState`는 한 가지 인자, state의 초기 값을 받고 그 state와 state를 변경할 수 있는 함수를 반환한다.

```js
const [count, setCount] = useState(0);
```

이 부분이 익숙하지 않을 수 있다. 비구조화 할당으로 배열안에 있는 값들을 개별 변수에 담을 수 있게 해주는 표현식이다.

```js
const [a, b] = [10, 20];
console.log(a); // 10
console.log(b); // 20
```

이러한 방식으로 사용할 수 있다.

useState의 반환 값도 배열로서, state와 state를 변경할 수 있는 함수를 담고있다. 우리는 이를 `count`와 `setCount`라는 이름에 담았다. 이렇게 간단하게 함수형 컴포넌트안에서도 로컬 state를 사용할 수 있다! + 버튼을 누르면 `count + 1`로 count를 정해주고 - 버튼을 누르면 `count - 1`로 count를 정해준다.

### useEffect

이번엔 Effect Hooks를 사용해보자. 이 Hooks는 함수형 컴포넌트에서 side effect(데이터 패칭, 이벤트 리스너 등록, DOM 변경 등)를 실행할 수 있도록 도와준다. class 컴포넌트의 `componentDidMount`, `componentDidUpdate` 그리고 `componentWillUnmount`가 합쳐진 형태라고 생각할 수 있다.

그럼 `mousemove` 이벤트 리스너를 등록하여 현재 마우스 포지션을 보여주는 함수형 컴포넌트를 만들어보자!

```js:title=MouseWatcher.js
import React, { useState, useEffect } from 'react';

const MouseWatcher = () => {
  const [pos, changePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = e => changePos({ x: e.clientX, y: e.clientY });
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
  return (
    <>
      <p>useEffect를 이용한 마우스 포지션 watcher</p>
      <div>x: {pos.x}</div>
      <div>y: {pos.y}</div>
    </>
  );
};

export default MouseWatcher;
```

아까보다는 조금 복잡해졌다. useEffect가 어떤 역할을 하는지 보자.

먼저, useState를 이용하여 마우스 포지션을 담아둘 state를 만들었다. 그리고 mousemove 이벤트 리스너에 등록하여 마우스가 움직일 때마다 pos 상태를 변경해줄 `handleMouseMove` 함수를 만들었다.

useEffect는 인자로 함수를 받고, 그 함수를 매 render 후에 실행시켜준다. 즉, `componentDidMount`와 `componentDidUpdate`의 역할을 한다.

> 참고:
>
> class의 두 라이프사이클 함수와 다른점은 useEffect의 인자로 들어간 함수는 마운트된 직후(react tree에 들어간 직후)가 아니라 레이아웃과 페인팅이 끝난 후에 호출된다는 점이다.

그리고 useEffect 안에서 함수를 반환할 경우 그 함수를 컴포넌트가 UI에서 제거되기 직전에 실행시켜준다. 이는 `componentWillUnmount`의 역할과 비슷하다.

이렇게 mousemove 이벤트 리스너를 등록하고 해제하는 effect를 만들어보았다.

하지만, 고쳐야할 점이 하나있다. 아까 말했듯이 effect는 **매 랜더 후에 실행되고 이 코드는 매 랜더마다 이벤트 리스너를 등록해주게 된다.** 다행히 useEffect에는 두 번째 인자를 줄 수있다.

```js:title=MouseWatcher.js
// ...
useEffect(() => {
  window.addEventListener('mousemove', handleMouseMove);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, []); // 빈 배열을 두 번째 인자로 넘겨주었다.
// ...
```

useEffect의 두 번째 인자로 배열을 넘겨주면 배열안에 있는 값들이 변할 때만 effect를 실행시킨다. 우리는 빈 배열을 주었고 즉, 값은 항상 바뀌지 않는다. 이는 클래스 컴포넌트에서 이벤트 리스너를 등록할 때 `componentDidMount`에서만 등록하는 것과 같다.

### useContext

다음은 context API를 사용할 수 있도록 도와주는 hook이다. useContext의 인자로 context 객체 (React의 createContext API에서 반환된 값)를 넘겨주면 현재 context 값을 받아올 수 있고 보통 context API를 사용할 때와 마찬가지로 Provider가 업데이트 되면 이 Hooks도 업데이트 된다.

간단하게, 현재 앱의 테마를 저장하고 변경할 수 있는 코드를 짜보자.

```js:title=themeContext.js
import { createContext } from 'react';

const themeContext = createContext({
  theme: 'default',
  toggleTheme: () => {},
});

export default themeContext;
```

`App`컴포넌트는 현재 테마 state 와 테마 state를 바꿀 수 있는 함수를 context의 값으로 넘겨준다.

```js:title=App.js
import React, { useState } from 'react';
import themeContext from './themeContext';

const getStyleByTheme = theme => {
  return {
    color: theme === 'dark' ? '#CACCCE' : 'black',
    backgroundColor: theme === 'dark' ? '#2F3437' : 'white',
  };
};

const App = () => {
  const [theme, changeTheme] = useState('default');
  return (
    <div
      style={{
        ...getStyleByTheme(theme),
      }}
    >
      <themeContext.Provider value={{ theme, changeTheme }}>
        // ...여러 컴포넌트들
      </themeContext.Provider>
    </div>
  );
};

export default App;
```

그리고 `ThemeChanger` 컴포넌트에서는 `useContext`를 이용하여 themeContext의 값을 받는다.

```js:title=ThemeChanger.js
import React, { createContext, useContext } from 'react';
import themeContext from './themeContext';
const ThemeChanger = () => {
  const { theme, changeTheme } = useContext(themeContext);
  const nextTheme = theme === 'dark' ? 'default' : 'dark';
  return (
    <>
      <p>useContext를 이용한 테마 체인저</p>
      <button onClick={() => changeTheme(nextTheme)}>set to {nextTheme} mode</button>
    </>
  );
};
export default ThemeChanger;
```

이렇게 간단하고 쉽게 context를 사용할 수 있다.

## 추가적인 Hooks

다음은 조금은 특별한 케이스에만 사용되는 hooks들을 몇 개만 알아보자.

### useReducer

아주 재밌는 기능이 나온 것 같다. useState 의 state를 변경하는 함수로 state를 관리하는 대신에 reducer를 통해 state를 관리할 수 있도록 하는 useReducer 이다. Redux를 써봤다면 친숙하게 사용할 수 있다. 아까 useState를 사용할 때 만들었던 `Counter` 컴포넌트에서 useReducer를 사용하여 상태를 관리해보자.

```js:title=useReducer.js
import React, { useReducer } from 'react';

const initialState = { count: 0 };
const reducer = (state = initialState, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      return state;
  }
}
const Counter = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      <p>useReducer를 이용한 카운터</p>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment'})}>+</button>
      <button onClick={() => dispatch({ type: 'decrement'})}>-</button>
    </div>
  );
}

export default Counter;
```

useReducer는 현재 state와 dispatch를 반환해준다. redux를 써봤으면 익숙하겠지만 안써봤다면 dispatch의 인자로 들어가는 객체가 reducer의 action과 대응한다고 생각하면 된다.

reducer의 state는 현재 state를 받고, action으로는 dispatch된 값을 받는다. switch 구문에 따라 action의 타입으로 분기하고 그에 따라 현재 상태를 반환하여 업데이트 할 수 있다. useState와 상태를 관리한다는 점에서 동일하지만 원하는 상태변화를 action의 타입으로 분기해줄 수 있다는 것은 큰 편리함이 될 것이다.

이 useReducer와 useContext를 이용하면 redux와 같이 글로벌하게 간편한 상태 관리를 할 수 있다. 위에 올린 깃허브 레포에서 간단하게 만든 상태관리 예제가 있다.

### useCallback

useCallback은 성능과 밀접한 hook이다. 인라인 콜백과 배열을 인자로 받아서 memoize 된 콜백을 반환해준다. memoize의 기준은 인자로 준 배열의 값들이며, 이 값들이 변하지 않는 이상 항상 같은 참조를 가지는 콜백 즉, memoize 된 콜백을 반환해준다.

이는 **함수형 컴포넌트가 단순히 매 랜더시마다 새로 호출되는 함수이기 때문에** 생겼다고 볼 수 있다.

```js:title=PassCallback.js
import React, { useState } from 'react';
const passCallback = () => {
  const [count, setCount] = useState(0);
  const callback = () => console.log(`count: ${count}`);
  return <Child logCurrentCount={callback} />;
};
```

이러한 컴포넌트가 있다고 생각하자. 만일 `Child`컴포넌트에서 성능향상을 위해 `React.PureComponent` 또는 `React.memo`를 사용했다면 어떻게 될까? `callback` 함수는 매 랜더시 마다 새로 생성되고 함수의 참조값은 매번 바뀐다. 함수의 내용이 변함이 없으므로 Child 컴포넌트가 다시 랜더될 필요없지만, `props.logCurrentCount`의 값은 바뀌었으므로 매번 불필요한 업데이트가 일어난다.

이럴 때 useCallback을 유용하게 사용할 수 있다.

```js:title=passCallback.js
const memoizedCallback = useCallback(() => {
  console.log(`count: ${count}`);
}, [count]);
```

useCallback은 memoized된 콜백을 반환해줌으로 함수의 참조값이 `count`가 변하지 않는 이상 항상 같으므로 위에서 말한 성능향상에 기여할 수 있다.

### useMemo

위 useCallback은 이 useMemo을 사용하는 방법 중 하나라고 할 수 있다. memoize 된 값을 반환해준다. 이 hook도 되게 유용하게 사용되는 hook이 되지 않을까 생각한다.

```js
const memoizedValue = useMemo(() => getFactorial(value), [value]);
```

이런식으로 사용하게 되면 value 값이 바뀌지 않는 이상 memoize된 값을 반환해준다. 즉, value값이 바뀌어야만 팩토리얼을 다시 계산한다. 매 랜더마다 50의 팩토리얼을 구한다고 생각하면 끔찍하다. 팩토리얼 정도는 아니더라도 계산이 복잡한 식이 있다면 memo를 사용하는 것이 좋다.

추가적으로 useRef 등 몇 개의 API가 더 있다. 다음으로는 custom Hooks 에 대해 알아보자.

## Custom Hooks

우리가 직접 하나의 hook을 만들 수 있다. Hook의 장점이자 목적 중 하나는 stateful한 로직을 재사용할 수 있다는 것이다.

위에서 봤던 현재 마우스 포지션을 구하는 이벤트 리스너를 등록하고, 이벤트에 따라 포지션을 변경하고, 컴포넌트가 UI에서 제거되기전 해제하는 과정은 하나의 stateful한 로직이다. 이러한 stateful한 로직을 여러 컴포넌트에 걸쳐 재사용하고 싶다고 했을때, 컴포넌트 안에서 재사용할 방법은 없었다. higher-order components나 render props를 이용하여 component의 구조를 바꾸는 수 밖에 없었다.

하지만, hooks을 사용하면 이런 stateful한 로직을 따로 빼서 원하는 컴포넌트안에서 쉽게 재사용할 수 있다. 아까 만들었던 `MouseWatcher` 컴포넌트의 현재 마우스 포지션을 구하는 로직을 재사용 가능하도록 custom hook으로 빼보자.

```js:title=useMousePos.js
import { useState, useEffect } from 'react';

const useMousePos = () => {
  const [pos, changePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = e => changePos({ x: e.clientX, y: e.clientY });
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  return pos;
};

export default useMousePos;
```

mousemove 이벤트리스너를 등록하고, 마우스 포지션 state를 변경해주고, 이벤트리스너를 해제하는 로직을 따로 빼주었다. 이제 우리는 원하는 컴포넌트에서 이 로직을 재사용할 수 있다.

```js:title=MouseChecker.js
import React from 'react';
import useMousePos from './useMousePos';

const MouseChecker = () => {
  const { x, y } = useMousePos();
  return (
    <>
      <p>Custom hook을 이용한 마우스 포지션 checker</p>
      <div>x: {x}</div>
      <div>y: {y}</div>
    </>
  );
};

export default MouseChecker;
```

custom hook은 일반적인 자바스크립트 함수와 다를게 없다. 이 hook을 호출함으로서 stateful한 로직을 사용 가능하다. useState를 이용한 state관리와, useEffect를 이용한 effect관리를 재사용 가능하다! 이렇게 쉽게 컴포넌트의 구조를 바꾸지 않고 stateful한 로직을 재사용할 수 있는 것이 바로 custom hook이다.

Hooks가 나온 배경과 목적에 맞게 잘 사용하는 것은 중복되는 stateful 한 로직을 custom hook으로 분리하여 재사용하는 것이라고 생각한다.

## Hooks 사용시 지켜야 할 점

가장 **중요한 두 가지**만 지키면 hooks를 안전하게 쓸 수 있다.

1. 함수의 최상위에만 사용할 것. 반복문, 조건문 또는 감싸여진 함수에서는 사용하면 안된다.

   이는 react가 hooks를 순서에 따라 관리하기 때문이다. 예를 들어, 어떤 조건에 따라 첫 랜더시에만 호출되는 `useState`가 있다고 생각해보자. 순서에 따라 관리하기 때문에 다음 render에서는 이 `useState` 가 빠짐으로서 hooks들의 순서가 바뀌고 react는 관리하지 못하게 된다.

2. React 함수에서만 hook을 호출하자. 즉,

   - React 함수형 컴포넌트에서 호출하거나,
   - custom Hook에서 호출할 수 있다.

   이 두 경우 외에는 hook을 호출하지 않아야 한다. 위에서 봤듯이 우리가 만든 custom Hook인 `useMousePos` 에서는 `useState`와 같은 hook을 호출하여 사용할 수 있다. 하지만, 일반적인 자바스크립트 함수에서는 사용해서는 안된다.

이 두 가지만 지키면 위에서 봐온 Hooks의 쉽고 좋은 기능들을 사용할 수 있다. 물론, 아직 정식버전이 아니니 production으로 사용해서는 안된다.

## 결론

React에 큰 변화를 주는 기능이 추가된 것 같다. 아직 커뮤니티에서 많은 논란이 있지만 개인적으로, 또 많은 사람들이 이 기능을 좋아하고 있다. 특히, 재사용성을 증가시켜주는 기능들은 안 좋을 수가 없다! 정식 릴리즈가 되면 좀 더 깊이있고 유용한 글을 써보도록 해야겠다.
