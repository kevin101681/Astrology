// ---------------------------------------------------------------------------
// Birthplace data.
// WA_CITIES: every incorporated city and town in Washington State
//   [name, latitude °N, longitude °E] — all in Pacific time (UTC−8 standard).
// WORLD_CITIES: major world cities [name, lat, lon, standard UTC offset].
// Coordinates are approximate (city centers); a few km makes no astrological
// difference.
// ---------------------------------------------------------------------------

export const WA_CITIES = [
  // King County
  ['Seattle', 47.61, -122.33], ['Bellevue', 47.61, -122.20], ['Kent', 47.38, -122.23],
  ['Renton', 47.48, -122.20], ['Federal Way', 47.32, -122.31], ['Kirkland', 47.68, -122.21],
  ['Auburn', 47.31, -122.23], ['Sammamish', 47.62, -122.04], ['Redmond', 47.67, -122.12],
  ['Shoreline', 47.76, -122.34], ['Burien', 47.47, -122.35], ['Bothell', 47.76, -122.21],
  ['Issaquah', 47.53, -122.03], ['Des Moines', 47.40, -122.32], ['SeaTac', 47.44, -122.29],
  ['Maple Valley', 47.37, -122.04], ['Mercer Island', 47.57, -122.23], ['Kenmore', 47.76, -122.24],
  ['Covington', 47.36, -122.10], ['Tukwila', 47.47, -122.26], ['Woodinville', 47.75, -122.15],
  ['Duvall', 47.74, -121.99], ['Snoqualmie', 47.53, -121.83], ['North Bend', 47.50, -121.79],
  ['Lake Forest Park', 47.76, -122.28], ['Newcastle', 47.53, -122.16], ['Enumclaw', 47.20, -121.99],
  ['Pacific', 47.26, -122.25], ['Algona', 47.28, -122.25], ['Carnation', 47.65, -121.91],
  ['Black Diamond', 47.31, -122.00], ['Clyde Hill', 47.63, -122.22], ['Medina', 47.62, -122.23],
  ['Yarrow Point', 47.65, -122.22], ['Hunts Point', 47.64, -122.23], ['Beaux Arts Village', 47.58, -122.20],
  ['Normandy Park', 47.44, -122.34], ['Skykomish', 47.71, -121.36], ['Milton', 47.25, -122.31],
  // Pierce County
  ['Tacoma', 47.25, -122.44], ['Lakewood', 47.17, -122.52], ['Puyallup', 47.19, -122.29],
  ['University Place', 47.24, -122.55], ['Bonney Lake', 47.18, -122.19], ['Sumner', 47.20, -122.24],
  ['Edgewood', 47.25, -122.28], ['Fife', 47.24, -122.36], ['Orting', 47.10, -122.20],
  ['Buckley', 47.16, -122.03], ['DuPont', 47.10, -122.63], ['Steilacoom', 47.17, -122.60],
  ['Gig Harbor', 47.33, -122.58], ['Fircrest', 47.24, -122.52], ['Ruston', 47.30, -122.51],
  ['Roy', 47.00, -122.54], ['Eatonville', 46.87, -122.27], ['South Prairie', 47.14, -122.09],
  ['Wilkeson', 47.11, -122.05], ['Carbonado', 47.08, -122.05],
  // Snohomish County
  ['Everett', 47.98, -122.20], ['Marysville', 48.05, -122.18], ['Lynnwood', 47.82, -122.31],
  ['Edmonds', 47.81, -122.38], ['Lake Stevens', 48.02, -122.06], ['Mukilteo', 47.94, -122.30],
  ['Mountlake Terrace', 47.79, -122.31], ['Mill Creek', 47.86, -122.20], ['Monroe', 47.86, -121.97],
  ['Arlington', 48.20, -122.13], ['Snohomish', 47.91, -122.10], ['Stanwood', 48.24, -122.34],
  ['Sultan', 47.86, -121.82], ['Granite Falls', 48.08, -121.97], ['Gold Bar', 47.86, -121.70],
  ['Index', 47.82, -121.55], ['Darrington', 48.25, -121.60], ['Brier', 47.78, -122.27],
  ['Woodway', 47.79, -122.38],
  // Spokane County
  ['Spokane', 47.66, -117.43], ['Spokane Valley', 47.67, -117.24], ['Cheney', 47.49, -117.58],
  ['Airway Heights', 47.64, -117.59], ['Deer Park', 47.95, -117.48], ['Liberty Lake', 47.67, -117.08],
  ['Medical Lake', 47.57, -117.68], ['Millwood', 47.68, -117.28], ['Rockford', 47.45, -117.13],
  ['Fairfield', 47.39, -117.17], ['Spangle', 47.43, -117.38], ['Latah', 47.28, -117.15],
  ['Waverly', 47.34, -117.23],
  // Clark County
  ['Vancouver', 45.63, -122.66], ['Camas', 45.59, -122.40], ['Washougal', 45.58, -122.35],
  ['Battle Ground', 45.78, -122.53], ['Ridgefield', 45.82, -122.74], ['La Center', 45.86, -122.67],
  ['Yacolt', 45.87, -122.41],
  // Cowlitz County
  ['Longview', 46.14, -122.94], ['Kelso', 46.15, -122.91], ['Castle Rock', 46.28, -122.91],
  ['Kalama', 46.01, -122.84], ['Woodland', 45.90, -122.74],
  // Thurston County
  ['Olympia', 47.04, -122.90], ['Lacey', 47.03, -122.82], ['Tumwater', 47.01, -122.90],
  ['Yelm', 46.94, -122.61], ['Tenino', 46.86, -122.85], ['Rainier', 46.89, -122.69],
  ['Bucoda', 46.80, -122.87],
  // Kitsap County
  ['Bremerton', 47.57, -122.63], ['Port Orchard', 47.54, -122.64], ['Poulsbo', 47.74, -122.65],
  ['Bainbridge Island', 47.63, -122.52],
  // Whatcom County
  ['Bellingham', 48.75, -122.48], ['Lynden', 48.95, -122.45], ['Ferndale', 48.85, -122.59],
  ['Blaine', 48.99, -122.75], ['Everson', 48.92, -122.34], ['Nooksack', 48.93, -122.32],
  ['Sumas', 49.00, -122.27],
  // Skagit County
  ['Mount Vernon', 48.42, -122.33], ['Anacortes', 48.51, -122.61], ['Sedro-Woolley', 48.50, -122.24],
  ['Burlington', 48.48, -122.33], ['La Conner', 48.39, -122.50], ['Concrete', 48.54, -121.75],
  ['Hamilton', 48.52, -121.99], ['Lyman', 48.53, -122.06],
  // Island / San Juan
  ['Oak Harbor', 48.29, -122.64], ['Coupeville', 48.22, -122.69], ['Langley', 48.04, -122.41],
  ['Friday Harbor', 48.53, -123.02],
  // Olympic Peninsula
  ['Port Angeles', 48.12, -123.43], ['Sequim', 48.08, -123.10], ['Forks', 47.95, -124.39],
  ['Port Townsend', 48.12, -122.76], ['Shelton', 47.22, -123.10],
  // Grays Harbor County
  ['Aberdeen', 46.98, -123.82], ['Hoquiam', 46.98, -123.89], ['Montesano', 46.98, -123.60],
  ['Elma', 47.00, -123.41], ['McCleary', 47.06, -123.27], ['Ocean Shores', 46.97, -124.16],
  ['Westport', 46.89, -124.10], ['Cosmopolis', 46.95, -123.77], ['Oakville', 46.84, -123.23],
  // Pacific / Wahkiakum
  ['Raymond', 46.69, -123.73], ['South Bend', 46.66, -123.80], ['Long Beach', 46.35, -124.05],
  ['Ilwaco', 46.31, -124.03], ['Cathlamet', 46.20, -123.38],
  // Lewis County
  ['Centralia', 46.72, -122.95], ['Chehalis', 46.66, -122.96], ['Morton', 46.56, -122.28],
  ['Mossyrock', 46.53, -122.48], ['Napavine', 46.58, -122.91], ['Pe Ell', 46.57, -123.30],
  ['Toledo', 46.44, -122.85], ['Vader', 46.40, -122.96], ['Winlock', 46.49, -122.94],
  // Chelan / Douglas
  ['Wenatchee', 47.42, -120.31], ['Chelan', 47.84, -120.02], ['Cashmere', 47.52, -120.47],
  ['Leavenworth', 47.60, -120.66], ['Entiat', 47.67, -120.21], ['East Wenatchee', 47.42, -120.28],
  ['Waterville', 47.65, -120.07], ['Mansfield', 47.81, -119.64], ['Bridgeport', 48.01, -119.67],
  ['Rock Island', 47.37, -120.14], ['Coulee Dam', 47.97, -118.98],
  // Kittitas County
  ['Ellensburg', 46.99, -120.55], ['Cle Elum', 47.20, -120.94], ['Kittitas', 46.98, -120.42],
  ['Roslyn', 47.22, -120.99], ['South Cle Elum', 47.19, -120.95],
  // Yakima County
  ['Yakima', 46.60, -120.51], ['Union Gap', 46.56, -120.48], ['Selah', 46.65, -120.53],
  ['Naches', 46.73, -120.70], ['Tieton', 46.70, -120.76], ['Moxee', 46.56, -120.38],
  ['Harrah', 46.40, -120.54], ['Toppenish', 46.38, -120.31], ['Wapato', 46.45, -120.42],
  ['Zillah', 46.40, -120.26], ['Granger', 46.34, -120.19], ['Sunnyside', 46.32, -120.01],
  ['Grandview', 46.25, -119.90], ['Mabton', 46.21, -119.99],
  // Benton / Franklin
  ['Kennewick', 46.21, -119.14], ['Richland', 46.29, -119.28], ['West Richland', 46.30, -119.36],
  ['Prosser', 46.21, -119.77], ['Benton City', 46.26, -119.49], ['Pasco', 46.24, -119.10],
  ['Connell', 46.66, -118.86], ['Mesa', 46.58, -119.00], ['Kahlotus', 46.64, -118.55],
  // Walla Walla / Columbia / Garfield / Asotin
  ['Walla Walla', 46.06, -118.34], ['College Place', 46.05, -118.39], ['Waitsburg', 46.27, -118.15],
  ['Prescott', 46.30, -118.31], ['Dayton', 46.32, -117.97], ['Starbuck', 46.52, -118.13],
  ['Pomeroy', 46.47, -117.60], ['Clarkston', 46.42, -117.05], ['Asotin', 46.34, -117.05],
  // Whitman County
  ['Pullman', 46.73, -117.18], ['Colfax', 46.88, -117.36], ['Palouse', 46.91, -117.08],
  ['Tekoa', 47.23, -117.07], ['Oakesdale', 47.13, -117.25], ['Garfield', 47.01, -117.14],
  ['Rosalia', 47.24, -117.37], ['St. John', 47.09, -117.58], ['LaCrosse', 46.81, -117.88],
  ['Endicott', 46.93, -117.69], ['Farmington', 47.09, -117.05], ['Albion', 46.79, -117.25],
  ['Colton', 46.57, -117.13], ['Uniontown', 46.54, -117.09], ['Malden', 47.23, -117.47],
  // Adams / Lincoln
  ['Ritzville', 47.13, -118.38], ['Othello', 46.83, -119.17], ['Lind', 46.97, -118.61],
  ['Hatton', 46.77, -118.83], ['Washtucna', 46.75, -118.31], ['Davenport', 47.65, -118.15],
  ['Harrington', 47.48, -118.26], ['Odessa', 47.33, -118.69], ['Reardan', 47.67, -117.88],
  ['Sprague', 47.30, -117.98], ['Wilbur', 47.76, -118.71], ['Creston', 47.76, -118.52],
  ['Almira', 47.71, -118.94],
  // Grant County
  ['Moses Lake', 47.13, -119.28], ['Ephrata', 47.32, -119.55], ['Quincy', 47.23, -119.85],
  ['Warden', 46.97, -119.04], ['Royal City', 46.90, -119.63], ['Mattawa', 46.74, -119.90],
  ['George', 47.08, -119.86], ['Soap Lake', 47.39, -119.49], ['Coulee City', 47.61, -119.29],
  ['Electric City', 47.93, -119.04], ['Grand Coulee', 47.94, -119.00], ['Hartline', 47.69, -119.11],
  ['Krupp', 47.31, -119.00], ['Wilson Creek', 47.42, -119.12],
  // Okanogan / Ferry
  ['Omak', 48.41, -119.53], ['Okanogan', 48.36, -119.58], ['Brewster', 48.10, -119.78],
  ['Pateros', 48.05, -119.90], ['Twisp', 48.37, -120.12], ['Winthrop', 48.47, -120.19],
  ['Tonasket', 48.71, -119.44], ['Oroville', 48.94, -119.44], ['Riverside', 48.50, -119.51],
  ['Conconully', 48.56, -119.75], ['Nespelem', 48.17, -118.97], ['Elmer City', 48.02, -118.95],
  ['Republic', 48.65, -118.74],
  // Stevens / Pend Oreille
  ['Colville', 48.55, -117.90], ['Chewelah', 48.28, -117.72], ['Kettle Falls', 48.61, -118.06],
  ['Northport', 48.92, -117.78], ['Marcus', 48.66, -118.06], ['Springdale', 48.06, -117.75],
  ['Newport', 48.18, -117.04], ['Ione', 48.74, -117.42], ['Metaline', 48.85, -117.39],
  ['Metaline Falls', 48.86, -117.37], ['Cusick', 48.34, -117.30],
  // Klickitat / Skamania
  ['Goldendale', 45.82, -120.82], ['White Salmon', 45.73, -121.49], ['Bingen', 45.72, -121.47],
  ['Stevenson', 45.69, -121.88], ['North Bonneville', 45.64, -121.97],
];

