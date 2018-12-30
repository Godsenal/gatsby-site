---
title: React - Render Props와 HigherOrderComponents(HOC)
date: "2018-07-17"
categories:
  - dev
tags:
  - javascript
  - react
---

react의 공식문서에 Render props 에 대한 문서가 추가되었다(2017년 12월 경). HOC(Higher Order Component) 패턴처럼 코드를 재사용 할 수 있는 방법인데 이미 여러 곳에서 쓰이고 있었던 것이 문서로 작성되었다.

<!--more-->

## **Higher Order Components**

HOC 패턴은 객체지향 프로그래밍의 디자인 패턴 중 하나인 decorator 패턴 처럼 작동한다. **컴포넌트를 받아서 새로운 컴포넌트를 반환하는 함수를 만드는 것이다.**

새로운 컴포넌트에는 재사용할 코드들을 넣어주면 된다.

```js
export default function withMouse(WrappedComponent) {
  return class extends React.Component {
    state = {
      x: 0,
      y: 0
    };
    handleChange = e => {
      const { clientX, clientY } = e;
      this.setState({
        x: clientX,
        y: clientY
      });
    };

    render() {
      return (
        <div onMouseMove={this.handleChange}>
          <WrappedComponent {...this.props} mouse={this.state} />
        </div>
      );
    }
  };
}
```

위 코드는 마우스 좌표를 전달해주는 Higher Order Component를 작성한 것이다. 감싸줄 WrappedComponent 를 마우스 이동을 감지하고 좌표를 관리하는 컴포넌트로 감싸준 것이다. 이런식으로 새로운 props를 감싼 컴포넌트에 주거나, 기존 props를 가공하여 줄 수도 있다. 또, 마우스의 이동을 확인해야하는 다른 컴포넌트들에게도 사용되어 재사용에 도움을 줄 수도 있다.

위와 같이 HOC를 만들어 놓으면 마우스 이동을 감지하고자 하는 컴포넌트에서 아래와 같이 사용할 수 있다.

```js
const WatchMouse = ({ mouse }) => (
  <p>
    {" "}
    X: {mouse.x} Y: {mouse.y}{" "}
  </p>
);

export default withMouse(WatchMouse);
```

이런식으로 위에서 만든 HOC인 withMouse 의 인자로 감싸고싶은 컴포넌트만 넣어주면 된다.

이외에도 props를 확인하여 랜더를 할지 안할지 결정한다던지, props를 가공하여 가공된 props를 넘겨준다던지 여러가지 경우의 쓰일 수 있고, 무엇보다도 하나의 코드만 짜놓으면 여러 컴포넌트에 재사용이 가능하다.

**주의** 해야할 점은 두 개 이상의 HOC로 감쌀경우 props 이름의 중복이 있다면 자동적으로 하나로 합쳐진다. 의도치 않게 props가 원하는 값이 나오지 않는다면, props 이름이 같지 않은지 확인해봐야 한다. 애초에 만들 때 새로운 이름으로 구분가능하게 작성해주는 것이 중요하다.

## Render props

Render Props는 컴포넌트가 무엇을 랜더할지 알 수 있도록 하는 함수형태의 props 이다. 함수형태의 props를 넘겨줌으로써 두 컴포넌트간의 데이터를 함수의 인자로서 공유할 수 있게 해준다.

말로는 어려우니 위 코드를 Render props로 바꿔보면,

```js
class Mouse extends React.Component {
  state = {
    x: 0,
    y: 0
  };
  handleChange = e => {
    const { clientX, clientY } = e;
    this.setState({
      x: clientX,
      y: clientY
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleChange}>{this.props.render(this.state)}</div>
    );
  }
}

const WatchMouse = () => (
  <Mouse
    render={({ x, y }) => (
      <p>
        {" "}
        X: {mouse.x} Y: {mouse.y}{" "}
      </p>
    )}
  />
);
```

이런식으로 된다. 위에서 render 라는 이름의 함수형태의 props를 어떤 컴포넌트든지 넘겨 주기만 하고, 이 함수 render props는 원하는 인자를 받아서 사용만 하면 된다.

물론 render라는 이름은 편의상 지은 것이고 편한대로 쓰면 된다. 또는 children을 이용하여,

```js
class Mouse extends React.Component {
  state = {
    x: 0,
    y: 0
  };
  handleChange = e => {
    const { clientX, clientY } = e;
    this.setState({
      x: clientX,
      y: clientY
    });
  };

  render() {
    return (
      <div onMouseMove={this.handleChange}>
        {this.props.children(this.state)}
      </div>
    );
  }
}

const WatchMouse = () => (
  <Mouse>
    {({ x, y }) => (
      <p>
        {" "}
        X: {mouse.x} Y: {mouse.y}{" "}
      </p>
    )}
  </Mouse>
);
```

이런식으로 child element로 넘겨준 후 사용하는 방법도 가능하다. 이렇게 되면 HOC대비 좋은점이 생긴다.

먼저, props 이름에 대한 충돌이 생기지 않는다. HOC같은 경우, 여러개의 HOC로 감싸줄 때 overwrite되어서 자동적으로 하나의 props만 적용된다. 위 경우는 자동적으로 합쳐질 일이 없다. 또 한, 여러개의 HOC로 감싸진 경우, 어떤 props가 어떤 HOC로 부터 왔는지 알기 어려워진다.

하지만 단점도 존재한다. 함수를 render에 작성하기 때문에 매 번 함수를 만들어주게 된다. 이럴 때 최적화에 약간 문제가 생기는데 예를들어, shouldComponentUpdate를 사용할 경우 이 함수는 매 번 새로 생성되는 props가 되므로 의미가 없어진다. 이러한 경우, HOC를 쓰는게 더 나을 것이다.
