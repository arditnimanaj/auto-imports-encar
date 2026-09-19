/**
 * Encar returns Korean labels. These maps render them in English for buyers
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
  '가솔린': 'Petrol',
  '디젤': 'Diesel',
  '전기': 'Electric',
  '가솔린+전기': 'Hybrid',
  '디젤+전기': 'Diesel hybrid',
  'LPG': 'LPG',
  '가솔린+LPG': 'Petrol / LPG',
  '수소': 'Hydrogen',
};

const TRANSMISSIONS: Record<string, string> = {
  '오토': 'Automatic',
  '수동': 'Manual',
  'CVT': 'CVT',
};

const COLORS: Record<string, string> = {
  '흰색': 'White', '검정색': 'Black', '쥐색': 'Grey', '은색': 'Silver',
  '회색': 'Grey', '파랑색': 'Blue', '빨간색': 'Red', '명은색': 'Bright silver',
  '진주색': 'Pearl', '청색': 'Blue', '녹색': 'Green', '갈색': 'Brown',
};

const BODIES: Record<string, string> = {
  '세단': 'Saloon', 'SUV': 'SUV', '해치백': 'Hatchback', '쿠페': 'Coupe',
  '왜건': 'Estate', '컨버터블': 'Convertible', '스포츠카': 'Sports car',
  'RV': 'MPV', '승합': 'Van', '화물': 'Pickup', '리무진': 'Limousine',
  '경차': 'City car', '소형차': 'Small car', '준중형차': 'Compact',
  '중형차': 'Mid-size', '대형차': 'Full-size',
};

const pick = (map: Record<string, string>, v?: string | null) =>
  v ? (map[v] ?? v) : '';

export const makeEn = (v?: string | null) => pick(MAKES, v);
export const fuelEn = (v?: string | null) => pick(FUELS, v);
export const transmissionEn = (v?: string | null) => pick(TRANSMISSIONS, v);
export const colorEn = (v?: string | null) => pick(COLORS, v);
export const bodyEn = (v?: string | null) => pick(BODIES, v);

/** Fuel options for the filter bar: English label, Korean API value. */
export const FUEL_OPTIONS = [
  { label: 'Petrol', value: '가솔린' },
  { label: 'Diesel', value: '디젤' },
  { label: 'Electric', value: '전기' },
  { label: 'Hybrid', value: '가솔린+전기' },
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

/** Transliterate the Korean terms in a model or trim string. */
export function modelEn(v?: string | null): string {
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
