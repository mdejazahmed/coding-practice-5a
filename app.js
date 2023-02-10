const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let database = null;

function convertDirector(each) {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
}

function convertDbOBjToResponse(each) {
  return {
    movieId: movieObj.movie_id,
    directorId: movieObj.director_id,
    movieName: movieObj.movie_name,
    leadActor: movieObj.lead_Actor,
  };
}

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/movies/", async (req, res) => {
  const movieNameQuery = `SELECT movie_name FROM movie;`;
  const moviesArray = await database.all(movieNameQuery);
  res.send(moviesArray.map((each) => ({ movieName: each.movie_name })));
});

app.post("/movies/", async (req, res) => {
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
INSERT INTO 
    movie (director_id,movie_name,lead_actor)
VALUES
    (${directorId},'${movieName}','${leadActor}');`;
  await database.run(addMovieQuery);
  res.send("Movie Successfully Added");
  console.log("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const getMovieQuery = `
SELECT
    *
FROM
    movie
WHERE
    movie_id=${movieId};`;

  const movie = await database.get(getMovieQuery);
  res.send(movie);
});

app.put("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const updateQuery = `
UPDATE 
    movie
SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
WHERE
    movie_id=${movieId};`;

  await database.run(updateQuery);
  res.send("Movie Details Updated");
  console.log("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteQuery = `
DELETE FROM 
    movie
WHERE 
     movie_id=${movieId};`;

  await database.run(deleteQuery);
  res.send("Movie Removed");
  console.log("Movie Removed");
});

app.get("/directors/", async (req, res) => {
  const getDirectorQuery = `
SELECT
    *
FROM 
    director;`;
  const directorArray = await database.all(getDirectorQuery);
  res.send(
    directorArray.map((each) => {
      return convertDirector(each);
    })
  );
});

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const directorMovieQuery = `
SELECT 
    movie_name
FROM 
    movie
WHERE
    director_id=${directorId};`;

  const directorMovieArray = await database.all(directorMovieQuery);
  res.send(
    directorMovieArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
