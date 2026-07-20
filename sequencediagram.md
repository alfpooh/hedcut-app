sequenceDiagram
    autonumber

    box rgb(255,247,213) 사용자 영역
        actor U as 사용자
    end

    box rgb(201,236,246) 뉴스 서비스
        participant A as 기사 서비스
    end

    box rgb(232,222,255) AI 지원
        participant AI as AI 읽기 지원
    end

    box rgb(255,226,178) 학습 관리
        participant L as 학습 시스템
    end

    box rgb(198,241,187) 외부 공유
        participant S as SNS
    end

    U->>A: 기사 탐색
    A-->>U: 기사 목록 제공
    U->>A: 기사 선택 및 읽기
    A-->>U: 읽기 지원 기능 제공

    alt 하이라이트·밑줄
        U->>A: 문장 선택 및 표시
        A->>AI: 선택 문장 전달
    else 쉬운 설명·용어 확인
        U->>AI: 쉬운 설명 또는 용어 요청
        AI-->>U: 맞춤형 설명 제공
    else AI 질문·요약
        U->>AI: 기사 질문 또는 요약 요청
        AI-->>U: 답변 및 핵심 요약 제공
    end

    AI->>L: 선택 내용과 분석 결과 전달
    L-->>U: AI 학습 노트 생성
    U->>L: 복습·게임형 학습 참여
    L-->>U: 학습 결과 및 완독 기록 제공
    U->>S: 완독 기록·학습 카드 공유
    S-->>U: 공유 완료
