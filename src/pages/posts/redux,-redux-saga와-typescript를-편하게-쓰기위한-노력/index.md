---
title: "redux, redux-saga와 typescript를 편하게 쓰기위한 노력"
date: "2019-08-30"
tags:
  - redux
  - redux-saga
  - typescript
categories:
  - dev
---

redux, redux-saga, typescript는 내가 개발을 하며 주로 사용해왔던 스택들이다. React 개발을 할 때 많이 사용해왔고 어떻게 하면 더 편하게 쓸 수 있을지 고려해왔다. 특히, typescript를 사용하기 시작하면서 더 많이 고민했다. Typescript가 주는 좋은 장점들을 얻기 위해 짜는 코드는 기존의 코드보다 크기도 커지고 고려해야할 점도 많아진다.

Redux와 같은 외부 라이브러리를 사용할 때에도 마찬가지인데, 전체 스토어의 타이핑, 디스패치되는 액션의 타이핑, 디스패치 되는 액션의 타이핑에 따라 리듀서에서 어떻게 분기할 것인가 등 초기 타이핑을 잘해놔야 typescript의 이점을 누리면서도 편하게 개발할 수 있다.

어떤 방법으로 사용할지에 대해 최고의 방법은 없는 것 같다. 각자 선호하는 방식으로 개발하기 마련인데, 내가 선호하는, 해왔던 방법을 적어보려고 한다.

## Redux

Redux를 사용할 때 액션의 타입에 따라 리듀서에서 분기되어야 하기 때문에 그 타이핑이 중요하다.

typescript 3.4에서 `as const` 구문이 나옴에 따라서 타이핑이 많이 편해졌다. 리듀서에서 액션타입의 string 값에 따라 분기를 해줘야하는데, 기존에는 string으로 값을 정해주고, 타입을 따로 지정해주어야 했다.

```tsx
// 액션 타입
const INCREASE = "INCREASE";
// 액션 크리에이터
type INCREASE = {
  type: typeof INCREASE;
};
const increase = (): INCREASE => ({ type: INCREASE });
```

`as const`를 이용하면 따로 타입을 지정해줄 필요없이 typescript의 유틸리티 중 하나인 `ReturnType`을 이용해 타입을 추론할 수 있다.

```tsx
// 액션 타입
const INCREASE = "INCREASE" as const;
// 액션 크리에이터
const increase = () => ({ type: INCREASE });
type Increase = ReturnType<typeof increase>;
```

리듀서로 들어오는 액션의 타입도 지정해주어야 하므로 여러 액션이 있을 때, 이 액션들을 모아 유니온 타입으로 만들어주어야 한다.

```tsx
const INCREASE = "INCREASE" as const;
const DECREASE = "DECREASE" as const;

const increase = () => ({ type: INCREASE });
const decrease = () => ({ type: DECREASE });

type Increase = ReturnType<typeof increase>;
type Decrease = ReturnType<typeof decrease>;

type Actions = Increase | Decrease;
```

그리고 리듀서를 다음과 같이 만들면 타이핑에 따른 분기가 잘 되는 것을 볼 수 있다.

```tsx
type State = {
  count: number;
}
const initialState: State = {
  count: 0,
};
const reducer = (state: State, action: Actions) => {
  switch (action.type) {
    case INCREASE: {
      return { count: state.count + 1 },
    }
    case DECREASE: {
      return { count: state.count - 1 },
    }
    default:
      return initialState;
  }
}
```

여기까지는 괜찮았는데, 비동기 작업이 조금 골치아팠다. 보통 비동기 작업에 대한 요청/성공/실패 3가지 액션에 대해 모두 타이핑을 해주는 것이 코드 크기를 많이 키우는 주 원인이었다. 이를 좀 편하게 하기위해 다음과 같은 유틸리티 함수를 만들었다.

```tsx
// 비동기 액션 타입들
const ASYNC_REQUEST = "ASYNC_REQUEST" as const;
const ASYNC_SUCCESS = "ASYNC_SUCCESS" as const;
const ASYNC_FAILURE = "ASYNC_FAILURE" as const;

// 비동기 액션 크리에이터 만들기
const createAsyncActions = <R, S, F>(request: R, success: S, failure: F) => <
  RP,
  SP,
  FP
>() => ({
  request: (payload: RP) => ({ type: request, payload }),
  success: (payload: SP) => ({ type: success, payload }),
  failure: (payload: FP) => ({ type: failure, payload })
});

// 비동기 액션 크리에이터
const asyncActions = createAsyncActions(
  ASYNC_REQUEST,
  ASYNC_SUCCESS,
  ASYNC_FAILURE
)<Param, Res, Error>();
```

이런식으로 이 유틸리티를 만들어 놓고 비동기 액션에 사용하면 더욱 편해진다. 유니온타입의 액션을 만들때도,

```tsx
type ActionTypes<
  T extends { [K in keyof T]: (...args: any[]) => any }
> = ReturnType<T[keyof T]>;

// 유니온 타입의 비동기 액션들
type Actions = ActionTypes<typeof asyncActions>;
```

이런식으로 편리하게 request/success/failure 세 가지 액션타입들을 추출할 수 있다.

대부분의 비동기 액션들은 Api 요청과 관련된 것이므로, 그러한 요청들은 Api 타입에 맞춰서 타이핑을 하는 것이 좋다. 이전에 방식은 각각 비동기 액션의 인자들을 제네릭에 직접 넣어주는 방식이였다면, 이 방식은 그 인자들을 Api로 부터 추출하는 방법이다.

