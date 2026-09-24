// Encar's standard equipment catalogue, from
// api.encar.com/v1/readside/vehicles/car/options/standard. A listing carries
// only the codes (VehicleDetail.options.standard); the catalogue is stable, so
// it lives here in Albanian rather than as a second request per car. Grouped
// entries in the catalogue (e.g. "headlamps") have placeholder codes -- only
// the leaf codes below appear on listings, and they are unique.

export const OPTION_GROUPS = [
  { code: '01', name: 'Jashtë dhe brenda' },
  { code: '02', name: 'Siguria' },
  { code: '03', name: 'Komoditeti dhe multimedia' },
  { code: '04', name: 'Ulëset' },
] as const;

const OPTIONS: Record<string, { group: string; name: string }> = {
  '006': { group: '01', name: 'Mbyllje elektrike e dyerve' },
  '007': { group: '01', name: 'Xhama elektrikë' },
  '008': { group: '01', name: 'Servo-timon' },
  '010': { group: '01', name: 'Tavan xhami (sunroof)' },
  '017': { group: '01', name: 'Felga alumini' },
  '024': { group: '01', name: 'Pasqyra që palosen elektrikisht' },
  '029': { group: '01', name: 'Drita HID' },
  '030': { group: '01', name: 'Pasqyrë e brendshme që errësohet vetë' },
  '031': { group: '01', name: 'Komanda në timon' },
  '059': { group: '01', name: 'Bagazh elektrik' },
  '062': { group: '01', name: 'Shufra në kulm' },
  '074': { group: '01', name: 'Pajisje për pagesë autostrade (Hi-Pass)' },
  '075': { group: '01', name: 'Drita LED' },
  '080': { group: '01', name: 'Mbyllje e butë e dyerve' },
  '082': { group: '01', name: 'Timon me ngrohje' },
  '083': { group: '01', name: 'Timon i rregullueshëm elektrikisht' },
  '084': { group: '01', name: 'Ndërrues marshi në timon' },

  '001': { group: '02', name: 'ABS' },
  '002': { group: '02', name: 'Pezullim elektronik (ECS)' },
  '019': { group: '02', name: 'Kontroll i rrëshqitjes (TCS)' },
  '020': { group: '02', name: 'Airbag anësorë' },
  '026': { group: '02', name: 'Airbag i shoferit' },
  '027': { group: '02', name: 'Airbag i pasagjerit' },
  '032': { group: '02', name: 'Sensorë parkimi prapa' },
  '033': { group: '02', name: 'Sensorë presioni të gomave (TPMS)' },
  '055': { group: '02', name: 'Kontroll i stabilitetit (ESC)' },
  '056': { group: '02', name: 'Airbag perde' },
  '058': { group: '02', name: 'Kamerë prapa' },
  '085': { group: '02', name: 'Sensorë parkimi para' },
  '086': { group: '02', name: 'Paralajmërim për këndin e vdekur' },
  '087': { group: '02', name: 'Kamerë 360°' },
  '088': { group: '02', name: 'Paralajmërim për daljen nga korsia' },

  '003': { group: '03', name: 'CD player' },
  '004': { group: '03', name: 'Ekran përpara' },
  '005': { group: '03', name: 'Navigacion' },
  '015': { group: '03', name: 'Mbyllje me telekomandë' },
  '023': { group: '03', name: 'Klimë automatike' },
  '054': { group: '03', name: 'Ekrane për ulëset e pasme' },
  '057': { group: '03', name: 'Çelës inteligjent (keyless)' },
  '068': { group: '03', name: 'Tempomat' },
  '071': { group: '03', name: 'Hyrje AUX' },
  '072': { group: '03', name: 'Hyrje USB' },
  '079': { group: '03', name: 'Tempomat adaptiv' },
  '081': { group: '03', name: 'Sensor shiu' },
  '092': { group: '03', name: 'Perde për ulëset e pasme' },
  '093': { group: '03', name: 'Perde e xhamit të pasmë' },
  '094': { group: '03', name: 'Frenë dore elektrike' },
  '095': { group: '03', name: 'Head-up display' },
  '096': { group: '03', name: 'Bluetooth' },
  '097': { group: '03', name: 'Drita automatike' },

  '014': { group: '04', name: 'Ulëse lëkure' },
  '021': { group: '04', name: 'Ulëse elektrike e shoferit' },
  '022': { group: '04', name: 'Ulëse me ngrohje përpara' },
  '034': { group: '04', name: 'Ulëse e ventiluar e shoferit' },
  '035': { group: '04', name: 'Ulëse elektrike e pasagjerit' },
  '051': { group: '04', name: 'Ulëse me memorie e shoferit' },
  '063': { group: '04', name: 'Ulëse me ngrohje prapa' },
  '077': { group: '04', name: 'Ulëse e ventiluar e pasagjerit' },
  '078': { group: '04', name: 'Ulëse me memorie e pasagjerit' },
  '089': { group: '04', name: 'Ulëse elektrike prapa' },
  '090': { group: '04', name: 'Ulëse të ventiluara prapa' },
  '091': { group: '04', name: 'Ulëse me masazh' },
};

/**
 * What a buyer notices first, in order -- used for the one-line teaser on the
 * collapsed section. Basics every car has (ABS, power windows) never lead.
 */
const HIGHLIGHTS = [
  '010', '087', '095', '079', '034', '091', '075', '005', '014', '086', '057', '059',
];

export type OptionGroup = { code: string; name: string; items: string[] };

export function equipment(codes: string[] | undefined): {
  groups: OptionGroup[];
  count: number;
  highlights: string[];
} {
  const have = new Set((codes ?? []).filter((c) => c in OPTIONS));
  const groups = OPTION_GROUPS
    .map((g) => ({
      code: g.code,
      name: g.name,
      items: Object.keys(OPTIONS)
        .filter((c) => have.has(c) && OPTIONS[c].group === g.code)
        .map((c) => OPTIONS[c].name),
    }))
    .filter((g) => g.items.length);
  return {
    groups,
    count: have.size,
    highlights: HIGHLIGHTS.filter((c) => have.has(c)).map((c) => OPTIONS[c].name),
  };
}
