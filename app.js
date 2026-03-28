/* =========================================
   THE REAL BIG MAC INDEX — app.js v3
   Complete rebuild following design_v2.md
   ========================================= */
   'use strict';

   // ============================================================
   //  GLOBAL STATE
   // ============================================================
   let currentMode = 'EN';          // 'EN' | 'KO'
   let rates       = {};            // exchange rates object
   let prices      = [];            // bigmac_prices.json
   let calculated  = [];            // index_calculated.json
   let countries   = [];            // verified, non-anomaly, sorted
   let anomalies   = [];            // anomaly countries
   
   // Ranking
   let rankingTab = 'cheap';        // 'cheap' | 'expensive'
   let chartRanking = null;
   
   // Wage calculator
   let wageCountryCode = 'KR';
   let wageLocal = 9860;
   let wageUSD = 0;
   
   // Continent charts
   let chartContinent = null;
   let chartContinentBar = null;
   
   const CONTINENT_MAP = {
     asia:      ['KR','JP','CN','IN','HK','TW','TH','MY','SG','ID','PH','PK','LK','VN','AZ','BH','JO','KW','OM','QA','SA','AE','IL'],
     europe:    ['GB','EU','DK','NO','SE','CH','CZ','HU','PL','RO','UA','MD','TR','RU'],
     namerica:  ['US','CA','MX','CR','GT','HN','NI'],
     samerica:  ['AR','BR','CL','CO','PE','UY'],
     africa:    ['ZA','EG'],
     oceania:   ['AU','NZ'],
   };
   
   const CONTINENT_COLORS = {
     asia:     '#4285F4',
     europe:   '#DA291C',
     namerica: '#34A853',
     samerica: '#FF6D00',
     africa:   '#FFC72C',
     oceania:  '#9C27B0',
   };
   
   // Pagination
   let exchangePage = 0;
   const EXCHANGE_PER_PAGE = 5;
   let exchangeBaseAmount = 1;
   let ratesTimestamp = '';
   
   const EXCHANGE_ORDER_EN = [
     'KR','JP','EU','GB','CN','AU','CA','TH','VN','SG',
     'CH','NZ','TW','PH','MY','HK','IN','ID','MX',
     'CZ','HU','PL','SE','NO','DK','TR','AE','BR','AR',
     'IL','RU','ZA','EG','SA','PE','CL','CO','UY','CR',
     'RO','UA','PK','LK','JO','KW','BH','OM','QA','AZ',
     'GT','HN','NI','MD'
   ];
   const EXCHANGE_ORDER_KO = [
     'US','JP','EU','GB','CN','AU','CA','TH','VN','SG',
     'CH','NZ','TW','PH','MY','HK','KR','IN','ID','MX',
     'CZ','HU','PL','SE','NO','DK','TR','AE','BR','AR',
     'IL','RU','ZA','EG','SA','PE','CL','CO','UY','CR',
     'RO','UA','PK','LK','JO','KW','BH','OM','QA','AZ',
     'GT','HN','NI','MD'
   ];
   
   // ============================================================
   //  i18n
   // ============================================================
   const i18n = {
     EN: {
       title: "The Real Big Mac Index 🍔",
       subtitle: "How many Big Macs can you buy with your hourly wage?",
       selectCountry: "Select your country",
       hourlyWage: "Your hourly wage",
       section_exchange: "Exchange Rates",
       section_wage: "Wage Calculator",
       section_kpi: "Your Purchasing Power",
       section_ranking: "Global Ranking",
       section_chart: "Price Chart",
       section_continent: "By Continent",
       section_valuation: "Currency Valuation",
       section_map: "🍔 My Big Mac Purchasing Power Map",
       cheapest: "Cheapest",
       expensive: "Most Expensive",
       overvalued: "Overvalued",
       undervalued: "Undervalued",
       fairValue: "Fair Value",
       minutesLabel: "minutes of work for 1 Big Mac",
       bigmacsPerHour: "Big Macs per hour",
       rankLabel: "Global Rank",
       showMore: "Show More",
       showLess: "Show Less",
       usdPrice: "USD Price",
       localPrice: "Local Price",
       valuation: "Valuation",
       continent_asia: "Asia",
       continent_europe: "Europe",
       continent_namerica: "N. America",
       continent_samerica: "S. America",
       continent_africa: "Africa",
       continent_oceania: "Oceania",
       toggleLabel: "EN / USD",
       footer: "Data: The Economist (Jan 2025) · Exchange rates: open.er-api.com · Not affiliated with McDonald's",
       perHour: "/ hr",
       equivUSD: "= ${v} USD",
       bestCountry: "Best Value",
       worstCountry: "Most Expensive",
       topPercent: "Top {n}%",
       kpiTimer: "Time to earn 1 Big Mac",
       kpiMinutes: "{n} min",
       kpiCheapest: "in {country} (cheapest)",
       kpiRank: "Your purchasing power",
       kpiRankDesc: "ranks top {n}% globally",
       kpiBest: "Best bang for your buck",
       kpiWorst: "Most expensive for you",
       kpiBurgers: "{n} Big Macs/hr",
       exchangeBase: "1 USD =",
       chartSelectCountry: "Click a country to see rate history",
       chartLoading: "Loading chart...",
       chartUnavailable: "Chart unavailable",
       chartTitle: "{flag} {name} — {currency}/USD",
       mapMoreThan: "You can buy {n}× more than in {country}",
       mapLessThan: "You can buy {n}× less than in {country}",
       mapSameAs: "Same purchasing power as {country}",
       mapBurgers: "{n} Big Macs with 1hr wage",
       mapClickHint: "Click a country on the map or select below",
       mapNoData: "No Big Mac data",
       mapLegendHigh: "High",
       mapLegendLow: "Low",
       mapSearchLabel: "Search country",
     },
     KO: {
       title: "리얼 빅맥 지수 🍔",
       subtitle: "내 시급으로 각 나라에서 빅맥을 몇 개 살 수 있을까?",
       selectCountry: "내 나라 선택",
       hourlyWage: "시급 입력",
       section_exchange: "각국 환율",
       section_wage: "시급 계산기",
       section_kpi: "나의 구매력",
       section_ranking: "전세계 랭킹",
       section_chart: "가격 차트",
       section_continent: "대륙별 비교",
       section_valuation: "통화 가치 평가",
       section_map: "🍔 나의 빅맥 구매력 지도",
       cheapest: "저렴한 순",
       expensive: "비싼 순",
       overvalued: "고평가",
       undervalued: "저평가",
       fairValue: "적정",
       minutesLabel: "분 일하면 빅맥 1개",
       bigmacsPerHour: "시간당 빅맥 개수",
       rankLabel: "글로벌 순위",
       showMore: "더 보기",
       showLess: "접기",
       usdPrice: "달러 가격",
       localPrice: "현지 가격",
       valuation: "통화 평가",
       continent_asia: "아시아",
       continent_europe: "유럽",
       continent_namerica: "북미",
       continent_samerica: "남미",
       continent_africa: "아프리카",
       continent_oceania: "오세아니아",
       toggleLabel: "KO / ₩",
       footer: "데이터: The Economist (2025.01) · 환율: open.er-api.com · 맥도날드와 무관합니다",
       perHour: "/ 시간",
       equivUSD: "= ₩{v} KRW",
       bestCountry: "가성비 최고",
       worstCountry: "가장 비싼 나라",
       topPercent: "상위 {n}%",
       kpiTimer: "빅맥 1개 벌려면",
       kpiMinutes: "{n}분",
       kpiCheapest: "{country}에서 (최저가)",
       kpiRank: "나의 구매력 순위",
       kpiRankDesc: "전세계 상위 {n}%",
       kpiBest: "가성비 최고 나라",
       kpiWorst: "가장 비싼 나라",
       kpiBurgers: "{n}개/시간",
       exchangeBase: "1 KRW =",
       chartSelectCountry: "국가를 클릭하면 환율 추이를 볼 수 있습니다",
       chartLoading: "차트 로딩 중...",
       chartUnavailable: "차트를 불러올 수 없습니다",
       chartTitle: "{flag} {name} — {currency}/KRW",
       mapMoreThan: "{country}보다 {n}배 더 살 수 있어요",
       mapLessThan: "{country}보다 {n}배 덜 살 수 있어요",
       mapSameAs: "{country}와 같은 구매력이에요",
       mapBurgers: "1시간 일하면 빅맥 {n}개",
       mapClickHint: "지도에서 나라를 클릭하거나 아래에서 선택하세요",
       mapNoData: "빅맥 데이터 없음",
       mapLegendHigh: "많이",
       mapLegendLow: "적게",
       mapSearchLabel: "나라 검색",
     }
   };
   
   const countryNameKO = {
     US:'미국', AR:'아르헨티나', AU:'호주', BR:'브라질', GB:'영국',
     CA:'캐나다', CL:'칠레', CN:'중국', CO:'콜롬비아', CR:'코스타리카',
     CZ:'체코', DK:'덴마크', EG:'이집트', EU:'유로존', HK:'홍콩',
     HU:'헝가리', IN:'인도', ID:'인도네시아', IL:'이스라엘', JP:'일본',
     MY:'말레이시아', MX:'멕시코', NZ:'뉴질랜드', NO:'노르웨이',
     PK:'파키스탄', PE:'페루', PH:'필리핀', PL:'폴란드', RO:'루마니아',
     RU:'러시아', SA:'사우디아라비아', SG:'싱가포르', ZA:'남아프리카',
     KR:'한국', LK:'스리랑카', SE:'스웨덴', CH:'스위스', TW:'대만',
     TH:'태국', TR:'튀르키예', UA:'우크라이나', AE:'UAE', UY:'우루과이',
     VN:'베트남', AZ:'아제르바이잔', BH:'바레인', GT:'과테말라',
     HN:'온두라스', JO:'요르단', KW:'쿠웨이트', MD:'몰도바',
     NI:'니카라과', OM:'오만', QA:'카타르',
     VE:'베네수엘라', LB:'레바논',
   };
   
   // ============================================================
   //  DATA LOADING
   // ============================================================
   
   /**
    * 환율 로딩 전략 (3단계 폴백)
    *
    * 1순위: open.er-api.com 실시간 API (매일 갱신, 무료, 키 불필요)
    * 2순위: frankfurter.app 폴백 API
    * 3순위: 로컬 data/exchange_rates.json (항상 유지되는 안전망)
    *
    * ※ 로컬 파일을 마지막으로 둔 이유:
    *    - API가 성공하면 항상 최신 환율 사용
    *    - 네트워크 완전 차단 시에만 로컬 파일 사용
    *    - 현재 올라간 나라들이 절대 깨지지 않도록 보장
    */
   async function loadExchangeRates() {
     const today = new Date().toISOString().split('T')[0];
   
     // 1순위: open.er-api.com 실시간 API
     try {
       const res = await fetch('https://open.er-api.com/v6/latest/USD');
       if (!res.ok) throw new Error('API HTTP ' + res.status);
       const data = await res.json();
       if (!data.rates || !data.rates.KRW) throw new Error('Invalid API response');
       console.log('Exchange rates: live API success, KRW =', data.rates.KRW);
       const apiDate = data.time_last_update_utc || data.date || today;
       ratesTimestamp = formatApiTimestamp(apiDate) + ' (live)';
       return data.rates;
     } catch (e) {
       console.warn('Exchange rates: primary API failed:', e.message);
     }
   
     // 2순위: frankfurter.app 폴백 API
     try {
       const res = await fetch('https://api.frankfurter.app/latest?from=USD');
       if (!res.ok) throw new Error('Frankfurter HTTP ' + res.status);
       const data = await res.json();
       if (!data.rates) throw new Error('Invalid frankfurter response');
       // frankfurter는 USD 자체를 포함하지 않으므로 추가
       data.rates.USD = 1;
       console.log('Exchange rates: frankfurter fallback success');
       ratesTimestamp = (data.date || today) + ' (frankfurter)';
       return data.rates;
     } catch (e) {
       console.warn('Exchange rates: fallback API failed:', e.message);
     }
   
     // 3순위: 로컬 파일 (네트워크 완전 불가 시 안전망)
     try {
       const res = await fetch('./data/exchange_rates.json');
       if (!res.ok) throw new Error('Local file HTTP ' + res.status);
       const data = await res.json();
       if (!data.rates) throw new Error('Invalid local file');
       console.warn('Exchange rates: using local fallback file, dated:', data.last_updated);
       ratesTimestamp = (data.last_updated || 'cached') + ' (offline)';
       return data.rates;
     } catch (e) {
       console.error('Exchange rates: all sources failed:', e.message);
       // 최후 수단: 하드코딩된 기본값 (2026-03-24 기준)
       ratesTimestamp = '2026-03-24 (hardcoded)';
       return FALLBACK_RATES;
     }
   }
   
   /**
    * 하드코딩 폴백 환율 (모든 네트워크 실패 시 사이트가 깨지지 않도록)
    * 현재 올라간 나라들의 통화만 포함
    */
   const FALLBACK_RATES = {
     USD:1, KRW:1488, JPY:158.6, EUR:0.862, GBP:0.745, AUD:1.427,
     CAD:1.372, SGD:1.275, CHF:0.787, NZD:1.708, TWD:31.86, CNY:6.897,
     THB:32.33, MYR:3.939, HKD:7.833, INR:93.46, IDR:16925, MXN:17.79,
     CZK:21.07, HUF:334.4, PLN:3.675, SEK:9.332, NOK:9.736, DKK:6.436,
     TRY:44.35, AED:3.673, BRL:5.258, ARS:1452, ILS:3.115, RUB:82.03,
     ZAR:16.83, EGP:52.31, SAR:3.75, PEN:3.455, CLP:923.8, COP:3671,
     UYU:40.02, CRC:463.3, RON:4.393, UAH:43.69, PKR:278.7, LKR:311.4,
     JOD:0.709, KWD:0.306, BHD:0.376, OMR:0.384, QAR:3.64, AZN:1.691,
     GTQ:7.596, HNL:26.25, NIO:36.50, MDL:17.37, VND:26276, PHP:59.72,
   };
   
   /** API 타임스탬프 포맷 */
   function formatApiTimestamp(raw) {
     try {
       const d = new Date(raw);
       if (isNaN(d.getTime())) return raw;
       const yyyy = d.getFullYear();
       const mm = String(d.getMonth() + 1).padStart(2, '0');
       const dd = String(d.getDate()).padStart(2, '0');
       const hh = String(d.getHours()).padStart(2, '0');
       const mi = String(d.getMinutes()).padStart(2, '0');
       return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi + ' UTC';
     } catch {
       return raw;
     }
   }
   
   /** 전체 데이터 로딩 */
   // ============================================================
   //  BIGMAC PRICES — 자동 업데이트 (1월/7월)
   //  1순위: 이코노미스트 GitHub CSV (최신 데이터 자동 반영)
   //  2순위: 로컬 data/bigmac_prices.json (안전망)
   // ============================================================
   const ECONOMIST_CSV_URL =
     'https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/source-data/big-mac-source-data-v2.csv';
   
   const SUPPORTED_COUNTRY_CODES = new Set([
     'US','AR','AU','BR','GB','CA','CL','CN','CO','CR','CZ','DK','EG','EU',
     'HK','HU','IN','ID','IL','JP','MY','MX','NZ','NO','PK','PE','PH','PL',
     'RO','RU','SA','SG','ZA','KR','LK','SE','CH','TW','TH','TR','UA','AE',
     'UY','VE','VN','AZ','BH','GT','HN','JO','KW','LB','MD','NI','OM','QA'
   ]);
   
   const COUNTRY_META = {
     US:{currency:'USD',symbol:'$',flag:'🇺🇸',name:'United States'},
     AR:{currency:'ARS',symbol:'$',flag:'🇦🇷',name:'Argentina'},
     AU:{currency:'AUD',symbol:'A$',flag:'🇦🇺',name:'Australia'},
     BR:{currency:'BRL',symbol:'R$',flag:'🇧🇷',name:'Brazil'},
     GB:{currency:'GBP',symbol:'£',flag:'🇬🇧',name:'Britain'},
     CA:{currency:'CAD',symbol:'CA$',flag:'🇨🇦',name:'Canada'},
     CL:{currency:'CLP',symbol:'CLP$',flag:'🇨🇱',name:'Chile'},
     CN:{currency:'CNY',symbol:'¥',flag:'🇨🇳',name:'China'},
     CO:{currency:'COP',symbol:'COP$',flag:'🇨🇴',name:'Colombia'},
     CR:{currency:'CRC',symbol:'₡',flag:'🇨🇷',name:'Costa Rica'},
     CZ:{currency:'CZK',symbol:'Kč',flag:'🇨🇿',name:'Czech Republic'},
     DK:{currency:'DKK',symbol:'kr',flag:'🇩🇰',name:'Denmark'},
     EG:{currency:'EGP',symbol:'E£',flag:'🇪🇬',name:'Egypt'},
     EU:{currency:'EUR',symbol:'€',flag:'🇪🇺',name:'Euro area'},
     HK:{currency:'HKD',symbol:'HK$',flag:'🇭🇰',name:'Hong Kong'},
     HU:{currency:'HUF',symbol:'Ft',flag:'🇭🇺',name:'Hungary'},
     IN:{currency:'INR',symbol:'₹',flag:'🇮🇳',name:'India'},
     ID:{currency:'IDR',symbol:'Rp',flag:'🇮🇩',name:'Indonesia'},
     IL:{currency:'ILS',symbol:'₪',flag:'🇮🇱',name:'Israel'},
     JP:{currency:'JPY',symbol:'¥',flag:'🇯🇵',name:'Japan'},
     MY:{currency:'MYR',symbol:'RM',flag:'🇲🇾',name:'Malaysia'},
     MX:{currency:'MXN',symbol:'MX$',flag:'🇲🇽',name:'Mexico'},
     NZ:{currency:'NZD',symbol:'NZ$',flag:'🇳🇿',name:'New Zealand'},
     NO:{currency:'NOK',symbol:'kr',flag:'🇳🇴',name:'Norway'},
     PK:{currency:'PKR',symbol:'Rs',flag:'🇵🇰',name:'Pakistan'},
     PE:{currency:'PEN',symbol:'S/',flag:'🇵🇪',name:'Peru'},
     PH:{currency:'PHP',symbol:'₱',flag:'🇵🇭',name:'Philippines'},
     PL:{currency:'PLN',symbol:'zł',flag:'🇵🇱',name:'Poland'},
     RO:{currency:'RON',symbol:'lei',flag:'🇷🇴',name:'Romania'},
     RU:{currency:'RUB',symbol:'₽',flag:'🇷🇺',name:'Russia'},
     SA:{currency:'SAR',symbol:'SR',flag:'🇸🇦',name:'Saudi Arabia'},
     SG:{currency:'SGD',symbol:'S$',flag:'🇸🇬',name:'Singapore'},
     ZA:{currency:'ZAR',symbol:'R',flag:'🇿🇦',name:'South Africa'},
     KR:{currency:'KRW',symbol:'₩',flag:'🇰🇷',name:'South Korea'},
     LK:{currency:'LKR',symbol:'Rs',flag:'🇱🇰',name:'Sri Lanka'},
     SE:{currency:'SEK',symbol:'kr',flag:'🇸🇪',name:'Sweden'},
     CH:{currency:'CHF',symbol:'CHF',flag:'🇨🇭',name:'Switzerland'},
     TW:{currency:'TWD',symbol:'NT$',flag:'🇹🇼',name:'Taiwan'},
     TH:{currency:'THB',symbol:'฿',flag:'🇹🇭',name:'Thailand'},
     TR:{currency:'TRY',symbol:'₺',flag:'🇹🇷',name:'Turkey'},
     UA:{currency:'UAH',symbol:'₴',flag:'🇺🇦',name:'Ukraine'},
     AE:{currency:'AED',symbol:'AED',flag:'🇦🇪',name:'United Arab Emirates'},
     UY:{currency:'UYU',symbol:'$U',flag:'🇺🇾',name:'Uruguay'},
     VE:{currency:'VES',symbol:'Bs.S',flag:'🇻🇪',name:'Venezuela'},
     VN:{currency:'VND',symbol:'₫',flag:'🇻🇳',name:'Vietnam'},
     AZ:{currency:'AZN',symbol:'₼',flag:'🇦🇿',name:'Azerbaijan'},
     BH:{currency:'BHD',symbol:'BD',flag:'🇧🇭',name:'Bahrain'},
     GT:{currency:'GTQ',symbol:'Q',flag:'🇬🇹',name:'Guatemala'},
     HN:{currency:'HNL',symbol:'L',flag:'🇭🇳',name:'Honduras'},
     JO:{currency:'JOD',symbol:'JD',flag:'🇯🇴',name:'Jordan'},
     KW:{currency:'KWD',symbol:'KD',flag:'🇰🇼',name:'Kuwait'},
     LB:{currency:'LBP',symbol:'LL',flag:'🇱🇧',name:'Lebanon'},
     MD:{currency:'MDL',symbol:'L',flag:'🇲🇩',name:'Moldova'},
     NI:{currency:'NIO',symbol:'C$',flag:'🇳🇮',name:'Nicaragua'},
     OM:{currency:'OMR',symbol:'OMR',flag:'🇴🇲',name:'Oman'},
     QA:{currency:'QAR',symbol:'QR',flag:'🇶🇦',name:'Qatar'},
   };
   
   const ISO3_TO_CODE = {
     USA:'US',ARG:'AR',AUS:'AU',BRA:'BR',GBR:'GB',CAN:'CA',CHL:'CL',CHN:'CN',
     COL:'CO',CRI:'CR',CZE:'CZ',DNK:'DK',EGY:'EG',EUZ:'EU',HKG:'HK',HUN:'HU',
     IND:'IN',IDN:'ID',ISR:'IL',JPN:'JP',MYS:'MY',MEX:'MX',NZL:'NZ',NOR:'NO',
     PAK:'PK',PER:'PE',PHL:'PH',POL:'PL',ROU:'RO',RUS:'RU',SAU:'SA',SGP:'SG',
     ZAF:'ZA',KOR:'KR',LKA:'LK',SWE:'SE',CHE:'CH',TWN:'TW',THA:'TH',TUR:'TR',
     UKR:'UA',ARE:'AE',URY:'UY',VEN:'VE',VNM:'VN',AZE:'AZ',BHR:'BH',GTM:'GT',
     HND:'HN',JOR:'JO',KWT:'KW',LBN:'LB',MDA:'MD',NIC:'NI',OMN:'OM',QAT:'QA',
   };
   
   function parseEconomistCSV(csvText) {
     const lines = csvText.trim().split('\n');
     const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''));
   
     const dateIdx   = headers.indexOf('date');
     const isoIdx    = headers.indexOf('iso_a3');
     const localIdx  = headers.indexOf('local_price');
     const dollarIdx = headers.indexOf('dollar_price');
   
     if (dateIdx < 0 || isoIdx < 0 || localIdx < 0) {
       throw new Error('CSV format changed: missing columns');
     }
   
     const byDate = {};
     for (let i = 1; i < lines.length; i++) {
       const cols = lines[i].split(',').map(c => c.trim().replace(/"/g,''));
       if (cols.length < 4) continue;
       const date  = cols[dateIdx];
       const iso3  = cols[isoIdx];
       const local = parseFloat(cols[localIdx]);
       const dollarP = parseFloat(cols[dollarIdx]);
       if (!date || !iso3 || isNaN(local)) continue;
       if (!byDate[date]) byDate[date] = [];
       byDate[date].push({ iso3, local, dollarP });
     }
   
     const latestDate = Object.keys(byDate).sort().reverse()[0];
     const latestRows = byDate[latestDate] || [];
     console.log('📅 Economist CSV latest:', latestDate, '—', latestRows.length, 'rows');
   
     const result = [];
     latestRows.forEach(function(row) {
       const code = ISO3_TO_CODE[row.iso3];
       if (!code || !SUPPORTED_COUNTRY_CODES.has(code)) return;
       const meta = COUNTRY_META[code];
       if (!meta) return;
       result.push({
         country:            meta.name,
         country_code:       code,
         flag:               meta.flag,
         currency:           meta.currency,
         currency_symbol:    meta.symbol,
         bigmac_price_local: row.local,
         bigmac_price_usd:   isNaN(row.dollarP) ? null : row.dollarP,
         data_date:          latestDate.slice(0,7),
         source:             ECONOMIST_CSV_URL,
         verified:           true,
         auto_updated:       true,
       });
     });
   
     const fetched = new Set(result.map(r => r.country_code));
     SUPPORTED_COUNTRY_CODES.forEach(function(code) {
       if (!fetched.has(code)) console.warn('⚠️ Not in Economist CSV:', code);
     });
   
     return result;
   }
   
   async function loadBigmacPrices() {
     try {
       const res = await fetch(ECONOMIST_CSV_URL);
       if (!res.ok) throw new Error('GitHub CSV HTTP ' + res.status);
       const text = await res.text();
       if (!text || text.length < 100) throw new Error('CSV empty');
       const parsed = parseEconomistCSV(text);
       if (parsed.length < 20) throw new Error('Too few countries: ' + parsed.length);
       console.log('✅ Bigmac prices: live CSV —', parsed.length, 'countries,', parsed[0]?.data_date);
       return parsed;
     } catch (e) {
       console.warn('⚠️ Bigmac CSV failed, using local fallback:', e.message);
       const res = await fetch('./data/bigmac_prices.json');
       if (!res.ok) throw new Error('Local bigmac_prices.json not found');
       const data = await res.json();
       console.log('✅ Bigmac prices: local fallback —', data.length, 'countries');
       return data;
     }
   }
   
   // ============================================================
   //  MINIMUM WAGE — 분기별 업데이트
   //  로컬 파일 기반 + 빅맥 대비 구매력 실시간 재계산
   // ============================================================
   
   async function loadMinimumWage(pricesData) {
     let wageData = null;
     try {
       const res = await fetch('./data/minimum_wage.json');
       if (!res.ok) throw new Error('minimum_wage.json HTTP ' + res.status);
       wageData = await res.json();
       console.log('✅ Minimum wage: local file loaded');
     } catch (e) {
       console.warn('⚠️ minimum_wage.json failed:', e.message);
       return null;
     }
   
     const priceMap = {};
     pricesData.forEach(function(p) { priceMap[p.country_code] = p.bigmac_price_usd; });
   
     const wages = wageData.wages || wageData;
     Object.keys(wages).forEach(function(code) {
       const w = wages[code];
       const hourly  = w.hourly_usd || null;
       const bmPrice = priceMap[code];
       w.bigmacs_per_hour = (hourly && bmPrice && bmPrice > 0)
         ? parseFloat((hourly / bmPrice).toFixed(2))
         : null;
     });
   
     return wages;
   }
   
   function mergeWageData(countriesList, wageMap) {
     if (!wageMap) return;
     countriesList.forEach(function(c) {
       const w = wageMap[c.country_code];
       if (w) {
         c.minimum_wage_usd = w.hourly_usd || null;
         c.minimum_wage_bigmacs_per_hour = w.bigmacs_per_hour || null;
       }
     });
   }
   
   async function loadAllData() {
     // 1. 환율 (실시간 API 우선)
     const ratesData = await loadExchangeRates();
   
     // 2. 빅맥 가격 (이코노미스트 CSV 우선 → 로컬 폴백)
     //    index_calculated.json은 구조 참고용 (실제 계산은 recalcValuations에서)
     const [pricesData, calculatedData] = await Promise.all([
       loadBigmacPrices(),
       fetch('./data/index_calculated.json').then(r => {
         if (!r.ok) throw new Error('index_calculated.json not found');
         return r.json();
       })
     ]);
   
     // 3. 최저임금 (로컬, 빅맥 가격 기반 재계산)
     const wageMap = await loadMinimumWage(pricesData);
   
     // 4. bigmac_prices + index_calculated 병합
     //    CSV 최신 가격을 calculated에 반영
     const mergedMap = {};
     calculatedData.forEach(function(c) { mergedMap[c.country_code] = Object.assign({}, c); });
   
     pricesData.forEach(function(p) {
       if (!mergedMap[p.country_code]) {
         // CSV에 있지만 calculated에 없는 신규 나라
         mergedMap[p.country_code] = {
           country_code: p.country_code,
           country:      p.country,
           flag:         p.flag,
           currency:     p.currency,
           currency_symbol: p.currency_symbol,
           bigmac_price_local: p.bigmac_price_local,
           bigmac_price_usd:   p.bigmac_price_usd,
           bigmac_ppp:   null,
           over_under_valued_pct: null,
           price_rank:   null,
           minimum_wage_bigmacs_per_hour: null,
           anomaly_flag: false,
         };
       } else {
         // 최신 CSV 가격으로 업데이트
         mergedMap[p.country_code].bigmac_price_local = p.bigmac_price_local;
         mergedMap[p.country_code].bigmac_price_usd   = p.bigmac_price_usd;
         mergedMap[p.country_code].data_date          = p.data_date;
       }
     });
   
     const mergedCalculated = Object.values(mergedMap);
   
     // 5. 최저임금 병합
     if (wageMap) mergeWageData(mergedCalculated, wageMap);
   
     return { rates: ratesData, prices: pricesData, calculated: mergedCalculated };
   }
   
   // ============================================================
   //  HELPERS
   // ============================================================
   
   function t(key) {
     return (i18n[currentMode] && i18n[currentMode][key]) || key;
   }
   
   function countryName(c) {
     if (currentMode === 'KO' && countryNameKO[c.country_code]) {
       return countryNameKO[c.country_code];
     }
     return c.country;
   }
   
   function displayPrice(usdPrice) {
     if (currentMode === 'KO') {
       const krw = usdPrice * (rates.KRW || 1400);
       return '₩' + Math.round(krw).toLocaleString('ko-KR');
     }
     return '$' + usdPrice.toFixed(2);
   }
   
   function formatLocal(val) {
     if (val == null) return '—';
     return val >= 1000
       ? val.toLocaleString('en-US', { maximumFractionDigits: 0 })
       : val.toLocaleString('en-US', { maximumFractionDigits: 2 });
   }
   
   // ============================================================
   //  APPLY i18n
   // ============================================================
   function applyI18n() {
     document.querySelectorAll('[data-i18n]').forEach(el => {
       const key = el.dataset.i18n;
       const text = t(key);
       if (text !== key) el.textContent = text;
     });
   }
   
   // ============================================================
   //  INIT
   // ============================================================
   // ============================================================
   //  REAL-TIME VALUATION RECALCULATION
   //  빅맥 지수의 핵심:
   //    - bigmac_price_usd  → 2025-01 당시 환율로 고정 (변경 안 함)
   //    - over_under_valued_pct → 실시간 환율로 매일 재계산
   //    - bigmac_ppp        → 현지가격 / 미국가격 (환율 무관, 고정)
   //
   //  공식:
   //    PPP환율  = 현지가격 / 미국가격(5.69)
   //    고평가율 = (PPP환율 - 실제환율) / 실제환율 × 100
   //
   //  예시 (한국, 실시간 환율 1488 기준):
   //    PPP  = 5800 / 5.69 = 1019.33
   //    고평가율 = (1019.33 - 1488) / 1488 × 100 = -31.5%
   // ============================================================
   
   const US_BIGMAC_PRICE = 5.69; // 2025-01 미국 빅맥 가격 (고정)
   
   /**
    * 실시간 환율로 모든 나라의 고평가율을 재계산
    * loadAllData() 완료 후 rates가 확정된 시점에 호출
    */
   function recalcValuations(countriesList, currentRates) {
     const usRate = currentRates['USD'] || 1; // 항상 1
   
     countriesList.forEach(function(c) {
       const rate = currentRates[c.currency];
       if (!rate) return; // 환율 없으면 건너뜀
   
       // PPP 환율: 현지 빅맥 가격을 미국 가격으로 나눈 값
       // (1 USD에 해당하는 현지 통화량)
       const ppp = c.bigmac_price_local / US_BIGMAC_PRICE;
   
       // 고평가율 재계산 (실시간 환율 반영)
       // 양수 = 고평가 (빅맥이 미국보다 비쌈)
       // 음수 = 저평가 (빅맥이 미국보다 쌈)
       const valuation = ((ppp - rate) / rate) * 100;
   
       // bigmac_ppp는 환율 무관 고정값이지만 일관성을 위해 재확인
       c.bigmac_ppp = parseFloat(ppp.toFixed(4));
       c.over_under_valued_pct = parseFloat(valuation.toFixed(1));
     });
   
     console.log('🔄 Valuations recalculated with live rates');
     console.log('   Sample KR:', countriesList.find(c => c.country_code === 'KR')?.over_under_valued_pct + '%');
     console.log('   Sample CH:', countriesList.find(c => c.country_code === 'CH')?.over_under_valued_pct + '%');
   }
   
   async function initApp() {
     const saved = localStorage.getItem('bigmac_mode');
     if (saved === 'KO') currentMode = 'KO';
   
     updateToggleBtn();
     applyI18n();
   
     try {
       const data = await loadAllData();
       rates      = data.rates;
       prices     = data.prices;
       calculated = data.calculated;
   
       countries = calculated.filter(c => !c.anomaly_flag);
       anomalies = calculated.filter(c => c.anomaly_flag);
   
       // ★ 핵심: 실시간 환율로 고평가율 재계산 (anomalies 포함)
       recalcValuations(countries, rates);
       recalcValuations(anomalies, rates);
   
       countries.sort((a, b) => a.bigmac_price_usd - b.bigmac_price_usd);
   
       console.log('✅ Data loaded successfully');
       console.log('   Countries:', countries.length, '(+', anomalies.length, 'anomalies)');
       console.log('   KRW rate:', rates.KRW);
       console.log('   Rates source:', ratesTimestamp);
   
       applyI18n();
       initWageCalculator();
       renderAll();
       bindExchangeEvents();
       bindExchangePeriodTabs();
       bindRankingEvents();
   
     } catch (err) {
       console.error('❌ Data loading failed:', err);
     }
   }
   
   // ============================================================
   //  EXCHANGE RATE SECTION
   // ============================================================
   
   function getExchangeCountries() {
     const orderList = currentMode === 'EN' ? EXCHANGE_ORDER_EN : EXCHANGE_ORDER_KO;
     const ordered = [];
     orderList.forEach(code => {
       const c = countries.find(x => x.country_code === code);
       if (c) ordered.push(c);
     });
     countries.forEach(c => {
       if (!ordered.find(x => x.country_code === c.country_code)) {
         ordered.push(c);
       }
     });
     return ordered;
   }
   
   function updateExchangeBaseUI() {
     const symbolEl = document.getElementById('exchange-base-symbol');
     const inputEl  = document.getElementById('exchange-base-input');
     const labelEl  = document.getElementById('exchange-base-label');
   
     if (currentMode === 'EN') {
       symbolEl.textContent = '$';
       labelEl.textContent  = 'USD';
       if (!inputEl.dataset.userEdited) {
         exchangeBaseAmount = 1;
         inputEl.value = 1;
       }
     } else {
       symbolEl.textContent = '₩';
       labelEl.textContent  = 'KRW';
       if (!inputEl.dataset.userEdited) {
         exchangeBaseAmount = 1000;
         inputEl.value = 1000;
       }
     }
   }
   
   function renderExchange() {
     const container = document.getElementById('exchange-cards');
     const pageEl    = document.getElementById('exchange-page');
     const prevBtn   = document.getElementById('exchange-prev');
     const nextBtn   = document.getElementById('exchange-next');
     if (!container) return;
   
     updateExchangeBaseUI();
   
     const ordered    = getExchangeCountries();
     const totalPages = Math.ceil(ordered.length / EXCHANGE_PER_PAGE);
     if (exchangePage < 0) exchangePage = 0;
     if (exchangePage >= totalPages) exchangePage = totalPages - 1;
   
     const start = exchangePage * EXCHANGE_PER_PAGE;
     const page  = ordered.slice(start, start + EXCHANGE_PER_PAGE);
   
     container.innerHTML = '';
   
     page.forEach(c => {
       const card = document.createElement('div');
       card.className = 'exchange-card';
   
       let rateValue;
       if (currentMode === 'EN') {
         const r = (rates[c.currency] || 0) * exchangeBaseAmount;
         rateValue = formatExchangeRate(r);
       } else {
         const krwRate = rates.KRW || 1400;
         const r = (exchangeBaseAmount / krwRate) * (rates[c.currency] || 0);
         rateValue = formatExchangeRate(r);
       }
   
       const name = countryName(c);
   
       card.dataset.code = c.country_code;
       if (selectedExCountry && selectedExCountry.country_code === c.country_code) {
         card.classList.add('selected');
       }
   
       card.innerHTML =
         '<div class="exchange-flag">' + c.flag + '</div>' +
         '<div class="exchange-info">' +
           '<div class="exchange-country">' + name + '</div>' +
           '<div class="exchange-code">' + c.currency + '</div>' +
         '</div>' +
         '<div class="exchange-right">' +
           '<div class="exchange-rate">' + c.currency_symbol + ' ' + rateValue + '</div>' +
         '</div>';
   
       card.style.cursor = 'pointer';
       const countryRef = c;
       card.addEventListener('click', () => onExchangeCardClick(countryRef));
   
       container.appendChild(card);
     });
   
     pageEl.textContent = (exchangePage + 1) + ' / ' + totalPages;
   
     const tsEl = document.getElementById('exchange-timestamp');
     if (tsEl && ratesTimestamp) {
       tsEl.textContent = (currentMode === 'KO' ? '기준: ' : 'As of: ') + ratesTimestamp;
     }
   
     prevBtn.disabled = exchangePage <= 0;
     nextBtn.disabled = exchangePage >= totalPages - 1;
   }
   
   function formatExchangeRate(val) {
     if (val >= 10000) return Math.round(val).toLocaleString('en-US');
     if (val >= 100)   return val.toFixed(2);
     if (val >= 1)     return val.toFixed(4);
     if (val >= 0.01)  return val.toFixed(4);
     return val.toFixed(6);
   }
   
   function bindExchangeEvents() {
     document.getElementById('exchange-prev').addEventListener('click', () => {
       if (exchangePage > 0) {
         exchangePage--;
         renderExchange();
       }
     });
     document.getElementById('exchange-next').addEventListener('click', () => {
       const ordered = getExchangeCountries();
       const totalPages = Math.ceil(ordered.length / EXCHANGE_PER_PAGE);
       if (exchangePage < totalPages - 1) {
         exchangePage++;
         renderExchange();
       }
     });
   
     let debounce;
     document.getElementById('exchange-base-input').addEventListener('input', (e) => {
       const val = parseFloat(e.target.value);
       e.target.dataset.userEdited = '1';
       if (!isNaN(val) && val > 0) {
         exchangeBaseAmount = val;
         clearTimeout(debounce);
         debounce = setTimeout(() => renderExchange(), 120);
       }
     });
   }
   
   // ============================================================
   //  EXCHANGE RATE HISTORY CHART
   // ============================================================
   let exchangeHistoryChart = null;
   let selectedExCurrency   = null;
   let selectedExCountry    = null;
   let selectedPeriod       = '6M';
   let historyCache         = {};
   
   function getPeriodDates(period) {
     const end = new Date();
     const start = new Date();
     switch (period) {
       case '3M':  start.setMonth(start.getMonth() - 3);  break;
       case '6M':  start.setMonth(start.getMonth() - 6);  break;
       case '1Y':  start.setFullYear(start.getFullYear() - 1); break;
       case '3Y':  start.setFullYear(start.getFullYear() - 3); break;
       case '5Y':  start.setFullYear(start.getFullYear() - 5); break;
     }
     return { start, end };
   }
   
   function generateSampleDates(start, end, period) {
     const dates = [];
     const ms = end.getTime() - start.getTime();
     let points;
     switch (period) {
       case '3M':  points = 12; break;
       case '6M':  points = 18; break;
       case '1Y':  points = 24; break;
       case '3Y':  points = 24; break;
       case '5Y':  points = 30; break;
       default:    points = 20;
     }
     for (let i = 0; i <= points; i++) {
       const d = new Date(start.getTime() + (ms * i / points));
       const yyyy = d.getFullYear();
       const mm = String(d.getMonth() + 1).padStart(2, '0');
       const dd = String(d.getDate()).padStart(2, '0');
       dates.push(yyyy + '-' + mm + '-' + dd);
     }
     return dates;
   }
   
   async function fetchRateForDate(dateStr, currency) {
     const cur = currency.toLowerCase();
     const url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@' + dateStr + '/v1/currencies/usd.json';
     try {
       const res = await fetch(url);
       if (!res.ok) return null;
       const data = await res.json();
       return data.usd && data.usd[cur] != null ? data.usd[cur] : null;
     } catch {
       return null;
     }
   }
   
   async function loadHistoryData(currency, period) {
     const cacheKey = currency + '_' + period;
     if (historyCache[cacheKey]) return historyCache[cacheKey];
   
     const { start, end } = getPeriodDates(period);
     const sampleDates = generateSampleDates(start, end, period);
   
     const results = [];
     const batchSize = 5;
     for (let i = 0; i < sampleDates.length; i += batchSize) {
       const batch = sampleDates.slice(i, i + batchSize);
       const batchResults = await Promise.all(
         batch.map(d => fetchRateForDate(d, currency))
       );
       results.push(...batchResults);
     }
   
     const dates = [];
     const values = [];
     sampleDates.forEach((d, i) => {
       if (results[i] != null) {
         dates.push(d);
         values.push(results[i]);
       }
     });
   
     const data = { dates, values };
     historyCache[cacheKey] = data;
     return data;
   }
   
   function renderExchangeHistoryChart(dates, values, currency, countryObj) {
     const canvas = document.getElementById('chart-exchange-history');
     const loadingEl = document.getElementById('exchange-chart-loading');
     if (!canvas) return;
   
     loadingEl.classList.add('hidden');
   
     let chartValues = values;
     let yLabel = currency + ' / USD';
   
     if (currentMode === 'KO') {
       if (currency === 'KRW') {
         yLabel = 'KRW / 1 USD';
       } else {
         const krwNow = rates.KRW || 1400;
         chartValues = values.map(v => krwNow / v);
         yLabel = 'KRW / 1 ' + currency;
       }
     }
   
     const name = countryName(countryObj);
     const titleEl = document.getElementById('exchange-chart-title');
     titleEl.textContent = countryObj.flag + ' ' + name + ' — ' + yLabel;
   
     const labels = dates.map(d => {
       const parts = d.split('-');
       return parts[1] + '/' + parts[2];
     });
   
     if (exchangeHistoryChart) exchangeHistoryChart.destroy();
   
     exchangeHistoryChart = new Chart(canvas, {
       type: 'line',
       data: {
         labels: labels,
         datasets: [{
           data: chartValues,
           borderColor: '#DA291C',
           backgroundColor: 'rgba(218,41,28,0.08)',
           borderWidth: 2,
           pointRadius: 3,
           pointBackgroundColor: '#DA291C',
           pointBorderColor: '#fff',
           pointBorderWidth: 1.5,
           fill: true,
           tension: 0.3,
         }]
       },
       options: {
         responsive: true,
         maintainAspectRatio: false,
         animation: { duration: 600 },
         plugins: {
           legend: { display: false },
           tooltip: {
             backgroundColor: '#1A1A1A',
             borderColor: 'rgba(255,199,44,0.4)',
             borderWidth: 1,
             titleColor: '#FFC72C',
             bodyColor: '#fff',
             padding: 10,
             cornerRadius: 8,
             callbacks: {
               title: function(ctx) { return dates[ctx[0].dataIndex]; },
               label: function(ctx) {
                 const v = ctx.raw;
                 return '  ' + yLabel + ': ' + (v >= 100 ? v.toFixed(2) : v.toFixed(4));
               }
             }
           }
         },
         scales: {
           x: {
             grid: { display: false },
             ticks: { color: '#9AA0A6', font: { size: 10 }, maxTicksLimit: 8 }
           },
           y: {
             grid: { color: 'rgba(0,0,0,0.05)' },
             ticks: {
               color: '#5F6368', font: { size: 10 },
               callback: v => v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(2)
             }
           }
         }
       }
     });
   }
   
   async function onExchangeCardClick(countryObj) {
     selectedExCurrency = countryObj.currency;
     selectedExCountry  = countryObj;
   
     document.querySelectorAll('.exchange-card').forEach(el => el.classList.remove('selected'));
     const cards = document.querySelectorAll('.exchange-card');
     cards.forEach(el => {
       if (el.dataset.code === countryObj.country_code) el.classList.add('selected');
     });
   
     const loadingEl = document.getElementById('exchange-chart-loading');
     loadingEl.textContent = t('chartLoading');
     loadingEl.classList.remove('hidden');
   
     const titleEl = document.getElementById('exchange-chart-title');
     titleEl.textContent = countryObj.flag + ' ' + countryName(countryObj) + ' — ' + t('chartLoading');
   
     try {
       var fetchCurrency = countryObj.currency;
       if (currentMode === 'KO' && fetchCurrency === 'USD') fetchCurrency = 'KRW';
   
       const data = await loadHistoryData(fetchCurrency, selectedPeriod);
       if (data.dates.length < 2) {
         loadingEl.textContent = t('chartUnavailable');
         loadingEl.classList.remove('hidden');
         return;
       }
       renderExchangeHistoryChart(data.dates, data.values, countryObj.currency, countryObj);
     } catch {
       loadingEl.textContent = t('chartUnavailable');
       loadingEl.classList.remove('hidden');
     }
   }
   
   function bindExchangePeriodTabs() {
     document.querySelectorAll('.period-tab').forEach(tab => {
       tab.addEventListener('click', () => {
         selectedPeriod = tab.dataset.period;
         document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
         tab.classList.add('active');
         if (selectedExCountry) {
           onExchangeCardClick(selectedExCountry);
         }
       });
     });
   }
   
   // ============================================================
   //  GLOBAL RANKING
   // ============================================================
   function renderRanking() {
     renderRankingTabs();
     renderRankingCards();
     renderRankingChart();
   }
   
   function renderRankingTabs() {
     const tabCheap = document.getElementById('tab-cheap');
     const tabExpensive = document.getElementById('tab-expensive');
     if (!tabCheap) return;
   
     tabCheap.textContent = '🟢 ' + t('cheapest') + ' TOP 5';
     tabExpensive.textContent = '🔴 ' + t('expensive') + ' TOP 5';
   
     tabCheap.classList.toggle('active', rankingTab === 'cheap');
     tabExpensive.classList.toggle('active', rankingTab === 'expensive');
   }
   
   function renderRankingCards() {
     const listEl = document.getElementById('ranking-list');
     if (!listEl) return;
   
     const sorted = [...countries].sort((a, b) =>
       rankingTab === 'cheap'
         ? a.bigmac_price_usd - b.bigmac_price_usd
         : b.bigmac_price_usd - a.bigmac_price_usd
     );
   
     const top5 = sorted.slice(0, 5);
     listEl.innerHTML = '';
   
     top5.forEach((c, i) => {
       const row = document.createElement('div');
       row.className = 'ranking-row';
   
       const name  = countryName(c);
       const price = displayPrice(c.bigmac_price_usd);
       const badge = getValuationBadge(c.over_under_valued_pct);
       const ppp   = c.bigmac_ppp != null ? c.bigmac_ppp.toFixed(2) : '—';
   
       row.innerHTML =
         '<div class="ranking-num">' + (i + 1) + '</div>' +
         '<div class="ranking-flag">' + c.flag + '</div>' +
         '<div class="ranking-info">' +
           '<div class="ranking-country">' + name + '</div>' +
           '<div class="ranking-local">' + c.currency_symbol + ' ' + formatLocal(c.bigmac_price_local) + ' ' + c.currency + '</div>' +
         '</div>' +
         '<div class="ranking-right">' +
           '<div class="ranking-price">' + price + '</div>' +
           '<div class="ranking-ppp">PPP ' + ppp + '</div>' +
           badge +
         '</div>';
   
       listEl.appendChild(row);
     });
   
     renderRankingExplainer(listEl);
   }
   
   function renderRankingExplainer(container) {
     const box = document.createElement('div');
     box.className = 'ranking-explainer';
   
     if (currentMode === 'KO') {
       box.innerHTML =
         '<div class="explainer-title">📊 빅맥 지수란?</div>' +
         '<p class="explainer-text">' +
           '빅맥 지수(Big Mac Index)는 각국 맥도날드 빅맥 가격을 비교하여 ' +
           '통화의 적정 환율을 가늠하는 구매력평가(PPP) 지표입니다.' +
         '</p>' +
         '<div class="explainer-formula">' +
           '<div class="formula-row"><span class="formula-label">PPP 환율</span> <span class="formula-eq">= 현지 빅맥 가격 ÷ 미국 빅맥 가격</span></div>' +
           '<div class="formula-row"><span class="formula-label">통화 평가</span> <span class="formula-eq">= (PPP환율 − 실제환율) ÷ 실제환율 × 100%</span></div>' +
         '</div>' +
         '<p class="explainer-note">' +
           '• 양수(+) = 고평가: 빅맥이 미국보다 비쌈<br>' +
           '• 음수(−) = 저평가: 빅맥이 미국보다 쌈<br>' +
           '• ±10% 이내 = 적정 가치' +
         '</p>';
     } else {
       box.innerHTML =
         '<div class="explainer-title">📊 What is the Big Mac Index?</div>' +
         '<p class="explainer-text">' +
           'The Big Mac Index compares Big Mac prices worldwide to estimate ' +
           'whether currencies are at their "correct" level — a fun Purchasing Power Parity (PPP) measure.' +
         '</p>' +
         '<div class="explainer-formula">' +
           '<div class="formula-row"><span class="formula-label">PPP Rate</span> <span class="formula-eq">= Local Price ÷ US Price ($5.69)</span></div>' +
           '<div class="formula-row"><span class="formula-label">Valuation</span> <span class="formula-eq">= (PPP − Actual Rate) ÷ Actual Rate × 100%</span></div>' +
         '</div>' +
         '<p class="explainer-note">' +
           '• Positive (+) = Overvalued: Big Mac costs more than in the US<br>' +
           '• Negative (−) = Undervalued: Big Mac costs less than in the US<br>' +
           '• Within ±10% = Fair Value' +
         '</p>';
     }
   
     container.appendChild(box);
   }
   
   function renderRankingChart() {
     const canvas = document.getElementById('chart-ranking');
     if (!canvas) return;
   
     const sorted = [...countries].sort((a, b) =>
       rankingTab === 'cheap'
         ? a.bigmac_price_usd - b.bigmac_price_usd
         : b.bigmac_price_usd - a.bigmac_price_usd
     );
   
     const labels = sorted.map(c => c.flag + ' ' + countryName(c));
     const values = sorted.map(c => {
       if (currentMode === 'KO') return Math.round(c.bigmac_price_usd * (rates.KRW || 1400));
       return c.bigmac_price_usd;
     });
   
     const minVal = Math.min(...values);
     const maxVal = Math.max(...values);
     const colors = values.map(v => {
       const ratio = (v - minVal) / (maxVal - minVal || 1);
       return interpolateGreenRed(ratio);
     });
   
     const barH = 22;
     const chartH = sorted.length * barH + 60;
     canvas.parentElement.style.height = chartH + 'px';
   
     if (chartRanking) chartRanking.destroy();
   
     const usCountry = countries.find(c => c.country_code === 'US');
     const usPrice = usCountry ? usCountry.bigmac_price_usd : 5.69;
     const fairLine = currentMode === 'KO' ? Math.round(usPrice * (rates.KRW || 1400)) : usPrice;
     const overLine = currentMode === 'KO' ? Math.round(usPrice * 1.1 * (rates.KRW || 1400)) : usPrice * 1.1;
     const underLine = currentMode === 'KO' ? Math.round(usPrice * 0.9 * (rates.KRW || 1400)) : usPrice * 0.9;
   
     const valuationLinesPlugin = {
       id: 'valuationLines',
       afterDraw: function(chart) {
         var ctx = chart.ctx;
         var area = chart.chartArea;
         var xScale = chart.scales.x;
         if (!xScale) return;
   
         var lines = [
           { val: underLine, color: 'rgba(27,127,58,0.35)', textColor: 'rgba(27,127,58,0.7)',
             label: currentMode === 'KO' ? '저평가 -10%' : 'Under -10%', yOff: -4 },
           { val: fairLine, color: 'rgba(32,33,36,0.45)', textColor: 'rgba(32,33,36,0.8)',
             label: currentMode === 'KO' ? '🇺🇸 기준가' : '🇺🇸 US Price', yOff: -16, bold: true },
           { val: overLine, color: 'rgba(218,41,28,0.35)', textColor: 'rgba(218,41,28,0.7)',
             label: currentMode === 'KO' ? '고평가 +10%' : 'Over +10%', yOff: -4 },
         ];
   
         lines.forEach(function(line) {
           var x = xScale.getPixelForValue(line.val);
           if (x < area.left || x > area.right) return;
           ctx.save();
           ctx.setLineDash(line.bold ? [6, 4] : [3, 3]);
           ctx.strokeStyle = line.color;
           ctx.lineWidth = line.bold ? 1.5 : 1;
           ctx.beginPath();
           ctx.moveTo(x, area.top);
           ctx.lineTo(x, area.bottom);
           ctx.stroke();
           ctx.setLineDash([]);
           ctx.fillStyle = line.textColor;
           ctx.font = (line.bold ? '700 9px' : '600 8px') + ' -apple-system, sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText(line.label, x, area.top + line.yOff);
           ctx.restore();
         });
       }
     };
   
     chartRanking = new Chart(canvas, {
       type: 'bar',
       plugins: [valuationLinesPlugin],
       data: {
         labels: labels,
         datasets: [{
           data: values,
           backgroundColor: colors,
           borderRadius: 3,
           borderSkipped: false,
         }]
       },
       options: {
         indexAxis: 'y',
         responsive: true,
         maintainAspectRatio: false,
         layout: { padding: { top: 22 } },
         animation: { duration: 700, easing: 'easeOutQuart' },
         plugins: {
           legend: { display: false },
           tooltip: {
             backgroundColor: '#1A1A1A',
             borderColor: 'rgba(255,199,44,0.4)',
             borderWidth: 1,
             titleColor: '#FFC72C',
             bodyColor: '#fff',
             padding: 10,
             cornerRadius: 8,
             callbacks: {
               title: function(ctx) { return countryName(sorted[ctx[0].dataIndex]); },
               label: function(ctx) {
                 var c = sorted[ctx.dataIndex];
                 var p = displayPrice(c.bigmac_price_usd);
                 var pct = c.over_under_valued_pct;
                 var valStr = pct == null ? t('fairValue')
                   : pct > 10  ? t('overvalued') + ' +' + pct.toFixed(0) + '%'
                   : pct < -10 ? t('undervalued') + ' ' + pct.toFixed(0) + '%'
                   : t('fairValue');
                 return [
                   '  ' + p,
                   '  ' + c.currency_symbol + ' ' + formatLocal(c.bigmac_price_local) + ' ' + c.currency,
                   '  ' + valStr
                 ];
               }
             }
           }
         },
         scales: {
           x: {
             grid: { color: 'rgba(0,0,0,0.05)' },
             ticks: {
               color: '#9AA0A6', font: { size: 10 },
               maxRotation: currentMode === 'KO' ? 90 : 0,
               minRotation: currentMode === 'KO' ? 45 : 0,
               callback: function(v) {
                 if (currentMode === 'KO') return Math.round(v).toLocaleString('ko-KR') + '원';
                 return '$' + v;
               }
             }
           },
           y: {
             grid: { display: false },
             ticks: { color: '#202124', font: { size: 10 }, padding: 2 }
           }
         }
       }
     });
   }
   
   function interpolateGreenRed(ratio) {
     let r, g, b;
     if (ratio < 0.5) {
       const t = ratio * 2;
       r = Math.round(76  + (255 - 76) * t);
       g = Math.round(175 + (199 - 175) * t);
       b = Math.round(80  + (44 - 80) * t);
     } else {
       const t = (ratio - 0.5) * 2;
       r = Math.round(255 + (218 - 255) * t);
       g = Math.round(199 + (41 - 199) * t);
       b = Math.round(44  + (28 - 44) * t);
     }
     return 'rgba(' + r + ',' + g + ',' + b + ',0.82)';
   }
   
   function getValuationBadge(pct) {
     if (pct == null) return '<span class="badge badge-fair">' + t('fairValue') + '</span>';
     if (pct > 10)    return '<span class="badge badge-over">' + t('overvalued') + ' +' + pct.toFixed(0) + '%</span>';
     if (pct < -10)   return '<span class="badge badge-under">' + t('undervalued') + ' ' + pct.toFixed(0) + '%</span>';
     return '<span class="badge badge-fair">' + t('fairValue') + '</span>';
   }
   
   function bindRankingEvents() {
     document.getElementById('tab-cheap').addEventListener('click', () => {
       if (rankingTab !== 'cheap') { rankingTab = 'cheap'; renderRanking(); }
     });
     document.getElementById('tab-expensive').addEventListener('click', () => {
       if (rankingTab !== 'expensive') { rankingTab = 'expensive'; renderRanking(); }
     });
   }
   
   // ============================================================
   //  WAGE CALCULATOR
   // ============================================================
   const DEFAULT_WAGES = {
     KR: 9860, US: 15, JP: 1113, GB: 11.44, EU: 12.41, AU: 24.10,
     CA: 17, SG: 8, CH: 25, NZ: 23.15, TW: 183, CN: 25, TH: 63,
   };
   
   function initWageCalculator() {
     const select = document.getElementById('wage-country');
     if (!select) return;
   
     select.innerHTML = '';
     const sortedForSelect = [...countries].sort((a, b) =>
       countryName(a).localeCompare(countryName(b), currentMode === 'KO' ? 'ko' : 'en')
     );
     sortedForSelect.forEach(c => {
       const opt = document.createElement('option');
       opt.value = c.country_code;
       opt.textContent = c.flag + ' ' + countryName(c) + ' (' + c.currency + ')';
       select.appendChild(opt);
     });
     select.value = wageCountryCode;
   
     updateWageUSD();
   
     select.addEventListener('change', () => {
       onWageCountryChange(select.value);
     });
   
     document.querySelectorAll('#quick-btns .quick-btn').forEach(btn => {
       btn.addEventListener('click', () => {
         onWageCountryChange(btn.dataset.code);
       });
     });
   
     let debounce;
     document.getElementById('wage-input').addEventListener('input', (e) => {
       const v = parseFloat(e.target.value);
       if (!isNaN(v) && v > 0) {
         wageLocal = v;
         updateWageUSD();
         clearTimeout(debounce);
         debounce = setTimeout(renderKPI, 120);
       }
     });
   }
   
   function onWageCountryChange(code) {
     const c = countries.find(x => x.country_code === code);
     if (!c) return;
     wageCountryCode = code;
   
     document.getElementById('wage-country').value = code;
     document.getElementById('wage-symbol').textContent = c.currency_symbol;
   
     const def = DEFAULT_WAGES[code] || Math.round(c.bigmac_price_local * 2);
     wageLocal = def;
     const inp = document.getElementById('wage-input');
     inp.value = def;
     inp.step = def >= 1000 ? 100 : 1;
   
     document.querySelectorAll('#quick-btns .quick-btn').forEach(b => {
       b.classList.toggle('active', b.dataset.code === code);
     });
   
     updateWageUSD();
     renderKPI();
   }
   
   function updateWageUSD() {
     const c = countries.find(x => x.country_code === wageCountryCode);
     if (!c) return;
     const rate = rates[c.currency] || 1;
     wageUSD = wageLocal / rate;
   
     const el = document.getElementById('wage-usd-equiv');
     if (el) {
       if (currentMode === 'KO') {
         el.textContent = '= $' + wageUSD.toFixed(2) + ' USD (≈ ₩' + Math.round(wageUSD * (rates.KRW || 1400)).toLocaleString('ko-KR') + ')';
       } else {
         el.textContent = '= $' + wageUSD.toFixed(2) + ' USD';
       }
     }
   }
   
   // ============================================================
   //  KPI WIDGETS
   // ============================================================
   function renderKPI() {
     const grid = document.getElementById('kpi-grid');
     if (!grid || countries.length === 0) return;
   
     const sorted = [...countries].sort((a, b) => a.bigmac_price_usd - b.bigmac_price_usd);
     const cheapest = sorted[0];
   
     const minutesCheap = wageUSD > 0 ? Math.round((cheapest.bigmac_price_usd / wageUSD) * 60) : 0;
   
     const userBPH = wageUSD > 0 ? wageUSD / cheapest.bigmac_price_usd : 0;
     const allMinWageBPH = countries
       .filter(c => c.minimum_wage_bigmacs_per_hour != null)
       .map(c => c.minimum_wage_bigmacs_per_hour)
       .sort((a, b) => a - b);
     let percentile = 50;
     if (allMinWageBPH.length > 0) {
       const below = allMinWageBPH.filter(v => v < userBPH).length;
       percentile = Math.round((1 - below / allMinWageBPH.length) * 100);
       if (percentile < 1) percentile = 1;
       if (percentile > 99) percentile = 99;
     }
   
     const bestForUser = sorted[0];
     const worstForUser = sorted[sorted.length - 1];
     const bestBPH = wageUSD > 0 ? (wageUSD / bestForUser.bigmac_price_usd).toFixed(1) : '0';
     const worstBPH = wageUSD > 0 ? (wageUSD / worstForUser.bigmac_price_usd).toFixed(1) : '0';
   
     grid.innerHTML = '';
   
     const card1 = document.createElement('div');
     card1.className = 'kpi-card';
     card1.innerHTML =
       '<div class="kpi-icon">⏱</div>' +
       '<div class="kpi-value">' + t('kpiMinutes').replace('{n}', minutesCheap) + '</div>' +
       '<div class="kpi-label">' + t('kpiTimer') + '</div>' +
       '<div class="kpi-sub">' + t('kpiCheapest').replace('{country}', cheapest.flag + ' ' + countryName(cheapest)) + '</div>';
     grid.appendChild(card1);
   
     const card2 = document.createElement('div');
     card2.className = 'kpi-card';
     card2.innerHTML =
       '<div class="kpi-icon">🌍</div>' +
       '<div class="kpi-value">' + t('topPercent').replace('{n}', percentile) + '</div>' +
       '<div class="kpi-label">' + t('kpiRank') + '</div>' +
       '<div class="kpi-sub">' + t('kpiRankDesc').replace('{n}', percentile) + '</div>';
     grid.appendChild(card2);
   
     const card3 = document.createElement('div');
     card3.className = 'kpi-card kpi-card-split';
     card3.innerHTML =
       '<div class="kpi-half kpi-best">' +
         '<div class="kpi-mini-label">' + t('kpiBest') + '</div>' +
         '<div class="kpi-mini-flag">' + bestForUser.flag + ' ' + countryName(bestForUser) + '</div>' +
         '<div class="kpi-mini-value">🍔 ' + t('kpiBurgers').replace('{n}', bestBPH) + '</div>' +
       '</div>' +
       '<div class="kpi-divider"></div>' +
       '<div class="kpi-half kpi-worst">' +
         '<div class="kpi-mini-label">' + t('kpiWorst') + '</div>' +
         '<div class="kpi-mini-flag">' + worstForUser.flag + ' ' + countryName(worstForUser) + '</div>' +
         '<div class="kpi-mini-value">🍔 ' + t('kpiBurgers').replace('{n}', worstBPH) + '</div>' +
       '</div>';
     grid.appendChild(card3);
   }
   
   // ============================================================
   //  CONTINENT CHART
   // ============================================================
   function getContinentKey(key) {
     var map = {
       asia: 'continent_asia', europe: 'continent_europe',
       namerica: 'continent_namerica', samerica: 'continent_samerica',
       africa: 'continent_africa', oceania: 'continent_oceania'
     };
     return t(map[key] || key);
   }
   
   function renderContinentDonut() {
     var canvas = document.getElementById('chart-continent');
     if (!canvas) return;
   
     var labels = [];
     var avgs = [];
     var colors = [];
     var keys = [];
   
     Object.keys(CONTINENT_MAP).forEach(function(key) {
       var codes = CONTINENT_MAP[key];
       var group = countries.filter(function(c) { return codes.indexOf(c.country_code) !== -1; });
       if (group.length === 0) return;
       var avg = group.reduce(function(s, c) { return s + c.bigmac_price_usd; }, 0) / group.length;
       keys.push(key);
       labels.push(getContinentKey(key) + ' (' + group.length + ')');
       avgs.push(currentMode === 'KO' ? Math.round(avg * (rates.KRW || 1400)) : parseFloat(avg.toFixed(2)));
       colors.push(CONTINENT_COLORS[key]);
     });
   
     if (chartContinent) chartContinent.destroy();
   
     chartContinent = new Chart(canvas, {
       type: 'doughnut',
       data: {
         labels: labels,
         datasets: [{
           data: avgs,
           backgroundColor: colors,
           borderColor: '#fff',
           borderWidth: 3,
           hoverOffset: 8,
         }]
       },
       options: {
         responsive: true,
         maintainAspectRatio: false,
         animation: { duration: 800, animateRotate: true },
         plugins: {
           legend: {
             display: true,
             position: 'bottom',
             labels: { color: '#202124', font: { size: 11, weight: '600' }, padding: 12, boxWidth: 14 }
           },
           tooltip: {
             backgroundColor: '#1A1A1A',
             borderColor: 'rgba(255,199,44,0.4)',
             borderWidth: 1,
             titleColor: '#FFC72C',
             bodyColor: '#fff',
             padding: 10,
             cornerRadius: 8,
             callbacks: {
               label: function(ctx) {
                 var val = currentMode === 'KO'
                   ? '₩' + Math.round(ctx.raw).toLocaleString('ko-KR')
                   : '$' + ctx.raw.toFixed(2);
                 return '  ' + (currentMode === 'KO' ? '평균' : 'Avg') + ': ' + val;
               }
             }
           }
         },
         onClick: function(evt, elements) {
           if (!elements.length) return;
           var idx = elements[0].index;
           var key = keys[idx];
           showContinentBar(key);
         }
       }
     });
   }
   
   function showContinentBar(continentKey) {
     var wrap = document.getElementById('continent-bar-wrap');
     var canvas = document.getElementById('chart-continent-bar');
     if (!wrap || !canvas) return;
   
     wrap.style.display = 'block';
   
     var codes = CONTINENT_MAP[continentKey];
     var group = countries.filter(function(c) { return codes.indexOf(c.country_code) !== -1; });
     group.sort(function(a, b) { return a.bigmac_price_usd - b.bigmac_price_usd; });
   
     var labels = group.map(function(c) { return c.flag + ' ' + countryName(c); });
     var values = group.map(function(c) {
       return currentMode === 'KO' ? Math.round(c.bigmac_price_usd * (rates.KRW || 1400)) : c.bigmac_price_usd;
     });
   
     var color = CONTINENT_COLORS[continentKey] || '#999';
   
     var barH = 32;
     var chartH = Math.max(group.length * barH + 60, 200);
     canvas.parentElement.style.height = chartH + 'px';
   
     if (chartContinentBar) chartContinentBar.destroy();
   
     chartContinentBar = new Chart(canvas, {
       type: 'bar',
       data: {
         labels: labels,
         datasets: [{
           data: values,
           backgroundColor: color + 'CC',
           borderColor: color,
           borderWidth: 1.5,
           borderRadius: 4,
           borderSkipped: false,
         }]
       },
       options: {
         indexAxis: 'y',
         responsive: true,
         maintainAspectRatio: false,
         animation: { duration: 600 },
         plugins: {
           legend: { display: false },
           title: {
             display: true,
             text: getContinentKey(continentKey),
             color: '#202124',
             font: { size: 13, weight: '800' },
             padding: { bottom: 12 }
           },
           tooltip: {
             backgroundColor: '#1A1A1A',
             titleColor: '#FFC72C',
             bodyColor: '#fff',
             padding: 10,
             cornerRadius: 8,
             callbacks: {
               label: function(ctx) {
                 var c = group[ctx.dataIndex];
                 return '  ' + displayPrice(c.bigmac_price_usd) + ' (' + c.currency_symbol + formatLocal(c.bigmac_price_local) + ')';
               }
             }
           }
         },
         scales: {
           x: {
             grid: { color: 'rgba(0,0,0,0.05)' },
             ticks: {
               color: '#9AA0A6', font: { size: 10 },
               callback: function(v) {
                 if (currentMode === 'KO') return Math.round(v).toLocaleString('ko-KR') + '원';
                 return '$' + v;
               }
             }
           },
           y: {
             grid: { display: false },
             ticks: { color: '#202124', font: { size: 11 } }
           }
         }
       }
     });
   }
   
   // ============================================================
   //  CURRENCY VALUATION CHART
   // ============================================================
   let chartValuation = null;
   
   function renderValuationChart() {
     renderValuationCards();
     renderValuationBar();
   }
   
   function renderValuationCards() {
     var container = document.getElementById('valuation-cards');
     if (!container) return;
   
     var sorted = countries
       .filter(function(c) { return c.over_under_valued_pct != null; })
       .sort(function(a, b) { return b.over_under_valued_pct - a.over_under_valued_pct; });
   
     var top5Over = sorted.filter(function(c) { return c.over_under_valued_pct > 10; }).slice(0, 5);
     var top5Under = sorted.filter(function(c) { return c.over_under_valued_pct < -10; }).reverse().slice(0, 5);
   
     container.innerHTML = '';
   
     var overTitle = document.createElement('div');
     overTitle.className = 'valuation-group-title over-title';
     overTitle.textContent = '🔴 ' + t('overvalued') + ' TOP 5';
     container.appendChild(overTitle);
   
     top5Over.forEach(function(c) {
       var card = document.createElement('div');
       card.className = 'valuation-card';
       card.innerHTML =
         '<div class="valuation-card-flag">' + c.flag + '</div>' +
         '<div class="valuation-card-info"><div class="valuation-card-name">' + countryName(c) + '</div></div>' +
         '<div class="valuation-card-pct over">+' + c.over_under_valued_pct.toFixed(0) + '%</div>';
       container.appendChild(card);
     });
   
     var underTitle = document.createElement('div');
     underTitle.className = 'valuation-group-title under-title';
     underTitle.textContent = '🟢 ' + t('undervalued') + ' TOP 5';
     container.appendChild(underTitle);
   
     top5Under.forEach(function(c) {
       var card = document.createElement('div');
       card.className = 'valuation-card';
       card.innerHTML =
         '<div class="valuation-card-flag">' + c.flag + '</div>' +
         '<div class="valuation-card-info"><div class="valuation-card-name">' + countryName(c) + '</div></div>' +
         '<div class="valuation-card-pct under">' + c.over_under_valued_pct.toFixed(0) + '%</div>';
       container.appendChild(card);
     });
   }
   
   function renderValuationBar() {
     var canvas = document.getElementById('chart-valuation');
     if (!canvas) return;
   
     var data = countries
       .filter(function(c) { return c.over_under_valued_pct != null; })
       .sort(function(a, b) { return b.over_under_valued_pct - a.over_under_valued_pct; });
   
     var labels = data.map(function(c) { return c.flag + ' ' + countryName(c); });
     var values = data.map(function(c) { return c.over_under_valued_pct; });
   
     var colors = values.map(function(v) {
       if (v > 10) return 'rgba(218,41,28,0.75)';
       if (v < -10) return 'rgba(27,127,58,0.75)';
       return 'rgba(107,107,107,0.50)';
     });
   
     var barH = 22;
     var chartH = data.length * barH + 80;
     canvas.parentElement.style.height = chartH + 'px';
   
     if (chartValuation) chartValuation.destroy();
   
     var zeroLinePlugin = {
       id: 'zeroLine',
       afterDraw: function(chart) {
         var ctx = chart.ctx;
         var area = chart.chartArea;
         var xScale = chart.scales.x;
         if (!xScale) return;
   
         var x0 = xScale.getPixelForValue(0);
         if (x0 >= area.left && x0 <= area.right) {
           ctx.save();
           ctx.strokeStyle = 'rgba(32,33,36,0.6)';
           ctx.lineWidth = 2;
           ctx.beginPath();
           ctx.moveTo(x0, area.top);
           ctx.lineTo(x0, area.bottom);
           ctx.stroke();
           ctx.fillStyle = 'rgba(32,33,36,0.7)';
           ctx.font = '700 9px -apple-system, sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText(currentMode === 'KO' ? '🇺🇸 기준 (0%)' : '🇺🇸 US Base (0%)', x0, area.top - 6);
           ctx.restore();
         }
       }
     };
   
     chartValuation = new Chart(canvas, {
       type: 'bar',
       plugins: [zeroLinePlugin],
       data: {
         labels: labels,
         datasets: [{
           data: values,
           backgroundColor: colors,
           borderRadius: 3,
           borderSkipped: false,
         }]
       },
       options: {
         indexAxis: 'y',
         responsive: true,
         maintainAspectRatio: false,
         layout: { padding: { top: 18 } },
         animation: { duration: 700 },
         plugins: {
           legend: { display: false },
           tooltip: {
             backgroundColor: '#1A1A1A',
             borderColor: 'rgba(255,199,44,0.4)',
             borderWidth: 1,
             titleColor: '#FFC72C',
             bodyColor: '#fff',
             padding: 10,
             cornerRadius: 8,
             callbacks: {
               title: function(ctx) { return countryName(data[ctx[0].dataIndex]); },
               label: function(ctx) {
                 var c = data[ctx.dataIndex];
                 var pct = ctx.raw;
                 var status = pct > 10 ? t('overvalued') : pct < -10 ? t('undervalued') : t('fairValue');
                 return [
                   '  ' + status + ': ' + (pct > 0 ? '+' : '') + pct.toFixed(1) + '%',
                   '  ' + displayPrice(c.bigmac_price_usd),
                   '  PPP: ' + (c.bigmac_ppp != null ? c.bigmac_ppp.toFixed(2) : '—'),
                 ];
               }
             }
           }
         },
         scales: {
           x: {
             grid: { color: 'rgba(0,0,0,0.05)' },
             ticks: {
               color: '#9AA0A6', font: { size: 10 },
               callback: function(v) { return (v > 0 ? '+' : '') + v + '%'; }
             },
             min: -70,
             max: 70,
           },
           y: {
             grid: { display: false },
             ticks: { color: '#202124', font: { size: 10 }, padding: 2 }
           }
         }
       }
     });
   }
   
   // ============================================================
   //  WORLD MAP
   // ============================================================
   var ISO_TO_CODE = {
     840:'US',32:'AR',36:'AU',76:'BR',826:'GB',124:'CA',152:'CL',156:'CN',
     170:'CO',188:'CR',203:'CZ',208:'DK',818:'EG',250:'EU',344:'HK',348:'HU',
     356:'IN',360:'ID',376:'IL',392:'JP',458:'MY',484:'MX',554:'NZ',578:'NO',
     586:'PK',604:'PE',608:'PH',616:'PL',642:'RO',643:'RU',682:'SA',702:'SG',
     710:'ZA',410:'KR',144:'LK',752:'SE',756:'CH',158:'TW',764:'TH',792:'TR',
     804:'UA',784:'AE',858:'UY',704:'VN',31:'AZ',48:'BH',320:'GT',340:'HN',
     400:'JO',414:'KW',422:'LB',498:'MD',558:'NI',512:'OM',634:'QA',862:'VE',
     56:'EU',276:'EU',380:'EU',528:'EU',620:'EU',40:'EU',246:'EU',
   };
   
   var mapRendered = false;
   var mapZoom = null;
   var mapProjection = null;
   var mapPath = null;
   var mapCountriesGeo = null;
   var mapSelectedCode = null;
   var mapW = 0;
   var mapH = 0;
   
   function renderWorldMap() {
     if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;
     if (countries.length === 0) return;
   
     var svg = d3.select('#world-map');
     var wrap = document.getElementById('map-wrap');
     var w = wrap.clientWidth - 24;
     var h = Math.round(w * 0.52);
     mapW = w;
     mapH = h;
     svg.attr('width', w).attr('height', h).attr('viewBox', '0 0 ' + w + ' ' + h);
   
     mapProjection = d3.geoNaturalEarth1().fitSize([w, h], { type: 'Sphere' });
     mapPath = d3.geoPath(mapProjection);
   
     var bphMap = {};
     countries.forEach(function(c) {
       bphMap[c.country_code] = wageUSD > 0 ? wageUSD / c.bigmac_price_usd : 0;
     });
   
     var colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 4]);
   
     if (!mapRendered) {
       d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(function(world) {
         mapCountriesGeo = topojson.feature(world, world.objects.countries).features;
   
         svg.selectAll('*').remove();
   
         var g = svg.append('g').attr('class', 'map-g');
   
         g.append('path')
           .datum({ type: 'Sphere' })
           .attr('d', mapPath)
           .attr('fill', '#f0f4f8')
           .attr('stroke', '#ccc');
   
         g.selectAll('.country')
           .data(mapCountriesGeo)
           .enter()
           .append('path')
           .attr('class', 'country')
           .attr('d', mapPath)
           .attr('fill', function(d) {
             var code = ISO_TO_CODE[+d.id];
             if (!code || !bphMap[code]) return '#e0e0e0';
             return colorScale(Math.min(bphMap[code], 4));
           })
           .attr('stroke', '#fff')
           .attr('stroke-width', 0.5)
           .attr('data-code', function(d) { return ISO_TO_CODE[+d.id] || ''; })
           .style('cursor', function(d) { return ISO_TO_CODE[+d.id] && bphMap[ISO_TO_CODE[+d.id]] ? 'pointer' : 'default'; })
           .on('mouseover', function(event, d) {
             var code = ISO_TO_CODE[+d.id];
             if (!code) return;
             d3.select(this).attr('stroke', '#DA291C').attr('stroke-width', 2);
             showMapTooltip(event, code);
           })
           .on('mousemove', function(event) {
             var tip = document.getElementById('map-tooltip');
             var rect = wrap.getBoundingClientRect();
             tip.style.left = (event.clientX - rect.left + 14) + 'px';
             tip.style.top = (event.clientY - rect.top - 10) + 'px';
           })
           .on('mouseout', function() {
             d3.select(this).attr('stroke', '#fff').attr('stroke-width', 0.5);
             highlightMapCountries(svg);
             document.getElementById('map-tooltip').style.display = 'none';
           })
           .on('click', function(event, d) {
             var code = ISO_TO_CODE[+d.id];
             if (code && bphMap[code]) {
               mapSelectedCode = code;
               highlightMapCountries(svg);
               showMapCard(code);
               var sel = document.getElementById('map-search');
               if (sel) sel.value = code;
             }
           });
   
         highlightMapCountries(svg);
   
         mapZoom = d3.zoom()
           .scaleExtent([1, 8])
           .on('zoom', function(event) {
             g.attr('transform', event.transform);
           });
         svg.call(mapZoom);
   
         document.getElementById('map-zoom-in').addEventListener('click', function() {
           svg.transition().duration(300).call(mapZoom.scaleBy, 1.5);
         });
         document.getElementById('map-zoom-out').addEventListener('click', function() {
           svg.transition().duration(300).call(mapZoom.scaleBy, 0.67);
         });
         document.getElementById('map-zoom-reset').addEventListener('click', function() {
           svg.transition().duration(500).call(mapZoom.transform, d3.zoomIdentity);
         });
   
         mapRendered = true;
         renderMapLegend();
         initMapSearch();
       });
     } else {
       svg.selectAll('.country')
         .attr('fill', function(d) {
           var code = ISO_TO_CODE[+d.id];
           if (!code || !bphMap[code]) return '#e0e0e0';
           return colorScale(Math.min(bphMap[code], 4));
         });
       highlightMapCountries(svg);
       initMapSearch();
     }
   }
   
   function highlightMapCountries(svg) {
     svg.selectAll('.country').attr('stroke', '#fff').attr('stroke-width', 0.5);
     if (wageCountryCode) {
       svg.selectAll('.country').filter(function(d) {
         return ISO_TO_CODE[+d.id] === wageCountryCode;
       }).attr('stroke', '#FFC72C').attr('stroke-width', 2.5);
     }
     if (mapSelectedCode && mapSelectedCode !== wageCountryCode) {
       svg.selectAll('.country').filter(function(d) {
         return ISO_TO_CODE[+d.id] === mapSelectedCode;
       }).attr('stroke', '#DA291C').attr('stroke-width', 2.5);
     }
   }
   
   function zoomToCountry(code) {
     if (!mapCountriesGeo || !mapZoom || !mapPath) return;
     var svg = d3.select('#world-map');
   
     var numIds = [];
     for (var key in ISO_TO_CODE) {
       if (ISO_TO_CODE[key] === code) numIds.push(+key);
     }
     if (numIds.length === 0) return;
   
     var features = mapCountriesGeo.filter(function(f) { return numIds.indexOf(+f.id) >= 0; });
     if (features.length === 0) return;
   
     var allBounds = features.map(function(f) { return mapPath.bounds(f); });
     var x0 = d3.min(allBounds, function(b) { return b[0][0]; });
     var y0 = d3.min(allBounds, function(b) { return b[0][1]; });
     var x1 = d3.max(allBounds, function(b) { return b[1][0]; });
     var y1 = d3.max(allBounds, function(b) { return b[1][1]; });
   
     var dx = x1 - x0;
     var dy = y1 - y0;
     var cx = (x0 + x1) / 2;
     var cy = (y0 + y1) / 2;
   
     if (dx < 20) dx = 60;
     if (dy < 20) dy = 60;
   
     var scale = Math.max(1, Math.min(8, 0.65 / Math.max(dx / mapW, dy / mapH)));
     var tx = mapW / 2 - scale * cx;
     var ty = mapH / 2 - scale * cy;
   
     svg.transition().duration(700).ease(d3.easeCubicOut)
       .call(mapZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
   }
   
   function initMapSearch() {
     var sel = document.getElementById('map-search');
     if (!sel) return;
     var prev = sel.value;
     sel.innerHTML = '';
   
     var ph = document.createElement('option');
     ph.value = '';
     ph.textContent = currentMode === 'KO' ? '-- 나라를 선택하세요 --' : '-- Select a country --';
     sel.appendChild(ph);
   
     var sorted = [...countries].sort(function(a, b) {
       return countryName(a).localeCompare(countryName(b));
     });
     sorted.forEach(function(c) {
       var opt = document.createElement('option');
       opt.value = c.country_code;
       opt.textContent = c.flag + ' ' + countryName(c);
       sel.appendChild(opt);
     });
     if (prev) sel.value = prev;
   
     var newSel = sel.cloneNode(true);
     sel.parentNode.replaceChild(newSel, sel);
     newSel.addEventListener('change', function() {
       var code = this.value;
       if (!code) return;
       mapSelectedCode = code;
       highlightMapCountries(d3.select('#world-map'));
       showMapCard(code);
       zoomToCountry(code);
     });
   }
   
   function showMapTooltip(event, code) {
     var c = countries.find(function(x) { return x.country_code === code; });
     if (!c) return;
     var tip = document.getElementById('map-tooltip');
     var bph = wageUSD > 0 ? (wageUSD / c.bigmac_price_usd).toFixed(1) : '0';
     var wrap = document.getElementById('map-wrap');
     var rect = wrap.getBoundingClientRect();
     tip.innerHTML = '<strong>' + c.flag + ' ' + countryName(c) + '</strong><br>' +
       displayPrice(c.bigmac_price_usd) + ' (' + c.currency_symbol + formatLocal(c.bigmac_price_local) + ')<br>' +
       '🍔 ×' + bph + ' ' + t('bigmacsPerHour');
     tip.style.display = 'block';
     tip.style.left = (event.clientX - rect.left + 14) + 'px';
     tip.style.top = (event.clientY - rect.top - 10) + 'px';
   }
   
   function renderMapLegend() {
     var el = document.getElementById('map-legend');
     if (!el) return;
     el.innerHTML =
       '<div class="map-legend-bar">' +
         '<span class="map-legend-label">' + t('mapLegendLow') + ' 😢</span>' +
         '<div class="map-legend-gradient"></div>' +
         '<span class="map-legend-label">😋 ' + t('mapLegendHigh') + '</span>' +
       '</div>';
   }
   
   function showMapCard(code) {
     var c = countries.find(function(x) { return x.country_code === code; });
     if (!c) return;
     var card = document.getElementById('map-card');
     card.className = 'map-card map-card-show';
   
     var bph = wageUSD > 0 ? wageUSD / c.bigmac_price_usd : 0;
     var myC = countries.find(function(x) { return x.country_code === wageCountryCode; });
     var myBPH = myC && wageUSD > 0 ? wageUSD / myC.bigmac_price_usd : 0;
   
     var emojiCount = Math.floor(bph);
     var totalEmoji = emojiCount;
     if (bph - emojiCount >= 0.5) totalEmoji++;
     var emojiStr = '';
     if (totalEmoji <= 20) {
       for (var i = 0; i < totalEmoji; i++) {
         emojiStr += '<span class="emoji-pop" style="animation-delay:' + (i * 0.05) + 's">🍔</span>';
       }
     } else {
       for (var i = 0; i < 20; i++) {
         emojiStr += '<span class="emoji-pop" style="animation-delay:' + (i * 0.04) + 's">🍔</span>';
       }
       emojiStr += ' <span class="emoji-pop" style="animation-delay:0.8s">+' + (totalEmoji - 20) + (currentMode === 'KO' ? '개 더' : ' more') + '</span>';
     }
     if (totalEmoji === 0) emojiStr = '<span class="emoji-pop">😢</span>';
   
     var compText = '';
     if (myC && myC.country_code !== code) {
       var ratio = myBPH > 0 ? bph / myBPH : 0;
       if (ratio > 1.05) {
         compText = t('mapMoreThan').replace('{n}', ratio.toFixed(1)).replace('{country}', countryName(myC));
       } else if (ratio < 0.95) {
         compText = t('mapLessThan').replace('{n}', (1/ratio).toFixed(1)).replace('{country}', countryName(myC));
       } else {
         compText = t('mapSameAs').replace('{country}', countryName(myC));
       }
     }
   
     var maxBar = Math.max(bph, myBPH, 0.1);
     var selectedPct = Math.round((bph / maxBar) * 100);
     var myPct = Math.round((myBPH / maxBar) * 100);
   
     card.innerHTML =
       '<div class="map-card-header">' +
         '<div class="map-card-flag">' + c.flag + '</div>' +
         '<div class="map-card-info">' +
           '<div class="map-card-name">' + countryName(c) + '</div>' +
           '<div class="map-card-price">' + displayPrice(c.bigmac_price_usd) + ' (' + c.currency_symbol + formatLocal(c.bigmac_price_local) + ' ' + c.currency + ')</div>' +
         '</div>' +
       '</div>' +
       '<div class="map-card-burgers">' + t('mapBurgers').replace('{n}', bph.toFixed(1)) + '</div>' +
       '<div class="map-card-emoji">' + emojiStr + '</div>' +
       (compText ? '<div class="map-card-compare">' + compText + '</div>' : '') +
       (myC && myC.country_code !== code ?
         '<div class="map-card-bars">' +
           '<div class="map-bar-row">' +
             '<span class="map-bar-label">' + c.flag + ' ' + countryName(c) + '</span>' +
             '<div class="map-bar-track"><div class="map-bar-fill map-bar-selected" style="width:' + selectedPct + '%"></div></div>' +
             '<span class="map-bar-val">×' + bph.toFixed(1) + '</span>' +
           '</div>' +
           '<div class="map-bar-row">' +
             '<span class="map-bar-label">' + myC.flag + ' ' + countryName(myC) + '</span>' +
             '<div class="map-bar-track"><div class="map-bar-fill map-bar-mine" style="width:' + myPct + '%"></div></div>' +
             '<span class="map-bar-val">×' + myBPH.toFixed(1) + '</span>' +
           '</div>' +
         '</div>'
       : '');
   }
   
   // ============================================================
   //  RENDER ALL
   // ============================================================
   function renderAll() {
     renderExchange();
     renderRanking();
     updateWageUSD();
     renderKPI();
     renderContinentDonut();
     renderValuationChart();
     renderWorldMap();
   }
   
   // ============================================================
   //  TOGGLE BUTTON
   // ============================================================
   function updateToggleBtn() {
     const btn = document.getElementById('toggle-lang');
     btn.textContent = currentMode === 'EN' ? 'EN / USD' : 'KO / ₩';
     document.documentElement.lang = currentMode === 'KO' ? 'ko' : 'en';
   }
   
   document.getElementById('toggle-lang').addEventListener('click', () => {
     currentMode = currentMode === 'EN' ? 'KO' : 'EN';
     localStorage.setItem('bigmac_mode', currentMode);
     const baseInput = document.getElementById('exchange-base-input');
     if (baseInput) delete baseInput.dataset.userEdited;
   
     updateToggleBtn();
     applyI18n();
     var wSelect = document.getElementById('wage-country');
     if (wSelect && countries.length > 0) {
       wSelect.innerHTML = '';
       const sortedForSelect = [...countries].sort((a, b) =>
         countryName(a).localeCompare(countryName(b), currentMode === 'KO' ? 'ko' : 'en')
       );
       sortedForSelect.forEach(function(c) {
         var opt = document.createElement('option');
         opt.value = c.country_code;
         opt.textContent = c.flag + ' ' + countryName(c) + ' (' + c.currency + ')';
         wSelect.appendChild(opt);
       });
       wSelect.value = wageCountryCode;
     }
     renderAll();
     if (selectedExCountry) {
       onExchangeCardClick(selectedExCountry);
     }
     console.log('🔄 Mode switched to:', currentMode);
   });
   
   // ============================================================
   //  BOOT
   // ============================================================
   document.addEventListener('DOMContentLoaded', initApp);