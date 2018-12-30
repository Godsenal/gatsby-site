---
title: Javascript에서 "this"와 React에서 binding
date: "2018-03-26"
categories:
  - dev
tags:
  - javascript
  - react
---

Javascript에서 `this` 는 다른 언어들과는 조금 다르다. 어떻게 쓰이는지 아직 완전히 이해되지는 않지만, 공부한 내용을 까먹기전에 적어보자.

<!--more-->

Javascript에서 `this`는 대부분의 경우 함수를 호출하는 방법에 의해 결정된다. (물론 `bind`를 이용해 이를 해결할 수 있다.)

## Global context

먼저 Global context (함수 밖)에서는 this는 global object를 의미한다.

```js
console.log(this); // 함수 밖 어딘가(Global context)에서 실행시
```

web browsers에서 이 경우는 window object를 출력할 것이다.

## Function context

다음으로 Function context (함수 안)에서 this는 함수를 어떻게 호출하느냐에 따라 달라진다.

```js
function foo() {
  console.log(this);
}
foo();
```

이 경우에는 위와 마찬가지로 this 는 global object를 의미하기 때문에 window object를 출력할 것이다. 만약 function의 this값을 임의로 지정해주고 싶다면, `call` 함수를 사용할 수 있다.

```js
var obj = { a: "my this" };
function foo() {
  console.log(this);
}
foo.call(obj);
```

`call` 함수는 첫 번째 인자를 함수에 줄 this값, 뒤 따라오는 인자는 함수의 인자들이다. 위와 같이 call을 사용하면 console에는 obj 객체가 나올 것이다.

```js
var obj = {
  a: "my this",
  foo: function() {
    console.log(this.a);
  }
};

obj.foo();
```

이번엔 함수가 object의 method로서 호출된 경우이다. 이런 경우에 this는 method가 호출된 object 즉, obj를 가리키고 console에는 my this가 호출될 것이다. 위 코드는

```js
var obj = {
  a: "my this",
  foo: function() {
    console.log(this.a);
  }
};

obj.foo.call(obj);
```

이런식으로 동작한다고 생각하면 될 것 같다.

## 생성자로서 함수

다음은 생성자로서의 함수이다.

```js
function Construct(arg) {
  this.arg = arg;
  console.log(this);
}
Construct(); // window를 출력
var obj = new Construct("arg"); // 생성된 obj를 출력
```

this를 출력하는 Construct라는 함수를 작성한 후 생성자로서의 역할 없이 호출해보고, `new`를 이용해 생성자로서 출력해보았다. 그냥 호출했을 때는 function context에서 정해진 this 값이 없으므로 global object인 window를 출력한다. 하지만 `new`를 이용해 생성자로서 호출했을 경우 순차적으로 이런 일이 발생한다.

1. Construct.prototype을 상속하는 새로운 객체가 하나 생성된다.
2. Construct로 넓겨준 인자와 (위의 예에선 `arg`), **새로 만들어질 Object로 bind된 `this`**와 함께 Construct가 호출된다.
3. 부가적으로, 만일 Construct 함수가 Object를 return 할 경우, new 로 인한 결과 값은 그 Object로 덮여씌워진다. 그렇지 않으면 1번에서 생성된 객체가 결과값이 된다.( 대부분의 경우)

new에 대한 설명은 [여기](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)

여기서 2번을 보면 Object로 bind된 this라고 나와있다. 이것은 다시말해서

```js
var boundContsruct = Construct.bind(obj, arg);
boundConstruct();
```

와 같다. 그러면 Construct 함수 안에 있는 this는 `obj`를 가리킬 것이다.

## Arrow function

`arrow function`은 기본적으로 this가 binding 되지 않는다. 자신의 this값을 갖지 않는다는 것은 다른 함수들과 다르게 실행될때 정해질 수 없다는 뜻이다. 그러므로 arrow function 안에서 this를 사용할 경우 arrow function이 만들어진 시점에서 context의 this값이 사용된다.

```js
function nested() {
  setTimeout(function() {
    console.log(this.arg);
  }, 1000);
}
function arrow() {
  setTimeout(() => {
    console.log(this.arg);
  }, 1000);
}
var obj = {
  arg: "arg"
};
nested.call(obj);
arrow.call(obj);
```

