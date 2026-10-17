// Countries Meta can target, named in the visitor's language by the browser itself.
const CODES = 'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RW SA SB SC SE SG SH SI SK SL SM SN SO SR SS ST SV SX SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'.split(' ')

const names = (() => {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }) } catch { return null }
})()

export const COUNTRIES = CODES
  .map((code) => ({ code, name: names?.of(code) || code }))
  .sort((a, b) => a.name.localeCompare(b.name))

const byName = new Map(COUNTRIES.map((country) => [country.name.toLowerCase(), country]))

export const isCountry = (value) => byName.has(String(value || '').trim().toLowerCase())

// The visitor's own country, from the browser locale (e.g. en-PK → Pakistan).
export function defaultCountry() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region
    return COUNTRIES.find((country) => country.code === region)?.name || ''
  } catch {
    return ''
  }
}

export const RADII = [25, 40, 60, 80]
