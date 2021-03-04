const NeoGeocoder = require("node-geocoder");

const options = {
    httpAdapter: 'https',
    provider: process.env.GEOCODER_PROVIDER,
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null,
};

const geocoder = NeoGeocoder(options);

module.exports = geocoder;