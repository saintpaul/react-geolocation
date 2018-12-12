const Configuration = {
    LANGUAGE: "de",                     // Language to use with Google Maps API
    GOOGLE_MAPS_API_KEY: undefined,     // Google Maps API Key (required)
    CHOOSE_CITY_TEXT: "Choose city",    // Message displayed when user has to refine his choice by selecting a city
    FALLBACK_CITY_TEXT: "Coulnd't find any matching location : setting Luxemburg city as a fallback", // Message displayed when user select an entry which is not matching any valid locality (ex: Luxemburg)
};

module.exports = Configuration;