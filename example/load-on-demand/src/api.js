const getJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

// simulate an API that returns only name and ID as a summary
// and full records as detail

const api = {
  getCountriesSummary: async () => {
    const data = await getJson('/data/countries.json');
    return data.map(c => ({
      countryId: c.countryId,
      countryName: c.countryName,
    }));
  },

  getCitiesSummary: async () => {
    const data = await getJson('/data/cities.json');
    return data.map(c => ({
      cityId: c.cityId,
      cityName: c.cityId,
    }));
  },

  getPeopleSummary: async () => {
    const data = await getJson('/data/people.json');
    return data.map(p => ({
      personId: p.personId,
      personName: p.personName,
    }));
  },

  getCountriesDetail: async () => getJson('/data/countries.json'),

  getCitiesDetail: async () => getJson('/data/cities.json'),

  getPeopleDetail: async () => getJson('/data/people.json'),

};

export default api;