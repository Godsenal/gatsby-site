---
title: nextjs와 redux-saga 사용하기
date: "2020-01-12"
tags:
  - react
  - redux
  - redux-saga
  - nextjs
categories:
  - dev
---

사이드 프로젝트를 진행하며 [nextjs](https://nextjs.org/)와 [redux-saga](https://github.com/redux-saga/redux-saga)를 함께 사용하기로 하였다. 해당 프로젝트 세팅을 하면서, 서버 사이드 렌더링 환경에서 redux-saga를 어떻게 사용해야 하는지 알아본 내용을 정리해보자!

## SSR과 redux-saga

보통 SSR 프로젝트에 redux를 사용할 경우, 페이지가 로드되기전 필요한 액션들을 디스패치한 후, [redux-thunk](https://github.com/reduxjs/redux-thunk)와 같은 미들웨어를 사용하여 액션 디스패쳐가 주는 프로미즈를 전부 기다린 다음 스토어를 주입시켜준다.

하지만, redux-saga를 사용할 경우 내부적으로는 프로미즈를 사용하지만만 액션 디스패쳐가 주는 프로미즈는 존재하지 않으므로 이런 방식을 사용할 수는 없다.
대신, redux-saga에서는는 task(`fork`나 `runSaga`)에 대한 프로미즈를 `toPromise()` api를 통해 얻을 수 있다. `fork` 로 생성한 작업이나나, `runSaga` 로 생성한 전체 saga 작업에 대한 프로미즈를 받는 식이다.

물론, 각각 작업에 대한 프로미즈를 받아서 처리할 수도 있으나나, SSR로 작업을 할 때는 `runSaga`로 생성한 전체 작업 즉, root saga에에 대한 프로미즈를 받아 처리할 수 있다.
saga의의 작업은 특정 액션이 디스패치되는 것을 기다린 후(`take`) 그에 해당하는 작업을 계속해서(`while (true)`) 처리하도록 구성하기 때문에, 특정한 처리를 해주지 않으면 전체 작업이 끝나는 것에 대한 프로미즈가 완료되기를 기다릴 수 없다.

이에 대한 방법으로 `END`를 사용할 수가 있다. `END` 는 redux-saga에서 제공하는 특정한 유형의 액션으로 `END`가 디스패치 된 후에는 그 채널을 닫게 된다. `END`가 나오기 전까지는 어떤 페이지가 로드되기 위해서 완료되어야 하는 task를 찾고, 해당하는 task의 promise를 찾아서 기다린 후 완료된 후에 페이지를 제공하는 방식이였다. `END`를 사용하게 되면 특정 액션을 기다리고 있는 `take`는 `END` 액션을 받고 해당 saga task를 종료시킨다. task가 종료되면 해당 task를 생성한 부모 task도 연속적으로 종료되어 결과적으로 root saga가 종료되고, 기다리고 있던 프로미즈가 resolve되는 방식이다.

여기서 파생된 task에서 `take`로 `END` 액션을 받아 종료되고, 그 task를 생성한 부모 task에서 `take`를 하고 있는 경우에는 작업이 끝나지 않느냐는 의문이 들 수있다.

```js
function* child() {
  while (true) {
    yield take(SOME_ACTION);
    yield fork(task);
  }
}
function* parent() {
  while (true) {
    yield take(ANOTHER_ACTION);
    yield call(child);
  }
}
```

하지만 `dispatch(END)`가 호출되면 채널이 닫히므로 뒤따라오는 모든 `take`도 `END` 액션을 받아 종료된다. 즉, `child` task가 `END`로 종료된 후, `parent` task의 `take` 에서도 `END` 를 받고 종료되는 방식이다. `parent`도 종료되고 모든 task가 종료되어어 root saga task에 대한 프로미즈의 resolve를 확인할 수 있을 것이다.

## nextjs와 redux-saga

이제 SSR 환경에서 redux-saga를 어떻게 사용해야 할지 알았으니, 이를 next에 적용해보자.
그러기 위해선 먼저 nextjs에 redux를 적용시켜야 한다. 이를 위해서 [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper) 라이브러리를 사용하였다. 특별히 해주는 큰 작업은 없고, SSR 환경에서 redux 스토어를 만들어주는 작업을(서버사이드일 경우 스토어를 생성해주고, 클라이언트 사이드일 경우 `window` 객체에서 스토어를 가져오는 작업) 해주어 스토어를 next의 context에 주입시켜주는 HOC를 제공해준다.

제공해주는 HOC로 [pages/\_app](https://nextjs.org/docs/advanced-features/custom-app) 파일 컴포넌트를 감싸주면 된다.

```js
const createStore = initialState => {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(rootSaga);

  return store;
};

class App extends NextApp {
  static async getInitialProps(context) {
    const { Component, ctx } = context;
    const { store, isServer } = ctx; // next의 context에서 store을 받을 수 있게된다.

    const pageProps = (await Component.getInitialProps?.(ctx)) || {};
    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(createStore)(App);
```

이렇게 redux와 redux-saga 설정을 간단히 끝낼 수 있다. 하지만 아직 특정 컴포넌트의 `getInitialProps`에서 어떤 saga task를 실행하는 액션을 디스패치 하여도, 그 작업이 끝난 후의 스토어가 제공되는 것이 보장되지는 않는다. 모든 saga task가 완료된 후에, `App` 컴포넌트의 `getInitialProps`가 끝나는 것을 보장하기 위해서 `createStore`와 `App`을 다음과 같이 바꿀 수있다.

```js
const createStore = initialState => {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  store.sagaTask = sagaMiddleware.run(rootSaga); // rootSaga의 task를 store 객체에 넣어준다.

  return store;
};

class App extends NextApp {
  static async getInitialProps(context) {
    const { Component, ctx } = context;
    const { store, isServer } = ctx;

    const pageProps = (await Component.getInitialProps?.(ctx)) || {};
    if (isServer) {
      // getInitialProps를 호출하는 환경이 서버일 경우에는는 모든 sagaTask가 완료된 상태의 스토어를 주입시켜줘야 한다.
      store.dispatch(END); // redux-saga의 END 액션 이용하여 saga task가 종료되도록 한다.
      await store.sagaTask.toPromise(); // saga task가 모두 종료되면 resolve 된다.
    }
    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}
```

위와 같이 코드를 바꾸면, 특정 Component의 `getInitialProps`에서 saga task를 실행하는 액션을 디스패치 한 후, `store.dispatch(END)`를 통해 해당 task를 포함한 다른 task를 종료되면 `store.sagaTask.toPromise()` 가 resolve 된다.

## 연속적인 saga task

위 코드로는 특정 Component의 `getInitialprops`가 생성한 saga task에서 어떤 비동기 작업을 한 후에 또다른 액션을 디스패치하는 경우, 그에 대한 대응은 하지 못한다.
예를들어,

```js
// SomePage.jsx
const SomePage = () => {
  return <div>안녕!</div>;
};

SomePage.getInitialProps = async context => {
  context.store.dispatch(SOME_ACTION);
};

// saga.js
function* someTask() {
  yield take(SOME_ACTION);
  yield call(asyncTask);
  yield put(ANOTHER_ACTION);
}

function* anotherTask() {
  yield take(ANOTHER_ACTION);
  yield call(subTask);
}
```

이러한 구조가 있을 때, `SOME_ACTION` 이 디스패치 된 후에는 위 `App.getInitialProps`에서 `dispatch(END)`가 호출되므로, `anotherTask`는 그대로 종료된다.
물론, 이러한 구조는 SSR 환경에서 모든 task가 끝나기 전까지 페이지 로드를 늦추기 때문에 피하는 것이 좋겠지만, 필요한 경우 다른 방법을 사용하여야 한다.

`someTask`가 페이지 전반적으로 필요한 인증 정보같은 경우, `App` 내에서 saga를 사용하지 않고 실행하여 완료된 후 후속 작업을 진행하는게 바람직하다고 생각한다.
그렇지 않다면, `dispatch(END)`를 피할 수 있는 `someTask`와 `anotherTask` 간의 사용할 saga 채널을 따로 만들 수도 있다.

하지만, 이를 위해서는 위와 같은 연결이 있는 task 간의 채널을 매번 만들어주어야 하기 때문에, 특정 액션을 비동기적으로 기다릴 수 있는 미들웨어를 만드는 방법을 택했다.

```js
import { Middleware, Action } from "redux";

const createMiddleware = () => {
  let waitingActions = []; // 기다리고 있는 액션타입과 해당 프로미즈의 resolve.

  const resolver = action => {
    const needToResolve = [];
    // 현재 dispatch 된 액션 중 기다리고 있는 액션이 있는 경우 resolve 해준다.
    waitingActions = waitingActions.filter(({ type, resolve }) => {
      if (type === action.type) {
        needToResolve.push(resolve);
        return false;
      }
      return true;
    });
    needToResolve.forEach(resolve => resolve(action));
  };

  async function waitAction(type) {
    const action = await new Promise(
      resolve => waitingActions.push({ type, resolve }) // 기다릴 type과 프로미즈의 resolve를 waitingActions 큐에 넣어준다.
    );
    return action;
  }

  const middleware = () => next => action => {
    const returnValue = next(action);
    resolver(action);
    return returnValue;
  };

  return [middleware, waitAction];
};

const [middleware, waitAction] = createMiddleware();
```

특정 액션이 디스패치되기를 기다리는 프로미즈를 생성하는 `waitAction`과 액션이 디스패치될 때, 현재 기다리고 있는 액션이면 이를 resolve 시켜주는 미들웨어를 만들었다.
이 미들웨어를 redux 미들웨어에 넣어주면, 아까와 같은 문제는 다음과 같이 해결할 수 있다.

```js
// SomePage.jsx
const SomePage = () => {
  return <div>안녕!</div>;
};

SomePage.getInitialProps = async context => {
  context.store.dispatch(SOME_ACTION);
  await waitAction(ANOTHER_ACTION);
};

// saga.js
function* someTask() {
  yield take(SOME_ACTION);
  yield call(asyncTask);
  yield put(ANOTHER_ACTION);
}
function* anotherTask() {
  yield take(ANOTHER_ACTION);
  yield call(subTask);
}
```

`SomePage.getInitialProps`는 이제 `ANOTHER_ACTION`이 디스패치 된 후에 resolve 되므로, 이후 `dispatch(END)`가 호출되어도 `subTask` 가 완료된 후 sagaTask가 종료된다. 또는 아예 `someTask` 에서 `put(ANOTHER_ACTION)`을 제거하고, `SomePage.getInitialProps`에서 디스패치할 수도 있다.

깔끔한 것 같지는 않으나, 해당 문제는 해결할 수 있을 것 같다. 조금 더 좋은 방법을 찾아보고 싶기는 하다.
