export const AIRPORTS: Record<string, [number, number]> = {
  // Morocco (G***)
  'GMMN': [33.3675, -7.5899],   // Casablanca Mohammed V
  'GMMX': [31.6069, -8.0363],   // Marrakech Menara
  'GMAD': [30.3250, -9.4131],   // Agadir Al Massira
  'GMTT': [35.7269, -5.9169],   // Tangier Ibn Battouta
  'GMFF': [33.9273, -4.9780],   // Fes Sais
  'GMFO': [34.7872, -1.9239],   // Oujda Angads
  'GMMW': [34.9897, -3.0282],   // Nador El Aroui
  'GMMZ': [30.9392, -6.9094],   // Ouarzazate
  'GMMI': [31.4024, -9.6833],   // Essaouira Mogador
  'GMFK': [31.9458, -4.3976],   // Errachidia Moulay Ali Cherif
  'GMME': [34.0514, -6.7533],   // Rabat-Sale
  'GMMD': [32.3167, -6.3167],   // Beni Mellal
  'GMMB': [33.5511, -7.6622],   // Casablanca Anfa
  'GMMH': [23.7183, -15.9314],  // Dakhla
  'GMML': [27.1517, -13.2192],  // Laayoune Hassan I
  'GMTA': [35.1764, -3.8398],   // Al Hoceima Cherif Al Idrissi
  'GMTN': [35.5941, -5.3312],   // Tetouan Saniat R'mel
  'GMAG': [29.0261, -10.0514],  // Guelmim
  'GMAT': [28.4485, -11.1611],  // Tan Tan Plage Blanche
  'GMAZ': [30.2667, -5.8500],   // Zagora
  'GMMF': [34.2311, -6.0503],   // Sidi Slimane
  'GMFB': [32.5133, -1.9844],   // Bouarfa
  'GMMS': [32.2745, -9.2319],   // Safi
  'GMMT': [33.5931, -7.4528],   // Casablanca Tit Mellil
  'GMMY': [34.2833, -6.6000],   // Kenitra (Military)
  'GMMG': [32.3514, -7.9538],   // Benguerir
  'GMSM': [26.7328, -11.6844],  // Smara

  // Africa (Mainland)
  'HECA': [30.1219, 31.4056],   // Cairo, Egypt
  'FACT': [-33.9715, 18.6021],  // Cape Town, South Africa
  'FAOR': [-26.1367, 28.246],   // Johannesburg, South Africa
  'DNMM': [6.5774, 3.321],      // Lagos, Nigeria
  'HKJK': [-1.3192, 36.9275],   // Nairobi, Kenya
  'DGAA': [5.6052, -0.1668],    // Accra, Ghana
  'DTTA': [36.8510, 10.2272],   // Tunis, Tunisia
  'DAAG': [36.6910, 3.2154],    // Algiers, Algeria
  'DRRN': [13.4816, 2.1836],    // Niamey, Niger
  'HRYR': [-1.9630, 30.1350],   // Kigali, Rwanda
  'HAAB': [8.9779, 38.7993],    // Addis Ababa, Ethiopia
  'GOBD': [14.6710, -17.0733],  // Dakar, Senegal
  'FLKK': [-15.3308, 28.4526],  // Lusaka, Zambia
  'HSSS': [15.5895, 32.5532],   // Khartoum, Sudan
  'GQNN': [18.0981, -15.9482],  // Nouakchott, Mauritania
  'DIAP': [5.3610, -3.9262],    // Abidjan, Côte d'Ivoire
  'FKKR': [4.0044, 9.7197],     // Douala, Cameroon
  'DBBB': [6.3572, 2.3844],     // Cotonou, Benin

  // Europe (L***, E***, U***, etc.)
  'EGLL': [51.4700, -0.4543],   // London Heathrow
  'EGKK': [51.1481, -0.1903],   // London Gatwick
  'EGLC': [51.5053, 0.0553],    // London City
  'EGCC': [53.3588, -2.2749],   // Manchester
  'LFPG': [49.0097, 2.5479],    // Paris Charles de Gaulle
  'LFPO': [48.7253, 2.3594],    // Paris Orly
  'EDDF': [50.0333, 8.5706],    // Frankfurt
  'EDDM': [48.3537, 11.7861],   // Munich
  'EHAM': [52.3105, 4.7683],    // Amsterdam Schiphol
  'LEMD': [40.4839, -3.5680],   // Madrid Barajas
  'LEBL': [41.2974, 2.0833],    // Barcelona El Prat
  'LPPT': [38.7742, -9.1342],   // Lisbon Humberto Delgado
  'LIMC': [45.6301, 8.7231],    // Milan Malpensa
  'LIRF': [41.7999, 12.2462],   // Rome Fiumicino
  'LSZH': [47.4582, 8.5555],    // Zurich
  'EBBR': [50.9010, 4.4844],    // Brussels
  'LOWW': [48.1103, 16.5697],   // Vienna
  'LGAV': [37.9363, 23.9442],   // Athens
  'ESSA': [59.6519, 17.9186],   // Stockholm Arlanda
  'EKCH': [55.6181, 12.656],    // Copenhagen
  'ENGM': [60.1939, 11.1004],   // Oslo Gardermoen
  'EFHK': [60.3172, 24.9633],   // Helsinki
  'EPWA': [52.1657, 20.9671],   // Warsaw Chopin
  'LHBP': [47.4369, 19.2396],   // Budapest Ferenc Liszt
  'UUEE': [55.9726, 37.4146],   // Moscow Sheremetyevo
  'UKBB': [50.345, 30.8947],    // Kyiv Boryspil
  'LROP': [44.5709, 26.0844],   // Bucharest Henri Coandă

  // North America & World
  'KLAX': [33.9416, -118.4085],
  'KSFO': [37.6213, -122.3790],
  'KSEA': [47.4502, -122.3088],
  'KPDX': [45.5898, -122.5951],
  'KJFK': [40.6413, -73.7781],
  'OMDB': [25.2528, 55.3644],
  'VHHH': [22.3089, 113.9145],
  'RJTT': [35.5494, 139.7798],
  'YSSY': [-33.9399, 151.1753],
  'NZAA': [-37.0081, 174.7917],
};
