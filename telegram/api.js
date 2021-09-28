const axios = require("axios");
// Fetch the movie lists
const fetchMovies = async () => {
  const URL = "https://imdb8.p.rapidapi.com/auto-complete?q=game of thr";
  const response = await axios({
    url: URL,
    headers: {
      "x-rapidapi-host": "imdb8.p.rapidapi.com",
      "x-rapidapi-key": "49588cfc35msh06e743156ad1402p19efc7jsn30940b29f76f",
    },
  });

  return response.data;
};

module.exports = { fetchMovies };
