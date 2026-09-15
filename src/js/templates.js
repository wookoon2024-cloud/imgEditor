window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var FONT = 'Malgun Gothic';

  var CATEGORIES = [
    { id: 'promo', name: '홍보물 · 배너 · 공고문' },
    { id: 'idphoto', name: '증명사진 · 사진 규격' },
    { id: 'doc', name: '공문서 · 행정 서식 · 보고서' },
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

  function figure(def) {
    def.type = 'figure';
    return def;
  }

  function circle(def) {
    def.type = 'circle';
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
  var ROSE = grad(120, [{ offset: 0, color: '#f43f5e' }, { offset: 1, color: '#fb923c' }]);
  var PURPLE = grad(120, [{ offset: 0, color: '#7c3aed' }, { offset: 1, color: '#ec4899' }]);
  var TEAL = grad(120, [{ offset: 0, color: '#0f766e' }, { offset: 1, color: '#06b6d4' }]);
  var GREEN = grad(120, [{ offset: 0, color: '#15803d' }, { offset: 1, color: '#22c55e' }]);

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

    /* ============================================================ 신규 실무 고품질 템플릿 */

    // 1. 공문서 / 기안문 서식 (A4 세로)
    {
      id: 'doc-official',
      category: 'doc',
      name: '공문서 · 기안문',
      note: 'A4 세로 · 결재선/서식 포함 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '한 국 혁 신 진 흥 원',
          left: 90, top: 80, width: 680, fontSize: 38, fontWeight: 'bold', fill: '#1e3a8a', charSpacing: 10
        }),
        text({
          text: '우 03171 서울특별시 종로구 세종대로 209  /  전화 02-1234-5678  /  전송 02-1234-5679',
          left: 90, top: 140, width: 680, fontSize: 18, fill: '#64748b'
        }),
        {
          type: 'table',
          left: 770, top: 75,
          rows: 2, cols: 4,
          cellW: 95, cellH: 34,
          fontSize: 18,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '부서장' }, { text: '기관장' }],
            [{ text: '김혁신\n(서명)' }, { text: '이팀장\n(서명)' }, { text: '박부서\n(서명)' }, { text: '전결' }]
          ]
        },
        rect({ left: 90, top: 200, width: 1060, height: 2, fill: '#0f172a' }),
        text({
          text: '문서번호 : 혁신기획-2026-0914\n시행일자 : 2026. 09. 14.\n수    신 : 수신처 참조 (내부결재)\n참    조 : 경영기획팀장, 예산회계팀장',
          left: 90, top: 220, width: 1060, fontSize: 24, fill: '#334155', lineHeight: 1.6
        }),
        rect({ left: 90, top: 340, width: 1060, height: 1, fill: '#cbd5e1' }),
        text({
          text: '제    목 : 2026년도 하반기 디지털 행정 혁신 추진 계획(안) 보고',
          left: 90, top: 360, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#0f172a'
        }),
        rect({ left: 90, top: 410, width: 1060, height: 1.5, fill: '#0f172a' }),
        text({
          text: '1. 관련 근거\n' +
            '  가. 공공데이터 혁신 및 정보화 촉진에 관한 법률 제14조(디지털 행정 효율화)\n' +
            '  나. 2026년도 기관 중점 추진 전략 과제(기획조정실-1048호, 2026. 01. 15.)\n\n' +
            '2. 추진 목적 및 배경\n' +
            '  가. 인터넷 차단 폐쇄망(행정망) 환경 내 신속하고 보안성 높은 문서 처리 인프라 구축\n' +
            '  나. 불필요한 종이 출력 및 외부 프로그램 설치를 지양하고 단일 HTML 기반 편집 체계 정착\n\n' +
            '3. 주요 추진 내용\n' +
            '  가. 오프라인 단일 파일(Single File) 이미지·서식 편집기 전 부서 배포\n' +
            '  나. 공공 행정 실무 맞춤형 표준 서식(공문서, 보고서, 안내문 등 50여 종) 보급\n' +
            '  다. 파워포인트(PPTX) 및 공공 한글(HWPX) 표준 파일 원클릭 변환 지원\n\n' +
            '4. 소요 예산 및 추진 일정\n' +
            '  가. 총 소요 예산 : 일금 45,000,000원 (금 사천오백만원, 기확정 예산 범위 내 집행)\n' +
            '  나. 추진 일정 : 2026. 10. 01. ~ 2026. 12. 31. (3개월간)\n\n' +
            '5. 행정 협조 사항\n' +
            '  가. 각 부서별 정보화 담당자 1인을 9. 25.(금)까지 지정 및 통보 요망.  끝.',
          left: 90, top: 440, width: 1060, fontSize: 23, fill: '#1e293b', lineHeight: 1.75
        }),
        rect({ left: 90, top: 1360, width: 1060, height: 1, fill: '#e2e8f0' }),
        text({
          text: '붙임  1. 2026년 하반기 디지털 행정 혁신 세부 추진 계획서 1부.\n' +
            '      2. 부서별 소프트웨어 요구 규격서 1부.  끝.',
          left: 90, top: 1380, width: 1060, fontSize: 21, fill: '#475569', lineHeight: 1.6
        }),
        text({
          text: '한 국 혁 신 진 흥 원 장',
          left: 0, top: 1540, width: 1240, fontSize: 44, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 18
        }),
        icon({ iconName: 'award', left: 880, top: 1530, size: 75, fill: '#dc2626' })
      ]
    },

    // 1-1. 공문서 · 대외 시행문 (중앙부처/지자체/공공기관 대외 발송 규격)
    {
      id: 'doc-official-dispatch',
      category: 'doc',
      name: '공문서 · 대외 시행문',
      note: 'A4 세로 · 중앙부처/공공기관 대외 발송 표준 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '대 한 민 국   디 지 털 혁 신 청',
          left: 0, top: 70, width: 1240, fontSize: 38, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 12
        }),
        text({
          text: 'KOREA DIGITAL INNOVATION AGENCY',
          left: 0, top: 125, width: 1240, fontSize: 16, fill: '#64748b', textAlign: 'center', charSpacing: 4
        }),
        rect({ left: 90, top: 155, width: 1060, height: 3, fill: '#0f172a' }),
        rect({ left: 90, top: 160, width: 1060, height: 1, fill: '#0f172a' }),
        {
          type: 'table',
          left: 770, top: 180,
          rows: 2, cols: 4,
          cellW: 95, cellH: 34,
          fontSize: 17,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '기안자' }, { text: '검토자' }, { text: '협조자' }, { text: '결재자' }],
            [{ text: '주무관\n홍길동' }, { text: '팀장\n김기획' }, { text: '과장\n박혁신' }, { text: '국장\n전결' }]
          ]
        },
        text({
          text: '등록번호 : 혁신총괄-2026-1048\n시행일자 : 2026. 09. 14.\n수    신 : 전국 17개 시·도지사 및 공공기관장\n(경  유) : 디지털정보화담당관\n공개구분 : 공개',
          left: 90, top: 180, width: 660, fontSize: 22, fill: '#1e293b', lineHeight: 1.6
        }),
        rect({ left: 90, top: 320, width: 1060, height: 1.5, fill: '#cbd5e1' }),
        text({
          text: '제    목 : 2026년도 하반기 공공부문 행정 업무 혁신 지침 준수 및 이행 협조 요청',
          left: 90, top: 340, width: 1060, fontSize: 27, fontWeight: 'bold', fill: '#0f172a'
        }),
        rect({ left: 90, top: 395, width: 1060, height: 2, fill: '#0f172a' }),
        text({
          text: '1. 귀 기관의 무궁한 발전을 기원합니다.\n\n' +
            '2. 관련 근거\n' +
            '  가. 전자정부법 제35조(행정업무의 전자적 처리 촉진 및 효율화)\n' +
            '  나. 2026년도 디지털플랫폼정부 핵심 추진 과제(국무회의 의결, 2026. 01. 20.)\n\n' +
            '3. 위 호와 관련하여, 행정망 및 폐쇄망 환경의 업무 효율성 제고와 종이 없는 디지털 행정 구현을 위한 「하반기 행정 업무 혁신 지침」을 다음과 같이 송부하오니 각 기관에서는 적극 협조하여 주시기 바랍니다.\n\n' +
            '4. 주요 협조 요청 사항\n' +
            '  가. 오프라인 단일 HTML 문서 도구 도입 및 전부서 보급 (별도 설치 불필요)\n' +
            '  나. 표준 공문서 및 발표자료(PPTX/HWPX) 파일 서식 준수\n' +
            '  다. 기관별 이행 실적 제출 : 2026. 10. 31.(금) 18:00까지 공문 회신 요망\n\n' +
            '5. 행정 안내\n' +
            '  본 지침과 관련된 세부 서식 및 매뉴얼은 기관 행정포털 자료실에서 다운로드 가능합니다.  끝.',
          left: 90, top: 425, width: 1060, fontSize: 23, fill: '#1e293b', lineHeight: 1.75
        }),
        rect({ left: 90, top: 1320, width: 1060, height: 1, fill: '#cbd5e1' }),
        text({
          text: '붙임  1. 2026년 하반기 공공 행정 업무 혁신 세부 지침서 1부.\n      2. 부서별 이행 실적 점검표(양식) 1부.  끝.',
          left: 90, top: 1340, width: 1060, fontSize: 21, fill: '#475569', lineHeight: 1.6
        }),
        text({
          text: '디  지  털  혁  신  청  장',
          left: 0, top: 1475, width: 1240, fontSize: 44, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 18
        }),
        rect({ left: 880, top: 1465, width: 84, height: 84, fill: 'rgba(220,38,38,0.06)', stroke: '#dc2626', strokeWidth: 3, rx: 8 }),
        text({ text: '직인\n생략', left: 880, top: 1488, width: 84, fontSize: 20, fontWeight: 'bold', fill: '#dc2626', textAlign: 'center', lineHeight: 1.2 }),
        rect({ left: 90, top: 1590, width: 1060, height: 1, fill: '#cbd5e1' }),
        text({
          text: '기안자 : 행정주무관 홍길동    검토자 : 기획팀장 김기획    결재자 : 혁신청장 이공공\n협조자 : 정보화담당관 박보안\n우 03171 서울특별시 종로구 세종대로 209 / www.kdia.go.kr / 전화 02-2100-0000 / 전송 02-2100-0001\n전자우편 admin@kdia.go.kr / 대국민 공개',
          left: 90, top: 1605, width: 1060, fontSize: 17, fill: '#64748b', lineHeight: 1.5
        })
      ]
    },

    // 1-2. 부서 간 업무 협조전 (정규 협조 요청서 & 회신란)
    {
      id: 'doc-coop-request',
      category: 'doc',
      name: '업무 협조전 · 공람문',
      note: 'A4 세로 · 부서 간 협조 요청 & 회신란 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        rect({ left: 90, top: 70, width: 260, height: 60, fill: '#1e3a8a', rx: 6 }),
        text({
          text: '업 무 협 조 전',
          left: 90, top: 82, width: 260, fontSize: 30, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 4
        }),
        {
          type: 'table',
          left: 770, top: 70,
          rows: 2, cols: 4,
          cellW: 95, cellH: 34,
          fontSize: 17,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '기안' }, { text: '검토' }, { text: '합의' }, { text: '결재' }],
            [{ text: '김담당\n(서명)' }, { text: '이팀장\n(서명)' }, { text: '박협조\n(서명)' }, { text: '최실장\n(서명)' }]
          ]
        },
        rect({ left: 90, top: 155, width: 1060, height: 160, fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1.5, rx: 8 }),
        text({
          text: '• 문서번호 : 협조-2026-0914            • 기안일자 : 2026. 09. 14.\n• 발신부서 : 디지털혁신추진단 (담당: 이주무관 ☎ 02-1234-5678)\n• 수신부서 : 경영지원실, 재무회계팀, 정보보안팀, 사업운영본부\n• 처리기한 : 2026. 09. 25.(금) 18:00까지 (기한 엄수)',
          left: 120, top: 180, width: 1000, fontSize: 22, fill: '#1e293b', lineHeight: 1.65
        }),
        text({
          text: '제    목 : 2026년 3분기 IT 자산 정기 실사 및 소프트웨어 라이선스 현황 점검 협조 요청',
          left: 90, top: 345, width: 1060, fontSize: 27, fontWeight: 'bold', fill: '#0f172a'
        }),
        rect({ left: 90, top: 395, width: 1060, height: 2, fill: '#1e3a8a' }),
        text({
          text: '1. 관련 근거 : 정보보안기본지침 제28조(전산자산의 관리 및 실사)\n\n' +
            '2. 위 관련 근거에 따라, 원내 IT 자산의 효율적 운용과 라이선스 컴플라이언스 준수를 위해 2026년 3분기 정기 실사를 실시하오니 각 부서에서는 적극 협조하여 주시기 바랍니다.',
          left: 90, top: 415, width: 1060, fontSize: 23, fill: '#334155', lineHeight: 1.7
        }),
        text({ text: '3. 세부 협조 사항 안내', left: 90, top: 525, width: 500, fontSize: 25, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 565,
          rows: 5, cols: 5,
          cellW: 212, cellH: 88,
          fontSize: 21,
          headerRow: true,
          headerCol: false,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '구분' }, { text: '협조 요청 사항' }, { text: '제출 서류' }, { text: '제출 기한' }, { text: '소관 부서' }],
            [{ text: 'PC 실사' }, { text: '부서별 업무용 PC 전수조사' }, { text: '자산 점검표 1부' }, { text: '9. 20.(수)' }, { text: '전 부서' }],
            [{ text: 'SW 점검' }, { text: '비인가 소프트웨어 삭제 확인' }, { text: 'SW 점검 결과서' }, { text: '9. 22.(금)' }, { text: '전 부서' }],
            [{ text: '보안 패치' }, { text: '망분리 PC 최신 보안 업데이트' }, { text: '업데이트 이력부' }, { text: '9. 25.(월)' }, { text: '정보보안팀' }],
            [{ text: '불용 자산' }, { text: '노후 전산기기 반납 및 폐기' }, { text: '불용 신청서' }, { text: '9. 25.(월)' }, { text: '경영지원실' }]
          ]
        },
        rect({ left: 90, top: 1045, width: 1060, height: 140, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1.5, rx: 8 }),
        text({
          text: '※ 유의사항\n' +
            '• 기한 내 미제출 시 차기 연도 IT 장비 배정 및 예산 편성 시 불이익이 발생할 수 있습니다.\n' +
            '• 조사 양식 및 점검 도구는 인트라넷 [업무자료실 #1084]에서 다운로드 가능합니다.',
          left: 120, top: 1065, width: 1000, fontSize: 21, fill: '#1d4ed8', lineHeight: 1.65
        }),
        rect({ left: 90, top: 1225, width: 1060, height: 260, fill: '#f8fafc', stroke: '#94a3b8', strokeWidth: 1.5, rx: 8 }),
        text({ text: '[ 수 신 부 서   회 신 란 ]', left: 120, top: 1250, width: 500, fontSize: 23, fontWeight: 'bold', fill: '#0f172a' }),
        text({
          text: '• 협조 여부 :  [ ☑ ] 협조 가능     [   ] 조건부 협조     [   ] 협조 불가\n' +
            '• 검토 의견 : 요청하신 일정에 맞춰 부서 PC 45대 전수 실사 후 기한 내 결과 보고서를 회신하겠습니다.\n' +
            '• 부서장 확인 : 경영지원실장  김 총 괄  (인/서명)     • 회신일자 : 2026. 09. 24.',
          left: 120, top: 1300, width: 1000, fontSize: 22, fill: '#334155', lineHeight: 1.85
        }),
        text({
          text: '발신부서 : 한국혁신진흥원 디지털혁신추진단장 (직인생략)',
          left: 0, top: 1540, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 1-3. 출장 명령서 및 복무 신청서 (여비 산출 내역 포함)
    {
      id: 'doc-trip-order',
      category: 'doc',
      name: '출장 명령서 · 여비 신청',
      note: 'A4 세로 · 출장일정 & 여비 산출 내역 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '출 장 명 령  및  신 청 서',
          left: 90, top: 60, width: 650, fontSize: 38, fontWeight: 'bold', fill: '#0f172a', charSpacing: 6
        }),
        {
          type: 'table',
          left: 770, top: 60,
          rows: 2, cols: 4,
          cellW: 95, cellH: 34,
          fontSize: 17,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '부서장' }, { text: '본부장' }],
            [{ text: '홍길동\n(인)' }, { text: '김팀장\n(서명)' }, { text: '이부서\n(서명)' }, { text: '박본부\n(서명)' }]
          ]
        },
        rect({ left: 90, top: 145, width: 1060, height: 2, fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 165,
          rows: 4, cols: 4,
          cellW: 265, cellH: 64,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '소속 부서' }, { text: '디지털혁신추진단' }, { text: '직위 / 직급' }, { text: '선임연구원 (행정6급)' }],
            [{ text: '출장자 성명' }, { text: '홍 길 동' }, { text: '출장 구분' }, { text: '관외 출장 (국내)' }],
            [{ text: '출장 목적' }, { text: '2026년 공공 데이터 디지털 혁신 우수사례 발표 및 벤치마킹' }, { text: '동행자' }, { text: '김선임 외 1인' }],
            [{ text: '출장지 / 경로' }, { text: '부산 벡스코(BEXCO) 제1전시장 (서울 ↔ 부산)' }, { text: '출장 기간' }, { text: '2026. 10. 15. ~ 10. 16. (1박 2일)' }]
          ]
        },
        rect({ left: 90, top: 440, width: 1060, height: 68, fill: '#f8fafc', stroke: '#e2e8f0', rx: 6 }),
        text({
          text: '• 출장 중 업무 대행자 : 기획조정실 김철수 선임 (010-0000-0000)  |  현장 비상연락망 : 051-000-0000',
          left: 120, top: 462, width: 1000, fontSize: 20, fill: '#334155'
        }),
        text({ text: '1. 여비 산출 내역서 (공무원 여비 규정 준용)', left: 90, top: 540, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 580,
          rows: 6, cols: 7,
          cellW: 151, cellH: 68,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '일자' }, { text: '구간' }, { text: '교통비(원)' }, { text: '일비(원)' }, { text: '식비(원)' }, { text: '숙박비(원)' }, { text: '소계(원)' }],
            [{ text: '10. 15.' }, { text: '서울 → 부산' }, { text: '59,800' }, { text: '25,000' }, { text: '25,000' }, { text: '70,000' }, { text: '179,800' }],
            [{ text: '10. 16.' }, { text: '부산 → 서울' }, { text: '59,800' }, { text: '25,000' }, { text: '25,000' }, { text: '-' }, { text: '109,800' }],
            [{ text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }],
            [{ text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }, { text: '-' }],
            [{ text: '합계' }, { text: '1박 2일' }, { text: '119,600' }, { text: '50,000' }, { text: '50,000' }, { text: '70,000' }, { text: '289,600' }]
          ]
        },
        text({ text: '2. 출장 세부 일정 계획', left: 90, top: 1025, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 1065,
          rows: 4, cols: 4,
          cellW: 265, cellH: 74,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '일시' }, { text: '주요 활동 내용' }, { text: '장소' }, { text: '비고' }],
            [{ text: '10. 15.(목) 14:00~17:00' }, { text: '공공 행정 혁신 우수사례 발표 (세션 2)' }, { text: '벡스코 204호' }, { text: '발표자' }],
            [{ text: '10. 16.(금) 10:00~12:30' }, { text: 'AI 행정 솔루션 부스 참관 및 기술 협의' }, { text: '제1전시장' }, { text: '참관' }],
            [{ text: '10. 16.(금) 14:00~17:30' }, { text: '성과 환류 회의 및 본원 복귀' }, { text: 'KTX 이동' }, { text: '귀임' }]
          ]
        },
        text({
          text: '위와 같이 출장을 명(신청)하오니 허가하여 주시기 바랍니다.\n2026년 10월 08일\n출장 신청자 :   홍   길   동   (인/서명)',
          left: 0, top: 1410, width: 1240, textAlign: 'center', fontSize: 24, lineHeight: 1.75, fill: '#0f172a'
        }),
        rect({ left: 90, top: 1540, width: 1060, height: 1, fill: '#e2e8f0' }),
        text({
          text: '※ 출장 복귀 후 5일 이내에 출장복명서와 교통비·숙박비 영수증을 첨부하여 여비 정산을 완료하시기 바랍니다.',
          left: 90, top: 1560, width: 1060, fontSize: 20, fill: '#64748b'
        })
      ]
    },

    // 1-4. 지출 품의서 및 결의서 (원인행위·물품구매 품의)
    {
      id: 'doc-expense-resolution',
      category: 'doc',
      name: '지출 품의서 · 원인행위',
      note: 'A4 세로 · 예산과목 & 구매집행 품의 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '지 출 결 의  및  품 의 서',
          left: 90, top: 60, width: 650, fontSize: 38, fontWeight: 'bold', fill: '#0f172a', charSpacing: 6
        }),
        {
          type: 'table',
          left: 770, top: 60,
          rows: 2, cols: 4,
          cellW: 95, cellH: 34,
          fontSize: 17,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '재무관' }, { text: '출납원' }],
            [{ text: '김기안\n(인)' }, { text: '이검토\n(서명)' }, { text: '박재무\n(서명)' }, { text: '최출납\n(서명)' }]
          ]
        },
        rect({ left: 90, top: 145, width: 1060, height: 2, fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 165,
          rows: 3, cols: 4,
          cellW: 265, cellH: 60,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '예산 과목' }, { text: '사업운영비 > 일반수용비 > 전산소모품비' }, { text: '발의 일자' }, { text: '2026. 09. 14.' }],
            [{ text: '지출 건명' }, { text: '2026년 하반기 폐쇄망 업무용 소프트웨어 및 소모품 구매' }, { text: '지출 구분' }, { text: '물품 구매 / 세금계산서' }],
            [{ text: '품의 금액' }, { text: '일금 삼천이백오십만원정 (₩32,500,000)' }, { text: '예산 잔액' }, { text: '₩ 84,200,000 (집행 후)' }]
          ]
        },
        text({ text: '1. 구매 품목 내역서 (VAT 포함)', left: 90, top: 375, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 415,
          rows: 7, cols: 6,
          cellW: 176, cellH: 72,
          fontSize: 19,
          headerRow: true,
          headerCol: false,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '품명' }, { text: '규격 / 사양' }, { text: '수량' }, { text: '단가(원)' }, { text: '공급가액(원)' }, { text: '세액(원)' }],
            [{ text: '문서 편집기 SW' }, { text: '단일파일 엔터프라이즈 라이선스' }, { text: '1식' }, { text: '20,000,000' }, { text: '20,000,000' }, { text: '2,000,000' }],
            [{ text: '보안 USB 토큰' }, { text: '암호화 하드웨어 (128GB)' }, { text: '50개' }, { text: '70,000' }, { text: '3,500,000' }, { text: '350,000' }],
            [{ text: '업무용 헤드셋' }, { text: '유선 노이즈캔슬링 USB타입' }, { text: '30개' }, { text: '50,000' }, { text: '1,500,000' }, { text: '150,000' }],
            [{ text: '고속 양면 스캐너' }, { text: 'A4 60ppm 양면 자동급지' }, { text: '2대' }, { text: '2,272,727' }, { text: '4,545,454' }, { text: '454,546' }],
            [{ text: '소모품 일체' }, { text: 'A4 복사용지 외 12종' }, { text: '1식' }, { text: '0' }, { text: '0' }, { text: '0' }],
            [{ text: '합계' }, { text: 'VAT 포함 총 지출 금액' }, { text: '-' }, { text: '-' }, { text: '29,545,454' }, { text: '2,954,546' }]
          ]
        },
        text({ text: '2. 납품 및 대금 지급 조건', left: 90, top: 955, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 995, width: 1060, height: 155, fill: '#f8fafc', stroke: '#e2e8f0', rx: 6 }),
        text({
          text: '• 납품 기한 : 계약 체결일로부터 14일 이내 (2026. 09. 28.까지 납품 완료)\n' +
            '• 납품 장소 : 본관 3층 전산관리실 (검수자 : 정보화담당 이기술 주무관 입회 검수)\n' +
            '• 대금 지급 : 물품 검수 완료 후 전자세금계산서 청구일로부터 5일 이내 계좌 입금',
          left: 120, top: 1020, width: 1000, fontSize: 22, fill: '#334155', lineHeight: 1.7
        }),
        text({ text: '3. 채권자(거래처) 정보', left: 90, top: 1180, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 1220,
          rows: 3, cols: 4,
          cellW: 265, cellH: 60,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '상호 / 법인명' }, { text: '(주)한국디지털솔루션' }, { text: '대표자 성명' }, { text: '박 혁 신' }],
            [{ text: '사업자등록번호' }, { text: '123-45-67890' }, { text: '전화번호' }, { text: '02-555-1234' }],
            [{ text: '입금 계좌번호' }, { text: '국민은행 123456-04-123456' }, { text: '예금주' }, { text: '(주)한국디지털솔루션' }]
          ]
        },
        text({
          text: '위와 같이 지출원인행위 및 대금 지급을 결의하오니 재가하여 주시기 바랍니다.\n2026년 09월 14일\n기안자 :   디지털혁신팀  주무관  김 기 안  (인/서명)',
          left: 0, top: 1435, width: 1240, textAlign: 'center', fontSize: 23, lineHeight: 1.75, fill: '#0f172a'
        })
      ]
    },

    // 1-5. 업무 점검 및 자체 감사 결과 보고서 (1장 완결형)
    {
      id: 'doc-audit-report',
      category: 'doc',
      name: '감사 · 점검 결과 보고서',
      note: 'A4 세로 · 실태점검 & 지적·처분요구서 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '2026년도 정기 자체감사 및 실태점검 결과 보고서',
          left: 90, top: 60, width: 1060, fontSize: 36, fontWeight: 'bold', fill: '#0f172a'
        }),
        text({
          text: '보고부서 : 감사실 감사총괄팀  |  보고일자 : 2026. 09. 14.',
          left: 90, top: 110, width: 1060, fontSize: 21, fill: '#64748b'
        }),
        rect({ left: 90, top: 145, width: 1060, height: 130, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1.5, rx: 8 }),
        text({
          text: '• 점검 건명 : 2026년 3분기 전 부서 예산 집행 및 보안 관리 실태 자체 점검\n' +
            '• 점검 대상 : 6개 본부 22개 부서 (전수 점검)      • 점검 기간 : 2026. 09. 01. ~ 09. 10. (10일간)\n' +
            '• 점검반원 : 감사실장 박공정 외 3명 (기술 감사 2명, 회계 감사 1명)',
          left: 120, top: 170, width: 1000, fontSize: 21, fill: '#1e3a8a', lineHeight: 1.6
        }),
        rect({ left: 90, top: 295, width: 340, height: 110, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1.5, rx: 8 }),
        text({ text: '종합 평가 등급', left: 115, top: 315, width: 290, fontSize: 20, fill: '#15803d' }),
        text({ text: '【 양 호 (A) 】', left: 115, top: 345, width: 290, fontSize: 32, fontWeight: 'bold', fill: '#166534' }),
        rect({ left: 450, top: 295, width: 340, height: 110, fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1.5, rx: 8 }),
        text({ text: '총 지적 건수', left: 475, top: 315, width: 290, fontSize: 20, fill: '#475569' }),
        text({ text: '총 8건 (시정 3, 주의 5)', left: 475, top: 345, width: 290, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 810, top: 295, width: 340, height: 110, fill: '#fefce8', stroke: '#fef08a', strokeWidth: 1.5, rx: 8 }),
        text({ text: '재정상 조치 금액', left: 835, top: 315, width: 290, fontSize: 20, fill: '#854d0e' }),
        text({ text: '₩ 4,250,000 환수', left: 835, top: 345, width: 290, fontSize: 28, fontWeight: 'bold', fill: '#a16207' }),
        text({ text: '1. 주요 분야별 지적 사항 및 처분 요구', left: 90, top: 435, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 475,
          rows: 6, cols: 6,
          cellW: 176, cellH: 90,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '연번' }, { text: '점검 분야' }, { text: '지적 내용 및 문제점' }, { text: '처분 구분' }, { text: '조치 기한' }, { text: '소관 부서' }],
            [{ text: '1' }, { text: '예산 회계' }, { text: '여비 중복 청구 및 증빙 누락 3건' }, { text: '시정 (환수)' }, { text: '2026. 09. 30.' }, { text: '경영지원팀' }],
            [{ text: '2' }, { text: '정보 보안' }, { text: '외부 저장매체 미인가 사용 2건' }, { text: '주 의' }, { text: '2026. 09. 25.' }, { text: '개발사업팀' }],
            [{ text: '3' }, { text: '물품 관리' }, { text: '불용 전산장비 전산망 등록 지연' }, { text: '개 선' }, { text: '2026. 10. 15.' }, { text: '총무기획팀' }],
            [{ text: '4' }, { text: '보안 관리' }, { text: '패스워드 분기별 변경 주기 미준수' }, { text: '주 의' }, { text: '2026. 09. 20.' }, { text: '전 부서' }],
            [{ text: '5' }, { text: '계약 집행' }, { text: '하자보수보증금 납부 지연 1건' }, { text: '시정 (완료)' }, { text: '2026. 09. 18.' }, { text: '재무회계팀' }]
          ]
        },
        text({ text: '2. 향후 제도 개선 및 사후 관리 계획', left: 90, top: 1050, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 1090, width: 1060, height: 260, fill: '#f8fafc', stroke: '#e2e8f0', rx: 8 }),
        text({
          text: '가. 회계 처리 투명성 제고를 위한 오프라인 증빙 전산 첨부 의무화 시행 (10월부터 적용)\n' +
            '나. 보안 취약점 예방을 위해 망분리 PC 보안 정책 자동 롤아웃 시스템 전 부서 배포\n' +
            '다. 시정 및 주의 조치 사항은 기한 내 조치 결과 보고서를 제출받아 이행 완료 여부 전수 점검\n' +
            '라. 반복 지적 부서에 대해서는 차기 평가 시 부서 청렴도 마일리지 감점 조치 예정',
          left: 125, top: 1120, width: 990, fontSize: 22, fill: '#334155', lineHeight: 1.85
        }),
        text({
          text: '위와 같이 자체 점검 결과를 보고합니다.\n2026년 09월 14일\n감 사 실 장   박   공   정   (인/서명)',
          left: 0, top: 1410, width: 1240, textAlign: 'center', fontSize: 26, fontWeight: 'bold', lineHeight: 1.75, fill: '#0f172a'
        }),
        rect({ left: 880, top: 1445, width: 70, height: 70, fill: 'rgba(220,38,38,0.06)', stroke: '#dc2626', strokeWidth: 2.5, rx: 6 }),
        text({ text: '감사인', left: 880, top: 1466, width: 70, fontSize: 18, fontWeight: 'bold', fill: '#dc2626', textAlign: 'center' })
      ]
    },

    // 1-6. 비상근무 편성표 및 상황 보고서 (재난·안전·당직)
    {
      id: 'doc-emergency-roster',
      category: 'doc',
      name: '비상근무 편성표 · 상황보고',
      note: 'A4 세로 · 재난안전/당직 지휘체계 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        rect({ left: 90, top: 50, width: 1060, height: 80, fill: '#7f1d1d', rx: 8 }),
        text({
          text: '【 비 상 대 책 본 부 】 2026년 재난안전 비상근무 편성 및 1차 상황보고',
          left: 90, top: 72, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#fef2f2', textAlign: 'center'
        }),
        {
          type: 'table',
          left: 90, top: 150,
          rows: 2, cols: 4,
          cellW: 265, cellH: 60,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#fee2e2',
          borderColor: '#fca5a5',
          cells: [
            [{ text: '발령 단계' }, { text: '비상 2단계 (경계)' }, { text: '발령 일시' }, { text: '2026. 09. 14.(월) 18:00부' }],
            [{ text: '발령 사유' }, { text: '제14호 태풍 북상에 따른 호우·강풍 경보' }, { text: '소집 대상' }, { text: '전 직원 1/3 비상 소집 (총 42명)' }]
          ]
        },
        text({ text: '1. 비상대책본부 지휘 및 편성 체계', left: 90, top: 295, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 340, width: 330, height: 75, fill: '#1e3a8a', rx: 8 }),
        text({ text: '본부장 : 원 장  이 혁 신', left: 90, top: 362, width: 330, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        rect({ left: 455, top: 340, width: 330, height: 75, fill: '#2563eb', rx: 8 }),
        text({ text: '총괄책임관 : 실 장  김 총 괄', left: 455, top: 362, width: 330, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        rect({ left: 820, top: 340, width: 330, height: 75, fill: '#0284c7', rx: 8 }),
        text({ text: '상황실장 : 팀 장  박 대 응', left: 820, top: 362, width: 330, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '2. 24시간 교대 근무조 편성 현황', left: 90, top: 445, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 490,
          rows: 5, cols: 6,
          cellW: 176, cellH: 90,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#fee2e2',
          borderColor: '#fca5a5',
          cells: [
            [{ text: '근무조' }, { text: '근무 시간' }, { text: '조장 (책임자)' }, { text: '조원 (편성 인원)' }, { text: '주요 임무' }, { text: '비상 연락망' }],
            [{ text: '1조 (주간)' }, { text: '09:00 ~ 18:00' }, { text: '김안전 팀장' }, { text: '이주무 외 7명' }, { text: '상황 총괄 및 유관기관 협조' }, { text: '02-000-1111' }],
            [{ text: '2조 (전반야)' }, { text: '18:00 ~ 01:00' }, { text: '박기술 책임' }, { text: '정선임 외 7명' }, { text: '시설물 순찰 및 긴급 복구' }, { text: '02-000-2222' }],
            [{ text: '3조 (후반야)' }, { text: '01:00 ~ 09:00' }, { text: '최동훈 수석' }, { text: '강주무 외 7명' }, { text: '기상 모니터링 및 비상대기' }, { text: '02-000-3333' }],
            [{ text: '대기조' }, { text: '자택 비상대기' }, { text: '조기획 차장' }, { text: '부서원 전원' }, { text: '유선 연락망 10분 내 응소' }, { text: '비상연락망 참조' }]
          ]
        },
        text({ text: '3. 주요 조치 사항 및 현장 상황 요약 (18:00 기준)', left: 90, top: 970, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 1015, width: 1060, height: 260, fill: '#f8fafc', stroke: '#e2e8f0', rx: 8 }),
        text({
          text: '• 기상 현황 : 현재 시속 32m 강풍 및 시간당 45mm 집중호우 관측 (태풍 최근접 23시 예상)\n' +
            '• 사전 예찰 : 지하 수전실 및 전산 서버실 차수판 4개소 설치 완료, 옥외 배수로 정비 완료\n' +
            '• 피해 상황 : 현재까지 인명 및 주요 시설물 피해 없음 (특이 동향 발생 즉시 상황 보고)\n' +
            '• 유관 기관 : 소방서(119), 관할 경찰서 및 지자체 재난상황실과 24시간 핫라인 가동 중\n' +
            '• 다음 보고 : 2026. 09. 14.(월) 21:00 (2차 상황판단회의 개최 직후 서면 보고)',
          left: 125, top: 1045, width: 990, fontSize: 22, fill: '#1e293b', lineHeight: 1.8
        }),
        text({
          text: '비 상 대 책 상 황 실 장   박   대   응   (인/서명)\n상황실 직통 ☎ 02-1234-5670 ~ 3 (FAX 02-1234-5674)',
          left: 0, top: 1340, width: 1240, textAlign: 'center', fontSize: 24, fontWeight: 'bold', lineHeight: 1.8, fill: '#0f172a'
        })
      ]
    },

    // 1-7. 과업지시서(RFP) 요약서 및 제안 요청 규격서
    {
      id: 'doc-rfp-summary',
      category: 'doc',
      name: '과업지시서 · 제안요약',
      note: 'A4 세로 · 용역사업 과업범위 & 요건정의 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        rect({ left: 90, top: 60, width: 1060, height: 110, fill: '#0f172a', rx: 8 }),
        text({
          text: '2026년도 공공 데이터 행정 업무 자동화 플랫폼 구축 용역',
          left: 90, top: 80, width: 1060, fontSize: 32, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '과 업 지 시 서   요 약   및   제 안 요 청   규 격 (RFP)',
          left: 90, top: 124, width: 1060, fontSize: 20, fill: '#38bdf8', textAlign: 'center', charSpacing: 2
        }),
        {
          type: 'table',
          left: 90, top: 190,
          rows: 4, cols: 4,
          cellW: 265, cellH: 60,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '사 업 명' }, { text: '디지털 행정 업무 서식 자동화 솔루션 구축' }, { text: '사업 예산' }, { text: '일금 180,000,000원 (VAT 포함)' }],
            [{ text: '사업 기간' }, { text: '계약체결일로부터 6개월간' }, { text: '계약 방법' }, { text: '일반경쟁입찰 (협상에 의한 계약)' }],
            [{ text: '수요 부서' }, { text: '디지털혁신추진단 IT인프라팀' }, { text: '담당자' }, { text: '선임연구원 홍길동 (02-000-0000)' }],
            [{ text: '주요 대상' }, { text: '인터넷 차단 폐쇄망 및 행정망 전사 PC' }, { text: '납품 형태' }, { text: '단일 실행 파일(HTML) 및 소스코드' }]
          ]
        },
        text({ text: '1. 핵심 과업 범위 (3대 중점 영역)', left: 90, top: 460, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 505, width: 340, height: 140, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1.5, rx: 8 }),
        text({ text: '[과업 1] 오프라인 엔진', left: 115, top: 525, width: 290, fontSize: 22, fontWeight: 'bold', fill: '#1d4ed8' }),
        text({ text: '외부망 차단 상태에서\n100% 독립 실행 가능한\n단일 파일 번들링 구현', left: 115, top: 560, width: 290, fontSize: 19, fill: '#334155', lineHeight: 1.4 }),
        rect({ left: 450, top: 505, width: 340, height: 140, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1.5, rx: 8 }),
        text({ text: '[과업 2] 표준 서식 탑재', left: 475, top: 525, width: 290, fontSize: 22, fontWeight: 'bold', fill: '#15803d' }),
        text({ text: '공문서, 기안문, 협조전,\n출장, 회계 등 공공 행정\n표준 서식 50종 이상 제공', left: 475, top: 560, width: 290, fontSize: 19, fill: '#334155', lineHeight: 1.4 }),
        rect({ left: 810, top: 505, width: 340, height: 140, fill: '#faf5ff', stroke: '#e9d5ff', strokeWidth: 1.5, rx: 8 }),
        text({ text: '[과업 3] 오피스 변환', left: 835, top: 525, width: 290, fontSize: 22, fontWeight: 'bold', fill: '#7e22ce' }),
        text({ text: '서버 통신 없이 브라우저에서\nPPTX 및 HWPX 파일로\n직접 저장하는 엔진 탑재', left: 835, top: 560, width: 290, fontSize: 19, fill: '#334155', lineHeight: 1.4 }),
        text({ text: '2. 요구사항 상세 정의표 (System Requirements)', left: 90, top: 670, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 710,
          rows: 6, cols: 5,
          cellW: 212, cellH: 90,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#dbeafe',
          borderColor: '#93a7c4',
          cells: [
            [{ text: '구분' }, { text: '요구사항 ID' }, { text: '요구사항 명' }, { text: '세부 사양 및 규격' }, { text: '검증 기준' }],
            [{ text: '기능' }, { text: 'SFR-001' }, { text: '단일 파일 실행' }, { text: '설치 없이 브라우저 더블클릭 즉시 실행' }, { text: '독립 실행 테스트' }],
            [{ text: '기능' }, { text: 'SFR-002' }, { text: '공문서 서식 지원' }, { text: '공공 표준 결재선, 개조식 본문, 표 편집' }, { text: '공문서 출력 대조' }],
            [{ text: '변환' }, { text: 'SFR-003' }, { text: 'HWPX / PPTX 내보내기' }, { text: '순수 JS 기반 표준 오피스 문서 패키징' }, { text: '한글/오피스 호환성' }],
            [{ text: '성능' }, { text: 'PER-001' }, { text: '초고속 렌더링' }, { text: '대용량 캔버스 및 50+ 오브젝트 부드러운 편집' }, { text: '60fps 유지 검증' }],
            [{ text: '보안' }, { text: 'SEC-001' }, { text: '데이터 유출 방지' }, { text: '외부 네트워크 전송 0건, 로컬 브라우저 처리' }, { text: '패킷 분석 검증' }]
          ]
        },
        text({ text: '3. 최종 산출물 납품 목록', left: 90, top: 1285, width: 600, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 1325, width: 1060, height: 150, fill: '#f8fafc', stroke: '#e2e8f0', rx: 8 }),
        text({
          text: '• 배포용 단일 실행 파일 (dist/ImgEditor.html) 1식\n' +
            '• 전체 소스코드 및 빌드 스크립트 일체 (Git 저장소 납품)\n' +
            '• 사용자 매뉴얼 및 시스템 관리자 가이드북 각 1부\n' +
            '• 소프트웨어 시험 성적서 및 하자보수 이행보증증권(계약금액의 10%, 1년간) 1부',
          left: 120, top: 1350, width: 1000, fontSize: 21, fill: '#334155', lineHeight: 1.6
        }),
        text({
          text: '발 주 기 관 :   한  국  혁  신  진  흥  원   (직인생략)',
          left: 0, top: 1545, width: 1240, textAlign: 'center', fontSize: 26, fontWeight: 'bold', fill: '#0f172a'
        })
      ]
    },

    // 2. 월간 업무 추진 실적 보고서 (A4 가로)
    {
      id: 'doc-monthly-kpi',
      category: 'doc',
      name: '월간 업무 추진 실적 보고서',
      note: 'A4 가로 · KPI 카드 & 표 요약 (1754 × 1240)',
      width: 1754,
      height: 1240,
      background: '#ffffff',
      objects: [
        rect({ left: 0, top: 0, width: 1754, height: 110, fill: '#0f172a' }),
        text({
          text: '2026년 9월 주요 업무 추진 실적 및 월간 성과 보고',
          left: 90, top: 32, width: 1100, fontSize: 38, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '보고일자 : 2026. 09. 14.  |  보고부서 : 기획조정실 디지털혁신팀',
          left: 1150, top: 44, width: 514, fontSize: 20, fill: '#94a3b8', textAlign: 'right'
        }),
        rect({ left: 90, top: 140, width: 480, height: 170, fill: '#eff6ff', rx: 12, stroke: '#bfdbfe', strokeWidth: 1.5 }),
        icon({ iconName: 'chartBar', left: 120, top: 170, size: 60, fill: '#2563eb' }),
        text({ text: '월간 목표 달성률', left: 200, top: 165, width: 340, fontSize: 22, fill: '#475569' }),
        text({ text: '94.5%', left: 200, top: 200, width: 340, fontSize: 52, fontWeight: 'bold', fill: '#1d4ed8' }),
        text({ text: '전월 대비 +5.8%p 초과 달성', left: 200, top: 268, width: 340, fontSize: 18, fill: '#16a34a' }),

        rect({ left: 637, top: 140, width: 480, height: 170, fill: '#f0fdf4', rx: 12, stroke: '#bbf7d0', strokeWidth: 1.5 }),
        icon({ iconName: 'checkCircle', left: 667, top: 170, size: 60, fill: '#16a34a' }),
        text({ text: '주요 과제 완료 건수', left: 747, top: 165, width: 340, fontSize: 22, fill: '#475569' }),
        text({ text: '18 / 20건', left: 747, top: 200, width: 340, fontSize: 52, fontWeight: 'bold', fill: '#15803d' }),
        text({ text: '잔여 2건 기한 내(9.30) 완료 예정', left: 747, top: 268, width: 340, fontSize: 18, fill: '#65a30d' }),

        rect({ left: 1184, top: 140, width: 480, height: 170, fill: '#fefce8', rx: 12, stroke: '#fef08a', strokeWidth: 1.5 }),
        icon({ iconName: 'coins', left: 1214, top: 170, size: 60, fill: '#ca8a04' }),
        text({ text: '연간 누적 예산 집행률', left: 1294, top: 165, width: 340, fontSize: 22, fill: '#475569' }),
        text({ text: '82.4%', left: 1294, top: 200, width: 340, fontSize: 52, fontWeight: 'bold', fill: '#a16207' }),
        text({ text: '연간 계획 대비 정상 집행 진행 중', left: 1294, top: 268, width: 340, fontSize: 18, fill: '#854d0e' }),

        text({ text: '1. 세부 과제별 추진 실적', left: 90, top: 340, width: 500, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 385,
          rows: 5, cols: 5,
          cellW: 314, cellH: 92,
          fontSize: 22,
          headerRow: true,
          headerCol: false,
          headerFill: '#e2e8f0',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '과제명' }, { text: '추진 목표' }, { text: '9월 주요 실적' }, { text: '달성률' }, { text: '진행상태' }],
            [{ text: '폐쇄망 에디터 배포' }, { text: '전사 PC 100% 적용' }, { text: '망연계 배포 및 850대 적용 완료' }, { text: '95%' }, { text: '정상 추진' }],
            [{ text: '표준 서식 50종 개발' }, { text: '업무 서식 디지털화' }, { text: '공문서·보고서 등 53종 라이브러리 탑재' }, { text: '100%' }, { text: '완료' }],
            [{ text: 'PPTX/HWPX 변환' }, { text: '표준 오피스 변환 지원' }, { text: '순수 JS 기반 Zip 패키징 엔진 탑재' }, { text: '100%' }, { text: '완료' }],
            [{ text: '전사 사용자 실무 교육' }, { text: '부서별 실무자 워크숍' }, { text: '1차 온라인 매뉴얼 및 동영상 배포' }, { text: '80%' }, { text: '진행중' }]
          ]
        },
        text({ text: '2. 10월 중점 추진 계획', left: 90, top: 890, width: 500, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 935, width: 1574, height: 230, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'check', left: 130, top: 965, size: 36, fill: '#2563eb' }),
        text({ text: '폐쇄망 단일 파일 에디터 2단계 안정화 점검 및 부서별 피드백 수렴 (10. 01. ~ 10. 15.)', left: 180, top: 970, width: 1400, fontSize: 22, fill: '#1e293b' }),
        icon({ iconName: 'check', left: 130, top: 1030, size: 36, fill: '#2563eb' }),
        text({ text: '행정 문서 양식 고도화 및 부서별 맞춤형 커스텀 템플릿 2차 업데이트 (10. 16. ~ 10. 25.)', left: 180, top: 1035, width: 1400, fontSize: 22, fill: '#1e293b' }),
        icon({ iconName: 'check', left: 130, top: 1095, size: 36, fill: '#2563eb' }),
        text({ text: '4분기 성과 극대화를 위한 전사 업무 효율화 실적 측정 및 성과 보고회 개최 (10. 30.)', left: 180, top: 1100, width: 1400, fontSize: 22, fill: '#1e293b' })
      ]
    },

    // 3. 회의록 및 액션아이템 서식 (A4 세로)
    {
      id: 'doc-meeting-minutes',
      category: 'doc',
      name: '회의록 · 액션아이템',
      note: 'A4 세로 · 논의결과 & R&R 실행표 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 160, gradient: DEEP }),
        text({
          text: '회 의 록  (Meeting Minutes)',
          left: 90, top: 50, width: 1060, fontSize: 48, fontWeight: 'bold', fill: '#ffffff', charSpacing: 4
        }),
        text({
          text: '프로젝트 및 부서 정기 점검 회의 표준 서식',
          left: 90, top: 112, width: 1060, fontSize: 22, fill: '#93c5fd'
        }),
        rect({ left: 90, top: 200, width: 1060, height: 210, fill: '#f8fafc', rx: 10, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({
          text: '• 회 의 명 : [정기] 2026년 3분기 디지털 전환 프로젝트 진척 점검 회의\n' +
            '• 일    시 : 2026년 9월 14일(월) 14:00 ~ 15:30 (90분간)\n' +
            '• 장    소 : 본관 4층 대회의실 (화상 회의 병행 진행)\n' +
            '• 주 재 자 : 김철수 실장 (기획조정실)\n' +
            '• 참 석 자 : 이영희 팀장, 박민수 수석, 정다은 선임, 최동훈 책임 외 4명 (총 9명)',
          left: 125, top: 225, width: 990, fontSize: 22, fill: '#334155', lineHeight: 1.7
        }),
        text({ text: '1. 주요 안건 및 논의 결과 요약', left: 90, top: 450, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 495, width: 1060, height: 280, fill: '#eff6ff', rx: 10, stroke: '#bfdbfe', strokeWidth: 1.5 }),
        text({
          text: '가. 오프라인 단일 파일 에디터 1차 배포 결과 보고\n' +
            '  - 외부 인터넷이 차단된 행정망 PC에서도 설치 없이 즉시 실행되어 현장 호응도 95% 달성.\n' +
            '  - 인물 보정, 누끼, 고해상도 내보내기 기능의 안정성 검증 완료.\n\n' +
            '나. PPTX 및 HWPX 변환 내보내기 기능 정식 적용\n' +
            '  - 브라우저 순수 JS 패키징을 통해 파워포인트 및 아래아한글 문서로 즉시 저장되는 기능 승인.\n' +
            '  - 9월 3주차부터 전사 기본 기능으로 반영하여 보고서 작성 시간 50% 단축 기대.',
          left: 125, top: 525, width: 990, fontSize: 22, fill: '#1e3a8a', lineHeight: 1.7
        }),
        text({ text: '2. 실행 과제 (Action Items & R&R)', left: 90, top: 820, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 865,
          rows: 5, cols: 5,
          cellW: 212, cellH: 92,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#e2e8f0',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: 'No' }, { text: '실행 과제' }, { text: '담당자' }, { text: '완료 기한' }, { text: '진행 상태' }],
            [{ text: '1' }, { text: '신규 서식 템플릿 11종 검증' }, { text: '정다은 선임' }, { text: '2026. 09. 18.' }, { text: '진행중' }],
            [{ text: '2' }, { text: '행정망 배포용 매뉴얼 작성' }, { text: '박민수 수석' }, { text: '2026. 09. 22.' }, { text: '대기' }],
            [{ text: '3' }, { text: '보안성 검토 및 취약점 점검' }, { text: '이영희 팀장' }, { text: '2026. 09. 25.' }, { text: '대기' }],
            [{ text: '4' }, { text: '차기 점검 회의 안건 취합' }, { text: '최동훈 책임' }, { text: '2026. 09. 28.' }, { text: '예정' }]
          ]
        },
        text({ text: '3. 특이사항 및 차기 회의 일정', left: 90, top: 1370, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 1415, width: 1060, height: 180, fill: '#f8fafc', rx: 10, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({
          text: '• 차기 회의 : 2026년 9월 29일(화) 14:00, 본관 4층 대회의실\n' +
            '• 준비 사항 : 과제별 3분기 최종 실적 보고서 및 4분기 계획안 사전 제출 요망\n' +
            '• 작성자 : 기획조정실 정다은 선임 (확인자 : 김철수 실장 서명)',
          left: 125, top: 1450, width: 990, fontSize: 22, fill: '#475569', lineHeight: 1.8
        })
      ]
    },

    // 4. 신규 입사자 온보딩 가이드 표지 (A4 세로)
    {
      id: 'doc-onboarding-guide',
      category: 'doc',
      name: '온보딩 가이드북 표지',
      note: 'A4 세로 · 신규 입사자 웰컴 핸드북 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 750, gradient: DEEP }),
        text({
          text: 'WELCOME ABOARD!',
          left: 90, top: 140, width: 1060, fontSize: 36, fontWeight: 'bold', fill: '#38bdf8', charSpacing: 6
        }),
        text({
          text: '신규 입사자를 위한\n첫걸음 온보딩 가이드',
          left: 90, top: 220, width: 1060, fontSize: 68, fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.3
        }),
        rect({ left: 90, top: 430, width: 120, height: 8, fill: '#38bdf8' }),
        text({
          text: '당신의 새로운 시작을 진심으로 환영합니다.\n우리가 함께 만들어갈 혁신과 성장의 여정을 안내합니다.',
          left: 90, top: 470, width: 1060, fontSize: 28, fill: '#cbd5e1', lineHeight: 1.6
        }),
        rect({ left: 90, top: 830, width: 1060, height: 160, fill: '#f8fafc', rx: 14, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'building', left: 130, top: 865, size: 80, fill: '#2563eb' }),
        text({ text: 'CHAPTER 01  ·  조직 소개 & 핵심 가치', left: 240, top: 865, width: 850, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '우리의 미션, 비전, 일하는 방식 및 5대 핵심 가치 안내', left: 240, top: 915, width: 850, fontSize: 22, fill: '#64748b' }),

        rect({ left: 90, top: 1020, width: 1060, height: 160, fill: '#f8fafc', rx: 14, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'desktop', left: 130, top: 1055, size: 80, fill: '#0891b2' }),
        text({ text: 'CHAPTER 02  ·  사내 시스템 & IT 계정 설정', left: 240, top: 1055, width: 850, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '업무망 PC 보안 수칙, 인트라넷, 전자결재, 메일 및 협업툴 세팅', left: 240, top: 1105, width: 850, fontSize: 22, fill: '#64748b' }),

        rect({ left: 90, top: 1210, width: 1060, height: 160, fill: '#f8fafc', rx: 14, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'heart', left: 130, top: 1245, size: 80, fill: '#7c3aed' }),
        text({ text: 'CHAPTER 03  ·  복리후생 & 실무 가이드', left: 240, top: 1245, width: 850, fontSize: 28, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '휴가 신청, 교육 지원, 복지 포인트 사용법 및 실무 R&R 프로세스', left: 240, top: 1295, width: 850, fontSize: 22, fill: '#64748b' }),

        rect({ left: 90, top: 1540, width: 1060, height: 1, fill: '#e2e8f0' }),
        text({
          text: '한국혁신진흥원  경영지원본부 인사팀 발행  |  2026 Edition',
          left: 0, top: 1590, width: 1240, fontSize: 22, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 5. 세미나 / 컨퍼런스 초청장 (A4 세로)
    {
      id: 'promo-seminar',
      category: 'promo',
      name: '세미나 · 포럼 초청장',
      note: 'A4 세로 · 고급 초청장 & 타임테이블 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#090d16',
      objects: [
        text({
          text: '2026 KOREA DIGITAL INNOVATION SUMMIT',
          left: 90, top: 120, width: 1060, fontSize: 28, fontWeight: 'bold', fill: '#38bdf8', charSpacing: 4
        }),
        text({
          text: 'AI와 데이터로 그리는\n공공 행정의 미래',
          left: 90, top: 180, width: 1060, fontSize: 72, fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.25
        }),
        rect({ left: 90, top: 385, width: 140, height: 6, fill: '#f59e0b' }),
        text({
          text: '폐쇄망·보안 환경의 업무 생산성 극대화와 디지털 전환 전략을 논의하는 자리에 귀하를 정중히 모십니다.',
          left: 90, top: 420, width: 1060, fontSize: 26, fill: '#94a3b8', lineHeight: 1.6
        }),
        rect({ left: 90, top: 510, width: 1060, height: 140, fill: 'rgba(255,255,255,0.05)', rx: 12, stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1.5 }),
        icon({ iconName: 'calendar', left: 130, top: 545, size: 65, fill: '#38bdf8' }),
        text({ text: '일시 : 2026년 10월 22일(목) 14:00 ~ 17:30 (온·오프라인 동시 진행)', left: 220, top: 545, width: 900, fontSize: 24, fill: '#f1f5f9' }),
        text({ text: '장소 : 서울 코엑스(COEX) 2층 아셈볼룸 및 공식 유튜브 생중계', left: 220, top: 590, width: 900, fontSize: 22, fill: '#94a3b8' }),

        text({ text: 'PROGRAM SCHEDULE', left: 90, top: 690, width: 1060, fontSize: 26, fontWeight: 'bold', fill: '#f59e0b', charSpacing: 2 }),
        rect({ left: 90, top: 735, width: 1060, height: 120, fill: 'rgba(255,255,255,0.03)', rx: 10, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({ text: '14:00 ~ 14:50', left: 120, top: 760, width: 220, fontSize: 24, fontWeight: 'bold', fill: '#38bdf8' }),
        text({ text: '[기조강연] 생성형 AI 시대, 공공 부문의 일하는 방식 혁신', left: 350, top: 755, width: 750, fontSize: 24, fontWeight: 'bold', fill: '#ffffff' }),
        text({ text: '연사 : 김혁신 교수 (KAIST 디지털거버넌스 연구센터장)', left: 350, top: 795, width: 750, fontSize: 20, fill: '#94a3b8' }),

        rect({ left: 90, top: 875, width: 1060, height: 120, fill: 'rgba(255,255,255,0.03)', rx: 10, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({ text: '15:00 ~ 16:10', left: 120, top: 900, width: 220, fontSize: 24, fontWeight: 'bold', fill: '#38bdf8' }),
        text({ text: '[세션발표] 폐쇄망 환경에서의 고효율 단일 파일 업무 도구 사례', left: 350, top: 895, width: 750, fontSize: 24, fontWeight: 'bold', fill: '#ffffff' }),
        text({ text: '발표 : 박기술 수석연구원 (한국데이터혁신원 DX추진단)', left: 350, top: 935, width: 750, fontSize: 20, fill: '#94a3b8' }),

        rect({ left: 90, top: 1015, width: 1060, height: 120, fill: 'rgba(255,255,255,0.03)', rx: 10, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({ text: '16:20 ~ 17:30', left: 120, top: 1040, width: 220, fontSize: 24, fontWeight: 'bold', fill: '#38bdf8' }),
        text({ text: '[패널토론] 안전하고 스마트한 차세대 행정 업무 생태계 조성', left: 350, top: 1035, width: 750, fontSize: 24, fontWeight: 'bold', fill: '#ffffff' }),
        text({ text: '좌장 : 이공공 원장  |  패널 4인 전문가 종합 질의응답', left: 350, top: 1075, width: 750, fontSize: 20, fill: '#94a3b8' }),

        text({ text: 'KEYNOTE SPEAKER', left: 90, top: 1180, width: 1060, fontSize: 26, fontWeight: 'bold', fill: '#f59e0b', charSpacing: 2 }),
        slot({ left: 90, top: 1230, width: 220, height: 260, label: '연사 사진' }),
        rect({ left: 340, top: 1230, width: 810, height: 260, fill: 'rgba(255,255,255,0.03)', rx: 10, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({
          text: '김 혁 신  교수 (KAIST 디지털거버넌스 연구센터장)\n\n' +
            '• 대통령 직속 디지털플랫폼정부위원회 자문위원\n' +
            '• 前 정보통신정책연구원 미래전략본부장\n' +
            '• 저서 : 《공공 혁신의 새로운 규칙》, 《AI 거버넌스》',
          left: 375, top: 1260, width: 740, fontSize: 22, fill: '#e2e8f0', lineHeight: 1.6
        }),
        rect({ left: 90, top: 1540, width: 1060, height: 110, fill: '#2563eb', rx: 12 }),
        text({
          text: '사전 등록 바로가기 · 참가비 무료 (선착순 200명)',
          left: 90, top: 1572, width: 1060, fontSize: 30, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        })
      ]
    },

    // 6. 교육 / 워크숍 안내 포스터 (A4 세로)
    {
      id: 'promo-workshop-poster',
      category: 'promo',
      name: '교육 · 워크숍 포스터',
      note: 'A4 세로 · 실무 교육 과정 홍보 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 320, gradient: grad(110, [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1e3a8a' }]) }),
        text({
          text: '2026 실무 역량 강화 아카데미',
          left: 90, top: 60, width: 1060, fontSize: 30, fontWeight: 'bold', fill: '#38bdf8'
        }),
        text({
          text: '데이터 분석 & 시각화 보고서\n3일 완성 집중 실습 과정',
          left: 90, top: 115, width: 1060, fontSize: 58, fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.25
        }),
        rect({ left: 90, top: 270, width: 120, height: 6, fill: '#38bdf8' }),

        text({ text: 'CURRICULUM HIGHLIGHTS', left: 90, top: 370, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#2563eb', charSpacing: 2 }),
        rect({ left: 90, top: 410, width: 330, height: 230, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'chartBar', left: 125, top: 440, size: 55, fill: '#2563eb' }),
        text({ text: '데이터 정제 및 요약', left: 125, top: 510, width: 260, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '엑셀 복잡한 수식 없이 핵심 KPI 지표를 명확히 도출하는 기법', left: 125, top: 550, width: 260, fontSize: 18, fill: '#64748b', lineHeight: 1.5 }),

        rect({ left: 455, top: 410, width: 330, height: 230, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'brush', left: 490, top: 440, size: 55, fill: '#0d9488' }),
        text({ text: '인포그래픽 시각화', left: 490, top: 510, width: 260, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '한눈에 들어오는 도표, 차트, 카드 레이아웃 실무 디자인 공식', left: 490, top: 550, width: 260, fontSize: 18, fill: '#64748b', lineHeight: 1.5 }),

        rect({ left: 820, top: 410, width: 330, height: 230, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'fileText', left: 855, top: 440, size: 55, fill: '#7c3aed' }),
        text({ text: '원클릭 문서 변환', left: 855, top: 510, width: 260, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '오프라인 환경에서 PPTX 및 HWPX 파일로 바로 추출 활용', left: 855, top: 550, width: 260, fontSize: 18, fill: '#64748b', lineHeight: 1.5 }),

        text({ text: 'COURSE INFORMATION', left: 90, top: 680, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#2563eb', charSpacing: 2 }),
        rect({ left: 90, top: 720, width: 1060, height: 260, fill: '#eff6ff', rx: 12, stroke: '#bfdbfe', strokeWidth: 1.5 }),
        text({
          text: '• 교 육 일 정 : 2026년 10월 14일(수) ~ 10월 16일(금) / 3일간 (총 18시간)\n' +
            '• 교 육 장 소 : 본관 3층 정보화교육장 (1인 1PC 실습 환경 제공)\n' +
            '• 교 육 대 상 : 전 부서 기획·행정·사업 실무 담당자 30명 (선착순 마감)\n' +
            '• 수  강  료 : 전액 무료 (교재 및 실습 템플릿 50종 패키지 무료 제공)\n' +
            '• 수 료 혜 택 : 상시학습 시간 18시간 인정 및 원장 명의 공식 수료증 발급',
          left: 130, top: 755, width: 980, fontSize: 23, fill: '#1e3a8a', lineHeight: 1.8
        }),

        text({ text: 'INSTRUCTOR PROFILE', left: 90, top: 1020, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#2563eb', charSpacing: 2 }),
        slot({ left: 90, top: 1060, width: 240, height: 290, label: '강사 사진' }),
        rect({ left: 360, top: 1060, width: 790, height: 290, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({
          text: '이 데 이 터  수석 컨설턴트\n\n' +
            '• 現 한국빅데이터시각화연구소 대표 컨설턴트\n' +
            '• 前 글로벌 리서치 기업 데이터 분석 총괄\n' +
            '• 공공기관 및 대기업 보고서 시각화 출강 300회 이상\n' +
            '• 저서 : 《한눈에 꽂히는 보고서 시각화의 모든 것》',
          left: 400, top: 1095, width: 710, fontSize: 23, fill: '#334155', lineHeight: 1.65
        }),

        rect({ left: 90, top: 1410, width: 1060, height: 120, fill: '#0f172a', rx: 14 }),
        text({
          text: '교육 참가 신청 바로가기 (선착순 접수 중)',
          left: 90, top: 1450, width: 1060, fontSize: 32, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '문의 : 인재개발팀 02-1234-5680  |  이메일 hr@innovate.kr',
          left: 0, top: 1560, width: 1240, fontSize: 22, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 7. 공공/사내 카드뉴스 표지 (정사각 1080 × 1080)
    {
      id: 'promo-sns-news',
      category: 'promo',
      name: '카드뉴스 · 정책 홍보',
      note: '정사각 1:1 · 소식지 & 인트라넷 (1080 × 1080)',
      width: 1080,
      height: 1080,
      background: '#f8fafc',
      objects: [
        rect({ left: 0, top: 0, width: 1080, height: 24, fill: '#2563eb' }),
        rect({ left: 80, top: 80, width: 220, height: 48, fill: '#eff6ff', rx: 24, stroke: '#bfdbfe', strokeWidth: 1.5 }),
        text({ text: '알아두면 유용한 꿀팁', left: 80, top: 92, width: 220, fontSize: 18, fontWeight: 'bold', fill: '#2563eb', textAlign: 'center' }),

        text({
          text: '2026년부터 달라지는\n행정 업무 프로세스\n핵심 총정리 5',
          left: 80, top: 160, width: 920, fontSize: 62, fontWeight: 'bold', fill: '#0f172a', lineHeight: 1.3
        }),
        rect({ left: 80, top: 400, width: 100, height: 6, fill: '#2563eb' }),
        text({
          text: '폐쇄망 환경에서도 설치 없이 단일 파일로 끝내는\n스마트한 디지털 업무 가이드를 지금 확인해 보세요!',
          left: 80, top: 430, width: 920, fontSize: 26, fill: '#64748b', lineHeight: 1.6
        }),

        rect({ left: 80, top: 540, width: 920, height: 380, fill: '#ffffff', rx: 16, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        icon({ iconName: 'document', left: 160, top: 620, size: 200, fill: '#3b82f6' }),
        icon({ iconName: 'sparkle', left: 340, top: 590, size: 90, fill: '#f59e0b' }),
        icon({ iconName: 'checkCircle', left: 480, top: 610, size: 45, fill: '#16a34a' }),
        text({ text: '설치 불필요 · 관리자 권한 X', left: 540, top: 618, width: 420, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        icon({ iconName: 'checkCircle', left: 480, top: 680, size: 45, fill: '#16a34a' }),
        text({ text: '단일 HTML 파일로 즉시 실행', left: 540, top: 688, width: 420, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        icon({ iconName: 'checkCircle', left: 480, top: 750, size: 45, fill: '#16a34a' }),
        text({ text: 'PPTX / HWPX 파일 즉시 변환', left: 540, top: 758, width: 420, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        icon({ iconName: 'checkCircle', left: 480, top: 820, size: 45, fill: '#16a34a' }),
        text({ text: '외부 통신 0회 완전 오프라인', left: 540, top: 828, width: 420, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),

        rect({ left: 0, top: 980, width: 1080, height: 100, fill: '#0f172a' }),
        text({
          text: '기획조정실 디지털소통파트  |  슬라이드를 넘겨 다음 장을 확인하세요  ▶',
          left: 0, top: 1018, width: 1080, fontSize: 22, fill: '#cbd5e1', textAlign: 'center'
        })
      ]
    },

    // 8. 인포그래픽 핵심 통계 현황판 (16:9 1920 × 1080)
    {
      id: 'promo-infographic-stat',
      category: 'promo',
      name: '인포그래픽 통계 현황판',
      note: '16:9 와이드 · 핵심 성과 대시보드 (1920 × 1080)',
      width: 1920,
      height: 1080,
      background: '#0a0f1d',
      objects: [
        text({
          text: '2026 DIGITAL TRANSFORMATION DASHBOARD',
          left: 100, top: 70, width: 1720, fontSize: 26, fontWeight: 'bold', fill: '#38bdf8', charSpacing: 4
        }),
        text({
          text: '2026년 전사 디지털 전환(DX) 종합 성과 지표',
          left: 100, top: 115, width: 1720, fontSize: 54, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '전사 행정 업무 자동화율 92% 달성 및 페이퍼리스 프로세스 정착 성과 분석',
          left: 100, top: 195, width: 1720, fontSize: 24, fill: '#94a3b8'
        }),

        rect({ left: 100, top: 260, width: 405, height: 260, fill: 'rgba(255,255,255,0.04)', rx: 14, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }),
        icon({ iconName: 'clock', left: 140, top: 300, size: 60, fill: '#38bdf8' }),
        text({ text: '업무 처리 시간 절감', left: 140, top: 375, width: 325, fontSize: 22, fill: '#94a3b8' }),
        text({ text: '42.8%', left: 140, top: 410, width: 325, fontSize: 64, fontWeight: 'bold', fill: '#38bdf8' }),
        text({ text: '월평균 32시간/인 단축', left: 140, top: 485, width: 325, fontSize: 18, fill: '#4ade80' }),

        rect({ left: 538, top: 260, width: 405, height: 260, fill: 'rgba(255,255,255,0.04)', rx: 14, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }),
        icon({ iconName: 'document', left: 578, top: 300, size: 60, fill: '#4ade80' }),
        text({ text: '전자 결재 처리율', left: 578, top: 375, width: 325, fontSize: 22, fill: '#94a3b8' }),
        text({ text: '99.4%', left: 578, top: 410, width: 325, fontSize: 64, fontWeight: 'bold', fill: '#4ade80' }),
        text({ text: '연간 종이 120만장 절약', left: 578, top: 485, width: 325, fontSize: 18, fill: '#4ade80' }),

        rect({ left: 976, top: 260, width: 405, height: 260, fill: 'rgba(255,255,255,0.04)', rx: 14, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }),
        icon({ iconName: 'shield', left: 1016, top: 300, size: 60, fill: '#f59e0b' }),
        text({ text: '보안 무사고 달성', left: 1016, top: 375, width: 325, fontSize: 22, fill: '#94a3b8' }),
        text({ text: '100%', left: 1016, top: 410, width: 325, fontSize: 64, fontWeight: 'bold', fill: '#f59e0b' }),
        text({ text: '폐쇄망 완전 독립 운용', left: 1016, top: 485, width: 325, fontSize: 18, fill: '#4ade80' }),

        rect({ left: 1414, top: 260, width: 405, height: 260, fill: 'rgba(255,255,255,0.04)', rx: 14, stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }),
        icon({ iconName: 'smile', left: 1454, top: 300, size: 60, fill: '#a855f7' }),
        text({ text: '사용자 만족도 점수', left: 1454, top: 375, width: 325, fontSize: 22, fill: '#94a3b8' }),
        text({ text: '96.5점', left: 1454, top: 410, width: 325, fontSize: 64, fontWeight: 'bold', fill: '#c084fc' }),
        text({ text: '전년 대비 +14.2점 향상', left: 1454, top: 485, width: 325, fontSize: 18, fill: '#4ade80' }),

        rect({ left: 100, top: 560, width: 843, height: 440, fill: 'rgba(255,255,255,0.03)', rx: 14, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({ text: '분기별 디지털 목표 달성 현황', left: 140, top: 595, width: 760, fontSize: 26, fontWeight: 'bold', fill: '#ffffff' }),
        text({ text: '1분기 인프라 구축', left: 140, top: 660, width: 300, fontSize: 20, fill: '#94a3b8' }),
        rect({ left: 140, top: 695, width: 760, height: 22, fill: '#1e293b', rx: 11 }),
        rect({ left: 140, top: 695, width: 760, height: 22, fill: '#3b82f6', rx: 11 }),
        text({ text: '100% 완료', left: 780, top: 660, width: 120, fontSize: 20, fill: '#38bdf8', textAlign: 'right' }),

        text({ text: '2분기 전사 서식 표준화', left: 140, top: 740, width: 300, fontSize: 20, fill: '#94a3b8' }),
        rect({ left: 140, top: 775, width: 760, height: 22, fill: '#1e293b', rx: 11 }),
        rect({ left: 140, top: 775, width: 760, height: 22, fill: '#10b981', rx: 11 }),
        text({ text: '100% 완료', left: 780, top: 740, width: 120, fontSize: 20, fill: '#34d399', textAlign: 'right' }),

        text({ text: '3분기 오프라인 에디터 확산', left: 140, top: 820, width: 300, fontSize: 20, fill: '#94a3b8' }),
        rect({ left: 140, top: 855, width: 760, height: 22, fill: '#1e293b', rx: 11 }),
        rect({ left: 140, top: 855, width: 710, height: 22, fill: '#f59e0b', rx: 11 }),
        text({ text: '94% 진행', left: 780, top: 820, width: 120, fontSize: 20, fill: '#fbbf24', textAlign: 'right' }),

        text({ text: '4분기 AI 어시스턴트 도입', left: 140, top: 900, width: 300, fontSize: 20, fill: '#94a3b8' }),
        rect({ left: 140, top: 935, width: 760, height: 22, fill: '#1e293b', rx: 11 }),
        rect({ left: 140, top: 935, width: 380, height: 22, fill: '#8b5cf6', rx: 11 }),
        text({ text: '50% 기획', left: 780, top: 900, width: 120, fontSize: 20, fill: '#c084fc', textAlign: 'right' }),

        rect({ left: 976, top: 560, width: 843, height: 440, fill: 'rgba(255,255,255,0.03)', rx: 14, stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }),
        text({ text: '3대 주요 성과 및 정책적 시사점', left: 1016, top: 595, width: 760, fontSize: 26, fontWeight: 'bold', fill: '#ffffff' }),
        text({
          text: '1. 완벽한 보안 환경과 업무 연속성 확보\n' +
            '   외부 클라우드 의존성 0회, 단일 파일 배포로 망분리 보안 규정을\n' +
            '   100% 준수하면서도 최신 편집 편의성을 확보함.\n\n' +
            '2. 실질적 비용 절감 및 보고서 품질 상향 평준화\n' +
            '   연간 상용 소프트웨어 라이선스 비용 약 1억 2천만원 절감 효과.\n' +
            '   전 직원 표준 템플릿 사용으로 대외 보고서 품격 제고.\n\n' +
            '3. 파워포인트(PPTX) · 한글(HWPX) 표준 파일 완벽 호환\n' +
            '   기존 결재 문서 및 발표 파일과의 완벽한 양방향 호환 달성.',
          left: 1016, top: 650, width: 760, fontSize: 22, fill: '#cbd5e1', lineHeight: 1.7
        })
      ]
    },

    // 9. 사원증 / 출입증 세트 (1240 × 860, 앞뒤 나란히)
    {
      id: 'print-id-badge',
      category: 'print',
      name: '사원증 · 출입증 (앞/뒤 세트)',
      note: '54×86mm 규격 · 앞면/뒷면 나란히 (1240 × 860)',
      width: 1240,
      height: 860,
      background: '#e2e8f0',
      objects: [
        text({ text: '[ 전 면 (앞) ]', left: 90, top: 30, width: 480, fontSize: 22, fontWeight: 'bold', fill: '#475569', textAlign: 'center' }),
        text({ text: '[ 후 면 (뒤) ]', left: 670, top: 30, width: 480, fontSize: 22, fontWeight: 'bold', fill: '#475569', textAlign: 'center' }),

        // 전면 카드
        rect({ left: 90, top: 70, width: 480, height: 720, fill: '#ffffff', rx: 20, stroke: '#cbd5e1', strokeWidth: 2 }),
        gradientRect({ left: 90, top: 70, width: 480, height: 110, gradient: DEEP, rx: 20 }),
        rect({ left: 90, top: 160, width: 480, height: 20, fill: '#1e3a8a' }),
        text({ text: 'INNO TECH', left: 90, top: 105, width: 480, fontSize: 30, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 6 }),
        slot({ left: 215, top: 150, width: 230, height: 290, label: '증명사진' }),

        text({ text: '홍 길 동', left: 90, top: 465, width: 480, fontSize: 46, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 8 }),
        text({ text: 'HONG GIL DONG', left: 90, top: 525, width: 480, fontSize: 20, fill: '#64748b', textAlign: 'center', charSpacing: 2 }),
        rect({ left: 230, top: 565, width: 200, height: 3, fill: '#2563eb' }),
        text({ text: '디지털혁신본부  ·  책임연구원', left: 90, top: 585, width: 480, fontSize: 24, fontWeight: 'bold', fill: '#2563eb', textAlign: 'center' }),
        text({ text: '사번 : 2026-0814', left: 90, top: 625, width: 480, fontSize: 20, fill: '#94a3b8', textAlign: 'center' }),
        rect({ left: 150, top: 670, width: 360, height: 60, fill: '#f8fafc', rx: 6, stroke: '#e2e8f0', strokeWidth: 1 }),
        icon({ iconName: 'barcode', left: 180, top: 675, size: 300, fill: '#1e293b' }),

        // 후면 카드
        rect({ left: 670, top: 70, width: 480, height: 720, fill: '#ffffff', rx: 20, stroke: '#cbd5e1', strokeWidth: 2 }),
        rect({ left: 670, top: 130, width: 480, height: 65, fill: '#1e293b' }),
        text({ text: '소 지 자  준 수 사 항', left: 670, top: 240, width: 480, fontSize: 28, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4 }),
        rect({ left: 860, top: 285, width: 100, height: 3, fill: '#0f172a' }),
        text({
          text: '1. 본 증은 본인에 한하여 사용 가능하며,\n' +
            '   타인에게 대여하거나 양도할 수 없습니다.\n\n' +
            '2. 사내 출입 및 보안 구역 통과 시\n' +
            '   반드시 본 증을 패용하여야 합니다.\n\n' +
            '3. 퇴직 시에는 지체 없이 본 증을\n' +
            '   인사팀에 반납하여야 합니다.',
          left: 715, top: 320, width: 390, fontSize: 20, fill: '#334155', lineHeight: 1.6
        }),
        rect({ left: 710, top: 540, width: 400, height: 110, fill: '#f1f5f9', rx: 10 }),
        text({
          text: '[ 습득 시 연락처 ]\n' +
            '본 증을 습득하신 분은 가까운 우체통에 넣어주시거나\n' +
            '아래 연락처로 연락 주시면 감사하겠습니다.\n' +
            '전화 : 02-1234-5678 (인사팀)',
          left: 710, top: 555, width: 400, fontSize: 17, fill: '#475569', lineHeight: 1.5, textAlign: 'center'
        }),
        text({ text: '(주) 한국혁신테크놀로지', left: 670, top: 700, width: 480, fontSize: 22, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center' })
      ]
    },

    // 10. 감사패 / 공로패 서식 (1400 × 1000, 가로형)
    {
      id: 'print-honor-plaque',
      category: 'print',
      name: '감사패 · 공로패',
      note: '가로형 · 이중 골드 프레임 & 프리미엄 서식 (1400 × 1000)',
      width: 1400,
      height: 1000,
      background: '#fffdfa',
      objects: [
        rect({ left: 40, top: 40, width: 1320, height: 920, fill: 'rgba(0,0,0,0)', stroke: '#b45309', strokeWidth: 8, rx: 8 }),
        rect({ left: 55, top: 55, width: 1290, height: 890, fill: 'rgba(0,0,0,0)', stroke: '#d97706', strokeWidth: 2, rx: 6 }),
        rect({ left: 65, top: 65, width: 1270, height: 870, fill: 'rgba(0,0,0,0)', stroke: '#fef3c7', strokeWidth: 1, rx: 4 }),
        icon({ iconName: 'award', left: 630, top: 110, size: 140, fill: '#d97706' }),
        text({
          text: '감  사  패',
          left: 0, top: 260, width: 1400, fontSize: 80, fontWeight: 'bold', fill: '#78350f', textAlign: 'center', charSpacing: 30
        }),
        rect({ left: 580, top: 370, width: 240, height: 4, fill: '#d97706' }),
        text({
          text: '소속 : 디지털혁신본부\n직위 : 수석연구위원\n성명 : 홍  길  동',
          left: 160, top: 410, width: 1080, fontSize: 30, fontWeight: 'bold', fill: '#1e293b', lineHeight: 1.6
        }),
        text({
          text: '귀하는 평소 투철한 사명감과 창의적인 열정으로\n' +
            '본 기관의 디지털 혁신과 정보화 인프라 고도화에 지대한 공헌을 하였으며,\n' +
            '탁월한 리더십과 헌신으로 동료들에게 큰 귀감이 되었기에,\n' +
            '그동안 베풀어주신 노고에 깊은 감사의 마음을 담아 이 패를 드립니다.',
          left: 160, top: 560, width: 1080, fontSize: 28, fill: '#334155', lineHeight: 1.9, textAlign: 'center'
        }),
        text({ text: '2026년 9월 14일', left: 0, top: 760, width: 1400, fontSize: 30, fill: '#451a03', textAlign: 'center' }),
        text({
          text: '한 국 혁 신 진 흥 원  임 직 원  일 동',
          left: 0, top: 830, width: 1400, fontSize: 44, fontWeight: 'bold', fill: '#78350f', textAlign: 'center', charSpacing: 10
        }),
        icon({ iconName: 'award', left: 1070, top: 815, size: 85, fill: '#dc2626' })
      ]
    },
    // ------------------------------------------------------------------------
    // 실무 최다 빈도 서식 12종 신규 추가
    // ------------------------------------------------------------------------

    // 1. 사직서 · 사직원 (표준 사직서 및 업무 인수인계 확인)
    {
      id: 'doc-resignation',
      category: 'doc',
      name: '사직서 · 사직원',
      note: 'A4 세로 · 결재선 & 인수인계 확인 일체형 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '사     직     서',
          left: 90, top: 70, width: 550, fontSize: 48, fontWeight: 'bold', fill: '#0f172a', charSpacing: 16
        }),
        {
          type: 'table',
          left: 640, top: 60,
          rows: 2, cols: 5,
          cellW: 102, cellH: 34,
          fontSize: 16,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '부서장' }, { text: '인사총무' }, { text: '대표이사' }],
            [{ text: '기안\n(인)' }, { text: '확인\n(인)' }, { text: '승인\n(인)' }, { text: '접수\n(인)' }, { text: '결재\n(인)' }]
          ]
        },
        rect({ left: 90, top: 155, width: 1060, height: 2, fill: '#0f172a' }),
        text({ text: '1. 신청인 인적사항', left: 90, top: 175, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 210,
          rows: 4, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '소    속' }, { text: '기획조정실 디지털혁신팀' }, { text: '직    급' }, { text: '선임연구원 (과장급)' }],
            [{ text: '성    명' }, { text: '홍 길 동 (洪吉童)' }, { text: '생년월일' }, { text: '1988년 05월 12일' }],
            [{ text: '입사일자' }, { text: '2019년 03월 01일' }, { text: '퇴직예정일' }, { text: '2026년 10월 31일' }],
            [{ text: '연 락 처' }, { text: '010-1234-5678' }, { text: '주    소' }, { text: '서울특별시 영등포구 여의대로 128' }]
          ]
        },
        text({ text: '2. 사직 사유', left: 90, top: 440, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 475, width: 1060, height: 50, fill: '#f1f5f9', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '구 분 :   [ ■ ] 일신상의 사유(개인사정)     [ □ ] 이직 및 전직     [ □ ] 건강 및 가사     [ □ ] 진학 및 유학     [ □ ] 기타',
          left: 115, top: 489, width: 1010, fontSize: 18, fill: '#1e293b', fontWeight: 'bold'
        }),
        rect({ left: 90, top: 540, width: 1060, height: 180, fill: '#ffffff', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '상기 본인은 상기 기재한 사유로 인하여 부득이하게 사직하고자 하오며,\n' +
            '퇴직일까지 맡은 바 직무를 성실히 수행하고, 회사의 제반 규정에 따라\n' +
            '인수인계 절차를 철저히 이행할 것을 확약합니다.\n\n' +
            '그동안 베풀어 주신 따뜻한 배려와 지도편달에 깊은 감사를 드립니다.',
          left: 120, top: 565, width: 1000, fontSize: 20, fill: '#334155', lineHeight: 1.7
        }),
        text({ text: '3. 업무 인수인계 및 사내 자산 반납 확인', left: 90, top: 745, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 780,
          rows: 3, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 19,
          headerRow: true,
          headerCol: false,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '구분' }, { text: '상세 내역' }, { text: '완료 예정일' }, { text: '확인자 서명' }],
            [{ text: '담당 업무 인계' }, { text: '공공 플랫폼 소스코드 및 운영 매뉴얼 일체' }, { text: '2026. 10. 25.' }, { text: '이인수 선임 (인)' }],
            [{ text: '사내 자산 반납' }, { text: '업무용 노트북, 사원증, 보안토큰, 법인카드' }, { text: '2026. 10. 30.' }, { text: '박총무 담당 (인)' }]
          ]
        },
        rect({ left: 90, top: 960, width: 1060, height: 100, fill: '#fffbeb', rx: 6, stroke: '#fde68a' }),
        text({
          text: '※ 본인은 재직 중 취득한 회사의 영업비밀, 기술자료, 고객정보 및 보안사항에 대하여\n' +
            '퇴직 후에도 제3자에게 일체 누설하거나 부정 사용하지 아니할 것을 엄숙히 서약합니다.',
          left: 120, top: 980, width: 1000, fontSize: 18, fill: '#92400e', lineHeight: 1.6
        }),
        text({
          text: '위와 같은 사유로 사직원을 제출하오니 재가하여 주시기 바랍니다.',
          left: 0, top: 1110, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '2026년   10월   15일',
          left: 0, top: 1180, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '신  청  인 (본인) :    홍    길    동    (인 또는 서명)',
          left: 0, top: 1240, width: 1240, fontSize: 26, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈   대 표 이 사   귀 하',
          left: 0, top: 1370, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 2. 휴가 신청서 · 휴가원
    {
      id: 'doc-leave-request',
      category: 'doc',
      name: '휴가 신청서 · 휴가원',
      note: 'A4 세로 · 연차/반차/경조/병가 표준 서식 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '휴    가    신    청    서',
          left: 90, top: 70, width: 620, fontSize: 44, fontWeight: 'bold', fill: '#0f172a', charSpacing: 14
        }),
        {
          type: 'table',
          left: 730, top: 60,
          rows: 2, cols: 4,
          cellW: 105, cellH: 34,
          fontSize: 16,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '부서장' }, { text: '인사총무' }],
            [{ text: '기안\n(인)' }, { text: '검토\n(인)' }, { text: '승인\n(인)' }, { text: '접수\n(인)' }]
          ]
        },
        rect({ left: 90, top: 155, width: 1060, height: 2, fill: '#0f172a' }),
        text({ text: '1. 신청자 기본 정보', left: 90, top: 175, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 210,
          rows: 2, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '소    속' }, { text: '경영지원본부 인사총무팀' }, { text: '직    위' }, { text: '대리 (사번: 2022-0418)' }],
            [{ text: '성    명' }, { text: '김 휴 가 (인/서명)' }, { text: '비상연락처' }, { text: '010-9876-5432' }]
          ]
        },
        text({ text: '2. 휴가 신청 세부 내역', left: 90, top: 345, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 380,
          rows: 5, cols: 4,
          cellW: 265, cellH: 58,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '휴가 구분' }, { text: '[ ■ ] 연차     [ □ ] 오전반차     [ □ ] 오후반차\n[ □ ] 경조휴가   [ □ ] 공가/병가   [ □ ] 포상휴가' }, { text: '신청 일수' }, { text: '총  3  일간' }],
            [{ text: '휴가 기간' }, { text: '2026. 10. 21.(수) ~ 2026. 10. 23.(금)' }, { text: '업무대행자' }, { text: '박동료 대리 (인/서명)' }],
            [{ text: '휴가 사유' }, { text: '개인 사정 및 정기 재충전을 위한 연차 유급휴가 사용' }, { text: '행 선 지' }, { text: '국내 (비상연락 유지)' }],
            [{ text: '연차 현황' }, { text: '발생일수: 15일  |  기사용: 4일  |  금번신청: 3일  |  잔여일수: 8일' }, { text: '증빙 서류' }, { text: '해당사항 없음' }],
            [{ text: '비상연락망' }, { text: '전화: 010-9876-5432  |  이메일: holiday@company.com' }, { text: '복귀 예정일' }, { text: '2026년 10월 26일(월)' }]
          ]
        },
        rect({ left: 90, top: 700, width: 1060, height: 130, fill: '#f8fafc', rx: 6, stroke: '#e2e8f0' }),
        text({
          text: '※ 휴가 사용 유의사항:\n' +
            '1. 연차 유급휴가는 원활한 업무 분담을 위해 최소 3일 전에 신청하여 주시기 바랍니다.\n' +
            '2. 경조휴가, 병가 등 특별휴가는 증빙서류(청첩장, 사망확인서, 진단서 등)를 첨부해야 합니다.\n' +
            '3. 긴급 업무 연락에 차질이 없도록 비상연락체계를 상시 유지하시기 바랍니다.',
          left: 120, top: 720, width: 1000, fontSize: 18, fill: '#64748b', lineHeight: 1.65
        }),
        text({
          text: '근로기준법 제60조 및 사내 취업규칙에 의거하여 위와 같이 휴가를 신청하오니\n허가하여 주시기 바랍니다.',
          left: 0, top: 880, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', lineHeight: 1.6
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 980, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '신  청  인 :    김    휴    가    (인 또는 서명)',
          left: 0, top: 1050, width: 1240, fontSize: 26, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈   대 표 이 사   귀 하',
          left: 0, top: 1180, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 3. 시말서 · 경위서 · 사유서
    {
      id: 'doc-apology-letter',
      category: 'doc',
      name: '시말서 · 사유서 · 경위서',
      note: 'A4 세로 · 사고 경위 & 재발방지 다짐서 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '시   말   서  (경 위 서)',
          left: 90, top: 70, width: 680, fontSize: 44, fontWeight: 'bold', fill: '#0f172a', charSpacing: 10
        }),
        {
          type: 'table',
          left: 790, top: 60,
          rows: 2, cols: 3,
          cellW: 120, cellH: 34,
          fontSize: 16,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '담당' }, { text: '팀장' }, { text: '부서장' }],
            [{ text: '기안\n(인)' }, { text: '검토\n(인)' }, { text: '확인\n(인)' }]
          ]
        },
        rect({ left: 90, top: 155, width: 1060, height: 2, fill: '#0f172a' }),
        text({ text: '1. 작성자 인적사항', left: 90, top: 175, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 210,
          rows: 2, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '소    속' }, { text: '공공사업본부 IT인프라팀' }, { text: '직    위' }, { text: '과장 (사번: 2019-0112)' }],
            [{ text: '성    명' }, { text: '이 경 위' }, { text: '입사일자' }, { text: '2019년 02월 15일' }]
          ]
        },
        text({ text: '2. 사고 / 사건 개요', left: 90, top: 345, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 380,
          rows: 2, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '발생 일시' }, { text: '2026년 09월 10일(목) 15:20경' }, { text: '발생 장소' }, { text: '본관 4층 전산개발실' }],
            [{ text: '관련 건명' }, { text: '폐쇄망 업무용 단말기 비인가 USB 일시 연결 건' }, { text: '피해 유무' }, { text: '데이터 유출 0건 (보안관제 확인)' }]
          ]
        },
        text({ text: '3. 발생 경위 및 원인 분석', left: 90, top: 515, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 550, width: 1060, height: 260, fill: '#ffffff', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '[발생 사실 및 세부 경위]\n' +
            '2026년 09월 10일 15시 20분경, 납품 패키지 빌드 파일의 긴급 배포 테스트 과정에서\n' +
            '보안 반출입 정식 승인 절차를 거치지 아니하고 일반 USB 저장장치를 업무용 내부 단말기에\n' +
            '일시 연결하는 사내 전산망 정보보안 지침 위반 행위가 발생하였습니다.\n\n' +
            '[발생 원인]\n' +
            '긴급한 납품 일정을 준수하려는 조급한 마음에 보안 규정을 소홀히 여긴 본인의\n' +
            '부주의와 안전 불감증에 기인한 명백한 과실입니다.',
          left: 120, top: 575, width: 1000, fontSize: 19, fill: '#334155', lineHeight: 1.65
        }),
        text({ text: '4. 조치 결과 및 재발 방지 대책', left: 90, top: 835, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 870, width: 1060, height: 180, fill: '#f8fafc', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '1. 발생 즉시 정보보안팀 자진 신고 및 백신 정밀 전수 검사 완료 (악성코드 감염 없음 확인)\n' +
            '2. 사내 정보보안 실천 수칙 전면 재숙지 및 사이버 보안 교육 특별 이수 완료\n' +
            '3. 향후 어떠한 경우에도 정식 보안 승인 절차를 엄격히 준수할 것을 다짐하며 재발 방지 확약',
          left: 120, top: 895, width: 1000, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        text({
          text: '본인은 상기 본인의 과실에 대하여 깊이 자책하고 반성하며,\n' +
            '향후 동일한 사태가 재발하지 않도록 규정을 철저히 준수할 것을 서약합니다.\n' +
            '이에 시말서를 작성하여 제출하오며 어떠한 사규상의 처분도 감수하겠습니다.',
          left: 0, top: 1090, width: 1240, fontSize: 22, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', lineHeight: 1.65
        }),
        text({
          text: '2026년   09월   12일',
          left: 0, top: 1200, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '작  성  자 (본인) :    이    경    위    (인 또는 서명)',
          left: 0, top: 1270, width: 1240, fontSize: 26, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈   대 표 이 사   귀 하',
          left: 0, top: 1400, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 4. 재직증명서 · 공식 기관장 서식
    {
      id: 'doc-employment-cert',
      category: 'doc',
      name: '재직증명서 · 공식 표준',
      note: 'A4 세로 · 금융기관/관공서 제출용 표준 증명서 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        rect({ left: 60, top: 60, width: 1120, height: 1634, fill: 'rgba(0,0,0,0)', stroke: '#1e293b', strokeWidth: 3 }),
        rect({ left: 72, top: 72, width: 1096, height: 1610, fill: 'rgba(0,0,0,0)', stroke: '#94a3b8', strokeWidth: 1 }),
        text({ text: '문서번호 : 제 2026 - A0892 호', left: 110, top: 110, width: 500, fontSize: 20, fill: '#475569' }),
        text({ text: '발급일자 : 2026년 10월 14일', left: 630, top: 110, width: 500, fontSize: 20, fill: '#475569', textAlign: 'right' }),
        text({
          text: '재    직    증    명    서',
          left: 0, top: 180, width: 1240, fontSize: 54, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 20
        }),
        rect({ left: 470, top: 260, width: 300, height: 4, fill: '#0f172a' }),
        text({ text: '1. 인적 사항', left: 110, top: 310, width: 1020, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 110, top: 345,
          rows: 2, cols: 4,
          cellW: 255, cellH: 56,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '성        명' }, { text: '홍  길  동 (洪吉童)' }, { text: '주민등록번호' }, { text: '880512 - 1******' }],
            [{ text: '주        소' }, { text: '서울특별시 영등포구 여의대로 128 (여의도동, 파크타워 1201호)' }, { text: '연  락  처' }, { text: '010-1234-5678' }]
          ]
        },
        text({ text: '2. 재직 사항', left: 110, top: 490, width: 1020, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 110, top: 525,
          rows: 3, cols: 4,
          cellW: 255, cellH: 56,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '소속 / 부서' }, { text: '디지털행정혁신단 플랫폼개발팀' }, { text: '직        위' }, { text: '수석연구원 (차장급)' }],
            [{ text: '재 직  기 간' }, { text: '2019년 04월 01일 ~ 현재 재직 중 (총 7년 6개월)' }, { text: '고 용  형 태' }, { text: '정규직 (상근직)' }],
            [{ text: '담 당  업 무' }, { text: '공공 클라우드 및 행정 솔루션 시스템 아키텍처 총괄' }, { text: '사 사  번' }, { text: 'DE-20190401' }]
          ]
        },
        text({ text: '3. 발급 용도', left: 110, top: 730, width: 1020, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 110, top: 765,
          rows: 1, cols: 2,
          cellW: 510, cellH: 56,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '제  출  용  도' }, { text: '금융기관 제출용 (주택담보대출 심사 및 신용평가 제출)' }]
          ]
        },
        text({
          text: '위 사람은 상기와 같이 당사에 성실히 재직 중임을\n관계 법령 및 사규에 의거하여 정히 증명합니다.',
          left: 0, top: 960, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', lineHeight: 2.1
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 1120, width: 1240, fontSize: 28, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈',
          left: 0, top: 1220, width: 1240, fontSize: 40, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '대 표 이 사    강    대    한',
          left: 0, top: 1290, width: 1240, fontSize: 42, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 8
        }),
        rect({ left: 880, top: 1255, width: 100, height: 100, fill: 'rgba(239, 68, 68, 0.08)', stroke: '#dc2626', strokeWidth: 3, rx: 50 }),
        text({
          text: '대한엔터\n대표이사\n지    인',
          left: 880, top: 1270, width: 100, fontSize: 18, fontWeight: 'bold', fill: '#dc2626', textAlign: 'center', lineHeight: 1.2
        }),
        text({
          text: '※ 본 증명서는 발급일로부터 3개월간 유효하며, 위·변조 시 형법 제231조에 의해 처벌받을 수 있습니다.\n' +
            '발급 담당 : 경영지원본부 인사총무팀 (☎ 02-1234-5670  |  서울특별시 영등포구 여의대로 128)',
          left: 110, top: 1540, width: 1020, fontSize: 18, fill: '#64748b', textAlign: 'center', lineHeight: 1.6
        })
      ]
    },

    // 5. 위임장 · 법정 대리인
    {
      id: 'doc-power-of-attorney',
      category: 'doc',
      name: '위임장 · 대리인 표준',
      note: 'A4 세로 · 행정/계약/민원 대리권 수여 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '위     임     장',
          left: 0, top: 80, width: 1240, fontSize: 54, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 24
        }),
        rect({ left: 470, top: 160, width: 300, height: 4, fill: '#0f172a' }),
        text({ text: '1. 위임하는 사람 (위임인)', left: 90, top: 200, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 235,
          rows: 2, cols: 4,
          cellW: 265, cellH: 54,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '성        명' }, { text: '홍 길 동 (인감도장 날인)' }, { text: '주민등록번호' }, { text: '850314 - 1******' }],
            [{ text: '연  락  처' }, { text: '010-1234-5678' }, { text: '주        소' }, { text: '서울특별시 마포구 마포대로 89, 101동 502호' }]
          ]
        },
        text({ text: '2. 위임받는 사람 (수임인 / 대리인)', left: 90, top: 380, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 415,
          rows: 2, cols: 4,
          cellW: 265, cellH: 54,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '성        명' }, { text: '김 대 리 (서명)' }, { text: '주민등록번호' }, { text: '920721 - 2******' }],
            [{ text: '위임인과의 관계' }, { text: '직원 (사내 업무대리인)' }, { text: '주        소' }, { text: '경기도 성남시 분당구 판교역로 145' }]
          ]
        },
        text({ text: '3. 위임할 권한 및 업무 범위', left: 90, top: 560, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 595, width: 1060, height: 260, fill: '#ffffff', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '본인은 상기 대리인에게 아래 각 호에 관한 일체의 권한을 행사하도록 위임합니다.\n\n' +
            '1. 2026년 공공 데이터 플랫폼 구축 사업 관련 계약 체결 및 납품 검수 서류 제출·수령권\n' +
            '2. 조달청 나라장터 입찰 참가 자격 등록 및 제증명 서류 대리 발급 신청·수령권\n' +
            '3. 기타 상기 행위에 수반되는 일체의 행정 민원 신청 및 보정·취하 등에 관한 제반 권한',
          left: 120, top: 620, width: 1000, fontSize: 20, fill: '#334155', lineHeight: 1.8
        }),
        rect({ left: 90, top: 880, width: 1060, height: 110, fill: '#f8fafc', rx: 6, stroke: '#e2e8f0' }),
        text({
          text: '※ 위임 유효기간 : 2026년 10월 01일 ~ 2026년 12월 31일 (3개월간)\n' +
            '※ 첨부 서류 : 위임인 인감증명서(또는 본인서명사실확인서) 1부, 대리인 신분증 사본 1부.',
          left: 120, top: 905, width: 1000, fontSize: 19, fill: '#475569', lineHeight: 1.65
        }),
        text({
          text: '상기 대리인에게 상기 위임 사항에 관한 일체의 권한을 정히 위임합니다.',
          left: 0, top: 1050, width: 1240, fontSize: 26, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 1130, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '위  임  인 (본인) :    홍    길    동',
          left: 360, top: 1210, width: 450, fontSize: 26, fontWeight: 'bold', fill: '#0f172a'
        }),
        rect({ left: 740, top: 1195, width: 80, height: 60, fill: 'rgba(239, 68, 68, 0.08)', stroke: '#dc2626', strokeWidth: 2 }),
        text({ text: '인감\n날인', left: 740, top: 1205, width: 80, fontSize: 16, fill: '#dc2626', textAlign: 'center' }),
        text({
          text: '귀        중',
          left: 0, top: 1350, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 10
        })
      ]
    },

    // 6. 보안 서약서 · 정보보안 및 비밀유지 각서
    {
      id: 'doc-security-pledge',
      category: 'doc',
      name: '보안 서약서 · 비밀유지 각서',
      note: 'A4 세로 · 입사/외주용역 필수 정보보안 서약 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '보   안   서   약   서',
          left: 0, top: 70, width: 1240, fontSize: 48, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 16
        }),
        text({
          text: '(정보보호 · 개인정보보호 및 영업비밀 유지 서약서)',
          left: 0, top: 140, width: 1240, fontSize: 22, fill: '#475569', textAlign: 'center'
        }),
        rect({ left: 470, top: 180, width: 300, height: 4, fill: '#0f172a' }),
        text({ text: '1. 서약자 인적사항', left: 90, top: 215, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 250,
          rows: 2, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '소    속' }, { text: '공공데이터사업단 플랫폼개발팀' }, { text: '직    위' }, { text: '선임연구원' }],
            [{ text: '성    명' }, { text: '홍 길 동' }, { text: '생년월일' }, { text: '1990년 08월 24일' }]
          ]
        },
        text({ text: '2. 보안 준수 서약 조항', left: 90, top: 385, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 420, width: 1060, height: 600, fill: '#ffffff', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '본인은 회사의 업무를 수행함에 있어 다음 각 호의 보안 수칙을 성실히 준수할 것을 서약합니다.\n\n' +
            '제1조 (영업비밀 유지 의무)\n' +
            '재직 중은 물론 퇴직 후에도 직무상 지득한 회사의 기술정보, 경영전략, 소스코드, 설계문서 등\n' +
            '일체의 영업비밀을 회사의 사전 서면 승인 없이 제3자에게 누설하거나 유출하지 아니한다.\n\n' +
            '제2조 (전산망 및 폐쇄망 보안 준수)\n' +
            '회사의 인가 없이 개인 소유 단말기, 미인가 저장매체(USB, 외장하드)를 업무망에 연결하지 않으며,\n' +
            '망분리 지침 및 무선 네트워크 연결 금지 규정을 엄격히 준수한다.\n\n' +
            '제3조 (개인정보보호법 준수)\n' +
            '업무 수행 과정에서 처리하는 모든 개인정보를 목적 외로 이용·제공하거나 사외로 반출하지 않는다.\n\n' +
            '제4조 (정보자산 무단반출 금지)\n' +
            '회사의 모든 개발 산출물, 지식재산권, 연구데이터를 사적 이익을 위해 복제·전송하지 아니한다.\n\n' +
            '제5조 (손해배상 및 법적 책임)\n' +
            '상기 서약 사항을 위반하여 회사에 유·무형의 손해를 입힌 경우, 부정경쟁방지 및 영업비밀보호에\n' +
            '관한 법률 등 관련 법령에 의거 민·형사상의 모든 손해배상 책임을 질 것을 서약합니다.',
          left: 120, top: 445, width: 1000, fontSize: 18.5, fill: '#334155', lineHeight: 1.65
        }),
        text({
          text: '본인은 위의 각 조항을 충분히 숙지하였으며, 이를 성실히 준수할 것을 엄숙히 서약합니다.',
          left: 0, top: 1060, width: 1240, fontSize: 23, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 1140, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '서  약  자 (본인) :    홍    길    동    (자필 서명)',
          left: 0, top: 1210, width: 1240, fontSize: 26, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center'
        }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈   대 표 이 사   귀 하',
          left: 0, top: 1340, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 7. 물품 납품 및 검수 확인서 (검수조서)
    {
      id: 'doc-inspection-acceptance',
      category: 'doc',
      name: '물품 납품 및 검수 확인서',
      note: 'A4 세로 · 납품 내역 및 합격 검수조서 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '물품 납품 및 검수 완료 확인서',
          left: 90, top: 70, width: 620, fontSize: 38, fontWeight: 'bold', fill: '#0f172a'
        }),
        {
          type: 'table',
          left: 730, top: 60,
          rows: 2, cols: 4,
          cellW: 105, cellH: 34,
          fontSize: 16,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '검수자' }, { text: '담당' }, { text: '팀장' }, { text: '검수관' }],
            [{ text: '김검수\n(인)' }, { text: '이담당\n(인)' }, { text: '박팀장\n(인)' }, { text: '최검수\n(인)' }]
          ]
        },
        rect({ left: 90, top: 155, width: 1060, height: 2, fill: '#0f172a' }),
        text({ text: '1. 계약 및 납품 개요', left: 90, top: 175, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 210,
          rows: 3, cols: 4,
          cellW: 265, cellH: 52,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#f8fafc',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '계약(발주)번호' }, { text: '제 2026-PO-0482 호' }, { text: '납품 일자' }, { text: '2026년 10월 14일' }],
            [{ text: '계  약  건  명' }, { text: '2026년도 폐쇄망 업무용 단일 실행 소프트웨어 및 전산장비 납품' }, { text: '납품 장소' }, { text: '본관 3층 통합전산실' }],
            [{ text: '공 급 업 체 명' }, { text: '(주)한국디지털시스템 (대표: 이공급)' }, { text: '사업자등록번호' }, { text: '120-81-45678' }]
          ]
        },
        text({ text: '2. 납품 품목 상세 및 검수 결과', left: 90, top: 395, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        {
          type: 'table',
          left: 90, top: 430,
          rows: 6, cols: 6,
          cellW: 176, cellH: 52,
          fontSize: 19,
          headerRow: true,
          headerCol: false,
          headerFill: '#f1f5f9',
          borderColor: '#94a3b8',
          cells: [
            [{ text: '순번' }, { text: '품명 및 규격' }, { text: '수량' }, { text: '단위' }, { text: '공급가액' }, { text: '검수결과' }],
            [{ text: '1' }, { text: '단일 실행 오프라인 이미지편집기 (HTML)' }, { text: '1' }, { text: '식' }, { text: '₩ 18,000,000' }, { text: '합격' }],
            [{ text: '2' }, { text: '공공 표준 행정 서식 50종 템플릿 팩' }, { text: '1' }, { text: '식' }, { text: '₩ 6,500,000' }, { text: '합격' }],
            [{ text: '3' }, { text: 'PPTX 및 HWPX 변환 패키징 모듈' }, { text: '1' }, { text: '식' }, { text: '₩ 5,000,000' }, { text: '합격' }],
            [{ text: '4' }, { text: '오프라인 인공지능 얼굴검출 엔진' }, { text: '1' }, { text: '식' }, { text: '₩ 3,000,000' }, { text: '합격' }],
            [{ text: '합계' }, { text: '총 4개 품목 정히 납품 완료' }, { text: '4' }, { text: '건' }, { text: '₩ 32,500,000' }, { text: '전체 합격' }]
          ]
        },
        text({ text: '3. 검수관 종합 의견', left: 90, top: 770, width: 1060, fontSize: 22, fontWeight: 'bold', fill: '#1e293b' }),
        rect({ left: 90, top: 805, width: 1060, height: 160, fill: '#f8fafc', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '상기 납품 품목에 대하여 수량 대조, 외관 무결성, 오프라인 환경 100% 정상 구동 여부,\n' +
            'PPTX 및 HWPX 표준 문서 변환 호환성 테스트를 엄격히 실시한 결과,\n' +
            '계약 규격서 및 과업지시서의 제반 요구조건을 완벽히 충족하여 전 품목 \'합격\' 판정하고 정히 인수함.',
          left: 120, top: 835, width: 1000, fontSize: 20, fill: '#334155', lineHeight: 1.7
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 1010, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '납 품 자 (공급사) :   (주)한국디지털시스템   대표이사   이   공   급   (인/서명)',
          left: 150, top: 1080, width: 940, fontSize: 23, fontWeight: 'bold', fill: '#0f172a'
        }),
        text({
          text: '검 수 관 (인수자) :   디지털혁신단   선임연구원   김   검   수   (인/서명)',
          left: 150, top: 1140, width: 940, fontSize: 23, fontWeight: 'bold', fill: '#0f172a'
        }),
        text({
          text: '입 회 관 (확인자) :   인프라운영팀   팀        장   박   입   회   (인/서명)',
          left: 150, top: 1200, width: 940, fontSize: 23, fontWeight: 'bold', fill: '#0f172a'
        })
      ]
    },

    // 8. 표준 근로계약서 · 고용노동부 준용
    {
      id: 'doc-labor-contract',
      category: 'doc',
      name: '표준 근로계약서 · 정규직',
      note: 'A4 세로 · 고용노동부 표준 7대 조항 반영 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        text({
          text: '표   준   근   로   계   약   서',
          left: 0, top: 70, width: 1240, fontSize: 46, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 14
        }),
        rect({ left: 470, top: 145, width: 300, height: 4, fill: '#0f172a' }),
        text({
          text: '주식회사 대한엔터프라이즈(이하 "사업주"라 함)과 근로자 홍길동(이하 "근로자"라 함)은\n' +
            '상호 합의에 따라 다음과 같이 근로계약을 체결하고 이를 성실히 준수할 것을 약정한다.',
          left: 90, top: 175, width: 1060, fontSize: 20, fill: '#334155', lineHeight: 1.6
        }),
        rect({ left: 90, top: 240, width: 1060, height: 750, fill: '#ffffff', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '1. 근로계약기간 : 2026년 11월 01일부터 기간의 정함이 없는 근로계약을 체결한다.\n\n' +
            '2. 근무장소 및 업무내용\n' +
            '  • 근무장소 : 본사 (서울특별시 영등포구 여의대로 128)\n' +
            '  • 담당업무 : 소프트웨어 개발 및 클라우드 시스템 아키텍처 구축\n\n' +
            '3. 소정근로시간\n' +
            '  • 09시 00분부터 18시 00분까지 (휴게시간: 12시 00분 ~ 13시 00분 / 1일 8시간, 주 40시간)\n\n' +
            '4. 근무일 및 주휴일\n' +
            '  • 매주 월요일부터 금요일까지(주 5일) 근무하며, 주휴일은 매주 일요일로 한다.\n\n' +
            '5. 임  금\n' +
            '  • 월  급 : 일금 삼백팔십만원정 (₩3,800,000 / 기본급 및 제수당 포함)\n' +
            '  • 임금지급일 : 매월 25일 (응당일이 공휴일인 경우 전일 지급, 근로자 명의 계좌 입금)\n\n' +
            '6. 연차유급휴가 : 근로기준법 제60조에서 정하는 바에 따라 유급휴가를 부여한다.\n\n' +
            '7. 사회보험 적용 : 국민연금, 건강보험, 고용보험, 산업재해보상보험에 가입한다.\n\n' +
            '8. 기  타 : 본 계약서에 명시되지 아니한 사항은 근로기준법 및 사내 취업규칙에 따른다.',
          left: 120, top: 265, width: 1000, fontSize: 19, fill: '#1e293b', lineHeight: 1.65
        }),
        text({
          text: '본 계약 체결을 증명하기 위하여 계약서 2부를 작성하여 "사업주"와 "근로자"가\n각각 서명 또는 날인한 후 1부씩 보관한다.',
          left: 0, top: 1020, width: 1240, fontSize: 21, fill: '#334155', textAlign: 'center', lineHeight: 1.6
        }),
        text({
          text: '2026년   10월   14일',
          left: 0, top: 1100, width: 1240, fontSize: 24, fill: '#1e293b', textAlign: 'center'
        }),
        rect({ left: 90, top: 1150, width: 515, height: 180, fill: '#f8fafc', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '[ 사 업 주 ]\n' +
            '• 사업체명 : (주)대한엔터프라이즈\n' +
            '• 주    소 : 서울특별시 영등포구 여의대로 128\n' +
            '• 대 표 자 : 강   대   한   (직인 날인)',
          left: 115, top: 1175, width: 465, fontSize: 20, fill: '#0f172a', lineHeight: 1.65
        }),
        rect({ left: 635, top: 1150, width: 515, height: 180, fill: '#f8fafc', rx: 6, stroke: '#cbd5e1' }),
        text({
          text: '[ 근 로 자 ]\n' +
            '• 성    명 : 홍   길   동   (서명 또는 인)\n' +
            '• 주민등록번호 : 880512 - 1******\n' +
            '• 주    소 : 서울특별시 마포구 마포대로 89',
          left: 660, top: 1175, width: 465, fontSize: 20, fill: '#0f172a', lineHeight: 1.65
        })
      ]
    },

    // 9. 시설 점검 및 공사 안내문 (승강기/단수/정전)
    {
      id: 'promo-facility-notice',
      category: 'promo',
      name: '시설 점검 및 공사 안내문',
      note: 'A4 세로 · 승강기/단수/정전 실물 공지문 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        gradientRect({ left: 0, top: 0, width: 1240, height: 230, gradient: DEEP }),
        text({
          text: '안  내  말  씀',
          left: 0, top: 40, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#38bdf8', textAlign: 'center', charSpacing: 10
        }),
        text({
          text: '승강기 정기 점검 및 운행 중단 안내',
          left: 0, top: 105, width: 1240, fontSize: 56, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        rect({ left: 90, top: 270, width: 1060, height: 180, fill: '#fef2f2', rx: 12, stroke: '#ef4444', strokeWidth: 2 }),
        icon({ iconName: 'clock', left: 130, top: 310, size: 90, fill: '#dc2626' }),
        text({
          text: '【 점 검 및 운 행 중 단  일 시 】',
          left: 250, top: 300, width: 880, fontSize: 26, fontWeight: 'bold', fill: '#991b1b'
        }),
        text({
          text: '2026년 10월 22일(목)  09:00 ~ 13:00 (4시간)',
          left: 250, top: 350, width: 880, fontSize: 38, fontWeight: 'bold', fill: '#dc2626'
        }),
        text({ text: '■ 점검 개요 및 작업 내용', left: 90, top: 490, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        {
          type: 'table',
          left: 90, top: 530,
          rows: 3, cols: 4,
          cellW: 265, cellH: 60,
          fontSize: 21,
          headerRow: false,
          headerCol: true,
          headerFill: '#f1f5f9',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '점 검 대 상' }, { text: '본관 1호기 ~ 4호기 승객용 승강기 전면' }, { text: '점 검 기 관' }, { text: '한국승강기안전공단 정밀검사팀' }],
            [{ text: '점 검 항 목' }, { text: '권상기 브레이크 제동력, 와이어로프 마모도, 비상호출장치 전수 점검' }, { text: '작 업 인 원' }, { text: '공인 기술자 6명 투입' }],
            [{ text: '운 행 정 지' }, { text: '점검 시간 중 해당 승강기 전면 탑승 불가' }, { text: '대 체 수 단' }, { text: '중앙 및 비상 계단 이용' }]
          ]
        },
        text({ text: '■ 입주민 및 임직원 협조 요청 사항', left: 90, top: 760, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 800, width: 1060, height: 260, fill: '#f8fafc', rx: 8, stroke: '#cbd5e1' }),
        text({
          text: '1. 점검 시간 중에는 안전사고 예방을 위해 승강기 문이 강제로 열리지 않도록 통제됩니다.\n\n' +
            '2. 거동이 불편하신 분이나 무거운 짐을 이동하셔야 하는 분께서는 사전에 이동을 완료해 주시기 바랍니다.\n\n' +
            '3. 안전 펜스가 설치된 승강기 출입문 주위로는 어린이와 보행자의 접근을 삼가 주시기 바랍니다.\n\n' +
            '4. 신속하고 안전한 점검을 통해 조속히 운행을 재개할 수 있도록 최선을 다하겠습니다.',
          left: 130, top: 830, width: 980, fontSize: 21, fill: '#334155', lineHeight: 1.7
        }),
        rect({ left: 90, top: 1100, width: 1060, height: 110, fill: '#f0fdf4', rx: 8, stroke: '#86efac' }),
        text({
          text: '비상 연락망 및 문의처 :\n관리사무소 방재종합상황실 (☎ 02-0000-1119  |  내선 104번)',
          left: 130, top: 1125, width: 980, fontSize: 22, fontWeight: 'bold', fill: '#166534', lineHeight: 1.5
        }),
        text({
          text: '2026년   10월   16일',
          left: 0, top: 1260, width: 1240, fontSize: 26, fill: '#334155', textAlign: 'center'
        }),
        text({
          text: '한 국 혁 신 빌 딩   관 리 사 무 소 장',
          left: 0, top: 1330, width: 1240, fontSize: 42, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 10. 외부차량 주차금지 및 방문차량 등록 안내문
    {
      id: 'promo-parking-notice',
      category: 'promo',
      name: '외부차량 주차금지 및 등록 안내',
      note: 'A4 세로 · 주차장/정문 공식 경고 공지문 (1240 × 1754)',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        rect({ left: 0, top: 0, width: 1240, height: 210, fill: '#dc2626' }),
        text({
          text: '경    고  (WARNING)',
          left: 0, top: 35, width: 1240, fontSize: 30, fontWeight: 'bold', fill: '#fef08a', textAlign: 'center', charSpacing: 8
        }),
        text({
          text: '외부차량 무단 주차 금지',
          left: 0, top: 95, width: 1240, fontSize: 62, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 4
        }),
        rect({ left: 90, top: 250, width: 1060, height: 160, fill: '#fef2f2', rx: 12, stroke: '#b91c1c', strokeWidth: 2 }),
        text({
          text: '본 주차장은 입주사 임직원 및 공식 방문객 전용 주차 공간입니다.\n' +
            '사전 등록되지 않은 외부차량의 무단 주차 시 즉시 견인 조치 및 주차 스티커가 부착됩니다.\n' +
            '(견인료 및 보관료 전액 차주 부담)',
          left: 120, top: 275, width: 1000, fontSize: 24, fontWeight: 'bold', fill: '#991b1b', lineHeight: 1.6, textAlign: 'center'
        }),
        text({ text: '■ 주차장 이용 및 방문차량 등록 수칙', left: 90, top: 450, width: 1060, fontSize: 26, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 495, width: 330, height: 260, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({ text: '[ 1단계 ]', left: 120, top: 525, width: 270, fontSize: 20, fontWeight: 'bold', fill: '#2563eb' }),
        text({ text: '방문차량 등록', left: 120, top: 560, width: 270, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '1층 안내데스크에서 방문 목적 확인 후 2시간 무료 주차 등록', left: 120, top: 610, width: 270, fontSize: 18, fill: '#475569', lineHeight: 1.6 }),

        rect({ left: 455, top: 495, width: 330, height: 260, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({ text: '[ 2단계 ]', left: 485, top: 525, width: 270, fontSize: 20, fontWeight: 'bold', fill: '#d97706' }),
        text({ text: '요금 정산', left: 485, top: 560, width: 270, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '2시간 초과 시 10분당 1,000원 부과 (무인 사전 정산기 카드 결제)', left: 485, top: 610, width: 270, fontSize: 18, fill: '#475569', lineHeight: 1.6 }),

        rect({ left: 820, top: 495, width: 330, height: 260, fill: '#f8fafc', rx: 12, stroke: '#e2e8f0', strokeWidth: 1.5 }),
        text({ text: '[ 3단계 ]', left: 850, top: 525, width: 270, fontSize: 20, fontWeight: 'bold', fill: '#dc2626' }),
        text({ text: '단속 및 견인', left: 850, top: 560, width: 270, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        text({ text: '미등록 무단 주차 차량 발견 즉시 관할 구청 견인 신고 조치', left: 850, top: 610, width: 270, fontSize: 18, fill: '#475569', lineHeight: 1.6 }),

        text({ text: '■ 24시간 CCTV 영상 상시 녹화 안내', left: 90, top: 800, width: 1060, fontSize: 24, fontWeight: 'bold', fill: '#0f172a' }),
        rect({ left: 90, top: 840, width: 1060, height: 180, fill: '#f8fafc', rx: 8, stroke: '#cbd5e1' }),
        text({
          text: '• 설치 목적 : 시설물 안전 관리, 화재 예방, 무단 주차 및 차량 도난/파손 방지\n' +
            '• 촬영 범위 : 지하 1층 ~ 지하 3층 전 주차 구역 및 진출입로 (총 32대 가동 중)\n' +
            '• 관리 부서 : 방재보안팀 (CCTV 영상은 개인정보보호법에 의거 30일 보관 후 자동 파기)',
          left: 130, top: 870, width: 980, fontSize: 20, fill: '#334155', lineHeight: 1.8
        }),
        rect({ left: 90, top: 1060, width: 1060, height: 110, fill: '#eff6ff', rx: 8, stroke: '#bfdbfe' }),
        text({
          text: '주차장 관리실 문의 :\n주차관제상황실 ☎ 02-0000-2222 (내선 201번)',
          left: 130, top: 1085, width: 980, fontSize: 22, fontWeight: 'bold', fill: '#1e40af', lineHeight: 1.5
        }),
        text({
          text: '한 국 혁 신 타 워   주 차 관 리 사 무 소',
          left: 0, top: 1260, width: 1240, fontSize: 38, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 4
        })
      ]
    },

    // 1. 사내 임직원 생일 축하 카드 (정사각 1080×1080)
    {
      id: 'promo-birthday-corp',
      category: 'promo',
      name: '사내 임직원 생일 축하 카드',
      note: '정사각 1080 × 1080 · 파스텔 웜크림 & 축하 일러스트',
      width: 1080,
      height: 1080,
      background: '#fffdf5',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#fffdf5' }),
        // 상단 장식 프레임
        rect({ left: 30, top: 30, width: 1020, height: 1020, fill: '#ffffff', rx: 28, stroke: '#fef08a', strokeWidth: 2 }),
        gradientRect({ left: 30, top: 30, width: 1020, height: 140, gradient: WARM, rx: 28 }),
        // 폭죽 & 풍선 일러스트
        figure({ figureName: 'artConfetti', left: 70, top: 45, size: 110 }),
        figure({ figureName: 'artBalloons', left: 900, top: 45, size: 110 }),
        icon({ iconName: 'crown', left: 510, top: 50, size: 48, fill: '#fef08a' }),
        text({
          text: 'HAPPY BIRTHDAY!',
          left: 40, top: 100, width: 1000, fontSize: 38, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '○○○ 님의 생일을 진심으로 축하합니다! 🎉',
          left: 60, top: 195, width: 960, fontSize: 34, fontWeight: 'bold', fill: '#1e293b', textAlign: 'center'
        }),
        // 생일자 사진 슬롯 & 테두리
        rect({ left: 360, top: 255, width: 360, height: 360, fill: '#f8fafc', rx: 20, stroke: '#f59e0b', strokeWidth: 3 }),
        slot({ left: 365, top: 260, width: 350, height: 350, label: '생일자 사진을 넣어주세요' }),
        // 좌우 일러스트 장식
        figure({ figureName: 'artGiftBox', left: 140, top: 380, size: 130 }),
        figure({ figureName: 'artCupcake', left: 810, top: 380, size: 130 }),
        icon({ iconName: 'sparkles', left: 290, top: 270, size: 44, fill: '#f59e0b' }),
        icon({ iconName: 'sparkles', left: 745, top: 270, size: 44, fill: '#f59e0b' }),
        // 축하 메시지 카드
        rect({ left: 90, top: 650, width: 900, height: 230, fill: '#fefce8', rx: 18, stroke: '#fde047', strokeWidth: 1.5 }),
        text({
          text: '“언제나 열정과 긍정적인 에너지로 팀에 큰 힘이 되어주셔서 깊이 감사드립니다.\n\n' +
            '오늘 하루 세상에서 가장 행복하고 특별한 시간 보내시길 바라며,\n' +
            '앞으로의 모든 날에도 건강과 빛나는 행운이 가득하기를 온 마음으로 응원합니다! ✨”',
          left: 120, top: 685, width: 840, fontSize: 22, fill: '#334155', textAlign: 'center', lineHeight: 1.6
        }),
        // 혜택 및 부서 서명
        rect({ left: 90, top: 905, width: 900, height: 85, fill: '#fff7ed', rx: 14, stroke: '#fdba74' }),
        icon({ iconName: 'gift', left: 120, top: 928, size: 40, fill: '#ea580c' }),
        text({
          text: '🎁 임직원 생일 복지 혜택 : 축하 상품권 10만원 & 당일 오후 유급 반차 지급',
          left: 175, top: 935, width: 620, fontSize: 20, fontWeight: 'bold', fill: '#9a3412'
        }),
        text({
          text: '- 기획마케팅본부 팀원 일동 -',
          left: 770, top: 937, width: 200, fontSize: 18, fontWeight: 'bold', fill: '#64748b', textAlign: 'right'
        })
      ]
    },

    // 2. 프리미엄 생일 파티 초대장 (정사각 1080×1080)
    {
      id: 'promo-birthday-party',
      category: 'promo',
      name: '프리미엄 생일 파티 초대장',
      note: '정사각 1080 × 1080 · 럭셔리 다크 & 샴페인 골드 테마',
      width: 1080,
      height: 1080,
      background: '#0a0f1d',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#0a0f1d' }),
        // 골드 프레임 테두리
        rect({ left: 35, top: 35, width: 1010, height: 1010, fill: 'rgba(0,0,0,0)', stroke: '#d4af37', strokeWidth: 1.5, rx: 12 }),
        rect({ left: 45, top: 45, width: 990, height: 990, fill: 'rgba(0,0,0,0)', stroke: 'rgba(212, 175, 55, 0.4)', strokeWidth: 1, rx: 8 }),
        // 상단 헤더
        icon({ iconName: 'sparkleStar', left: 520, top: 60, size: 40, fill: '#f59e0b' }),
        text({
          text: 'SPECIAL INVITATION',
          left: 40, top: 110, width: 1000, fontSize: 20, fontWeight: 'bold', fill: '#d4af37', textAlign: 'center', charSpacing: 8
        }),
        text({
          text: 'CELEBRATE WITH ME',
          left: 40, top: 145, width: 1000, fontSize: 44, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '소중한 분들과 함께하고 싶은 특별한 생일 파티에 초대합니다',
          left: 40, top: 205, width: 1000, fontSize: 22, fill: '#94a3b8', textAlign: 'center'
        }),
        // 중앙 메인 파티/주인공 사진 슬롯
        rect({ left: 350, top: 255, width: 380, height: 380, fill: '#1e293b', rx: 16, stroke: '#d4af37', strokeWidth: 2 }),
        slot({ left: 355, top: 260, width: 370, height: 370, label: '파티 주인공 / 대표 사진' }),
        // 양옆 장식
        figure({ figureName: 'artStarBurst', left: 140, top: 380, size: 120, figureColors: ['#fbbf24'] }),
        figure({ figureName: 'artStarBurst', left: 820, top: 380, size: 120, figureColors: ['#fbbf24'] }),
        // 파티 정보 박스
        rect({ left: 110, top: 670, width: 860, height: 260, fill: 'rgba(255,255,255,0.04)', rx: 16, stroke: 'rgba(212, 175, 55, 0.5)', strokeWidth: 1 }),
        icon({ iconName: 'calendar', left: 160, top: 700, size: 36, fill: '#fbbf24' }),
        text({
          text: '일  시 : 2026년 06월 20일(토)  저녁 18:30',
          left: 220, top: 705, width: 700, fontSize: 24, fontWeight: 'bold', fill: '#f8fafc'
        }),
        icon({ iconName: 'pin', left: 160, top: 755, size: 36, fill: '#fbbf24' }),
        text({
          text: '장  소 : 루프탑 라운지 ‘더 스카이’ (강남구 테헤란로 123 15층)',
          left: 220, top: 760, width: 700, fontSize: 23, fontWeight: 'bold', fill: '#f8fafc'
        }),
        icon({ iconName: 'sparkle', left: 160, top: 810, size: 36, fill: '#fbbf24' }),
        text({
          text: '드레스코드 : Black & Champagne Gold  |  웰컴 드링크 & 케이터링 제공',
          left: 220, top: 815, width: 700, fontSize: 21, fill: '#cbd5e1'
        }),
        rect({ left: 150, top: 865, width: 780, height: 1, fill: 'rgba(255,255,255,0.1)' }),
        text({
          text: '※ 케이터링 및 좌석 예약을 위해 6월 12일까지 참석 여부를 알려주세요. (RSVP: 010-1234-5678)',
          left: 140, top: 885, width: 800, fontSize: 18, fill: '#94a3b8', textAlign: 'center'
        }),
        text({
          text: 'HOST : MIN-JI KIM',
          left: 40, top: 960, width: 1000, fontSize: 20, fontWeight: 'bold', fill: '#d4af37', textAlign: 'center', charSpacing: 6
        })
      ]
    },

    // 3. 지역 문화 축제 · 봄꽃 축제 포스터 (A4 세로 1240×1754)
    {
      id: 'promo-local-festival',
      category: 'promo',
      name: '지역 문화 축제 · 페스티벌 포스터',
      note: 'A4 세로 1240 × 1754 · 봄꽃/문화관광 야외 축제 공식 포스터',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 화사한 상단 그라데이션 헤더
        gradientRect({ left: 0, top: 0, width: 1240, height: 320, gradient: ROSE }),
        figure({ figureName: 'illSun', left: 80, top: 35, size: 90 }),
        figure({ figureName: 'artConfetti', left: 1030, top: 30, size: 130 }),
        text({
          text: '2026 제12회 달빛 호수공원 봄꽃 문화축제',
          left: 0, top: 50, width: 1240, fontSize: 32, fontWeight: 'bold', fill: '#fef08a', textAlign: 'center', charSpacing: 3
        }),
        text({
          text: '꽃빛으로 물드는 봄날의 설렘',
          left: 0, top: 115, width: 1240, fontSize: 66, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        rect({ left: 245, top: 225, width: 750, height: 56, fill: 'rgba(0,0,0,0.25)', rx: 28 }),
        text({
          text: '2026. 04. 17 (금) ~ 04. 26 (일)  |  달빛호수공원 야외광장 일원',
          left: 245, top: 236, width: 750, fontSize: 26, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        // 메인 포토 슬롯
        rect({ left: 80, top: 350, width: 1080, height: 560, fill: '#f1f5f9', rx: 16, stroke: '#cbd5e1', strokeWidth: 2 }),
        slot({ left: 80, top: 350, width: 1080, height: 560, label: '축제 대표 전경 / 포스터 메인 사진을 넣어주세요' }),
        // 3대 주요 프로그램 카드
        text({ text: 'MAIN PROGRAM LINE-UP', left: 80, top: 940, width: 1080, fontSize: 22, fontWeight: 'bold', fill: '#f97316', charSpacing: 3 }),
        text({ text: '축제 핵심 프로그램 안내', left: 80, top: 975, width: 1080, fontSize: 34, fontWeight: 'bold', fill: '#0f172a' }),
        // 카드 1
        rect({ left: 80, top: 1035, width: 340, height: 250, fill: '#fff7ed', rx: 14, stroke: '#fdba74' }),
        figure({ figureName: 'illMic', left: 220, top: 1060, size: 60 }),
        text({ text: '개막 축하공연 & 불꽃쇼', left: 100, top: 1135, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#9a3412', textAlign: 'center' }),
        text({
          text: '4.17(금) 19:00 특설무대\n초청가수 축하 라이브 콘서트\n호수 위 화려한 멀티미디어 불꽃쇼',
          left: 100, top: 1175, width: 300, fontSize: 18, fill: '#475569', textAlign: 'center', lineHeight: 1.5
        }),
        // 카드 2
        rect({ left: 450, top: 1035, width: 340, height: 250, fill: '#f0fdf4', rx: 14, stroke: '#86efac' }),
        figure({ figureName: 'artFlowerBasket', left: 590, top: 1060, size: 60 }),
        text({ text: '플리마켓 & 푸드존', left: 470, top: 1135, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#166534', textAlign: 'center' }),
        text({
          text: '상시 운영 (11:00 ~ 21:00)\n지역 청년 공예마켓 60부스\n전국 유명 푸드트럭 30개소',
          left: 470, top: 1175, width: 300, fontSize: 18, fill: '#475569', textAlign: 'center', lineHeight: 1.5
        }),
        // 카드 3
        rect({ left: 820, top: 1035, width: 340, height: 250, fill: '#eff6ff', rx: 14, stroke: '#93c5fd' }),
        figure({ figureName: 'artConfetti', left: 960, top: 1060, size: 60 }),
        text({ text: '시민 노래자랑 & 체험', left: 840, top: 1135, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#1e40af', textAlign: 'center' }),
        text({
          text: '4.25(토) 14:00 잔디마당\n총상금 500만원 주민 가요제\n페이스페인팅 & 화관 만들기',
          left: 840, top: 1175, width: 300, fontSize: 18, fill: '#475569', textAlign: 'center', lineHeight: 1.5
        }),
        // 오시는 길 및 셔틀 안내
        rect({ left: 80, top: 1320, width: 1080, height: 180, fill: '#f8fafc', rx: 12, stroke: '#cbd5e1' }),
        icon({ iconName: 'pin', left: 120, top: 1350, size: 40, fill: '#ef4444' }),
        text({
          text: '교통편 및 무료 셔틀버스 운행 안내',
          left: 175, top: 1355, width: 450, fontSize: 24, fontWeight: 'bold', fill: '#0f172a'
        }),
        text({
          text: '• 지하철 : 3호선 호수공원역 2번 출구 도보 5분\n• 무료 셔틀 : 행사 기간 중 시청역 ↔ 축제장 (15분 간격 왕복 순환 운행)\n• 주차 안내 : 임시 공용주차장 1,500대 확보 (축제 관람객 무료)',
          left: 175, top: 1400, width: 850, fontSize: 20, fill: '#334155', lineHeight: 1.6
        }),
        // 하단 기관 정보
        rect({ left: 0, top: 1540, width: 1240, height: 214, fill: '#0f172a' }),
        text({
          text: '주최 : ○○광역시  ·  ○○구청   |   주관 : ○○문화재단   |   후원 : 한국관광공사',
          left: 0, top: 1590, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#f8fafc', textAlign: 'center'
        }),
        text({
          text: '행사 문의 : 축제운영사무국 ☎ 02-123-4567  |  공식 홈페이지 : www.springflower-fest.kr',
          left: 0, top: 1640, width: 1240, fontSize: 20, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 4. 임직원 한마음 체육대회 · 야유회 포스터 (A4 세로 1240×1754)
    {
      id: 'promo-sports-day',
      category: 'promo',
      name: '임직원 한마음 체육대회 · 야유회',
      note: 'A4 세로 1240 × 1754 · 사내 체육대회/명랑운동회/경품 포스터',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 에너제틱 블루 & 오렌지 헤더
        gradientRect({ left: 0, top: 0, width: 1240, height: 290, gradient: grad(90, [{ offset: 0, color: '#0284c7' }, { offset: 1, color: '#2563eb' }]) }),
        icon({ iconName: 'trophy', left: 90, top: 50, size: 80, fill: '#fde047' }),
        figure({ figureName: 'artStarTrio', left: 1040, top: 40, size: 100 }),
        text({
          text: '2026 열정으로 하나되는 우리!',
          left: 0, top: 45, width: 1240, fontSize: 28, fontWeight: 'bold', fill: '#bae6fd', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '전사 임직원 한마음 체육대회',
          left: 0, top: 100, width: 1240, fontSize: 62, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '소통과 화합으로 함께 달리는 빛나는 축제의 날!',
          left: 0, top: 195, width: 1240, fontSize: 26, fill: '#e0f2fe', textAlign: 'center'
        }),
        // 행사 사진 슬롯
        rect({ left: 80, top: 320, width: 1080, height: 480, fill: '#f8fafc', rx: 16, stroke: '#cbd5e1', strokeWidth: 2 }),
        slot({ left: 80, top: 320, width: 1080, height: 480, label: '행사 현장 / 전년도 체육대회 단체 사진을 넣어주세요' }),
        // 개요 바
        rect({ left: 80, top: 830, width: 1080, height: 110, fill: '#0f172a', rx: 12 }),
        text({
          text: '• 일시 : 2026년 05월 22일(금) 09:00 ~ 17:00 (전사 유급 체육의 날)\n• 장소 : 잠실종합운동장 보조경기장 (우천 시 잠실 올림픽실내체육관 진행)',
          left: 120, top: 855, width: 1000, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', lineHeight: 1.5
        }),
        // 종목 안내 3단
        text({ text: 'GAME & MATCH PROGRAM', left: 80, top: 970, width: 1080, fontSize: 20, fontWeight: 'bold', fill: '#0284c7', charSpacing: 2 }),
        text({ text: '팀 대항 명랑운동회 경기 종목', left: 80, top: 1005, width: 1080, fontSize: 32, fontWeight: 'bold', fill: '#0f172a' }),
        // 종목 1
        rect({ left: 80, top: 1060, width: 340, height: 210, fill: '#f0fdf4', rx: 12, stroke: '#86efac' }),
        text({ text: '🥇 명랑운동회 리그', left: 100, top: 1085, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#166534', textAlign: 'center' }),
        text({
          text: '• 대형 지구본 굴리기\n• 전략 줄다리기 (남/여/혼성)\n• 단체 줄넘기 & 파도타기',
          left: 110, top: 1135, width: 280, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        // 종목 2
        rect({ left: 450, top: 1060, width: 340, height: 210, fill: '#eff6ff', rx: 12, stroke: '#93c5fd' }),
        text({ text: '⚽ 구기 토너먼트', left: 470, top: 1085, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#1e40af', textAlign: 'center' }),
        text({
          text: '• 본부 대항 풋살 결승전\n• 혼성 피구 토너먼트\n• 스크린 파크골프 퍼팅',
          left: 480, top: 1135, width: 280, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        // 종목 3
        rect({ left: 820, top: 1060, width: 340, height: 210, fill: '#fef2f2', rx: 12, stroke: '#fca5a5' }),
        text({ text: '🔥 화합의 계주 릴레이', left: 840, top: 1085, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#991b1b', textAlign: 'center' }),
        text({
          text: '• 전 부서 400m 릴레이 계주\n• 응원단 퍼포먼스 경연\n• 대동놀이 & 전사 화합 강강술래',
          left: 850, top: 1135, width: 280, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        // 푸짐한 경품 안내 (골드 박스)
        rect({ left: 80, top: 1300, width: 1080, height: 240, fill: '#fffbeb', rx: 14, stroke: '#f59e0b', strokeWidth: 2 }),
        icon({ iconName: 'award', left: 120, top: 1330, size: 56, fill: '#b45309' }),
        text({
          text: '🏆 푸짐한 우승 상금 및 행운권 경품 안내',
          left: 190, top: 1340, width: 900, fontSize: 28, fontWeight: 'bold', fill: '#92400e'
        }),
        text({
          text: '• 종합 우승 본부 : 포상금 300만원 & 우승 트로피 수여\n' +
            '• 종합 준우승 : 포상금 150만원  |  열정 응원상 : 100만원\n' +
            '• 행운권 대박 경품 : LG 스탠바이미 (1명), 다이슨 에어랩 (2명), 애플워치 (3명), 신세계 상품권 10만원권 (20명)\n' +
            '• 참가자 전원 : 고급 기능성 윈드브레이커 바람막이 & 스포츠 타월 지급',
          left: 130, top: 1410, width: 980, fontSize: 20, fill: '#78350f', lineHeight: 1.6
        }),
        // 하단 안내
        text({
          text: '준비물 : 운동복, 운동화, 개인 물병 지참 (점심 뷔페 및 간식 무제한 제공)',
          left: 0, top: 1580, width: 1240, fontSize: 22, fontWeight: 'bold', fill: '#475569', textAlign: 'center'
        }),
        text({
          text: '주최 : 사내 노사협의회  ·  복리후생위원회   |   문의 : 인사총무팀 (내선 3302)',
          left: 0, top: 1625, width: 1240, fontSize: 20, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 5. 친환경 나눔 바자회 & 플리마켓 (정사각 1080×1080)
    {
      id: 'promo-flea-market',
      category: 'promo',
      name: '친환경 나눔 바자회 & 플리마켓',
      note: '정사각 1080 × 1080 · 친환경 제로웨이스트 & 나눔장터',
      width: 1080,
      height: 1080,
      background: '#f0fdf4',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#f0fdf4' }),
        // 테두리
        rect({ left: 30, top: 30, width: 1020, height: 1020, fill: '#ffffff', rx: 24, stroke: '#86efac', strokeWidth: 2 }),
        gradientRect({ left: 30, top: 30, width: 1020, height: 150, gradient: GREEN, rx: 24 }),
        figure({ figureName: 'illTree', left: 70, top: 50, size: 90 }),
        figure({ figureName: 'illLeaf', left: 930, top: 50, size: 90 }),
        text({
          text: 'ECO & SHARING FLEA MARKET',
          left: 0, top: 50, width: 1080, fontSize: 22, fontWeight: 'bold', fill: '#dcfce7', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '초록나눔 바자회 & 플리마켓',
          left: 0, top: 95, width: 1080, fontSize: 46, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '쓰지 않는 물건에 새 생명을, 이웃에게 따뜻한 사랑을 전해요!',
          left: 60, top: 200, width: 960, fontSize: 24, fontWeight: 'bold', fill: '#15803d', textAlign: 'center'
        }),
        // 마켓 사진 슬롯
        rect({ left: 80, top: 250, width: 920, height: 400, fill: '#f8fafc', rx: 16, stroke: '#cbd5e1', strokeWidth: 2 }),
        slot({ left: 80, top: 250, width: 920, height: 400, label: '플리마켓 / 바자회 현장 사진을 넣어주세요' }),
        // 3열 정보 카드
        rect({ left: 80, top: 675, width: 285, height: 155, fill: '#f0fdf4', rx: 12, stroke: '#86efac' }),
        icon({ iconName: 'calendar', left: 200, top: 690, size: 36, fill: '#16a34a' }),
        text({ text: '일시 안내', left: 80, top: 735, width: 285, fontSize: 20, fontWeight: 'bold', fill: '#14532d', textAlign: 'center' }),
        text({ text: '2026. 05. 30 (토)\n11:00 ~ 17:00', left: 80, top: 765, width: 285, fontSize: 18, fill: '#334155', textAlign: 'center' }),

        rect({ left: 395, top: 675, width: 285, height: 155, fill: '#f0fdf4', rx: 12, stroke: '#86efac' }),
        icon({ iconName: 'pin', left: 515, top: 690, size: 36, fill: '#16a34a' }),
        text({ text: '장소 안내', left: 395, top: 735, width: 285, fontSize: 20, fontWeight: 'bold', fill: '#14532d', textAlign: 'center' }),
        text({ text: '행복나눔복지관\n야외 잔디마당', left: 395, top: 765, width: 285, fontSize: 18, fill: '#334155', textAlign: 'center' }),

        rect({ left: 710, top: 675, width: 285, height: 155, fill: '#f0fdf4', rx: 12, stroke: '#86efac' }),
        icon({ iconName: 'sparkle', left: 830, top: 690, size: 36, fill: '#16a34a' }),
        text({ text: '참여 마켓', left: 710, top: 735, width: 285, fontSize: 20, fontWeight: 'bold', fill: '#14532d', textAlign: 'center' }),
        text({ text: '핸드메이드 소품\n친환경 리사이클', left: 710, top: 765, width: 285, fontSize: 18, fill: '#334155', textAlign: 'center' }),

        // 에코 캠페인 박스
        rect({ left: 80, top: 855, width: 920, height: 110, fill: '#fffbeb', rx: 14, stroke: '#fde047' }),
        icon({ iconName: 'heart', left: 115, top: 885, size: 44, fill: '#e11d48' }),
        text({
          text: '🌱 특별 에코 혜택 : 텀블러/다회용 장바구니 지참 시 유기농 음료 무료 증정!\n' +
            '💚 따뜻한 기부 : 당일 판매 수익금 전액은 지역 결식아동 돕기 성금으로 기탁됩니다.',
          left: 175, top: 880, width: 800, fontSize: 20, fontWeight: 'bold', fill: '#854d0e', lineHeight: 1.6
        }),
        text({
          text: '주최/주관 : 초록나눔시민연대  ·  행복나눔복지관  |  문의 : 02-555-7890',
          left: 0, top: 990, width: 1080, fontSize: 19, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 6. 기획 전시회 · 갤러리 초대 포스터 (A4 세로 1240×1754)
    {
      id: 'promo-exhibition',
      category: 'promo',
      name: '기획 전시회 · 갤러리 아트 포스터',
      note: 'A4 세로 1240 × 1754 · 모던 아트/사진전/갤러리 초대',
      width: 1240,
      height: 1754,
      background: '#090d16',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#090d16' }),
        // 상단 헤더
        icon({ iconName: 'sparkle', left: 80, top: 60, size: 36, fill: '#cbd5e1' }),
        text({
          text: 'SPECIAL ART EXHIBITION 2026',
          left: 130, top: 65, width: 1000, fontSize: 22, fontWeight: 'bold', fill: '#94a3b8', charSpacing: 6
        }),
        text({
          text: '빛과 선의 궤적 : 경계를 넘어서',
          left: 80, top: 120, width: 1080, fontSize: 64, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: 'Traces of Light and Lines : Beyond the Boundary',
          left: 80, top: 215, width: 1080, fontSize: 26, fill: '#64748b', charSpacing: 2
        }),
        // 분할 아트워크 사진 슬롯
        rect({ left: 80, top: 280, width: 700, height: 760, fill: '#1e293b', rx: 8, stroke: '#334155' }),
        slot({ left: 80, top: 280, width: 700, height: 760, label: '대표 전시 작품 1 (메인)' }),

        rect({ left: 810, top: 280, width: 350, height: 365, fill: '#1e293b', rx: 8, stroke: '#334155' }),
        slot({ left: 810, top: 280, width: 350, height: 365, label: '전시 작품 2' }),

        rect({ left: 810, top: 675, width: 350, height: 365, fill: '#1e293b', rx: 8, stroke: '#334155' }),
        slot({ left: 810, top: 675, width: 350, height: 365, label: '전시 작품 3' }),

        // 큐레이터 노트
        rect({ left: 80, top: 1075, width: 1080, height: 205, fill: 'rgba(255,255,255,0.03)', rx: 8, stroke: 'rgba(255,255,255,0.1)' }),
        text({
          text: 'EXHIBITION STATEMENT',
          left: 120, top: 1100, width: 1000, fontSize: 20, fontWeight: 'bold', fill: '#e2e8f0', charSpacing: 4
        }),
        text({
          text: '“일상 속에서 스쳐 지나가는 빛의 입자와 보이지 않는 경계의 궤적을 5인의 현대미술 작가가 캔버스와\n' +
            '미디어 아트로 재해석합니다. 시공간을 가로지르는 빛의 변주 속에서 새로운 시각적 통찰을 경험해 보시기 바랍니다.”',
          left: 120, top: 1135, width: 1000, fontSize: 21, fill: '#94a3b8', lineHeight: 1.6
        }),
        text({
          text: '참여 작가 : 강민우, 서지수, 이도현, 장하은, 한재원',
          left: 120, top: 1230, width: 1000, fontSize: 20, fontWeight: 'bold', fill: '#cbd5e1'
        }),

        // 전시 개요 표
        {
          type: 'table',
          left: 80, top: 1315,
          rows: 3, cols: 2,
          colWidths: [260, 820], cellH: 56,
          fontSize: 20,
          headerRow: false,
          headerCol: true,
          headerFill: '#1e293b',
          borderColor: '#334155',
          cells: [
            [{ text: '전 시 기 간' }, { text: '2026. 09. 15(화) ~ 10. 25(일)  |  매주 월요일 휴관' }],
            [{ text: '관 람 시 간' }, { text: '오전 10:00 ~ 오후 19:00 (입장 마감 18:30)  |  무료 관람' }],
            [{ text: '전 시 장 소' }, { text: '아르떼 현대미술관 기획전시 1, 2관 (지하철 2호선 시청역 4번 출구)' }]
          ]
        },

        // 도슨트 및 안내
        rect({ left: 80, top: 1520, width: 1080, height: 90, fill: '#0f172a', rx: 8 }),
        icon({ iconName: 'clock', left: 115, top: 1545, size: 40, fill: '#38bdf8' }),
        text({
          text: '정규 도슨트 해설 : 매일 11:30, 15:00 (별도 사전예약 없이 전시장 로비 집결)',
          left: 175, top: 1550, width: 950, fontSize: 22, fontWeight: 'bold', fill: '#f8fafc'
        }),
        text({
          text: '주최 : 아르떼문화재단   |   후원 : 문화체육관광부, 서울특별시   |   문의 : 02-777-3300',
          left: 0, top: 1650, width: 1240, fontSize: 20, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 7. 라이브 버스킹 & 뮤직 페스티벌 (A4 세로 1240×1754)
    {
      id: 'promo-concert-live',
      category: 'promo',
      name: '라이브 버스킹 & 뮤직 콘서트',
      note: 'A4 세로 1240 × 1754 · 네온 바이올렛/핑크 퇴근길 루프탑 공연',
      width: 1240,
      height: 1754,
      background: '#130d24',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#130d24' }),
        // 화려한 네온 그라데이션 헤더
        gradientRect({ left: 0, top: 0, width: 1240, height: 300, gradient: PURPLE }),
        figure({ figureName: 'artConfetti', left: 80, top: 30, size: 100 }),
        icon({ iconName: 'music', left: 1060, top: 40, size: 70, fill: '#ffffff' }),
        text({
          text: 'ROOFTOP LIVE CONCERT 2026',
          left: 0, top: 45, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#fbcfe8', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '퇴근길, 감미로운 선율 속으로',
          left: 0, top: 95, width: 1240, fontSize: 62, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '도심 속 루프탑에서 펼쳐지는 감성 어쿠스틱 & 재즈 버스킹 라이브',
          left: 0, top: 190, width: 1240, fontSize: 26, fill: '#fdf2f8', textAlign: 'center'
        }),
        // 공연 현장/아티스트 사진 슬롯
        rect({ left: 80, top: 330, width: 1080, height: 500, fill: '#1e1b4b', rx: 16, stroke: '#a855f7', strokeWidth: 2 }),
        slot({ left: 80, top: 330, width: 1080, height: 500, label: '아티스트 / 무대 공연 사진을 넣어주세요' }),
        // 타임테이블 라인업 3단
        text({ text: 'LIVE STAGE LINE-UP', left: 80, top: 870, width: 1080, fontSize: 22, fontWeight: 'bold', fill: '#ec4899', charSpacing: 4 }),
        text({ text: '공연 타임테이블 및 출연 아티스트', left: 80, top: 905, width: 1080, fontSize: 34, fontWeight: 'bold', fill: '#ffffff' }),
        // 라인업 1
        rect({ left: 80, top: 965, width: 340, height: 230, fill: 'rgba(255,255,255,0.06)', rx: 14, stroke: 'rgba(236, 72, 153, 0.4)' }),
        figure({ figureName: 'illMic', left: 220, top: 990, size: 60 }),
        text({ text: '18:30 ~ 19:15', left: 100, top: 1065, width: 300, fontSize: 20, fontWeight: 'bold', fill: '#f472b6', textAlign: 'center' }),
        text({ text: '어쿠스틱 듀오 「새벽달」', left: 100, top: 1095, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '마음을 울리는 포크송과\n따뜻한 통기타 자작곡 라이브', left: 100, top: 1135, width: 300, fontSize: 18, fill: '#cbd5e1', textAlign: 'center', lineHeight: 1.5 }),
        // 라인업 2
        rect({ left: 450, top: 965, width: 340, height: 230, fill: 'rgba(255,255,255,0.06)', rx: 14, stroke: 'rgba(168, 85, 247, 0.4)' }),
        icon({ iconName: 'music', left: 590, top: 990, size: 60, fill: '#c084fc' }),
        text({ text: '19:30 ~ 20:15', left: 470, top: 1065, width: 300, fontSize: 20, fontWeight: 'bold', fill: '#c084fc', textAlign: 'center' }),
        text({ text: '재즈 콰르텟 「블루노트」', left: 470, top: 1095, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '스탠다드 스윙 재즈와\n낭만적인 색소폰 솔로 앙상블', left: 470, top: 1135, width: 300, fontSize: 18, fill: '#cbd5e1', textAlign: 'center', lineHeight: 1.5 }),
        // 라인업 3
        rect({ left: 820, top: 965, width: 340, height: 230, fill: 'rgba(255,255,255,0.06)', rx: 14, stroke: 'rgba(236, 72, 153, 0.4)' }),
        figure({ figureName: 'artPartyHat', left: 960, top: 990, size: 60 }),
        text({ text: '20:30 ~ 21:15', left: 840, top: 1065, width: 300, fontSize: 20, fontWeight: 'bold', fill: '#f472b6', textAlign: 'center' }),
        text({ text: '신스팝 밴드 「네온웨이브」', left: 840, top: 1095, width: 300, fontSize: 24, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '청량한 일렉트로닉 사운드와\n에너지 넘치는 피날레 무대', left: 840, top: 1135, width: 300, fontSize: 18, fill: '#cbd5e1', textAlign: 'center', lineHeight: 1.5 }),
        // 특별 혜택 박스
        rect({ left: 80, top: 1235, width: 1080, height: 160, fill: 'rgba(168, 85, 247, 0.15)', rx: 14, stroke: '#a855f7' }),
        text({
          text: '✨ 관람객 특별 혜택 안내',
          left: 120, top: 1260, width: 900, fontSize: 24, fontWeight: 'bold', fill: '#f0abfc'
        }),
        text({
          text: '• 시원한 수제 생맥주 1잔 & 나초 스낵 무료 증정 (선착순 300명)\n' +
            '• 럭키드로우 이벤트 : 마샬 블루투스 스피커 (2명), LP 턴테이블 (1명) 현장 즉석 추첨!',
          left: 120, top: 1305, width: 1000, fontSize: 21, fill: '#ffffff', lineHeight: 1.6
        }),
        // 일시/장소
        rect({ left: 80, top: 1430, width: 1080, height: 130, fill: 'rgba(0,0,0,0.4)', rx: 12 }),
        icon({ iconName: 'calendar', left: 120, top: 1460, size: 40, fill: '#ec4899' }),
        text({
          text: '일시 : 2026년 06월 19일 (금) 18:30 ~ 21:30 (입장 시작 18:00)',
          left: 180, top: 1455, width: 900, fontSize: 23, fontWeight: 'bold', fill: '#ffffff'
        }),
        icon({ iconName: 'pin', left: 120, top: 1505, size: 40, fill: '#ec4899' }),
        text({
          text: '장소 : 강남 테헤란타워 15층 스카이가든 야외 특설무대 (무료 입장)',
          left: 180, top: 1500, width: 900, fontSize: 23, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '주관 : 테헤란 문화살롱   |   입장료 무료 (자유 착석)   |   문의 : 02-3456-7890',
          left: 0, top: 1610, width: 1240, fontSize: 21, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 8. 희망나눔 건강 걷기대회 & 마라톤 (A4 세로 1240×1754)
    {
      id: 'promo-charity-walk',
      category: 'promo',
      name: '희망나눔 건강 걷기대회 & 마라톤',
      note: 'A4 세로 1240 × 1754 · 가족 걷기대회/시민 마라톤/자선 기부',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 싱그러운 시안 & 에메랄드 그라데이션
        gradientRect({ left: 0, top: 0, width: 1240, height: 290, gradient: TEAL }),
        figure({ figureName: 'illMountain', left: 80, top: 40, size: 85 }),
        figure({ figureName: 'artStarTrio', left: 1040, top: 40, size: 90 }),
        text({
          text: '2026 시민과 함께 달리는 제9회 희망 나눔',
          left: 0, top: 45, width: 1240, fontSize: 28, fontWeight: 'bold', fill: '#ccfbf1', textAlign: 'center', charSpacing: 3
        }),
        text({
          text: '푸른길 건강 걷기대회 & 마라톤',
          left: 0, top: 100, width: 1240, fontSize: 58, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '한 걸음의 건강한 도전, 모두를 향한 따뜻한 사랑의 실천!',
          left: 0, top: 195, width: 1240, fontSize: 26, fill: '#f0fdfa', textAlign: 'center'
        }),
        // 코스 풍경/대회 사진 슬롯
        rect({ left: 80, top: 320, width: 1080, height: 500, fill: '#f0fdfa', rx: 16, stroke: '#5eead4', strokeWidth: 2 }),
        slot({ left: 80, top: 320, width: 1080, height: 500, label: '산책 코스 / 대회 현장 사진을 넣어주세요' }),
        // 2개 코스 안내 카드
        text({ text: 'COURSE INFORMATION', left: 80, top: 860, width: 1080, fontSize: 20, fontWeight: 'bold', fill: '#0d9488', charSpacing: 2 }),
        text({ text: '대회 참가 코스 선택', left: 80, top: 895, width: 1080, fontSize: 32, fontWeight: 'bold', fill: '#0f172a' }),
        // 코스 A
        rect({ left: 80, top: 950, width: 520, height: 240, fill: '#f0fdf4', rx: 14, stroke: '#86efac', strokeWidth: 1.5 }),
        rect({ left: 105, top: 975, width: 120, height: 36, fill: '#16a34a', rx: 18 }),
        text({ text: '5km 코스', left: 105, top: 981, width: 120, fontSize: 18, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '패밀리 힐링 걷기 코스', left: 240, top: 980, width: 340, fontSize: 24, fontWeight: 'bold', fill: '#14532d' }),
        text({
          text: '• 대상 : 남녀노소 누구나, 가족/유모차/반려견 동반 가능\n' +
            '• 코스 : 평화광장 ➔ 수변 데크로드 ➔ 생태숲길 ➔ 반환점\n' +
            '• 소요 시간 : 약 1시간 20분 내외 (완보 인증 스탬프 투어)',
          left: 105, top: 1040, width: 470, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        // 코스 B
        rect({ left: 640, top: 950, width: 520, height: 240, fill: '#eff6ff', rx: 14, stroke: '#93c5fd', strokeWidth: 1.5 }),
        rect({ left: 665, top: 975, width: 120, height: 36, fill: '#2563eb', rx: 18 }),
        text({ text: '10km 코스', left: 665, top: 981, width: 120, fontSize: 18, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({ text: '챌린지 마라톤 코스', left: 800, top: 980, width: 340, fontSize: 24, fontWeight: 'bold', fill: '#1e3a8a' }),
        text({
          text: '• 대상 : 러닝 동호인 및 건강 챌린지 도전자\n' +
            '• 코스 : 평화광장 ➔ 강변 자전거길 ➔ 갈대습지 순환\n' +
            '• 혜택 : 공식 전자 기록 계측 칩 제공 & 모바일 기록증 발급',
          left: 665, top: 1040, width: 470, fontSize: 19, fill: '#334155', lineHeight: 1.7
        }),
        // 참가자 기념품 패키지 박스
        rect({ left: 80, top: 1220, width: 1080, height: 180, fill: '#fffbeb', rx: 14, stroke: '#f59e0b' }),
        figure({ figureName: 'artGiftBox', left: 115, top: 1245, size: 70 }),
        text({
          text: '🎁 모든 참가자 기념품 패키지 증정',
          left: 210, top: 1245, width: 800, fontSize: 26, fontWeight: 'bold', fill: '#92400e'
        }),
        text({
          text: '• 공식 기능성 쿨링 러닝 티셔츠 + 완주 기념 메달 + 친환경 스포츠 텀블러 + 파워 에너지젤\n' +
            '• 참가비 : 1인 15,000원 (청소년/어린이 무료)  |  참가비 전액 소아암 환우 치료비로 기부',
          left: 210, top: 1295, width: 920, fontSize: 20, fill: '#78350f', lineHeight: 1.6
        }),
        // 대회 일시 & 장소
        rect({ left: 80, top: 1430, width: 1080, height: 130, fill: '#0f172a', rx: 12 }),
        icon({ iconName: 'clock', left: 120, top: 1455, size: 36, fill: '#38bdf8' }),
        text({
          text: '일시 : 2026년 10월 17일 (토) 08:30 집결 (09:00 정시 출발)',
          left: 175, top: 1455, width: 900, fontSize: 22, fontWeight: 'bold', fill: '#ffffff'
        }),
        icon({ iconName: 'pin', left: 120, top: 1500, size: 36, fill: '#38bdf8' }),
        text({
          text: '집결 장소 : 월드컵 평화의공원 잔디마당 (선착순 3,000명 사전 접수 마감)',
          left: 175, top: 1500, width: 900, fontSize: 22, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '주최 : 사단법인 희망나눔재단  ·  서울특별시체육회   |   접수 : www.hopewalk2026.org',
          left: 0, top: 1610, width: 1240, fontSize: 20, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 9. 팝업스토어 & 신제품 론칭 배너 (가로 1200×628)
    {
      id: 'promo-popup-store',
      category: 'promo',
      name: '팝업스토어 & 브랜드 론칭 배너',
      note: '가로 웹/SNS 배너 1200 × 628 · 성수동 팝업/신제품 프로모션',
      width: 1200,
      height: 628,
      background: '#090d16',
      objects: [
        background({ left: 0, top: 0, width: 1200, height: 628, fill: '#090d16' }),
        // 좌측 사진 슬롯
        rect({ left: 35, top: 35, width: 520, height: 558, fill: '#1e293b', rx: 16, stroke: '#334155', strokeWidth: 1.5 }),
        slot({ left: 35, top: 35, width: 520, height: 558, label: '팝업 스토어 현장 / 신제품 메인 컷' }),
        // 우측 콘텐츠
        rect({ left: 590, top: 45, width: 220, height: 38, fill: '#a3e635', rx: 19 }),
        text({
          text: 'LIMITED POP-UP STORE',
          left: 590, top: 53, width: 220, fontSize: 16, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 1
        }),
        text({
          text: 'URBAN OASIS : 성수',
          left: 590, top: 105, width: 580, fontSize: 48, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '감각적인 일상을 깨우는 브랜드 플래그십 팝업',
          left: 590, top: 175, width: 580, fontSize: 22, fill: '#94a3b8'
        }),
        // 3가지 혜택 뱃지
        rect({ left: 590, top: 225, width: 575, height: 70, fill: 'rgba(255,255,255,0.05)', rx: 10, stroke: 'rgba(255,255,255,0.1)' }),
        icon({ iconName: 'gift', left: 610, top: 242, size: 36, fill: '#a3e635' }),
        text({
          text: '혜택 1 : 방문 고객 매일 선착순 100명 한정판 굿즈 키트 증정',
          left: 660, top: 247, width: 490, fontSize: 18, fontWeight: 'bold', fill: '#f8fafc'
        }),

        rect({ left: 590, top: 310, width: 575, height: 70, fill: 'rgba(255,255,255,0.05)', rx: 10, stroke: 'rgba(255,255,255,0.1)' }),
        icon({ iconName: 'percent', left: 610, top: 327, size: 36, fill: '#f43f5e' }),
        text({
          text: '혜택 2 : 신제품 전 라인업 현장 단독 30% 즉시 할인 혜택',
          left: 660, top: 332, width: 490, fontSize: 18, fontWeight: 'bold', fill: '#f8fafc'
        }),

        rect({ left: 590, top: 395, width: 575, height: 70, fill: 'rgba(255,255,255,0.05)', rx: 10, stroke: 'rgba(255,255,255,0.1)' }),
        icon({ iconName: 'camera', left: 610, top: 412, size: 36, fill: '#38bdf8' }),
        text({
          text: '혜택 3 : 감성 네컷 포토부스 무료 촬영 & SNS 인증 이벤트',
          left: 660, top: 417, width: 490, fontSize: 18, fontWeight: 'bold', fill: '#f8fafc'
        }),

        // 하단 일정 및 위치
        rect({ left: 590, top: 485, width: 575, height: 105, fill: '#1e293b', rx: 12 }),
        text({
          text: '• 기간 : 2026. 05. 01(금) ~ 05. 14(목)  [11:00 ~ 20:00]\n• 위치 : 서울 성동구 연무장길 45 아틀리에 1-2층 (성수역 3번 출구)',
          left: 615, top: 512, width: 530, fontSize: 18, fill: '#e2e8f0', lineHeight: 1.6
        })
      ]
    },

    // 10. 저자 초청 북콘서트 & 명사 특강 (A4 세로 1240×1754)
    {
      id: 'promo-book-concert',
      category: 'promo',
      name: '저자 초청 북콘서트 & 명사 특강',
      note: 'A4 세로 1240 × 1754 · 도서관/서점/사내 강연회 & 북토크',
      width: 1240,
      height: 1754,
      background: '#faf6f0',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#faf6f0' }),
        // 클래식 브라운 & 딥 포레스트 테두리
        rect({ left: 35, top: 35, width: 1170, height: 1684, fill: '#ffffff', rx: 20, stroke: '#d6c7b2', strokeWidth: 2 }),
        // 상단 헤더 배너
        rect({ left: 75, top: 75, width: 1090, height: 190, fill: '#292524', rx: 14 }),
        figure({ figureName: 'illBook', left: 115, top: 110, size: 70 }),
        icon({ iconName: 'sparkle', left: 1080, top: 110, size: 50, fill: '#fbbf24' }),
        text({
          text: '2026 인문학 지식 살롱 : 베스트셀러 저자와의 만남',
          left: 190, top: 105, width: 880, fontSize: 22, fontWeight: 'bold', fill: '#f59e0b', charSpacing: 2
        }),
        text({
          text: '『어제보다 깊어진 나를 만나는 법』 북콘서트',
          left: 190, top: 145, width: 880, fontSize: 44, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '불확실한 시대, 흔들리지 않는 내면의 중심을 세우는 지혜',
          left: 190, top: 210, width: 880, fontSize: 22, fill: '#d6d3d1'
        }),
        // 도서 표지 슬롯 & 저자 슬롯 (2단 구성)
        rect({ left: 75, top: 295, width: 480, height: 600, fill: '#f5f5f4', rx: 12, stroke: '#d6c7b2' }),
        slot({ left: 75, top: 295, width: 480, height: 600, label: '도서 표지 이미지' }),

        rect({ left: 585, top: 295, width: 580, height: 600, fill: '#f5f5f4', rx: 12, stroke: '#d6c7b2' }),
        slot({ left: 585, top: 295, width: 580, height: 600, label: '초청 저자 프로필 사진' }),

        // 저자 소개 및 인용구
        rect({ left: 75, top: 925, width: 1090, height: 170, fill: '#f5efe6', rx: 12, stroke: '#e7d8c5' }),
        icon({ iconName: 'quoteOpen', left: 110, top: 955, size: 40, fill: '#78350f' }),
        text({
          text: '“우리가 마주하는 일상의 불안과 고독은 결코 결핍이 아닙니다.\n' +
            '나만의 고유한 빛을 빚어내기 위해 반드시 거쳐야 할 가장 찬란한 시간입니다.”',
          left: 165, top: 955, width: 960, fontSize: 24, fontStyle: 'italic', fill: '#44403c', lineHeight: 1.6
        }),
        text({
          text: '- 초청 연사 : 김태원 작가 (베스트셀러 인문학자 · 문화심리학 교수) -',
          left: 165, top: 1045, width: 960, fontSize: 21, fontWeight: 'bold', fill: '#78350f'
        }),

        // 프로그램 식순
        text({ text: 'PROGRAM SCHEDULE', left: 75, top: 1125, width: 1090, fontSize: 20, fontWeight: 'bold', fill: '#78350f', charSpacing: 3 }),
        text({ text: '북콘서트 프로그램 일정', left: 75, top: 1155, width: 1090, fontSize: 32, fontWeight: 'bold', fill: '#1c1917' }),

        rect({ left: 75, top: 1210, width: 345, height: 160, fill: '#fafaf9', rx: 10, stroke: '#e7e5e4' }),
        text({ text: 'PART 1 (50분)', left: 95, top: 1230, width: 305, fontSize: 20, fontWeight: 'bold', fill: '#78350f', textAlign: 'center' }),
        text({ text: '저자 특별 강연', left: 95, top: 1260, width: 305, fontSize: 24, fontWeight: 'bold', fill: '#292524', textAlign: 'center' }),
        text({ text: '내면의 힘을 기르는\n생각의 구조와 태도', left: 95, top: 1295, width: 305, fontSize: 18, fill: '#57534e', textAlign: 'center', lineHeight: 1.5 }),

        rect({ left: 445, top: 1210, width: 350, height: 160, fill: '#fafaf9', rx: 10, stroke: '#e7e5e4' }),
        text({ text: 'PART 2 (40분)', left: 465, top: 1230, width: 310, fontSize: 20, fontWeight: 'bold', fill: '#78350f', textAlign: 'center' }),
        text({ text: '독자와의 대화 (Q&A)', left: 465, top: 1260, width: 310, fontSize: 24, fontWeight: 'bold', fill: '#292524', textAlign: 'center' }),
        text({ text: '현장 오픈 마이크 질의응답\n사전 질문 토크 세션', left: 465, top: 1295, width: 310, fontSize: 18, fill: '#57534e', textAlign: 'center', lineHeight: 1.5 }),

        rect({ left: 820, top: 1210, width: 345, height: 160, fill: '#fafaf9', rx: 10, stroke: '#e7e5e4' }),
        text({ text: 'PART 3 (30분)', left: 840, top: 1230, width: 305, fontSize: 20, fontWeight: 'bold', fill: '#78350f', textAlign: 'center' }),
        text({ text: '친필 사인회 & 포토', left: 840, top: 1260, width: 305, fontSize: 24, fontWeight: 'bold', fill: '#292524', textAlign: 'center' }),
        text({ text: '도서 저자 친필 서명\n개별 기념 촬영', left: 840, top: 1295, width: 305, fontSize: 18, fill: '#57534e', textAlign: 'center', lineHeight: 1.5 }),

        // 일시 및 장소 박스
        rect({ left: 75, top: 1400, width: 1090, height: 160, fill: '#292524', rx: 12 }),
        icon({ iconName: 'calendar', left: 115, top: 1425, size: 36, fill: '#fbbf24' }),
        text({
          text: '일시 : 2026년 11월 12일 (목) 19:00 ~ 21:00 (입장 18:30부터)',
          left: 170, top: 1425, width: 950, fontSize: 22, fontWeight: 'bold', fill: '#ffffff'
        }),
        icon({ iconName: 'pin', left: 115, top: 1475, size: 36, fill: '#fbbf24' }),
        text({
          text: '장소 : 국립중앙도서관 국제회의장 대강당 (선착순 150명 사전 온라인 접수 무료)',
          left: 170, top: 1475, width: 950, fontSize: 22, fontWeight: 'bold', fill: '#ffffff'
        }),
        text({
          text: '사전 접수자 전원 저자 친필 엽서 및 북마크 증정 | 주최 : 지식살롱출판사  ·  국립중앙도서관',
          left: 170, top: 1520, width: 950, fontSize: 19, fill: '#a8a29e'
        }),
        text({
          text: '문의 : 02-3344-5566  |  온라인 참가신청 : www.booktalk2026.kr',
          left: 0, top: 1620, width: 1240, fontSize: 20, fill: '#78350f', textAlign: 'center'
        })
      ]
    },

    // 11. SNS 팔로우 & 댓글 인증 이벤트 (정사각 1080×1080)
    {
      id: 'promo-sns-event',
      category: 'promo',
      name: 'SNS 팔로우 & 포토후기 이벤트',
      note: '정사각 1080 × 1080 · 인스타그램/SNS 경품 추첨 이벤트 카드',
      width: 1080,
      height: 1080,
      background: '#fdf4ff',
      objects: [
        background({ left: 0, top: 0, width: 1080, height: 1080, fill: '#fdf4ff' }),
        // 화려한 핑크/바이올렛 그라데이션 상단
        gradientRect({ left: 0, top: 0, width: 1080, height: 210, gradient: PURPLE }),
        figure({ figureName: 'artPartyHat', left: 60, top: 40, size: 85 }),
        figure({ figureName: 'artGiftBox', left: 935, top: 40, size: 85 }),
        text({
          text: 'OFFICIAL INSTAGRAM EVENT',
          left: 0, top: 40, width: 1080, fontSize: 22, fontWeight: 'bold', fill: '#fce7f3', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '팔로우 & 포토리뷰 인증 이벤트',
          left: 0, top: 85, width: 1080, fontSize: 46, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '간단한 미션 참여하고 풍성한 선물의 주인공이 되어보세요! 🎁',
          left: 0, top: 150, width: 1080, fontSize: 22, fill: '#fdf4ff', textAlign: 'center'
        }),
        // 경품 이미지 슬롯
        rect({ left: 60, top: 235, width: 960, height: 350, fill: '#ffffff', rx: 16, stroke: '#f472b6', strokeWidth: 2 }),
        slot({ left: 60, top: 235, width: 960, height: 350, label: '경품 모음 사진 (에어팟/상품권/스타벅스)' }),
        // 3단계 참여 방법
        rect({ left: 60, top: 610, width: 960, height: 175, fill: '#ffffff', rx: 14, stroke: '#e9d5ff' }),
        text({
          text: 'STEP 1',
          left: 90, top: 630, width: 280, fontSize: 18, fontWeight: 'bold', fill: '#9333ea', textAlign: 'center'
        }),
        text({
          text: '공식 계정 팔로우\n& 게시물 좋아요',
          left: 90, top: 660, width: 280, fontSize: 21, fontWeight: 'bold', fill: '#1e1b4b', textAlign: 'center', lineHeight: 1.4
        }),

        rect({ left: 400, top: 630, width: 1, height: 130, fill: '#e9d5ff' }),

        text({
          text: 'STEP 2',
          left: 400, top: 630, width: 280, fontSize: 18, fontWeight: 'bold', fill: '#9333ea', textAlign: 'center'
        }),
        text({
          text: '제품/매장 사진\n필수 해시태그 업로드',
          left: 400, top: 660, width: 280, fontSize: 21, fontWeight: 'bold', fill: '#1e1b4b', textAlign: 'center', lineHeight: 1.4
        }),

        rect({ left: 710, top: 630, width: 1, height: 130, fill: '#e9d5ff' }),

        text({
          text: 'STEP 3',
          left: 710, top: 630, width: 280, fontSize: 18, fontWeight: 'bold', fill: '#9333ea', textAlign: 'center'
        }),
        text({
          text: '본 게시물 댓글에\n‘참여 완료’ 남기기',
          left: 710, top: 660, width: 280, fontSize: 21, fontWeight: 'bold', fill: '#1e1b4b', textAlign: 'center', lineHeight: 1.4
        }),

        // 당첨 선물 안내 박스
        rect({ left: 60, top: 810, width: 960, height: 155, fill: '#fff1f2', rx: 14, stroke: '#fecdd3' }),
        text({
          text: '🎉 푸짐한 당첨 선물 라인업 (총 111명 추첨)',
          left: 90, top: 830, width: 900, fontSize: 22, fontWeight: 'bold', fill: '#be123c'
        }),
        text({
          text: '• 1등 (1명) : 애플 에어팟 프로 2세대 (AirPods Pro 2)\n' +
            '• 2등 (10명) : 올리브영 모바일 기프트카드 3만원권\n' +
            '• 3등 (100명) : 스타벅스 달콤한 디저트 아메리카노 세트',
          left: 90, top: 870, width: 900, fontSize: 20, fill: '#881337', lineHeight: 1.6
        }),

        // 기간 및 태그
        text({
          text: '기간 : 2026. 10. 01 ~ 10. 20  |  당첨자 발표 : 10. 25(일) 공식 피드 및 개별 DM 공지',
          left: 0, top: 990, width: 1080, fontSize: 20, fontWeight: 'bold', fill: '#6b21a8', textAlign: 'center'
        }),
        text({
          text: '필수 해시태그 : #브랜드이벤트 #신제품후기 #일상기록 #팔로우이벤트',
          left: 0, top: 1025, width: 1080, fontSize: 18, fill: '#9ca3af', textAlign: 'center'
        })
      ]
    },

    // 12. 사내 사랑나눔 자선 바자회 (A4 세로 1240×1754)
    {
      id: 'promo-bazaar-corp',
      category: 'promo',
      name: '사내 사랑나눔 자선 바자회',
      note: 'A4 세로 1240 × 1754 · 기업 사회공헌/임직원 물품 기증 & 바자회',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 웜 오렌지 & 코랄 그라데이션
        gradientRect({ left: 0, top: 0, width: 1240, height: 290, gradient: WARM }),
        figure({ figureName: 'artFlowerBadge', left: 80, top: 40, size: 85 }),
        figure({ figureName: 'artHeartTrio', left: 1040, top: 40, size: 90 }),
        text({
          text: '2026 이웃사랑 실천 사회공헌 캠페인',
          left: 0, top: 45, width: 1240, fontSize: 28, fontWeight: 'bold', fill: '#fef08a', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '제6회 사내 사랑나눔 자선 바자회',
          left: 0, top: 100, width: 1240, fontSize: 60, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '작은 나눔이 만드는 큰 기적! 따뜻한 온기를 함께 전해주세요',
          left: 0, top: 195, width: 1240, fontSize: 26, fill: '#fff7ed', textAlign: 'center'
        }),
        // 바자회 사진 슬롯
        rect({ left: 80, top: 320, width: 1080, height: 480, fill: '#fff7ed', rx: 16, stroke: '#fdba74', strokeWidth: 2 }),
        slot({ left: 80, top: 320, width: 1080, height: 480, label: '바자회 현장 / 나눔 물품 사진을 넣어주세요' }),
        // 2개 섹션 안내 (물품 기증 vs 바자회 당일)
        rect({ left: 80, top: 830, width: 520, height: 350, fill: '#fffbeb', rx: 14, stroke: '#fde047' }),
        icon({ iconName: 'gift', left: 110, top: 855, size: 40, fill: '#b45309' }),
        text({ text: '물품 기증 안내', left: 165, top: 860, width: 400, fontSize: 26, fontWeight: 'bold', fill: '#78350f' }),
        text({
          text: '• 기증 기간 : 11월 02일(월) ~ 11월 13일(금)\n' +
            '• 기증 장소 : 본관 1층 나눔접수처 (인사팀)\n' +
            '• 기증 품목 : 의류, 도서, 음반, 소형 가전,\n' +
            '  생활용품, 미개봉 선물세트 등\n' +
            '• 기증 혜택 : 기증 임직원 전원 연말정산용\n' +
            '  기부금 영수증 발급 및 감사 기념품 지급',
          left: 110, top: 920, width: 470, fontSize: 20, fill: '#451a03', lineHeight: 1.7
        }),

        rect({ left: 640, top: 830, width: 520, height: 350, fill: '#fdf2f8', rx: 14, stroke: '#fbcfe8' }),
        icon({ iconName: 'calendar', left: 670, top: 855, size: 40, fill: '#db2777' }),
        text({ text: '바자회 행사 안내', left: 725, top: 860, width: 400, fontSize: 26, fontWeight: 'bold', fill: '#831843' }),
        text({
          text: '• 행사 일시 : 2026. 11. 20 (금) 11:30 ~ 17:00\n' +
            '• 행사 장소 : 사옥 B1 대강당 및 중앙 로비\n' +
            '• 판매 품목 : 임직원 기증 물품 (최대 90% 할인)\n' +
            '• 부대 행사 :\n' +
            '  - CEO 및 임원진 애장품 자선 경매 (13:00)\n' +
            '  - 임직원 일일 나눔카페 & 베이커리 운영',
          left: 670, top: 920, width: 470, fontSize: 20, fill: '#500724', lineHeight: 1.7
        }),

        // 기부금 전달 안내 박스
        rect({ left: 80, top: 1210, width: 1080, height: 160, fill: '#f0fdf4', rx: 14, stroke: '#86efac' }),
        icon({ iconName: 'heart', left: 120, top: 1245, size: 50, fill: '#16a34a' }),
        text({
          text: '💚 수익금 전액 기부 안내',
          left: 190, top: 1245, width: 850, fontSize: 26, fontWeight: 'bold', fill: '#14532d'
        }),
        text({
          text: '바자회 판매 수익금 전액과 미판매 잔여 물품은 관내 보육시설 및 독거어르신 겨울나기\n' +
            '난방비 지원 성금으로 전액 투명하게 전달됩니다.',
          left: 190, top: 1290, width: 950, fontSize: 21, fill: '#166534', lineHeight: 1.6
        }),

        // 하단 안내
        text({
          text: '따뜻한 마음으로 함께해주실 임직원 여러분의 많은 관심과 참여를 부탁드립니다.',
          left: 0, top: 1410, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#1e293b', textAlign: 'center'
        }),
        text({
          text: '주최 : 사내 사회봉사단  ·  노사협의회   |   문의처 : 사내나눔위원회 (내선 1004)',
          left: 0, top: 1460, width: 1240, fontSize: 21, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 13. 창립 기념일 행사 & 비전 선포식 (A4 세로 1240×1754)
    {
      id: 'promo-anniversary-corp',
      category: 'promo',
      name: '창립 기념일 행사 & 비전 선포식',
      note: 'A4 세로 1240 × 1754 · 창립 25주년 기념식/장기근속 시상/비전 선포',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 로열 네이비 & 골드 헤더
        gradientRect({ left: 0, top: 0, width: 1240, height: 320, gradient: DEEP }),
        icon({ iconName: 'award', left: 90, top: 50, size: 70, fill: '#fbbf24' }),
        figure({ figureName: 'artStarBurst', left: 1040, top: 40, size: 100, figureColors: ['#fbbf24'] }),
        text({
          text: 'THE 25TH ANNIVERSARY & VISION 2035',
          left: 0, top: 45, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#fbbf24', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '창립 제25주년 기념식 및 비전 선포식',
          left: 0, top: 100, width: 1240, fontSize: 58, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '도전으로 일군 25년의 역사, 신뢰와 혁신으로 여는 새로운 내일',
          left: 0, top: 195, width: 1240, fontSize: 26, fill: '#cbd5e1', textAlign: 'center'
        }),
        // 사옥 전경/기념 단체 사진 슬롯
        rect({ left: 80, top: 350, width: 1080, height: 500, fill: '#f8fafc', rx: 16, stroke: '#cbd5e1', strokeWidth: 2 }),
        slot({ left: 80, top: 350, width: 1080, height: 500, label: '사옥 전경 / 임직원 단체 기념 사진을 넣어주세요' }),
        // 식순 테이블
        text({ text: 'CEREMONY PROGRAM', left: 80, top: 880, width: 1080, fontSize: 20, fontWeight: 'bold', fill: '#2563eb', charSpacing: 3 }),
        text({ text: '창립 기념식 행사 식순', left: 80, top: 915, width: 1080, fontSize: 32, fontWeight: 'bold', fill: '#0f172a' }),

        {
          type: 'table',
          left: 80, top: 970,
          rows: 4, cols: 3,
          colWidths: [180, 300, 600], cellH: 60,
          fontSize: 20,
          headerRow: true,
          headerCol: false,
          headerFill: '#0f172a',
          borderColor: '#cbd5e1',
          cells: [
            [{ text: '구 분', fill: '#ffffff' }, { text: '시 간', fill: '#ffffff' }, { text: '주 요  내 용', fill: '#ffffff' }],
            [{ text: '제 1 부' }, { text: '10:30 ~ 11:00 (30분)' }, { text: '개식 선언, 국민의례, 25주년 기념 영상 상영' }],
            [{ text: '제 2 부' }, { text: '11:00 ~ 11:40 (40분)' }, { text: 'CEO 기념사 및 새로운 10년 비전 2035 선포식' }],
            [{ text: '제 3 부' }, { text: '11:40 ~ 12:30 (50분)' }, { text: '자랑스러운 혁신인상 & 10년/20년 장기근속자 포상' }]
          ]
        },

        // 장기근속 포상 및 혜택
        rect({ left: 80, top: 1260, width: 1080, height: 160, fill: '#fefce8', rx: 14, stroke: '#fde047' }),
        icon({ iconName: 'trophy', left: 120, top: 1290, size: 50, fill: '#ca8a04' }),
        text({
          text: '🏆 장기근속 포상 및 전 임직원 기념품 안내',
          left: 190, top: 1290, width: 850, fontSize: 24, fontWeight: 'bold', fill: '#854d0e'
        }),
        text({
          text: '• 20년 근속 : 순금 10돈 기념 메달 + 포상 휴가 10일 + 여행 상품권 300만원\n' +
            '• 10년 근속 : 순금 5돈 기념 메달 + 포상 휴가 5일 + 여행 상품권 150만원\n' +
            '• 전 임직원 : 창립 25주년 기념 스페셜 기프트 세트 및 기념 떡 지급',
          left: 190, top: 1335, width: 950, fontSize: 19, fill: '#713f12', lineHeight: 1.6
        }),

        // 일시/장소
        rect({ left: 80, top: 1450, width: 1080, height: 130, fill: '#0f172a', rx: 12 }),
        text({
          text: '• 일시 : 2026년 11월 06일 (금) 오전 10:30 ~ 13:30 (행사 후 오찬 연회)\n' +
            '• 장소 : 본관 3층 컨벤션 그랜드볼룸 (전 사업장 유튜브 생중계 병행)\n' +
            '• 복장 : 정장 또는 단정한 비즈니스 캐주얼 (사원증 패용 필수)',
          left: 120, top: 1475, width: 1000, fontSize: 21, fill: '#f8fafc', lineHeight: 1.6
        }),
        text({
          text: '주관 : 인재경영전략본부 기업문화팀  |  문의 : 02-2000-1200',
          left: 0, top: 1620, width: 1240, fontSize: 20, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 14. 임직원 리더십 역량강화 워크숍 (A4 세로 1240×1754)
    {
      id: 'promo-workshop-camp',
      category: 'promo',
      name: '임직원 리더십 역량강화 워크숍',
      note: 'A4 세로 1240 × 1754 · 1박2일 사외 워크숍/세미나/리더십 캠프',
      width: 1240,
      height: 1754,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1240, height: 1754, fill: '#ffffff' }),
        // 딥 틸 & 네이비 그라데이션
        gradientRect({ left: 0, top: 0, width: 1240, height: 290, gradient: TEAL }),
        figure({ figureName: 'illMountain', left: 80, top: 40, size: 85 }),
        icon({ iconName: 'flag', left: 1060, top: 40, size: 65, fill: '#5eead4' }),
        text({
          text: '2026 LEADERSHIP EXCELLENCE WORKSHOP',
          left: 0, top: 45, width: 1240, fontSize: 24, fontWeight: 'bold', fill: '#ccfbf1', textAlign: 'center', charSpacing: 4
        }),
        text({
          text: '팀장급 리더십 역량강화 워크숍',
          left: 0, top: 100, width: 1240, fontSize: 58, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '변화를 주도하는 힘! 미래를 설계하고 조직을 이끄는 리더',
          left: 0, top: 195, width: 1240, fontSize: 26, fill: '#e0f2fe', textAlign: 'center'
        }),
        // 워크숍 리조트/현장 사진 슬롯
        rect({ left: 80, top: 320, width: 1080, height: 480, fill: '#f0fdfa', rx: 16, stroke: '#5eead4', strokeWidth: 2 }),
        slot({ left: 80, top: 320, width: 1080, height: 480, label: '워크숍 연수원 / 리조트 전경 사진을 넣어주세요' }),
        // 1박 2일 일정 2단 카드
        text({ text: 'WORKSHOP CURRICULUM', left: 80, top: 830, width: 1080, fontSize: 20, fontWeight: 'bold', fill: '#0f766e', charSpacing: 2 }),
        text({ text: '1박 2일 주요 워크숍 프로그램', left: 80, top: 865, width: 1080, fontSize: 32, fontWeight: 'bold', fill: '#0f172a' }),

        // 1일차 카드
        rect({ left: 80, top: 920, width: 520, height: 350, fill: '#f0fdfa', rx: 14, stroke: '#99f6e4' }),
        rect({ left: 110, top: 945, width: 140, height: 40, fill: '#0f766e', rx: 20 }),
        text({ text: 'DAY 1 (도약)', left: 110, top: 953, width: 140, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({
          text: '• 08:30 ~ 10:30 : 사옥 집결 및 리조트 이동\n' +
            '• 10:30 ~ 12:30 : 기조 강연 - 지속가능한 조직문화\n' +
            '• 12:30 ~ 14:00 : 오찬 및 휴식\n' +
            '• 14:00 ~ 17:30 : 팀 빌딩 액티비티 & 소통 게임\n' +
            '• 18:00 ~ 21:00 : CEO와의 소통 만찬 & 화합의 밤',
          left: 110, top: 1015, width: 470, fontSize: 20, fill: '#134e4a', lineHeight: 1.8
        }),

        // 2일차 카드
        rect({ left: 640, top: 920, width: 520, height: 350, fill: '#eff6ff', rx: 14, stroke: '#bfdbfe' }),
        rect({ left: 670, top: 945, width: 140, height: 40, fill: '#1d4ed8', rx: 20 }),
        text({ text: 'DAY 2 (결실)', left: 670, top: 953, width: 140, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
        text({
          text: '• 08:00 ~ 09:30 : 조찬 및 힐링 숲길 산책\n' +
            '• 09:30 ~ 12:00 : 부서별 2027 핵심과제 분임토의\n' +
            '• 12:00 ~ 13:30 : 중식\n' +
            '• 13:30 ~ 15:30 : 분임토의 액션플랜 발표회\n' +
            '• 15:30 ~ 16:30 : 총평 및 수료식 / 사옥 복귀',
          left: 670, top: 1015, width: 470, fontSize: 20, fill: '#1e3a8a', lineHeight: 1.8
        }),

        // 안내사항 박스
        rect({ left: 80, top: 1300, width: 1080, height: 180, fill: '#0f172a', rx: 14 }),
        text({
          text: '📌 워크숍 참석 안내 및 유의사항',
          left: 120, top: 1325, width: 900, fontSize: 24, fontWeight: 'bold', fill: '#5eead4'
        }),
        text({
          text: '• 일시 : 2026년 10월 29일(목) ~ 10월 30일(금) [1박 2일]\n' +
            '• 장소 : 곤지암 리조트 컨벤션센터 그랜드볼룸 (경기 광주시 도척면 도척윗로 278)\n' +
            '• 집결 : 10월 29일(목) 08:20까지 본사 사옥 1층 로비 집결 (대형 전세버스 탑승 이동)\n' +
            '• 복장 : 비즈니스 캐주얼 및 운동화 (야외 산책용 편한 복장 지참)',
          left: 120, top: 1365, width: 1000, fontSize: 19, fill: '#e2e8f0', lineHeight: 1.6
        }),
        text({
          text: '주관 : 인사기획팀 인재개발파트   |   문의 : 02-3300-4455',
          left: 0, top: 1515, width: 1240, fontSize: 20, fill: '#64748b', textAlign: 'center'
        })
      ]
    },

    // 11. 행사 · 세미나 명찰 네임택 세트 (90 × 55mm 표준 가로형 목걸이 명찰)
    {
      id: 'print-event-badge',
      category: 'print',
      name: '행사 · 세미나 명찰 네임택',
      note: '표준 90 × 55mm 규격 (1063 × 650) 목걸이 명찰',
      width: 1063,
      height: 650,
      background: '#ffffff',
      objects: [
        background({ left: 0, top: 0, width: 1063, height: 650, fill: '#ffffff' }),
        gradientRect({ left: 0, top: 0, width: 1063, height: 18, gradient: grad(0, [
          { offset: 0, color: '#1d4ed8' }, { offset: 1, color: '#7c3aed' }
        ]) }),
        text({
          text: '2026 공공 데이터 혁신 포럼 & 테크 컨퍼런스',
          left: 60, top: 45, width: 943, fontSize: 24, fontWeight: 'bold', fill: '#475569', textAlign: 'center', charSpacing: 2
        }),
        rect({ left: 456, top: 95, width: 150, height: 38, fill: '#2563eb', rx: 19 }),
        text({
          text: 'VIP 초청인사',
          left: 456, top: 103, width: 150, fontSize: 19, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center'
        }),
        text({
          text: '홍   길   동',
          left: 60, top: 170, width: 943, fontSize: 82, fontWeight: 'bold', fill: '#0f172a', textAlign: 'center', charSpacing: 10
        }),
        text({
          text: '행정안전부 디지털정부혁신국',
          left: 60, top: 290, width: 943, fontSize: 32, fontWeight: 'bold', fill: '#2563eb', textAlign: 'center'
        }),
        text({
          text: '수석연구위원 / 단장',
          left: 60, top: 340, width: 943, fontSize: 26, fill: '#64748b', textAlign: 'center'
        }),
        rect({ left: 60, top: 410, width: 943, height: 1.5, fill: '#e2e8f0' }),
        text({
          text: '• 일시 : 2026년 10월 28일(수) 13:30 ~ 18:00\n• 장소 : 코엑스 그랜드볼룸 103호',
          left: 80, top: 440, width: 620, fontSize: 21, fill: '#475569', lineHeight: 1.6
        }),
        rect({ left: 880, top: 430, width: 110, height: 110, fill: '#f1f5f9', rx: 8, stroke: '#cbd5e1' }),
        text({ text: '출결 체크\nQR CODE', left: 880, top: 465, width: 110, fontSize: 16, fill: '#64748b', textAlign: 'center', lineHeight: 1.3 }),
        rect({ left: 0, top: 580, width: 1063, height: 70, fill: '#0f172a' }),
        text({
          text: '주최 : 행정안전부   |   주관 : 한국혁신진흥원 디지털데이터본부',
          left: 0, top: 603, width: 1063, fontSize: 20, fill: '#94a3b8', textAlign: 'center'
        })
      ]
    },

    // 12. 정년퇴직 송공패 · 재직기념패 (골드 프레임)
    {
      id: 'print-retirement-plaque',
      category: 'print',
      name: '정년퇴직 송공패 · 재직기념패',
      note: '가로형 감사패 · 앤틱 골드 프레임 (1400 × 1000)',
      width: 1400,
      height: 1000,
      background: '#0f172a',
      objects: [
        background({ left: 0, top: 0, width: 1400, height: 1000, fill: '#0f172a' }),
        rect({ left: 40, top: 40, width: 1320, height: 920, fill: 'rgba(0,0,0,0)', stroke: '#d97706', strokeWidth: 6, rx: 12 }),
        rect({ left: 54, top: 54, width: 1292, height: 892, fill: 'rgba(0,0,0,0)', stroke: '#f59e0b', strokeWidth: 1.5, rx: 8 }),
        rect({ left: 64, top: 64, width: 1272, height: 872, fill: 'rgba(0,0,0,0)', stroke: 'rgba(251, 191, 36, 0.4)', strokeWidth: 1 }),
        icon({ iconName: 'award', left: 630, top: 100, size: 140, fill: '#f59e0b' }),
        text({
          text: '송     공     패',
          left: 0, top: 250, width: 1400, fontSize: 84, fontWeight: 'bold', fill: '#fef08a', textAlign: 'center', charSpacing: 30
        }),
        text({
          text: '頌   功   牌',
          left: 0, top: 350, width: 1400, fontSize: 24, fill: '#d97706', textAlign: 'center', charSpacing: 16
        }),
        rect({ left: 580, top: 395, width: 240, height: 3, fill: '#f59e0b' }),
        text({
          text: '수석전문위원    홍    길    동',
          left: 0, top: 425, width: 1400, fontSize: 44, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center', charSpacing: 6
        }),
        text({
          text: '재직기간 : 1994년 03월 01일 ~ 2026년 12월 31일 (32년 10개월)',
          left: 0, top: 490, width: 1400, fontSize: 22, fill: '#fcd34d', textAlign: 'center'
        }),
        text({
          text: '귀하께서는 지난 32년간 투철한 사명감과 뜨거운 열정으로\n' +
            '본 기관의 공공 디지털 혁신과 위상을 드높이는 데 지대한 공헌을 하셨습니다.\n\n' +
            '동료와 후배들에게 보여주신 따뜻한 인품과 헌신적인 가르침은\n' +
            '우리 모두의 가슴속에 깊은 울림으로 영원히 간직될 것입니다.\n\n' +
            '영예로운 정년퇴임을 맞이하여 그간의 빛나는 노고에 깊은 감사와 존경을 드리며,\n' +
            '앞날에 건강과 무궁한 영광이 함께하기를 진심으로 기원합니다.',
          left: 140, top: 540, width: 1120, fontSize: 25, fill: '#f8fafc', lineHeight: 1.85, textAlign: 'center'
        }),
        text({ text: '2026년 12월 31일', left: 0, top: 780, width: 1400, fontSize: 28, fill: '#fcd34d', textAlign: 'center' }),
        text({
          text: '주 식 회 사   대 한 엔 터 프 라 이 즈   임 직 원   일 동',
          left: 0, top: 840, width: 1400, fontSize: 40, fontWeight: 'bold', fill: '#fef08a', textAlign: 'center', charSpacing: 6
        })
      ]
    }
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
    },
    navyGold: {
      label: '네이비 & 골드',
      accent: '#d97706', accentSoft: '#fef3c7', accentLine: '#fde68a',
      deep: [{ offset: 0, color: '#090d16' }, { offset: 1, color: '#1e293b' }],
      soft: [{ offset: 0, color: '#f8fafc' }, { offset: 1, color: '#f1f5f9' }],
      ink: '#0f172a', sub: '#475569', faint: '#94a3b8',
      onDark: '#ffffff', onDarkSub: '#fef08a', darkBg: '#090d16',
      cards: [
        { bg: '#fefce8', icon: '#ca8a04' },
        { bg: '#f8fafc', icon: '#1e293b' },
        { bg: '#eff6ff', icon: '#2563eb' }
      ],
      chart: ['#d97706', '#1e293b', '#2563eb']
    },
    coral: {
      label: '코랄 & 로즈',
      accent: '#e11d48', accentSoft: '#ffe4e6', accentLine: '#fecdd3',
      deep: [{ offset: 0, color: '#881337' }, { offset: 1, color: '#e11d48' }],
      soft: [{ offset: 0, color: '#fff1f2' }, { offset: 1, color: '#ffe4e6' }],
      ink: '#111827', sub: '#4b5563', faint: '#9ca3af',
      onDark: '#ffffff', onDarkSub: '#fecdd3', darkBg: '#881337',
      cards: [
        { bg: '#fff1f2', icon: '#e11d48' },
        { bg: '#fff7ed', icon: '#ea580c' },
        { bg: '#fefce8', icon: '#ca8a04' }
      ],
      chart: ['#e11d48', '#ea580c', '#ca8a04']
    },
    darkTech: {
      label: '다크 테크 & AI',
      accent: '#06b6d4', accentSoft: '#164e63', accentLine: '#0891b2',
      deep: [{ offset: 0, color: '#030712' }, { offset: 1, color: '#0f172a' }],
      soft: [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1e293b' }],
      ink: '#f8fafc', sub: '#cbd5e1', faint: '#64748b',
      onDark: '#ffffff', onDarkSub: '#67e8f9', darkBg: '#030712',
      cards: [
        { bg: '#0f172a', icon: '#06b6d4' },
        { bg: '#1e1b4b', icon: '#8b5cf6' },
        { bg: '#064e3b', icon: '#10b981' }
      ],
      chart: ['#06b6d4', '#8b5cf6', '#10b981']
    },
    emerald: {
      label: '에메랄드 & ESG',
      accent: '#059669', accentSoft: '#d1fae5', accentLine: '#6ee7b7',
      deep: [{ offset: 0, color: '#064e3b' }, { offset: 1, color: '#059669' }],
      soft: [{ offset: 0, color: '#ecfdf5' }, { offset: 1, color: '#d1fae5' }],
      ink: '#064e3b', sub: '#374151', faint: '#9ca3af',
      onDark: '#ffffff', onDarkSub: '#a7f3d0', darkBg: '#064e3b',
      cards: [
        { bg: '#ecfdf5', icon: '#059669' },
        { bg: '#f0fdf4', icon: '#16a34a' },
        { bg: '#fefce8', icon: '#ca8a04' }
      ],
      chart: ['#059669', '#16a34a', '#ca8a04']
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

  function sVisionMission(T) {
    return slideHead(T, '비전 및 핵심 가치 (Vision & Core Values)').concat([
      rect({ left: 120, top: 250, width: 1680, height: 130, fill: T.accentSoft, rx: 16, ry: 16 }),
      text({
        text: 'MISSION & VISION', left: 160, top: 272, width: 300,
        fontSize: 24, fontWeight: 'bold', fill: T.accent
      }),
      text({
        text: '“기술과 디자인의 융합으로 일상의 행정 및 업무 프로세스를 가장 스마트하게 혁신합니다”',
        left: 160, top: 310, width: 1600, fontSize: 34, fontWeight: 'bold', fill: T.ink
      }),

      rect({ left: 120, top: 420, width: 530, height: 490, fill: T.cards[0].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'sparkle', left: 160, top: 460, size: 70, fill: T.cards[0].icon }),
      text({ text: '01. 혁신 지향 (Innovation)', left: 160, top: 550, width: 450, fontSize: 34, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 160, top: 605, width: 450, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 관행을 탈피한 직관적 사용자 경험(UX)\n· 온디바이스 독립형 경량 그래픽 엔진 고도화\n· 국내 공공/행정 규격에 최적화된 표준화',
        left: 160, top: 630, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 695, top: 420, width: 530, height: 490, fill: T.cards[1].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'heart', left: 735, top: 460, size: 70, fill: T.cards[1].icon }),
      text({ text: '02. 고객 중심 (User Centric)', left: 735, top: 550, width: 450, fontSize: 34, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 735, top: 605, width: 450, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 실무자 목소리를 주간 단위로 반영하는 애자일 체계\n· 학습 없이 당일 바로 쓰는 쉬운 인터페이스\n· 철저한 데이터 보안 및 망분리 완벽 호환',
        left: 735, top: 630, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 1270, top: 420, width: 530, height: 490, fill: T.cards[2].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'shield', left: 1310, top: 460, size: 70, fill: T.cards[2].icon }),
      text({ text: '03. 상생 신뢰 (Trust & Value)', left: 1310, top: 550, width: 450, fontSize: 34, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 1310, top: 605, width: 450, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 투명한 경영 및 파트너사 동반 성장 가치 창출\n· 공공·교육기관 무료 배포를 통한 디지털 포용\n· 환경과 사회적 책임을 다하는 ESG 지속경영',
        left: 1310, top: 630, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      })
    ]);
  }

  function sProblemSolution(T) {
    return slideHead(T, '문제점 및 해결 방안 (Problem & Solution)').concat([
      // Left: Pain points
      rect({ left: 120, top: 250, width: 810, height: 660, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 2, rx: 16, ry: 16 }),
      rect({ left: 120, top: 250, width: 810, height: 74, fill: '#64748b', rx: 16, ry: 16 }),
      text({ text: 'MARKET PAIN POINTS (기존의 문제)', left: 160, top: 270, width: 730, fontSize: 30, fontWeight: 'bold', fill: '#ffffff' }),

      rect({ left: 160, top: 360, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '① 고비용 & 복잡한 외산 그래픽 툴', left: 190, top: 380, width: 680, fontSize: 28, fontWeight: 'bold', fill: '#dc2626' }),
      text({ text: '과도한 연간 라이선스 비용과 어려운 기능으로 실무자 적응 곤란', left: 190, top: 425, width: 680, fontSize: 23, fill: '#64748b' }),

      rect({ left: 160, top: 520, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '② 템플릿의 서구화 및 한국 행정 규격 부재', left: 190, top: 540, width: 680, fontSize: 28, fontWeight: 'bold', fill: '#dc2626' }),
      text({ text: '국내 공문서, 보고서, A4 표준 규격이 없어 처음부터 재작업 반복', left: 190, top: 585, width: 680, fontSize: 23, fill: '#64748b' }),

      rect({ left: 160, top: 680, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '③ 망분리 사내망 접속 불가 및 보안 위험', left: 190, top: 700, width: 680, fontSize: 28, fontWeight: 'bold', fill: '#dc2626' }),
      text({ text: '클라우드 필수 연결 강제로 공공기관 및 대기업 업무망 도입 원천 차단', left: 190, top: 745, width: 680, fontSize: 23, fill: '#64748b' }),

      // Right: Solution
      rect({ left: 990, top: 250, width: 810, height: 660, fill: T.accentSoft, stroke: T.accent, strokeWidth: 2, rx: 16, ry: 16 }),
      rect({ left: 990, top: 250, width: 810, height: 74, fill: T.accent, rx: 16, ry: 16 }),
      text({ text: 'OUR INNOVATIVE SOLUTION (우리의 해결책)', left: 1030, top: 270, width: 730, fontSize: 30, fontWeight: 'bold', fill: '#ffffff' }),

      rect({ left: 1030, top: 360, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '① 가볍고 직관적인 웹 기반 단일 에디터', left: 1060, top: 380, width: 680, fontSize: 28, fontWeight: 'bold', fill: T.accent }),
      text({ text: '설치 없이 브라우저에서 즉시 실행, 핵심 기능 중심 10분 마스터', left: 1060, top: 425, width: 680, fontSize: 23, fill: T.sub }),

      rect({ left: 1030, top: 520, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '② 100% 한국 표준 행정 · 비즈니스 템플릿 완비', left: 1060, top: 540, width: 680, fontSize: 28, fontWeight: 'bold', fill: T.accent }),
      text({ text: '공문서, 현수막, 사원증, 보고서 등 실무 즉시 사용 가능한 서식 완비', left: 1060, top: 585, width: 680, fontSize: 23, fill: T.sub }),

      rect({ left: 1030, top: 680, width: 730, height: 140, fill: '#ffffff', rx: 12, ry: 12 }),
      text({ text: '③ 100% 오프라인 단일 파일 동작 & 철저한 보안', left: 1060, top: 700, width: 680, fontSize: 28, fontWeight: 'bold', fill: T.accent }),
      text({ text: '외부 통신 없는 로컬 처리, 공공기관 망분리 PC에서도 완벽 구동', left: 1060, top: 745, width: 680, fontSize: 23, fill: T.sub })
    ]);
  }

  function sMarketSize(T) {
    return slideHead(T, '목표 시장 규모 (Market Size TAM · SAM · SOM)').concat([
      text({
        text: '국내외 비즈니스 비주얼 협업 도구 시장은 연평균 18.4% 이상 고성장 중입니다.',
        left: 120, top: 240, width: 1680, fontSize: 32, fill: T.sub
      }),
      // TAM Card
      rect({ left: 120, top: 320, width: 530, height: 500, fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 160, top: 360, width: 110, height: 44, fill: '#64748b', rx: 8, ry: 8 }),
      text({ text: 'TAM', left: 160, top: 368, width: 110, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '글로벌 전체 유효 시장', left: 160, top: 425, width: 450, fontSize: 28, fontWeight: 'bold', fill: T.ink }),
      text({ text: '124조 원', left: 160, top: 480, width: 450, fontSize: 68, fontWeight: 'bold', fill: '#334155' }),
      rect({ left: 160, top: 580, width: 450, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 글로벌 업무용 비주얼 협업 툴 시장\n· 전 세계 SaaS 기반 문서 도구 합산\n· 최근 5년간 연평균 +19.2% 성장세',
        left: 160, top: 610, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      // SAM Card
      rect({ left: 695, top: 320, width: 530, height: 500, fill: T.accentSoft, stroke: T.accentLine, strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 735, top: 360, width: 110, height: 44, fill: T.accent, rx: 8, ry: 8 }),
      text({ text: 'SAM', left: 735, top: 368, width: 110, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '국내 유효 타깃 시장', left: 735, top: 425, width: 450, fontSize: 28, fontWeight: 'bold', fill: T.ink }),
      text({ text: '24.5조 원', left: 735, top: 480, width: 450, fontSize: 68, fontWeight: 'bold', fill: T.accent }),
      rect({ left: 735, top: 580, width: 450, height: 1, fill: T.accentLine }),
      text({
        text: '· 국내 공공기관, 지자체, 공기업\n· 중소·중견기업 및 스타트업 오피스\n· 공공 조달 및 교육기관 소프트웨어',
        left: 735, top: 610, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      // SOM Card
      rect({ left: 1270, top: 320, width: 530, height: 500, fill: T.cards[1].bg, stroke: T.cards[1].icon, strokeWidth: 2, rx: 16, ry: 16 }),
      rect({ left: 1310, top: 360, width: 110, height: 44, fill: T.cards[1].icon, rx: 8, ry: 8 }),
      text({ text: 'SOM', left: 1310, top: 368, width: 110, fontSize: 22, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '초기 3개년 수익 시장', left: 1310, top: 425, width: 450, fontSize: 28, fontWeight: 'bold', fill: T.ink }),
      text({ text: '3,800억 원', left: 1310, top: 480, width: 450, fontSize: 68, fontWeight: 'bold', fill: T.cards[1].icon }),
      rect({ left: 1310, top: 580, width: 450, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 망분리 보안 필수 공공/금융 기관\n· 사내 디자인 전담 인력 부족 중소기업\n· 3년 내 점유율 15% 달성 목표',
        left: 1310, top: 610, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 120, top: 860, width: 1680, height: 60, fill: '#f1f5f9', rx: 10, ry: 10 }),
      text({
        text: '※ 출처 : 글로벌 IT 리서치 기관 보고서(2025) 및 공공 디지털 혁신 실태조사 기반 산출',
        left: 150, top: 878, width: 1600, fontSize: 22, fill: T.faint
      })
    ]);
  }

  function sTeamProfile(T) {
    var members = [
      { role: 'CEO / 대표이사', name: '이 진 우', exp: '· 서울대 컴퓨터공학 학·석사\n· 전 ○○소프트 기술총괄(CTO)\n· 벤처 창업 12년, M&A 엑시트 1회' },
      { role: 'CTO / 기술이사', name: '박 서 연', exp: '· KAIST 전산학부 박사\n· 글로벌 클라우드 아키텍트 15년\n· 오픈소스 그래픽 엔진 핵심 커미터' },
      { role: 'CPO / 기획총괄', name: '정 민 재', exp: '· 고려대 경영학 학사\n· 유니콘 IT 서비스 PM 10년\n· 공공/엔터프라이즈 UX 프로젝트 총괄' },
      { role: 'CMO / 사업총괄', name: '최 유 나', exp: '· 연세대 신문방송학 학사\n· 글로벌 SaaS 세일즈 10년\n· 100+ 공공/기업 고객사 제휴 총괄' }
    ];

    var objs = slideHead(T, '핵심 경영진 및 전문 팀원 (Key Team Members)');
    members.forEach(function (m, i) {
      var x = 120 + i * 430;
      objs.push(rect({ left: x, top: 260, width: 380, height: 650, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 16, ry: 16 }));
      objs.push(slot({ left: x + 40, top: 300, width: 300, height: 260, label: '인물 사진' }));
      objs.push(rect({ left: x + 40, top: 580, width: 140, height: 34, fill: T.accentSoft, rx: 6, ry: 6 }));
      objs.push(text({ text: m.role, left: x + 46, top: 587, width: 128, fontSize: 18, fontWeight: 'bold', fill: T.accent, textAlign: 'center' }));
      objs.push(text({ text: m.name, left: x + 40, top: 628, width: 300, fontSize: 34, fontWeight: 'bold', fill: T.ink }));
      objs.push(rect({ left: x + 40, top: 685, width: 300, height: 1, fill: '#e2e8f0' }));
      objs.push(text({ text: m.exp, left: x + 40, top: 705, width: 300, fontSize: 22, fill: T.sub, lineHeight: 1.6 }));
    });
    return objs;
  }

  function sWbsRoadmap(T) {
    var phases = [
      {
        tag: 'Phase 1 · 2026. 1Q',
        title: '핵심 엔진 및 보안 인프라',
        items: ['· 단일 파일 오프라인 구동 엔진 검증', '· 한국형 템플릿 60종 1차 구축', '· 공공 망분리 환경 보안 테스트 통과']
      },
      {
        tag: 'Phase 2 · 2026. 2Q',
        title: 'B2B 기능 고도화 & 시범 도입',
        items: ['· PPTX 및 HWPX 고품질 변환기 탑재', '· 지자체 10개 기관 시범 사업 도입', '· 얼굴 인식 및 AI 보정 오프라인 내장']
      },
      {
        tag: 'Phase 3 · 2026. 3Q',
        title: '본격 확산 및 생태계 구축',
        items: ['· 조달청 나라장터 종합쇼핑몰 등록', '· 300개 공공기관 및 대기업 정식 도입', '· 사용자 커스텀 템플릿 마켓플레이스']
      },
      {
        tag: 'Phase 4 · 2026. 4Q',
        title: '글로벌 진출 및 차세대 AI',
        items: ['· 아시아 주요국 다국어(영·일·중) 현지화', '· 온디바이스 생성형 비주얼 보조 탑재', '· 연간 반복 매출(ARR) 50억 원 달성']
      }
    ];

    var objs = slideHead(T, '추진 로드맵 및 핵심 마일스톤 (WBS Roadmap)');
    objs.push(rect({ left: 120, top: 340, width: 1680, height: 6, fill: T.accentLine }));

    phases.forEach(function (p, i) {
      var x = 120 + i * 430;
      objs.push(circle({ left: x + 40, top: 323, radius: 20, fill: T.accent }));
      objs.push(text({ text: String(i + 1), left: x + 40, top: 331, width: 40, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }));
      objs.push(rect({ left: x, top: 390, width: 390, height: 510, fill: T.cards[i % 3].bg, rx: 16, ry: 16 }));
      objs.push(text({ text: p.tag, left: x + 30, top: 420, width: 330, fontSize: 22, fontWeight: 'bold', fill: T.cards[i % 3].icon }));
      objs.push(text({ text: p.title, left: x + 30, top: 465, width: 330, fontSize: 28, fontWeight: 'bold', fill: T.ink, lineHeight: 1.3 }));
      objs.push(rect({ left: x + 30, top: 545, width: 330, height: 1, fill: '#cbd5e1' }));
      objs.push(text({ text: p.items.join('\n\n'), left: x + 30, top: 570, width: 330, fontSize: 23, fill: T.sub, lineHeight: 1.5 }));
    });
    return objs;
  }

  function sKpiDashboard(T) {
    var kpis = [
      { label: '전년 대비 매출 성장률', val: '+240%', note: '2025년 대비 3.4배 폭발적 성장', icon: 'sparkle', color: T.accent },
      { label: '월간 순수 이용자 (MAU)', val: '120만 명', note: '공공 및 기업 실무자 중심 활성 유저', icon: 'users', color: '#0d9488' },
      { label: '사용자 종합 만족도', val: '98.4점', note: '업무 시간 65% 절감 효과 검증', icon: 'trophy', color: '#d97706' },
      { label: '고객사 계약 유지율 (Retention)', val: '94.2%', note: '엔터프라이즈 재계약 기준 연간 수치', icon: 'checkCircle', color: '#7c3aed' }
    ];

    var objs = slideHead(T, '핵심 사업 성과 대시보드 (Key Performance Indicators)');
    kpis.forEach(function (k, i) {
      var x = 120 + i * 430;
      objs.push(rect({ left: x, top: 260, width: 380, height: 480, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 16, ry: 16 }));
      objs.push(rect({ left: x + 30, top: 290, width: 70, height: 70, fill: T.accentSoft, rx: 14, ry: 14 }));
      objs.push(icon({ iconName: k.icon, left: x + 40, top: 300, size: 50, fill: k.color }));
      objs.push(text({ text: k.label, left: x + 30, top: 390, width: 320, fontSize: 26, fontWeight: 'bold', fill: T.ink }));
      objs.push(text({ text: k.val, left: x + 30, top: 450, width: 320, fontSize: 62, fontWeight: 'bold', fill: k.color }));
      objs.push(rect({ left: x + 30, top: 550, width: 320, height: 1, fill: '#f1f5f9' }));
      objs.push(text({ text: k.note, left: x + 30, top: 580, width: 320, fontSize: 22, fill: T.sub, lineHeight: 1.5 }));
    });

    objs.push(rect({ left: 120, top: 780, width: 1680, height: 130, fill: T.accentSoft, rx: 16, ry: 16 }));
    objs.push(text({
      text: 'SUMMARY : 전 부문 목표치(Target) 대비 112% 초과 달성하였으며, 2026년 하반기 흑자 전환을 달성할 것으로 예상됩니다.',
      left: 160, top: 825, width: 1600, fontSize: 28, fontWeight: 'bold', fill: T.accent
    }));
    return objs;
  }

  function sBudgetTable(T) {
    return slideHead(T, '소요 예산 및 재원 조달 계획').concat([
      {
        type: 'table', left: 120, top: 250, rows: 6, cols: 5,
        cellW: 336, cellH: 95, fontSize: 28,
        headerRow: true, headerFill: T.accentSoft, borderColor: '#cbd5e1',
        cells: [
          [{ text: '비목 구분' }, { text: '세부 내역 및 산출 근거' }, { text: '정부/투자금(천원)' }, { text: '자부담(천원)' }, { text: '합계(천원)' }],
          [{ text: '1. 인건비' }, { text: '핵심 연구원 및 개발 인력 6인 (12개월)' }, { text: '168,000' }, { text: '42,000' }, { text: '210,000' }],
          [{ text: '2. 연구활동비' }, { text: '국내외 특허 출원 4건 및 기술 자문' }, { text: '32,000' }, { text: '8,000' }, { text: '40,000' }],
          [{ text: '3. 클라우드·서버' }, { text: '오프라인 패키징 검증 및 보안 감사' }, { text: '48,000' }, { text: '12,000' }, { text: '60,000' }],
          [{ text: '4. 마케팅·전시' }, { text: '나라장터 엑스포 참가 및 B2B 홍보' }, { text: '24,000' }, { text: '6,000' }, { text: '30,000' }],
          [{ text: '합  계' }, { text: '총 사업비 (국비/투자금 80% + 자부담 20%)' }, { text: '272,000' }, { text: '68,000' }, { text: '340,000' }]
        ]
      },
      text({
        text: '※ 모든 비목은 정부 회계 기준 및 연구개발비 산정 가이드라인을 엄격히 준수하여 책정되었습니다.',
        left: 120, top: 880, width: 1680, fontSize: 24, fill: T.faint
      })
    ]);
  }

  function sPersona(T) {
    return slideHead(T, '타깃 고객 페르소나 (Target Persona)').concat([
      rect({ left: 120, top: 250, width: 500, height: 660, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 2, rx: 16, ry: 16 }),
      slot({ left: 160, top: 290, width: 420, height: 320, label: '페르소나 사진' }),
      text({ text: '김 서 연 (34세)', left: 160, top: 630, width: 420, fontSize: 34, fontWeight: 'bold', fill: T.ink }),
      text({ text: '지자체 문화관광과 7년 차 주무관', left: 160, top: 680, width: 420, fontSize: 24, fill: T.accent }),
      rect({ left: 160, top: 720, width: 420, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 매달 수십 건의 행사 포스터, 공고문, 보고서 제작\n· 그래픽 툴 전문 지식 없음\n· 망분리 업무 PC에서 작업 필수',
        left: 160, top: 745, width: 420, fontSize: 22, fill: T.sub, lineHeight: 1.6
      }),

      rect({ left: 660, top: 250, width: 1140, height: 310, fill: T.cards[0].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'target', left: 700, top: 285, size: 50, fill: T.cards[0].icon }),
      text({ text: '핵심 목표 및 필요성 (Key Goals & Needs)', left: 770, top: 295, width: 1000, fontSize: 32, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '· 외주 업체 의뢰 없이 당일 급한 홍보물 및 보고서를 10분 내로 완성하고 싶음\n· 한국 행정 규격(A4, 현수막, 공문서)에 딱 맞는 고품질 템플릿이 즉시 필요함\n· 팀원들과 별도 프로그램 설치 없이 안전하게 문서를 공유하고 재활용하고 싶음',
        left: 700, top: 370, width: 1060, fontSize: 26, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 660, top: 600, width: 1140, height: 310, fill: '#fff1f2', rx: 16, ry: 16 }),
      icon({ iconName: 'bulb', left: 700, top: 635, size: 50, fill: '#e11d48' }),
      text({ text: '주요 불편사항 및 장애물 (Pain Points)', left: 770, top: 645, width: 1000, fontSize: 32, fontWeight: 'bold', fill: '#9f1239' }),
      text({
        text: '· 사내 보안 정책상 인터넷 연결이 불가능하여 기존 클라우드 디자인 툴 접속 차단\n· 복잡한 전문 그래픽 툴(포토샵 등)은 배우기 어렵고 라이선스 구입 예산 부족\n· 매번 빈 캔버스에서 시작하느라 문서 양식 통일성이 깨지고 업무 피로도 누적',
        left: 700, top: 720, width: 1060, fontSize: 26, fill: '#881337', lineHeight: 1.7
      })
    ]);
  }

  function sEsgThreePillars(T) {
    return slideHead(T, 'ESG 3대 핵심 추진 전략 (ESG Strategy)').concat([
      rect({ left: 120, top: 250, width: 530, height: 650, fill: '#f0fdf4', stroke: '#86efac', strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 160, top: 290, width: 130, height: 44, fill: '#16a34a', rx: 8, ry: 8 }),
      text({ text: 'Environment', left: 160, top: 298, width: 130, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '친환경 디지털 경영', left: 160, top: 360, width: 450, fontSize: 36, fontWeight: 'bold', fill: '#14532d' }),
      text({
        text: '“종이 없는 페이퍼리스 오피스 실현”\n\n· 100% 디지털 문서화로 연간 A4 500만 장 절감\n· 클라우드 서버 탄소 배출 제로화 달성\n· 전 사업장 친환경 에너지 전환율 60%',
        left: 160, top: 430, width: 450, fontSize: 24, fill: '#166534', lineHeight: 1.7
      }),

      rect({ left: 695, top: 250, width: 530, height: 650, fill: '#eff6ff', stroke: '#93c5fd', strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 735, top: 290, width: 130, height: 44, fill: '#2563eb', rx: 8, ry: 8 }),
      text({ text: 'Social', left: 735, top: 298, width: 130, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '사회적 상생 및 안전', left: 735, top: 360, width: 450, fontSize: 36, fontWeight: 'bold', fill: '#1e3a8a' }),
      text({
        text: '“동반 성장과 사람 중심 일터 구축”\n\n· 디지털 취약계층 대상 무료 교육 지원 확대\n· 안전보건 경영시스템(ISO 45001) 인증 획득\n· 지역 청년 디지털 일자리 매년 30% 신규 창출',
        left: 735, top: 430, width: 450, fontSize: 24, fill: '#1e40af', lineHeight: 1.7
      }),

      rect({ left: 1270, top: 250, width: 530, height: 650, fill: '#faf5ff', stroke: '#d8b4fe', strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 1310, top: 290, width: 130, height: 44, fill: '#7c3aed', rx: 8, ry: 8 }),
      text({ text: 'Governance', left: 1310, top: 298, width: 130, fontSize: 20, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '투명한 윤리 지배구조', left: 1310, top: 360, width: 450, fontSize: 36, fontWeight: 'bold', fill: '#581c87' }),
      text({
        text: '“신뢰받는 준법 경영 문화 정착”\n\n· 사외이사 독립성 강화 및 ESG 위원회 가동\n· 정기 준법 윤리 감사 및 내부고발자 보호 제도\n· 공시 정보 투명성 강화 및 주주 소통 확대',
        left: 1310, top: 430, width: 450, fontSize: 24, fill: '#6b21a8', lineHeight: 1.7
      })
    ]);
  }

  function sMobileMockup(T) {
    return slideHead(T, '서비스 핵심 기능 및 화면 구성').concat([
      rect({ left: 160, top: 240, width: 380, height: 680, fill: '#1e293b', rx: 36, ry: 36 }),
      rect({ left: 180, top: 270, width: 340, height: 620, fill: '#ffffff', rx: 20, ry: 20 }),
      slot({ left: 180, top: 270, width: 340, height: 620, label: '모바일 화면 스크린샷' }),

      rect({ left: 600, top: 250, width: 1200, height: 200, fill: T.cards[0].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'sparkle', left: 640, top: 285, size: 50, fill: T.cards[0].icon }),
      text({ text: 'Feature 01. 원클릭 한국형 양식 자동 완성', left: 720, top: 285, width: 1040, fontSize: 32, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '공문서, 보고서, 현수막 등 한국 기관 표준 규격 템플릿을 선택 즉시 최적 레이아웃으로 자동 배치합니다.',
        left: 720, top: 345, width: 1040, fontSize: 24, fill: T.sub
      }),

      rect({ left: 600, top: 480, width: 1200, height: 200, fill: T.cards[1].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'shield', left: 640, top: 515, size: 50, fill: T.cards[1].icon }),
      text({ text: 'Feature 02. 완벽한 망분리 오프라인 보안 구동', left: 720, top: 515, width: 1040, fontSize: 32, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '외부 네트워크 연결 없이 로컬 환경에서 100% 동작하여 기업 및 공공기관의 핵심 기밀 데이터를 안전하게 지킵니다.',
        left: 720, top: 575, width: 1040, fontSize: 24, fill: T.sub
      }),

      rect({ left: 600, top: 710, width: 1200, height: 200, fill: T.cards[2].bg, rx: 16, ry: 16 }),
      icon({ iconName: 'rocket', left: 640, top: 745, size: 50, fill: T.cards[2].icon }),
      text({ text: 'Feature 03. 다양한 포맷 즉시 변환 & 내보내기', left: 720, top: 745, width: 1040, fontSize: 32, fontWeight: 'bold', fill: T.ink }),
      text({
        text: '고해상도 인쇄용 PNG/JPG는 물론 PPTX 프레젠테이션 및 HWPX 공문서 규격으로 즉시 변환하여 보관할 수 있습니다.',
        left: 720, top: 805, width: 1040, fontSize: 24, fill: T.sub
      })
    ]);
  }

  function sProjectSummary(T) {
    return slideHead(T, '프로젝트 총괄 결과 요약 (Executive Summary)').concat([
      rect({ left: 120, top: 250, width: 1680, height: 130, fill: T.accentSoft, rx: 16, ry: 16 }),
      icon({ iconName: 'trophy', left: 160, top: 280, size: 70, fill: T.accent }),
      text({
        text: '프로젝트 총괄 평가 : 최종 목표 대비 108.5% 초과 달성 및 성공적 납품 완료',
        left: 260, top: 285, width: 1500, fontSize: 34, fontWeight: 'bold', fill: T.ink
      }),
      text({
        text: '당초 계획된 4대 핵심 마일스톤을 기한 내 100% 완수하였으며, 품질 결함률 0건으로 안정적 인수 인계를 마쳤습니다.',
        left: 260, top: 330, width: 1500, fontSize: 24, fill: T.sub
      }),

      rect({ left: 120, top: 410, width: 530, height: 490, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 16, ry: 16 }),
      text({ text: '성과 01. 일정 준수', left: 160, top: 450, width: 450, fontSize: 30, fontWeight: 'bold', fill: T.accent }),
      text({ text: '공정 지연 0일', left: 160, top: 510, width: 450, fontSize: 52, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 160, top: 590, width: 450, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 총 180일 일정 중 단 하루의 지연 없이 단계별 검수 100% 적기 완료\n· 조기 위험 식별 및 기동 TF 운영을 통한 사전 리스크 완벽 제거',
        left: 160, top: 620, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 695, top: 410, width: 530, height: 490, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 16, ry: 16 }),
      text({ text: '성과 02. 품질 지표', left: 735, top: 450, width: 450, fontSize: 30, fontWeight: 'bold', fill: T.accent }),
      text({ text: '무결함 검수 통과', left: 735, top: 510, width: 450, fontSize: 52, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 735, top: 590, width: 450, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 단위 및 통합 테스트 시나리오 1,200개 100% 통과\n· 국가 공인 보안 취약점 점검 및 기능성 적합성 인증 최고 등급 획득',
        left: 735, top: 620, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 1270, top: 410, width: 530, height: 490, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1.5, rx: 16, ry: 16 }),
      text({ text: '성과 03. 예산 절감', left: 1310, top: 450, width: 450, fontSize: 30, fontWeight: 'bold', fill: T.accent }),
      text({ text: '예산 대비 94.2% 집행', left: 1310, top: 510, width: 450, fontSize: 52, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 1310, top: 590, width: 450, height: 1, fill: '#e2e8f0' }),
      text({
        text: '· 총 사업비 절감액 1,980만 원 국고 반납 완료\n· 효율적 인력 배치와 불필요 소프트웨어 중복 구매 차단 성과',
        left: 1310, top: 620, width: 450, fontSize: 24, fill: T.sub, lineHeight: 1.7
      })
    ]);
  }

  function sChecklist(T) {
    var items = [
      { num: '01', title: '사내 인트라넷 계정 발급 및 보안 서약서 제출', desc: '정보보안팀 승인 후 사내 포털 및 이메일 계정 연동 확인', done: true },
      { num: '02', title: '신입사원 필수 법정 의무 교육 이수', desc: '개인정보보호, 직장 내 성희롱 예방, 산업안전보건 교육 온라인 수강', done: true },
      { num: '03', title: '업무 장비(PC/노트북) 수령 및 필수 소프트웨어 세팅', desc: '사내 자산 관리 시스템 등록 및 보안 솔루션 필수 설치', done: true },
      { num: '04', title: '부서 멘토 지정 및 1주 차 온보딩 미팅 진행', desc: '주간 업무 목표 협의, 부서 내 주요 인력 및 협력 부서 인사', done: false },
      { num: '05', title: '첫 달 업무 평가 및 피드백 인터뷰 일정 확정', desc: '인사팀 및 부서장과 함께하는 30일 적응도 상담 진행 예정', done: false }
    ];

    var objs = slideHead(T, '온보딩 필수 체크리스트 (Action Checklist)');
    items.forEach(function (item, i) {
      var y = 250 + i * 135;
      objs.push(rect({ left: 120, top: y, width: 1680, height: 115, fill: item.done ? T.accentSoft : '#f8fafc', stroke: item.done ? T.accentLine : '#e2e8f0', strokeWidth: 1.5, rx: 12, ry: 12 }));
      objs.push(circle({ left: 160, top: y + 27, radius: 30, fill: item.done ? T.accent : '#94a3b8' }));
      objs.push(icon({ iconName: item.done ? 'checkCircle' : 'docs', left: 165, top: y + 32, size: 50, fill: '#ffffff' }));
      objs.push(text({ text: item.title, left: 250, top: y + 24, width: 1200, fontSize: 30, fontWeight: 'bold', fill: T.ink }));
      objs.push(text({ text: item.desc, left: 250, top: y + 68, width: 1200, fontSize: 22, fill: T.sub }));
      objs.push(rect({ left: 1540, top: y + 38, width: 100, height: 40, fill: item.done ? T.accent : '#e2e8f0', rx: 6, ry: 6 }));
      objs.push(text({ text: item.done ? '완료' : '진행중', left: 1540, top: y + 46, width: 100, fontSize: 20, fontWeight: 'bold', fill: item.done ? '#ffffff' : '#64748b', textAlign: 'center' }));
    });
    return objs;
  }

  function sOrgChart(T) {
    return slideHead(T, '추진 체계 및 전담 조직도 (Organization Chart)').concat([
      rect({ left: 710, top: 250, width: 500, height: 120, fill: T.accent, rx: 14, ry: 14 }),
      text({ text: '사업 총괄 책임자 (Project Director)', left: 710, top: 275, width: 500, fontSize: 24, fill: '#dbeafe', textAlign: 'center' }),
      text({ text: '홍 길 동  상무 (총괄 PM)', left: 710, top: 312, width: 500, fontSize: 32, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),

      rect({ left: 957, top: 370, width: 6, height: 70, fill: T.accentLine }),
      rect({ left: 320, top: 440, width: 1280, height: 6, fill: T.accentLine }),

      rect({ left: 320, top: 440, width: 6, height: 60, fill: T.accentLine }),
      rect({ left: 957, top: 440, width: 6, height: 60, fill: T.accentLine }),
      rect({ left: 1594, top: 440, width: 6, height: 60, fill: T.accentLine }),

      rect({ left: 120, top: 500, width: 480, height: 410, fill: T.cards[0].bg, stroke: T.cards[0].icon, strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 120, top: 500, width: 480, height: 60, fill: T.cards[0].icon, rx: 16, ry: 16 }),
      text({ text: '기획 · 정책 지원 분과', left: 120, top: 515, width: 480, fontSize: 26, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '팀장 : 이영희 수석연구원 (5명)', left: 160, top: 585, width: 400, fontSize: 26, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 160, top: 630, width: 400, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 사업 추진 전략 수립 및 규정 제·개정\n· 예산 집행 관리 및 대외 기관 협력\n· 참여 기관 및 산학연 협의체 운영',
        left: 160, top: 655, width: 400, fontSize: 23, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 720, top: 500, width: 480, height: 410, fill: T.cards[1].bg, stroke: T.cards[1].icon, strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 720, top: 500, width: 480, height: 60, fill: T.cards[1].icon, rx: 16, ry: 16 }),
      text({ text: '기술 개발 · 구현 분과', left: 720, top: 515, width: 480, fontSize: 26, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '팀장 : 김철수 기술이사 (8명)', left: 760, top: 585, width: 400, fontSize: 26, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 760, top: 630, width: 400, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 클라우드 및 온디바이스 엔진 개발\n· 보안 적합성 인증 및 인프라 구축\n· 대용량 데이터 처리 및 API 연동',
        left: 760, top: 655, width: 400, fontSize: 23, fill: T.sub, lineHeight: 1.7
      }),

      rect({ left: 1320, top: 500, width: 480, height: 410, fill: T.cards[2].bg, stroke: T.cards[2].icon, strokeWidth: 1.5, rx: 16, ry: 16 }),
      rect({ left: 1320, top: 500, width: 480, height: 60, fill: T.cards[2].icon, rx: 16, ry: 16 }),
      text({ text: '품질 검증 · 운영 분과', left: 1320, top: 515, width: 480, fontSize: 26, fontWeight: 'bold', fill: '#ffffff', textAlign: 'center' }),
      text({ text: '팀장 : 박지민 책임연구원 (4명)', left: 1360, top: 585, width: 400, fontSize: 26, fontWeight: 'bold', fill: T.ink }),
      rect({ left: 1360, top: 630, width: 400, height: 1, fill: '#cbd5e1' }),
      text({
        text: '· 3단계 품질 검증 및 버그 트래킹\n· 사용자 매뉴얼 작성 및 교육 지원\n· 장애 대응 핫라인 및 유지보수 전담',
        left: 1360, top: 655, width: 400, fontSize: 23, fill: T.sub, lineHeight: 1.7
      })
    ]);
  }

  function sQnA(T) {
    return darkSlide(T, [
      rect({ left: 860, top: 180, width: 200, height: 10, fill: T.accentLine }),
      text({
        text: 'Q & A', left: 0, top: 220, width: SLIDE_W,
        fontSize: 140, fontWeight: 'bold', fill: T.onDark, textAlign: 'center', charSpacing: 10
      }),
      text({
        text: '경청해 주셔서 대단히 감사합니다',
        left: 0, top: 440, width: SLIDE_W, fontSize: 56, fontWeight: 'bold', fill: T.onDark, textAlign: 'center'
      }),
      text({
        text: '발표 내용에 대해 질문이나 추가 제안이 있으시면 편하게 말씀해 주시기 바랍니다.',
        left: 0, top: 530, width: SLIDE_W, fontSize: 32, fill: T.onDarkSub, textAlign: 'center'
      }),
      rect({ left: 560, top: 660, width: 800, height: 180, fill: 'rgba(255,255,255,0.08)', stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1.5, rx: 16, ry: 16 }),
      text({
        text: '담당 부서 : 디지털혁신사업단  ·  책임 PM : 김 민 수 팀장\n연락처 : 02-0000-0000  ·  이메일 : contact@organization.or.kr',
        left: 560, top: 715, width: 800, fontSize: 26, fill: T.onDark, textAlign: 'center', lineHeight: 1.8
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
      build: function (T) { return sectionSlide(T, '01', '추진 배경과 목적', '이 장에서 다루는 핵심 주제와 배경을 간략히 요약합니다'); }
    },
    section2: {
      name: '섹션 구분 2', dark: true,
      build: function (T) { return sectionSlide(T, '02', '세부 실행 계획', '실제 추진할 구체적인 과제와 일정, 실행 방안을 다룹니다'); }
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
    visionMission: { name: '비전 및 핵심 가치', build: sVisionMission },
    problemSolution: { name: '문제점 및 해결 방안', build: sProblemSolution },
    marketSize: { name: '시장 규모 (TAM·SAM·SOM)', build: sMarketSize },
    teamProfile: { name: '핵심 인력 및 팀 소개', build: sTeamProfile },
    wbsRoadmap: { name: '추진 로드맵 (WBS)', build: sWbsRoadmap },
    kpiDashboard: { name: '핵심 성과 지표 (KPI)', build: sKpiDashboard },
    budgetTable: { name: '소요 예산 계획', build: sBudgetTable },
    persona: { name: '타깃 고객 페르소나', build: sPersona },
    esgThreePillars: { name: 'ESG 3대 핵심 전략', build: sEsgThreePillars },
    mobileMockup: { name: '서비스 화면 및 기능', build: sMobileMockup },
    projectSummary: { name: '프로젝트 총괄 결과 요약', build: sProjectSummary },
    checklist: { name: '온보딩 체크리스트', build: sChecklist },
    orgChart: { name: '추진 체계 및 조직도', build: sOrgChart },
    qna: { name: '질의응답 (Q&A)', dark: true, build: sQnA },
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
      id: 'ppt-deck-ir-pitch',
      name: 'PPT 스타트업 IR 투자유치 피치덱 (12장)',
      note: '12장 한 세트 · 16:9 (1920 × 1080) · 투자심사/VC 발표',
      theme: 'coral',
      slides: ['coverDark', 'toc', 'problemSolution', 'content', 'marketSize', 'mobileMockup',
        'chart', 'kpiDashboard', 'wbsRoadmap', 'teamProfile', 'quote', 'qna']
    },
    {
      id: 'ppt-deck-gov-rnd',
      name: 'PPT 정부 R&D 과제 제안서 (14장)',
      note: '14장 한 세트 · 16:9 (1920 × 1080) · 공공과제/입찰발표',
      theme: 'navyGold',
      slides: ['cover', 'toc', 'section', 'content', 'problemSolution', 'orgChart', 'table',
        'wbsRoadmap', 'budgetTable', 'kpiDashboard', 'stats', 'compare', 'section2', 'closing']
    },
    {
      id: 'ppt-deck-product-launch',
      name: 'PPT 신제품 론칭 & 마케팅 전략 기획서 (10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080) · 신제품/캠페인',
      theme: 'blue',
      slides: ['cover', 'toc', 'persona', 'mobileMockup', 'threeCol', 'imageRight',
        'wbsRoadmap', 'chart', 'stats', 'closing']
    },
    {
      id: 'ppt-deck-esg-report',
      name: 'PPT ESG 경영 & 지속가능경영 보고서 (10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080) · 친환경/윤리경영',
      theme: 'emerald',
      slides: ['coverDark', 'toc', 'visionMission', 'esgThreePillars', 'stats', 'table',
        'chart', 'wbsRoadmap', 'quote', 'closing']
    },
    {
      id: 'ppt-deck-onboarding',
      name: 'PPT 신규 입사자 교육 & 사내 온보딩 (8장)',
      note: '8장 한 세트 · 16:9 (1920 × 1080) · 인사/컬처덱',
      theme: 'violet',
      slides: ['cover', 'toc', 'visionMission', 'orgChart', 'threeCol', 'twoCol',
        'checklist', 'closing']
    },
    {
      id: 'ppt-deck-project-final',
      name: 'PPT 프로젝트 최종 결과 보고서 (10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080) · 사업/개발 완료보고',
      theme: 'slate',
      slides: ['cover', 'toc', 'projectSummary', 'kpiDashboard', 'table', 'chart',
        'timeline', 'compare', 'budgetTable', 'closing']
    },
    {
      id: 'ppt-deck-academic-keynote',
      name: 'PPT 글로벌 컨퍼런스 & 기조강연 (8장)',
      note: '8장 한 세트 · 16:9 (1920 × 1080) · 포럼/키노트 다크',
      theme: 'darkTech',
      slides: ['coverDark', 'toc', 'quote', 'content', 'imageRight', 'chart',
        'stats', 'qna']
    },
    {
      id: 'ppt-deck-company-profile',
      name: 'PPT 회사소개서 & 기업 브로슈어 (10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080) · 대외홍보/파트너십',
      theme: 'navyGold',
      slides: ['coverDark', 'toc', 'visionMission', 'twoCol', 'stats', 'teamProfile',
        'timeline', 'imageLeft', 'kpiDashboard', 'closing']
    },
    {
      id: 'ppt-deck-service-design',
      name: 'PPT IT 서비스 기획 & UX/UI 제안 (10장)',
      note: '10장 한 세트 · 16:9 (1920 × 1080) · 앱/웹 기획',
      theme: 'darkTech',
      slides: ['coverDark', 'toc', 'persona', 'mobileMockup', 'twoCol', 'imageRight',
        'chart', 'wbsRoadmap', 'teamProfile', 'qna']
    },
    {
      id: 'ppt-deck-biz-plan',
      name: 'PPT 사업계획서 & 제안서 종합 (12장)',
      note: '12장 한 세트 · 16:9 (1920 × 1080) · 기획/제안 표준',
      theme: 'blue',
      slides: ['coverDark', 'toc', 'section', 'problemSolution', 'twoCol', 'threeCol',
        'timeline', 'compare', 'table', 'stats', 'quote', 'closing']
    },
    {
      id: 'ppt-deck-weekly-report',
      name: 'PPT 정기 주간 · 월간 업무 보고서 (8장)',
      note: '8장 한 세트 · 16:9 (1920 × 1080) · 부서 정기보고',
      theme: 'slate',
      slides: ['cover', 'toc', 'section', 'content', 'twoCol', 'table', 'stats', 'closing']
    },
    {
      id: 'ppt-deck-blue',
      name: 'PPT 비즈니스 발표자료 (블루 · 16장)',
      note: '16장 한 세트 · 16:9 (1920 × 1080) · 범용 비즈니스',
      theme: 'blue',
      slides: ['cover', 'toc', 'section', 'content', 'twoCol', 'threeCol', 'imageRight',
        'chart', 'section2', 'table', 'timeline', 'compare', 'stats', 'quote',
        'imageLeft', 'closing']
    },
    {
      id: 'ppt-deck-slate',
      name: 'PPT 비즈니스 발표자료 (슬레이트 · 16장)',
      note: '16장 한 세트 · 16:9 (1920 × 1080) · 차분한 톤',
      theme: 'slate',
      slides: ['coverDark', 'toc', 'section', 'content', 'table', 'chart', 'twoCol',
        'threeCol', 'section2', 'timeline', 'compare', 'stats', 'imageRight',
        'imageLeft', 'quote', 'closing']
    },
    {
      id: 'ppt-deck-mini',
      name: 'PPT 원포인트 핵심 발표 (바이올렛 · 6장)',
      note: '6장 한 세트 · 16:9 (1920 × 1080) · 5분 스피치',
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
