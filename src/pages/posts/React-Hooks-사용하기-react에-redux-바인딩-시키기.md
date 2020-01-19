---
title: React Hooks 사용하기 - react에 redux 바인딩 시키기
date: '2018-11-23'
tags:
  - react
  - redux
categories:
  - dev
---

이번에 hooks를 사용해보면서 redux를 react에서 사용할 수 있도록 도와주는 `react-redux`를 hooks로 간단하게 만들어보았다. 여러 React Hooks API를 사용하면서 Hooks에 대한 개념을 더 잡을 수 있는 시간이였던 것 같다. 한 번 만들어보자!

<!--more-->

## 시작하기

먼저, Hooks의 기본적인 API들은 [이전 글](/posts/새로-도입될-React-Hooks-알아보기/)에서 확인할 수 있다. 여기서는 따로 설명없이 만들어 보도록 하겠다.

Hooks를 사용하기 위해 `react@next`와 `react-dom@next`를 `create-react-app`을 이용해 설치해주자.

```bash
npx create-react-app hooks-redux && cd hooks-redux // yarn create react-app hooks-redux
yarn add react@next react-dom@next
```

그럼 본격적으로 만들어보자!

## Provider 만들기

react-redux에서 Provider는 redux에서 만들어진 store의 기본 기능들을 context를 이용해 접근 가능하도록 해준다. 우리도 context를 통해 이를 넘겨주도록 하자.

```js:title=Context.js
import { createContext } from 'react';
export default createContext(null);
```

Context는 보통 따로 사용되므로 따로 빼주는게 좋다.

```jsx:title=Provider.js
import React from 'react';
import Context from './Context';

const Provider = ({ children, store }) => (
  <Context.Provider value={store}>{children}</Context.Provider>
);
```

간단한 `Provider` 컴포넌트를 만들었다. redux를 통해 만들어진 store를 받아서 이를 context의 value 값으로 제공한다.

## Store 만들기

Store는 `redux`로 만들 수 있다. 나는 한 번 비슷한 기능을 구현해보고 싶어서 따로 만들어 보았다.

```js:title=createStore.js
const createStore = (initialState, reducer) => {
  let currState = initialState;
  let currReducer = reducer;
  let currListeners = [];
  function getState() {
    return currState;
  }
  function dispatch(action) {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }
    currState = currReducer(currState, action);
    currListeners.forEach(listener => listener());
  }
  function subscribe(listener) {
    currListeners.push(listener);
    return function unsubscribe() {
      currListeners = currListeners.filter(currListener => listener !== currListener);
    };
  }
  return {
    dispatch,
    getState,
    subscribe,
  };
};

export default createStore;
```

한 번 만들어보고 싶어서 만들어 본 것이고.. redux를 쓰는게 100배는 좋다.

## Hooks 만들기

이제 본격적으로 Hooks를 이용해보자. react-redux에서 store에 접근하고 싶은 컴포넌트는 `connect`를 이용해 감싸주고, 원하는 state 값이 업데이트 될 때만 rerender 되도록 하려면 `mapStateToProps`를 이용하여 state에서 원하는 값을 props로 빼주었다. 이와 같은 기능을 Hooks를 통해 구현해보려고 하였다.

```js:title=useHookState.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import Context from './Context';
import shallowEqual from './shallowEqual'; // 객체 비교(react-redux로 부터 가져옴)

const useHookState = mapState => {
  const store = useContext(Context);
  let unSubscribeRef = useRef();
  let prevMappedStateRef = useRef();
  const [mappedState, setMappedState] = useState(mapState(store.getState()));
  prevMappedStateRef.current = mappedState;
  useEffect(() => {
    unSubscribe.current = store.subscribe(() => {
      const newMappedState = store.getState();
      if (!shallowEqual(prevMappedStateRef.current, newMappedState)) {
        setMappedState(newMappedState);
      }
    });
    return unsubscribe.current;
  }, [store, mapState]);
  return mappedState;
};
```

shallowEqual은 `react-redux`에서 가져온 코드인데, `mapStateToProps`를 이용하여 반환된 객체는매 번 새로운 객체가 생성되기 때문에 비교연산자(`===`, `==`)를 이용할 시 항상 다르므로 이를 1 depth 만 비교하기 위한 코드이다.

