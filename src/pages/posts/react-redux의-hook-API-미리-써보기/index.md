---
title: react-redux의 hook API 미리 써보기
date: '2019-06-08'
tags:
  - react
  - redux
categories:
  - dev
---

> react-redux의 hook api는 2019-06-08 기준 v7.1.0-alpha.5. 버전 이기 때문에 언제 바뀔지 모른다. 그래도 미리 한 번 써보자.


React가 hook을 내놓음에 따라 많은 라이브러리들이 hook API를 지원하고 있다. 확실히 기존에 있던 재사용성을 높이는 방법들인 Higher Order Component나 Render Props 등의 패턴보다 편하다고 느껴진다.

react-redux도 그 변화에 맞춰서 현재 쓰고 있는 버전 기준으로 다음 버전인 v7.1.0. 부터 hook을 지원할 것이다.  `npm i -S react-redux@next` 로 Alpha 버전을 받아서 미리 써볼 수 있다. 기존 `connect` 를 이용하여 하는 방식보다 훨씬 직관적이라고 생각된다. 

그런데 단순히 기존에 사용하던 방식에 hook을 지원하는 건 아니고, hook을 사용함에 따라 생기는 변화와 함께 다른 부분들도 조금 바뀌었다. 그 부분을 중점으로 글을 조금 써보려고 한다.

