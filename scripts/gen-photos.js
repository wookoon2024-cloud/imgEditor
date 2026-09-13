'use strict';

/**
 * 기본 사진 생성 — 배경 100 · 인물 100 · 에셋 100 = 300장.
 *
 * 두 가지 엔진을 쓸 수 있다.
 *
 *   1) Pollinations (기본) — 토큰이 필요 없다. 그냥 실행하면 된다.
 *        node scripts/gen-photos.js
 *
 *   2) HuggingFace 추론 — 토큰이 있어야 한다 (없으면 401).
 *        set HF_TOKEN=hf_xxx
 *        node scripts/gen-photos.js --api hf
 *
 * 그 밖의 옵션
 *   --cat 배경|인물|에셋   한 갈래만
 *   --group "사무 · 업무"  한 묶음만
 *   --only bg-001          한 장만
 *   --jobs 6               동시에 몇 장씩 만들지 (기본 5)
 *   --force                이미 있어도 다시 만든다
 *   --list                 만들 목록만 보여준다
 *
 * 결과는 assets/photos/*.jpg + manifest.json.
 * 이미 있는 파일은 건너뛰므로, 중간에 끊겨도 다시 실행하면 이어서 만든다.
 * 토큰은 절대 파일로 저장하지 않는다.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'photos');
const RAW = path.join(OUT, '_raw');

const HF_MODEL = 'stabilityai/stable-diffusion-3-medium-diffusers';
const HF_ENDPOINT = 'https://router.huggingface.co/hf-inference/models/' + HF_MODEL;
const POLL_ENDPOINT = 'https://image.pollinations.ai/prompt/';

const args = process.argv.slice(2);
function flag(name) { return args.indexOf(name) >= 0; }
function opt(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }

const API = (opt('--api') || 'poll').toLowerCase();
const TOKEN = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || '';
const ONLY = opt('--only');
const CAT = opt('--cat');
const GROUP = opt('--group');
const JOBS = Math.max(1, Math.min(12, parseInt(opt('--jobs') || '5', 10) || 5));
const FORCE = flag('--force');

/* ------------------------------------------------------------------ *
 *  크기 — 배포 파일이 커지지 않도록 작게 뽑는다.
 *
 *  ★ 워터마크
 *  Pollinations 는 오른쪽 아래에 약 155x30 짜리 "pollinations.ai" 를 박는다.
 *  파라미터(nologo·referrer)로는 안 지워진다. 그래서 목표 크기보다 크게 받은 뒤
 *  그 모서리가 잘려 나가도록 여백을 두고 가운데를 오려낸다 (scripts/crop-photos.js).
 *  오려낼 때 왼쪽·위 여백도 같이 잘리므로, 그림은 가운데에 오도록 프롬프트에 적어 둔다.
 * ------------------------------------------------------------------ */
const MARK_W = 170;   /* 워터마크가 차지하는 오른쪽 폭 (넉넉히) */
const MARK_H = 45;    /* 아래쪽 높이 */
const EDGE_X = 160;   /* 왼쪽 여백 (가운데를 잡기 위해) */
const EDGE_Y = 10;    /* 위 여백 */

const TARGET = {
  '배경': [640, 360],
  '인물': [320, 427],
  '에셋': [384, 384]
};

function rawSize(cat) {
  const t = TARGET[cat];
  return [t[0] + EDGE_X + MARK_W, t[1] + EDGE_Y + MARK_H];
}

function cropBox(cat) {
  const t = TARGET[cat];
  return { x: EDGE_X, y: EDGE_Y, w: t[0], h: t[1] };
}

/* 프롬프트는 모두 "사람 없음 / 글자 없음" 을 기본으로 깐다.
   서류·안내문에 얹는 그림이라 얼굴이나 글자가 박혀 있으면 쓰기 어렵다. */
const NEG = 'no text, no letters, no words, no watermark, no logo, no signature, no caption, ';
const NEG_KR = '글자 없음, 워터마크 없음, ';

/* ------------------------------------------------------------------ *
 *  프롬프트 — 갈래 > 묶음 > [이름, 프롬프트]
 * ------------------------------------------------------------------ */
