/**
 * Encar returns Korean labels. These maps render them in Albanian for buyers
 * here. Anything unmapped falls through unchanged rather than being dropped,
 * so a new make still shows up -- just in Korean until it's added.
 */
const MAKES: Record<string, string> = {
  '벤츠': 'Mercedes-Benz',
  '아우디': 'Audi',
  '폭스바겐': 'Volkswagen',
  '테슬라': 'Tesla',
  '볼보': 'Volvo',
  '랜드로버': 'Land Rover',
  '미니': 'MINI',
  '포르쉐': 'Porsche',
  '렉서스': 'Lexus',
  '도요타': 'Toyota',
  '폴스타': 'Polestar',
  '캐딜락': 'Cadillac',
  '닷지': 'Dodge',
  '벤틀리': 'Bentley',
  '지프': 'Jeep',
  '푸조': 'Peugeot',
  '롤스로이스': 'Rolls-Royce',
  '페라리': 'Ferrari',
  '맥라렌': 'McLaren',
  '람보르기니': 'Lamborghini',
  '링컨': 'Lincoln',
  '크라이슬러': 'Chrysler',
  '재규어': 'Jaguar',
  '마세라티': 'Maserati',
  '혼다': 'Honda',
  '닛산': 'Nissan',
  '포드': 'Ford',
  '쉐보레': 'Chevrolet',
};

const FUELS: Record<string, string> = {
  '가솔린': 'Benzinë',
  '디젤': 'Naftë',
  '전기': 'Elektrik',
  '가솔린+전기': 'Hibrid',
  '디젤+전기': 'Hibrid naftë',
  'LPG': 'Gaz',
  '가솔린+LPG': 'Benzinë / Gaz',
  '수소': 'Hidrogjen',
};

const TRANSMISSIONS: Record<string, string> = {
  '오토': 'Automatik',
  '수동': 'Manual',
  'CVT': 'CVT',
};

const COLORS: Record<string, string> = {
  '흰색': 'E bardhë', '검정색': 'E zezë', '쥐색': 'Gri', '은색': 'Argjend',
  '회색': 'Gri', '파랑색': 'Blu', '빨간색': 'E kuqe', '명은색': 'Argjend i çelët',
  '진주색': 'Perla', '청색': 'Blu', '녹색': 'Jeshile', '갈색': 'Kafe',
};

const BODIES: Record<string, string> = {
  '세단': 'Limuzinë', 'SUV': 'SUV', '해치백': 'Hexhbek', '쿠페': 'Kupe',
  '왜건': 'Familjar', '컨버터블': 'Kabriolet', '스포츠카': 'Sportive',
  'RV': 'Minivan', '승합': 'Furgon', '화물': 'Pikap', '리무진': 'Limuzinë',
  '경차': 'Veturë e vogël', '소형차': 'E vogël', '준중형차': 'Kompakte',
  '중형차': 'Mesatare', '대형차': 'E madhe',
};

const pick = (map: Record<string, string>, v?: string | null) =>
  v ? (map[v] ?? v) : '';

export const makeSq = (v?: string | null) => pick(MAKES, v);
export const fuelSq = (v?: string | null) => pick(FUELS, v);
export const transmissionSq = (v?: string | null) => pick(TRANSMISSIONS, v);
export const colorSq = (v?: string | null) => pick(COLORS, v);
export const bodySq = (v?: string | null) => pick(BODIES, v);

/** Fuel options for the filter bar: Albanian label, Korean API value. */
export const FUEL_OPTIONS = [
  { label: 'Benzinë', value: '가솔린' },
  { label: 'Naftë', value: '디젤' },
  { label: 'Elektrik', value: '전기' },
  { label: 'Hibrid', value: '가솔린+전기' },
] as const;

/**
 * Encar's search endpoint returns model and trim names in Korean only -- the
 * English equivalents exist solely on the per-car detail endpoint, and fetching
 * that for every card would mean one extra request per listing.
 *
 * Instead these are the model/trim terms that actually occur in the data
 * (sampled across live stock), transliterated term by term. Anything
 * unlisted is left as-is rather than mangled.
 */
const TERMS: Record<string, string> = {
  // Body and range words
  '시리즈': 'Series', '클래스': 'Class', '세대': 'gen', '쿠페': 'Coupe',
  '세단': 'Sedan', '그란쿠페': 'Gran Coupe', '카브리올레': 'Cabriolet',
  '컨버터블': 'Convertible', '왜건': 'Wagon', '인승': '-seat',
  // Trim and package words
  '스포츠': 'Sport', '프리미엄': 'Premium', '프레스티지': 'Prestige',
  '익스클루시브': 'Exclusive', '에디션': 'Edition', '럭셔리': 'Luxury',
  '다이나믹': 'Dynamic', '아방가르드': 'Avantgarde', '베이스': 'Base',
  '스탠다드': 'Standard', '클래식': 'Classic', '디자인': 'Design',
  '퓨어': 'Pure', '엑셀런스': 'Excellence', '플러스': 'Plus',
  '울트라': 'Ultra', '브라이트': 'Bright', '이그제큐티브': 'Executive',
  '페이버드': 'Favoured', '퍼포먼스': 'Performance', '랜드마크': 'Landmark',
  '어드밴스드': 'Advanced', '마누팍투어': 'Manufaktur', '카본': 'Carbon',
  '온라인': 'Online', '프로': 'Pro', '터보': 'Turbo', '플래드': 'Plaid',
  '모델': 'Model', '블랙': 'Black',
  // Drivetrain
  '콰트로': 'quattro', '하이브리드': 'Hybrid', '롱레인지': 'Long Range',
  '롱': 'Long', '레인지': 'Range', '에어서스': 'Air Suspension',
  // Model names
  '레인지로버': 'Range Rover', '디스커버리': 'Discovery', '디펜더': 'Defender',
  '이보크': 'Evoque', '벨라': 'Velar', '쿠퍼': 'Cooper',
  '컨트리맨': 'Countryman', '에이스맨': 'Aceman', '골프': 'Golf',
  '투아렉': 'Touareg', '파나메라': 'Panamera', '카레라': 'Carrera',
  '프리우스': 'Prius', '캠리': 'Camry', '돌핀': 'Dolphin', '아토': 'Atto',
};

const TERM_RE = new RegExp(Object.keys(TERMS).sort((a, b) => b.length - a.length).join('|'), 'g');

/**
 * Transliterate the Korean terms in a model or trim string. These stay in
 * English on purpose: they are manufacturer trim names buyers recognise
 * ("Gran Coupe", "Long Range"), not words to translate.
 */
export function modelSq(v?: string | null): string {
  if (!v) return '';
  return v
    .replace(TERM_RE, (m, offset: number, full: string) => {
      // "5시리즈" needs a space ("5 Series"); "E-클래스" must not get one.
      const prev = full[offset - 1];
      const gap = prev && /[0-9]/.test(prev) ? ' ' : '';
      return gap + TERMS[m];
    })
    .replace(/\s+/g, ' ')
    .trim();
}
