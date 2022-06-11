---
title: React - Intersection Observer API를 사용하여 인피니트 스크롤 구현하기
date: "2019-04-08"
tags:
  - react
  - hook
categories:
  - dev
---

스크롤이 특정 포지션을 지나갔을 때 아이템을 추가로 로드하는 인피니트 스크롤을 최근에는 [Intersection Observer]([https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_AP](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)I) 를 이용해 구현했다. 이전에 scrollTop 같은 속성을 이용하는 것보다 훨씬 편하다. 물론 polyfill을 사용해야 하지만 모던 웹브라우저 대부분은 지원하고 있다.

Intersection Observer를 커스텀 hook으로 만들어 사용해보면서 이 API의 속성과 hook을 좀 더 이해해보자!

## Intersection Observer

Intersection Observer는 타겟 엘리먼트와, 타겟 엘리먼트의 부모나 뷰포트가 교차하는 부분의 변화를 비동기적으로 관찰하는 API이다.

웹이 발전함에 따라 이러한 변화를 체크하는 것의 필요성이 높아졌고 그래서 나오게 된 API이다. 이전에는 `getBoundingClientRect()` 로 실제 엘리먼트의 offset등을 측정하는 방식으로 이루어졌는데, 가장 큰 문제점은 이러한 작업이 **메인쓰레드**에서 이루어진다는 점이다! 들어오는 엘리먼트마다 체크해주는 작업을 해야하는데 이를 전부 메인쓰레드에서 진행한다. 한 페이지 뷰안에 인터섹션을 확인해줘야 하는 요소가 있다고 생각해보자. 이는 성능상의 문제를 가져올 수 있다.

Intersection Observer는 이러한 문제를 비동기로 해결해준다. 메인쓰레드에서 계속 인터섹션을 확인하는 대신 인터섹션이 일어날 때 인자로 넘겨준 callback을 실행시켜준다.

callback과 더불어 option을 넘겨줄 수 있다.

`root` 는 타겟 엘리먼트이 보이는지 안보이는지 결정할 뷰포트로 사용될 엘리먼트이다. 타겟 엘리먼트의 상위 엘리먼트여야만 하고 기본값은 브라우저의 뷰포트이다.

`rootmargin` 은 위 root의 margin으로 사용할 값이다. px이나 %로 줄 수 있다. 기본값은 0.

`threshold` 는 타겟이 얼만큼 보여야 callback이 작동할지 결정하는 값이다. 50%면 0.5를 넘겨주면 된다. 배열로도 넘겨줄 수 있다. `[0, 0.5, 1]` 이런식으로 주면 50%만큼씩 보일 때마다 callback 이 작동한다. 기본값은 0이다. (1px만 보여도 작동한다)

그럼 React에서 한 번 사용해보자. 옵저버 인스턴스를 생성한 후 `observe` 메서드에 타겟 엘리먼트를 넘겨준다. `ref`를 사용해 넘겨줘보자. 커스텀 훅을 만드는게 목적이니 Hook을 사용하자.

```javascript
/* fake */
const fakeFetch = (delay = 1000) => new Promise(res => setTimeout(res, delay));
/* 리스트 아이템 */
const ListItem = ({ number }) => (
  <div className="ListItem">
    <span>{number}</span>
  </div>
);

function App() {
  /* 아이템 개수와 현재 로딩 상태 */
  const [state, setState] = useState({ itemCount: 0, isLoading: false });
  /* fake 비동기 아이템 로드 */
  const fetchItems = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await fakeFetch();
    setState(prev => ({
      itemCount: prev.itemCount + 10,
      isLoading: false
    }));
  };
  /* 초기 아이템 로딩 */
  useEffect(() => {
    fetchItems();
  }, []);
	/* 타겟 엘리먼트 */
  const target = useRef(null);
	/* 인터섹션 callback */
  const onIntersect = async ([entry], observer) => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      await fetchItems();
      observer.observe(entry.target);
    }
  };
  /* 옵저버 등록 */
  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.5 });
    observer.observe(target.current);
    return () => observer.disconnect();
  }, []);
  const { itemCount, isLoading } = state;
  return (
    <div>
      {[...Array(itemCount)].map((_, i) => {
        return <ListItem key={i} number={i} />;
      })}
      <div ref={target} className="Loading">
        {isLoading && "Loading..."}
      </div>
    </div>
  );
}
```

