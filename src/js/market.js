window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;

  // 로컬 스토리지 키
  var STORAGE_USER_TEMPLATES = 'imgeditor_market_user_templates';
  var STORAGE_LIKED_IDS = 'imgeditor_market_liked_ids';
  var STORAGE_DOWNLOAD_COUNTS = 'imgeditor_market_downloads';
  var STORAGE_LIKE_COUNTS = 'imgeditor_market_likes';

  // 상태
  var currentSort = 'weekly'; // 'weekly' | 'monthly' | 'popular' | 'latest' | 'my'
  var currentCategory = 'all'; // 'all' | 'doc' | 'banner' | 'card' | 'poster'
  var searchQuery = '';

  // 기본 커뮤니티 템플릿 시드 데이터 (동료 제작 추천 템플릿)
  var SEED_TEMPLATES = [
    {
      id: 'market_seed_1',
      title: '2026 스마트 병영생활 실천수칙 안내문',
      author: '김민준 상병 · 육군 1사단',
      category: 'poster',
      categoryName: '안내문·포스터',
      desc: '신병 및 전입 장병을 위한 병영생활 행동강령 및 안전 실천수칙 A4 포스터',
      ratio: 'A4 세로 (800×1130)',
      weeklyLikes: 342,
      monthlyLikes: 1480,
      downloads: 2840,
      weeklyRank: 1,
      monthlyRank: 1,
      date: '2026-09-15',
      tags: ['국방', '병영', '안전', '수칙', '장병', '포스터'],
      themeColor: '#1e3a8a',
      templateData: {
        width: 800,
        height: 1130,
        background: '#f8fafc',
        objects: [
          { type: 'rect', left: 400, top: 70, width: 740, height: 110, rx: 12, fill: '#1e3a8a' },
          { type: 'text', left: 400, top: 50, text: 'ROK ARMY 2026 SMART LIFE', fontSize: 13, fill: '#93c5fd', fontWeight: 'bold' },
          { type: 'text', left: 400, top: 80, text: '스마트 병영생활 5대 안전 실천수칙', fontSize: 26, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 400, top: 220, width: 740, height: 130, rx: 8, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5 },
          { type: 'text', left: 100, top: 185, text: '01', fontSize: 24, fill: '#2563eb', fontWeight: 'bold' },
          { type: 'text', left: 240, top: 200, text: '상호 존중과 배려의 병영 문화 조성', fontSize: 18, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 340, top: 235, text: '전우 간 고운 말 사용 및 솔선수범 실천하기', fontSize: 14, fill: '#475569' },
          { type: 'rect', left: 400, top: 370, width: 740, height: 130, rx: 8, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5 },
          { type: 'text', left: 100, top: 335, text: '02', fontSize: 24, fill: '#2563eb', fontWeight: 'bold' },
          { type: 'text', left: 240, top: 350, text: '훈련 및 일과 중 안전 장구 완벽 착용', fontSize: 18, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 340, top: 385, text: '방탄모 턱끈 결속 및 장비 점검 철저', fontSize: 14, fill: '#475569' },
          { type: 'rect', left: 400, top: 520, width: 740, height: 130, rx: 8, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5 },
          { type: 'text', left: 100, top: 485, text: '03', fontSize: 24, fill: '#2563eb', fontWeight: 'bold' },
          { type: 'text', left: 240, top: 500, text: '스마트 기기 규정 준수 및 보안 엄수', fontSize: 18, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 340, top: 535, text: '인가된 시간과 구역에서만 통신기기 사용', fontSize: 14, fill: '#475569' },
          { type: 'rect', left: 400, top: 670, width: 740, height: 130, rx: 8, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5 },
          { type: 'text', left: 100, top: 635, text: '04', fontSize: 24, fill: '#2563eb', fontWeight: 'bold' },
          { type: 'text', left: 240, top: 650, text: '건강 이상 징후 즉시 보고 및 진료', fontSize: 18, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 340, top: 685, text: '지휘관 및 의무반 상담을 통한 빠른 조치', fontSize: 14, fill: '#475569' },
          { type: 'rect', left: 400, top: 820, width: 740, height: 130, rx: 8, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5 },
          { type: 'text', left: 100, top: 785, text: '05', fontSize: 24, fill: '#2563eb', fontWeight: 'bold' },
          { type: 'text', left: 240, top: 800, text: '마음 나눔 전우 멘토링 프로그램 참여', fontSize: 18, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 340, top: 835, text: '어려움이 있을 땐 언제든 전우 상담 핫라인 활용', fontSize: 14, fill: '#475569' },
          { type: 'rect', left: 400, top: 1040, width: 740, height: 60, rx: 6, fill: '#0f172a' },
          { type: 'text', left: 400, top: 1040, text: '대한민국 육군 · 함께 만드는 안전하고 활기찬 병영', fontSize: 15, fill: '#f8fafc', fontWeight: 'bold' }
        ]
      }
    },
    {
      id: 'market_seed_2',
      title: '2026 AI 공공서비스 혁신 추진계획서 표지&간지',
      author: '이서연 주무관 · 디지털혁신추진단',
      category: 'doc',
      categoryName: '보고서·문서',
      desc: '정부·지자체 AI 대전환 추진보고를 위한 16:9 와이드 표준 결재형 프레젠테이션',
      ratio: '16:9 와이드 (1920×1080)',
      weeklyLikes: 310,
      monthlyLikes: 1390,
      downloads: 2410,
      weeklyRank: 2,
      monthlyRank: 2,
      date: '2026-09-14',
      tags: ['공공기관', '혁신', '기획', '보고서', 'DX', 'PT'],
      themeColor: '#0369a1',
      templateData: {
        width: 1920,
        height: 1080,
        background: '#f8fafc',
        objects: [
          { type: 'rect', left: 960, top: 540, width: 1840, height: 1000, rx: 16, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 2 },
          { type: 'rect', left: 960, top: 180, width: 1760, height: 160, rx: 12, fill: '#0284c7' },
          { type: 'text', left: 960, top: 140, text: '2026 DIGITAL PUBLIC SERVICE INNOVATION', fontSize: 20, fill: '#bae6fd', fontWeight: 'bold' },
          { type: 'text', left: 960, top: 195, text: '지능형 안심 행정 서비스 구축 종합계획서', fontSize: 44, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 520, top: 550, width: 780, height: 420, rx: 12, fill: '#f0f9ff', stroke: '#bae6fd', strokeWidth: 2 },
          { type: 'text', left: 520, top: 400, text: '■ 추진 목적 및 필요성', fontSize: 24, fill: '#0369a1', fontWeight: 'bold' },
          { type: 'text', left: 520, top: 460, text: '• AI 기반 민원 서식 자동 점검 및 개인정보 보호\n• 24시간 중단 없는 지능형 대민 행정 상담 지원\n• 부서 간 행정 데이터 연계 및 처리 시간 50% 단축', fontSize: 20, fill: '#334155' },
          { type: 'rect', left: 1400, top: 550, width: 780, height: 420, rx: 12, fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 2 },
          { type: 'text', left: 1400, top: 400, text: '■ 기대 효과 및 비전', fontSize: 24, fill: '#0f172a', fontWeight: 'bold' },
          { type: 'text', left: 1400, top: 460, text: '• 대국민 행정 신뢰도 및 만족도 95% 달성\n• 문서 보안 규정 100% 준수 안전망 확보\n• 스마트 행정 생태계 선도적 표준 정립', fontSize: 20, fill: '#475569' },
          { type: 'text', left: 960, top: 960, text: '디지털혁신추진단 · 지능형공공서비스과', fontSize: 18, fill: '#64748b' }
        ]
      }
    },
    {
      id: 'market_seed_3',
      title: '시민 안심 복지 혜택 종합 가이드 카드뉴스',
      author: '박현우 주무관 · 복지정책과',
      category: 'card',
      categoryName: '카드뉴스',
      desc: 'SNS, 홈페이지, 모바일 메신저 홍보용 정사각 1:1 고가독성 복지 알림 카드',
      ratio: '1:1 정사각 (1080×1080)',
      weeklyLikes: 275,
      monthlyLikes: 1120,
      downloads: 1980,
      weeklyRank: 3,
      monthlyRank: 3,
      date: '2026-09-12',
      tags: ['복지', '시민', '카드뉴스', '혜택', '지자체', 'SNS'],
      themeColor: '#059669',
      templateData: {
        width: 1080,
        height: 1080,
        background: '#ecfdf5',
        objects: [
          { type: 'rect', left: 540, top: 540, width: 1000, height: 1000, rx: 24, fill: '#ffffff', stroke: '#a7f3d0', strokeWidth: 3 },
          { type: 'rect', left: 540, top: 180, width: 920, height: 160, rx: 16, fill: '#059669' },
          { type: 'text', left: 540, top: 140, text: '2026 시민 맞춤형 복지 알리미', fontSize: 20, fill: '#a7f3d0', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 195, text: '놓치기 쉬운 주요 복지 지원금 혜택', fontSize: 34, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 540, top: 400, width: 880, height: 140, rx: 12, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1.5 },
          { type: 'text', left: 540, top: 380, text: '① 청년 자립 정착 지원금 (월 최대 50만원 지원)', fontSize: 22, fill: '#065f46', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 420, text: '신청 대상: 만 19세~34세 미취업 청년 누구나 지원 가능', fontSize: 16, fill: '#374151' },
          { type: 'rect', left: 540, top: 580, width: 880, height: 140, rx: 12, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1.5 },
          { type: 'text', left: 540, top: 560, text: '② 어르신 기초생활 의료비 전액 지원', fontSize: 22, fill: '#065f46', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 600, text: '신청 대상: 만 65세 이상 취약계층 안심 의료비 바우처', fontSize: 16, fill: '#374151' },
          { type: 'rect', left: 540, top: 760, width: 880, height: 140, rx: 12, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1.5 },
          { type: 'text', left: 540, top: 740, text: '③ 출산·육아 돌봄 쿠폰 및 첫만남 바우처', fontSize: 22, fill: '#065f46', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 780, text: '지급 대상: 영유아 양육 가정 안심 돌봄 지원', fontSize: 16, fill: '#374151' },
          { type: 'rect', left: 540, top: 950, width: 880, height: 80, rx: 40, fill: '#059669' },
          { type: 'text', left: 540, top: 950, text: '지금 바로 [복지로] 또는 동 주민센터에서 신청하세요!', fontSize: 20, fill: '#ffffff', fontWeight: 'bold' }
        ]
      }
    },
    {
      id: 'market_seed_4',
      title: '부대 안전수칙 & 무사고 100일 챌린지 웹 배너',
      author: '정태양 중사 · 안전관리담당',
      category: 'banner',
      categoryName: '배너·현수막',
      desc: '부대 인트라넷, 홈페이지 및 사령부 게시판용 무사고 달성 홍보 가로 배너',
      ratio: '가로형 배너 (1200×400)',
      weeklyLikes: 220,
      monthlyLikes: 950,
      downloads: 1650,
      weeklyRank: 4,
      monthlyRank: 5,
      date: '2026-09-10',
      tags: ['안전', '부대', '현수막', '배너', '무사고', '국방'],
      themeColor: '#d97706',
      templateData: {
        width: 1200,
        height: 400,
        background: '#fffbeb',
        objects: [
          { type: 'rect', left: 600, top: 200, width: 1140, height: 340, rx: 16, fill: '#ffffff', stroke: '#fde68a', strokeWidth: 2 },
          { type: 'rect', left: 600, top: 80, width: 420, height: 44, rx: 22, fill: '#d97706' },
          { type: 'text', left: 600, top: 80, text: '★ 무사고 안전 부대 100일 달성 챌린지 ★', fontSize: 16, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'text', left: 600, top: 160, text: '"철저한 기본 지키기가 우리 부대의 힘입니다"', fontSize: 32, fill: '#78350f', fontWeight: 'bold' },
          { type: 'text', left: 600, top: 220, text: '차량 운행 전 점검 철저 • 화재 예방 수칙 준수 • 총기 안전관리 만전', fontSize: 18, fill: '#92400e' },
          { type: 'rect', left: 600, top: 310, width: 500, height: 50, rx: 25, fill: '#b45309' },
          { type: 'text', left: 600, top: 310, text: '전 장병 안전 서약 참여하기 ▶', fontSize: 18, fill: '#ffffff', fontWeight: 'bold' }
        ]
      }
    },
    {
      id: 'market_seed_5',
      title: '스마트 4분면 업무보고 핵심 프레임워크',
      author: '최진호 사무관 · 행정안전혁신팀',
      category: 'doc',
      categoryName: '보고서·문서',
      desc: '보고서 본문에 바로 복사해서 쓰는 4분면 전략 분석 매트릭스 서식',
      ratio: '16:9 와이드 (1920×1080)',
      weeklyLikes: 195,
      monthlyLikes: 890,
      downloads: 1420,
      weeklyRank: 5,
      monthlyRank: 4,
      date: '2026-09-08',
      tags: ['프레임워크', '서식', '공문서', '행정', '분석'],
      themeColor: '#4f46e5',
      templateData: {
        width: 1920,
        height: 1080,
        background: '#f8fafc',
        objects: [
          { type: 'rect', left: 960, top: 90, width: 1800, height: 80, rx: 8, fill: '#1e293b' },
          { type: 'text', left: 960, top: 90, text: '핵심 과제 우선순위 평가 4분면 매트릭스 (4-Quadrant Matrix)', fontSize: 26, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 520, top: 360, width: 840, height: 420, rx: 10, fill: '#ede9fe', stroke: '#c4b5fd', strokeWidth: 2 },
          { type: 'text', left: 520, top: 220, text: 'Ⅰ. 즉시 추진 과제 (High Impact, Low Effort)', fontSize: 20, fill: '#4338ca', fontWeight: 'bold' },
          { type: 'text', left: 520, top: 320, text: '• 서식 표준화 및 디지털 결재 간소화\n• 개인정보 실시간 자동 점검 도입\n• 핵심 반복 업무 자동화 템플릿 배포', fontSize: 18, fill: '#312e81' },
          { type: 'rect', left: 1400, top: 360, width: 840, height: 420, rx: 10, fill: '#e0e7ff', stroke: '#a5b4fc', strokeWidth: 2 },
          { type: 'text', left: 1400, top: 220, text: 'Ⅱ. 전략적 중점 과제 (High Impact, High Effort)', fontSize: 20, fill: '#3730a3', fontWeight: 'bold' },
          { type: 'text', left: 1400, top: 320, text: '• 행정망 차세대 AI 코파일럿 플랫폼 구축\n• 공공 빅데이터 실시간 연계 허브 신설\n• 전 기관 통합 업무 포털 고도화', fontSize: 18, fill: '#312e81' },
          { type: 'rect', left: 520, top: 820, width: 840, height: 420, rx: 10, fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 2 },
          { type: 'text', left: 520, top: 680, text: 'Ⅲ. 점진적 개선 과제 (Low Impact, Low Effort)', fontSize: 20, fill: '#475569', fontWeight: 'bold' },
          { type: 'text', left: 520, top: 780, text: '• 일상 서무 업무 체크리스트 개선\n• 부서 내 메신저 공지 템플릿 정비\n• 회의실 예약 및 비품 관리 현대화', fontSize: 18, fill: '#1e293b' },
          { type: 'rect', left: 1400, top: 820, width: 840, height: 420, rx: 10, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 2 },
          { type: 'text', left: 1400, top: 680, text: 'Ⅳ. 재검토 과제 (Low Impact, High Effort)', fontSize: 20, fill: '#64748b', fontWeight: 'bold' },
          { type: 'text', left: 1400, top: 780, text: '• 활용도 낮은 레거시 시스템 유지보수 축소\n• 불필요한 관행 보고서 작성 폐지\n• 오프라인 대면 결재 동선 최소화', fontSize: 18, fill: '#334155' }
        ]
      }
    },
    {
      id: 'market_seed_6',
      title: '신임 공직자 오리엔테이션 환영 포스터',
      author: '윤아영 주무관 · 인재개발원',
      category: 'poster',
      categoryName: '안내문·포스터',
      desc: '신규 임용자 및 연수생을 따뜻하게 맞이하는 청사 로비 환영 배너 및 포스터',
      ratio: 'A4 세로 (800×1130)',
      weeklyLikes: 168,
      monthlyLikes: 780,
      downloads: 1190,
      weeklyRank: 6,
      monthlyRank: 6,
      date: '2026-09-05',
      tags: ['연수', '환영', '신규', '교육', '포스터'],
      themeColor: '#7c3aed',
      templateData: {
        width: 800,
        height: 1130,
        background: '#faf5ff',
        objects: [
          { type: 'rect', left: 400, top: 120, width: 720, height: 160, rx: 16, fill: '#7c3aed' },
          { type: 'text', left: 400, top: 80, text: 'WELCOME TO PUBLIC SERVICE', fontSize: 16, fill: '#e9d5ff', fontWeight: 'bold' },
          { type: 'text', left: 400, top: 130, text: '2026년도 신임 공직자 임용을 환영합니다!', fontSize: 26, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 400, top: 400, width: 720, height: 340, rx: 12, fill: '#ffffff', stroke: '#ddd6fe', strokeWidth: 2 },
          { type: 'text', left: 400, top: 300, text: '"여러분의 열정이 대한민국의 새로운 내일을 엽니다"', fontSize: 20, fill: '#5b21b6', fontWeight: 'bold' },
          { type: 'text', left: 400, top: 380, text: '• 일시: 2026년 10월 5일(월) 09:30\n• 장소: 인재개발원 본관 대강당 (2층)\n• 준비물: 신분증, 필기도구, 환영 패키지 수령증', fontSize: 16, fill: '#4c1d95', lineHeight: 1.6 },
          { type: 'rect', left: 400, top: 760, width: 720, height: 260, rx: 12, fill: '#f5f3ff', stroke: '#ddd6fe', strokeWidth: 1.5 },
          { type: 'text', left: 400, top: 700, text: '안내 및 문의처', fontSize: 18, fill: '#6d28d9', fontWeight: 'bold' },
          { type: 'text', left: 400, top: 780, text: '교육기획운영과 ☎ 02-1234-5678\n청사 셔틀버스는 08:30부터 10분 간격 순환 운행합니다.', fontSize: 15, fill: '#5b21b6' },
          { type: 'text', left: 400, top: 1060, text: '인재개발원 교육운영단', fontSize: 16, fill: '#6b7280' }
        ]
      }
    },
    {
      id: 'market_seed_7',
      title: '민원창구 전자서명 및 방문예약 이용 가이드',
      author: '스마트민원과',
      category: 'card',
      categoryName: '카드뉴스',
      desc: '종이 없는 디지털 민원 신청 절차를 한눈에 안내하는 주민 친화형 카드뉴스',
      ratio: '1:1 정사각 (1080×1080)',
      weeklyLikes: 145,
      monthlyLikes: 670,
      downloads: 980,
      weeklyRank: 7,
      monthlyRank: 7,
      date: '2026-09-03',
      tags: ['민원', '전자서명', '방문예약', '안내', '카드뉴스'],
      themeColor: '#0284c7',
      templateData: {
        width: 1080,
        height: 1080,
        background: '#f0f9ff',
        objects: [
          { type: 'rect', left: 540, top: 140, width: 960, height: 180, rx: 16, fill: '#0284c7' },
          { type: 'text', left: 540, top: 110, text: '기다림 없이 빠른 원스톱 민원!', fontSize: 20, fill: '#bae6fd', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 160, text: '모바일 사전 방문예약 & 전자서명 이용법', fontSize: 30, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'rect', left: 540, top: 400, width: 920, height: 160, rx: 12, fill: '#ffffff', stroke: '#e0f2fe', strokeWidth: 2 },
          { type: 'text', left: 540, top: 370, text: 'STEP 1. 스마트폰으로 사전 방문 예약하기', fontSize: 22, fill: '#0369a1', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 420, text: '시청 홈페이지 또는 모바일 앱에서 방문 일시 및 민원 서식 선택', fontSize: 16, fill: '#334155' },
          { type: 'rect', left: 540, top: 600, width: 920, height: 160, rx: 12, fill: '#ffffff', stroke: '#e0f2fe', strokeWidth: 2 },
          { type: 'text', left: 540, top: 570, text: 'STEP 2. 창구 전용 태블릿 전자 서명', fontSize: 22, fill: '#0369a1', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 620, text: '종이 서류 작성 없이 태블릿 화면에서 터치 한 번으로 간편 서명 완료', fontSize: 16, fill: '#334155' },
          { type: 'rect', left: 540, top: 800, width: 920, height: 160, rx: 12, fill: '#ffffff', stroke: '#e0f2fe', strokeWidth: 2 },
          { type: 'text', left: 540, top: 770, text: 'STEP 3. 전자문서 지갑으로 증명서 즉시 발급', fontSize: 22, fill: '#0369a1', fontWeight: 'bold' },
          { type: 'text', left: 540, top: 820, text: '종이 출력물 분실 걱정 없이 스마트폰 앱 전자문서 지갑에 안전 저장', fontSize: 16, fill: '#334155' },
          { type: 'text', left: 540, top: 980, text: '문의: 스마트민원콜센터 국번없이 120', fontSize: 18, fill: '#0284c7', fontWeight: 'bold' }
        ]
      }
    },
    {
      id: 'market_seed_8',
      title: '2026 공공 DX 솔루션 세미나 웹 배너',
      author: '공공DX기획포럼',
      category: 'banner',
      categoryName: '배너·현수막',
      desc: '홈페이지 상단 및 팝업용 공공 디지털 전환 세미나 홍보 배너',
      ratio: '가로형 배너 (1200×400)',
      weeklyLikes: 120,
      monthlyLikes: 540,
      downloads: 820,
      weeklyRank: 8,
      monthlyRank: 8,
      date: '2026-09-01',
      tags: ['컨퍼런스', '배너', '홍보', '세미나', 'DX'],
      themeColor: '#0f172a',
      templateData: {
        width: 1200,
        height: 400,
        background: '#0f172a',
        objects: [
          { type: 'rect', left: 600, top: 200, width: 1160, height: 360, rx: 16, fill: '#1e293b', stroke: '#334155', strokeWidth: 2 },
          { type: 'text', left: 600, top: 90, text: 'PUBLIC DX INNOVATION SEMINAR 2026', fontSize: 16, fill: '#38bdf8', fontWeight: 'bold' },
          { type: 'text', left: 600, top: 160, text: '차세대 행정 AI 전환과 공공 디자인 혁신', fontSize: 34, fill: '#ffffff', fontWeight: 'bold' },
          { type: 'text', left: 600, top: 225, text: '일시: 2026. 10. 28(수) 14:00 | 정부세종컨벤션센터 대연회장 & 온라인 생중계', fontSize: 16, fill: '#cbd5e1' },
          { type: 'rect', left: 600, top: 310, width: 360, height: 46, rx: 23, fill: '#0284c7' },
          { type: 'text', left: 600, top: 310, text: '사전등록 바로가기 (무료) ▶', fontSize: 16, fill: '#ffffff', fontWeight: 'bold' }
        ]
      }
    }
  ];

  /* ------------------------------------------------------------ 스토리지 헬퍼 */

  function getLikedIds() {
    try {
      var raw = localStorage.getItem(STORAGE_LIKED_IDS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLikedIds(ids) {
    try {
      localStorage.setItem(STORAGE_LIKED_IDS, JSON.stringify(ids));
    } catch (e) {}
  }

  function getDownloadCounts() {
    try {
      var raw = localStorage.getItem(STORAGE_DOWNLOAD_COUNTS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveDownloadCounts(counts) {
    try {
      localStorage.setItem(STORAGE_DOWNLOAD_COUNTS, JSON.stringify(counts));
    } catch (e) {}
  }

  function getLikeCounts() {
    try {
      var raw = localStorage.getItem(STORAGE_LIKE_COUNTS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLikeCounts(counts) {
    try {
      localStorage.setItem(STORAGE_LIKE_COUNTS, JSON.stringify(counts));
    } catch (e) {}
  }

  function getUserTemplates() {
    try {
      var raw = localStorage.getItem(STORAGE_USER_TEMPLATES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserTemplates(templates) {
    try {
      localStorage.setItem(STORAGE_USER_TEMPLATES, JSON.stringify(templates));
    } catch (e) {}
  }

  function getAllTemplates() {
    var userList = getUserTemplates();
    var all = userList.concat(SEED_TEMPLATES);
    var likedIds = getLikedIds();
    var dlCounts = getDownloadCounts();
    var likeCounts = getLikeCounts();

    return all.map(function (tpl) {
      var isLiked = likedIds.indexOf(tpl.id) !== -1;
      var addedLikes = likeCounts[tpl.id] || 0;
      var addedDls = dlCounts[tpl.id] || 0;

      return {
        id: tpl.id,
        title: tpl.title,
        author: tpl.author || '익명 사용자',
        category: tpl.category || 'doc',
        categoryName: tpl.categoryName || '보고서·문서',
        desc: tpl.desc || '',
        ratio: tpl.ratio || '자유 규격',
        weeklyLikes: (tpl.weeklyLikes || 10) + addedLikes,
        monthlyLikes: (tpl.monthlyLikes || 30) + addedLikes,
        downloads: (tpl.downloads || 25) + addedDls,
        weeklyRank: tpl.weeklyRank || 99,
        monthlyRank: tpl.monthlyRank || 99,
        date: tpl.date || '2026-09-17',
        tags: tpl.tags || [],
        themeColor: tpl.themeColor || '#2563eb',
        isUser: !!tpl.isUser,
        isLiked: isLiked,
        templateData: tpl.templateData
      };
    });
  }

  /* ------------------------------------------------------------ 렌더링 */

  function renderCard(tpl, index) {
    var rankBadge = '';
    if (currentSort === 'weekly' || currentSort === 'monthly') {
      var rankNum = index + 1;
      if (rankNum === 1) rankBadge = '<span class="market-rank-badge rank-1" title="1위 (최다 호응)">🥇 1위</span>';
      else if (rankNum === 2) rankBadge = '<span class="market-rank-badge rank-2" title="2위">🥈 2위</span>';
      else if (rankNum === 3) rankBadge = '<span class="market-rank-badge rank-3" title="3위">🥉 3위</span>';
      else rankBadge = '<span class="market-rank-badge rank-other">' + rankNum + '위</span>';
    } else if (tpl.isUser) {
      rankBadge = '<span class="market-rank-badge rank-user">내가 등록</span>';
    }

    var heartIco = tpl.isLiked ? '❤️' : '🤍';
    var likeCount = (currentSort === 'monthly') ? tpl.monthlyLikes : tpl.weeklyLikes;

    return '<div class="market-card" data-template-id="' + tpl.id + '">' +
      '<div class="market-card-thumb-wrap">' +
        '<div class="market-card-thumb" style="background:' + tpl.themeColor + '10; border-top: 4px solid ' + tpl.themeColor + ';">' +
          '<div class="market-thumb-preview">' +
            '<span class="market-thumb-ratio">' + tpl.ratio + '</span>' +
            '<div class="market-thumb-title">' + util.escapeHtml(tpl.title) + '</div>' +
          '</div>' +
        '</div>' +
        rankBadge +
        '<span class="market-cat-badge">' + tpl.categoryName + '</span>' +
      '</div>' +
      '<div class="market-card-body">' +
        '<div class="market-card-title" title="' + util.escapeHtml(tpl.title) + '">' + util.escapeHtml(tpl.title) + '</div>' +
        '<div class="market-card-author">👤 ' + util.escapeHtml(tpl.author) + '</div>' +
        '<div class="market-card-desc">' + util.escapeHtml(tpl.desc) + '</div>' +
        '<div class="market-card-stats">' +
          '<button type="button" class="market-like-btn' + (tpl.isLiked ? ' is-liked' : '') + '" data-like-id="' + tpl.id + '" title="좋아요 토글">' +
            '<span class="market-heart">' + heartIco + '</span> ' +
            '<b class="market-like-num">' + likeCount + '</b>' +
          '</button>' +
          '<span class="market-dls" title="적용 및 다운로드 횟수">' +
            '⬇️ <b>' + tpl.downloads.toLocaleString() + '</b>회' +
          '</span>' +
        '</div>' +
        '<div class="market-card-actions">' +
          '<button type="button" class="fo-btn fo-btn-primary market-apply-btn" data-apply-id="' + tpl.id + '" title="캔버스에 이 템플릿 즉시 로드">' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>' +
            '캔버스에 적용' +
          '</button>' +
          '<button type="button" class="fo-btn market-export-btn" data-export-id="' + tpl.id + '" title="폐쇄망 동료 공유용 파일(.imgtpl) 다운로드">' +
            '<svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
            '저장' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function panelHtml() {
    var all = getAllTemplates();

    // 1. 카테고리 필터
    if (currentCategory !== 'all') {
      all = all.filter(function (it) { return it.category === currentCategory; });
    }

    // 2. 검색 필터
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      all = all.filter(function (it) {
        return (it.title && it.title.toLowerCase().indexOf(q) !== -1) ||
               (it.author && it.author.toLowerCase().indexOf(q) !== -1) ||
               (it.desc && it.desc.toLowerCase().indexOf(q) !== -1) ||
               (it.tags && it.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }));
      });
    }

    // 3. 정렬 필터
    if (currentSort === 'weekly') {
      all.sort(function (a, b) { return b.weeklyLikes - a.weeklyLikes; });
    } else if (currentSort === 'monthly') {
      all.sort(function (a, b) { return b.monthlyLikes - a.monthlyLikes; });
    } else if (currentSort === 'popular') {
      all.sort(function (a, b) { return (b.downloads + b.monthlyLikes) - (a.downloads + a.monthlyLikes); });
    } else if (currentSort === 'latest') {
      all.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    } else if (currentSort === 'my') {
      all = all.filter(function (it) { return it.isUser; });
    }

    var tabs = [
      ['weekly', '🏆 주간 랭킹'],
      ['monthly', '🌟 월간 랭킹'],
      ['popular', '🔥 인기순'],
      ['latest', '⏱️ 최신순'],
      ['my', '👤 내 템플릿']
    ];

    var tabRow = '<div class="market-sort-tabs">' +
      tabs.map(function (tab) {
        return '<button type="button" class="market-sort-tab' + (tab[0] === currentSort ? ' is-active' : '') +
          '" data-market-sort="' + tab[0] + '">' + tab[1] + '</button>';
      }).join('') +
    '</div>';

    var cats = [
      ['all', '전체'],
      ['doc', '보고서·문서'],
      ['poster', '안내문·포스터'],
      ['banner', '배너·현수막'],
      ['card', '카드뉴스']
    ];

    var catRow = '<div class="chip-row" style="margin-bottom:12px;">' +
      cats.map(function (c) {
        return '<button type="button" class="chip' + (c[0] === currentCategory ? ' is-active' : '') +
          '" data-market-cat="' + c[0] + '">' + c[1] + '</button>';
      }).join('') +
    '</div>';

    var searchBox = '<label class="el-search" style="margin-bottom:10px;">' +
      '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
      '<input type="search" id="market-search" placeholder="제목, 제작자, 태그 검색 — 병영, 보고서, 복지…" value="' +
        searchQuery.replace(/"/g, '&quot;') + '">' +
    '</label>';

    var topBanner = '<div class="market-hero-box">' +
      '<div class="market-hero-head">' +
        '<b>동료 템플릿 공유마켓</b>' +
        '<span>함께 나누고 참여하는 디자인</span>' +
      '</div>' +
      '<div class="market-hero-actions">' +
        '<button type="button" class="fo-btn fo-btn-primary" id="btn-market-share-now" style="width:100%;height:38px;font-weight:700;font-size:13px;gap:7px;">' +
          '<svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          '내가 만든 템플릿 공유하기' +
        '</button>' +
        '<div style="display:flex;gap:6px;margin-top:6px;">' +
          '<button type="button" class="fo-btn" id="btn-market-import-file" style="flex:1;height:32px;font-size:11.5px;gap:5px;" title="동료에게 받은 .imgtpl 파일 가져오기">' +
            '<svg viewBox="0 0 24 24" style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
            '공유 파일 열기' +
          '</button>' +
          '<input type="file" id="market-file-input" accept=".imgtpl,.json" hidden />' +
        '</div>' +
      '</div>' +
    '</div>';

    var listHtml = '';
    if (!all.length) {
      listHtml = '<div style="padding:36px 0;text-align:center;color:var(--ink-3);font-size:12.5px;">' +
        (currentSort === 'my' ? '아직 직접 공유한 템플릿이 없습니다.<br>위의 <b>[내가 만든 템플릿 공유하기]</b>를 눌러 등록해보세요!' : '조건에 맞는 공유 템플릿이 없습니다.') +
      '</div>';
    } else {
      listHtml = '<div class="market-grid">' +
        all.map(renderCard).join('') +
      '</div>';
    }

    return '<div class="fo-section" style="padding-top:2px;">' +
      topBanner +
      tabRow +
      searchBox +
      catRow +
      listHtml +
      '<p class="fo-hint" style="margin-top:14px;">' +
        '공유마켓은 동료들이 만든 실전 행정·국방 템플릿을 서로 다운로드하고 좋아요(❤️)로 응원하는 <b>참여형 디자인 나눔 공간</b>입니다. ' +
        '인터넷 연결이 없는 폐쇄망에서도 로컬 파일(.imgtpl) 내보내기/가져오기로 타 PC 간 완전 공유가 가능합니다.' +
      '</p>' +
    '</div>';
  }

  /* ------------------------------------------------------------ 이벤트 바인딩 */

  function bindPanel(host) {
    // 1. 정렬 탭
    Array.prototype.forEach.call(host.querySelectorAll('[data-market-sort]'), function (btn) {
      btn.addEventListener('click', function () {
        currentSort = btn.getAttribute('data-market-sort');
        IE.panel.render();
      });
    });

    // 2. 카테고리 칩
    Array.prototype.forEach.call(host.querySelectorAll('[data-market-cat]'), function (btn) {
      btn.addEventListener('click', function () {
        currentCategory = btn.getAttribute('data-market-cat');
        IE.panel.render();
      });
    });

    // 3. 검색 입력
    var searchIn = host.querySelector('#market-search');
    if (searchIn) {
      searchIn.addEventListener('input', function () {
        searchQuery = searchIn.value.trim();
        var grid = host.querySelector('.market-grid');
        if (grid) {
          // 리스트 영역만 갱신
          IE.panel.render();
        }
      });
    }

    // 4. 좋아요 토글
    Array.prototype.forEach.call(host.querySelectorAll('[data-like-id]'), function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var id = btn.getAttribute('data-like-id');
        var likedIds = getLikedIds();
        var likeCounts = getLikeCounts();
        var isLiked = likedIds.indexOf(id) !== -1;

        if (isLiked) {
          likedIds = likedIds.filter(function (x) { return x !== id; });
          likeCounts[id] = Math.max(0, (likeCounts[id] || 0) - 1);
          util.toast('좋아요를 취소했습니다.');
        } else {
          likedIds.push(id);
          likeCounts[id] = (likeCounts[id] || 0) + 1;
          util.toast('❤️ 템플릿을 추천(좋아요)했습니다!');
        }

        saveLikedIds(likedIds);
        saveLikeCounts(likeCounts);
        IE.panel.render();
      });
    });

    // 5. 템플릿 캔버스에 적용
    Array.prototype.forEach.call(host.querySelectorAll('[data-apply-id]'), function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-apply-id');
        var all = getAllTemplates();
        var target = null;
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === id) { target = all[i]; break; }
        }

        if (!target || !target.templateData) {
          util.toast('템플릿 데이터를 찾을 수 없습니다.');
          return;
        }

        if (!confirm('현재 캔버스에 [' + target.title + '] 템플릿을 적용하시겠습니까?')) return;

        // 다운로드 카운트 증가
        var dlCounts = getDownloadCounts();
        dlCounts[id] = (dlCounts[id] || 0) + 1;
        saveDownloadCounts(dlCounts);

        // 템플릿 적용
        IE.canvas.applyTemplate(target.templateData);
        util.toast('[' + target.title + '] 템플릿이 캔버스에 적용되었습니다!');
        IE.panel.render();
      });
    });

    // 6. 독립 공유 파일 (.imgtpl) 다운로드
    Array.prototype.forEach.call(host.querySelectorAll('[data-export-id]'), function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-export-id');
        var all = getAllTemplates();
        var target = null;
        for (var i = 0; i < all.length; i++) {
          if (all[i].id === id) { target = all[i]; break; }
        }

        if (!target) return;

        var packageData = {
          version: '1.0',
          type: 'imgeditor_template',
          exportedAt: new Date().toISOString(),
          template: target
        };

        var jsonStr = JSON.stringify(packageData, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (target.title.replace(/[\\/:*?"<>|]/g, '_') || '공유템플릿') + '.imgtpl';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        util.toast('공유 파일이 저장되었습니다. 동료 PC로 전달할 수 있습니다.');
      });
    });

    // 7. 내 템플릿 공유하기 버튼 -> 모달 호출
    var btnShare = host.querySelector('#btn-market-share-now');
    if (btnShare) {
      btnShare.addEventListener('click', function () {
        openShareModal();
      });
    }

    // 8. 공유 파일 열기 버튼 -> 파일 인풋 트리거
    var btnImport = host.querySelector('#btn-market-import-file');
    var fileIn = host.querySelector('#market-file-input');
    if (btnImport && fileIn) {
      btnImport.addEventListener('click', function () {
        fileIn.click();
      });

      fileIn.addEventListener('change', function () {
        var file = fileIn.files && fileIn.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (e) {
          try {
            var data = JSON.parse(e.target.result);
            var tpl = data.template || data;
            if (!tpl || !tpl.title || !tpl.templateData) {
              alert('올바른 안심 디자인 공유 템플릿(.imgtpl) 형식이 아닙니다.');
              return;
            }

            tpl.id = 'market_imported_' + Date.now();
            tpl.isUser = true;
            tpl.weeklyLikes = tpl.weeklyLikes || 1;
            tpl.monthlyLikes = tpl.monthlyLikes || 1;
            tpl.downloads = tpl.downloads || 1;

            var userList = getUserTemplates();
            userList.unshift(tpl);
            saveUserTemplates(userList);

            currentSort = 'my';
            IE.panel.render();
            util.toast('[' + tpl.title + '] 공유 템플릿을 성공적으로 가져왔습니다!');
          } catch (err) {
            alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
          }
          fileIn.value = '';
        };
        reader.readAsText(file, 'utf-8');
      });
    }
  }

  /* ------------------------------------------------------------ 템플릿 공유 등록 모달 */

  function openShareModal() {
    var canvas = IE.state.canvas;
    if (!canvas) {
      util.toast('캔버스가 활성화되지 않았습니다.');
      return;
    }

    var objects = canvas.getObjects();
    if (!objects.length) {
      alert('현재 캔버스에 아무 객체도 없습니다.\n먼저 템플릿으로 공유할 멋진 디자인을 캔버스에 꾸며주세요!');
      return;
    }

    // 캔버스 데이터 직렬화
    var w = canvas.width || 1200;
    var h = canvas.height || 800;
    var bg = canvas.backgroundColor || '#ffffff';

    var ratioLabel = '16:9 와이드';
    if (Math.abs(w / h - 1) < 0.05) ratioLabel = '1:1 정사각';
    else if (Math.abs(w / h - (800 / 1130)) < 0.1 || Math.abs(w / h - (210 / 297)) < 0.1) ratioLabel = 'A4 세로';
    else if (w / h > 2.2) ratioLabel = '가로형 배너';

    var modalHtml = '<div class="market-modal-backdrop" id="market-modal">' +
      '<div class="market-modal-box">' +
        '<div class="market-modal-head">' +
          '<h3>내가 만든 템플릿 동료에게 공유하기</h3>' +
          '<button type="button" class="market-modal-close" id="market-modal-close">&times;</button>' +
        '</div>' +
        '<div class="market-modal-body">' +
          '<div class="market-form-row">' +
            '<label>템플릿 제목 <span style="color:var(--danger)">*</span></label>' +
            '<input type="text" id="share-tpl-title" class="text-input" placeholder="예: [안내문] 2026 부대 안전수칙 실천 포스터" value="내가 만든 새 템플릿" />' +
          '</div>' +
          '<div class="market-form-row">' +
            '<label>제작자 / 소속 부서 <span style="color:var(--danger)">*</span></label>' +
            '<input type="text" id="share-tpl-author" class="text-input" placeholder="예: 김민우 주무관 · 총무과" value="스마트 디자인 동료" />' +
          '</div>' +
          '<div class="market-form-row">' +
            '<label>분류 (카테고리)</label>' +
            '<select id="share-tpl-cat" class="text-input" style="height:36px;">' +
              '<option value="doc">보고서 · 행정 문서</option>' +
              '<option value="poster" selected>안내문 · 포스터</option>' +
              '<option value="banner">배너 · 현수막</option>' +
              '<option value="card">카드뉴스</option>' +
            '</select>' +
          '</div>' +
          '<div class="market-form-row">' +
            '<label>소개 및 활용 팁 (선택)</label>' +
            '<textarea id="share-tpl-desc" class="text-input" rows="2" placeholder="어떤 목적으로 사용하는 템플릿인지 동료들에게 간단히 설명해주세요.">부대 및 행정 기관에서 바로 활용 가능한 실전 디자인 서식입니다.</textarea>' +
          '</div>' +
          '<div class="market-share-info">' +
            '<span>📐 현재 캔버스 규격: <b>' + w + ' × ' + h + ' px (' + ratioLabel + ')</b></span>' +
            '<span style="margin-left:auto;color:var(--brand-700);font-weight:600;">총 ' + objects.length + '개 레이어 포함</span>' +
          '</div>' +
        '</div>' +
        '<div class="market-modal-foot">' +
          '<button type="button" class="fo-btn" id="market-modal-cancel">취소</button>' +
          '<button type="button" class="fo-btn fo-btn-primary" id="market-modal-submit" style="gap:6px;">' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;"><polyline points="20 6 9 17 4 12"/></svg>' +
            '공유마켓에 등록하기' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    // 모달 DOM 주입
    var wrap = document.createElement('div');
    wrap.innerHTML = modalHtml;
    var modalEl = wrap.firstElementChild;
    document.body.appendChild(modalEl);

    function closeModal() {
      if (modalEl && modalEl.parentNode) {
        modalEl.parentNode.removeChild(modalEl);
      }
    }

    modalEl.querySelector('#market-modal-close').addEventListener('click', closeModal);
    modalEl.querySelector('#market-modal-cancel').addEventListener('click', closeModal);

    modalEl.querySelector('#market-modal-submit').addEventListener('click', function () {
      var titleIn = modalEl.querySelector('#share-tpl-title').value.trim();
      var authorIn = modalEl.querySelector('#share-tpl-author').value.trim();
      var catIn = modalEl.querySelector('#share-tpl-cat').value;
      var descIn = modalEl.querySelector('#share-tpl-desc').value.trim();

      if (!titleIn) {
        alert('템플릿 제목을 입력해주세요.');
        return;
      }
      if (!authorIn) {
        alert('제작자 또는 소속을 입력해주세요.');
        return;
      }

      var catNames = {
        doc: '보고서·문서',
        poster: '안내문·포스터',
        banner: '배너·현수막',
        card: '카드뉴스'
      };

      // 템플릿 직렬화 객체 생성
      var canvasJson = canvas.toObject(['id', 'kind', 'isGuide', 'isSlot', 'lockMovementX', 'lockMovementY', 'tableData']);
      var templateData = {
        width: w,
        height: h,
        background: bg,
        objects: canvasJson.objects || []
      };

      var newTpl = {
        id: 'user_tpl_' + Date.now(),
        title: titleIn,
        author: authorIn,
        category: catIn,
        categoryName: catNames[catIn] || '문서',
        desc: descIn,
        ratio: ratioLabel + ' (' + w + '×' + h + ')',
        weeklyLikes: 1,
        monthlyLikes: 1,
        downloads: 1,
        weeklyRank: 99,
        monthlyRank: 99,
        date: new Date().toISOString().slice(0, 10),
        tags: [catNames[catIn], '자작', '공유', '동료제작'],
        themeColor: '#2563eb',
        isUser: true,
        templateData: templateData
      };

      var userList = getUserTemplates();
      userList.unshift(newTpl);
      saveUserTemplates(userList);

      closeModal();
      currentSort = 'my';
      IE.panel.render();
      util.toast('🎉 [' + titleIn + '] 템플릿이 공유마켓에 성공적으로 등록되었습니다!');
    });
  }

  /* ------------------------------------------------------------ 공개 API */

  IE.market = {
    panelHtml: panelHtml,
    bindPanel: bindPanel,
    getAll: getAllTemplates,
    openShareModal: openShareModal
  };

})(window.IE);
