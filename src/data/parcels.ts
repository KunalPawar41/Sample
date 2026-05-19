export type LatLngTuple = [number, number];

export type LandParcel = {
  id: string;
  surveyNumber: string;
  district: string;
  taluka: string;
  village: string;
  ownerHint: string;
  areaAcres: number;
  currentUse: string;
  confidence: "manual-demo" | "field-verified";
  center: LatLngTuple;
  boundary: LatLngTuple[];
  nearestRoadPoint: LatLngTuple;
  entryPoint: LatLngTuple;
  farmPath: LatLngTuple[];
  landmarks: string[];
  notes: string;
};

export const parcels: LandParcel[] = [
  {
    id: "bhoomi-42-1",
    surveyNumber: "42/1",
    district: "Pune",
    taluka: "Haveli",
    village: "Bhoomi Demo Village",
    ownerHint: "Sample owner A",
    areaAcres: 2.8,
    currentUse: "Sugarcane and seasonal vegetables",
    confidence: "manual-demo",
    center: [18.60782, 73.79506],
    boundary: [
      [18.60834, 73.79431],
      [18.60847, 73.79536],
      [18.60776, 73.79583],
      [18.60721, 73.79525],
      [18.60733, 73.79445],
    ],
    nearestRoadPoint: [18.60871, 73.79383],
    entryPoint: [18.60835, 73.79434],
    farmPath: [
      [18.60871, 73.79383],
      [18.60861, 73.79402],
      [18.60849, 73.79417],
      [18.60835, 73.79434],
    ],
    landmarks: ["Blue water tank", "Mango tree at north corner", "Kaccha road from temple lane"],
    notes: "Demo parcel showing survey-number lookup, boundary visualization, and road-to-plot access.",
  },
  {
    id: "bhoomi-42-2",
    surveyNumber: "42/2",
    district: "Pune",
    taluka: "Haveli",
    village: "Bhoomi Demo Village",
    ownerHint: "Sample owner B",
    areaAcres: 1.6,
    currentUse: "Fallow plot",
    confidence: "manual-demo",
    center: [18.60744, 73.79608],
    boundary: [
      [18.60776, 73.79583],
      [18.60752, 73.79678],
      [18.60696, 73.79655],
      [18.60721, 73.79525],
    ],
    nearestRoadPoint: [18.60871, 73.79383],
    entryPoint: [18.60776, 73.79583],
    farmPath: [
      [18.60871, 73.79383],
      [18.60844, 73.79436],
      [18.60814, 73.79486],
      [18.60776, 73.79583],
    ],
    landmarks: ["Shared bund with 42/1", "Small borewell shed", "Neem tree on east boundary"],
    notes: "Adjacent parcel demonstrating neighboring boundaries and shared access paths.",
  },
  {
    id: "bhoomi-43-3",
    surveyNumber: "43/3",
    district: "Pune",
    taluka: "Haveli",
    village: "Bhoomi Demo Village",
    ownerHint: "Sample owner C",
    areaAcres: 3.2,
    currentUse: "Pomegranate orchard",
    confidence: "manual-demo",
    center: [18.60903, 73.79635],
    boundary: [
      [18.60956, 73.79564],
      [18.60962, 73.79672],
      [18.60888, 73.79714],
      [18.60847, 73.79536],
    ],
    nearestRoadPoint: [18.60994, 73.79521],
    entryPoint: [18.60956, 73.79564],
    farmPath: [
      [18.60994, 73.79521],
      [18.60982, 73.79535],
      [18.60971, 73.79549],
      [18.60956, 73.79564],
    ],
    landmarks: ["Electric pole HP-17", "Stone well near west edge", "Orchard fencing"],
    notes: "Shows a separate road access point and a larger orchard-style boundary.",
  },
  {
    id: "bhoomi-44",
    surveyNumber: "44",
    district: "Pune",
    taluka: "Haveli",
    village: "Bhoomi Demo Village",
    ownerHint: "Sample owner D",
    areaAcres: 2.1,
    currentUse: "Mixed crop",
    confidence: "manual-demo",
    center: [18.60677, 73.79447],
    boundary: [
      [18.60733, 73.79445],
      [18.60721, 73.79525],
      [18.60625, 73.79503],
      [18.60615, 73.79402],
      [18.60682, 73.79384],
    ],
    nearestRoadPoint: [18.60602, 73.79362],
    entryPoint: [18.60615, 73.79402],
    farmPath: [
      [18.60602, 73.79362],
      [18.60608, 73.79383],
      [18.60615, 73.79402],
    ],
    landmarks: ["Dry stream crossing", "Shared footpath from south side", "Two tamarind trees"],
    notes: "Demonstrates last-mile access from the south side of the village road.",
  },
];
