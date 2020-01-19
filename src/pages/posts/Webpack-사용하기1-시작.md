---
title: Webpack 사용하기 1 - 시작
date: '2018-03-25'
categories:
  - dev
tags:
  - webpack
banner: /images/post_05/webpack-logo.png
---

> 이 글은 Webpack 3 을 기준으로 쓰여졌습니다.

요즘의 웹 페이지들은 대부분의 로직을 클라이언트 사이드에서 Javascript로 구현한다. 그만큼 웹에서의 Javascript 비중이 많이 높아졌다. 특히 요즘 자주 쓰이는 `React`, `Angular` 같은 Modern Web Frameworks들은 더욱 그렇다. 그에 따라 이 코드들을 모듈로 나누어서 관리해야할 필요성이 생기게 되었다. 이렇게 나뉘어진 모듈들을 관리해 주는게 모듈 번들러이고 **Webpack**은 그 중의 하나이다. Webpack과 같은 모듈 번들러를 사용하면 자신의 웹 어플리케이션에 필요한 모든 모듈을 빌드 타임에 하나 또는 그 이상의 `bundles` 로 컴파일하여 로드해준다. 그 이외에도 하는일이 매우 많으니 시간날 때 [이 곳](https://webpack.js.org/concepts/)에서 한 번 보는 것도 좋을 것 같다.

<!--more-->

# Webpack 사용하기 - 시작

위는 정말 간단한 설명이고 모듈에 대한 건 내용이 엄~~청나게 많으니 시간날 때 더 공부해봐야겠다. 여기서는 사용하는 방법만 작성할 것이다.

위에 글이 잘 와닿지 않을 수 있지만, 직접 사용해보면 더 와닿는다.

## Webpack 사용해보기

먼저 정말 간단하게 CommonJS(export, require) 방식으로 모듈을 정의하고 사용해보자.

디렉토리 구조는

```bash
webpacktest
|---src
	|	hello.js
	|	everyone.js
	|	app.js

|---dist
	|	index.html

```

이런 식으로 구성되어 있다.

먼저,

```js:title=hello.js
module.exports = 'Hello';
```

'Hello'를 모듈로서 반환해주는 파일 `hello.js` 를 만들고,

```js:title=everyone.js
module.exports = 'Everyone';
```

'Everyone'을 반환해주는 `everyone.js`를 만든다.

이제 이 두 개의 모듈을 가져와서 `div` element 안에 넣어주는 파일을 만들어 보자.

```js:title=app.js
var hello = require('./hello.js');
var everyone = require('./everyone.js');

var el = document.createElement('div');
el.innerText = hello + ' ' + everyone + '!';
document.body.appendChild(el);
```

모듈을 설명할 때 어디에서나 볼 수 있는 간단한 예제이다. 이 파일을 그냥 html 파일에 script태그로 넣어주면 브라우저는 이를 실행하지 못한다. 여기서 **Webpack**이 들어갈 차례이다. webpack으로 이 파일을 컴파일하여 브라우저가 실행할 수 있도록 해줘야한다.

```bash
npm install webpack -g
```

먼저 webpack을 설치한 후 모듈을 컴파일 해보자.

```bash
webpack src/app.js dist/bundle.js
```

이 명령어를 이용하여 `app.js` 파일을 브라우저에서 실행가능한 `bundle.js`로 컴파일 할 수 있다. 이제 브라우저에서 실행가능한 파일이 생성되었으므로 이를 로드하는 html파일을 `dist`폴더에 만들어보자.

```html:title=index.html
<!DOCTYPE html>
<html>
  <head>
    <title>Webpack test!</title>
  </head>
  <body>
    <script src="bundle.js"></script>
  </body>
</html>
```

이제 html파일을 열어보면 안녕 모두들 하는걸 볼 수 있다.

## 연결되는 글

{% post_link Webpack-사용하기2-loader-사용-및-configuration %}
