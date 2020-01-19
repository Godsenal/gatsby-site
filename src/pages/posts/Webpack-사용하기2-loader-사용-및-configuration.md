---
title: Webpack 사용하기 2 - loader 사용 및 configuration
date: '2018-03-25'
categories:
  - dev
tags:
  - webpack
banner: /images/post_05/webpack-logo.png
---

> 이 글은 Webpack 3 을 기준으로 쓰여졌습니다.

**Webpack**의 또 다른 기능으로는 `loader` 가 있다. webpack은 기본적으로 Javascript 파일밖의 로드하지 못하지만, 이 `loader`를 사용하면 여러 타입의 파일들을 Javascript에서 바로 사용가능할 수 있는 형태로 만든다. 여러가지 loader들을 사용해보자!

<!--more-->

디렉토리 구조는

```bash
webpacktest
|---src
	|	hello.js
	|	everyone.js
	|	app.css
	|	app.js
	|   image.jpg

|---dist
	|	index.html

```

이런 식으로 구성되어 있다.

## css-loader와 style-loader

먼저 css파일 적용을 도와주는 `style-loader`와 `css-loader`를 사용해보자.

```bash
npm i --save-dev css-loader style-loader
```

`css-loader`는 css 파일들을 읽어서 javascript에서 사용가능한 string으로 반환하여준다. 다른 file을 string으로 반환해주는 `raw-loader`와 차이점은 css안에 `import` 나 `url`등의 path를 읽어서 javascript에서의 `import`나 `require`로 바꿔 읽을 수 있도록 해준다.

`style-loader`는 `css-loader`가 반환해준 값을 실제로 dom에 `<style>` 태그로 넣어준다. `style-loader`없이는 `css-loader`는 단순히 css파일을 읽어 값을 반환해줄 뿐이다.

그럼 간단한 `app.css`를 작성해보자.

```css:title=app.css
body {
  background: black;
  color: white;
}
```

그리고 전에 작성했던 `app.js`에 이 app.css를 추가하려면 `style-loader`와 `css-loader`가 필요하다.

```js:title=app.js
require('style-loader!css-loader!./app.css'); // 추가
var hello = require('./hello.js');
var everyone = require('./everyone.js');

var el = document.createElement('div');
el.innerText = hello + ' ' + everyone + '!';
document.body.appendChild(el);
```

`style-loader!css-loader!./app.css` 이 부분이 app.css에 style-loader와 css-loader를 적용한 부분이다. `!`는 loader들을 연결시켜줄 때 쓰인다. 그리고 다시 빌드해주고

```bash
webpack src/app.js dist/bundle.js
```

`index.html`을 열어보면 검은색 바탕에 흰 글씨를 볼 수 있다~

## configuration file 만들기

그런데 저렇게 계속 loader들을 적용시켜준다는 건 귀찮은 일이다. 지금까지 webpack을 사용하며 `webpack src/app.js dist/bundle.js` 이런식으로 계속 entry 파일과 output파일을 써주는 것도 귀찮다. 그래서 webpack에서는 `configuration file`을 만들어 사용할 수 있도록 해준다. webpack의 configuration file은 object를 exports하는 javascript 파일로 만든다. 간단하게 지금까지 한 것들을 `webpack.config.js`이름의 파일로 작성해보면,

```js:title=webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      // webpack 2 부터는 loaders 대신 rules를 쓴다.
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
```

이렇게 설정할 수 있다. `entry`는 앱이 시작되는 부분이며 웹팩이 번들링을 시작하는 부분. `output.path`는 웹팩이 만들어낼 파일의 이름 `output.path`는 모든 output 파일이 만들어질 directory. 무조건 absolute path여야 하므로 Node.js의 `path` 모듈을 사용한다.

그 밑 `module`에서 모듈에 연관되는 것을 정의해주는데, `module.rules` 에서 별도 모듈에 관한 것을 정의해주면 된다. 위에 작성된 rule은 css파일인지 확인한 후 css파일이면 `style-loader`와 `css-loader`를 사용한다는 뜻이다.

이제 config는 끝났으므로 위 `app.js`를 수정해보자.

```js:title=app.js
require('./app.css'); // 추가
// ...
```

`require('style-loader!css-loader!./app.css')` 이런식으로 어떤 loader를 사용할지에 대한 정의를 `webpack.config.js`에서 해놨으므로 필요 없어졌다. 위와 같이 바꿔주면 된다. 그럼 다시

```bash
webpack --config webpack.config.js // 그냥 webpack 이라고만 해도 된다.
```

입력 후 `index.html`을 열어보면 잘 반영되어 있다.

### sass-loader

추가적으로 `sass-loader` 도 한 번 사용해보자. sass나 scss 파일을 load한 후 css파일로 컴파일 시켜준 후(node-sass를 필요로 한다.) 위에서 사용된 `css-loader`와 `style-loader`같은 loader들을 사용하여 style을 적용시켜 준다.

```bash
npm i --save-dev sass-loader node-sass
```

먼저 `sass-loader`사용에 필요한 `node-sass`와 함께 패키지를 받아주자. `node-sass`는 sass/scss 를 css로 컴파일 해주는 패키지이다.