먼저, `useContext`를 이용하여 아까 만들어준 Context에서 제공하는 `store`를 가져온다. 그 다음 store에 대한 subscribe를 해제할 `unSubscribe`를 저장할 변수를 `useRef`를 통해 만들어준다. 이는 class에서 인스턴스 변수와 비슷한 역할을 한다.

다음 `useState`를 이용하여 store의 state가 변할 때마다 이를 저장해줄 state를 생성한다. `prevMappedStateRef`는 마지막으로 바뀐 mapState된 값을 저장해준다. 이렇게 저장하지 않고 `useEffect`에서 `mappedState`를 사용할 경우, 함수가 호출될 때 마다, mappedState는 재지정되는 것이 아니라 새로운 변수로 할당되므로 밑에 subscribe에서 클로져 활용을 할 수 없어서 매번 맨 처음 subscribe가 실행될 때 있던 변수 값만 클로져를 통해 가지게 된다. `useState`가 저장된 값을 가지다 보니 이런 실수를 할 수가 있다.

`subscribe`는 컴포넌트 마운트시 한 번 등록해야 하므로 `useEffect`에 등록한다. `useEffect`의 두 번째 인자로 들어가는 `[state, mapState]`는 이전 글에서 설명한 것 처럼 `useEffect`가 실행되는 조건을 준다. 이 배열에 있는 값이 변하지 않으면 `useEffect`는 재실행 되지 않고 한 번만 실행된다. 우리는 store나 mapState가 변하지 않는 이상 다시 subscribe를 등록할 이유가 없으므로 이렇게 인자를 주었다. 마지막으로 `useEffect`의 반환 값은 컴포넌트가 언마운트 될시 실행되므로 store에 대한 subscribe를 해제하는 것으로 하였다.

Hooks API가 4개나 들어간 커스텀 Hook이 되었다! `mapDispatchToProps`는 단순히 `dispatch`만 뿌려주면 되므로 비교적 간단하게 구현할 수 있다.

```js:title=useHookDispatch.js
const useHookDispatch = (mapDispatch = null) => {
  const { dispatch } = useContext(StoreContext);
  if (mapDispatch) {
    return {
      ...mapDispatch(dispatch),
    };
  }
  return { dispatch };
};
```

또는, 이런식으로도 할 수 있겠다.

```js:title=useConnect.js
const useConnect = (mapState, mapDispatch) => {
  const store = useContext(StoreContext);
  const getStore = () => {
    return store;
  };
  return {
    ...useHookState(mapState, getStore),
    ...useHookDispatch(mapDispatch, getStore),
  };
};
```

이렇게 사용할 경우, hook의 순서가 바뀌는 것을 피하기 위해서, `useHookState`와 `useHookDispatch`의 두 번째 인자 기본 값을 store를 가져오는 hook으로 바꿔주자.

```js
const useStore = () => useContext(StoreContext);
const useHookState = (mapState, getStore = useStore) => {
  const store = getStore();
  // ...
};
const useHookDispatch = (mapDispatch = null, getStore = useStore) => {
  const store = getStore();
  // ...
};
```

## 사용해보기

이제 사용해 볼 준비가 끝났다! 실제 컴포넌트에 사용해보자. 먼저 최상단 컴포넌트에 `Provider`를 넣어주자.

```jsx:title=App.js
import React from 'react';
import { Provider } from './Provider';
import store from './store';

const App = () => (
	<Provider store={store}>
    	{...}
    </Provider>
);
```

그리고 하위 컴포넌트 어딘가에 만든 Hooks을 연결시켜보자.

```jsx:title=Counter.js
import React from 'react';
import { useHookState } from './useHookState';
import { useHookDispatch } from './useHookDispatch';
/*
	state = { count: 0 };
	reducer = (state, action) => {
 		switch (action.type) {
			case: 'INCREASE':
				return { ...state, count: state.count + 1 };
			case: 'DECREASE':
				return { ...state, count: state.count - 1 };
			default:
				return state;
		}
 	}
 	로 가정
*/
const actions = {
  increase: () => ({ type: 'INCREASE' }),
  decrease: () => ({ type: 'DECREASE' }),
};

const mapState = state => ({
  count: state.count,
});
const mapDispatch = dispatch => ({
  increase: () => dispatch(actions.increase()),
  decrease: () => dispatch(actions.decrease()),
});
const Counter = () => {
  const { count } = useHookState(mapState);
  const { increase, decrease } = useHookDispatch(actions);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={increase}>+1</button>
      <button onClick={decrease}>-1</button>
    </>
  );
};
```

