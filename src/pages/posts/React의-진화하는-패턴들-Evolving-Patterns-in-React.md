---
title: React의 진화하는 패턴들(Evolving Patterns in React)
date: "2018-07-17"
categories:
  - dev
tags:
  - react
---

- [Evolving Patterns in React](https://medium.freecodecamp.org/evolving-patterns-in-react-116140e5fe8f)의 번역 - [Alex Moldovan](https://medium.freecodecamp.org/@alexnm?source=post_header_lockup) -

<!--more-->

리액트 생태계에서 떠오르는 여러 패턴들을 한 번 들여다봅시다. 이러한 패턴들은 가독성, 코드 명확성 을 증가시켜주고 코드의 합성 및 재사용을 가능하게 해줍니다.

저는 대략 3년 전부터 리액트로 일을 하기 시작했습니다. 그 당시에는, 리액트의 기능을 제대로 활용하는 법을 배우기 위한 잘 정립된 사례가 없었습니다.

커뮤니티가 몇 가지 아이디어를 해결하는데 약 2년이 걸렸습니다. 우리는 React.createClass로 부터 ES6의 class와 순수 함수 컴포넌트로 전환했고 mixin들을 버리고 API들을 간소화 시켰습니다.

이제 커뮤니티가 그 어느 때보다도 커짐에 따라, 진화하고 있는 몇 개의 멋진 패턴들을 살펴봅시다.

이러한 패턴들을 이해하기 위해서 React의 기본 개념과 그 생태계의 기본적인 것들을 이해하고 있어야 하고, 그것에 대해서는 이 글에서 다루지 않을 예정이니 명심하세요!

시작해 봅시다!

## **조건부 렌더(Conditional Render)**

저는 아래와 같은 일을 많은 프로젝트에서 봐왔습니다.

사람들이 **React** 와 **JSX**에 대해서 생각을 할 때, 여전히 **HTML** 과 **Javascript** 관점에서 생각을 합니다.

그렇기 때문에, 기본적인 방법은 조건부 로직을 실제 return 코드와 분리하는 겁니다.

```js
const condition = true;

const App = () => {
  const innerContent = condition ? (
    <div>
      <h2>Show me</h2>
      <p>Description</p>
    </div>
  ) : null;

  return (
    <div>
      <h1>This is always visible</h1>
      {innerContent}
    </div>
  );
};
```

이는 여러개의 [ternaries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)가 각 렌더링 함수의 시작 부분에 있을 때, 제어가 힘들어집니다. 어떤 element가 렌더되는지 안되는지 알기 위해 함수안에서 끊임없이 왔다갔다 찾아봐야 합니다.

그 대안으로, 자바스크립트의 실행모델의 장점을 얻을 수 있는 이 패턴을 시도해봅시다.

```js
const condition = true;

const App = () => (
  <div>
    <h1>This is always visible</h1>
    {condition && (
      <div>
        <h2>Show me</h2>
        <p>Description</p>
      </div>
    )}
  </div>
);
```

만약에 condition이 false 이면, &&연산자의 두 번째 피연산자는 실행되지 않습니다. 만약 true라면, 두 번째 피연산자 **-우리가** **렌더하고 싶은 JSX-** 가 반환될 것입니다.

이를 통해 UI 로직을 실제 UI element와 선언적으로 **혼합**할 수 있습니다!

JSX을 당신의 코드의 완전한 부분처럼 생각하세요. 아무튼간에, 그냥 **자바스크립트**일 뿐이니깐요!

## **Props 아래로 전달하기(Passing Down Props)**

어플리케이션이 커지면, 다른 컴포넌트의 컨테이너처럼 행동하는 컴포넌트들이 많아집니다.

이럴 때, 컴포넌트를 통해 필요한 props의 부분을 아래로 전달해줘야 합니다. 이를 우회하는 좋은 방법은 **JSX spread**와 함께 **props destructuring(구조분해)**을 아래와 같이 하는겁니다.

```js
const Details = ({ name, language }) => (
  <div>
    <p>
      {name} works with {language}
    </p>
  </div>
);

const Layout = ({ title, ...props }) => (
  <div>
    <h1>{title}</h1>
    <Details {...props} />
  </div>
);

const App = () => (
  <Layout title="I'm here to stay" language="JavaScript" name="Alex" />
);
```

이제, Details 컴포넌트에 필요한 props들을 변경하면서 그 props들이 여러 컴포넌트에서 참조되지 않음을 알 수 있습니다.

## **Props 구조분해(Destructuring Props)**

어플리케이션이 여러번 바뀌면서, 당연히 컴포넌트도 바뀝니다. 2년전에 썼던 컴포넌트가 그 당시에는 state를 필요로 했어도(stateful), 지금은 state가 필요 없는(stateless) 컴포넌트로 바꿀 수 있을지 모릅니다. 그 반대에 경우도 자주 발생합니다!

오래동안 편하기 위해 제가 사용하는 좋은 비결이 있습니다. 두 유형의 컴포넌트에 대해 비슷한 방식으로 props 구조분해를 사용할 수 있습니다.

```js
const Details = ({ name, language }) => (
  <div>
    <p>
      {name} works with {language}
    </p>
  </div>
);

class Details extends React.Component {
  render() {
    const { name, language } = this.props;
    return (
      <div>
        <p>
          {name} works with {language}
        </p>
      </div>
    );
  }
}
```

2-4번 라인과 11-13번 라인은 **동일합니다.** 이 패턴을 사용하면 컴포넌트를 변화시키는게 매우 쉬워집니다. 또 한, 컴포넌트 내에서 this 사용을 줄일 수도 있죠.

## **Provider Pattern**

- **새 context api가 나오기 전 글입니다.**

우리는 props를 다른 컴포넌트를 통해 전달하는 예제들을 보았습니다. 그런데 만약에 15개의 컴포넌트들 밑으로 전달해야 한다면 어떨까요?

[React Context](https://reactjs.org/docs/context.html)를 사용해봅시다!

React에서 추천하는 기능은 아니지만, 필요할 때 일을 해줍니다.

최근에 Context가 **provider pattern**을 구현한 새로운 API가 추가되고있다고 발표되었습니다. **/\* 현재는 이미 추가됨. \*/**

React Redux나 Apollo 같은 것들을 사용하고 있었다면, 아마 더 친숙할 것 입니다.

현재 어떻게 동작하는지 보시면, 새로 추가될 API를 이해하는데 더 도움이 될 것입니다.

<https://codesandbox.io/s/rww6k3mq94?from-embed>

**Provider** 로 불리는 상위 컴포넌트가 context에 값들을 지정합니다.

**Consumer** 로 불리는 하위 컴포넌트는 그 값들을 context로 부터 가지고 옵니다.

현재의 context 문법은 약간 이상해보이지만, 곧 나올 버전은 정확하게 이 패턴을 구현하고 있습니다.

## **Higher Order Component**

재사용성에 대해 한번 얘기해봅시다. React.createElement() 팩토리를 제거하면서, React 팀은 mixin들 또한 제거했습니다. 어떤 시점에서 보면 mixin은 일반적인 객체 합성을 통해 컴포넌트를 합성하는 표준 방법이었습니다.

Higher Order Component(이하 HOC)는 여러 컴포넌트간에에 대한 재사용해야 할 필요성을 충족시키기 위해 출시되었습니다.

HOC는 컴포넌트를 인자로 받는 함수로서, 그 컴포넌트의 **강화/수정**된 버전을 반환해줍니다. 아마 HOC를 다른 여러 이름들로 찾을 수 있겠지만, 저는 **데코레이터**로서 생각합니다.

Redux를 사용하고 있다면, 컴포넌트를 받고 props들을 추가해주는 connect 함수가 HOC 임을 알 수 있습니다.

컴포넌트에 props를 추가해주는 간단한 HOC를 구현해봅시다.

```js
const withProps = newProps => WrappedComponent => {
  const ModifiedComponent = (
    ownProps // 수정된 버전의 컴포넌트
  ) => (
    <WrappedComponent {...ownProps} {...newProps} /> // 기존 props + 새로운 props
  );

  return ModifiedComponent;
};

const Details = ({ name, title, language }) => (
  <div>
    <h1>{title}</h1>
    <p>
      {name} works with {language}
    </p>
  </div>
);

const newProps = { name: "Alex" }; // hoc를 통해 추가됨
const ModifiedDetails = withProps(newProps)(Details); // hoc는 읽기 쉽게 하기 위해 커링(currying)됩니다.

const App = () => (
  <ModifiedDetails title="I'm here to stay" language="JavaScript" />
);
```

함수형 프로그래밍을 좋아한다면, HOC를 이용하여 작업하는 것도 맘에들 겁니다. [Recompose](https://github.com/acdlite/recompose)는 withProps, withContext, lifecycle 등등 과 같은 멋진 HOC 유틸리티를 제공해주는 좋은 패키지입니다.

**기능 재사용**의 유용한 예를 한 번 봅시다.

```js
function withAuthentication(WrappedComponent) {
  const ModifiedComponent = props => {
    if (!props.isAuthenticated) {
      return <Redirect to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };

  const mapStateToProps = state => ({
    isAuthenticated: state.session.isAuthenticated
  });

  return connect(mapStateToProps)(ModifiedComponent);
}
```

라우터안에서 민감한 내용을 렌더하고 싶을 때 withAuthentication을 사용할 수 있습니다. 그 내용들은 로그인된 유저에게만 보여질 것입니다.

이는 어플리케이션의 한 부분에서 구현되고, 전체 어플리케이션에서 재사용될 수 있는 [크로스 커팅 관심사(cross-cutting concern)](https://ko.wikipedia.org/wiki/%ED%9A%A1%EB%8B%A8_%EA%B4%80%EC%8B%AC%EC%82%AC)입니다.

그러나, HOC에게도 단점은 있습니다. 각각의 HOC는 DOM/가상DOM 구조에 추가적으로 React 컴포넌트를 도입하여, 어플리케이션의 규모에 따라 성능 문제가 발생할 수 있습니다.

몇 가지의 추가적인 HOC의 문제들은 [Michael Jackson](https://twitter.com/mjackson)의 [이 글](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce?gi=ecedf2f3b6d5)에서 볼 수 있습니다. 그는 우리가 다음에 얘기할 패턴으로 HOC를 대체하자고 주장합니다.

## Render Props

**render props**와 **HOC**가 상호 대체 가능하다는 것은 사실이지만… 저는 둘 중 하나를 더 선호하지는 않습니다. 두 패턴 모두 재사용성과 코드 명확성에 사용됩니다.

render props의 아이디어는, 렌더 함수의 제어를 다른 컴포넌트로 **내주고** 함수 prop을 통해 제어를 다시 전달하는 것입니다.

몇몇 사람들은, **동적 prop**을 사용하는 걸 선호하고, 몇몇은 그냥 this.props.children을 사용합니다.

아직 좀 혼란스러울 것이라는 걸 알지만, 간단한 예제를 봅시다.

```js
class ScrollPosition extends React.Component {
  constructor() {
    super();
    this.state = { position: 0 };
    this.updatePosition = this.updatePosition.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.updatePosition);
  }

  updatePosition() {
    this.setState({ position: window.pageYOffset });
  }

  render() {
    return this.props.children(this.state.position);
  }
}

const App = () => (
  <div>
    <ScrollPosition>
      {position => (
        <div>
          <h1>Hello World</h1>
          <p>You are at {position}</p>
        </div>
      )}
    </ScrollPosition>
  </div>
);
```

여기서는 children을 render prop으로 사용했습니다. <ScrollPosition> 컴포넌트 안에서 position을 인자로 받는 함수를 보내줍니다.

Render props는 컴포넌트 **내부**에서 재사용 로직이 필요하지만, HOC로 감싸주기 원하지 않을 때 사용될 수 있습니다.

[React-Motion](https://github.com/chenglou/react-motion)은 render props의 좋은 예를 보여주는 라이브러리 중 하나입니다.

마지막으로, 어떻게 **비동기** 흐름을 render props와 통합할 수 있는지 봅시다. 재사용 가능한 Fetch 컴포넌트를 사용한 훌륭한 예제입니다.

<https://codesandbox.io/s/myv3nywvp> (code sandbox 예제)

한 컴포넌트가 **여러개의** render props 를 가질 수도 있습니다. 이 패턴을 이용하면, 기능을 합성하고 재사용하는데 무한한 가능성을 가지게 됩니다.
