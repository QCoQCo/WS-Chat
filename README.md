### WS Chat (React + Vite + TypeScript)

간단한 WebSocket 채팅 데모입니다. 프론트엔드는 React + Vite, 백엔드는 Node.js(`ws`)로 구성되어 있으며, 실시간 메시지 전송과 사용자 이름 설정을 지원합니다.

## 주요 기능
- **실시간 채팅**: 모든 클라이언트에 메시지 브로드캐스트
- **사용자 이름 설정**: 클라이언트에서 이름 변경 가능
- **시스템 메시지**: 입장/퇴장 및 이름 변경 알림
- **자동 재연결**: 연결이 끊어지면 지수 백오프로 재시도

## 요구사항
- Node.js 18+ (권장)
- npm

## 설치
```bash
npm install
```

## 실행
- **프론트/서버 동시 실행**:
```bash
npm run dev:all

npm run dev -- --port 5174
```
  - 프론트엔드: `http://localhost:5173`
  - 테스트용 프론트 임의로 설정가능
  - WebSocket 서버: `ws://localhost:3001`

- **각각 실행**:
  - 터미널 1
    ```bash
    npm run dev
    ```
  - 터미널 2
    ```bash
    npm run dev:server
    ```

## 빌드 및 프리뷰
```bash
npm run build
npm run preview
```

## 환경 변수
- **WS_PORT**: WebSocket 서버 포트 (기본값 3001)
```bash
WS_PORT=4000 npm run dev:server
```

클라이언트는 기본적으로 현재 호스트의 `3001` 포트에 연결하도록 설정되어 있습니다. 포트를 변경했다면 `src/App.tsx`의 `port` 값을 함께 수정하세요.

## 폴더 구조 (요약)
- `server/server.mjs`: WebSocket 서버
- `src/`: React 앱
- `src/hooks/useWebSocket.ts`: WebSocket 커스텀 훅

## 사용 방법
1. 앱 접속 후 상단 입력란에서 사용자 이름을 저장합니다.
2. 하단 입력창에 메시지를 입력하고 전송합니다.
3. 다른 브라우저 탭/창을 열어 다중 사용자 메시지 브로드캐스트를 확인해보세요.