```tsx
// 비동기 액션 타입들
const LOGIN_REQUEST = "LOGIN_REQUEST" as const;
const LOGIN_SUCCESS = "LOGIN_SUCCESS" as const;
const LOGIN_FAILURE = "LOGIN_FAILURE" as const;

// API
type ApiCall<T extends any[], R> = (...args: T) => Promise<R>;
const login = async (form: { username: string; password: string }) =>
  await axios.post<{ data: LoginResponse }>("myloginapi", form);

// 비동기 액션 크리에이터 만들기 (api)
const createApiActions = <R, S, F>(request: R, success: S, failure: F) => <
  P extends any[],
  R
>(
  api: ApiCall<P, R>
) => ({
  request: (...args: P) => ({ type: request, payload: args }),
  success: (payload: R) => ({ type: success, payload }),
  failure: (error: Error) => ({ type: failure, payload: error })
});

const loginActions = createApiActions(
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE
)(api);
```

이런식으로 Api에 대한 비동기 액션들은 Api로 부터 타입을 추출하여 사용한다.

## Redux-Saga

사가를 사용할때 단순히 Api를 요청하고 응답에 따라 스토어를 업데이트 하는 작업은 사가의 [real-world-example](https://github.com/redux-saga/redux-saga/blob/master/examples/real-world/sagas/index.js)에 있는 entity를 이용하는 방법이다.

사가에 비동기 호출을 요청하고, 그에 따라 Api 호출/성공/실패에 대한 작업을 하나의 함수로 만든 것인이다.
원래는 스토어를 한 번 더 업데이트하여, 스토어를 구독하고 있는 컴포넌트가 현재 구독하고 있는 부분의 상태 전과 후를 비교하는 로직을 한 번 더 수행하기 때문에 사용하지 않았었다. 그런데 사용해보니 확실히 편하고, 그 코스트가 매우 적기 때문에 단순한 작업에서는 사용하고 있는 방법이다.

이 함수는 이렇게 생겼다.

```js
function* fetchEntity(entity, apiFn, ...params) {
  yield put(entity.request(...params))
  try {
    const data = yield call(apiFn, ...params);
    yield put(entity.success(data));
  }
  catch (err: Error) {
    yield put(entity.failure(err.message));
  }
}
```

이 방식을 typescript와 함께 사용해보자.

먼저 `entity`는 아까 만들었던 요청/성공/실패에 해당하는 액션 크리에이터가 들어있는 객체라고 할 수 있다.
`params`의 타입은 아까와 같이 Api로 부터 추출할 수 있다. Api를 요청할 때 넣어줄 인자들이 `...params`이므로 `apiFn`에 대한 인자를 제네릭으로 받아서 처리해주자.

```tsx
export const fetchEntity = <
  R extends Function,
  S extends Function,
  F extends Function,
  Param extends any[],
  Res
>(
  entity: Entity<R, S, F>,
  api: ApiCall<Param, Res>
) => {
  return function*(...p: Param) {
    yield put(entity.request(...p));
    try {
      const data = yield call(api, ...p);
      yield put(entity.success(data));
    } catch (err) {
      yield put(entity.failure(err.message));
    }
  };
};
```

기존 방식과 달리 `bind`를 사용하지 않는 이유는, `bind`를 사용하면 반환하는 제네레이터 함수 인자의 제네릭 타입이 제대로 추론되지 않기 때문이다.

위에서 한 내용들을 전부 합쳐서 사가에서 사용할 때는 이런식으로 사용해줄 수 있다.

```tsx
// 로그인 API
const login = async (form: { username: string; password: string }) =>
  await axios.post<{ data: LoginResponse }>("myloginapi", form);

// 위에서 만든 로그인에 대한 액션 크리에이터들
const loginActions = createApiActions(
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE
)(api);

// entity 함수
const fetchUser = fetchEntity(loginActions, login);

function* user() {
  const { payload } = yield take(LOGIN_REQUEST);
  yield call(fetchUser, payload);
}
```

여기까지도 만족스럽지만, 사가에 대한 요청과 Api에 대한 요청을 구분해놓으면 더 좋다. 컴포넌트 내에서 디스패치하는 데이터와 실제 Api 인자로 보내는 데이터가 달라야 하는 경우가 꽤 있다. 위 `redux-saga`의 [real-world-example](https://github.com/redux-saga/redux-saga/blob/master/examples/real-world/sagas/index.js) 처럼 Api 인자로 보낼 데이터를 전처리하거나 Api를 호출할지 말지 결정하는 과정을 사가내에서 편하게 할 수 있다.

```tsx
const loginAction = (user: User) => ({ type: LOGIN, payload: user });

// 위에서 만든 로그인에 대한 액션 크리에이터들
const loginActions = createApiActions(
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE
)(api);

function* user() {
  const { payload } = yield take(LOGIN);
  const currentUser = yield select((state: RootState) => state.currentUser);
  if (payload !== currentUser) {
    yield call(fetchUser, payload);
  }
}
```

이런식으로 사용하면 원하는 것을 다 할 수 있다.

### 결론

이렇게 찾는 과정이 최근에 개발하면서 가장 재미있었던 부분인 것 같다. 지인 덕분에 좋은 방법을 찾을 수 있었다. typescript가 커지다 보니 그에 대한 유틸리티들도 엄청 많아지고 있는데, 직접 만들어보다가 한 번 써보고 비교해보며 나한테 맞는 옷을 찾아봐야겠다.