const PLAN = {
  '배경': [
    { group: '사무 · 업무', items: [
      ['사무실', 'bright modern open-plan office interior, empty desks, large windows, soft daylight, clean corporate photography'],
      ['회의실', 'empty modern conference room, long wooden table, chairs, glass wall, soft daylight'],
      ['오픈 오피스', 'wide open office floor with rows of desks and monitors, bright ceiling lights, no people'],
      ['개인 책상', 'tidy office desk from above, laptop, notebook, coffee cup, soft daylight, flat lay'],
      ['서류 책상', 'office desk covered with neat stacks of paper documents, warm lamp light, close up'],
      ['발표장', 'empty presentation room with large screen and rows of chairs, soft blue light'],
      ['사무실 라운지', 'modern office lounge with sofas and plants, warm daylight, no people'],
      ['복도', 'long bright office corridor with glass doors, clean perspective, no people'],
      ['엘리베이터 홀', 'modern office elevator lobby, polished floor, soft light, no people'],
      ['탕비실', 'small office pantry with coffee machine and mugs, warm light, no people'],
      ['창가 자리', 'office desk beside a large window overlooking a city, soft morning light, no people'],
      ['캐비닛', 'dark grey office filing cabinets in a row, clean corporate interior, no people'],
      ['인쇄실', 'office copy room with printer and paper shelves, bright even light, no people'],
      ['회의 테이블', 'close up of a long conference table surface with notepads and water glasses, no people']
    ] },
    { group: '자연', items: [
      ['하늘', 'clear blue sky with soft white clouds, bright sunny day, wide landscape'],
      ['노을', 'warm orange sunset sky over the sea, gradient clouds, wide landscape'],
      ['구름', 'fluffy white cumulus clouds on a bright blue sky, wide landscape'],
      ['숲', 'sunlight streaming through a green forest, tall trees, soft mist'],
      ['잔디', 'wide green grass field under a blue sky, fresh and bright'],
      ['바다', 'calm turquoise sea meeting a clear sky at the horizon'],
      ['호수', 'still lake reflecting mountains and clouds, early morning light'],
      ['산', 'green mountain ridge under a blue sky with light clouds'],
      ['들판', 'golden wheat field under a bright sky, gentle wind'],
      ['벚꽃길', 'a path lined with blooming cherry blossom trees, pink petals, soft daylight'],
      ['단풍길', 'a path through trees with red and orange autumn leaves, soft light'],
      ['설경', 'snow covered pine trees and a white field, clear winter sky'],
      ['별밤', 'deep night sky full of stars over a dark mountain silhouette'],
      ['무지개', 'a rainbow over a green field after rain, bright sky']
    ] },
    { group: '계절 · 꽃', items: [
      ['봄꽃', 'field of small spring flowers in soft pastel colors, bright daylight'],
      ['튤립밭', 'rows of red and yellow tulips in a field, bright spring daylight'],
      ['코스모스', 'pink cosmos flowers swaying in a field, clear autumn sky'],
      ['해바라기밭', 'field of tall sunflowers under a bright blue sky'],
      ['연꽃', 'pink lotus flowers on a calm pond with green leaves'],
      ['장미정원', 'rose garden with red and pink roses in full bloom, soft light'],
      ['은행나무길', 'a road lined with yellow ginkgo trees in autumn, soft light'],
      ['눈 내린 나무', 'bare tree branches covered with fresh snow, pale winter sky'],
      ['봄 새싹', 'young green sprouts in soil, close up, fresh spring light'],
      ['갈대', 'golden reeds by a lake in autumn, soft warm light']
    ] },
    { group: '도시 · 건물', items: [
      ['도심 스카이라인', 'modern city skyline at dusk with lit windows, wide view'],
      ['거리', 'clean empty city street with trees, soft morning light'],
      ['공원', 'city park with a path, benches and green trees, bright day'],
      ['다리', 'a long bridge over a river, clear sky, wide view'],
      ['카페 외관', 'small cozy cafe storefront with a sign board and plants, daylight'],
      ['한옥', 'traditional korean hanok with tiled roof and wooden pillars, soft daylight'],
      ['궁궐', 'traditional korean palace gate with painted wooden beams, clear sky'],
      ['학교', 'school building with a wide yard and trees, bright morning light'],
      ['도서관 외관', 'classic library building facade with stone columns, soft light'],
      ['도시 야경', 'city at night with bright building lights and light trails, wide view']
    ] },
    { group: '실내 · 공간', items: [
      ['도서관', 'quiet library interior with tall wooden bookshelves, warm light, blurred'],
      ['카페 내부', 'cozy cafe interior with wooden tables and hanging lamps, warm light, no people'],
      ['강당', 'large auditorium with rows of seats and a stage, soft light'],
      ['교실', 'empty classroom with desks and a blackboard, bright daylight'],
      ['체육관', 'indoor gymnasium with wooden floor and line markings, bright light'],
      ['병원 대기실', 'clean hospital waiting room with chairs, bright even light, no people'],
      ['전시장', 'bright art gallery hall with white walls, polished floor, no people'],
      ['공연장', 'concert hall interior with seats and a lit stage, warm light'],
      ['서가', 'close up of a tall bookshelf filled with books, warm light'],
      ['회의장', 'large conference hall with rows of seats and a screen, soft blue light']
    ] },
    { group: '질감 · 배경지', items: [
      ['종이 결', 'plain warm cream paper texture, subtle fiber grain, evenly lit flat scan'],
      ['크라프트지', 'brown kraft paper texture, subtle grain, flat evenly lit'],
      ['먹색', 'dark slate grey textured concrete wall, evenly lit flat background'],
      ['회색 스튜디오', 'seamless soft light grey studio backdrop, gentle gradient, even lighting'],
      ['파란 배경', 'soft light blue studio backdrop, smooth even gradient'],
      ['하늘색 배경', 'pale sky blue smooth gradient backdrop, even lighting'],
      ['금빛 실크', 'elegant champagne gold silk fabric texture, soft folds, warm light'],
      ['은빛', 'soft silver satin fabric texture with gentle folds, cool light'],
      ['목재', 'warm light oak wood texture with visible grain, flat evenly lit'],
      ['대리석', 'white marble texture with soft grey veins, flat evenly lit'],
      ['린넨', 'natural beige linen fabric texture, flat evenly lit'],
      ['물감 번짐', 'soft watercolor wash in light blue and mint, subtle paper texture'],
      ['남색 밤', 'deep navy background with tiny soft stars, smooth gradient'],
      ['연잎 패턴', 'soft green tropical leaf pattern, flat lay, bright even lighting']
    ] },
    { group: '그라데이션', items: [
      ['파스텔', 'smooth pastel pink and peach gradient background, soft even'],
      ['네이비', 'deep navy blue smooth gradient background, even lighting'],
      ['크림', 'soft cream and ivory smooth gradient background'],
      ['민트', 'soft mint green smooth gradient background'],
      ['라벤더', 'soft lavender purple smooth gradient background'],
      ['살구', 'warm apricot orange smooth gradient background'],
      ['하늘 노을', 'smooth gradient from sky blue to warm sunset orange, even'],
      ['청록', 'smooth teal and turquoise gradient background'],
      ['자주', 'deep plum and magenta smooth gradient background'],
      ['보케', 'soft golden bokeh light circles on a warm blurred background'],
      ['물결', 'gentle blue water ripple pattern on a calm surface, top view'],
      ['안개', 'soft white fog over a pale blue gradient background'],
      ['빛 번짐', 'soft diagonal light streaks on a pale grey background, gentle glow'],
      ['반짝 배경', 'scattered tiny golden sparkles on a soft dark background, gentle glow']
    ] },
    { group: '행사 · 무대', items: [
      ['무대 조명', 'stage with colorful spotlights beaming through haze, dark background'],
      ['콘서트홀', 'concert hall stage with warm lighting and empty seats'],
      ['결혼식장', 'wedding ceremony aisle with white flowers and soft daylight'],
      ['파티홀', 'festive party hall with hanging lights and round tables, warm glow'],
      ['연회장', 'banquet hall with long tables and elegant chandeliers, warm light'],
      ['시상식', 'awards ceremony stage with a podium and warm spotlights'],
      ['축제 거리', 'festival street with colorful lanterns hanging above, evening'],
      ['풍선 장식', 'colorful balloons floating against a soft pastel background'],
      ['꽃 장식', 'abundant flower arrangement background with soft depth of field'],
      ['커튼 배경', 'deep red theater curtains with soft folds, stage lighting'],
      ['샹들리에', 'elegant crystal chandelier glowing on a dark ceiling'],
      ['촛불', 'many small candle flames glowing warmly in the dark'],
      ['리본 배경', 'elegant satin ribbons in champagne gold on a soft background'],
      ['금색 반짝', 'golden glitter and confetti on a warm dark background']
    ] },
    { group: '바다 · 물', items: [
      ['바닷가', 'sandy beach with gentle waves and a clear sky, wide view'],
      ['산호초', 'shallow turquoise water over a coral reef, top view, clear'],
      ['파도', 'a large ocean wave curling and breaking, bright daylight'],
      ['항구', 'quiet harbor with moored boats and calm water, morning light'],
      ['등대', 'a tall white lighthouse on a rocky coast, clear sky'],
      ['요트', 'white sailboats on calm blue water, bright day'],
      ['수족관', 'large aquarium tank with blue water and rocks, no people'],
      ['계곡', 'clear stream running over rocks in a green valley, soft light'],
      ['폭포', 'a tall waterfall into a green pool, soft mist, wide view'],
      ['호숫가 일몰', 'calm lake at sunset with warm reflected light, wide view']
    ] },
    { group: '우주 · 하늘', items: [
      ['은하수', 'the milky way stretching across a dark night sky over mountains'],
      ['오로라', 'green and purple aurora over a snowy landscape at night'],
      ['달 표면', 'close view of the grey cratered moon surface in space'],
      ['지구 궤도', 'planet earth seen from space with a thin blue atmosphere'],
      ['구름 위', 'a sea of white clouds seen from above, bright blue sky'],
      ['천문대', 'a white observatory dome on a hill under a starry sky'],
      ['별똥별', 'shooting stars streaking across a dark night sky'],
      ['일출', 'the sun rising over a calm sea, warm orange sky, wide view']
    ] },
    { group: '산업 · 건설', items: [
      ['공장', 'clean modern factory floor with machinery, bright lights, no people'],
      ['건설 현장', 'a construction site with a crane and steel frames, daylight'],
      ['물류창고', 'large warehouse with tall shelves and boxes, bright light, no people'],
      ['항만 크레인', 'container port with tall cranes and stacked containers, daylight'],
      ['철도', 'railway tracks stretching into the distance, clear sky'],
      ['다리 공사', 'a large bridge under construction over water, daylight'],
      ['풍력발전', 'white wind turbines on a green hill under a blue sky'],
      ['태양광', 'rows of solar panels in a field under a bright sky']
    ] },
    { group: '전통 · 문화', items: [
      ['한복방', 'traditional korean room with folded silk hanbok fabrics, warm light, no people'],
      ['서예방', 'a desk with calligraphy brushes and ink stone, warm light'],
      ['다도방', 'a traditional tea room with a low table and tea set, soft light'],
      ['탈춤 무대', 'traditional korean mask dance stage with colorful props, no people'],
      ['사물놀이', 'traditional korean percussion instruments on a stage, warm light'],
      ['전통 시장', 'a traditional korean market alley with wooden stalls, no people'],
      ['기와지붕', 'close view of traditional korean curved roof tiles, blue sky'],
      ['전통 문양', 'soft traditional korean pattern background in muted colors, flat']
    ] },
    { group: '음식 · 가게', items: [
      ['카페 창가', 'a cafe table by a large window, warm daylight, no people'],
      ['베이커리', 'a bakery display shelf full of bread and pastries, warm light'],
      ['한식상', 'a korean table set with many small side dishes, top view'],
      ['디저트 진열', 'a glass display case full of colorful cakes, bright light'],
      ['티룸', 'a cozy tea room with jars of tea on wooden shelves, warm light'],
      ['과일 가게', 'colorful fruit stacked at a market stall, bright daylight'],
      ['반찬 진열', 'a row of korean side dishes in stainless trays, top view'],
      ['야시장', 'a night market street with lit food stalls, warm glow']
    ] },
    { group: '스포츠 · 레저', items: [
      ['축구장', 'an empty green soccer field with white lines and goalposts, daylight'],
      ['야구장', 'a baseball stadium field with the diamond and stands, daylight'],
      ['수영장', 'a clean blue indoor swimming pool with lane lines, no people'],
      ['농구장', 'an indoor basketball court with wooden floor and hoop, bright light'],
      ['테니스장', 'an outdoor tennis court with a green surface and net, daylight'],
      ['등산로', 'a winding mountain trail through trees, soft daylight'],
      ['캠핑장', 'a quiet campsite with tents by a lake and pine trees, dusk'],
      ['골프장', 'a wide green golf course with rolling fairways, morning light']
    ] },
    { group: '교육 · 연구', items: [
      ['실험실', 'a clean science laboratory with glassware and benches, bright light, no people'],
      ['열람실', 'a quiet library reading room with long tables and lamps, warm light'],
      ['강의실', 'an empty university lecture hall with tiered seating, bright light'],
      ['컴퓨터실', 'a room of computers in rows on desks, bright even light, no people'],
      ['세미나실', 'a small seminar room with a round table and chairs, soft light']
    ] },
    { group: '병원 · 돌봄', items: [
      ['병원 복도', 'a clean bright hospital corridor with doors, no people'],
      ['수술실', 'an operating room with a surgical light and equipment, bright clean'],
      ['진료실', 'a doctor office with a desk and examination bed, bright clean, no people'],
      ['약국', 'a pharmacy interior with medicine shelves, bright even light, no people'],
      ['요양원', 'a bright care home lounge with comfortable chairs and plants, no people']
    ] }
  ],

  '인물': [
    { group: '실루엣', items: [
      ['정장 실루엣', 'flat solid navy silhouette of a business person in a suit, plain white background'],
      ['걷는 실루엣', 'flat solid grey silhouette of a person walking, side view, plain white background'],
      ['달리는 실루엣', 'flat solid dark silhouette of a running person, side view, plain white background'],
      ['여럿 실루엣', 'flat solid grey silhouettes of three people standing together, plain white background'],
      ['가족 실루엣', 'flat solid dark silhouettes of a family of four holding hands, plain white background'],
      ['아이 실루엣', 'flat solid dark silhouette of a small child standing, plain white background'],
      ['어르신 실루엣', 'flat solid grey silhouette of an elderly person with a cane, plain white background'],
      ['손 흔드는 실루엣', 'flat solid navy silhouette of a person waving a hand, plain white background'],
      ['앉은 실루엣', 'flat solid dark silhouette of a person sitting on a chair, plain white background'],
      ['악수 실루엣', 'flat solid navy silhouettes of two people shaking hands, plain white background'],
      ['운동 실루엣', 'flat solid dark silhouette of a person stretching, side view, plain white background'],
      ['우산 실루엣', 'flat solid grey silhouette of a person holding an umbrella, plain white background'],
      ['가방 실루엣', 'flat solid dark silhouette of a person carrying a briefcase, plain white background'],
      ['발표 실루엣', 'flat solid navy silhouette of a person standing at a lectern, plain white background']
    ] },
    { group: '업무', items: [
      ['정장 남성', 'studio portrait of a korean businessman in a navy suit, head and shoulders, plain light grey background, corporate headshot'],
      ['정장 여성', 'studio portrait of a korean businesswoman in a grey jacket, head and shoulders, plain light grey background, corporate headshot'],
      ['사무복', 'studio portrait of an office worker in a light blue shirt, head and shoulders, plain white background'],
      ['노트북 작업', 'a person working on a laptop at a desk, soft office background, corporate photography'],
      ['회의 발표', 'a person presenting in front of a screen, soft office background, corporate photography'],
      ['전화 통화', 'a person talking on the phone at a desk, soft office background, corporate photography'],
      ['서류 검토', 'a person reading paper documents at a desk, warm light, corporate photography'],
      ['악수', 'close up of two hands shaking in agreement, business attire, soft office background'],
      ['명함 교환', 'close up of two hands exchanging business cards, business attire, soft background'],
      ['책상 작업', 'a person writing at an office desk, soft daylight, corporate photography'],
      ['화이트보드', 'a person standing in front of a whiteboard with markers, office background'],
      ['팀 회의', 'a small team sitting around a table in discussion, soft office light'],
      ['상사', 'confident senior manager standing with arms crossed, office background, corporate photography'],
      ['인턴', 'young employee holding a notebook and smiling, office background, corporate photography']
    ] },
    { group: '의료', items: [
      ['의사', 'a doctor in a white coat with a stethoscope, plain light background, studio photograph'],
      ['간호사', 'a nurse in light blue scrubs, plain light background, studio photograph'],
      ['수술복', 'a medical worker in green surgical scrubs and cap, plain background'],
      ['청진기', 'close up of a doctor holding a stethoscope, plain light background'],
      ['마스크', 'a medical worker wearing a face mask, plain light background, studio photograph'],
      ['연구원', 'a lab researcher in a white coat and safety glasses, plain background'],
      ['약사', 'a pharmacist standing at a pharmacy counter, soft background'],
      ['구급대원', 'a paramedic in an orange safety vest, plain background, studio photograph'],
      ['물리치료사', 'a physiotherapist assisting a patient, bright clinic background'],
      ['수의사', 'a veterinarian holding a small dog, bright clinic background']
    ] },
    { group: '교육 · 학생', items: [
      ['교사', 'a teacher standing in front of a blackboard, bright classroom background'],
      ['학생', 'a school student with a backpack smiling, plain light background'],
      ['대학생', 'a university student holding books, plain light background, studio photograph'],
      ['졸업생', 'a graduate wearing a cap and gown, plain light background, studio photograph'],
      ['어린이', 'a young child smiling, plain light background, studio photograph'],
      ['배낭 학생', 'a student walking with a backpack, plain light background'],
      ['발표 학생', 'a student presenting in front of a classroom, bright background'],
      ['도서관 학생', 'a student reading at a library desk, warm light'],
      ['유치원', 'a kindergarten child playing with blocks, bright background'],
      ['과외', 'a tutor teaching a student at a desk, bright room background']
    ] },
    { group: '공공 · 서비스', items: [
      ['경찰', 'a police officer in uniform, plain light background, studio photograph'],
      ['소방관', 'a firefighter in protective gear, plain light background, studio photograph'],
      ['안전모 작업자', 'a construction worker wearing a yellow hard hat and vest, plain background'],
      ['요리사', 'a chef in a white uniform and hat, plain light background, studio photograph'],
      ['승무원', 'an airline cabin crew member in uniform, plain light background'],
      ['택배기사', 'a delivery worker holding a parcel, plain light background'],
      ['환경미화', 'a street cleaner in a safety vest, plain light background'],
      ['상담원', 'a call center agent with a headset, office background'],
      ['안내원', 'an information desk staff member smiling, bright lobby background'],
      ['군인', 'a soldier in uniform standing at attention, plain light background']
    ] },
    { group: '생활 · 취미', items: [
      ['요리하는 사람', 'a person cooking in a bright kitchen, warm light'],
      ['정원 가꾸기', 'a person gardening with plants and pots, bright outdoor light'],
      ['운동하는 사람', 'a person exercising with a yoga mat, bright room background'],
      ['자전거 타는 사람', 'a person riding a bicycle on a path, bright daylight'],
      ['책 읽는 사람', 'a person reading a book in a cozy chair, warm light'],
      ['기타 치는 사람', 'a person playing an acoustic guitar, warm room background'],
      ['사진 찍는 사람', 'a person holding a camera up to their eye, soft background'],
      ['반려견과', 'a person walking a dog on a leash, bright park background'],
      ['커피 마시는 사람', 'a person holding a coffee cup, cozy cafe background'],
      ['요가', 'a person doing a yoga pose on a mat, bright minimal room'],
      ['등산', 'a person hiking with a backpack on a trail, bright outdoor light'],
      ['낚시', 'a person fishing at a lake shore, soft morning light'],
      ['그림 그리는 사람', 'a person painting on a canvas, bright studio background'],
      ['노래하는 사람', 'a person singing into a microphone, warm stage light']
    ] },
    { group: '가족 · 관계', items: [
      ['가족', 'a happy family of four standing together, plain light background'],
      ['부모와 아이', 'a parent holding a child, plain light background'],
      ['할머니와 손자', 'a grandmother with her grandchild, plain light background'],
      ['부부', 'a married couple standing together, plain light background'],
      ['형제', 'two siblings standing together, plain light background'],
      ['친구들', 'a group of friends laughing together, bright background'],
      ['동료들', 'a group of office colleagues standing together, office background'],
      ['어머니', 'a mother holding a baby, plain light background'],
      ['아버지', 'a father with his child on his shoulders, plain light background'],
      ['아기', 'a baby sitting and smiling, plain light background'],
      ['신혼부부', 'a newlywed couple in wedding attire, soft light background'],
      ['삼대', 'three generations of a family standing together, plain light background'],
      ['쌍둥이', 'twin children standing together, plain light background'],
      ['반려동물 가족', 'a person holding a cat and a dog, plain light background']
    ] },
    { group: '인물 사진', items: [
      ['증명사진', 'passport photo of a person facing the camera, centered head, plain white background, even lighting'],
      ['이력서용', 'resume photo of a person facing the camera, plain light grey background, professional'],
      ['밝은 미소', 'portrait of a smiling person facing the camera, plain light background'],
      ['측면', 'side profile portrait of a person, plain light background'],
      ['상반신', 'upper body portrait of a person facing the camera, plain light background'],
      ['전신', 'full body photo of a person standing, plain light background'],
      ['손', 'close up of an open hand palm up, plain light background'],
      ['뒷모습', 'a person seen from behind, plain light background'],
      ['점프', 'a person jumping with arms up, plain light background'],
      ['응원', 'a person cheering with both arms raised, plain light background'],
      ['하이파이브', 'two people giving a high five, plain light background'],
      ['박수', 'close up of hands clapping, plain light background'],
      ['생각하는 사람', 'a person thinking with a hand near the chin, plain light background'],
      ['엄지척', 'a person giving a thumbs up, plain light background']
    ] },
    { group: '스포츠', items: [
      ['축구선수', 'a soccer player in a uniform with a ball, plain light background'],
      ['야구선수', 'a baseball player in a uniform holding a bat, plain light background'],
      ['수영선수', 'a swimmer in goggles and a cap, plain light background'],
      ['농구선수', 'a basketball player holding a ball, plain light background'],
      ['테니스선수', 'a tennis player holding a racket, plain light background'],
      ['마라토너', 'a runner in sportswear running, plain light background'],
      ['등산가', 'a hiker with a backpack and a stick, plain light background'],
      ['자전거선수', 'a cyclist with a helmet and a bicycle, plain light background']
    ] },
    { group: '예술 · 창작', items: [
      ['화가', 'a painter holding a brush and palette in a studio, warm light'],
      ['음악가', 'a musician holding a violin, plain light background'],
      ['사진작가', 'a photographer holding a camera, plain light background'],
      ['작가', 'a writer sitting at a desk with a notebook, warm light'],
      ['도예가', 'a potter shaping clay on a wheel, warm studio light'],
      ['무용수', 'a dancer in a graceful pose, plain light background'],
      ['배우', 'an actor standing on a stage, warm light background'],
      ['건축가', 'an architect holding rolled blueprints, bright office background']
    ] },
    { group: '기술 · IT', items: [
      ['프로그래머', 'a programmer at a desk with two monitors, soft office light'],
      ['데이터 분석가', 'an analyst looking at charts on a screen, soft office light'],
      ['디자이너', 'a designer working on a tablet with a stylus, bright studio'],
      ['엔지니어', 'an engineer in a hard hat holding a laptop, industrial background'],
      ['로봇 연구원', 'a researcher beside a small robot arm, lab background'],
      ['드론 조종사', 'a person holding a drone remote controller, outdoor background'],
      ['정비사', 'a mechanic in overalls holding a wrench, garage background'],
      ['전기기사', 'an electrician with a tool belt and a tester, bright background']
    ] },
    { group: '농림 · 어업', items: [
      ['농부', 'a farmer in a hat standing in a field, bright daylight'],
      ['과수원 주인', 'a person holding a basket of apples in an orchard, daylight'],
      ['목장주', 'a person with a cow in a green pasture, daylight'],
      ['어부', 'a fisherman holding a net by the sea, morning light'],
      ['정원사', 'a gardener with pruning shears among plants, bright daylight'],
      ['양봉가', 'a beekeeper in a white protective suit, outdoor background'],
      ['임업인', 'a forestry worker with a helmet in a pine forest, daylight'],
      ['화훼농가', 'a person holding a bundle of flowers in a greenhouse, bright light']
    ] },
    { group: '돌봄 · 봉사', items: [
      ['사회복지사', 'a social worker talking with a clipboard, bright office background'],
      ['자원봉사자', 'a volunteer wearing a vest holding a box, bright outdoor light'],
      ['요양보호사', 'a caregiver helping an elderly person walk, bright room'],
      ['상담사', 'a counselor sitting in a chair listening, warm room background'],
      ['통역사', 'an interpreter with a headset and notebook, bright background'],
      ['안내 도우미', 'a helper in a vest pointing the way, bright lobby background'],
      ['재활치료사', 'a therapist guiding a patient with an exercise band, bright clinic'],
      ['훈련사', 'a dog trainer with a dog and treats, bright outdoor light']
    ] },
    { group: '아이 · 청소년', items: [
      ['유치원생', 'a small child in a kindergarten uniform, plain light background'],
      ['초등학생', 'an elementary student with a backpack, plain light background'],
      ['중학생', 'a middle school student in uniform, plain light background'],
      ['고등학생', 'a high school student in uniform holding books, plain light background'],
      ['동아리 학생', 'students working together on a project, bright classroom'],
      ['운동부 학생', 'a student athlete in a track uniform, plain light background'],
      ['악기 배우는 아이', 'a child practicing a small violin, bright room'],
      ['그림 그리는 아이', 'a child drawing with crayons at a table, bright room']
    ] },
    { group: '어르신', items: [
      ['할아버지', 'an elderly korean man smiling, plain light background, studio photograph'],
      ['할머니', 'an elderly korean woman in a traditional blouse, plain light background'],
      ['시니어 모델', 'an elegant senior model posing, plain grey background'],
      ['텃밭 어르신', 'an elderly person watering a small garden, bright daylight'],
      ['산책 어르신', 'an elderly couple walking on a park path, soft daylight'],
      ['노인정', 'a group of elderly people sitting together talking, bright room']
    ] },
    { group: '단체 · 군중', items: [
      ['회의 참가자', 'a group of people seated at a conference, soft light'],
      ['관객', 'an audience seated in rows seen from the stage, warm light'],
      ['졸업식 단체', 'graduates in caps and gowns standing together, bright daylight'],
      ['응원단', 'a cheering crowd with raised hands, bright stadium'],
      ['워크숍 팀', 'a team standing around a table working together, bright office'],
      ['행렬', 'a group of people walking in a line outdoors, daylight']
    ] }
  ],

  '에셋': [
    { group: '리본 · 배지', items: [
      ['리본', 'glossy red satin ribbon banner curved, isolated on plain white background, product photograph'],
      ['리본 배너', 'champagne gold ribbon banner with soft folds, isolated on plain white background'],
      ['상장 리본', 'navy blue award ribbon with a round seal, isolated on plain white background'],
      ['메달 리본', 'red white and blue medal ribbon rosette, isolated on plain white background'],
      ['금메달', 'shiny gold medal with a ribbon, isolated on plain white background'],
      ['은메달', 'shiny silver medal with a ribbon, isolated on plain white background'],
      ['동메달', 'bronze medal with a ribbon, isolated on plain white background'],
      ['로제트', 'fabric award rosette in red and gold, isolated on plain white background'],
      ['배지', 'round enamel pin badge with a blank face, isolated on plain white background'],
      ['트로피', 'shiny gold trophy cup, isolated on plain white background, product photograph'],
      ['왕관', 'golden crown with small jewels, isolated on plain white background'],
      ['월계관', 'gold laurel wreath, isolated on plain white background']
    ] },
    { group: '프레임 · 테두리', items: [
      ['금 테두리', 'ornate gold picture frame filling the edges with a large empty white center, straight on view, isolated on plain white background'],
      ['은 테두리', 'thin silver picture frame filling the edges with a large empty white center, isolated on plain white background'],
      ['목재 액자', 'simple wooden photo frame with a large empty white center, isolated on plain white background'],
      ['원형 액자', 'round golden frame ring with an empty white center, isolated on plain white background'],
      ['레이스 테두리', 'delicate white lace border frame, empty center, isolated on plain white background'],
      ['꽃 테두리', 'border frame made of small colorful flowers, empty white center, isolated on plain white background'],
      ['잎 테두리', 'border frame made of green leaves, empty white center, isolated on plain white background'],
      ['리본 테두리', 'border frame decorated with satin ribbon, empty white center, isolated on plain white background'],
      ['스크랩북 프레임', 'layered paper scrapbook frame in kraft and cream, empty center, isolated on plain white background'],
      ['폴라로이드', 'blank polaroid photo frame with a wide bottom margin, isolated on plain white background'],
      ['원형 배지 테두리', 'scalloped round label border outline, empty center, isolated on plain white background'],
      ['사각 테두리', 'double line square border frame, empty center, isolated on plain white background']
    ] },
    { group: '말풍선 · 표시', items: [
      ['말풍선', 'single large round speech bubble with a small tail at the bottom left, flat white fill with soft grey outline, isolated on plain white background'],
      ['생각 풍선', 'thought bubble made of small circles leading to a cloud shape, white fill with grey outline, isolated on plain white background'],
      ['외침 풍선', 'jagged explosive speech bubble shape with a sharp outline, isolated on plain white background'],
      ['사각 말풍선', 'rectangular speech bubble with a small tail, white fill with grey outline, isolated on plain white background'],
      ['화살표 라벨', 'flat arrow shaped label banner pointing right, isolated on plain white background'],
      ['리본 라벨', 'ribbon banner label with folded ends, isolated on plain white background'],
      ['가격표', 'paper price tag with a string hole, isolated on plain white background'],
      ['태그', 'simple hang tag shape with a rounded hole, isolated on plain white background'],
      ['스티커', 'blank round sticker with a white border, isolated on plain white background'],
      ['별 표시', 'flat yellow five pointed star sticker, isolated on plain white background'],
      ['체크 표시', 'flat green check mark, isolated on plain white background'],
      ['느낌표', 'flat red exclamation mark, isolated on plain white background']
    ] },
    { group: '종이 · 문구', items: [
      ['우표', 'blank vintage postage stamp with perforated edges, cream paper, isolated on plain white background'],
      ['마스킹테이프', 'two pieces of beige masking tape crossed, slight transparency, isolated on plain white background'],
      ['집게', 'silver metal binder clip, studio product photograph, isolated on plain white background'],
      ['압정', 'red push pin, isolated on plain white background, product photograph'],
      ['포스트잇', 'pale yellow sticky note with a slight curl, isolated on plain white background'],
      ['접힌 종이', 'folded white paper sheet, isolated on plain white background'],
      ['찢어진 종이', 'torn piece of kraft paper with rough edges, isolated on plain white background'],
      ['노트 페이지', 'blank ruled notebook page with spiral binding on the left, isolated on plain white background'],
      ['도장', 'wooden handle rubber stamp, studio product photograph, isolated on plain white background'],
      ['인장 자국', 'round red korean seal stamp imprint, isolated on plain white background'],
      ['서명', 'handwritten ink signature on paper, isolated on plain white background'],
      ['스티커 라벨', 'sheet of blank round white labels, isolated on plain white background'],
      ['봉투', 'closed kraft paper envelope, isolated on plain white background'],
      ['카드', 'blank cream greeting card standing upright, isolated on plain white background']
    ] },
    { group: '식물 · 꽃', items: [
      ['나뭇잎', 'delicate green eucalyptus branch, watercolor botanical illustration, isolated on plain white background'],
      ['유칼립투스', 'eucalyptus sprig with round leaves, watercolor style, isolated on plain white background'],
      ['몬스테라', 'monstera leaf with split edges, isolated on plain white background'],
      ['야자잎', 'tropical palm frond, isolated on plain white background'],
      ['벚꽃 가지', 'cherry blossom branch with pink flowers, watercolor style, isolated on plain white background'],
      ['튤립', 'single red tulip with green stem, isolated on plain white background'],
      ['해바라기', 'single sunflower with a green stem, isolated on plain white background'],
      ['장미', 'single red rose with green leaves, isolated on plain white background'],
      ['라벤더', 'small bundle of lavender stems, isolated on plain white background'],
      ['은행잎', 'single yellow ginkgo leaf, isolated on plain white background'],
      ['단풍잎', 'single red maple leaf, isolated on plain white background'],
      ['갈대', 'a few golden reed stalks, isolated on plain white background'],
      ['이끼', 'small green moss patch, isolated on plain white background'],
      ['다육식물', 'small potted succulent plant, isolated on plain white background']
    ] },
    { group: '자연 · 날씨', items: [
      ['구름', 'three soft white fluffy clouds, watercolor style, isolated on a plain light blue background'],
      ['비구름', 'grey rain cloud with falling raindrops, flat style, isolated on plain white background'],
      ['해', 'flat warm yellow sun with soft rays, isolated on plain white background'],
      ['달', 'pale crescent moon glowing, isolated on a plain dark blue background'],
      ['별', 'flat five pointed star with a soft glow, isolated on a plain dark background'],
      ['눈송이', 'delicate white snowflake crystal shape, isolated on a plain light blue background'],
      ['반짝이', 'scattered golden sparkles and bokeh lights, soft glow, isolated on a plain dark background'],
      ['무지개', 'a soft pastel rainbow arc, isolated on plain white background'],
      ['물방울', 'a single clear water drop, isolated on plain white background'],
      ['번개', 'flat yellow lightning bolt, isolated on a plain dark background'],
      ['안개', 'soft white mist shapes, isolated on a plain grey background'],
      ['파도', 'stylized blue ocean wave curling, isolated on plain white background']
    ] },
    { group: '장식 · 소품', items: [
      ['리본 매듭', 'satin ribbon bow in red, isolated on plain white background'],
      ['하트', 'glossy red heart, isolated on plain white background'],
      ['별 장식', 'golden star ornament with a soft shine, isolated on plain white background'],
      ['반짝임', 'small sparkle burst shape in gold, isolated on plain white background'],
      ['구슬', 'a string of glossy beads, isolated on plain white background'],
      ['깃발', 'colorful triangular bunting flags on a string, isolated on plain white background'],
      ['풍선', 'a bunch of colorful party balloons, isolated on plain white background'],
      ['초', 'a lit candle with a warm flame, isolated on plain white background'],
      ['종', 'golden bell with a small ribbon, isolated on plain white background'],
      ['컵케이크', 'colorful cupcake with frosting and a cherry, isolated on plain white background'],
      ['선물 상자', 'gift box wrapped with a ribbon and bow, isolated on plain white background'],
      ['꽃다발', 'small wrapped bouquet of colorful flowers, isolated on plain white background']
    ] },
    { group: '사물', items: [
      ['커피잔', 'a white ceramic coffee cup with a saucer, isolated on plain white background'],
      ['책', 'a closed hardcover book, isolated on plain white background'],
      ['연필', 'a yellow wooden pencil, isolated on plain white background'],
      ['붓', 'a paint brush with a wooden handle, isolated on plain white background'],
      ['팔레트', 'a wooden paint palette with blobs of color, isolated on plain white background'],
      ['카메라', 'a classic photo camera, isolated on plain white background, product photograph'],
      ['지구본', 'a small desk globe, isolated on plain white background, product photograph'],
      ['시계', 'a round wall clock with a blank face, isolated on plain white background'],
      ['열쇠', 'two brass keys on a ring, isolated on plain white background'],
      ['편지', 'an open envelope with a letter, isolated on plain white background'],
      ['우산', 'a folded umbrella standing, isolated on plain white background'],
      ['가방', 'a leather briefcase, isolated on plain white background, product photograph']
    ] },
    { group: '문구 · 필기', items: [
      ['볼펜', 'a blue ballpoint pen, isolated on plain white background, product photograph'],
      ['만년필', 'a black fountain pen with a gold nib, isolated on plain white background'],
      ['형광펜', 'three colorful highlighter pens, isolated on plain white background'],
      ['자', 'a clear plastic ruler, isolated on plain white background'],
      ['가위', 'a pair of steel scissors, isolated on plain white background'],
      ['풀', 'a glue stick with the cap off, isolated on plain white background'],
      ['테이프 디스펜서', 'a tape dispenser with clear tape, isolated on plain white background'],
      ['스테이플러', 'a black stapler, isolated on plain white background, product photograph']
    ] },
    { group: '주방 · 요리', items: [
      ['프라이팬', 'a black frying pan, isolated on plain white background, product photograph'],
      ['냄비', 'a stainless steel cooking pot with a lid, isolated on plain white background'],
      ['도마', 'a wooden cutting board, isolated on plain white background'],
      ['칼', 'a chef knife with a wooden handle, isolated on plain white background'],
      ['국자', 'a steel ladle, isolated on plain white background, product photograph'],
      ['밀대', 'a wooden rolling pin, isolated on plain white background'],
      ['계량컵', 'a glass measuring cup, isolated on plain white background'],
      ['오븐 장갑', 'a pair of striped oven mitts, isolated on plain white background']
    ] },
    { group: '청소 · 생활', items: [
      ['빗자루', 'a straw broom, isolated on plain white background, product photograph'],
      ['걸레', 'a folded blue cleaning cloth, isolated on plain white background'],
      ['세제병', 'a spray bottle of cleaner, isolated on plain white background'],
      ['쓰레기통', 'a small grey waste bin, isolated on plain white background'],
      ['바구니', 'a woven wicker basket, isolated on plain white background'],
      ['우산꽂이', 'a metal umbrella stand holding an umbrella, isolated on plain white background'],
      ['빨래집게', 'several colorful clothespins, isolated on plain white background'],
      ['다리미', 'a modern steam iron, isolated on plain white background, product photograph']
    ] },
    { group: '공구 · 수리', items: [
      ['망치', 'a claw hammer, isolated on plain white background, product photograph'],
      ['드라이버', 'two screwdrivers with different tips, isolated on plain white background'],
      ['렌치', 'an adjustable wrench, isolated on plain white background'],
      ['톱', 'a hand saw with a wooden handle, isolated on plain white background'],
      ['펜치', 'a pair of pliers, isolated on plain white background, product photograph'],
      ['못 상자', 'a small box of nails and screws, isolated on plain white background'],
      ['줄자', 'a metal tape measure, isolated on plain white background'],
      ['전동드릴', 'a cordless power drill, isolated on plain white background, product photograph']
    ] },
    { group: '전자 · 디지털', items: [
      ['스마트폰', 'a modern smartphone with a blank screen, isolated on plain white background'],
      ['태블릿', 'a tablet computer with a blank screen, isolated on plain white background'],
      ['헤드폰', 'over-ear headphones, isolated on plain white background, product photograph'],
      ['마우스', 'a computer mouse, isolated on plain white background, product photograph'],
      ['키보드', 'a slim computer keyboard, isolated on plain white background'],
      ['충전기', 'a phone charger with a cable, isolated on plain white background'],
      ['USB', 'a usb flash drive, isolated on plain white background, product photograph'],
      ['스피커', 'a small portable speaker, isolated on plain white background']
    ] },
    { group: '여행 · 나들이', items: [
      ['캐리어', 'a hard shell rolling suitcase, isolated on plain white background'],
      ['배낭', 'a hiking backpack, isolated on plain white background, product photograph'],
      ['여권', 'a passport booklet with a blank cover, isolated on plain white background'],
      ['지도', 'a folded paper map, isolated on plain white background'],
      ['텐트', 'a small dome camping tent, isolated on plain white background'],
      ['돗자리', 'a folded picnic mat, isolated on plain white background'],
      ['물병', 'a stainless steel water bottle, isolated on plain white background'],
      ['모자', 'a straw sun hat, isolated on plain white background, product photograph']
    ] },
    { group: '계절 · 명절', items: [
      ['벚꽃잎', 'pink cherry blossom petals floating, isolated on plain white background'],
      ['단풍잎 더미', 'a small pile of red and yellow autumn leaves, isolated on plain white background'],
      ['눈사람', 'a simple snowman with a scarf and carrot nose, isolated on plain white background'],
      ['모래삽', 'a small colorful beach shovel and bucket, isolated on plain white background'],
      ['세배', 'a traditional korean new year bow illustration, flat style, isolated on plain white background'],
      ['윷놀이판', 'traditional korean yut game sticks on a mat, isolated on plain white background']
    ] },
    { group: '모양 · 꾸밈', items: [
      ['리본 화살표', 'a ribbon shaped arrow banner pointing right, isolated on plain white background'],
      ['원형 배지 세트', 'a set of round blank badges in different sizes, isolated on plain white background'],
      ['구름 테두리', 'a border frame shaped like soft clouds, empty center, isolated on plain white background'],
      ['물감 자국', 'a soft watercolor paint splash in blue, isolated on plain white background'],
      ['종이 구멍', 'a row of punched paper holes, isolated on plain white background'],
      ['스티치 선', 'a dashed stitched line border, empty center, isolated on plain white background']
    ] }
  ]
};