이 코드를 실행시켜보면 확실히 알 수 있다. 첫 번째 함수에서는 setTimeout이 일반 함수를 callback 한다. 이 callback은 this에 대한 아무 정의 없이 함수를 호출하기 때문에 그 상위 함수가 call함수를 통해 `obj`라는 this를 갖더라도 하위 함수는 global한 this값을 가지게 될 것이다.

하지만 arrow function을 사용하면 this는 그 context의 this를 받아온다. 두 번째 함수에서는 call 함수를 통해받은 `arg` 를 this로 가지는 함수안에 있으므로 'arg'를 출력할 것이다.

## React에서의 binding

그러면 React에서의 binding이 조금씩 이해가 간다.

```jsx
class Input extends Component {
  handleChange(e) {
    // ...
  }
  render() {
    return <input onChange={this.handleChange} />;
  }
}
```

위와 같은 코드의 문제점은 다 알 수 있다. `handleChange`를 this에 binding하지 않은 것이다. 이제 왜 binding을 해야하는지 알 수 있다. handleChange를 이 클래스 내부에서 사용하는 것은 아무 문제가 없다. 내부에서 `this.handleChange` 라고 작성하면 메소드로서 작동하기 때문에 this에 이 클래스가 알아서 binding이 될 것이다.

하지만 다른 컴포넌트나 window의 eventhandler가 함수를 사용한다면? 예를들어

```js
class myClass {
  myFunc() {
    console.log(this);
  }
}

var myclass = new myClass();
var myfunc = myclass.myFunc;
myfunc();
```

이러한 코드가 있다면 우리가 원하는 this값 ( myClass로 만들어진 객체에 해당하는 값 )을 얻을 수 없다. myfunc을 호출할 때 this값에 대한 어떠한 정의도 주지 않았기 때문이다. 그래서 binding을 해줘야한다.

```jsx
class Input extends Component {
  constructor() {
    // ...
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    // ...
  }
  render() {
    return <input onChange={this.handleChange} />;
  }
}
```

이렇게 함으로써 handleChange는 어디서 호출하든 원하는 this값을 얻을 수 있다. 또는 아까 했던 arrow function을 이용하면 binding도 하지 않을 수 있다. 그 전에 알아야 할 것이 있다. Javascript에는 사실상 class라는 개념이 존재하지 않는다. class는 사실 아까 봤던 생성자 함수이다.

```js
class myClass {
  constructor() {
    this.x = 1;
  }
  handle = () => {
    console.log(this);
  };
}
```

이것은 사실

```js
function myFunc() {
  this.x = 1;
  this.handle = () => {
    console.log(this);
  };
}
var newClass = new myFunc();
/*
    {
        x: 1,
        handle: () => {
            console.log(this);
        }
        ...
    }
    new Class는 이런 형태의 객체가 될 것이다.
*/
```

이것과 같다. 아까 생성자함수 에서 봤듯이 new operator를 통해 객체를 만들게 되면, 객체를 가리키는 this를 binding하여 생성자함수를 실행한다. 또 한, arrow function은 만들어진 시점에서 context의 this를 받는다.

여기서 `this.handle`이라는 arrow function안에 this는 new operator를 통해 만들어진 객체가 될 것이다. 이제 이 코드를 보자.

```jsx
class Input extends Component {
  handleChange = e => {
    // ...
    console.log(this);
  };
  render() {
    return <input onChange={this.handleChange} />;
  }
}
```

이제 대충 감이 잡힌다. `handleChange`안에 this값은 Input이라는 클래스가 생성될 때의 문맥을 가지므로, 이 객체가 된다. arrow function의 this값은 호출에 따라 변하지 않으므로 어디에서 실행하든 이 함수 안에서의 this 값은 변하지 않을 것이다.

## 결론

- 뭔가 쉬운 것 같으면서도 어려운 것 같은 개념이다. 아직 완전히 이해를 하지 못하겠다.
- [mozila web docs](https://developer.mozilla.org/en-US/) 를 많이 참고하였다. 땡큐!
