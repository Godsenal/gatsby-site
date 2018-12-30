---
title: 브라우저로 웹 사이트에 접속할 때 과정
date: "2018-07-17"
categories:
  - dev
tags:
  - network
---

브라우저에 www.naver.com, www.google.com 등을 쳤을 때 네트워크 상에서 어떠한 과정을 거쳐 원하는 페이지가 보여지는지 알아보자.

<!--more-->

먼저 간단하게 요약하면,

**브라우저에 도메인(naver.com, google.com)을 입력 → DNS서버에 도메인에 해당하는 IP주소를 요청 → 수신한 IP주소에 해당하는 웹 서버에 접속**

하는 과정을 거친다.

이 과정을 조금 더 자세히 알아보자.

1. 사용자의 PC는 DHCP서버에서 사용자 자신의 IP주소, 가장 가까운 라우터의 IP주소, 가장 가까운 DNS서버의 IP주소를 받는다.
2. 이후, ARP를 이용하여 IP주소를 기반으로 가장 가까운 라우터의 MAC주소를 알아낸다.
3. 외부와 통신할 준비를 마쳤으므로, DNS Query를 DNS서버에 송신한다. DNS서버는 이에대한 결과로 웹 서버의 IP주소를 사용자 PC에 돌려준다.
4. 이제 IP를 알았으므로, HTTP Request를 위해 TCP Socket을 개방하고 연결한다.(이 과정에서 3-hand-shaking이 일어난다)
5. TCP연결에 성공하면 HTTP Request가 TCP Socket을 통해 보내지고, 응답으로 웹페이지의 정보가 사용자의 PC로 들어온다.

## 참고

DHCP(Dynamic Host Configuration Protocol)

- 호스트의 IP주소 및 TCP/IP 설정을 클라이언트에 자동으로 제공하는 프로토콜.

DNS(Domain Name System)

- IP주소와 도메인의 매핑정보를 관리하면서 도메인 혹은 IP주소를 묻는 요청이 오면 이에 응답.
- DNS에도 캐시가 있기 때문에, 자주 요청을 받는 정보는 캐시로 관리한다.

ARP(Address Resolution Protocal)

- 네트워크 상에서 IP주소를 물리적 네트워크 주소로 대응시키기 위해 사용되는 프로토콜

3 Way-Handshake

- TCP/IP를 이용해서 통신을 하는 응용프로그램이 데이터를 전송하기 전에, 먼저 정확한 전송을 보장하기 위해 사전에 세션을 수립하는 과정.