/* ------------------------------------------------------------------ *
 *  목록 만들기
 * ------------------------------------------------------------------ */
const PREFIX = { '배경': 'bg', '인물': 'pp', '에셋': 'as' };

function buildList() {
  const out = [];
  Object.keys(PLAN).forEach(function (cat) {
    const prefix = PREFIX[cat];
    let n = 0;
    PLAN[cat].forEach(function (g) {
      g.items.forEach(function (it) {
        n++;
        const raw = rawSize(cat);
        const box = cropBox(cat);
        out.push({
          id: prefix + '-' + String(n).padStart(3, '0'),
          cat: cat,
          group: g.group,
          label: it[0],
          prompt: it[1],
          w: box.w, h: box.h,
          rawW: raw[0], rawH: raw[1],
          crop: box
        });
      });
    });
  });
  return out;
}

const ALL = buildList();

/* ------------------------------------------------------------------ *
 *  생성
 * ------------------------------------------------------------------ */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function makePollinations(item, seed) {
  const url = POLL_ENDPOINT + encodeURIComponent(item.prompt + ', centered composition, ' + NEG) +
    '?width=' + item.rawW + '&height=' + item.rawH + '&nologo=true&safe=true&seed=' + seed;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('HTTP ' + res.status + ' ' + text.slice(0, 160));
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!(buf[0] === 0xFF && buf[1] === 0xD8) && !(buf[0] === 0x89 && buf[1] === 0x50)) {
    throw new Error('이미지가 아님: ' + buf.toString('utf8').slice(0, 160));
  }
  return buf;
}

