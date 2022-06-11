---
title: Redux - selector 패턴과 reselect
date: '2018-07-25'
categories:
  - dev
tags:
  - react
  - redux
---

redux는 하나의 store를 통해 어플리케이션의 state를 관리한다. 우리는 `setter` 와 같이 action/reducer를 통해 state를 변경하고 관리한다. selector는 `getter`와 같은 느낌이다. selector를 사용했을 때 장점과 왜 써야하는지에 대해 알아보자.

<!--more-->

## Selector란?

Selector는 state에서 필요한 데이터를 가져오거나, 계산하여 가져오는 역할을 한다. selector를 써야할 이유는 여러가지가 있다.

1. 데이터에 대한 계산을 selector가 해주어서, redux가 적은 양의 필요한 데이터만을 가지고 있게 도와준다.

2. state를 가져오는 컴포넌트들과 state의 구조 사이 한 층(selector)을 두어 구조가 바뀌어도 연관된 모든 컴포넌트를 바꿀 필요 없이, selector만 바꿔주면 된다.

3. **reselect**를 이용할 경우 memoization 적용하여 불필요한 재계산을 방지하여 효율적이다.

하나씩 알아보도록 하자.

예를 들어,

```js
state = {
  todos: [
    {
      description: 'do my homework',
      isCompleted: false,
    },
    ...,
  ],
};
```

위와 같은 State가 있을 때, 완료된 ( `isCompleted: true` )인 todo들을 가져오고자 한다. 여러가지 방법이 있다.

```js:title=reducer.js
  function todo = (state, action) => {
    switch (action.type) {
      case 'ADD_TODO':{
        const newTodo = [...state.todos, action.todo];
        return {
          todos: newTodo,
          compledtedTodos: newTodo.filter(todo => todo.isCompleted),
        }
      }
    ...
    }
  }
```

`combineReducers`로 합친 여러 reducer 중 하나로 가정하자.
위와 같이 `completedTodos` 필드를 만들어서, `todos`에 맞춰 `completedTodos`를 바꿔준다. 이렇게 하면 데이터의 중복이 생겨 redux가 불필요하게 커진다. 다른방법으로는,

```jsx:title=todolist.js
const TodoList = ({ todos }) => {
  const getCompletedTodos = list => list.filter(item => item.isCompleted);
  return (
    <div>
      {
        getCompletedTodos(todos).map(todo => <li>{todo.description}</li>)
      }
    </div>
  );
}

export default connect(state => ({ todos: state.todo.todos })(TodoList);
```

데이터를 component 안에서 가공하는 방법이다. 간단하지만 component가 업데이트 될 때마다 `getCompleteTodos`의 계산이 반복된다. 이 같은 단점은 selector를 통해 처리할 수 있다.

```jsx:title=todolist.js
const TodoList = ({ completedTodos }) => (
  <div>
    {
      completedTodos.map(todo => <li>{todo.description}</li>)
    }
  </div>
);

export default connect(state => ({
  completedTodos: state.todo.todos.filter.map(todo => todo.isCompleted),
})(TodoList);
```

가장 단순한 방법으로 selector를 적용한 방법이다. redux의 state를 props로 가져올 때 계산을 해서 가져오도록 하여, 불필요한 계산을 막는다. 조금 더 개선하여 재사용성을 높여보자.

```js:title=reducer.js
export const getCompletedTodos = state => state.todo.todos.filter.map(todo => todo.isCompleted);
```

```jsx:title=todolist.js
import { getCompletedTodo } from './reducer.js';

const TodoList = ({ completedTodos }) => (
  <div>
    {
      completedTodos.map(todo => <li>{todo.description}</li>)
    }
  </div>
);

export default connect(state => ({
  completedTodos: getCompleteTodos(state),
})(TodoList);
```

reducer나 selector 파일에 selector 함수를 만들어 export하면 어떤 컴포넌트에서도 사용할 수 있다. 또 한, `state.todo`를 인자로 주기보단 `state`를 인자로 주면 state의 구조가 바뀌어도 `getCompleteTodos` 함수만 바꿔주면 불필요한 수고를 덜 수 있다.

이 정도도 좋아보이지만 문제가 있다. store가 업데이트 될 때마다 `getCompleteTodos`는 매 번 계산을 하게된다. `mapStateToProps`는 redux store의 업데이트를 `subscribe` 한다. 이는, store가 업데이트 될 때마다 `mapStateToProps`가 호출된다는 것을 의미한다. 이러한 문제를 해결할 수 있는 방법은 바로 [reselect](https://github.com/reduxjs/reselect) 라이브러리를 이용하는 것이다.

## Reselect

reselect는 기본적으로 위에 만들었던 selector와 같은 역할을 한다. 하지만 추가적인 기능이 있다.

먼저, memoization을 이용한다. 즉, 이전에 계산된 값을 캐시에 저장하여 불필요한 계산을 없앤다. 어떻게 적용하는지 코드를 보자.

```js:title=reducer.js
import { createSelector } from 'reselect';

// 이 함수도 state에서 todos를 가져오는 selector 이다.
const getTodos = state => state.todo.todos;

export const getCompletedTodos = createSelector(getTodos, todos =>
  todos.filter(todo => todo.isCompleted),
);
```

`createSelector`가 우리가 바라는 역할을 해준다. 첫 여러인자 또는 배열안에 인자는 `inputSelectors` 라고 할 수 있는데, 이 또한 selector로서 인자로 받는 state에서 우리가 필요한 부분을 가져오는 역할을 한다. 그 다음 인자인 함수에서는 inputSelectors에서 반환된 값을 인자로 받아 계산을 수행한다. 여기서는 간단하게 표현하기 위해 한 reducer에서 값을 가져왔지만 보통은 여러개의 reducer에서 값을 가져와 계산하는 작업을 수행한다.

```js
import { createSelector } from 'reselect';

const getTodos = state => state.todo.todos;
const getFilter = state => state.filter.filter;

export const getCompletedTodos = createSelector([getTodos, getFilter], (todos, filter) =>
  todos.filter(todo => todo.isCompleted === filter),
);
```

이런식으로 두 state에서 가져온 값을 적용시켜 결과를 가져올 수 있다.

아까 말했듯이 reselect는 memoization이 적용되는데, 그 기준이 되는 값은 `inputSelector`의 결과값이다. 이 값이 바뀌지 않고 store가 업데이트 되었을 때, reselect는 저장된 cache 값을 사용하여 불필요한 재계산을 하지 않도록 해준다.

## 결론

개인적으로 처음 selector 패턴과 reselect를 보았을 때는 redux를 고급스럽게? 조금 더 깊게 사용하기 위한 방법으로 다가왔었다. 하지만, 필수적인 요소이다. reselect 또한 사용하지 않을 이유가 없다.
