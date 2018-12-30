---
title: Javascript - Decorator 문법
date: "2018-10-22"
categories:
  - dev
tags:
  - javascript
---

Javascript가 정말 빨리 바뀌고 있다. 하루가 멀다 하고 새로운 문법들이 추가되고, proposal 들이 추가되고 있다. 이번에는 그 중에서도 많이 쓰이고 있는 Decorator(현재 2018/10/22 기준 state-2)에 대해 알아보자.

<!--more-->

## Decorator란?

**Decorator**는 이름과 같이 decorating을 해주는 문법이다. higher-order function과 같이 어떤 코드를 다른 코드로 감싸준다.

```js
function work() {
  console.log('Some work...');
}
function helloWrapper(wrapped) {
  return function(...args) {
    else {
      console.log('Hello!');
      wrapped.apply(this, args);
    }
  }
}

const wrapped = helloWrapper(work);
```

위 코드는 새로운 함수 `wrapped`를 반환해준다. 이 함수는 `helloWrapper` 라는 higher-order function으로 `work`를 감싸주어 일하기 전에 인사를 추가해주는 함수이다.

```js
work();
// Some work...

wrapped();
// Hello!
// Some work...
```

위와 같은 higher-order function의 가장 큰 목적은 재사용성일 것이다. 위와 같은 방법으로, hello를 출력하고 싶은 함수마다 `console.log('Hello');`를 작성해야 하는 번거로운 일은 없어진다.

**Decorator**도 마찬가지이다. 코드의 재사용성을 높여줄 수 있다.

## 왜 Decorator를 사용하는가?

higher-order function으로 충분히 가능하지 않은가? 라고 말할 수 있지만, 몇 가지 장점이 있다.

- Higher-order function보다 적용하기 쉽다. 특히, Class나 Class member들에 적용할 때는 훨씬 편하다.
- 읽기 쉽고 코드를 조금 더 깔끔하게 할 수 있다.
- Javascript의 새로운 문법이니 만큼 써보고 싶은 마음이 생긴다..

아직은 Class나 Class mebmer들에게만 적용할 수 있지만, 이 부분에서 higher-order function보다는 조금 더 쉽게 다가온다.

## 어떻게 사용하는가?

여러 언어에 Decorator가 있다. 기본적으로 어떤 함수를 인자로 받아서 그 함수의 기능을 좀 더 확장시켜 반환하는 함수이다. Javascript에서 Decorator는 타입에 따른 인자를 받아 클래스나 그 멤버들을 변경,확장 시켜주는 함수이다.

Decorator도 함수이므로, 함수를 선언하고 Decorator하면 자주 봤을 `@`를 사용해 Class 등을 꾸민다.

### Class

먼저 Class 자체에 적용하는 decorator를 한 번 만들어 보며 어떻게 적용되는지 보자.
Class의 Decorator는 타겟 Class의 생성자를 인자로 받는다.

```js
// 아까 말했듯이, 그냥 함수다.
function whiteColor(target) {
  target.prototype.color = "white";
}

@whiteColor
class Paint {}

const snow = new Paint();
console.log(snow.color);
```

위의 코드는 편한 설명을 위한 코드다. class의 prototype을 저렇게 설정해주는게 좋은 방법은 아니다. 위 코드를 실행시키면 'white'가 출력될 것이다.

조금 더 응용해보자.

```js
function withColor(color) {
  return function(target) {
    target.prototype.color = color;
  };
}

@withColor("blue")
class Paint {}

const sky = new Paint();
console.log(sky.color);
```

위와 같이 팩토리 함수처럼 인자를 받은 후 그 인자를 사용하는 함수를 반환할 수도 있다.

### Class 멤버

Class 멤버 대해서도 적용할 수 있다.
class에서 받는 `target` 인자와 더불어, 그 멤버의 이름인 `name` 그리고 멤버의 `descriptor`를 받는다.
`descriptor`는 object의 property가 기본적으로 가지고 있는 속성으로 자세한 내용은 [여기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)서 알아보자. 기본적으로 javascript에서 property는 `string-valued name`(key)와 `property descriptor`로 이루어진다.

먼저 `property descriptor`을 사용하는 예를 보자.
그 속성 중 `writable`속성을 건드리면 간단하게 클래스 멤버를 `readonly`로 만들 수 있다.

```js
function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

class Example {
  @readonly
  readonlyFunc() {
    console.log("This method is readonly!");
  }
}

const example = new Example();
example.readonlyFunc = () => console.log("change!");
example.readonlyFunc(); // This method is readonly!
```

`writable`은 속성은 그 속성의 value가 바뀔 수 있는지 없는지를 나타낸다. 이를 false로 바꿈으로서 바꿀 수 없도록 해준다. 따라서 이 decorator를 사용한 멤버는 바뀔 수 없다!

다음에는 클래스에서 본 것 처럼 클로져를 이용하여 보자.

```js
function deprecate(message) {
  return (target, name, descriptor) => {
    const origin = descriptor.value; // property의 value
    descriptor.value = function(...args) {
      console.log(`Deprecate warning[${name}]: ${message}`);
      return origin.apply(this, args);
    };
    return descriptor;
  };
}

class Example {
  @deprecate('Consider to use "newFunc" instead')
  oldFunc() {
    console.log("This is old function.");
  }
  newFunc() {
    console.log("This is new function.");
  }
}

const example = new Example();
example.oldFunc();
// Deprecate warning[oldFunc]: Consider to use "newFunc" instead
// This is old function.
```

멤버 함수에 데코레이터를 사용하여 deprecate 메시지를 출력하는 예제이다.
descriptor의 value인 oldFunc를 따로 저장해두고, console을 출력한 후 저장해준 원 함수를 호출한다. 이 때 주의할 점은, descriptor value를 인라인 함수로 정의하지 않아야 한다는 점이다. 이는 `this`가 원하는 참조를 하기 위해서 이다.

현재 ECMAScript stage-3에 있는 class의 `instance field`에도 사용 가능하다. 위에서 사용한 readonly를 이용하여

```js
class Proposal {
  @readonly decorator = "stage-2";
  /*
    ...
  */
}
```

이런식으로 사용 가능하다.

## 번외- React에서 사용하기

React의 class 컴포넌트에서도 물론 decorator를 사용할 수 있다. 특히, Higher Order Component를 구현할 때, 꽤 편하게 사용할 수 있다. React Component도 당연히 클래스(stateful 일 때)이기 때문에 그 클래스를 인자로 받아와 원하는 동작을 해줄 수 있다.

```jsx
function withName(name) {
  return Comp => () => <Comp name={name} />;
}

@withName("app")
class App extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

위 코드는 실용성도 없고 의미도 없지만, 이런식으로 inject props를 하거나, 감싸줄 수 있다. 조금 더 실용적인 예제로는 react-redux의 `connect`가 있다.

```jsx
const mapStateToProps = state => ({
  todos: state.todos
});

@connect(mapStateToProps)
class App extends React.Component {
  render() {
    return (
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    );
  }
}
```

`connect`를 위와 같이 사용할 수 있다. 보통 쓰는 것 처럼 `connect(mapStateToProps)(App);` 과 같이 할 수 있고 이런식으로도 사용 가능하다.