async function makeHuggingFace(item) {
  const res = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      Accept: 'image/jpeg'
    },
    body: JSON.stringify({
      inputs: NEG + NEG_KR + item.prompt,
      parameters: { width: item.w, height: item.h }
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('HTTP ' + res.status + ' ' + text.replace(/<[^>]*>/g, ' ').slice(0, 160));
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (!(buf[0] === 0xFF && buf[1] === 0xD8) && !(buf[0] === 0x89 && buf[1] === 0x50)) {
    throw new Error('이미지가 아님: ' + buf.toString('utf8').slice(0, 160));
  }
  return buf;
}

/* 같은 프롬프트라도 매번 같은 그림이 나오도록 id 로 씨앗을 고정한다. */
function seedOf(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 1000000;
}

function readManifest() {
  const p = path.join(OUT, 'manifest.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];
}

(async function main() {
  let list = ALL;
  if (ONLY) list = list.filter(i => i.id === ONLY);
  if (CAT) list = list.filter(i => i.cat === CAT);
  if (GROUP) list = list.filter(i => i.group === GROUP);

  if (flag('--list')) {
    let cur = '';
    list.forEach(function (i) {
      if (i.cat !== cur) { cur = i.cat; console.log('\n[' + cur + ']'); }
      console.log('  ' + i.id + '  ' + i.group + ' · ' + i.label + '  (' + i.w + 'x' + i.h + ')');
    });
    console.log('\n합계 ' + list.length + '장');
    return;
  }

  if (!list.length) {
    console.error('해당하는 항목이 없습니다.');
    process.exit(1);
  }

  if (API === 'hf' && !TOKEN) {
    console.error('HF_TOKEN 이 없습니다. (HuggingFace 는 토큰이 있어야 합니다)');
    console.error('토큰 없이 만들려면 --api poll 로 실행하세요.');
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(RAW, { recursive: true });
  const manifest = readManifest();

  /* 오려내기 단계가 읽어 갈 목록 (id · 크기 · 오려낼 상자) */
  fs.writeFileSync(path.join(RAW, '_plan.json'), JSON.stringify(ALL.map(function (i) {
    return { id: i.id, cat: i.cat, group: i.group, label: i.label, w: i.w, h: i.h, crop: i.crop };
  }), null, 1) + '\n', 'utf8');

  /* Pollinations 는 IP 당 대기 1건만 받는다. 동시에 걸면 429 만 쏟아진다. */
  const jobs = API === 'hf' ? JOBS : 1;
  const delay = API === 'hf' ? 2000 : 400;

  let cursor = 0;
  let made = 0, skipped = 0;
  const failed = [];

  function saveManifest() {
    const order = {};
    ALL.forEach(function (it, n) { order[it.id] = n; });
    const seen = [];
    const clean = [];
    manifest.forEach(function (m) {
      if (seen.indexOf(m.id) >= 0) return;
      seen.push(m.id);
      clean.push(m);
    });
    clean.sort(function (a, b) { return (order[a.id] || 0) - (order[b.id] || 0); });
    manifest.length = 0;
    clean.forEach(function (m) { manifest.push(m); });
    fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  }

  function record(rec) {
    const idx = manifest.findIndex(m => m.id === rec.id);
    if (idx >= 0) manifest[idx] = rec; else manifest.push(rec);
  }

  async function worker() {
    for (;;) {
      const i = cursor++;
      if (i >= list.length) return;
      const item = list[i];
      /* 잘라내기 전 원본을 _raw 에 받아 둔다 */
      const target = path.join(RAW, item.id + '.jpg');
      const rec = {
        id: item.id, cat: item.cat, group: item.group,
        label: item.label, file: item.id + '.jpg', w: item.w, h: item.h
      };

      if (!FORCE && fs.existsSync(target) && fs.statSync(target).size > 2000) {
        skipped++;
        continue;
      }

      let done = false;
      for (let attempt = 1; attempt <= 5 && !done; attempt++) {
        try {
          const t0 = Date.now();
          const buf = API === 'hf'
            ? await makeHuggingFace(item)
            : await makePollinations(item, seedOf(item.id) + (attempt - 1));

          fs.writeFileSync(target, buf);
          made++;
          console.log('[' + String(made + skipped).padStart(3) + '/' + list.length + '] ' +
            item.id + ' ' + item.label + ' — ' + Math.round(buf.length / 1024) + 'KB, ' +
            Math.round((Date.now() - t0) / 1000) + '초');
          done = true;
        } catch (err) {
          const busy = /429/.test(err.message);
          if (attempt < 5) {
            await sleep(busy ? 12000 : attempt * 4000);
          } else {
            console.log('  실패 ' + item.id + ' — ' + err.message);
            failed.push(item.id);
          }
        }
      }

      await sleep(delay);
    }
  }

  console.log('엔진 ' + (API === 'hf' ? 'HuggingFace SD3' : 'Pollinations') +
    ' · 대상 ' + list.length + '장 · 동시 ' + jobs + '장');
  console.log('원본은 _raw 에 받고, 워터마크를 오려낸 뒤 assets/photos 에 넣습니다.\n');

  const pool = [];
  for (let k = 0; k < jobs; k++) pool.push(worker());
  await Promise.all(pool);

  /* 잘라내기 전에 이름·묶음 정보만 먼저 적어 둔다 */
  list.forEach(function (item) {
    const r = path.join(RAW, item.id + '.jpg');
    if (fs.existsSync(r) && fs.statSync(r).size > 2000) {
      record({
        id: item.id, cat: item.cat, group: item.group,
        label: item.label, file: item.id + '.jpg', w: item.w, h: item.h
      });
    }
  });
  saveManifest();

  console.log('\n원본 새로 받은 것 ' + made + ' · 건너뜀 ' + skipped + ' · 실패 ' + failed.length);
  if (failed.length) console.log('실패 목록: ' + failed.join(', '));
  console.log('다음: node scripts/crop-photos.js   (워터마크 오려내기)');
})().catch(function (err) {
  console.error('치명적 오류: ' + (err && err.stack || err));
  process.exit(1);
});
