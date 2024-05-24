import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import Pool from 'pg';

dotenv.config();

const app: Express = express();
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:4200" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

type Game = {
  id: number;
  title: string;
  url: string;
  image: string;
};

router.post('/game', createGame);
router.delete('/game/:gameID', deleteGame);
router.get('/game/:gameID', getGame);
router.get('/games', getGames);
router.put('/game/:gameID', updateGame);

router.get('/', (req, res) => {
  res.send('Welcome to your server!'); // or you can send a HTML file or redirect to another route
});

async function createGame(request: Request, response: Response, next: NextFunction) {
  const game = request.body as Game;

  try {
    const result = await pool.query(
      'INSERT INTO game (title, url, image) VALUES ($1, $2, $3) RETURNING *',
      [game.title, game.url, game.image]
    );
    response.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteGame(request: Request, response: Response, next: NextFunction) {
  const gameID = parseInt(request.params.gameID);

  try {
    const result = await pool.query('DELETE FROM game WHERE id = $1 RETURNING *', [gameID]);

    if (result.rowCount && result.rowCount> 0) {
      response.status(200).send();
    } else {
      response.status(404).send();
    }
  } catch (error) {
    next(error);
  }
}

async function getGame(request: Request, response: Response, next: NextFunction) {
  const gameID = parseInt(request.params.gameID);

  pool.query('SELECT * FROM game WHERE id = $1;', [gameID]).then(
    query => response.status(200).json(query.rows[0])
  )
}

async function getGames(request: Request, response: Response, next: NextFunction) {
  pool.query('SELECT * FROM game;', []).then(
    query => response.status(200).json(query.rows)
  )
}

async function updateGame(request: Request, response: Response, next: NextFunction) {
  const gameID = parseInt(request.params.gameID);
  const game = request.body as Game;

  try {
    const result = await pool.query(
      'UPDATE game SET title = $1, url = $2, image = $3 WHERE id = $4 RETURNING *',
      [game.title, game.url, game.image, gameID]
    );

    if (result.rowCount && result.rowCount > 0) {
      response.status(200).json(result.rows[0]);
    } else {
      response.status(404).send();
    }
  } catch (error) {
    next(error);
  }
}

const pool = new Pool.Pool({
  user: "postgres",
  host: "localhost",
  database: "games",
  password: "jacobkartorium",
  port: 5432
})
