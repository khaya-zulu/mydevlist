export type PolaroidMarker = {
  id: string;
  location: [number, number];
  size: number;
  image: string;
  caption: string;
  rotate: number;
};

export const polaroidMarkers: PolaroidMarker[] = [
  {
    id: "sf",
    location: [37.7595, -122.4367],
    size: 0.05,
    image: "https://picsum.photos/seed/sanfrancisco/160/160",
    caption: "San Francisco",
    rotate: -6,
  },
  {
    id: "ny",
    location: [40.7128, -74.006],
    size: 0.05,
    image: "https://picsum.photos/seed/newyork/160/160",
    caption: "New York",
    rotate: 5,
  },
  {
    id: "london",
    location: [51.5074, -0.1278],
    size: 0.05,
    image: "https://picsum.photos/seed/london/160/160",
    caption: "London",
    rotate: -4,
  },
  {
    id: "tokyo",
    location: [35.6762, 139.6503],
    size: 0.05,
    image: "https://picsum.photos/seed/tokyo/160/160",
    caption: "Tokyo",
    rotate: 7,
  },
  {
    id: "sydney",
    location: [-33.8688, 151.2093],
    size: 0.05,
    image: "https://picsum.photos/seed/sydney/160/160",
    caption: "Sydney",
    rotate: -5,
  },
  {
    id: "cape-town",
    location: [-33.9249, 18.4241],
    size: 0.05,
    image: "https://picsum.photos/seed/capetown/160/160",
    caption: "Cape Town",
    rotate: 4,
  },
];
