window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var FONT = 'Malgun Gothic';

  var CATEGORIES = [
    { id: 'promo', name: '홍보물 · 배너 · 공고문' },
    { id: 'idphoto', name: '증명사진 · 사진 규격' },
    { id: 'doc', name: '조직도 · 안내문 · 표지' },
    { id: 'print', name: '명함 · 상장 · 현수막' },
    { id: 'ppt', name: 'PPT · 발표 자료' },
    { id: 'user', name: '내 템플릿' }
  ];

  /* ------------------------------------------------------------ 헬퍼 */

  function text(def) {
    def.type = 'text';
    def.fontFamily = def.fontFamily || FONT;
    return def;
  }

  function rect(def) {
    def.type = 'rect';
    return def;
  }

  function gradientRect(def) {
    def.type = 'rect';
    return def;
  }

  /** 배경 레이어 — 사용자가 색이나 그라데이션을 바꿀 수 있다 */
  function background(def) {
    def.type = 'rect';
    def.kind = 'bg';
    return def;
  }

  function slot(def) {
    def.type = 'slot';
    return def;
  }

  function guide(def) {
    def.type = 'rect';
    def.isGuide = true;
    def.fill = 'rgba(0,0,0,0)';
    def.stroke = '#94a3b8';
    def.strokeWidth = 1;
    def.strokeDashArray = [7, 5];
    return def;
  }

  function icon(def) {
    def.type = 'icon';
    return def;
  }

  /** 그라데이션 정의 — angle 은 도(degree), 0=오른쪽, 90=아래 */
  function grad(angle, stops) {
    return { angle: angle, stops: stops };
  }

  var BLUE = grad(90, [{ offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#3b82f6' }]);
  var DEEP = grad(120, [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1e3a8a' }]);
  var WARM = grad(120, [{ offset: 0, color: '#f97316' }, { offset: 1, color: '#db2777' }]);
  var MINT = grad(120, [{ offset: 0, color: '#0d9488' }, { offset: 1, color: '#22d3ee' }]);
  var GOLD = grad(110, [{ offset: 0, color: '#b45309' }, { offset: 1, color: '#f59e0b' }]);

  /* ---------------------------------------------------------- 템플릿 */

  var TEMPLATES = [

    /* ============================== 홍보물 · 배너 · 공고문 */

    {
      id: 'notice-a4',
      category: 'promo',
      name: '공고문',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 210, gradient: DEEP }),
        text({
          text: '공 고 문',
          left: 0, top: 60, width: 1240, fontSize: 72, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', lineHeight: 1.1
        }),
        text({
          text: '제 2026 - ○○ 호',
          left: 0, top: 152, width: 1240, fontSize: 26,
          fill: '#c7d2fe', textAlign: 'center'
        }),
        text({
          text: '2026. ○○. ○○.',
          left: 80, top: 268, width: 1080, fontSize: 30,
          fill: '#374151', textAlign: 'right'
        }),
        text({
          text: [
            '다음과 같이 공고합니다.',
            '',
            '1. 공고명 : ○○○○ 사업',
            '2. 공고기간 : 2026. ○○. ○○. ~ 2026. ○○. ○○.',
            '3. 신청방법 : ○○○○',
            '4. 문의처 : ○○과 (☎ 000-0000)',
            '',
            '기타 자세한 사항은 붙임 자료를 참고하시기 바랍니다.'
          ].join('\n'),
          left: 80, top: 340, width: 1080, fontSize: 30,
          fill: '#111827', lineHeight: 1.9, textAlign: 'left'
        }),
        rect({ left: 80, top: 1490, width: 1080, height: 2, fill: '#9ca3af' }),
        text({
          text: '○○○ 기 관 장',
          left: 80, top: 1535, width: 1080, fontSize: 40, fontWeight: 'bold',
          fill: '#111827', textAlign: 'center'
        })
      ]
    },

    {
      id: 'notice-board',
      category: 'promo',
      name: '안내 게시문',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        rect({ left: 0, top: 0, width: 1240, height: 14, fill: '#0d9488' }),
        rect({ left: 0, top: 1740, width: 1240, height: 14, fill: '#0d9488' }),
        icon({ iconName: 'info', left: 566, top: 130, size: 110, fill: '#0d9488' }),
        text({
          text: '안 내 말 씀',
          left: 0, top: 290, width: 1240, fontSize: 68, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 520, top: 392, width: 200, height: 5, fill: '#0d9488' }),
        text({
          text: [
            '평소 ○○○○ 업무에 협조해 주셔서 감사합니다.',
            '',
            '아래와 같이 안내드리오니 업무에 참고하시기 바랍니다.',
            '',
            '○ 기간 : 2026. ○○. ○○. ~ ○○. ○○.',
            '○ 대상 : 전 직원',
            '○ 내용 : ○○○○',
            '',
            '문의사항은 ○○과(☎ 000-0000)로 연락 주시기 바랍니다.'
          ].join('\n'),
          left: 130, top: 470, width: 980, fontSize: 32,
          fill: '#1f2937', lineHeight: 2.0
        }),
        rect({ left: 130, top: 1290, width: 980, height: 3, fill: '#e2e8f0' }),
        text({
          text: '○○○ 기관장',
          left: 130, top: 1330, width: 980, fontSize: 38, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        })
      ]
    },

    {
      id: 'poster-square',
      category: 'promo',
      name: '홍보 포스터',
      note: '정사각 · 1080 × 1080',
      width: 1080,
      height: 1080,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1080, height: 520, gradient: BLUE }),
        text({
          text: '○○○ 기관',
          left: 80, top: 68, width: 920, fontSize: 28, fill: '#bfdbfe'
        }),
        text({
          text: '제목을 입력하세요',
          left: 80, top: 138, width: 920, fontSize: 76, fontWeight: 'bold',
          fill: '#ffffff', lineHeight: 1.18
        }),
        slot({ left: 80, top: 600, width: 920, height: 300, label: '사진' }),
        rect({ left: 80, top: 936, width: 160, height: 8, fill: '#f59e0b' }),
        text({
          text: '내용을 입력하세요. 전달하고 싶은 내용을 자유롭게 적어 주세요.',
          left: 80, top: 972, width: 920, fontSize: 32,
          fill: '#374151', lineHeight: 1.6
        })
      ]
    },

    {
      id: 'poster-gradient',
      category: 'promo',
      name: '그라데이션 포스터',
      note: '정사각 · 1080 × 1080',
      width: 1080,
      height: 1080,
      background: '#111827',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1080, height: 1080, gradient: DEEP }),
        gradientRect({ left: 0, top: 0, width: 1080, height: 12, gradient: GOLD }),
        icon({ iconName: 'trophy', left: 460, top: 132, size: 160, fill: '#f2c14e' }),
        text({
          text: '○○○ 공모전',
          left: 90, top: 350, width: 900, fontSize: 88, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 20
        }),
        text({
          text: '아이디어를 기다립니다',
          left: 90, top: 470, width: 900, fontSize: 40,
          fill: '#93c5fd', textAlign: 'center'
        }),
        rect({ left: 390, top: 580, width: 300, height: 4, fill: '#f2c14e' }),
        text({
          text: [
            '접수기간  2026. ○○. ○○. ~ ○○. ○○.',
            '참가대상  전 직원',
            '문    의  ○○과 (☎ 000-0000)'
          ].join('\n'),
          left: 150, top: 660, width: 780, fontSize: 34,
          fill: '#e2e8f0', lineHeight: 2.1, textAlign: 'center'
        }),
        rect({ left: 300, top: 900, width: 480, height: 76, fill: '#f2c14e', rx: 38, ry: 38 }),
        text({
          text: '많은 참여 바랍니다',
          left: 300, top: 924, width: 480, fontSize: 32, fontWeight: 'bold',
          fill: '#1f2937', textAlign: 'center'
        })
      ]
    },

    {
      id: 'banner-wide',
      category: 'promo',
      name: '가로 배너',
      note: '가로 · 1200 × 628',
      width: 1200,
      height: 628,
      background: '#0f172a',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1200, height: 628, gradient: DEEP }),
        rect({ left: 0, top: 0, width: 14, height: 628, fill: '#22d3ee' }),
        text({
          text: '제목을 입력하세요',
          left: 80, top: 150, width: 660, fontSize: 64, fontWeight: 'bold',
          fill: '#ffffff', lineHeight: 1.2
        }),
        text({
          text: '부제목 또는 안내 문구를 입력하세요',
          left: 80, top: 336, width: 660, fontSize: 30, fill: '#94a3b8'
        }),
        slot({ left: 790, top: 80, width: 330, height: 468, label: '이미지' })
      ]
    },

    {
      id: 'sns-card',
      category: 'promo',
      name: 'SNS 카드뉴스',
      note: '정사각 · 1080 × 1080',
      width: 1080,
      height: 1080,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1080, height: 420, gradient: MINT }),
        text({
          text: '카드뉴스',
          left: 0, top: 96, width: 1080, fontSize: 46, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 60
        }),
        text({
          text: '알아두면 좋은\n업무 정보',
          left: 0, top: 176, width: 1080, fontSize: 62, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', lineHeight: 1.3
        }),
        text({
          text: '01  첫 번째 내용을 입력하세요',
          left: 90, top: 500, width: 900, fontSize: 40, fontWeight: 'bold', fill: '#0f766e'
        }),
        text({
          text: '설명을 입력하세요. 두 줄까지 자연스럽게 들어갑니다.',
          left: 90, top: 566, width: 900, fontSize: 30, fill: '#475569', lineHeight: 1.6
        }),
        rect({ left: 90, top: 690, width: 900, height: 2, fill: '#e2e8f0' }),
        text({
          text: '02  두 번째 내용을 입력하세요',
          left: 90, top: 730, width: 900, fontSize: 40, fontWeight: 'bold', fill: '#0f766e'
        }),
        text({
          text: '설명을 입력하세요.',
          left: 90, top: 796, width: 900, fontSize: 30, fill: '#475569', lineHeight: 1.6
        }),
        rect({ left: 90, top: 940, width: 900, height: 90, fill: '#f0fdfa', rx: 10, ry: 10 }),
        text({
          text: '○○○ 기관  ·  문의 000-0000',
          left: 90, top: 968, width: 900, fontSize: 30, fill: '#0f766e', textAlign: 'center'
        })
      ]
    },

    /* ================================== 증명사진 · 사진 규격 */

    {
      id: 'id-35x45',
      category: 'idphoto',
      name: '증명사진 (3.5 × 4.5)',
      note: '3.5 × 4.5 cm · 300dpi (413 × 531)',
      width: 413,
      height: 531,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 413, height: 531, fill: '#ffffff' }),
        slot({ left: 0, top: 0, width: 413, height: 531, label: '사진' }),
        guide({ left: 82, top: 62, width: 249, height: 332 })
      ]
    },

    {
      id: 'id-25x35',
      category: 'idphoto',
      name: '반명함 (2.5 × 3.5)',
      note: '2.5 × 3.5 cm · 300dpi (295 × 413)',
      width: 295,
      height: 413,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 295, height: 413, fill: '#ffffff' }),
        slot({ left: 0, top: 0, width: 295, height: 413, label: '사진' }),
        guide({ left: 59, top: 45, width: 177, height: 240 })
      ]
    },

    {
      id: 'id-30x40',
      category: 'idphoto',
      name: '주민등록용 (3 × 4)',
      note: '3 × 4 cm · 300dpi (354 × 472)',
      width: 354,
      height: 472,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 354, height: 472, fill: '#ffffff' }),
        slot({ left: 0, top: 0, width: 354, height: 472, label: '사진' }),
        guide({ left: 70, top: 54, width: 214, height: 285 })
      ]
    },

    {
      id: 'id-sheet',
      category: 'idphoto',
      name: '증명사진 6컷 인화',
      note: '4 × 6 인화지 · 300dpi (1200 × 1800)',
      width: 1200,
      height: 1800,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1200, height: 1800, fill: '#ffffff' }),
        slot({ left: 40, top: 100, width: 340, height: 437, label: '사진 1' }),
        slot({ left: 430, top: 100, width: 340, height: 437, label: '사진 2' }),
        slot({ left: 820, top: 100, width: 340, height: 437, label: '사진 3' }),
        slot({ left: 40, top: 600, width: 340, height: 437, label: '사진 4' }),
        slot({ left: 430, top: 600, width: 340, height: 437, label: '사진 5' }),
        slot({ left: 820, top: 600, width: 340, height: 437, label: '사진 6' }),
        rect({ left: 40, top: 60, width: 1120, height: 4, fill: '#e2e8f0' }),
        rect({ left: 40, top: 1100, width: 1120, height: 4, fill: '#e2e8f0' }),
        text({
          text: '각 칸을 더블클릭해 사진을 넣으세요. 3.5 × 4.5 기준입니다.',
          left: 40, top: 1690, width: 1120, fontSize: 26,
          fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    /* ================================== 조직도 · 안내문 · 표지 */

    {
      id: 'org-chart',
      category: 'doc',
      name: '조직도',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '조 직 도',
          left: 0, top: 82, width: 1240, fontSize: 54, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 420, top: 172, width: 400, height: 3, fill: '#2563eb' }),
        gradientRect({ left: 470, top: 250, width: 300, height: 104, gradient: DEEP, rx: 6, ry: 6 }),
        text({
          text: '기관장',
          left: 470, top: 285, width: 300, fontSize: 34, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center'
        }),
        rect({ left: 619, top: 354, width: 2, height: 76, fill: '#94a3b8' }),
        rect({ left: 310, top: 430, width: 620, height: 2, fill: '#94a3b8' }),
        rect({ left: 309, top: 430, width: 2, height: 56, fill: '#94a3b8' }),
        rect({ left: 619, top: 430, width: 2, height: 56, fill: '#94a3b8' }),
        rect({ left: 929, top: 430, width: 2, height: 56, fill: '#94a3b8' }),
        gradientRect({ left: 160, top: 486, width: 300, height: 100, gradient: BLUE, rx: 6, ry: 6 }),
        gradientRect({ left: 470, top: 486, width: 300, height: 100, gradient: BLUE, rx: 6, ry: 6 }),
        gradientRect({ left: 780, top: 486, width: 300, height: 100, gradient: BLUE, rx: 6, ry: 6 }),
        text({ text: '기획과', left: 160, top: 518, width: 300, fontSize: 30, fill: '#ffffff', textAlign: 'center' }),
        text({ text: '총무과', left: 470, top: 518, width: 300, fontSize: 30, fill: '#ffffff', textAlign: 'center' }),
        text({ text: '민원과', left: 780, top: 518, width: 300, fontSize: 30, fill: '#ffffff', textAlign: 'center' })
      ]
    },

    {
      id: 'org-tree',
      category: 'doc',
      name: '부서 조직도',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        text({
          text: '○○○ 기관 조직 현황',
          left: 0, top: 70, width: 1754, fontSize: 48, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 777, top: 148, width: 200, height: 3, fill: '#0d9488' }),
        gradientRect({ left: 707, top: 200, width: 340, height: 92, gradient: grad(90, [
          { offset: 0, color: '#0f766e' }, { offset: 1, color: '#14b8a6' }
        ]), rx: 6, ry: 6 }),
        text({ text: '기관장', left: 707, top: 232, width: 340, fontSize: 32, fill: '#ffffff', textAlign: 'center' }),
        rect({ left: 877, top: 292, width: 2, height: 70, fill: '#94a3b8' }),
        rect({ left: 267, top: 362, width: 1220, height: 2, fill: '#94a3b8' }),

        rect({ left: 266, top: 362, width: 2, height: 48, fill: '#94a3b8' }),
        rect({ left: 877, top: 362, width: 2, height: 48, fill: '#94a3b8' }),
        rect({ left: 1487, top: 362, width: 2, height: 48, fill: '#94a3b8' }),

        rect({ left: 120, top: 410, width: 300, height: 76, fill: '#f1f5f9', rx: 6, ry: 6, stroke: '#0d9488', strokeWidth: 2 }),
        rect({ left: 727, top: 410, width: 300, height: 76, fill: '#f1f5f9', rx: 6, ry: 6, stroke: '#0d9488', strokeWidth: 2 }),
        rect({ left: 1334, top: 410, width: 300, height: 76, fill: '#f1f5f9', rx: 6, ry: 6, stroke: '#0d9488', strokeWidth: 2 }),
        text({ text: '기획과', left: 120, top: 434, width: 300, fontSize: 28, fill: '#0f172a', textAlign: 'center' }),
        text({ text: '총무과', left: 727, top: 434, width: 300, fontSize: 28, fill: '#0f172a', textAlign: 'center' }),
        text({ text: '민원과', left: 1334, top: 434, width: 300, fontSize: 28, fill: '#0f172a', textAlign: 'center' }),

        text({
          text: '기획·예산·성과관리',
          left: 120, top: 500, width: 300, fontSize: 22, fill: '#64748b', textAlign: 'center'
        }),
        text({
          text: '인사·서무·회계',
          left: 727, top: 500, width: 300, fontSize: 22, fill: '#64748b', textAlign: 'center'
        }),
        text({
          text: '민원접수·상담',
          left: 1334, top: 500, width: 300, fontSize: 22, fill: '#64748b', textAlign: 'center'
        }),

        rect({ left: 120, top: 570, width: 1514, height: 2, fill: '#e2e8f0' }),
        text({
          text: '담당별 업무는 각 과에서 확인하시기 바랍니다.',
          left: 120, top: 600, width: 1514, fontSize: 24, fill: '#94a3b8'
        })
      ]
    },

    {
      id: 'cover-a4',
      category: 'doc',
      name: '문서 표지',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#f8fafc',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 22, gradient: DEEP }),
        text({ text: '○○○ 기관', left: 120, top: 150, width: 1000, fontSize: 30, fill: '#64748b' }),
        text({
          text: '업무 계획서',
          left: 120, top: 540, width: 1000, fontSize: 96, fontWeight: 'bold',
          fill: '#0f172a', lineHeight: 1.25
        }),
        rect({ left: 120, top: 880, width: 140, height: 10, fill: '#2563eb' }),
        text({
          text: '2026년도 ○○ 업무 추진 계획',
          left: 120, top: 930, width: 1000, fontSize: 38, fill: '#475569'
        }),
        text({
          text: '작성 : ○○과 ○○○       2026. ○○. ○○.',
          left: 120, top: 1560, width: 1000, fontSize: 28, fill: '#94a3b8'
        })
      ]
    },

    {
      id: 'toc-page',
      category: 'doc',
      name: '목차',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        text({
          text: '목   차',
          left: 0, top: 110, width: 1240, fontSize: 56, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center', charSpacing: 30
        }),
        rect({ left: 540, top: 208, width: 160, height: 4, fill: '#2563eb' }),
        text({
          text: [
            'Ⅰ. 추진 배경 ·············································· 1',
            'Ⅱ. 추진 목표 ·············································· 3',
            'Ⅲ. 세부 추진 계획 ····································· 5',
            'Ⅳ. 소요 예산 ·············································· 9',
            'Ⅴ. 기대 효과 ·············································· 11',
            'Ⅵ. 행정 사항 ·············································· 13'
          ].join('\n\n'),
          left: 140, top: 320, width: 960, fontSize: 34,
          fill: '#1f2937', lineHeight: 1.5
        })
      ]
    },

    {
      id: 'report-page',
      category: 'doc',
      name: '보고서 본문',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        rect({ left: 80, top: 80, width: 6, height: 56, fill: '#2563eb' }),
        text({
          text: 'Ⅰ. 추진 배경',
          left: 110, top: 88, width: 1050, fontSize: 42, fontWeight: 'bold',
          fill: '#0f172a'
        }),
        text({
          text: [
            '○ 본문 내용을 입력하세요. 각 항목은 ○, -, ‣ 기호로 구분하면 읽기 좋습니다.',
            '○ 문단을 나눌 때는 빈 줄을 한 번 넣어 주세요.',
            '○ 인용이 필요한 경우 출처를 함께 적어 주시기 바랍니다.'
          ].join('\n\n'),
          left: 110, top: 180, width: 1050, fontSize: 30,
          fill: '#1f2937', lineHeight: 1.9
        }),
        text({
          text: 'Ⅱ. 세부 내용',
          left: 110, top: 560, width: 1050, fontSize: 38, fontWeight: 'bold',
          fill: '#0f172a'
        }),
        rect({ left: 110, top: 690, width: 1050, height: 300, fill: '#f8fafc', rx: 8, ry: 8, stroke: '#cbd5e1', strokeWidth: 2 }),
        text({
          text: '표 또는 그림을 넣는 영역입니다.',
          left: 110, top: 815, width: 1050, fontSize: 28, fill: '#94a3b8', textAlign: 'center'
        }),
        text({
          text: '○ 위 영역에 표·그림을 배치하거나 이미지를 올려 주세요.',
          left: 110, top: 1040, width: 1050, fontSize: 30,
          fill: '#1f2937', lineHeight: 1.9
        }),
        rect({ left: 110, top: 1620, width: 1050, height: 2, fill: '#e2e8f0' }),
        text({
          text: '- 1 -',
          left: 110, top: 1640, width: 1050, fontSize: 26, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    /* ================================== 명함 · 상장 · 현수막 */

    {
      id: 'card-90x50',
      category: 'print',
      name: '명함 (90 × 50)',
      note: '90 × 50 mm · 300dpi (1063 × 591)',
      width: 1063,
      height: 591,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1063, height: 591, fill: '#ffffff' }),
        rect({ left: 0, top: 0, width: 18, height: 591, fill: '#1e3a8a' }),
        text({
          text: '홍 길 동',
          left: 82, top: 150, width: 520, fontSize: 64, fontWeight: 'bold',
          fill: '#0f172a'
        }),
        text({
          text: '○○○ 기관 · 주무관',
          left: 84, top: 232, width: 520, fontSize: 26, fill: '#475569'
        }),
        rect({ left: 84, top: 292, width: 90, height: 4, fill: '#2563eb' }),
        text({
          text: [
            'Tel  000-0000-0000',
            'E-mail  hong@example.go.kr',
            '○○시 ○○구 ○○로 00, ○층'
          ].join('\n'),
          left: 84, top: 330, width: 620, fontSize: 24,
          fill: '#334155', lineHeight: 1.7
        }),
        rect({ left: 760, top: 130, width: 200, height: 200, fill: '#eef2f8', rx: 100, ry: 100 }),
        text({
          text: '로고',
          left: 760, top: 215, width: 200, fontSize: 26,
          fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    {
      id: 'card-back',
      category: 'print',
      name: '명함 뒷면',
      note: '90 × 50 mm · 300dpi (1063 × 591)',
      width: 1063,
      height: 591,
      background: '#1e3a8a',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1063, height: 591, gradient: DEEP }),
        icon({ iconName: 'badgeCircle', left: 468, top: 110, size: 128, fill: '#93c5fd' }),
        text({
          text: '○ ○ ○ ○',
          left: 0, top: 286, width: 1063, fontSize: 48, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 30
        }),
        text({
          text: '함께하는 행정, 신뢰받는 기관',
          left: 0, top: 372, width: 1063, fontSize: 26,
          fill: '#bfdbfe', textAlign: 'center'
        }),
        rect({ left: 431, top: 440, width: 200, height: 2, fill: '#3b82f6' }),
        text({
          text: 'www.example.go.kr',
          left: 0, top: 470, width: 1063, fontSize: 24, fill: '#93c5fd', textAlign: 'center'
        })
      ]
    },

    {
      id: 'award-land',
      category: 'print',
      name: '상장',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#fffdf6',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#fffdf6' }),
        rect({ left: 46, top: 46, width: 1662, height: 1148, fill: 'rgba(0,0,0,0)', stroke: '#1e3a8a', strokeWidth: 6 }),
        rect({ left: 64, top: 64, width: 1626, height: 1112, fill: 'rgba(0,0,0,0)', stroke: '#c7a44a', strokeWidth: 2 }),
        text({
          text: '제 2026 - ○○ 호',
          left: 0, top: 132, width: 1754, fontSize: 26,
          fill: '#8a7a4a', textAlign: 'center'
        }),
        text({
          text: '상    장',
          left: 0, top: 190, width: 1754, fontSize: 92, fontWeight: 'bold',
          fill: '#1e3a8a', textAlign: 'center'
        }),
        rect({ left: 812, top: 320, width: 130, height: 6, fill: '#c7a44a' }),
        text({
          text: [
            '성 명 : ○ ○ ○',
            '소 속 : ○○○ 기관 ○○과',
            '',
            '위 사람은 ○○○○ 업무 추진에 헌신적으로 노력하여',
            '우리 기관 발전에 크게 기여하였으므로',
            '그 공적을 기리어 이 상장을 수여합니다.'
          ].join('\n'),
          left: 0, top: 392, width: 1754, fontSize: 34,
          fill: '#243043', lineHeight: 2.0, textAlign: 'center'
        }),
        text({
          text: '2026년 ○○월 ○○일',
          left: 0, top: 900, width: 1754, fontSize: 32, fill: '#243043', textAlign: 'center'
        }),
        text({
          text: '○○○ 기 관 장',
          left: 0, top: 1000, width: 1754, fontSize: 46, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 1120, top: 986, width: 96, height: 96, fill: 'rgba(0,0,0,0)', stroke: '#c0392b', strokeWidth: 3, rx: 6, ry: 6 }),
        text({ text: '직인', left: 1120, top: 1024, width: 96, fontSize: 22, fill: '#c0392b', textAlign: 'center' })
      ]
    },

    {
      id: 'cert-land',
      category: 'print',
      name: '수료증',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#ffffff' }),
        rect({ left: 0, top: 0, width: 1754, height: 16, fill: '#0d9488' }),
        rect({ left: 0, top: 1224, width: 1754, height: 16, fill: '#0d9488' }),
        text({
          text: '제 2026 - ○○ 호',
          left: 0, top: 140, width: 1754, fontSize: 26, fill: '#64748b', textAlign: 'center'
        }),
        text({
          text: '수 료 증',
          left: 0, top: 200, width: 1754, fontSize: 88, fontWeight: 'bold',
          fill: '#0f766e', textAlign: 'center', charSpacing: 20
        }),
        rect({ left: 817, top: 330, width: 120, height: 5, fill: '#0d9488' }),
        text({
          text: [
            '성 명 : ○ ○ ○',
            '생년월일 : ○○○○. ○○. ○○.',
            '과 정 명 : ○○○○ 과정',
            '교육기간 : 2026. ○○. ○○. ~ ○○. ○○.',
            '',
            '위 사람은 위 과정을 성실히 이수하였으므로',
            '이 증서를 수여합니다.'
          ].join('\n'),
          left: 0, top: 400, width: 1754, fontSize: 32,
          fill: '#1f2937', lineHeight: 2.0, textAlign: 'center'
        }),
        text({
          text: '2026년 ○○월 ○○일',
          left: 0, top: 960, width: 1754, fontSize: 30, fill: '#1f2937', textAlign: 'center'
        }),
        text({
          text: '○○○ 교육원장',
          left: 0, top: 1040, width: 1754, fontSize: 44, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        icon({ iconName: 'check', left: 1060, top: 1030, size: 76, fill: '#0d9488' })
      ]
    },

    {
      id: 'placard-wide',
      category: 'print',
      name: '현수막',
      note: '가로 대형 (2400 × 800)',
      width: 2400,
      height: 800,
      background: '#0b3b6f',
      objects: [
        gradientRect({ left: 0, top: 0, width: 2400, height: 800, gradient: grad(90, [
          { offset: 0, color: '#0b3b6f' }, { offset: 1, color: '#1d4ed8' }
        ]) }),
        rect({ left: 0, top: 0, width: 2400, height: 16, fill: '#f2c14e' }),
        rect({ left: 0, top: 784, width: 2400, height: 16, fill: '#f2c14e' }),
        text({
          text: '○ ○ ○ ○ 축 제',
          left: 0, top: 170, width: 2400, fontSize: 150, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 40
        }),
        text({
          text: '2026. ○○. ○○.(○)  ~  ○○. ○○.(○)',
          left: 0, top: 396, width: 2400, fontSize: 46,
          fill: '#bcd7f5', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '○○시 ○○공원 일원',
          left: 0, top: 470, width: 2400, fontSize: 44,
          fill: '#bcd7f5', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '주최 · 주관  ○○○ 기관',
          left: 0, top: 592, width: 2400, fontSize: 44,
          fill: '#f2c14e', textAlign: 'center', charSpacing: 8
        })
      ]
    },

    /* ============================== 업무 문서 세트 · 포스터 ============================== */

    {
      id: 'plan-cover',
      category: 'doc',
      name: '계획서 표지 (디자인)',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 620, gradient: grad(135, [
          { offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#0ea5e9' }
        ]) }),
        icon({ iconName: 'docs', left: 1080, top: 90, size: 150, fill: 'rgba(255,255,255,0.22)' }),
        text({ text: '○○○ 기관', left: 110, top: 120, width: 800, fontSize: 30, fill: '#bfdbfe', charSpacing: 6 }),
        rect({ left: 110, top: 190, width: 90, height: 6, fill: '#f2c14e' }),
        text({
          text: '2026년도\n○○ 업무 추진 계획',
          left: 110, top: 250, width: 900, fontSize: 78, fontWeight: 'bold',
          fill: '#ffffff', lineHeight: 1.3
        }),
        text({
          text: '○○과  ·  담당 ○○○',
          left: 110, top: 660, width: 900, fontSize: 30, fill: '#64748b'
        }),
        text({
          text: '2026. ○○. ○○.',
          left: 110, top: 710, width: 900, fontSize: 28, fill: '#94a3b8'
        }),
        rect({ left: 110, top: 800, width: 1020, height: 2, fill: '#e2e8f0' }),
        text({
          text: [
            'Ⅰ. 추진 배경과 목적',
            'Ⅱ. 추진 방향',
            'Ⅲ. 세부 추진 계획',
            'Ⅳ. 소요 예산',
            'Ⅴ. 기대 효과'
          ].join('\n'),
          left: 110, top: 860, width: 1020, fontSize: 34,
          fill: '#334155', lineHeight: 2.2
        }),
        gradientRect({ left: 110, top: 1560, width: 1020, height: 8, gradient: grad(0, [
          { offset: 0, color: '#1e3a8a' }, { offset: 1, color: '#0ea5e9' }
        ]) })
      ]
    },

    {
      id: 'plan-body',
      category: 'doc',
      name: '계획서 본문 (표 포함)',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        rect({ left: 0, top: 0, width: 1240, height: 8, fill: '#1e3a8a' }),
        text({
          text: 'Ⅲ. 세부 추진 계획',
          left: 90, top: 90, width: 1060, fontSize: 44, fontWeight: 'bold', fill: '#0f172a'
        }),
        rect({ left: 90, top: 160, width: 120, height: 5, fill: '#2563eb' }),
        text({
          text: '○ 아래와 같이 세부 계획을 수립하여 추진하고자 합니다.',
          left: 90, top: 210, width: 1060, fontSize: 30, fill: '#334155', lineHeight: 1.8
        }),
        {
          type: 'table',
          left: 90,
          top: 300,
          rows: 5,
          cols: 4,
          cellW: 265,
          cellH: 96,
          fontSize: 26,
          headerRow: true,
          headerCol: true,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '구분' }, { text: '추진 내용' }, { text: '기간' }, { text: '담당' }],
            [{ text: '1' }, { text: '계획 수립' }, { text: '1월' }, { text: '○○과' }],
            [{ text: '2' }, { text: '대상자 선정' }, { text: '2월' }, { text: '○○과' }],
            [{ text: '3' }, { text: '사업 추진' }, { text: '3~10월' }, { text: '○○과' }],
            [{ text: '4' }, { text: '결과 보고' }, { text: '12월' }, { text: '○○과' }]
          ]
        },
        text({
          text: '○ 추진 일정은 기관 사정에 따라 변경될 수 있습니다.',
          left: 90, top: 900, width: 1060, fontSize: 28, fill: '#475569', lineHeight: 1.9
        }),
        icon({ iconName: 'bulb', left: 90, top: 1020, size: 70, fill: '#f59e0b' }),
        text({
          text: [
            '추진 시 유의사항',
            '',
            '· 관련 규정을 사전에 확인합니다.',
            '· 예산 집행은 회계 연도 내에 완료합니다.',
            '· 추진 결과는 다음 연도 계획에 반영합니다.'
          ].join('\n'),
          left: 180, top: 1020, width: 970, fontSize: 29, fill: '#334155', lineHeight: 1.9
        }),
        rect({ left: 90, top: 1650, width: 1060, height: 2, fill: '#e2e8f0' }),
        text({ text: '- 3 -', left: 90, top: 1668, width: 1060, fontSize: 26, fill: '#94a3b8', textAlign: 'center' })
      ]
    },

    {
      id: 'notice-card',
      category: 'promo',
      name: '알림 카드 (정사각)',
      note: '정사각 · 1080 × 1080',
      width: 1080,
      height: 1080,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#f8fafc' }),
        gradientRect({ left: 60, top: 60, width: 960, height: 960, gradient: grad(135, [
          { offset: 0, color: '#eef2ff' }, { offset: 1, color: '#e0f2fe' }
        ]), rx: 28, ry: 28 }),
        rect({ left: 60, top: 60, width: 960, height: 14, fill: '#2563eb' }),
        icon({ iconName: 'bell', left: 466, top: 150, size: 148, fill: '#2563eb' }),
        text({
          text: '알 림',
          left: 0, top: 340, width: 1080, fontSize: 82, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center', charSpacing: 40
        }),
        rect({ left: 460, top: 462, width: 160, height: 6, fill: '#f59e0b' }),
        text({
          text: '내용을 입력하세요.\n전달하고 싶은 내용을 두세 줄로 적어 주세요.',
          left: 160, top: 530, width: 760, fontSize: 38,
          fill: '#334155', textAlign: 'center', lineHeight: 1.7
        }),
        rect({ left: 300, top: 790, width: 480, height: 84, fill: '#2563eb', rx: 42, ry: 42 }),
        text({
          text: '확인 부탁드립니다',
          left: 300, top: 815, width: 480, fontSize: 32, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '○○○ 기관 · ○○과',
          left: 0, top: 920, width: 1080, fontSize: 26, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    {
      id: 'safety-poster',
      category: 'promo',
      name: '안전 캠페인 포스터',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1240, height: 900, gradient: grad(150, [
          { offset: 0, color: '#b91c1c' }, { offset: 1, color: '#f97316' }
        ]) }),
        icon({ iconName: 'exclamation', left: 520, top: 120, size: 200, fill: '#ffffff' }),
        text({
          text: '안 전 제 일',
          left: 0, top: 360, width: 1240, fontSize: 130, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 40
        }),
        rect({ left: 470, top: 540, width: 300, height: 8, fill: '#fde68a' }),
        text({
          text: '작은 부주의가 큰 사고를 부릅니다',
          left: 0, top: 590, width: 1240, fontSize: 44,
          fill: '#fef3c7', textAlign: 'center'
        }),
        icon({ iconName: 'shieldCheck', left: 200, top: 980, size: 130, fill: '#b91c1c' }),
        icon({ iconName: 'checkCircle', left: 555, top: 980, size: 130, fill: '#b91c1c' }),
        icon({ iconName: 'people', left: 910, top: 980, size: 130, fill: '#b91c1c' }),
        text({
          text: [
            '작업 전 안전 점검',
            '보호구 착용',
            '동료와 함께 확인'
          ].join('\n'),
          left: 160, top: 1150, width: 920, fontSize: 38,
          fill: '#334155', textAlign: 'center', lineHeight: 2.0
        }),
        rect({ left: 0, top: 1560, width: 1240, height: 194, fill: '#0f172a' }),
        text({
          text: '○○○ 기관 안전관리과  ·  문의 000-0000',
          left: 0, top: 1640, width: 1240, fontSize: 34,
          fill: '#facc15', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    {
      id: 'banner-strip',
      category: 'promo',
      name: '얇은 띠배너',
      note: '가로 띠 · 1600 × 400',
      width: 1600,
      height: 400,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1600, height: 400, gradient: grad(90, [
          { offset: 0, color: '#111827' }, { offset: 1, color: '#1d4ed8' }
        ]) }),
        icon({ iconName: 'sparkleStar', left: 90, top: 130, size: 140, fill: '#fbbf24' }),
        text({
          text: '○○○ 안내',
          left: 260, top: 110, width: 900, fontSize: 66, fontWeight: 'bold',
          fill: '#ffffff'
        }),
        text({
          text: '2026년부터 달라지는 제도를 확인하세요',
          left: 262, top: 210, width: 900, fontSize: 34, fill: '#bfdbfe'
        }),
        icon({ iconName: 'arrowRight', left: 1350, top: 130, size: 150, fill: '#fbbf24' })
      ]
    },

    {
      id: 'email-header',
      category: 'promo',
      name: '메일 머리글',
      note: '가로 · 1200 × 320',
      width: 1200,
      height: 320,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1200, height: 320, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1200, height: 12, gradient: grad(0, [
          { offset: 0, color: '#0d9488' }, { offset: 1, color: '#22d3ee' }
        ]) }),
        icon({ iconName: 'building', left: 90, top: 110, size: 110, fill: '#0d9488' }),
        text({
          text: '○○○ 기관',
          left: 230, top: 96, width: 700, fontSize: 52, fontWeight: 'bold', fill: '#0f172a'
        }),
        text({
          text: '○○과  ·  ○○○ 주무관  ·  000-0000',
          left: 232, top: 176, width: 800, fontSize: 28, fill: '#64748b'
        }),
        rect({ left: 90, top: 250, width: 1020, height: 2, fill: '#e2e8f0' })
      ]
    },

    {
      id: 'banner-event',
      category: 'promo',
      name: '행사 배너 (세로)',
      note: '세로 · 800 × 2000',
      width: 800,
      height: 2000,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 800, height: 2000, gradient: grad(160, [
          { offset: 0, color: '#4c1d95' }, { offset: 1, color: '#6d28d9' }
        ]) }),
        icon({ iconName: 'trophy', left: 320, top: 130, size: 160, fill: '#fbbf24' }),
        text({
          text: '○○○\n행사 안내',
          left: 60, top: 360, width: 680, fontSize: 84, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', lineHeight: 1.3
        }),
        rect({ left: 330, top: 620, width: 140, height: 6, fill: '#fbbf24' }),
        text({
          text: [
            '일시  2026. ○○. ○○.(○) 10:00',
            '장소  ○○시 ○○구 ○○홀',
            '대상  전 직원 및 가족',
            '',
            '문의  ○○과 (☎ 000-0000)'
          ].join('\n'),
          left: 80, top: 720, width: 640, fontSize: 34,
          fill: '#ddd6fe', lineHeight: 2.1, textAlign: 'center'
        }),
        rect({ left: 80, top: 1290, width: 640, height: 420, fill: 'rgba(255,255,255,0.10)', rx: 12, ry: 12 }),
        text({
          text: '사진 또는 안내 이미지',
          left: 80, top: 1470, width: 640, fontSize: 30,
          fill: 'rgba(255,255,255,0.55)', textAlign: 'center'
        }),
        text({
          text: '많은 참여 바랍니다',
          left: 0, top: 1830, width: 800, fontSize: 40, fontWeight: 'bold',
          fill: '#fbbf24', textAlign: 'center', charSpacing: 8
        })
      ]
    },

    {
      id: 'id-35x45-blue',
      category: 'idphoto',
      name: '증명사진 (하늘색 배경)',
      note: '3.5 × 4.5 cm · 300dpi (413 × 531)',
      width: 413,
      height: 531,
      background: '#4a90d9',
      objects: [
        background({ left: 0, top: 0, width: 413, height: 531, fill: '#4a90d9' }),
        slot({ left: 0, top: 0, width: 413, height: 531, label: '누끼 사진' }),
        guide({ left: 82, top: 62, width: 249, height: 332 })
      ]
    },

    {
      id: 'id-35x45-gray',
      category: 'idphoto',
      name: '증명사진 (회색 배경)',
      note: '3.5 × 4.5 cm · 300dpi (413 × 531)',
      width: 413,
      height: 531,
      background: '#d8dde3',
      objects: [
        background({ left: 0, top: 0, width: 413, height: 531, fill: '#d8dde3' }),
        slot({ left: 0, top: 0, width: 413, height: 531, label: '누끼 사진' }),
        guide({ left: 82, top: 62, width: 249, height: 332 })
      ]
    },

    {
      id: 'id-strip-4',
      category: 'idphoto',
      name: '증명사진 4컷 (가로)',
      note: '가로 인화 · 300dpi (1800 × 1200)',
      width: 1800,
      height: 1200,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1800, height: 1200, fill: '#ffffff' }),
        slot({ left: 100, top: 330, width: 340, height: 437, label: '사진 1' }),
        slot({ left: 530, top: 330, width: 340, height: 437, label: '사진 2' }),
        slot({ left: 960, top: 330, width: 340, height: 437, label: '사진 3' }),
        slot({ left: 1390, top: 330, width: 340, height: 437, label: '사진 4' }),
        text({
          text: '증명사진 (3.5 × 4.5)',
          left: 0, top: 120, width: 1800, fontSize: 44, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '각 칸을 더블클릭해 사진을 넣으세요',
          left: 0, top: 190, width: 1800, fontSize: 28, fill: '#94a3b8', textAlign: 'center'
        }),
        rect({ left: 100, top: 860, width: 1630, height: 2, fill: '#e2e8f0' }),
        text({
          text: '출력 시 실제 크기(100%)로 인쇄하세요',
          left: 100, top: 900, width: 1630, fontSize: 26, fill: '#94a3b8'
        })
      ]
    },

    {
      id: 'org-matrix',
      category: 'doc',
      name: '업무분장표',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#ffffff' }),
        text({
          text: '○○과 업무분장',
          left: 0, top: 70, width: 1754, fontSize: 48, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 827, top: 148, width: 100, height: 5, fill: '#2563eb' }),
        {
          type: 'table',
          left: 100,
          top: 220,
          rows: 6,
          cols: 4,
          cellW: 388,
          cellH: 130,
          fontSize: 26,
          headerRow: true,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '담당' }, { text: '성명' }, { text: '담당 업무' }, { text: '비고' }],
            [{ text: '과장' }, { text: '○○○' }, { text: '업무 총괄' }, { text: '' }],
            [{ text: '팀장' }, { text: '○○○' }, { text: '기획 · 예산' }, { text: '' }],
            [{ text: '주무관' }, { text: '○○○' }, { text: '인사 · 서무' }, { text: '' }],
            [{ text: '주무관' }, { text: '○○○' }, { text: '회계 · 계약' }, { text: '' }],
            [{ text: '주무관' }, { text: '○○○' }, { text: '민원 · 상담' }, { text: '' }]
          ]
        },
        text({
          text: '※ 업무 내용은 조직 개편에 따라 변경될 수 있습니다.',
          left: 100, top: 1060, width: 1554, fontSize: 26, fill: '#64748b'
        })
      ]
    },

    {
      id: 'cert-comp',
      category: 'print',
      name: '표창장',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#fffef8',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#fffef8' }),
        rect({ left: 40, top: 40, width: 1674, height: 1160, fill: 'rgba(0,0,0,0)', stroke: '#b45309', strokeWidth: 8 }),
        rect({ left: 58, top: 58, width: 1638, height: 1124, fill: 'rgba(0,0,0,0)', stroke: '#f59e0b', strokeWidth: 2 }),
        icon({ iconName: 'medal', left: 800, top: 130, size: 154, fill: '#b45309' }),
        text({
          text: '표 창 장',
          left: 0, top: 320, width: 1754, fontSize: 96, fontWeight: 'bold',
          fill: '#92400e', textAlign: 'center', charSpacing: 30
        }),
        rect({ left: 812, top: 460, width: 130, height: 6, fill: '#f59e0b' }),
        text({
          text: [
            '성 명 : ○ ○ ○',
            '소 속 : ○○○ 기관 ○○과',
            '',
            '위 사람은 ○○○○ 업무에 성실히 임하여',
            '기관 발전에 이바지한 공이 크므로',
            '그 노고를 치하하며 이 표창장을 수여합니다.'
          ].join('\n'),
          left: 0, top: 520, width: 1754, fontSize: 34,
          fill: '#3f2d16', lineHeight: 2.0, textAlign: 'center'
        }),
        text({ text: '2026년 ○○월 ○○일', left: 0, top: 950, width: 1754, fontSize: 32, fill: '#3f2d16', textAlign: 'center' }),
        text({
          text: '○○○ 기 관 장',
          left: 0, top: 1040, width: 1754, fontSize: 46, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        icon({ iconName: 'ribbon', left: 1330, top: 1000, size: 130, fill: '#dc2626' })
      ]
    },

    {
      id: 'certificate-frame',
      category: 'print',
      name: '자격 증서',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        rect({ left: 60, top: 60, width: 1120, height: 1634, fill: 'rgba(0,0,0,0)', stroke: '#0f766e', strokeWidth: 5 }),
        rect({ left: 76, top: 76, width: 1088, height: 1602, fill: 'rgba(0,0,0,0)', stroke: '#5eead4', strokeWidth: 2 }),
        icon({ iconName: 'shieldCheck', left: 540, top: 150, size: 160, fill: '#0f766e' }),
        text({
          text: '자 격 증',
          left: 0, top: 360, width: 1240, fontSize: 80, fontWeight: 'bold',
          fill: '#0f766e', textAlign: 'center', charSpacing: 30
        }),
        text({
          text: [
            '성명 : ○ ○ ○',
            '생년월일 : ○○○○. ○○. ○○.',
            '자격명 : ○○○○',
            '취득일 : 2026. ○○. ○○.',
            '',
            '위 사람이 위 자격을 취득하였음을 증명합니다.'
          ].join('\n'),
          left: 140, top: 500, width: 960, fontSize: 32,
          fill: '#1f2937', lineHeight: 2.2
        }),
        text({
          text: '2026년 ○○월 ○○일',
          left: 0, top: 1180, width: 1240, fontSize: 30, fill: '#1f2937', textAlign: 'center'
        }),
        text({
          text: '○○○ 협회장',
          left: 0, top: 1260, width: 1240, fontSize: 46, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 760, top: 1240, width: 110, height: 110, fill: 'rgba(0,0,0,0)', stroke: '#dc2626', strokeWidth: 3, rx: 8, ry: 8 }),
        text({ text: '직인', left: 760, top: 1284, width: 110, fontSize: 24, fill: '#dc2626', textAlign: 'center' })
      ]
    },

    {
      id: 'placard-safe',
      category: 'print',
      name: '안내 현수막',
      note: '가로 대형 (2400 × 800)',
      width: 2400,
      height: 800,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 2400, height: 800, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 2400, height: 800, gradient: grad(90, [
          { offset: 0, color: '#7f1d1d' }, { offset: 1, color: '#dc2626' }
        ]) }),
        rect({ left: 0, top: 0, width: 2400, height: 18, fill: '#ffffff' }),
        rect({ left: 0, top: 782, width: 2400, height: 18, fill: '#ffffff' }),
        icon({ iconName: 'exclamation', left: 150, top: 320, size: 160, fill: '#fde68a' }),
        text({
          text: '안 전 사 고 예 방',
          left: 0, top: 200, width: 2400, fontSize: 150, fontWeight: 'bold',
          fill: '#ffffff', textAlign: 'center', charSpacing: 46
        }),
        text({
          text: '작업 전 안전점검 · 보호구 착용 · 동료 확인',
          left: 0, top: 450, width: 2400, fontSize: 58,
          fill: '#fee2e2', textAlign: 'center', charSpacing: 10
        }),
        text({
          text: '○○○ 기관 안전관리과',
          left: 0, top: 580, width: 2400, fontSize: 46,
          fill: '#fde68a', textAlign: 'center', charSpacing: 8
        })
      ]
    },

    {
      id: 'weekly-schedule',
      category: 'doc',
      name: '주간 일정표',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1754, height: 120, gradient: grad(90, [
          { offset: 0, color: '#0f172a' }, { offset: 1, color: '#334155' }
        ]) }),
        text({
          text: '주간 업무 일정표',
          left: 60, top: 30, width: 900, fontSize: 48, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '2026. ○○. ○○. ~ ○○. ○○.',
          left: 1160, top: 44, width: 540, fontSize: 30, fill: '#cbd5e1', textAlign: 'right'
        }),
        {
          type: 'table',
          left: 60,
          top: 180,
          rows: 6,
          cols: 6,
          cellW: 272,
          cellH: 148,
          fontSize: 24,
          headerRow: true,
          headerCol: true,
          headerFill: '#e2e8f0',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '시간' }, { text: '월' }, { text: '화' }, { text: '수' }, { text: '목' }, { text: '금' }],
            [{ text: '오전' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '오후' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '비고' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }]
          ]
        },
        text({
          text: '※ 일정은 사정에 따라 변경될 수 있습니다.',
          left: 60, top: 1130, width: 1634, fontSize: 24, fill: '#64748b'
        })
      ]
    },

    {
      id: 'budget-table',
      category: 'doc',
      name: '예산 집행 내역',
      note: 'A4 세로 · 150dpi (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        text({
          text: '○○ 사업 예산 집행 내역',
          left: 0, top: 80, width: 1240, fontSize: 46, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        }),
        rect({ left: 550, top: 158, width: 140, height: 5, fill: '#2563eb' }),
        {
          type: 'table',
          left: 70,
          top: 220,
          rows: 8,
          cols: 5,
          cellW: 220,
          cellH: 118,
          fontSize: 24,
          headerRow: true,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '연번' }, { text: '항목' }, { text: '예산액' }, { text: '집행액' }, { text: '잔액' }],
            [{ text: '1' }, { text: '인건비' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '2' }, { text: '운영비' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '3' }, { text: '여비' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '4' }, { text: '업무추진비' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '5' }, { text: '시설비' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '6' }, { text: '기타' }, { text: '' }, { text: '' }, { text: '' }],
            [{ text: '합계' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }]
          ]
        },
        text({
          text: '※ 금액 단위는 원(₩)입니다.',
          left: 70, top: 1230, width: 1100, fontSize: 26, fill: '#64748b'
        }),
        text({
          text: '작성자 : ○○과 ○○○        확인 : ○○과장 ○○○',
          left: 70, top: 1500, width: 1100, fontSize: 28, fill: '#334155'
        })
      ]
    },

    {
      id: 'sns-quote',
      category: 'promo',
      name: '인용 카드',
      note: '정사각 · 1080 × 1080',
      width: 1080,
      height: 1080,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1080, height: 1080, gradient: grad(135, [
          { offset: 0, color: '#f8fafc' }, { offset: 1, color: '#e2e8f0' }
        ]) }),
        icon({ iconName: 'quoteOpen', left: 120, top: 140, size: 150, fill: '#94a3b8' }),
        text({
          text: '함께하면\n더 멀리 갑니다',
          left: 140, top: 340, width: 800, fontSize: 82, fontWeight: 'bold',
          fill: '#0f172a', lineHeight: 1.4
        }),
        rect({ left: 140, top: 700, width: 120, height: 6, fill: '#2563eb' }),
        text({
          text: '○○○ 기관  ·  ○○과',
          left: 140, top: 760, width: 800, fontSize: 32, fill: '#64748b'
        }),
        icon({ iconName: 'sparkle', left: 830, top: 850, size: 120, fill: '#cbd5e1' })
      ]
    },

    {
      id: 'cert-course',
      category: 'print',
      name: '이수증',
      note: 'A4 가로 · 150dpi (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1754, height: 1240, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1754, height: 14, gradient: grad(0, [
          { offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#22d3ee' }
        ]) }),
        gradientRect({ left: 0, top: 1226, width: 1754, height: 14, gradient: grad(0, [
          { offset: 0, color: '#22d3ee' }, { offset: 1, color: '#1d4ed8' }
        ]) }),
        icon({ iconName: 'badgeShield', left: 800, top: 120, size: 150, fill: '#1d4ed8' }),
        text({
          text: '이 수 증',
          left: 0, top: 310, width: 1754, fontSize: 86, fontWeight: 'bold',
          fill: '#1d4ed8', textAlign: 'center', charSpacing: 30
        }),
        rect({ left: 827, top: 430, width: 100, height: 5, fill: '#f59e0b' }),
        text({
          text: [
            '성 명 : ○ ○ ○',
            '과 정 : ○○○○ 교육과정',
            '기 간 : 2026. ○○. ○○. ~ ○○. ○○. (○○시간)',
            '',
            '위 사람은 위 교육과정을 성실히 이수하였기에',
            '이 증서를 수여합니다.'
          ].join('\n'),
          left: 0, top: 500, width: 1754, fontSize: 32,
          fill: '#1f2937', lineHeight: 2.0, textAlign: 'center'
        }),
        text({ text: '2026년 ○○월 ○○일', left: 0, top: 960, width: 1754, fontSize: 30, fill: '#1f2937', textAlign: 'center' }),
        text({
          text: '○○○ 교육원장',
          left: 0, top: 1040, width: 1754, fontSize: 46, fontWeight: 'bold',
          fill: '#0f172a', textAlign: 'center'
        })
      ]
    },

  ];

  /* ================================================================
     PPT 덱 — 여러 장을 한 템플릿으로 묶는다.
     슬라이드는 테마(색)를 받아 만드는 함수라, 테마만 바꾸면 같은 구성을
     다른 색으로 찍어낼 수 있다.
     ================================================================ */

  var PPT_THEMES = {
    blue: {
      label: '블루',
      accent: '#2563eb', accentSoft: '#dbeafe', accentLine: '#bfdbfe',
      deep: [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1d4ed8' }],
      soft: [{ offset: 0, color: '#eef2ff' }, { offset: 1, color: '#e0f2fe' }],
      ink: '#0f172a', sub: '#475569', faint: '#94a3b8',
      onDark: '#ffffff', onDarkSub: '#bfdbfe', darkBg: '#0f172a',
      cards: [
        { bg: '#eef2ff', icon: '#4f46e5' },
        { bg: '#ecfdf5', icon: '#0d9488' },
        { bg: '#fff7ed', icon: '#ea580c' }
      ],
      chart: ['#2563eb', '#0d9488', '#f59e0b']
    },
    slate: {
      label: '슬레이트',
      accent: '#0f766e', accentSoft: '#ccfbf1', accentLine: '#5eead4',
      deep: [{ offset: 0, color: '#111827' }, { offset: 1, color: '#0f766e' }],
      soft: [{ offset: 0, color: '#f1f5f9' }, { offset: 1, color: '#e2e8f0' }],
      ink: '#0f172a', sub: '#475569', faint: '#94a3b8',
      onDark: '#ffffff', onDarkSub: '#99f6e4', darkBg: '#111827',
      cards: [
        { bg: '#f1f5f9', icon: '#334155' },
        { bg: '#ccfbf1', icon: '#0f766e' },
        { bg: '#fef3c7', icon: '#b45309' }
      ],
      chart: ['#0f766e', '#334155', '#f59e0b']
    },
    green: {
      label: '그린',
      accent: '#15803d', accentSoft: '#dcfce7', accentLine: '#86efac',
      deep: [{ offset: 0, color: '#14532d' }, { offset: 1, color: '#16a34a' }],
      soft: [{ offset: 0, color: '#f0fdf4' }, { offset: 1, color: '#dcfce7' }],
      ink: '#0f172a', sub: '#475569', faint: '#94a3b8',
      onDark: '#ffffff', onDarkSub: '#bbf7d0', darkBg: '#14532d',
      cards: [
        { bg: '#f0fdf4', icon: '#15803d' },
        { bg: '#eff6ff', icon: '#2563eb' },
        { bg: '#fef9c3', icon: '#a16207' }
      ],
      chart: ['#15803d', '#2563eb', '#f59e0b']
    },
    violet: {
      label: '바이올렛',
      accent: '#7c3aed', accentSoft: '#ede9fe', accentLine: '#c4b5fd',
      deep: [{ offset: 0, color: '#2e1065' }, { offset: 1, color: '#7c3aed' }],
      soft: [{ offset: 0, color: '#f5f3ff' }, { offset: 1, color: '#ede9fe' }],
      ink: '#0f172a', sub: '#475569', faint: '#94a3b8',
      onDark: '#ffffff', onDarkSub: '#ddd6fe', darkBg: '#2e1065',
      cards: [
        { bg: '#f5f3ff', icon: '#7c3aed' },
        { bg: '#fdf2f8', icon: '#db2777' },
        { bg: '#ecfeff', icon: '#0891b2' }
      ],
      chart: ['#7c3aed', '#db2777', '#0891b2']
    }
  };

  var SLIDE_W = 1920;
  var SLIDE_H = 1080;

  /* ------------------------------------------------------- 슬라이드 조각 */

  function slideHead(T, title) {
    return [
      rect({ left: 0, top: 0, width: SLIDE_W, height: 10, fill: T.accent }),
      text({ text: title, left: 120, top: 92, width: 1400, fontSize: 52, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 120, top: 180, width: 90, height: 8, fill: T.accent })
    ];
  }

  function darkSlide(T, children) {
    return [gradientRect({
      left: 0, top: 0, width: SLIDE_W, height: SLIDE_H, gradient: grad(135, T.deep)
    })].concat(children);
  }

  /* ------------------------------------------------------------ 표지 */

  function sCover(T) {
    return darkSlide(T, [
      icon({ iconName: 'badgeCircle', left: 1560, top: 110, size: 300, fill: 'rgba(255,255,255,0.10)' }),
      icon({ iconName: 'sparkle', left: 1660, top: 780, size: 170, fill: 'rgba(255,255,255,0.09)' }),
      rect({ left: 140, top: 300, width: 96, height: 10, fill: T.accentLine }),
      text({
        text: '2026년도 업무 계획', left: 140, top: 360, width: 1240,
        fontSize: 96, fontWeight: 'bold', fill: T.onDark, lineHeight: 1.25
      }),
      text({
        text: '부서 비전과 중점 추진 과제를 공유드립니다',
        left: 140, top: 600, width: 1240, fontSize: 38, fill: T.onDarkSub
      }),
      rect({ left: 140, top: 780, width: 460, height: 2, fill: 'rgba(255,255,255,0.28)' }),
      text({ text: '○○○ 기관  ·  ○○과', left: 140, top: 824, width: 800, fontSize: 34, fill: T.onDark }),
      text({ text: '2026. ○○. ○○.', left: 140, top: 882, width: 800, fontSize: 30, fill: T.onDarkSub })
    ]);
  }

  function sCoverDark(T) {
    return [
      background({ left: 0, top: 0, width: SLIDE_W, height: SLIDE_H, fill: T.darkBg }),
      gradientRect({
        left: 0, top: 0, width: 660, height: SLIDE_H,
        gradient: grad(160, T.deep)
      }),
      icon({ iconName: 'chartBar', left: 160, top: 300, size: 320, fill: 'rgba(255,255,255,0.16)' }),
      rect({ left: 150, top: 780, width: 360, height: 8, fill: T.accentLine }),
      text({
        text: '발표 자료', left: 150, top: 828, width: 420,
        fontSize: 42, fontWeight: 'bold', fill: T.onDark
      }),
      rect({ left: 780, top: 330, width: 80, height: 8, fill: T.accentLine }),
      text({
        text: '제목을 입력하세요', left: 780, top: 386, width: 1050,
        fontSize: 84, fontWeight: 'bold', fill: T.onDark
      }),
      text({
        text: '부제목 또는 설명을 한 줄로 입력하세요',
        left: 780, top: 540, width: 1050, fontSize: 34, fill: 'rgba(255,255,255,0.62)'
      }),
      rect({ left: 780, top: 680, width: 1000, height: 2, fill: 'rgba(255,255,255,0.16)' }),
      text({
        text: '○○○ 기관  ·  ○○과 ○○○',
        left: 780, top: 720, width: 1050, fontSize: 30, fill: 'rgba(255,255,255,0.78)'
      }),
      text({
        text: '2026. ○○. ○○.', left: 780, top: 772, width: 1050,
        fontSize: 28, fill: 'rgba(255,255,255,0.5)'
      })
    ];
  }

  /* ------------------------------------------------------------ 목차 */

  function sToc(T) {
    var items = ['추진 배경과 목적', '중점 추진 과제', '세부 실행 계획', '소요 예산', '기대 효과'];
    var objs = slideHead(T, '목차');

    objs.push(icon({ iconName: 'docs', left: 1500, top: 380, size: 320, fill: T.accentSoft }));

    items.forEach(function (label, i) {
      var y = 280 + i * 140;
      objs.push(rect({ left: 120, top: y + 88, width: 1680, height: 1, fill: T.accentLine }));
      objs.push(text({
        text: ('0' + (i + 1)).slice(-2), left: 120, top: y + 8, width: 110,
        fontSize: 44, fontWeight: 'bold', fill: T.accent
      }));
      objs.push(text({
        text: label, left: 260, top: y + 14, width: 1000, fontSize: 40, fill: T.ink
      }));
    });

    return objs;
  }

  /* -------------------------------------------------------- 섹션 구분 */

  function sectionSlide(T, num, title, desc) {
    return darkSlide(T, [
      text({
        text: num, left: 140, top: 200, width: 600,
        fontSize: 220, fontWeight: 'bold', fill: 'rgba(255,255,255,0.13)'
      }),
      rect({ left: 156, top: 560, width: 96, height: 10, fill: T.accentLine }),
      text({
        text: title, left: 156, top: 612, width: 1400,
        fontSize: 76, fontWeight: 'bold', fill: T.onDark
      }),
      text({
        text: desc, left: 156, top: 744, width: 1400, fontSize: 34, fill: T.onDarkSub
      })
    ]);
  }

  /* ------------------------------------------------------------ 본문 */

  function sContent(T) {
    return slideHead(T, '본문 제목').concat([
      text({
        text: '핵심 내용을 한 문장으로 요약해 주세요.',
        left: 120, top: 246, width: 1680, fontSize: 34, fill: T.sub
      }),
      rect({ left: 120, top: 330, width: 1680, height: 1, fill: T.accentLine }),
      text({
        text: [
          '· 첫 번째 내용을 입력하세요.',
          '',
          '· 두 번째 내용을 입력하세요.',
          '',
          '· 세 번째 내용을 입력하세요.',
          '',
          '· 네 번째 내용을 입력하세요.'
        ].join('\n'),
        left: 120, top: 400, width: 1240, fontSize: 34, fill: T.ink, lineHeight: 1.25
      }),
      icon({ iconName: 'checkCircle', left: 1540, top: 620, size: 240, fill: T.accentSoft })
    ]);
  }

  function sTwoCol(T) {
    return slideHead(T, '두 가지 관점').concat([
      rect({ left: 120, top: 280, width: 810, height: 620, fill: T.cards[0].bg, rx: 16, ry: 16 }),
      rect({ left: 990, top: 280, width: 810, height: 620, fill: T.cards[1].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'bulb', left: 190, top: 340, size: 110, fill: T.cards[0].icon }),
      icon({ iconName: 'settings', left: 1060, top: 340, size: 110, fill: T.cards[1].icon }),
      text({ text: '현황', left: 190, top: 500, width: 670, fontSize: 46, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '현재 상황이나 문제점을 적어 주세요.',
        left: 190, top: 590, width: 670, fontSize: 30, fill: T.sub, lineHeight: 1.7
      }),
      text({ text: '개선 방향', left: 1060, top: 500, width: 670, fontSize: 46, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '앞으로의 개선 방향을 적어 주세요.',
        left: 1060, top: 590, width: 670, fontSize: 30, fill: T.sub, lineHeight: 1.7
      })
    ]);
  }

  function sThreeCol(T) {
    var objs = slideHead(T, '세 가지 핵심');
    var names = ['핵심 1', '핵심 2', '핵심 3'];
    var icons = ['star', 'checkCircle', 'trophy'];

    for (var i = 0; i < 3; i++) {
      var x = 120 + i * 570;
      objs.push(rect({ left: x, top: 280, width: 520, height: 600, fill: T.cards[i].bg, rx: 16, ry: 16 }));
      objs.push(icon({ iconName: icons[i], left: x + 60, top: 350, size: 100, fill: T.cards[i].icon }));
      objs.push(text({
        text: names[i], left: x + 60, top: 520, width: 400,
        fontSize: 42, fontWeight: 'bold', fill: T.ink
      }));
      objs.push(text({
        text: '내용을 입력하세요', left: x + 60, top: 600, width: 400,
        fontSize: 28, fill: T.sub
      }));
    }

    return objs;
  }

  function imageSlide(T, imageRight) {
    var slotLeft = imageRight ? 1020 : 120;
    var textLeft = imageRight ? 120 : 1020;

    return slideHead(T, '이미지와 설명').concat([
      slot({ left: slotLeft, top: 260, width: 780, height: 700, label: '사진' }),
      text({
        text: '설명 제목', left: textLeft, top: 320, width: 780,
        fontSize: 44, fontWeight: 'bold', fill: T.ink
      }),
      text({
        text: '사진에 대한 설명을 적어 주세요.\n\n· 첫 번째 설명\n\n· 두 번째 설명\n\n· 세 번째 설명',
        left: textLeft, top: 410, width: 780, fontSize: 30, fill: T.sub, lineHeight: 1.4
      })
    ]);
  }

  function sChart(T) {
    return slideHead(T, '데이터로 보는 현황').concat([
      slot({ left: 120, top: 260, width: 1040, height: 640, label: '차트 이미지' }),
      rect({ left: 1220, top: 260, width: 580, height: 640, fill: T.cards[0].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'chartBar', left: 1280, top: 310, size: 90, fill: T.accent }),
      rect({ left: 1290, top: 448, width: 26, height: 26, fill: T.chart[0] }),
      text({ text: '항목 A  ·  00%', left: 1334, top: 444, width: 430, fontSize: 32, fill: T.ink }),
      rect({ left: 1290, top: 528, width: 26, height: 26, fill: T.chart[1] }),
      text({ text: '항목 B  ·  00%', left: 1334, top: 524, width: 430, fontSize: 32, fill: T.ink }),
      rect({ left: 1290, top: 608, width: 26, height: 26, fill: T.chart[2] }),
      text({ text: '항목 C  ·  00%', left: 1334, top: 604, width: 430, fontSize: 32, fill: T.ink }),
      text({
        text: '○ 차트에서 읽어낼 핵심을 한 줄로 정리합니다.',
        left: 1280, top: 720, width: 470, fontSize: 28, fill: T.sub, lineHeight: 1.7
      })
    ]);
  }

  function sTable(T) {
    return slideHead(T, '추진 내용').concat([
      {
        type: 'table', left: 120, top: 290, rows: 5, cols: 4,
        cellW: 420, cellH: 128, fontSize: 32,
        headerRow: true, headerFill: T.cards[0].bg, borderColor: '#93a7c4',
        cells: [
          [{ text: '구분' }, { text: '추진 내용' }, { text: '기간' }, { text: '담당' }],
          [{ text: '1' }, { text: '계획 수립' }, { text: '1월' }, { text: '○○과' }],
          [{ text: '2' }, { text: '대상자 선정' }, { text: '2월' }, { text: '○○과' }],
          [{ text: '3' }, { text: '사업 추진' }, { text: '3~10월' }, { text: '○○과' }],
          [{ text: '4' }, { text: '결과 보고' }, { text: '12월' }, { text: '○○과' }]
        ]
      }
    ]);
  }

  function sTimeline(T) {
    var objs = slideHead(T, '추진 일정').concat([
      rect({ left: 200, top: 470, width: 1420, height: 4, fill: T.accentLine })
    ]);
    var steps = ['계획 수립', '대상 선정', '사업 추진', '결과 보고'];

    steps.forEach(function (label, i) {
      var cx = 290 + i * 460;
      var done = i < 3;

      objs.push(rect({
        left: cx - 44, top: 428, width: 88, height: 88,
        fill: done ? T.accent : '#cbd5e1', rx: 44, ry: 44
      }));
      objs.push(text({
        text: String(i + 1), left: cx - 44, top: 450, width: 88,
        fontSize: 38, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
      }));
      objs.push(text({
        text: label, left: cx - 170, top: 570, width: 340,
        fontSize: 34, fontWeight: 'bold', fill: T.ink, textAlign: 'center'
      }));
      objs.push(text({
        text: '○○월', left: cx - 170, top: 632, width: 340,
        fontSize: 28, fill: T.faint, textAlign: 'center'
      }));
    });

    return objs;
  }

  function sCompare(T) {
    return slideHead(T, '두 안 비교').concat([
      rect({ left: 120, top: 290, width: 810, height: 92, fill: T.accent, rx: 12, ry: 12 }),
      text({
        text: 'A 안', left: 120, top: 312, width: 810,
        fontSize: 40, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
      }),
      rect({ left: 120, top: 382, width: 810, height: 520, fill: T.cards[0].bg, rx: 12, ry: 12 }),
      text({
        text: '· 장점\n\n· 단점\n\n· 예상 비용',
        left: 180, top: 440, width: 690, fontSize: 30, fill: T.sub, lineHeight: 1.5
      }),
      rect({ left: 990, top: 290, width: 810, height: 92, fill: T.cards[1].icon, rx: 12, ry: 12 }),
      text({
        text: 'B 안', left: 990, top: 312, width: 810,
        fontSize: 40, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
      }),
      rect({ left: 990, top: 382, width: 810, height: 520, fill: T.cards[1].bg, rx: 12, ry: 12 }),
      text({
        text: '· 장점\n\n· 단점\n\n· 예상 비용',
        left: 1050, top: 440, width: 690, fontSize: 30, fill: T.sub, lineHeight: 1.5
      })
    ]);
  }

  function sStats(T) {
    var objs = slideHead(T, '성과 지표');
    var labels = ['참여 인원', '만족도', '처리 건수', '절감 시간'];
    var values = ['000명', '00점', '000건', '00%'];

    for (var i = 0; i < 4; i++) {
      var x = 120 + i * 430;
      var card = T.cards[i % 3];

      objs.push(rect({ left: x, top: 330, width: 380, height: 420, fill: card.bg, rx: 16, ry: 16 }));
      objs.push(text({
        text: values[i], left: x + 40, top: 420, width: 300,
        fontSize: 72, fontWeight: 'bold', fill: card.icon
      }));
      objs.push(text({
        text: labels[i], left: x + 40, top: 570, width: 300, fontSize: 30, fill: T.sub
      }));
    }

    return objs;
  }

  function sQuote(T) {
    return [
      gradientRect({ left: 0, top: 0, width: SLIDE_W, height: SLIDE_H, gradient: grad(135, T.soft) }),
      icon({ iconName: 'quoteOpen', left: 140, top: 190, size: 200, fill: T.accentLine }),
      text({
        text: '함께하면 더 멀리 갑니다',
        left: 140, top: 440, width: 1500, fontSize: 84, fontWeight: 'bold', fill: T.ink, lineHeight: 1.35
      }),
      rect({ left: 140, top: 700, width: 120, height: 8, fill: T.accent }),
      text({ text: '○○○ 기관  ·  ○○과', left: 140, top: 764, width: 900, fontSize: 34, fill: T.sub }),
      icon({ iconName: 'sparkle', left: 1600, top: 800, size: 180, fill: T.accentLine })
    ];
  }

  function sClosing(T) {
    return darkSlide(T, [
      icon({ iconName: 'trophy', left: 810, top: 190, size: 300, fill: 'rgba(255,255,255,0.18)' }),
      text({
        text: '감사합니다', left: 0, top: 560, width: SLIDE_W,
        fontSize: 110, fontWeight: 'bold', fill: T.onDark, textAlign: 'center', charSpacing: 20
      }),
      rect({ left: 860, top: 730, width: 200, height: 8, fill: T.accentLine }),
      text({
        text: '○○○ 기관  ·  ○○과  ·  문의 000-0000',
        left: 0, top: 800, width: SLIDE_W, fontSize: 36, fill: T.onDarkSub, textAlign: 'center'
      })
    ]);
  }

  /* --------------------------------------------------- 슬라이드 카탈로그 */

  var PPT_SLIDES = {
    cover: { name: '표지', dark: true, build: sCover },
    coverDark: { name: '표지 (다크)', dark: true, build: sCoverDark },
    toc: { name: '목차', build: sToc },
    section: {
      name: '섹션 구분', dark: true,
      build: function (T) { return sectionSlide(T, '01', '추진 배경과 목적', '이 장에서 다루는 내용을 한 줄로 적어 주세요'); }
    },
    section2: {
      name: '섹션 구분 2', dark: true,
      build: function (T) { return sectionSlide(T, '02', '세부 추진 계획', '이 장에서 다루는 내용을 한 줄로 적어 주세요'); }
    },
    content: { name: '본문', build: sContent },
    twoCol: { name: '2단 구성', build: sTwoCol },
    threeCol: { name: '3단 카드', build: sThreeCol },
    imageRight: { name: '이미지 + 설명 (우)', build: function (T) { return imageSlide(T, true); } },
    imageLeft: { name: '이미지 + 설명 (좌)', build: function (T) { return imageSlide(T, false); } },
    chart: { name: '차트', build: sChart },
    table: { name: '표', build: sTable },
    timeline: { name: '추진 일정', build: sTimeline },
    compare: { name: '두 안 비교', build: sCompare },
    stats: { name: '숫자 강조', build: sStats },
    quote: { name: '인용', build: sQuote },
    closing: { name: '마무리', dark: true, build: sClosing }
  };

  /** 테마 + 슬라이드 목록 -> 페이지 배열 */
  function buildDeck(themeKey, keys) {
    var T = PPT_THEMES[themeKey];

    return keys.map(function (key, i) {
      var slide = PPT_SLIDES[key];
      return {
        name: (i + 1) + '. ' + slide.name,
        background: slide.dark ? T.darkBg : '#ffffff',
        objects: slide.build(T)
      };
    });
  }

  /** 완성된 발표 자료 세트 — 각각이 하나의 템플릿(여러 페이지)이다 */
  var PPT_DECKS = [
    {
      id: 'ppt-deck-blue',
      name: 'PPT 발표자료 (블루 · 16장)',
      note: '16장 한 세트 · 16:9 (1920 × 1080)',
      theme: 'blue',
      slides: ['cover', 'toc', 'section', 'content', 'twoCol', 'threeCol', 'imageRight',
        'chart', 'section2', 'table', 'timeline', 'compare', 'stats', 'quote',
        'imageLeft', 'closing']
    },
    {
      id: 'ppt-deck-slate',
      name: 'PPT 발표자료 (슬레이트 · 16장)',
      note: '16장 한 세트 · 16:9 (1920 × 1080)',
      theme: 'slate',
      slides: ['coverDark', 'toc', 'section', 'content', 'table', 'chart', 'twoCol',
        'threeCol', 'section2', 'timeline', 'compare', 'stats', 'imageRight',
        'imageLeft', 'quote', 'closing']
    },
    {
      id: 'ppt-deck-report',
      name: 'PPT 보고용 (그린 · 10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080)',
      theme: 'green',
      slides: ['cover', 'toc', 'section', 'content', 'table', 'chart', 'timeline',
        'stats', 'quote', 'closing']
    },
    {
      id: 'ppt-deck-mini',
      name: 'PPT 짧은 발표 (바이올렛 · 6장)',
      note: '6장 한 세트 · 16:9 (1920 × 1080)',
      theme: 'violet',
      slides: ['cover', 'toc', 'content', 'threeCol', 'stats', 'closing']
    }
  ];

  PPT_DECKS.forEach(function (deck) {
    TEMPLATES.push({
      id: deck.id,
      category: 'ppt',
      name: deck.name,
      note: deck.note,
      width: SLIDE_W,
      height: SLIDE_H,
      background: '#ffffff',
      pages: buildDeck(deck.theme, deck.slides)
    });
  });

  /* ------------------------------------------------------------ 공개 API */

  var byId = {};
  TEMPLATES.forEach(function (tpl) { byId[tpl.id] = tpl; });

  IE.templates = {
    FONT: FONT,
    themes: PPT_THEMES,
    slideNames: Object.keys(PPT_SLIDES),
    categories: CATEGORIES,
    all: TEMPLATES,
    byId: function (id) { return byId[id] || null; },
    byCategory: function (categoryId) {
      return TEMPLATES.filter(function (tpl) { return tpl.category === categoryId; });
    },
    /** 사용자 템플릿까지 포함한 카테고리별 조회 */
    byCategoryAll: function (categoryId) {
      return IE.store.all().filter(function (tpl) { return tpl.category === categoryId; });
    },
    /** 여러 장짜리 덱인지 */
    isDeck: function (tpl) {
      return !!(tpl && tpl.pages && tpl.pages.length);
    },
    pageCount: function (tpl) {
      return (tpl && tpl.pages && tpl.pages.length) ? tpl.pages.length : 1;
    }
  };
})(window.IE);
