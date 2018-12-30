---
title: Amazon Web Services(AWS)에서 외부 도메인 연결
date: "2018-03-19"
categories:
  - aws
tags:
  - aws
  - server
banner: /images/post_03/aws.png
---

이번에 서버 호스팅을 처음으로 [AWS(Amazon Web services)](https://aws.amazon.com/ko/)에서 해봤다.ec2를 1년 무료로 사용할 수 있기 때문에 한 번 사용해보았는데, 이번 글은 그 중에서 외부도메인을 연결한 과정이다.

## Route 53

[Route 53](https://console.aws.amazon.com/route53/home?region=ap-northeast-2)은 AWS에서 제공하는 DNS(Domain Name System) 웹 서비스이다. AWS에 서버를 호스팅 하였을 경우 Route 53을 이용하면 도메인 생성 및 연결을 쉽게 할 수 있다. 하지만.. 저렴한 도메인 사이트들에 비해 비싸기 때문에 외부 도메인을 이용하는 경우가 많을 것이라고 생각한다. 여유가 있다면 같은 서비스에서 제공하는 것을 사용하는게 좋겠지만.. 가격차이가 좀 난다. **하지만 외부 도메인 연결도 간단히 할 수 있다**.

먼저, Route 53에 콘솔에 들어가서 Hosted Zone(특정 도메인에 대한 레코드 모음)을 하나 생성한다. `Domain Name`은 외부에서 얻은 amazon.com 같은 도메인 이름. `Comment`는 아무거나 입력해준다. Public Hosted Zone으로 설정 후 생성한다.

만들어진 Hosted Zone으로 들어가면 이미 `ns`타입과 `soa`타입 2개의 레코드가 있다. 여기서 ns타입의 value를 보면 총 4개의 name servers(Domain을 ip로 할당해주는 서버)를 볼 수 있다. 이 4개의 ns를 외부 도메인 등록 사이트에 등록해준다.

마지막으로 자신의 instance의 ip를 등록만 해주면 된다. 이 Hosted Zone에 IPv4를 반환하여 domain과 연결되도록 하는 `A` type의 레코드를 하나 추가해준다. Value값은 instance의 ip로 등록해준다. 나머지는 그대로 둔다.

## 참고

[Amazon EC2 인스턴스로 트래픽 라우팅](https://docs.aws.amazon.com/ko_kr/Route53/latest/DeveloperGuide/routing-to-ec2-instance.html)
