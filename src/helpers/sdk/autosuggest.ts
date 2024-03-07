interface SkyscannerAPIAutoSuggestResponse {
  places: Place[];
}

export interface Place {
  cityId: string;
  cityName: string;
  cityNameEn: string;
  countryId: string;
  countryName: string;
  geoContainerId: string;
  geoId: string;
  highlighting: number[][];
  iataCode: string;
  localizedPlaceName: string;
  location: string;
  placeId: string;
  placeName: string;
  placeNameEn: string;
  regionId: string;
  resultingPhrase: string;
  untransliteratedResultingPhrase: string;
}

export const searchAutoSuggest = async (searchTerm: string) => {
  if (searchTerm === '') return [];
  const res = await fetch(
    `http://localhost:3000/autosuggest/flights/${searchTerm}`,
  );
  const json: SkyscannerAPIAutoSuggestResponse = await res.json();

  return json.places;
};
