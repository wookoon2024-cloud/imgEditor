window.IE = window.IE || {};

(function (IE) {
  'use strict';

  var util = IE.util;
  var cache = {};
  var currentTab = 'builtin';
  var currentCategory = 'all';
  var searchQuery = '';

  var SYNONYMS = {
    '사직': ['사직서', '사직원', '퇴직', '퇴사', 'doc-resignation'],
    '사직서': ['사직', '사직원', '퇴직', '퇴사', '퇴직원', 'doc-resignation'],
    '사직원': ['사직', '사직서', '퇴직', 'doc-resignation'],
    '휴가': ['휴가신청서', '휴가원', '연차', '반차', '경조사', '병가', '공가', 'doc-leave-request'],
    '휴가신청': ['휴가', '휴가신청서', '휴가원', '연차', 'doc-leave-request'],
    '휴가신청서': ['휴가', '휴가원', '연차', '반차', 'doc-leave-request'],
    '연차': ['휴가', '휴가신청서', '반차', '유급휴가', 'doc-leave-request'],
    '반차': ['휴가', '휴가신청서', '연차', 'doc-leave-request'],
    '시말서': ['경위서', '사유서', '사고보고', '사건경위', '반성문', 'doc-apology-letter'],
    '경위서': ['시말서', '사유서', '사고보고', '사건경위', 'doc-apology-letter'],
    '사유서': ['시말서', '경위서', '사고보고', 'doc-apology-letter'],
    '재직': ['재직증명서', '경력증명서', '증명서', '재직증명', 'doc-employment-cert'],
    '재직증명': ['재직증명서', '경력증명서', '증명서', 'doc-employment-cert'],
    '재직증명서': ['재직', '경력증명서', '증명서', '발급', 'doc-employment-cert'],
    '증명서': ['재직증명서', '수료증', '상장', 'doc-employment-cert'],
    '위임장': ['위임', '대리', '대리인', '법정대리', '수임', 'doc-power-of-attorney'],
    '대리': ['위임장', '대리인', '수임', 'doc-power-of-attorney'],
    '서약서': ['보안서약', '비밀유지', '개인정보보호', '서약', '각서', 'doc-security-pledge'],
    '보안서약': ['서약서', '비밀유지', '개인정보', '보안', 'doc-security-pledge'],
    '보안': ['보안서약서', '비밀유지', '각서', '정보보안', 'doc-security-pledge'],
    '각서': ['서약서', '보안서약', '비밀유지', 'doc-security-pledge'],
    '검수': ['검수확인서', '납품검수', '검수조서', '인수증', '납품확인', 'doc-inspection-acceptance'],
    '검수확인': ['검수확인서', '검수조서', '인수증', 'doc-inspection-acceptance'],
    '검수확인서': ['검수', '납품검수', '검수조서', '인수증', 'doc-inspection-acceptance'],
    '납품': ['검수', '검수확인서', '납품서', '인수증', 'doc-inspection-acceptance'],
    '근로계약': ['근로계약서', '표준근로계약서', '계약서', '연봉계약', 'doc-labor-contract'],
    '근로계약서': ['근로계약', '표준근로계약서', '계약서', 'doc-labor-contract'],
    '계약서': ['근로계약서', '표준근로계약서', '과업지시서', 'doc-labor-contract', 'doc-rfp-summary'],
    '시설안내': ['시설점검', '승강기', '단수', '정전', '안내문', 'promo-facility-notice'],
    '점검안내': ['시설점검', '승강기', '단수', '정전', '안내문', 'promo-facility-notice'],
    '승강기': ['엘리베이터', '점검', '단수', '정전', '시설점검', 'promo-facility-notice'],
    '엘리베이터': ['승강기', '점검', '시설점검', 'promo-facility-notice'],
    '단수': ['승강기', '정전', '시설점검', '안내문', 'promo-facility-notice'],
    '정전': ['승강기', '단수', '시설점검', '안내문', 'promo-facility-notice'],
    '주차': ['주차안내', '주차금지', '방문차량', '불법주차', '견인', 'promo-parking-notice'],
    '주차금지': ['주차', '방문차량', '견인', 'promo-parking-notice'],
    '명찰': ['네임택', '출입증', '사원증', '행사명찰', 'print-event-badge'],
    '네임택': ['명찰', '출입증', '행사명찰', 'print-event-badge'],
    '송공패': ['퇴직', '정년퇴직', '재직기념', '공로패', '감사패', 'print-retirement-plaque'],
    '퇴직': ['사직서', '퇴임', '송공패', '재직기념패', 'doc-resignation', 'print-retirement-plaque'],
    '퇴임': ['송공패', '퇴직', '정년퇴직', '재직기념패', 'print-retirement-plaque'],
    '시행': ['시행문', '공문서', '대외', '발송', 'doc-official-dispatch'],
    '시행문': ['시행', '공문서', '대외', 'doc-official-dispatch'],
    '협조': ['협조전', '업무협조', '공람', '요청', 'doc-coop-request'],
    '협조전': ['협조', '업무협조', '공람', 'doc-coop-request'],
    '출장': ['복무', '여비', '출장명령', '출장신청', '여비신청', 'doc-trip-order'],
    '출장신청': ['출장', '여비', '출장명령', 'doc-trip-order'],
    '여비': ['출장', '교통비', '숙박비', '식비', 'doc-trip-order'],
    '지출': ['품의', '결의서', '원인행위', '구매', '예산', 'doc-expense-resolution'],
    '지출품의': ['지출', '품의', '원인행위', 'doc-expense-resolution'],
    '품의': ['지출', '결의서', '원인행위', '구매품의', 'doc-expense-resolution'],
    '결의서': ['지출', '품의', '원인행위', 'doc-expense-resolution'],
    '감사': ['점검', '실태점검', '자체감사', '결과보고', '처분요구', 'doc-audit-report'],
    '감사보고': ['감사', '실태점검', '결과보고', 'doc-audit-report'],
    '점검': ['감사', '실태점검', '결과보고', 'doc-audit-report'],
    '비상': ['비상근무', '상황보고', '재난', '당직', '비상소집', 'doc-emergency-roster'],
    '비상근무': ['비상', '상황보고', '당직', '재난안전', 'doc-emergency-roster'],
    '당직': ['비상근무', '상황보고', 'doc-emergency-roster'],
    '과업': ['과업지시서', 'rfp', '제안요약', '규격서', 'doc-rfp-summary'],
    '과업지시서': ['과업', 'rfp', '제안요약', '규격서', 'doc-rfp-summary'],
    'rfp': ['과업지시서', '제안요약', '제안요청', '규격서', 'doc-rfp-summary'],
    '제안': ['과업지시서', 'rfp', '제안요청', 'doc-rfp-summary', 'ppt-deck-smart-dx-white', 'ppt-deck-strategic-proposal', 'ppt-deck-public-service'],
    '사업계획': ['사업계획서', '제안서', 'ppt-deck-biz-plan', 'ppt-deck-smart-dx-white', 'ppt-deck-strategic-proposal', 'ppt-deck-public-service'],
    '제안서': ['사업계획서', '기획서', 'ppt-deck-biz-plan', 'doc-rfp-summary', 'ppt-deck-smart-dx-white', 'ppt-deck-strategic-proposal', 'ppt-deck-public-service'],
    '공공': ['공공기관', '정부', '행정', '지자체', '정책', 'ppt-deck-public-service', 'doc-official'],
    '공공기관': ['공공', '정부', '행정', '지자체', '정책', 'ppt-deck-public-service'],
    '정부': ['공공', '공공기관', '행정', '지자체', '정책', 'ppt-deck-public-service'],
    '행정': ['공공', '공공기관', '정부', '지자체', '정책', '공문서', '기안문', 'ppt-deck-public-service', 'doc-official'],
    '지자체': ['공공', '공공기관', '정부', '행정', '정책', 'ppt-deck-public-service'],
    '정책': ['공공', '공공기관', '정부', '행정', '지자체', '추진계획', 'ppt-deck-public-service'],
    '화이트': ['화이트', '화이트덱', 'ppt-deck-smart-dx-white', '스마트', 'dx', '일러스트'],
    '일러스트': ['일러스트', '삽화', '벡터', 'ppt-deck-smart-dx-white', 'ppt-deck-public-service', '스마트', 'dx', '화이트'],
    'dx': ['dx', '스마트', '화이트', '솔루션', 'ppt-deck-smart-dx-white'],
    '스마트': ['dx', '스마트', '화이트', '솔루션', 'ppt-deck-smart-dx-white', 'ppt-deck-public-service'],
    '공문': ['공문서', '기안문', '결재', '행정', '시행', 'doc-official'],
    '기안': ['공문서', '기안문', '결재', 'doc-official'],
    '결재': ['공문서', '기안문', 'doc-official'],
    '회의': ['회의록', '액션아이템', '안건', '의결', 'doc-meeting-minutes'],
    '회의록': ['회의', '액션아이템', 'doc-meeting-minutes'],
    'kpi': ['실적', '성과', '보고서', '월간', '달성률', 'doc-monthly-kpi'],
    '실적': ['kpi', '성과', '보고서', '월간', 'doc-monthly-kpi'],
    '보고서': ['실적', 'kpi', '업무', '주간', '계획', '결과'],
    '온보딩': ['가이드북', '신규', '입사', '핸드북', 'doc-onboarding-guide'],
    '가이드': ['온보딩', '안내', 'doc-onboarding-guide'],
    '조직도': ['업무분장', '부서', '팀', 'doc-org-chart'],
    '주간': ['일정', '주간일정', '캘린더', 'doc-weekly-planner'],
    '세미나': ['포럼', '초청장', '행사', '초대', 'promo-seminar'],
    '초청장': ['세미나', '포럼', '행사', '초대장', 'promo-seminar'],
    '포스터': ['워크숍', '교육', '홍보', 'promo-workshop-poster'],
    '워크숍': ['포스터', '교육', '세미나', 'promo-workshop-poster'],
    '교육': ['워크숍', '포스터', '수료증', 'promo-workshop-poster'],
    '카드뉴스': ['sns', '뉴스', '인스타그램', '정사각', 'promo-sns-news'],
    'sns': ['카드뉴스', '인스타그램', 'promo-sns-news'],
    '인포그래픽': ['통계', '지표', '현황판', '대시보드', 'promo-infographic-stat'],
    '통계': ['인포그래픽', '현황판', '대시보드', 'promo-infographic-stat'],
    '사원증': ['출입증', '신분증', '명찰', 'id', 'badge', 'print-id-badge'],
    '출입증': ['사원증', '신분증', 'print-id-badge'],
    '신분증': ['사원증', '출입증', '주민등록', '여권'],
    '감사패': ['공로패', '상장', '표창', '재직', 'print-honor-plaque'],
    '공로패': ['감사패', '상장', '표창', 'print-honor-plaque'],
    '상장': ['수료증', '표창장', '자격증', '이수증', '상패', '감사패'],
    '수료증': ['상장', '이수증', '자격증'],
    '명함': ['biz', '비즈니스', 'print-biz-card'],
    '현수막': ['배너', '플래카드', 'print-banner'],
    '배너': ['현수막', '배너'],
    'ppt': ['발표', '피피티', '슬라이드', '덱', 'deck', '프레젠테이션', '사업계획서'],
    '피피티': ['ppt', '발표', '슬라이드', '프레젠테이션', '덱'],
    '발표': ['ppt', '피피티', '슬라이드', '키노트'],
    '슬라이드': ['ppt', '피피티', '발표', '덱'],
    '피치덱': ['ir', '투자유치', '스타트업', 'ppt-deck-ir-pitch'],
    '투자유치': ['ir', '피치덱', '스타트업', '사업계획', 'ppt-deck-ir-pitch'],
    'ir': ['피치덱', '투자유치', '스타트업', 'ppt-deck-ir-pitch'],
    '스타트업': ['피치덱', '투자유치', 'ir', '서비스기획', 'ppt-deck-ir-pitch', 'ppt-deck-service-design'],
    'rnd': ['과제', '정부과제', '연구개발', '과제제안', 'ppt-deck-gov-rnd'],
    '과제': ['rnd', '정부과제', '연구개발', '과제제안', '과업', 'ppt-deck-gov-rnd'],
    '연구개발': ['rnd', '과제', '정부과제', '연구보고', 'ppt-deck-gov-rnd'],
    '입찰': ['제안서', '과업지시서', '정부과제', 'ppt-deck-gov-rnd', 'doc-rfp-summary'],
    '신제품': ['론칭', '마케팅', '프로모션', '팝업스토어', 'ppt-deck-product-launch'],
    '론칭': ['신제품', '마케팅', '팝업스토어', 'ppt-deck-product-launch'],
    '마케팅': ['신제품', '론칭', '프로모션', '캠페인', 'ppt-deck-product-launch'],
    'esg': ['지속가능', '친환경', '지배구조', '탄소중립', '사회공헌', 'ppt-deck-esg-report'],
    '지속가능': ['esg', '친환경', '탄소중립', 'ppt-deck-esg-report'],
    '친환경': ['esg', '지속가능', '탄소중립', '페이퍼리스', 'ppt-deck-esg-report'],
    '신입사원': ['온보딩', '사내교육', '오리엔테이션', '컬처덱', 'ppt-deck-onboarding', 'doc-onboarding-guide'],
    '오리엔테이션': ['온보딩', '신입사원', '사내교육', 'ppt-deck-onboarding'],
    '사내교육': ['온보딩', '오리엔테이션', '신입사원', '교육', 'ppt-deck-onboarding'],
    '완료보고': ['결과보고', '프로젝트', '결과보고서', '최종보고', 'ppt-deck-project-final'],
    '결과보고': ['완료보고', '프로젝트', '결과보고서', '최종보고', 'ppt-deck-project-final', 'doc-audit-report'],
    '프로젝트': ['완료보고', '결과보고', '사업보고', 'ppt-deck-project-final'],
    '키노트': ['컨퍼런스', '강연', '포럼', '학술', '세미나', 'ppt-deck-academic-keynote'],
    '컨퍼런스': ['키노트', '강연', '포럼', '학술', '세미나', 'ppt-deck-academic-keynote'],
    '강연': ['키노트', '컨퍼런스', '포럼', '세미나', '특강', 'ppt-deck-academic-keynote'],
    '회사소개': ['회사소개서', '기업소개', '브로슈어', '지명원', 'ppt-deck-company-profile'],
    '회사소개서': ['회사소개', '기업소개', '브로슈어', '지명원', 'ppt-deck-company-profile'],
    '브로슈어': ['회사소개서', '기업소개', '리플렛', 'ppt-deck-company-profile'],
    '서비스기획': ['ux', 'ui', '앱기획', '와이어프레임', '스타트업', 'ppt-deck-service-design'],
    'ux': ['서비스기획', 'ui', '사용자경험', '화면기획', 'ppt-deck-service-design'],
    '증명사진': ['증명', '여권', '반명함', '주민등록', '사진'],
    '여권': ['증명사진', '여권사진', '반명함'],
    '반명함': ['증명사진', '사진규격'],
    '생일': ['생일축하', '축하카드', '생일파티', '초대장', 'promo-birthday-corp', 'promo-birthday-party'],
    '생일축하': ['생일', '축하', '축하카드', '파티', 'promo-birthday-corp', 'promo-birthday-party'],
    '생일파티': ['생일', '파티', '초대장', '축하', 'promo-birthday-party'],
    '축하': ['생일', '축하카드', '기념식', '창립', 'promo-birthday-corp', 'promo-anniversary-corp'],
    '파티': ['생일파티', '초대장', '이벤트', 'promo-birthday-party'],
    '축제': ['페스티벌', '문화축제', '지역축제', '봄꽃', '행사', 'promo-local-festival'],
    '지역축제': ['축제', '페스티벌', '문화제', '봄꽃축제', '행사', 'promo-local-festival'],
    '지역행사': ['지역축제', '축제', '문화제', '걷기대회', '바자회', '행사', 'promo-local-festival', 'promo-charity-walk'],
    '페스티벌': ['축제', '지역축제', '콘서트', '버스킹', 'promo-local-festival', 'promo-concert-live'],
    '체육대회': ['운동회', '명랑운동회', '야유회', '스포츠', 'promo-sports-day'],
    '운동회': ['체육대회', '명랑운동회', '야유회', '스포츠', 'promo-sports-day'],
    '야유회': ['체육대회', '한마음', '워크숍', '단합대회', 'promo-sports-day', 'promo-workshop-camp'],
    '바자회': ['플리마켓', '나눔장터', '자선', '기부', '중고장터', '초록나눔', 'promo-flea-market', 'promo-bazaar-corp'],
    '플리마켓': ['바자회', '나눔장터', '마켓', '프리마켓', 'promo-flea-market'],
    '전시': ['전시회', '갤러리', '미술전', '사진전', '아트', '초대전', 'promo-exhibition'],
    '전시회': ['전시', '갤러리', '미술전', '사진전', '도슨트', 'promo-exhibition'],
    '갤러리': ['전시', '전시회', '미술관', '아트', 'promo-exhibition'],
    '콘서트': ['공연', '버스킹', '음악회', '뮤직', '라이브', 'promo-concert-live'],
    '공연': ['콘서트', '버스킹', '음악회', '밴드', '라이브', 'promo-concert-live'],
    '버스킹': ['콘서트', '공연', '음악회', '어쿠스틱', 'promo-concert-live'],
    '걷기': ['걷기대회', '마라톤', '달리기', '워킹', '건강', '희망나눔', 'promo-charity-walk'],
    '걷기대회': ['걷기', '마라톤', '달리기', '워킹', 'promo-charity-walk'],
    '마라톤': ['걷기대회', '달리기', '러닝', '러너', 'promo-charity-walk'],
    '팝업': ['팝업스토어', '신제품', '론칭', '배너', '스토어', '성수동', 'promo-popup-store'],
    '팝업스토어': ['팝업', '신제품', '론칭', '배너', '스토어', 'promo-popup-store'],
    '북콘서트': ['북토크', '저자', '강연회', '도서', '책', '특강', 'promo-book-concert'],
    '북토크': ['북콘서트', '저자', '강연', '특강', 'promo-book-concert'],
    '이벤트': ['sns이벤트', '인스타그램', '팔로우', '리뷰', '경품', '추첨', 'promo-sns-event'],
    '인스타그램': ['이벤트', 'sns', '팔로우', '카드뉴스', 'promo-sns-event', 'promo-sns-news'],
    '창립': ['창립기념', '기념일', '기념식', '비전선포', '장기근속', 'promo-anniversary-corp'],
    '창립기념': ['창립', '기념식', '비전선포', '장기근속', 'promo-anniversary-corp'],
    '홍보': ['홍보물', '포스터', '배너', '공고', '이벤트'],
    '홍보물': ['홍보', '포스터', '배너', '전시회', '축제'],
    '행사': ['축제', '체육대회', '세미나', '워크숍', '콘서트', '바자회', '명찰', '기념식'],
    '동아리': ['크루', '학생회', '박람회', '모집', 'promo-campus-crew', 'promo-club-expo'],
    '크루': ['동아리', '학생회', '모집', '캠퍼스', '신입', 'promo-campus-crew'],
    '학생회': ['동아리', '캠퍼스', '축제', '페스티벌', 'promo-campus-crew', 'promo-campus-festival', 'promo-club-expo'],
    '캠퍼스': ['동아리', '크루', '축제', '페스티벌', '박람회', 'promo-campus-crew', 'promo-campus-festival', 'promo-club-expo'],
    '축제': ['페스티벌', '버스킹', '공연', '푸드트럭', '봄축제', 'promo-campus-festival'],
    '페스티벌': ['축제', '버스킹', '공연', '음악', 'promo-campus-festival'],
    '버스킹': ['음악', '공연', '밴드', '축제', 'promo-campus-festival'],
    '박람회': ['동아리', '부스', '엑스포', '스탬프', 'promo-club-expo'],
    '모집': ['크루', '신입', '동아리', '지원', 'promo-campus-crew'],
    '컨퍼런스': ['세미나', '심포지엄', '서밋', '테크', 'ai', 'promo-tech-conference'],
    '세미나': ['컨퍼런스', '학술대회', '강연', '포럼', 'promo-tech-conference'],
    '인공지능': ['ai', '테크', '컨퍼런스', '기술', 'promo-tech-conference'],
    'ai': ['인공지능', '테크', '기술', '서밋', 'promo-tech-conference'],
    '전시': ['전시회', '미술전', '기획전', '갤러리', '팝업', 'promo-aesthetic-exhibition'],
    '전시회': ['전시', '미술관', '아트', '도슨트', '팝업스토어', 'promo-aesthetic-exhibition'],
    '아트': ['전시', '미술', '예술', '갤러리', 'promo-aesthetic-exhibition'],
    '팝업': ['팝업스토어', '기획전', '전시', '브랜드', 'promo-aesthetic-exhibition'],
    '세일': ['할인', '특가', '클리어런스', '프로모션', '쇼핑', 'promo-season-sale'],
    '할인': ['세일', '특가', '쿠폰', '이벤트', 'promo-season-sale'],
    '특가': ['세일', '할인', '타임어택', '쇼핑', 'promo-season-sale'],
    '맥킨지': ['컨설팅', '경영전략', '전략', '이사회', '피라미드', '매트릭스', 'ppt-deck-mckinsey-strategy'],
    '컨설팅': ['맥킨지', '경영전략', '전략보고', '이사회', 'ppt-deck-mckinsey-strategy'],
    '경영전략': ['맥킨지', '전략', '컨설팅', '이사회', 'ppt-deck-mckinsey-strategy'],
    '전략': ['경영전략', '맥킨지', '컨설팅', '이사회', '로드맵', 'ppt-deck-mckinsey-strategy'],
    '애플': ['키노트', '벤토', '다크', '발표', '테크', 'ppt-flagship-clean-keynote', 'ppt-deck-apple-keynote'],
    '키노트': ['애플', '순수', '잡스', '기조강연', '컨퍼런스', '플래그십', 'ppt-flagship-clean-keynote', 'ppt-flagship-neo-bento', 'ppt-deck-apple-keynote'],
    '순수': ['키노트', '잡스', '미니멀', 'ppt-flagship-clean-keynote'],
    '잡스': ['키노트', '애플', '순수', '스티브잡스', 'ppt-flagship-clean-keynote'],
    '벤토': ['bento', '애플', '그리드', '플래그십', '네오', 'ppt-flagship-neo-bento', 'ppt-deck-apple-keynote', 'ppt-deck-linear-saas'],
    '플래그십': ['네오', '벤토', '키노트', '목업', 'ppt-flagship-neo-bento'],
    '네오': ['플래그십', '벤토', '키노트', 'ppt-flagship-neo-bento'],
    '목업': ['맥os', '윈도우', '모바일', '플래그십', 'ppt-flagship-neo-bento', 'ppt-deck-apple-keynote'],
    '피치': ['피치덱', '투자유치', 'ir', '스타트업', 'yc', 'ppt-deck-yc-pitch', 'ppt-deck-ir-pitch'],
    '피치덱': ['피치', '투자유치', 'ir', 'yc', '스타트업', '시드', 'ppt-deck-yc-pitch', 'ppt-deck-ir-pitch'],
    'yc': ['와이콤비네이터', '실리콘밸리', '시드', '피치덱', '스타트업', '투자유치', 'ppt-deck-yc-pitch'],
    '와이콤비네이터': ['yc', '실리콘밸리', '시드', '피치덱', '스타트업', 'ppt-deck-yc-pitch'],
    '투자유치': ['피치덱', 'ir', 'vc', '스타트업', 'yc', 'ppt-deck-yc-pitch', 'ppt-deck-ir-pitch'],
    'saas': ['소프트웨어', 'b2b', '리니어', '프로덕트', '솔루션', 'ppt-deck-linear-saas'],
    '제안서': ['사업계획서', '기획서', '프로젝트', '전략', '덱', 'ppt-deck-strategic-proposal'],
    '사업계획서': ['제안서', '기획서', '프로젝트', '전략', '비즈니스', 'ppt-deck-strategic-proposal'],
    '기획서': ['사업계획서', '제안서', '프로젝트', '전략', 'ppt-deck-strategic-proposal'],
    '프로젝트': ['제안서', '사업계획서', '기획서', '로드맵', 'ppt-deck-strategic-proposal']
  };

  function matchTemplate(template, query) {
    if (!query) return true;
    var q = query.toLowerCase().trim();
    if (!q) return true;

    var name = (template.name || '').toLowerCase();
    var note = (template.note || '').toLowerCase();
    var id = (template.id || '').toLowerCase();
    var cat = (template.category || '').toLowerCase();

    // 1. 이름, 메모, ID 일치
    if (name.indexOf(q) !== -1 || note.indexOf(q) !== -1 || id.indexOf(q) !== -1) return true;

    // 2. 카테고리명 일치
    var catObj = IE.templates.categories.filter(function (c) { return c.id === template.category; })[0];
    if (catObj && catObj.name.toLowerCase().indexOf(q) !== -1) return true;

    // 3. 유의어 및 동의어 사전 매칭
    var targetText = (name + ' ' + note + ' ' + id + ' ' + cat).toLowerCase();
    for (var key in SYNONYMS) {
      if (key.indexOf(q) !== -1 || q.indexOf(key) !== -1) {
        var syns = SYNONYMS[key];
        if (targetText.indexOf(key) !== -1) return true;
        for (var i = 0; i < syns.length; i++) {
          if (targetText.indexOf(syns[i].toLowerCase()) !== -1) return true;
        }
      }
    }

    // 4. 공백 구분 다중 검색어 (예: "월간 보고서" -> 모두 매칭)
    var tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length > 1) {
      var allPass = tokens.every(function (tok) {
        return matchTemplate(template, tok);
      });
      if (allPass) return true;
    }

    return false;
  }

  /* ------------------------------------------------------------ 썸네일 */

  /** 여러 장짜리 템플릿(덱)은 첫 장을 대표로 쓴다 */
  function firstPage(template) {
    if (template.pages && template.pages.length) {
      var page = template.pages[0];
      return {
        width: page.width || template.width,
        height: page.height || template.height,
        background: page.background || template.background,
        objects: page.objects || []
      };
    }
    return {
      width: template.width,
      height: template.height,
      background: template.background,
      objects: template.objects || []
    };
  }

  function pageCount(template) {
    return (template.pages && template.pages.length) ? template.pages.length : 1;
  }

  var PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  var _thumbCanvas = null;

  function getThumbCanvas(w, h) {
    if (!_thumbCanvas) {
      var el = document.createElement('canvas');
      _thumbCanvas = new fabric.StaticCanvas(el, {
        enableRetinaScaling: false,
        renderOnAddRemove: false
      });
    }
    _thumbCanvas.clear();
    _thumbCanvas.backgroundColor = '#ffffff';
    _thumbCanvas.setDimensions({ width: w, height: h });
    return _thumbCanvas;
  }

  function areTemplateImagesLoaded(template) {
    var cover = firstPage(template);
    var images = (cover.objects || []).filter(function (def) {
      return def && (def.type === 'image' || def.type === 'img') && (def.src || def._elementSrc);
    });
    if (!images.length) return true;
    if (!IE.canvas || !IE.canvas._imgCache) return false;
    for (var i = 0; i < images.length; i++) {
      var src = images[i].src || images[i]._elementSrc;
      var cached = IE.canvas._imgCache[src];
      if (!cached || (!cached.complete && cached.naturalWidth === 0)) {
        return false;
      }
    }
    return true;
  }

  function preloadImages(template, callback) {
    var cover = firstPage(template);
    var images = (cover.objects || []).filter(function (def) {
      return def && (def.type === 'image' || def.type === 'img') && (def.src || def._elementSrc);
    });
    if (!images.length) {
      if (callback) callback();
      return;
    }
    if (!IE.canvas) return;
    if (!IE.canvas._imgCache) IE.canvas._imgCache = {};
    var pending = images.length;
    var done = false;
    function checkDone() {
      if (done) return;
      pending--;
      if (pending <= 0) {
        done = true;
        if (callback) callback();
      }
    }
    images.forEach(function (def) {
      var src = def.src || def._elementSrc;
      var cached = IE.canvas._imgCache[src];
      if (cached && (cached.complete || cached.naturalWidth > 0)) {
        checkDone();
      } else {
        var img = cached || fabric.util.createImage();
        img.crossOrigin = 'anonymous';
        IE.canvas._imgCache[src] = img;
        img.addEventListener('load', checkDone, { once: true });
        img.addEventListener('error', checkDone, { once: true });
        if (!cached || !img.src) img.src = src;
      }
    });
  }

  function thumbnail(template, maxW, maxH) {
    var key = template.id + '@' + maxW + 'x' + maxH;
    var imgsLoaded = areTemplateImagesLoaded(template);
    if (imgsLoaded && cache[key]) return cache[key];

    var cover = firstPage(template);
    var zoom = Math.min(maxW / cover.width, maxH / cover.height);
    var destW = Math.max(1, Math.round(cover.width * zoom));
    var destH = Math.max(1, Math.round(cover.height * zoom));

    var preview = getThumbCanvas(destW, destH);
    preview.backgroundColor = cover.background || '#ffffff';
    preview.setZoom(zoom);

    (cover.objects || []).forEach(function (def) {
      var obj = null;
      try {
        obj = IE.canvas.makeObject(def);
      } catch (err) {
        obj = null;
      }
      if (obj) preview.add(obj);
    });

    preview.renderAll();
    var url = preview.toDataURL({ format: 'png', multiplier: 1 });

    if (imgsLoaded) {
      cache[key] = url;
    } else {
      preloadImages(template, function () {
        invalidate(template.id);
        var freshUrl = thumbnail(template, maxW, maxH);
        var thumbEls = document.querySelectorAll('.tpl-thumb[data-thumb-id="' + template.id + '"] .tpl-thumb-img');
        Array.prototype.forEach.call(thumbEls, function (el) {
          el.src = freshUrl;
          el.removeAttribute('data-loading');
        });
      });
    }

    return url;
  }

  function invalidate(id) {
    Object.keys(cache).forEach(function (key) {
      if (key.indexOf(id + '@') === 0) delete cache[key];
    });
  }

  var thumbObserver = null;
  var thumbQueue = [];
  var isProcessingQueue = false;

  function processThumbQueue() {
    if (isProcessingQueue || !thumbQueue.length) return;
    isProcessingQueue = true;

    setTimeout(function () {
      var task = thumbQueue.shift();
      if (task && task.img && task.img.isConnected) {
        var tpl = IE.store.byId(task.id);
        if (tpl) {
          var maxW = task.wide ? 560 : 360;
          var maxH = task.wide ? 320 : 260;
          var url = thumbnail(tpl, maxW, maxH);
          task.img.src = url;
          task.img.removeAttribute('data-loading');
        }
      }
      isProcessingQueue = false;
      if (thumbQueue.length) {
        processThumbQueue();
      }
    }, 4);
  }

  function setupLazyThumbnails(scope) {
    if (thumbObserver) {
      thumbObserver.disconnect();
    }

    var targets = scope.querySelectorAll('.tpl-thumb[data-thumb-id]');
    if (!targets.length) return;

    if (!window.IntersectionObserver) {
      Array.prototype.forEach.call(targets, function (el) {
        var id = el.getAttribute('data-thumb-id');
        var wide = el.getAttribute('data-thumb-wide') === '1';
        var img = el.querySelector('.tpl-thumb-img');
        var tpl = IE.store.byId(id);
        if (tpl && img) {
          var url = thumbnail(tpl, wide ? 560 : 360, wide ? 320 : 260);
          img.src = url;
          img.removeAttribute('data-loading');
        }
      });
      return;
    }

    var flyoutBody = document.getElementById('flyout-body');

    thumbObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var thumbEl = entry.target;
          thumbObserver.unobserve(thumbEl);

          var id = thumbEl.getAttribute('data-thumb-id');
          var wide = thumbEl.getAttribute('data-thumb-wide') === '1';
          var img = thumbEl.querySelector('.tpl-thumb-img');
          if (!img) return;

          var maxW = wide ? 560 : 360;
          var maxH = wide ? 320 : 260;
          var key = id + '@' + maxW + 'x' + maxH;

          if (cache[key]) {
            img.src = cache[key];
            img.removeAttribute('data-loading');
          } else {
            thumbQueue.push({ id: id, wide: wide, img: img });
            processThumbQueue();
          }
        }
      });
    }, {
      root: flyoutBody,
      rootMargin: '300px 0px 300px 0px'
    });

    Array.prototype.forEach.call(targets, function (el) {
      var id = el.getAttribute('data-thumb-id');
      var wide = el.getAttribute('data-thumb-wide') === '1';
      var maxW = wide ? 560 : 360;
      var maxH = wide ? 320 : 260;
      if (cache[id + '@' + maxW + 'x' + maxH]) {
        var img = el.querySelector('.tpl-thumb-img');
        if (img && img.hasAttribute('data-loading')) {
          img.src = cache[id + '@' + maxW + 'x' + maxH];
          img.removeAttribute('data-loading');
        }
      } else {
        thumbObserver.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------- 카드 */

  function cardHtml(template, isUser) {
    var wide = isWide(template);
    var maxW = wide ? 560 : 360;
    var maxH = wide ? 320 : 260;
    var key = template.id + '@' + maxW + 'x' + maxH;
    var hasThumb = !!cache[key];
    var thumb = hasThumb ? cache[key] : PLACEHOLDER;
    var pages = pageCount(template);

    return '' +
      '<div class="tpl-card" data-template="' + template.id + '" title="' + util.escapeHtml(template.name) + '">' +
        '<div class="tpl-thumb" data-thumb-id="' + template.id + '" data-thumb-wide="' + (wide ? '1' : '0') + '">' +
          '<img alt="" class="tpl-thumb-img"' +
            (hasThumb ? '' : ' data-loading="1"') +
            ' src="' + thumb + '">' +
          (pages > 1 ? '<span class="tpl-pages">' + pages + '장</span>' : '') +
          (isUser ? '<span class="tpl-tag">내 템플릿</span>' : '') +
          (isUser ? '<button type="button" class="tpl-del-btn" data-delete="' + template.id + '" title="삭제">&#10005;</button>' : '') +
        '</div>' +
        '<div class="tpl-name">' + util.escapeHtml(template.name) + '</div>' +
        (isUser ? '<div class="tpl-actions"><button type="button" class="danger" data-delete="' + template.id + '">삭제</button></div>' : '') +
      '</div>';
  }

  /** 템플릿 그리드 */
  function isWide(template) {
    return template.width > template.height * 1.3;
  }

  function groupHtml(title, templates, isUser) {
    if (!templates.length) return '';

    return '<div class="fo-section">' +
      '<h3 class="fo-title">' + util.escapeHtml(title) + ' · ' + templates.length + '</h3>' +
      '<div class="tpl-grid">' +
        templates.map(function (tpl) { return cardHtml(tpl, isUser); }).join('') +
      '</div></div>';
  }

  function storageNotice() {
    if (IE.store.available) return '';
    return '<div class="storage-warning">' +
      '이 브라우저에서는 <b>내 템플릿 보관이 막혀 있습니다</b>. ' +
      '브라우저가 <code>file://</code> 페이지의 저장소 접근을 차단한 경우입니다. ' +
      '파일 내보내기 / 가져오기로 주고받을 수 있습니다.' +
    '</div>';
  }

  /* ----------------------------------------------------------- 본문 */

  function searchBoxHtml() {
    return '<div class="tpl-search-box">' +
      '<label class="el-search tpl-search-label">' +
        '<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z"/></svg>' +
        '<input type="search" id="tpl-search-input" placeholder="서식 검색 (예: 공문서, 회의록, PPT, 사원증…)" value="' +
          util.escapeHtml(searchQuery) + '">' +
        (searchQuery ? '<button type="button" class="tpl-search-clear" id="btn-tpl-search-clear" title="검색 지우기">&#10005;</button>' : '') +
      '</label>' +
    '</div>';
  }

  function suggestionsHtml() {
    var tags = ['공문서', '생일축하', '지역축제', '체육대회', '바자회', '이벤트', '회의록', 'PPT', '사원증', '포스터', '증명사진'];
    return '<div class="tpl-search-suggestions">' +
      '<span>추천 검색어:</span>' +
      tags.map(function (tag) {
        return '<button type="button" class="tpl-suggest-chip" data-suggest="' + tag + '">' + tag + '</button>';
      }).join('') +
    '</div>';
  }

  function contentHtml() {
    if (currentTab === 'user') {
      var list = IE.store.userTemplates();
      var docPages = IE.doc ? IE.doc.count() : 1;

      var toolbar = '<div class="fo-toolbar">' +
        '<button class="btn-mini btn-mini-solid" data-user-action="save-current">' +
          (docPages > 1 ? '전체 ' + docPages + '장 저장' : '현재 페이지 저장') +
        '</button>' +
        '<button class="btn-mini" data-user-action="import">가져오기</button>' +
        '<button class="btn-mini" data-user-action="export-all">전체 내보내기</button>' +
        '<button class="btn-mini btn-mini-danger" data-user-action="delete-all">전체 삭제</button>' +
      '</div>';

      if (searchQuery) {
        var userHits = list.filter(function (tpl) { return matchTemplate(tpl, searchQuery); });
        if (!userHits.length) {
          return toolbar +
            '<div class="tpl-search-header">' +
              '<span class="tpl-search-count">검색 결과 <b>0</b>건</span>' +
              '<button type="button" class="tpl-search-reset" id="btn-tpl-search-reset">전체 보기</button>' +
            '</div>' +
            '<div class="tpl-search-empty">' +
              '<div class="tpl-empty-icon">🔍</div>' +
              '<p><b>"' + util.escapeHtml(searchQuery) + '"</b> 에 해당하는 내 템플릿이 없습니다.</p>' +
            '</div>';
        }
        var wideUser = userHits.filter(isWide).length > userHits.length / 2;
        return toolbar +
          '<div class="tpl-search-header">' +
            '<span class="tpl-search-count"><b>"' + util.escapeHtml(searchQuery) + '"</b> 검색 결과 <b>' + userHits.length + '</b>건</span>' +
            '<button type="button" class="tpl-search-reset" id="btn-tpl-search-reset">전체 보기</button>' +
          '</div>' +
          '<div class="tpl-grid' + (wideUser ? ' wide' : '') + '">' +
            userHits.map(function (tpl) { return cardHtml(tpl, true); }).join('') +
          '</div>';
      }

      if (!list.length) {
        return toolbar +
          '<p class="fo-hint" style="text-align:center;padding:24px 8px">' +
          (IE.store.available
            ? '아직 저장한 템플릿이 없습니다.<br>마음에 든 결과를 <b>현재 페이지 저장</b>으로 보관해 보세요.'
            : '이 환경에서는 보관함을 쓸 수 없습니다.<br><b>가져오기</b>로 템플릿 파일을 불러오세요.') +
          '</p>';
      }

      return toolbar + groupHtml('내 템플릿', list, true);
    }

    // 기본 템플릿
    if (searchQuery) {
      var hits = IE.templates.all.filter(function (tpl) {
        return matchTemplate(tpl, searchQuery);
      });

      if (!hits.length) {
        return '<div class="tpl-search-header">' +
            '<span class="tpl-search-count">검색 결과 <b>0</b>건</span>' +
            '<button type="button" class="tpl-search-reset" id="btn-tpl-search-reset">전체 보기</button>' +
          '</div>' +
          '<div class="tpl-search-empty">' +
            '<div class="tpl-empty-icon">🔍</div>' +
            '<p><b>"' + util.escapeHtml(searchQuery) + '"</b> 에 해당하는 템플릿이 없습니다.</p>' +
            suggestionsHtml() +
          '</div>';
      }

      var wideHits = hits.filter(isWide).length > hits.length / 2;
      return '<div class="tpl-search-header">' +
          '<span class="tpl-search-count"><b>"' + util.escapeHtml(searchQuery) + '"</b> 검색 결과 <b>' + hits.length + '</b>건</span>' +
          '<button type="button" class="tpl-search-reset" id="btn-tpl-search-reset">전체 보기</button>' +
        '</div>' +
        '<div class="tpl-grid' + (wideHits ? ' wide' : '') + '">' +
          hits.map(function (tpl) { return cardHtml(tpl, false); }).join('') +
        '</div>';
    }

    // 분류 칩으로 좁혀서 본다
    var categories = IE.templates.categories.filter(function (category) {
      return category.id !== 'user' && IE.templates.byCategory(category.id).length > 0;
    });

    var chips = '<div class="chip-row chip-scroll">' +
      '<button class="chip' + (currentCategory === 'all' ? ' is-active' : '') +
        '" data-tpl-cat="all">전체 ' + IE.templates.all.length + '</button>' +
      categories.map(function (category) {
        var count = IE.templates.byCategory(category.id).length;
        return '<button class="chip' + (currentCategory === category.id ? ' is-active' : '') +
          '" data-tpl-cat="' + category.id + '">' +
          util.escapeHtml(category.name) + ' ' + count + '</button>';
      }).join('') +
    '</div>';

    var grid = '<div id="template-grid">';

    if (currentCategory === 'all') {
      grid += '<div class="tpl-grid">' +
        IE.templates.all.map(function (tpl) { return cardHtml(tpl, false); }).join('') +
        '</div>';
    } else {
      var picked = categories.filter(function (c) { return c.id === currentCategory; })[0];
      if (picked) {
        grid += '<div class="tpl-grid">' +
          IE.templates.byCategory(picked.id).map(function (tpl) { return cardHtml(tpl, false); }).join('') +
          '</div>';
      } else {
        currentCategory = 'all';
        grid += '<div class="tpl-grid">' +
          IE.templates.all.map(function (tpl) { return cardHtml(tpl, false); }).join('') +
          '</div>';
      }
    }

    return chips + grid + '</div>';
  }

  function bodyHtml() {
    var modes = '<div class="chip-row">' +
      '<button class="chip' + (currentTab === 'builtin' ? ' is-active' : '') +
        '" data-tpl-tab="builtin">기본 서식</button>' +
      '<button class="chip' + (currentTab === 'user' ? ' is-active' : '') +
        '" data-tpl-tab="user">내 서식</button>' +
    '</div>';

    return modes +
      storageNotice() +
      searchBoxHtml() +
      '<div id="tpl-content-area">' +
        contentHtml() +
      '</div>';
  }

  /* ---------------------------------------------------------- 이벤트 */

  function bindCardsAndActions(scope) {
    setupLazyThumbnails(scope);

    Array.prototype.forEach.call(scope.querySelectorAll('[data-tpl-cat]'), function (button) {
      button.addEventListener('click', function () {
        currentCategory = button.getAttribute('data-tpl-cat');
        IE.panel.refresh();
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('.tpl-card'), function (card) {
      card.addEventListener('click', function () {
        var template = IE.store.byId(card.getAttribute('data-template'));
        if (!template) return;
        IE.canvas.applyTemplate(template);
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('[data-export]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var template = IE.store.byId(button.getAttribute('data-export'));
        if (!template) return;
        IE.store.exportTemplates([template], safeName(template.name) + '.json');
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('[data-delete]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();

        var id = button.getAttribute('data-delete');
        var template = IE.store.byId(id);
        if (!template) return;
        if (!window.confirm('「' + template.name + '」 템플릿을 삭제할까요?')) return;

        invalidate(id);
        IE.store.remove(id);
        util.toast('템플릿을 삭제했습니다.');
        IE.panel.refresh();
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('[data-user-action]'), function (button) {
      button.addEventListener('click', function (ev) {
        ev.stopPropagation();
        handleUserAction(button.getAttribute('data-user-action'));
      });
    });

    Array.prototype.forEach.call(scope.querySelectorAll('.tpl-suggest-chip'), function (btn) {
      btn.addEventListener('click', function () {
        var query = btn.getAttribute('data-suggest') || '';
        var searchInput = document.getElementById('tpl-search-input');
        if (searchInput) searchInput.value = query;
        searchQuery = query;
        var clearBtn = document.getElementById('btn-tpl-search-clear');
        if (clearBtn) clearBtn.hidden = !searchQuery;
        var host = document.getElementById('flyout-body');
        if (host) updateContentArea(host);
      });
    });

    var resetBtn = scope.querySelector('#btn-tpl-search-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var searchInput = document.getElementById('tpl-search-input');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        var clearBtn = document.getElementById('btn-tpl-search-clear');
        if (clearBtn) clearBtn.hidden = true;
        var host = document.getElementById('flyout-body');
        if (host) updateContentArea(host);
      });
    }
  }

  function updateContentArea(host) {
    var area = host.querySelector('#tpl-content-area');
    if (!area) return;
    area.innerHTML = contentHtml();
    bindCardsAndActions(area);
  }

  function bind(host) {
    Array.prototype.forEach.call(host.querySelectorAll('[data-tpl-tab]'), function (button) {
      button.addEventListener('click', function () {
        currentTab = button.getAttribute('data-tpl-tab');
        IE.panel.refresh();
      });
    });

    var searchInput = host.querySelector('#tpl-search-input');
    var clearBtn = host.querySelector('#btn-tpl-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        if (clearBtn) clearBtn.hidden = !searchQuery;
        updateContentArea(host);
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          searchInput.value = '';
          searchQuery = '';
          if (clearBtn) clearBtn.hidden = true;
          updateContentArea(host);
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchQuery = '';
        clearBtn.hidden = true;
        updateContentArea(host);
      });
    }

    bindCardsAndActions(host);
  }

  function safeName(name) {
    return String(name || 'template').replace(/[\\/:*?"<>|]/g, '_').trim() || 'template';
  }

  function suggestedName() {
    var template = IE.templates.byId(IE.state.docName);
    if (template) return template.name + ' 복사본';
    return '내 템플릿 ' + util.timestamp().slice(0, 8);
  }

  function handleUserAction(action) {
    if (action === 'save-current') {
      var pages = IE.doc ? IE.doc.count() : 1;
      var name = window.prompt(
        pages > 1
          ? '템플릿 이름을 입력하세요. (현재 문서 ' + pages + '장을 한 템플릿으로 저장합니다)'
          : '템플릿 이름을 입력하세요.',
        suggestedName()
      );
      if (!name) return;

      var template = IE.store.fromCurrentDocument(name.trim(), 'user', pages > 1);
      var result = IE.store.save(template, { overwrite: false });

      if (result.ok) {
        util.toast('「' + name.trim() + '」 템플릿으로 저장했습니다.' +
          (pages > 1 ? ' (' + pages + '장)' : ''));
      } else if (result.reason === 'unavailable') {
        util.toast('보관함을 쓸 수 없어 파일로 내보냅니다.');
        IE.store.exportTemplates([template], safeName(name) + '.json');
        return;
      }

      IE.panel.refresh();
      return;
    }

    if (action === 'import') {
      util.pickFile('file-template', '.json,application/json', function (file) {
        IE.store.importFile(file, function (result) {
          if (!result.ok) {
            var messages = {
              read: '파일을 읽지 못했습니다.',
              parse: 'JSON 형식이 아닙니다.',
              shape: 'ImgEditor 템플릿 형식이 아닙니다.'
            };
            util.toast(messages[result.reason] || '가져오지 못했습니다.');
            return;
          }

          var note = '템플릿 ' + result.added + '개를 가져왔습니다.' +
            (result.skipped ? ' (' + result.skipped + '개 형식 제외)' : '');
          if (result.persisted === false) note = '가져왔지만 이 브라우저에는 보관되지 않습니다.';
          util.toast(note);
          IE.panel.refresh();
        });
      });
      return;
    }

    if (action === 'export-all') {
      var list = IE.store.userTemplates();
      if (!list.length) {
        util.toast('내보낼 내 템플릿이 없습니다.');
        return;
      }
      IE.store.exportTemplates(list, 'my_templates_' + util.timestamp() + '.json');
      return;
    }

    if (action === 'delete-all') {
      var all = IE.store.userTemplates();
      if (!all.length) {
        util.toast('삭제할 템플릿이 없습니다.');
        return;
      }
      if (!window.confirm('내 템플릿 ' + all.length + '개를 모두 삭제할까요?')) return;

      all.forEach(function (tpl) {
        invalidate(tpl.id);
      });
      IE.store.clear(function () {
        util.toast('내 템플릿을 모두 삭제했습니다.');
        IE.panel.refresh();
      });
      IE.panel.refresh();
    }
  }

  IE.gallery = {
    thumbnail: thumbnail,
    bodyHtml: bodyHtml,
    bind: bind,
    setTab: function (tab) { currentTab = tab; },
    currentTab: function () { return currentTab; },
    setCategory: function (id) { currentCategory = id || 'all'; },
    currentCategory: function () { return currentCategory; },
    setSearch: function (q) { searchQuery = q || ''; },
    searchQuery: function () { return searchQuery; },
    filterTemplates: function (query, categoryId) {
      var list = (categoryId && categoryId !== 'all') ? IE.templates.byCategory(categoryId) : IE.templates.all;
      return list.filter(function (t) { return matchTemplate(t, query); });
    },
    matchTemplate: matchTemplate,
    open: function (tab, category, search) {
      if (tab) currentTab = tab;
      if (category) currentCategory = category;
      if (typeof search === 'string') searchQuery = search;
      IE.panel.open('templates');
    },
    close: function () { IE.panel.close(); },
    isOpen: function () { return IE.panel.current() === 'templates'; }
  };
})(window.IE);