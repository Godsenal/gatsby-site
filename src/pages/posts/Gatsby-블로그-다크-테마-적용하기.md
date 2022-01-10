---
title: Gatsby 블로그 다크 테마 적용하기
date: '2022-01-11'
tags:
  - gatsby
  - javascript
categories:
  - dev
---

이번에 블로그에 다크테마를 적용하게 되었다. (요즘 핫한 Remix 좀 써보려다가.. tailwind 문서 좀 보다가.. 다크테마가 이뻐서 생각남)
다크 테마가 좀 지난 트랜드이긴 한데 적용해봐야지.. 해봐야지.. 하다가 이제야 적용하게 되어 그 경험을 글로 남겨본다.
코드짜는 것보다 색깔 고르는게 더 오래걸릴 줄은 몰랐다. 그래도 마음에 든다.

<!--more-->

### 다크모드

다크모드가 한동안 (지금도?) 굉장히 트렌드였다. 눈에 피로도 덜하고 이쁘기도 해서 많은 시스템 (Mac, iOS, Window 등)이 다크 테마를 지원해주고 있다.
그에따라 웹에서도 [prefers-color-scheme](https://developer.mozilla.org/ko/docs/Web/CSS/@media/prefers-color-scheme) 라는 미디어 속성으로 시스템의 다크 테마 여부를 탐지할 수 있다. (물론 IE는 안됨)

### prefers-color-scheme

prefers-color-scheme는 미디어 속성이므로 다음과 같이 사용할 수 있다.

```css
@media (prefers-color-scheme: dark) {
  body {
    background: black;
    color: white;
  }
}
```

이러면 사용자 시스템 테마가 다크모드일 경우 body에 위 스타일이 적용된다.
우리는 다크모드일 때 색상이 바뀌길 원하므로, [CSS Variables](https://developer.mozilla.org/ko/docs/Web/CSS/Using_CSS_custom_properties)를 활용해서 요렇게 적용해볼 수 있다.

```css
@media (prefers-color-scheme: dark) {
  body {
    --bg-color: black;
    --text-color: white;

    background-color: var(--bg-color);
    color: var(--text-color);
  }
}
```

요러한 설정들을 gatsby [글로벌 스타일](https://www.gatsbyjs.com/docs/how-to/styling/global-css/#adding-global-styles-without-a-layout-component)로 넣으면 된다.

### matchMedia

무조건 시스템 설정을 따라가는 방향으로 처리하려면 위와 같이 처리해도 충분하겠지만, 내가 하고자 하는 것은 (보통 일반적인 다크모드) 기본으로는 시스템 테마를 따라가면서, 사용자가 설정을 변경한 경우 해당 설정이 유지되는 것이다.
즉, 어느정도의 스크립트가 필요하다.

미디어쿼리를 스크립트로 처리하기 위해서는 [matchMedia](https://developer.mozilla.org/ko/docs/Web/API/Window/matchMedia) 를 이용할 수 있다.

```tsx
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

console.log(darkQuery.matches ? 'dark' : 'light');
```

이제 사용자의 설정을 저장하기 위해서 cookie나 localStorage를 쓰면 된다. 나는 간편하게 localStorage를 사용하였다.

```tsx
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

const theme = savedTheme || (darkQuery.matches ? 'dark' : 'light');
```

그리고 요걸 body 클래스로 넣어주면 된다.

```tsx
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

const theme = savedTheme || (darkQuery.matches ? 'dark' : 'light');

if (newTheme === 'dark') {
  document.body.classList.add('dark');
} else {
  document.body.classList.remove('dark');
}
```

동적으로 시스템 테마 변경에 따라 바뀌도록 하려면 미디어 쿼리 state 변경에 따라 변경될 수 있도록 이벤트 리스너를 넣어줄 수 있다.

```tsx
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const savedTheme = localStorage.getItem('theme');

const theme = savedTheme || (darkQuery.matches ? 'dark' : 'light');

const setTheme = (newTheme) => {
  if (newTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  localStorage.setItem('theme', newTheme);
};

darkQuery.addListener((e) => {
  setTheme(e.matches ? 'dark' : 'light');
});

setTheme(theme);
```

문제는 이 스크립트를 어디에서 실행하느냐이다.

이게 적용하기 은근 까다로운 이유는 해당 속성이 css 속성이기 때문에 server 에서 받아올 수 없기 때문일 것이다.
따라서 그냥 react의 lifecycle 내에서 현재 테마를 가져오고, 그에 따라 스타일을 조정하면 시스템이 다크 테마여도 잠시 라이트 테마가 보여지는 현상을 겪을 수 있다.

### 스크립트 실행

위 문제를 해결하기 위해서는 위 스크립트가 화면이 painting 되기 전에 실행되어야 한다.

나는 위 스크립트를 body 바로 다음에 위치시켜서 body 내부 엘리먼트들이 페인팅 되기 전에 실행하도록 하였다.
이렇게 두면 스크립트는 DOM 파싱을 막으므로, 위 스크립트가 실행된 후에 페인팅이 되는 것이 보장된다.

내 블로그는 Gatsby를 사용하므로, [gatsby-ssr의 onRenderBody](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/#onRenderBody) API를 이용할 수 있다.

해당 API는 `setPreBodyComponents` 함수를 제공하는데, 이 함수를 통해 body 바로 하위에 스크립트를 넣어줄 수 있다. (아니면 [html.js를 수정](https://www.gatsbyjs.com/docs/custom-html/)할 수 있는데, Gatsby Theme 내에서는 제공이 안되어 권장하지는 않는다고 한다.)

요건 `gatsby-ssr.js` 파일을 만들어 다음과 같이 적용하면 된다. (브라우저 지원범위를 고려한다면 const나 arrow 함수는 변경해주자)

```tsx
export const onRenderBody = ({ setPreBodyComponents }) => {
  const script = `
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');

  const theme = savedTheme || (darkQuery.matches ? 'dark' : 'light');

  const setTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme);
  };

  darkQuery.addListener((e) => {
    setTheme(e.matches ? 'dark' : 'light');
  });

  setTheme(theme);
  `;

  setPreBodyComponents(<script dangerouslySetInnerHTML={{ __html: script }} />);
};
```

### 버튼 연동

이제 테마를 변경하는 버튼을 연동하면 된다.
해당 스크립트의 함수 및 값을 사용할 수 있도록 window 객체에 넣어주고, React 코드 내에서 테마 변경을 감지할 수 있도록 리스너를 등록할 수 있게 바꾼다.

```tsx
export const onRenderBody = ({ setPreBodyComponents }) => {
  const script = `
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem('theme');

  window.__theme = savedTheme || (darkQuery.matches ? 'dark' : 'light');
  window.__onThemeChange = () => {};

  window.__setTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme);
    window.__onThemeChange(newTheme);
  };

  darkQuery.addListener((e) => {
    window.__setTheme(e.matches ? 'dark' : 'light');
  });

  window.__setTheme(theme);
  `;

  setPreBodyComponents(<script dangerouslySetInnerHTML={{ __html: script }} />);
};
```

그리고 이 상태를 체크하여 버튼을 랜더하는 컴포넌트를 만들면 된다.

```tsx
const ThemeButton = () => {
  const [theme, setTheme] = useState(null);
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    window.__setTheme(isDarkMode ? 'light' : 'dark');
  };

  useEffect(() => {
    setTheme(window.__theme);
    window.__onThemeChange = (theme) => {
      setTheme(theme);
    };
  }, []);

  if (!theme) {
    return null;
  }

  return <button onClick={toggleTheme}>{isDarkMode ? ☀️ : 🌙}</button>;
};
```

theme의 초기값을 설정하지 않은 이유는 이 값이 server 에서와 browser 에서의 값이 달라지기 때문인데, hydrate시 mismatch 에러가 발생한다.
위 에러를 피하기 위해 위와 같이 mount 되기 전에 render를 피하는 방법도 있고, 그게 싫다면 css로 해결할 수도 있다.

```tsx
const ThemeButton = () => {
  const [theme, setTheme] = useState(null);
  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    window.__setTheme(isDarkMode ? 'light' : 'dark');
  };

  useEffect(() => {
    setTheme(window.__theme);
    window.__onThemeChange = (theme) => {
      setTheme(theme);
    };
  }, []);

  return (
    <button onClick={toggleTheme}>
      <span className="dark-hidden">🌙</span>
      <span className="hidden dark-inline-block">☀️</span>
    </button>
  );
};
```

이런식으로 설정하고 글로벌 스타일에 다음과 같이 추가하면 된다.

```css
.hidden {
  display: hidden;
}

body.dark .dark-hidden {
  display: none;
}

body.dark .dark-inline-block {
  display: inline-block;
}
```

이렇게 스타일을 지정해주면 초기에도 랜더링이 되도록 만들 수 있다.

### 라이브러리

물론 요런 귀찮은 일들을 대신 해줄 라이브러리가 있다.

[gatsby-plugin-dark-mode](https://github.com/insin/gatsby-plugin-dark-mode) 요것인데, 조금 오래되긴 했지만 사용하는데는 문제가 없다.
