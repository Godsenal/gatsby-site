---
title: web push 사용해보기
date: '2021-08-08'
tags:
  - javascript
  - web
categories:
  - dev
---

일하다가 web push 사용을 검토해보는 작업을 하게 되었다.
이것저것 찾아보다보니 꽤 재미있기도 하고, 생각보다 그렇게 간단하지는 않다.

이전에 [Notification API](https://developer.mozilla.org/ko/docs/Web/API/notification)를 써본적이 있는데 요녀석과는 완전히 다른 것이다.
요것부터 먼저 비교를 하면,

- **Notification API:** 웹 페이지에서 시스템 레벨의 알림을 띄울 수 있는 API. 웹 페이지에서 동작하기 때문에 해당 페이지가 닫혔을 경우 동작하지 않음.

- **Push API**: server → service worker로 push를 통해 알림을 보내는 방식. push 서버에서 요청을 받아 알림을 띄울 때 위 Notification API와 비슷한 개념이 들어있지만, 이 때 사용하는 API는 service worker 의 API.

이제 Push API를 한번 알아보자!

# Push API

web push는 이 Push API를 사용하게된다.

[Push API](https://developer.mozilla.org/ko/docs/Web/API/Push_API)는 웹 애플리케이션이 현재 로딩이 되어 있지 않더라도 서버로부터 메시지를 받을 수 있도록 하는 기능이다.

이 Push API가 생기기 이전의 푸시 알림은 앱에서만 존재했지만 웹에서도 어느정도 사용이 가능하다. 사용하는 사람이 많은지는 모르겠지만, 유튜브같은 경우도 요 web push를 지원하고 있어서 알림 설정을 켜두면 유튜브가 켜져 있지 않아도 알림을 받게 된다.
즉, 앱에서의 푸시 알림처럼 백그라운드에서도 알림을 띄울 수 있다.

일단 전제조건이, 웹앱이 **현재 로딩되어 있지 않더라도** 이기 때문에 [서비스 워커](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API)를 필요로 하게된다.

# Service Worker

서비스 워커는 브라우저가 백그라운드에서 실행하는 스크립트로, **웹페이지와는 별개로 작동**해서 요런 백그라운드 푸시 알림이 가능하게 해준다.

한가지 염두해둬야 될 점은 https 에서만 사용 가능하다. (개발용으로 localhost는 사용 가능하다)
즉, web push도 마찬가지로 https 에서만 가능하다.

# 동작 방식

요게 어떻게 동작하지? 가 조금 이해가 안갔었는데, 리서치하다보니 요런식으로 정리가 된다.

![webpush](/images/post_webpush/webpush.png)

1. push API 를 이용해 브라우저별로 push subscription 및 [subscription 객체](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)(push 서버 endpoint 등이 포함)를 발급
2. 해당 subscription 을 원하는 저장소에 저장
3. subscription 정보를 이용하여 notification 에 필요한 데이터를 브라우저별 push server 에 push
4. 브라우저에서 해당 정보를 이용해 subscription 하는 서비스워커에 notify -> service worker에서 notification 처리

여기서 push 서버라는게 조금 생소한데, 요건 우리가 만드는건 아니고 브라우저 제조사(구글, 모질라 등)가 제공하는 것이다.
Push API를 통해서 subscription 정보를 발급하면 해당 서버의 엔드포인트가 들어있고, 이 엔드포인트에 데이터를 푸싱하면 푸시서버에서 등록된 service worker에 알리고, 우리는 service worker에 이벤트핸들러를 등록해 알림이 왔을때 어떻게할지 처리하면 된다.

또한, 여기서 암호화 부분이 있는데 [VAPID](https://datatracker.ietf.org/doc/html/draft-ietf-webpush-vapid-01)를 사용하여 메시지를 암호화한다.

이 암호화의 목적은 본인의 서버에서만 Push가 가능하도록 하는 것이다. Public Key, Private Key를 이용하여 인증 헤더 구성 및 정보 암호화처리를 하고 Push 서버는 이 정보를 이용해 암호화 해독 후 보내준다.

# 관련 라이브러리

요걸 처음부터 개발하게 되면 위에서 말한 VAPID 발급, 암호화 과정이 굉장히 복잡하다. 요걸 간단하게 해줄 수 있는 라이브러리를 사용하는게 여러모로 편하다.

**web-push**

- [https://www.npmjs.com/package/web-push](https://www.npmjs.com/package/web-push)
- 복잡한 암호화 과정, VAPID 발급 Push 서버로의 POST 과정을 간편하게 처리할 수 있도록 도와준다.

**Firebase Cloud Messaging**

- [https://firebase.google.com/docs/cloud-messaging](https://firebase.google.com/docs/cloud-messaging)
- 구글이 제공하는 message 관련 툴
- 위 web-push가 제공해주는 역할 + subscription 까지 처리해주는 인터페이스를 제공해주고 앱과 같이 크로스 플랫폼으로 메시지를 제공해줄때 관리할 수 있는 역할도 포함되어있다.
- 웹 용으로만 쓸거라면 별 차이는 web-push랑 크게 차이없다.

# 예제

위에서 말한 web-push를 이용해서 간단하게 코드 구현을 해보게되면 세 파트 정도로 나누어서 볼 수 있다.

그전에 일단 web-push 라이브러리를 받은 후 VAPID를 발급받도록 하자.

```bash
npx web-push generate-vapid-keys
```

요렇게 하면 Public/Private 키 쌍이 나온다. 요걸 들고 있으면 준비 끝이다.

### subscription

일단, 푸시 알림은 사용자 권한이 필요하다. Notification 알림 권한 설정부터 처리한다.

```ts
Notification.requestPermission().then((status) => {
  console.log('Notification 상태', status);

  if (status === 'denied') {
    alert('Notification 거부됨');
  }
});
```

권한이 승인되면 서비스워커를 등록하고 subscription 정보를 발급받는다.

```ts
Notification.requestPermission().then((status) => {
  console.log('Notification 상태', status);

  if (status === 'denied') {
    alert('Notification 거부됨');
  } else if (navigator.serviceWorker) {
    navigator.serviceWorker
      .register('/serviceworker.js') // serviceworker 등록
      .then(function (registration) {
        const subscribeOptions = {
          userVisibleOnly: true,
          // push subscription이 유저에게 항상 보이는지 여부. 알림을 숨기는 등 작업이 들어가지는에 대한 여부인데, 크롬에서는 true 밖에 지원안한다.
          // https://developers.google.com/web/fundamentals/push-notifications/subscribing-a-user
          applicationServerKey: VAPID_PUBLIC_KEY, // 발급받은 vapid public key
        };

        return registration.pushManager.subscribe(subscribeOptions);
      })
      .then(function (pushSubscription) {
        // subscription 정보를 저장할 서버로 보낸다.
        postSubscription(pushSubscription);
      });
  }
});
```

### server

서버에서는 두가지 처리가 필요하다.

1. Subscription 정보를 받아서 저장하여야 하고,
2. 원할 때 해당 Subscription 정보를 이용해 Push 서버로 알림을 보내는 처리를 해야한다.

먼저 Subscription 정보를 저장하는 처리를 해보면 (간단하게 그냥 배열에다 저장해두었다)

```ts
import { PushSubscription } from 'web-push';

// nodejs 서버
const tokenList: PushSubscription[] = [];

app.post('/register', function (req, res) {
  tokenList.push(req.body.subscription);

  res.send('success');
});
```

그리고, 원할 때 알림을 보낼 수 있도록 했다. (예시는 `/notify` 로 원하는 메시지를 쿼리로 포함해 get 요청을 보내면 알림을 보내도록 했다)

```ts
import { sendNotification, setVapidDetails } from 'web-push';

app.get('/notify', async (req, res) => {
  const options = {
    TTL: 24 * 60 * 60,
    vapidDetails: {
      subject: 'http://localhost:3000', // 서버 주소
      publicKey: VAPID_PUBLIC_KEY,
      privateKey: VAPID_PRIVATE_KEY,
    },
  };

  const payload = JSON.stringify({
    title: 'Web Notification',
    body: '웹 알림입니다.',
    icon: 'http://localhost:3000/icon.png',
    tag: 'default tag',
    ...req.query,
  });

  try {
    await Promise.all(tokenList.map((t) => sendNotification(t, payload, options)));
  } catch (e) {
    console.error(e);
  }

  res.status('success');
});
```

요렇게하면 이제 서비스워커에서 받아서 알림 처리만 하면 된다.

### serviceworker

서비스워커에서는 먼저 push 이벤트를 받아서 알림을 띄워주어야 하고, 알림이 클릭되었을 때 처리를 하면된다.

먼저 push 이벤트 처리이다. 여기서는 간단하게 메시지, icon 처리정도만 해주었다.

```ts
self.addEventListener('push', (event) => {
  // event는 서버에서 payload로 보내준 데이터이다.
  let { title, body, icon, tag } = JSON.parse(event.data && event.data.text());

  // 이외에도 여러 옵션이 있다.
  // 참고: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
  event.waitUntil(self.registration.showNotification(title || '', { body, tag, icon }));
});
```

다음은 알림 클릭시 작업이다.

```ts
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const urlToOpen = 'http://localhost:1234';

  event.waitUntil(
    self.clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
        // 현재 서비스워커 클라이언트와 동일한 origin의 클라이언트를 포함시킬지 여부.
        // 요걸 활성화해두지 않으면, 현재 열린 탭이 있더라도 서비스워커를 활성화시킨 탭이 아니면 client에 포함되지 않음
      })
      .then(function (clientList) {
        if (clientList.length > 0) {
          // 이미 열려있는 탭이 있는 경우
          return clientList[0].focus().then((client) => client.navigate(urlToOpen));
        }
        return self.clients.openWindow(urlToOpen);
      }),
  );
});
```

요렇게되면 끝!
예제코드는 [요기서](https://github.com/Godsenal/web-push-simple) 확인할 수 있다.

간단 예제라 재발급처리 등은 빠져있다. 실제 사용케이스에서는 들어가야할 것이다.

# 지원 여부

[지원여부](https://caniuse.com/push-api)

보면 주요 브라우저에서는 지원하지만 MacOS Safari에서는 지원하지 않고 독자적인 알림 시스템 ([APNS](https://developer.apple.com/notifications/safari-push-notifications/)) 사용한다고 한다. (요건 적용해본적은 없다)
IOS도 찾아보았는데.. [Push API 지원을 안해서 사용불가다](https://stackoverflow.com/questions/43994660/push-notifications-on-ios-from-web-app).

# 참고

- ServiceWorker: [https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- Push API: [https://developers.google.com/web/fundamentals/codelabs/push-notifications?hl=ko](https://developers.google.com/web/fundamentals/codelabs/push-notifications?hl=ko)
- 암호화: [https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web](https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web)
