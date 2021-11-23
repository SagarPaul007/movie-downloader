const axios = require("axios");
const cheerio = require("cheerio");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

// get download link of a movie
const getData = async (link) => {
  let movie = {};

  await axios.get(link).then(async ({ data }) => {
    const $ = await cheerio.load(data);

    const title = $("#mobile-movie-info > h1").text();
    const year = $("#mobile-movie-info > h2:nth-child(2)").text();
    const img = $("#movie-poster > img").attr("src");

    //   first link
    const firstTitle = $(
      "#movie-info > div.bottom-info > p > a:nth-child(1)"
    ).text();
    const firstLink = $(
      "#movie-info > div.bottom-info > p > a:nth-child(1)"
    ).attr("href");

    // second link
    const secondTitle = $(
      "#movie-info > div.bottom-info > p > a:nth-child(2)"
    ).text();
    const secondLink = $(
      "#movie-info > div.bottom-info > p > a:nth-child(2)"
    ).attr("href");

    // third link
    const thirdTitle = $(
      "#movie-info > div.bottom-info > p > a:nth-child(3)"
    ).text();
    const thirdLink = $(
      "#movie-info > div.bottom-info > p > a:nth-child(3)"
    ).attr("href");

    movie = {
      title,
      year,
      img,
      firstTitle,
      firstLink,
      secondTitle,
      secondLink,
      thirdTitle,
      thirdLink,
    };
  });

  return movie;
};

// Get all the links of a movie from yts
const yts = async (movie_name) => {
  const links = [];

  await axios
    .get(`https://yts.mx/browse-movies/${movie_name}/all/all/0/latest/0/all`)
    .then(async (res) => {
      const $ = await cheerio.load(res.data);

      //   looping over all movies
      $(".browse-movie-wrap").each(async (index, item) => {
        const link = $(item).children("a").attr("href");
        links[index] = link;
      });
    });

  return links;
};

const download = async (name) => {
  const movies = [];
  // movie links
  const links = await yts(name);

  // getting all download links
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    movies.push(await getData(link));
  }

  // console.log(movies);
  return movies;
};

(async () => {
  // getting movie name from command line
  const name = argv.name;

  // showing results
  console.log("Loading... Please wait! It may take a while!");
  const results = await download(name);

  if (results.length === 0) {
    console.log("No results found ... Please check your movie name!!!");
  } else {
    console.log(results); // all movies with download links
  }
})();