여기서 한 가지 더 주의사항이 있다. 아까 `useHookState`에서 우리는 `useEffect`의 두 번째 인자 중 하나로 `mapState`를 주었다. 만약에 위 컴포넌트에서 `mapState`가 함수 안에 있을 경우, mapState가 매 랜더마다 바뀜에 따라 useEffect도 계속 실행되고 계속 store를 subscribe 하는 일이 벌어진다. 이를 방지하기 위해 mapState를 밖에 빼놓았다.

만일 props 같은 컴포넌트 내에서 사용하는 변수에 접근해야 한다면 어떻게 해야할까? 다행히 Hook Api에는 `useCallback`이 있다.

```js:title=Counter.js
// ...
const Counter = ({ defaultCount }) => {
    const mapState = useCallback(state => ({
  		count: state.count + defaultCount,
	}, [defaultCount]);
    const { count } = useHookState(mapState);
    const { increase, decrease } = useHookDispatch(actions);
    return (
        <>
        	<h1>{count}</h1>
          	<button onClick={increase}>+1</button>
          	<button onClick={decrease}>-1</button>
        </>
    );
}
```

이렇게 useCallback을 이용하면 두 번째 인자인 `[defaultCount]`가 바뀌지 않는 한, memoize된 callback을 준다. 이제 이러한 케이스를 처리해주도록 useHookState를 조금 바꿔줘야 한다.

```js:title=useHookState.js
const useHookState = mapState => {
  const store = useContext(Context);
  const unSubscribeRef = useRef();
  const prevMappedStateRef = useRef();
  const [mappedState, setMappedState] = useState(mapState(store.getState()));
  prevMappedStateRef.current = mappedState;
  useEffect(() => {
    unSubscribe.current = store.subscribe(() => {
      const newMappedState = mapState(store.getState());
      if (!shallowEqual(prevMappedStateRef.current, newMappedState)) {
        setMappedState(newMappedState);
      }
    });
    return unsubscribe.current;
  }, [store, mapState]);
  return mappedState;
};
```

mapState가 바뀔 경우, useEffect가 다시 실행되고 store를 한번 더 subscribe 하게 된다. 이를 해결해 줄 필요가 있다. useEffect가 컴포넌트 마운트시 실행될 때 말고 다음에 실행될 때, 즉, `store`나 `mapState`가 바뀌었을 때는 `unSubscribe.current`가 있다는 점을 생각하여 다음과 같이 코드를 짰다.

```js:title=useHookState
const useHookState = mapState => {
  //...
  useEffect(() => {
    const checkAndUpdate = () => {
      const newMappedState = mapState(currStore.current.getState());
      if (!shallowEqual(currMappedState.current, newMappedState)) {
        setMappedState(newMappedState);
      }
    };
    if (unSubscribe.current) {
      unSubscribe.current();
      checkAndUpdate();
    }
    unSubscribe.current = store.subscribe(checkAndUpdate);
    return unsubscribe.current;
  }, [store, mapState]);
};
```

이렇게하면 mapState값이 바뀔 때 마다 기존에 등록한 subscribe는 지워주고, 새로운 listener를 등록하게 된다!

## 결론

이렇게 Hooks를 이용하여 redux를 react에 바인딩시켜 보았다. 실제로 사용할 수준은 아니지만 hooks가 익숙해지는 것에 도움이 많이 되었다. 뭐든지 새로 나온 것을 배우는 것은 재밌으니 여러가지를 한 번 만들어 보고 싶다!

### 참고

[github repository](https://github.com/Godsenal/hooks-state) // 코드의 차이가 조금 있을 수 있다.

[이전 글 - 새로 도입될 React Hooks 알아보기](/posts/새로-도입될-React-Hooks-알아보기)