요렇게 하면 잘 되긴 하는데 초기에 item이 없기 때문에 초기 아이템 로딩과 인터섹션이 둘 다 일어난다. 초기 아이템 로딩을 없애도 되지만 우리는 custom hook으로 만들 것이기 때문에 범용성을 위해서 `ref` 값이 변할 때 새로운 옵저버를 등록해보도록 하자.

```javascript
/* 옵저버 등록 */
  useEffect(() => {
		let observer;
		if (target.current) {
			observer = new IntersectionObserver(onIntersect, { threshold: 0.5 });
	    observer.observe(target.current);
		}
	  return () => observer && observer.disconnect();
  }, [target]);
```

이렇게 하면 될까? useRef의 객체는 바뀌지 않기 때문에, `target.current` 값이 바뀌어도 이 useEffect는 작동하지 않는다.

```javascript
useEffect(() => {
		let observer;
		if (target.current) {
			observer = new IntersectionObserver(onIntersect, { threshold: 0.5 });
	    observer.observe(target.current);
		}
	  return () => observer && observer.disconnect();
  }, [target.current]);
```

이거는 될까? 이것도 안된다! `target.current` 는 변하는 값은 맞지만 useEffect가 발생하는 시점 즉, 컴포넌트가 업데이트 됐다는 것이, 레이아웃이 모두 그려졌다는 것과는 다르므로, ref값이 엘리먼트에 붙었을 거라는 보장이 없다. 

***(`useLayoutEffect` 를 쓰면 되지 않을까란 생각을 했는데 안된다. 아무래도 모든 DOM Mutation이 끝난 후 실행된다는 것이, 두 번째 인자에 대한 비교까지 그 작업이 끝난 후 비교한다는 것은 아닌 것 같다. 조금 더 조사가 필요하다.)***

Ref가 붙었을 때, 떼어졌을 때 무언가를 업데이트 할 수 있는 리액트에서 제시하는 방법은 ref 요소를 callback으로서 사용하는 방법이다.

```javascript
const [target, setTarget] = useState(null);
useEffect(() => {
	let observer;
	if (target) {
		observer = new IntersectionObserver(onIntersect, { threshold: 0.5 });
    observer.observe(target);
	}
  return () => observer && observer.disconnect();
}, [target]);

// ...

return (
	...
	<div ref={setTarget} />
);
```

이렇게 하면 잘 작동할 수 밖에 없다!

## Custom Hook 만들기

이제 위 코드를 custom hook으로 뽑아보자!

```javascript
const useIntersect = (onIntersect, option) => {
  const [ref, setRef] = useState(null);
	// intersecting이 있을 때 target 엔트리와 observer를 넘겨주자.
  const checkIntersect = useCallback(([entry], observer) => {
    if (entry.isIntersecting) {
      onIntersect(entry, observer);
    }
  }, []);
	// ref나 option이 바뀔 경우 observer를 새로 등록한다.
  useEffect(() => {
    let observer;
    if (ref) {
      observer = new IntersectionObserver(checkIntersect, {
        ...option
      });
      observer.observe(ref);
    }
    return () => observer && observer.disconnect();
  }, [ref, option.root, option.threshold, option.rootMargin, checkIntersect]);
	// setRef를 넘겨주어서 ref를 변경시킬 수 있도록 한다.
  return [ref, setRef];
};
```

ref의 변화에 따라 잘 작동하는지 파악하기 위해 아이템이 없을 때, `null` 만을 렌더하였다. 잘 작동하는지 보자!

<iframe src="https://codesandbox.io/embed/mzo41q83r8?fontsize=14" title="Intersection observer hook" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

state로 ref를 관리하는게 꺼려진다면 아예 `observe unobserve` 메소드를 hook에서 반환해서 사용할 수 있도록 해주는 것도 좋은 방법인 것 같다.

인피니트 스크롤을 구현할 때, Intersection Observer를 위와 같이 `isIntersecting` 됐을 때 `unobserve`를 사용할 수도 있고, `getBoundingClientRect` 를 사용하여 이전 y값과 비교하여 아래로 내려오는 인터섹션인지 확인할 수도 있다. 

또, 타겟 엘리먼트를 맨 뒤 아이템으로 설정해주는 것도 좋은 방법인 것 같다! 다음번에는 이런 방법을 사용해서 Intersection Observer를 사용해 볼 예정이다.