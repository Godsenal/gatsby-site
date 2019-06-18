---
title: marked + highlight 번들 사이즈 줄이기
date: '2019-06-18'
tags:
  - javascript
  - react
categories:
  - dev
---

이번에 프로젝트를 하면서 [marked](https://github.com/markedjs/marked)와 [highlight.js](https://highlightjs.org/)를 사용하여 마크다운에 코드 syntax 하이라이팅을 지원하려고 했다. 

marked 옵션에 highlight가 있어서 그 안에 이런식으로 넣어줬었다.
```js
import hljs from 'highlight.js';

marked.setOptions({
  highlight: function(code, lang) {
    return hljs.highlight(lang, code).value;
  }
});
```

문제는 highlight.js를 CommonJs 모듈로 default 임포트 할 경우, 모든 언어를 다 임포트시킨다.

```js
var hljs = require('./highlight.js');

hljs.registerLanguage('1c', require('./languages/1c'));
hljs.registerLanguage('abnf', require('./languages/abnf'));
hljs.registerLanguage('accesslog', require('./languages/accesslog'));
hljs.registerLanguage('actionscript', require('./languages/actionscript'));
hljs.registerLanguage('ada', require('./languages/ada'));
hljs.registerLanguage('angelscript', require('./languages/angelscript'));
hljs.registerLanguage('apache', require('./languages/apache'));
...
```

이런식으로 되어있다. 이렇게 모든 언어를 다 임포트하면 같이 번들링되어서 번들 사이즈가 굉장히 커진다. 이 중에 사용자가 사용하는 언어는 극히 일부이므로 그 부분만 추가해서 사용하도록 해보자.

highlightjs의 default 모듈은 위와 같은 코드로 모든 언어를 임포트 시키기 때문에, `highlight.js/lib/highlight` 에서 직접 코어 코드를 가져오도록 하자.

```js
import hljs from 'highlight.js/lib/highlight';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

// ...
```

번들러가 Tree Shaking을 해주기 때문에 요렇게 필요한 부분만 임포트해서 번들사이즈를 줄일 수 있다.

그런데, 내가 하고있는 프로젝트는 사용자가 쓸 수 있는 언어가 정해지지 않았기 때문에 위 방법으로는 힘들었다. 그래서 다이나믹 임포트를 이용했다.

먼저, [Create React App](https://facebook.github.io/create-react-app/)을 사용하거나 [webpack과 babel 설정](https://webpack.js.org/guides/code-splitting/#dynamic-imports)을 하여서 다이나믹 임포트가 가능한 환경을 만들자.

문제는 highlight.js에서 언어를 추가하려면 위 코드처럼
```js
hljs.registerLanguage('javascript', require('./languages/javascript'));
```
이런식으로 언어에 해당하는 특정 파일 이름을 알아야 한다. 언어 -> 파일 이름 1:1 매칭되면 좋겠지만, `javascript` 같은 경우 `js`로 쓰기도 하므로 언어마다 별명도 다 알아야 한다.

별 수 없다. highlight.js에 현재 로드된 언어의 이름을 주는 Api와 그 이름을 통해 언어의 별명을 주는 Api가 있기 때문에, 일단 모두 임포트 시킨 후 이 Api를 통해서 가져온 정보를 파싱해서 사용했다.

```js
{
  // ...
  "apache": "apache",
  "osascript": "applescript",
  "applescript": "applescript",
  "arcade": "arcade",
  "c": "cpp",
  "cc": "cpp",
  "h": "cpp",
  "c++": "cpp",
  // ...
}
```

이런식으로 해당하는 별명의 언어 이름을 `[key]: value` 로 하는 데이터를 만들었다.

```js
import highlightData from './highlight.json';
marked.setOptions({
  highlight: (code, lang, callback) => {
    if (!lang) {
      return code;
    }
    const path = highlightData[lang];
    if (!path) {
      return callback(null, code);
    }
    import(`highlight.js/lib/languages/${path}`).then(
      module => {
        hljs.registerLanguage(path, module.default);
        return callback(null, hljs.highlight(path, code).value);
      },
      err => {
        callback(err, code);
      },
    );
  },
});
```

그리고 이렇게 markdown 옵션으로 언어를 가져오는 코드를 넣으면 된다.
참고로 marked를 사용할 때 이렇게 `callback` 을 이용하여 비동기 highlighting을 수행할 경우,

```js
console.log(marked(value)); // Sync

marked(value, (err, text) => {
  console.log(text); // Async
})
```
이렇게 사용해주자.