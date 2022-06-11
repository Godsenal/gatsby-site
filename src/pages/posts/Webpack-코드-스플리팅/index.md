---
title: Webpack을 이용한 코드 스플리팅
date: "2019-02-10"
tags: ["webpack"]
---

코드 스플리팅은 webpack같은 모듈 번들러들의 중요한 역할 중 하나다. 하나의 큰 번들을 여러개의 작은 번들들로 쪼개준다. 왜 하는지 또 어떻게 적용하는지 알아보자.

<!--more-->

## 코드 스플리팅

코드 스플리팅은 하나의 큰 번들을 여러개의 작은 번들들로 쪼개준다. 이를 잘 사용하면 필요할 때 필요한 번들만 로드 함으로써 초기 로딩시간을 줄여주고, 유저가 현재 필요하지 않은 코드는 로드 하지 않음으로써 앱의 성능도 크게 향상 시킬 수 있다.

또, 앱에 비해 잘 바뀌지 않는 third-party 라이브러리를 하나의 번들로 따로 묶어둠으로서 앱을 바꿔도 유저가 스크립트를 다시 다운받을 필요 없게(캐싱된 코드를 사용하면 되므로) 해준다.

웹팩을 이용하여 이런식으로 간단한 코드 스플리팅을 할 수 있다. (webpack 공식 문서 예제)

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

하나의 번들이 아닌 `index.bundle.js`와 `another.bundle.js`로 쪼개는 방식이다. 만일 번들의 수가 너무 많을 경우 script 태그에 하나하나 집어넣는게 쉽지 않은데, 이럴 때는 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)을 이용하자.

이러한 방식에는 한계가 있다.

먼저, `index.js`에서 어떤 라이브러리를 사용하고 있고, `another-module.js`에서 같은 라이브러리를 사용하고 있다고 생각해보자. 그러면 그 라이브러리는 `index.bundle.js`와 `another.bundle.js` 각각에 한 번씩 총 두 번 추가될 것이다. 즉, 코드가 중복된다.
이 문제는 webpack의 `optimization` 옵션을 이용하여 해결 할 수 있다.

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js",
    another: "./src/another-module.js"
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  }
};
```

이렇게 옵션을 주면, 중복되는 그 라이브러리를 `index`와 `another`에서 제거하고 다른 하나의 번들로 만들어 준다.

![](https://d2mxuefqeaa7sj.cloudfront.net/s_304CE8625C19007CDE25F36D0015DC761F4006E03053F7DAB70C9EE5274CB846_1539243625475_splitting.PNG)

가장 간단한 코드 스플리팅이고 이런 방식으로 third-party 라이브러리를 따로 번들해주면 도움이 될 것이다.

하지만, 이러한 방법으로는 코드 스플리팅의 가장 큰 장점인 `필요할 때 로드`하는 것이 힘들다. 이 때 사용할 수 있는 방법이 `dynamic import`이다.

### Dynamic import

`dynamic import`는 말그대로 동적으로 import 할 수 있게 해주는 구문이다. (글 작성시 기준으로 tc39의 stage-3에 있다.) webpack은 이를 이용한 코드 스플리팅을 지원해준다. 이를 사용하기 위해서는 webpack에서 entry가 아닌 chunk파일의 이름을 정해주는 `chunkFilename` 옵션만 지정해주면 된다.

```js
const path = require("path");
module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.js"
  },
  output: {
    filename: "[name].bundle.js",
    chunkFilename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};
```

그리고 dynamic import를 사용하기 위해 babel의 `@babel/plugin-syntax-dynamic-import` 플러그인을 설정해야한다. (여기서는 따로 설정하는 방법을 다루지는 않겠다.)

잘 동작하는지 알아보기 위해 다음과 같은 코드를 작성해보자.

```js
export default function Hello() {
  const element = document.createElement("div");
  element.innerText = "Hello!";
  return element;
}
```

`hello.js`는 Hello! 라는 텍스트를 가진 `div` 엘리먼트를 반환하는 함수를 export 해주는 파일이다.

```js
function sayHello() {
  import(/* webpackChunkName: "hello" */ "./hello").then(({ default: Hello }) =>
    document.body.appendChild(Hello())
  );
}

function Button() {
  const element = document.createElement("button");
  element.innerText = "Say hello!";
  element.onclick = sayHello;
  return element;
}

document.body.appendChild(Button());
```

버튼을 누르면 `hello.js` 파일에서 엘리먼트를 받아서 body에 붙여주는 코드이다. `sayHello`를 보면, `hello.js`에서 default를 Hello라는 이름으로 동적으로 받은 후, body에 붙여준다.

dynamic import라는 말에 맞게 import는 비동기적으로 이루어져 `promise`를 반환한다. `export default`로 반환된 값을 resolve 값으로 받아서 사용할 수 있다.

주석처리 해준 `/* webpackChunkName: "hello" */`는 `hello.js` 파일의 chunk 이름을 `hello.bundle.js`로 해주는 옵션이다.

이제 webpack을 통해 build 해보자.

```bash
npx webpack
```

파일 이름이 `webpack.config.js` 일 경우 webpack이 알아서 찾아준다. 그렇지 않을 경우 `--config [파일이름]` 옵션을 주어 실행시켜주면 된다.

[이미지 2]

다음과 같은 결과가 나올 것이다. 그러면 마지막으로 index.html파일을 생성한 후 `index.bundle.js`만 삽입해주자.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Webpack App</title>
  </head>
  <body>
    <script type="text/javascript" src="index.bundle.js"></script>
  </body>
</html>
```

그리고 index.html을 열어 네트워크 탭을 통해 쪼개놓은 코드가 우리가 필요할 때 로드되는지 확인해보자. 버튼을 클릭하기 전에는 `index.bundle.js` 스크립트가 로드되고, 버튼 클릭 후에 `hello.bundle.js`가 로드된다면 잘 적용된 것이다.

이렇게 `dynamic import`를 이용한 code splitting을 알아보았다.

## React에서 code splitting

추가적으로 React에서 code splitting을 하는 방법을 알아보자.

위와 같은 방법으로 설정하면 되고, `create-react-app`을 이용한 경우에는 webpack 설정이 다 되어있기 때문에 바로 dynamic import를 사용 가능하다. 원래 [loadable-components](https://github.com/smooth-code/loadable-components)를 사용했으나, React 16.6 부터는 lazy와 Suspense를 이용하여 코드 스플리팅을 할 수 있다. (아직 ssr에서는 지원되지 않는다.)

먼저 간편하게 `create-react-app`을 통해 프로젝트를 만들어 보자.

```bash
npx create-react-app code-splitting
cd code-splitting
```

아까와 같이 버튼을 클릭하면 `Hello.js`를 로드하는 것을 구현해보자.

```js
import React from "react";

export default function Hello() {
  return <div>Hello!</div>;
}
```

```js
import React, { Component, lazy, Suspense } from "react";
import "./App.css";

const Hello = lazy(() => import("./Hello"));

class App extends Component {
  state = {
    showHello: false
  };
  render() {
    const { showHello } = this.state;
    return (
      <div className="App">
        <button onClick={() => this.setState({ showHello: true })}>
          Click me!
        </button>
        <Suspense fallback={<div>loading...</div>}>
          {showHello && <Hello />}
        </Suspense>
      </div>
    );
  }
}

export default App;
```

그리고 앱을 실행하자.

```bash
yarn start
```

아까와 같이 네트워크 탭에서 버튼을 클릭했을 때, 로드가 일어나는 것을 확인할 수 있다!