그리고, `webpack.config.js`에 아래와 같이 loader를 추가해주자.

```js:title=webpack.config.js
{
    //...
        test: /(\.scss|\.sass)$/,
        use: [
          'style-loader', 'css-loader', 'sass-loader'
        ]
      }
    ]
  }
};

```

sass나 scss타입의 파일이 요구될 때 `sass-loader`를 통해 그 파일을 load 한 후, css로 컴파일 해준다. 그 후 위에서 사용된 `css-loader` 와 `style-loader`가 css파일을 load할 때와 똑같이 적용된다.

```scss:title=app.scss
body {
  background: black;
  div {
    color: white;
  }
}
```

`app.css` 파일을 위와같이 `app.scss`로 바꾼 후,

```js:title=app.js
require('./app.scss');
// ...
```

`app.js`에서 스타일을 추가하는 부분을 위와 같이 `app.scss`로 바꾼 다음 webpack으로 다시 번들링을 해보자. 그러면 잘 적용된 것을 볼 수 있다.

## babel-loader

이번에는 Javascript 최신 문법을 사용하기 위해 필요한 `babel-loader`를 사용해 보겠다. `Babel`은 최신 Javascript 문법을 (현재 기준 ES2018) 오래된 브라우저도 지원 가능한 ES5 문법으로 바꿔준다. 자세한 설명은 [여기](https://babeljs.io/).

먼저 필요한 dependency를 받아보자.

```bash
npm i --save-dev babel-loader babel-core babel-preset-env
```

`babel-loader`는 웹팩에서 필요한 loader이고 `babel-core` 는 말그대로 babel에서 쓰이는 core 모듈들의 패키지이고 `babel-preset-env` 는 자동으로 최신버전의 ES를 지원해주는 패키지다.

이제 `webpack.config.js` 에 `babel-loader`를 추가해보자.

```js:title=webpack.config.js
// ...
rules: [
  {
    test: /\.js$/,
    loader: 'babel-loader', // 여러 loader를 사용할 경우 use. 그렇지 않을 경우에는 loader를 쓴다.
    options: {
      presets: ['env'],
    },
  },
  {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
];
```

위와 같이 loader의 부가적인 option을 정할때는 options를 사용한다. 물론 각각의 loader마다 option은 다르다. 위에서 `babel-loader`의 경우 presets이라는 값을 받고 최신버전의 es를 사용한다는 것을 뜻하는 `env`를 주었다.

그럼 한 번 테스트를 해보자. ES6의 Arrow function을 사용해보자.

```js:title=app.js
require('./app.css');
var hello = require('./hello.js');
var everyone = require('./everyone.js');

const createGreeting = () => {
  var el = document.createElement('div');
  el.innerText = hello + ' ' + everyone + '!';

  return el;
};

document.body.appendChild(createGreeting());
```

위 `babel-loader`를 설정하지 않고 IE같은 오래된 브라우저에 돌려보며 비교해보면 적용되는지 알 수 있다. 최신 브라우저는 ES6은 거의 다 지원해주기 때문에..

## file-loader

다음은 `file-loader`이다. 이미지같은 file들이 사용되었을때 webpack의 `output.path`에 파일을 넣어준 후 그 URL을 반환해준다.

```bash
npm i --save-dev file-loader
```

먼저 패키지를 받은 후 설정을 해주자.

```js:title=webpack.config.js
// ...
rules: [
  //...
  {
    test: /\.(png|jpg|gif)$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },
];
```

이미지 파일을 처리하는 `file-loader` 설정이다. png, jpg, gif 타입의 파일이 사용되어 웹팩이 번들링할 때 요구하는 경우, `file-loader`가 역할을 한다. `file-loader`의 options 는 [여기](https://github.com/webpack-contrib/file-loader) 를 참고하면 된다. 나는 이름을 그 파일의 이름과 확장자로 설정해주었다. 그러면 사용해보자.

```js:title=app.js
//...
var img = require('./image.jpg');
// ...
const createImg = () => {
  var el = document.createElement('img');
  el.src = img;
  return el;
};

// ...
document.body.appendChild(createImg());
```

아까 말했듯이 `file-loader`는 요구되는 file의 URL을 반환해준다. 여기서 img의 `src` attribute에 반환된 url을 넣었다.

다시 번들링 후 실행하면 사진을 볼 수 있다.

## 결론

- 되게 복잡한 것 같지만, webpack이 없었을 거라고 생각해보면... 감사히 배우면서 사용하자.
- 여기에 작성한 loader는 수 많은 loader들 중 하나다. 필요한 loader를 상황에 따라 맞게 사용하면 될 것 같다.

## 참고

- `webpack --watch` 이렇게 `--watch` 옵션을 주면 계속 번들링 할 필요 없이 사용된 파일이 바뀔 때 알아서 번들링해준다.
- [여기](https://webpack.js.org/loaders/) 서 수 많은 loader들을 볼 수 있다.

## 연결되는 글

{% post_link Webpack-사용하기1-시작 %}