export const WORLD_CITIES = [
  ['New York, USA', 40.71, -74.01, -5],
  ['Los Angeles, USA', 34.05, -118.24, -8],
  ['Chicago, USA', 41.88, -87.63, -6],
  ['Denver, USA', 39.74, -104.99, -7],
  ['Miami, USA', 25.76, -80.19, -5],
  ['Honolulu, USA', 21.31, -157.86, -10],
  ['Anchorage, USA', 61.22, -149.90, -9],
  ['Portland, USA', 45.52, -122.68, -8],
  ['San Francisco, USA', 37.77, -122.42, -8],
  ['Phoenix, USA', 33.45, -112.07, -7],
  ['Dallas, USA', 32.78, -96.80, -6],
  ['Houston, USA', 29.76, -95.37, -6],
  ['Atlanta, USA', 33.75, -84.39, -5],
  ['Boston, USA', 42.36, -71.06, -5],
  ['Washington DC, USA', 38.91, -77.04, -5],
  ['Toronto, Canada', 43.65, -79.38, -5],
  ['Vancouver BC, Canada', 49.28, -123.12, -8],
  ['Mexico City, Mexico', 19.43, -99.13, -6],
  ['São Paulo, Brazil', -23.55, -46.63, -3],
  ['Buenos Aires, Argentina', -34.60, -58.38, -3],
  ['London, UK', 51.51, -0.13, 0],
  ['Paris, France', 48.86, 2.35, 1],
  ['Berlin, Germany', 52.52, 13.40, 1],
  ['Madrid, Spain', 40.42, -3.70, 1],
  ['Rome, Italy', 41.90, 12.50, 1],
  ['Athens, Greece', 37.98, 23.73, 2],
  ['Moscow, Russia', 55.76, 37.62, 3],
  ['Istanbul, Türkiye', 41.01, 28.98, 3],
  ['Dubai, UAE', 25.20, 55.27, 4],
  ['Mumbai, India', 19.08, 72.88, 5.5],
  ['New Delhi, India', 28.61, 77.21, 5.5],
  ['Bangkok, Thailand', 13.76, 100.50, 7],
  ['Singapore', 1.35, 103.82, 8],
  ['Hong Kong', 22.32, 114.17, 8],
  ['Beijing, China', 39.90, 116.41, 8],
  ['Shanghai, China', 31.23, 121.47, 8],
  ['Seoul, South Korea', 37.57, 126.98, 9],
  ['Tokyo, Japan', 35.68, 139.69, 9],
  ['Sydney, Australia', -33.87, 151.21, 10],
  ['Auckland, New Zealand', -36.85, 174.76, 12],
  ['Johannesburg, South Africa', -26.20, 28.05, 2],
  ['Cairo, Egypt', 30.04, 31.24, 2],
  ['Lagos, Nigeria', 6.52, 3.38, 1],
];
