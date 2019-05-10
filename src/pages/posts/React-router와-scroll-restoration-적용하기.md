---
title: React-Router에 scroll restoration 적용하기
date: "2019-05-10"
categories:
  - dev
tags:
  - react
  - react-router
---

> 이번에 프로젝트를 진행하며 만들어본 약간 임시 방편일 수 있는 scroll restoration 기능을 글로 남겨봅니다.



이번 프로젝트에서 글 리스트가 있고, 리스트 중 하나를 클릭하면 글 페이지로 넘어가는 일반적인 웹 사이트를 만들고 있었다. 그런데 페이지를 클릭하고 뒤로 가기를 눌렀을 때 이전 scroll 위치로 돌아가지 않는 문제를 겪었다. 요즘은 SPA가 많아졌고 대부분의 브라우저가 history API를 이용해도 scroll restoration을 지원하기 때문에 당연히 될 줄 알았던 것이 안돼서 당황했다..

혹시나 해서 크롬으로 켰더니 잘 된다. 파이어폭스에서 문제는 내가 간 글 페이지의 window height에 스크롤이 없으면 뒤로 갔을 때(POP 일 때) 이전에 저장해두었을 스크롤 포지션을 적용시키지 못하는 것 같았다.

즉, 글 list -> 글 view (pop)-> 글 list 일 때, 글 view 페이지에서 스크롤이 없으면 글 list로 돌아왔을 때 scroll restoration이 되지 않는다!

이를 해결하기 위해 scroll restoration을 도와주는 컴포넌트로 page 라우팅하는 부분을 감싸주었다. 조금 임시 방편이긴 한데 해결하기 위해서는 괜찮은 방법이라고 생각한다.

> 프로젝트에서는 ReactTraning의 [react-router](https://github.com/ReactTraining/react-router)와 [history](https://github.com/ReactTraining/history)를 사용했기 때문에 밑에 코드도 그것에 맞게 작성되었다.

# Scroll position 저장

restore을 하기 위해선 store를 해야한다. 현재 페이지에서 스크롤시마다 변경되는 offset을 저장하는 함수를 만들었다.

```tsx
// scroll 시 현재 x, y offset를 history state에 저장.
const onScroll = useCallback(() => {
  requestAnimationFrame(() => {
    const { pageXOffset, pageYOffset, location } = window;
    const { state: prevState = {} } = window.history;
    window.history.replaceState(
      {
        ...prevState,
        scroll: {
          x: pageXOffset,
          y: pageYOffset,
        },
      },
      '',
      location.pathname,
    );
  });
}, []);
useWindowEvent('scroll', onScroll);
```

기본 scroll 이벤트는 너무 많이 발생하므로, [`requestAnimationFrame`으로 throttle을 주었다](https://developer.mozilla.org/en-US/docs/Web/API/Document/scroll_event#Scroll_optimization_with_window.requestAnimationFrame).

`window.history.replaceState`로 현재 location의 state에 x, y offset을 업데이트/저장 하도록 한다.

맨 밑 `useWindowEvent('scroll', onScroll);`는 그냥 window 이벤트를 등록하는 커스텀 hook이므로 원하는 방법으로 등록하면 된다.

# Scroll position 복구

이제 저장을 했으니 복구하는 로직을 구현해보자.

```tsx
// scroll Sync를 requestAnimationFrame 단위로 시도.
// y가 전체 height보다 작고 x와 y가 다르면 재귀적으로 계속 시도해본다.
const syncScroll = useCallback(
  debounce((x: number, y: number, attempt: number) => {
    requestAnimationFrame(() => {
      if (attempt < 1) {
        return;
      }
      const { pageXOffset, pageYOffset } = window;
      if (x !== pageXOffset || y !== pageYOffset) {
        window.scrollTo(x, y);
        syncScroll(x, y, attempt - 1);
      }
    });
  }, 100),
  [],
);
```

`syncScroll`은 스크롤 포지션 복구를 시도해보는 함수이다. 그 페이지에 비동기적인 처리 후에 레이아웃이 그려지는 로직이 있을 때를 처리하기 위하여 `debounce`와 `requestAnimationFrame`을 사용하였다. (고려하지 않으려면 없애도 된다.) 포지션 x와 y로, 임의로 정의해둔 attempt 횟수만큼 스크롤 복구를 재귀적으로 시도해보는 함수이다. (조금 hack 한 방법이다..)

# history action에 따른 분기

이제 원하는 두 함수를 만들었으므로, history action에 따라 분류해보자!

만드려는 웹 페이지에 따라 차이는 있겠지만, `PUSH`일 때는 스크롤이 맨 위로 가고, `POP`일 때 복구하도록 하는게 기본적일 것이다.

```tsx
// PUSH일 때는 top으로, POP일 때는 scrollSync를 시도.
// MAX_SYNC_ATTEMPT = 5
useEffect(() => {
  const unlisten = history.listen((location, action) => {
    const { state } = window.history;
    if (action === 'PUSH') {
      window.scrollTo(0, 0);
    }
    if (action === 'POP' && state && state.scroll) {
      const { x, y, attempt = MAX_SYNC_ATTEMPT } = state.scroll;
      syncScroll(x, y, attempt);
    }
  });
  return unlisten;
}, []);
```

나는 위에서 말한 `history` 라이브러리의 리스너를 등록했지만, react-router의 history action을 받아서 사용해도 문제 없을 것이다.

현재 history의 action을 확인하여 분기 한다. `PUSH`일 경우 맨 위로 올려주고,`POP`일 경우 state에 들어있는 x, y값으로 스크롤 복구를 시도한다.

# 결론

hack한 방법이므로, 파이어폭스에서 제대로 지원해주면 좋겠다.