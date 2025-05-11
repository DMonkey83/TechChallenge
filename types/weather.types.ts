export interface Location {
  location: string;
  degreeDays: string;
  groundTemp: string;
  postcode: string;
  lat: string;
  lng: string;

}

export interface WeatherData {
  location: Location;
}
