---
title: 함수형 컴포넌트와 클래스 컴포넌트
date: '2019-03-04'
categories:
  - dev
tags:
  - react
---

이번에 [이 글](https://overreacted.io/how-are-function-components-different-from-classes/)을 읽고 평소에 느꼈던 부분과 종합하여 클래스 컴포넌트와 함수형 컴포넌트 사용시 주의해야 할 점을 생각해보았다.

## 함수 컴포넌트와 클래스 컴포넌트의 차이

```jsx
function Button({ user }) {
  const sayHello = () => alert(`Hello ${user}!`);
  const handleClick = () => setTimeout(sayHello, 3000);

  return <button onClick={handleClick}>함수 인사!</button>;
}
```

간단한 함수형 컴포넌트이다. `user`를 props로 받고, 버튼을 눌렀을 때 3초 후에 **Hello 유저이름!** 이라는 알림을 띄워준다. 이를 클래스로 나타내면

```jsx
class Button extends React.Component {
  sayHello = () => alert(`Hello ${this.props.user}!`);
  handleClick = () => setTimeout(this.sayHello, 3000);

  render() {
    return <button onClick={this.handleClick}>클래스 인사!</button>;
  }
}
```

이런식으로 된다. 과연 똑같이 동작할까? **그렇지 않다!**

![Button](./Button.gif)

이 버튼에게 `user`라는 props를 내려주는 컴포넌트를 생각해보자. 만약 버튼을 누른 후 3초가 되기전에 `user`를 바꿔주면 어떻게 될까? state가 바뀜에 따라 두 개의 버튼 컴포넌트는 리랜더링을 하게된다. 이 때, 두 컴포넌트간의 차이가 발생한다.

먼저 클래스 컴포넌트를 생각해보자.

1. 버튼이 눌리고 `handleClick`이 실행된다. setTimeout 의 콜백으로 `this.sayHello`가 등록된다.
2. 상위 컴포넌트에서 `user`의 이름을 바꿔준다. 그에 따라 버튼 컴포넌트가 리랜더링되고, `this.props.user`도 바뀐다.
3. 3초 후에 아까 등록한 `this.sayHello`가 실행되고, `this.props.user`를 통해 `Hello 유저이름!` 알림이 뜬다.
4. 이 유저이름은 상위 컴포넌트에서 현재 설정된 유저이름이 나온다.

생각해보면 당연한 결과이다. `sayHello`에서 참조하는 `this`는 항상 바뀐다. `sayHello`가 등록되는 시점에서의 `this`와 콜백으로 호출되는 시점에서의 `this`는 다르다. 즉, 다른 유저이름을 출력한다.

그럼 함수 컴포넌트를 생각해보자.

1. 버튼이 눌리고 `handleClick`이 실행된다. setTimeout의 콜백으로 `sayHello`가 등록된다.
2. 상위 컴포넌트에서 `user`의 이름을 바꿔준다. 그에 따라 버튼 컴포넌트가 리랜더링된다. 즉, 함수가 새로 호출되고, `user`의 값이 바뀐다.
3. 3초 후에 아까 등록한 `sayHello`가 실행된다. **등록 시점에 `user`에 들어있던 값을 통해 `Hello 유저이름!` 알림이 뜬다.**

즉, 상위 컴포넌트에서 `user`의 상태가 바뀌었을 때, 함수형 컴포넌트안 `setTimeout`에 등록한 콜백에서의 `user`는 변하지 않고 새로 생성된다. 생성될 당시 `user`의 값을 캡쳐한 후 사용하는 클로져의 개념이다. 이는 React에서의 차이가 아니라 Javascript의 기본 개념 문제이다. 다만, React를 사용할 때에는 함수나 클래스가 아닌 컴포넌트라는 개념으로 사용하고 있기 때문에 잘 놓치는 부분인 것 같다.

이 개념을 똑같이 적용시켜서, 클래스에서도 같은 동작을 할 수 있게 만들어보자.

```jsx
class Button extends React.Component {
  sayHello = (user) => () => alert(`Hello ${user}!`);
  handleClick = () => setTimeout(this.sayHello(this.props.user), 3000);

  render() {
    return <button onClick={this.handleClick}>클래스 인사!</button>;
  }
}
```

클로져를 사용하여 `sayHello`가 유저의 이름을 `this`로 부터 가져오는 대신, `sayHello`를 생성할 당시의 `this.props.user`의 값을 넘겨줌으로써 해결할 수 있다. 마찬가지로 이런식으로 해도 된다.

```jsx
class Button extends React.Component {
  sayHello = (user) => alert(`Hello ${user}!`);
  handleClick = () => {
    const { user } = this.props;
    setTimeout(() => this.sayHello(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>클래스 인사!</button>;
  }
}
```

위 예제에서는 함수형 컴포넌트가 동작하는 방식이 더 맞다고 볼 수 있다. 우리가 원하는 유저는 버튼을 눌렀을 당시 유저이지 3초 후의 유저가 아니다. 하지만, 이 두 컴포넌트가 동작하는 방식의 차이는 앞으로 함수형 컴포넌트를 사용할 때 유의해야할 점이다.

특히, Hooks를 사용하면서 기존 클래스를 사용했을 때에는 생각 못했던 점을 주의해야 했다.

> Hooks를 사용할 때는 변수가 언제든지 바뀔 수 있다는 점을 염두하고 코딩을 하자.

Hooks 뿐만이 아니라 함수를 사용할 때 항상 해당되는 말인데, React에서 함수형 컴포넌트를 사용할 때는 우리가 직접 호출하지 않으니 놓칠 수 있는 부분이다. 변수가 항상 바뀔 수 있고 이전의 변수가 캡쳐 즉, 가둬진다는 것을 유의하고 코딩을 하자!