(아쉽게도 아직 hook API에 대한 typing은 없으므로, typescript로 사용해보고 싶을 경우 [https://github.com/DefinitelyTyped/DefinitelyTyped/pull/34913](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/34913) 이 풀리퀘스트의 타이핑 파일을 이용해보자)

# useSelector

기존의 `mapStateToProps` 역할을 하는 hook이라고 할 수 있다. 인자로 받은 셀렉터 함수에 state를 넘겨주고 받은 데이터를 반환해준다.
```js
  const todos = useSelector(state => state.todos);
```
`useSelector`를 사용하며 조금 주의해야할 점을 알아보자.

### 1. 기존과 같은 방식으로 객체를 사용하지 말자.

뭔가 다른점을 볼 수 있는데 `useSelector` 에서는 꼭 객체형태로 반환해줄 필요가 없다. 원하는 형태로 반환해주면 된다. 오히려, 객체로 넘겨주는 것 보다 useSelector를 여러번 써서 받는 방식이 더 나을 수 있다. 그 이유는 `mapStateToProps` 와 `useSelector` 의 동일성을 하는 방식이 다르기 때문인데, 이전 `mapStateToProps` 같은 경우는 반환된 객체의 모든 필드에 대해서 동일성검사를 하여 다른 필드가 있을 경우 업데이트 해주는 방식이였다면,  `useSelector` 는 엄격한 비교 ( `===` )를 하여,  참조가 달라지면 무조건 업데이트 해준다. 

기존에 있던 `mapStateToProps` 를 옮기고 싶다면, 다음과 같이 해주자.

1. 객체의 필드 하나씩 `useSelector` 로 반환해주자.
2. reselect 같은 라이브러리를 이용해서 관계있는 값이 바뀔 때만 새로운 객체를 반환해주도록 하자.
3. useSelector의 두 번째 인자를 이용하자.

여기서 3번에 대해 설명하자면, useSelector에는 두 번째 인자로 동일성을 검사하는 함수를 넣어줄 수 있다. react-redux 에는 `shallowEqual` 을 utility 함수로 제공해주기 때문에 이걸 넣어줘도 되고, 아니면 Loadsh의 `_.isEqual()` 을 써줘도 된다.

### 2. props는 closure를 이용하고 항상 주의하자.

위에서 `useSelector` 의 두 번째 인자로 동일성 검사 함수를 넣어준다고 했다. 그러면 기존에 두 번째 인자였던 props는 어떻게 넣어줄까?

간단하다. Hook은 컴포넌트 내에 존재하기 때문에 셀렉터 함수 안에 써주기만 하면 된다. 

**그런데 조금 주의해야 한다.**

예를 들어, 부모 컴포넌트와 자식 컴포넌트가 모두 connected로 연결되어 있다고 해보자.

부모 컴포넌트는 현재 선택된 **todo**의 id를 자식에게 props로 전달하고 자식 컴포넌트는 `mapStateToProps` 에서 `state.todos[props.id].name` 와 같은 방식으로 그 id에 해당하는 todo를 가져온다고 해보자.

이 때, 부모 컴포넌트에서 어떤 이벤트에 의해서 현재 id에 해당하는 todo를 삭제하는 액션을 디스패치한 후, 다른 todo의 id를 자식 컴포넌트에 보낸다고 했을 때 어떤일이 발생할까? 

react-redux 의 버전 5 이전까지는 새로운 props인 id를 받기 전에 스토어가 업데이트 되었다는 이벤트를 먼저 받게 된다. 즉, state는 업데이트 된 것을 참조하는데, props는 이전 id를 참조 하기 때문에 삭제된 todos를 가져오려고 시도하게 된다.

react-redux의 버전 5 부터는 이러한 문제를 해결하기 위해 시도하였고, 7버전 부터는 `connect()` 내부에서 `Subscription` 이라는 클래스를 사용하여서 connect된 컴포넌트들의 트리를 만들어준다. 그리고, 트리에 하단에 있는 컴포넌트는 트리 상단 컴포넌트의 업데이트가 끝났을 때, 즉 props가 업데이트 되었을 때만 스토어 업데이트 이벤트를 받아서 문제를 해결할 수 있게 된다.

**문제는 useSelector에는 이것을 적용할 수가 없다!**

애초에 connect에만 적용되어있고 `useSelector` 에 적용하지 않은 이유는, 위 문제를 해결하기 위해서는 각 connect된 컴포넌트의 트리를 만들 때 React 컨텍스트의 API를 이용하여 컨택스트 `Provider`로 감싸줘야 한다. `connect()` 처럼 HOC를 이용하면 이는 간단하게 할 수 있지만, Hook에서 직접 랜더는 할 수 없는 일이다.

이를 해결하기 위한 방법 세 가지가 있다.

1. props를 셀렉터에서 쓰지 말자. 동일성을 위해 스토어에 원래 props에서 쓰던 값을 넣던가, 이미 연결된 컴포넌트에서 필요한 데이터를 props로 넘겨주던가 하자.
2. 좀 더 방어적인 셀렉터를 만들자. 위 예와 같은 경우에서는 먼저 `state.todos[props.id]` 가 있는지 확인 한 후, `name` 을 가져오도록 하자.
3. `connect` 를 넣으면 가장 최근 props를 받을 수 있다. `useSelector` 를 쓰는 경우, 그 상위에 `connect` 된 컴포넌트를 넣어주자. 위에서 말한 `Subscription` 은 `connect` 된 컴포넌트가 있을 때, React의 컨택스트 api를 통해서 그 하위에 있는 컴포넌트가 store를 직접 subscript하지 않고,  부모 컴포넌트의 이벤트를 구독하게 하여 부모 컴포넌트의 업데이트가 마친 후에 하위 컴포넌트가 업데이트 되도록 딜레이를 준다.

# useDispatch

`useDispatch` 는 redux에서 사용할 수 있는 dispatch를 반환해주는 역할을 한다. 인자도 없고 설정할 것도 없다.
```js
  const dispatch = useDispatch();
```
기존 `mapDispatchToProps` 를 대신한다는 느낌은 들지 않는다. 

왜 이렇게 사용하는지, 어떻게 사용할지 알아보자.

### 1. dependency가 너무 많다.

원래 alpha의 4버전까지는 `useActions` 라는 API가 있었다.  기존 `mapDispatchToProps` 처럼 `bindActionCreators` 를 사용하여 dispatch를 바인딩해주는 방식이였다. 하지만, Hooks 에서는 이런 문제가 있었다.
```js
  function App() {
    const actions = useActions(someActions);
    useEffect(() => {
      actions.foo();
      actions.bar();
      actions.baz();
    }, [actions.foo, actions.bar, actions.baz]);
  }
```
Action Creator들은 컴포넌트에 묶여있지 않는 순수 함수들이므로 hook의 dependency에 있을 필요가 없다.  `useActions` 는 불필요하게 그 둘 사이에 바인딩이 생기게 하여 dependency에 넣도록 한다. 그 대신, react-redux는 `useDispatch` 를 사용하도록 함에따라 기존 방식 대신 직접 호출하도록 하였다.
```js
  function App() {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(someActions.foo());
      dispatch(someActions.bar());
      dispatch(someActions.baz());
    }, [dispatch]);
  }
```
### 2. 기존처럼 사용하고 싶다!

기존 `useActions`를 사용하고 싶다면, 편리한 hook을 이용해서 커스텀 hook을 만들자.
```js
  import { bindActionCreators } from 'redux'
  import { useDispatch } from 'react-redux'
  import { useMemo } from 'react'
  
  export function useActions(actions, deps) {
    const dispatch = useDispatch()
    return useMemo(() => {
      if (Array.isArray(actions)) {
        return actions.map(a => bindActionCreators(a, dispatch))
      }
      return bindActionCreators(actions, dispatch)
    }, deps ? [dispatch, ...deps] : deps)
  }
```
## 그 외

### memo

기존의 connect를 사용할 때는,  `pure` 옵션이 있었는데 기본 값이 true였다. 이는 `PureComponent` 또는 `memo` 역할을 해줬는데, hook을 사용할 때는 당연히 그 기능이 존재하지 않는다.

따라서, 성능상의 이점을 가져오고 싶을 때는 `memo` 를 사용하도록 하자. 

## 결론

기존에 있던 API가 Hook으로 지원함에 따라 나타나는 변화도 있지만, equality check 부분 처럼 아예 바뀐 부분도 있으므로 주의해서 사용해야겠다.

개인적으로 기존 방식보다 몇 배는 편하게 사용중이다!