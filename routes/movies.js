import express from 'express';
const router = express.Router();
import db from '../db/connector.js';

router.get('/', async function(req, res, next) {
  const moviesData = await db.query('SELECT * FROM movies');
  
  const modMovies = moviesData.rows.map(s => {
    return {
      ...s, 
      created_at_date: s.created_at.toLocaleDateString()
    }
  })

  res.render('movies_page', { movies: modMovies || [] });
});

export default router;
