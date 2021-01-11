/* eslint-disable strict */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan'); 
const cors = require('cors');
const cuid = require('cuid');
const logger = require('./logger');
const list = require('./bookmarks');

const apiToken = process.env.API_TOKEN;
const PORT = process.env.PORT;

const app = express();
const morganOption = (process.env.NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(express.json());


/* comment out for tests */
app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');

  console.log('validate bearer token middleware');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
    
  next();
});

app 
  .route('/')
  .get((req, res) => {
    res.send('Working so far');
  });

app
  .route('/bookmarks')
  .get((req, res) => {
    res
      .status(200)
      .send(list);
  })
  .post((req, res) => {
    const {title, rating, url, description = ''} = req.body;

    if (!title) {
      logger.error('title is required');
    }

    if (!rating) {
      logger.error('rating is required');
    }

    if (!url) {
      logger.error('url is required');
    }

    let bookmark = {
      id: cuid(),
      title: title,
      rating: rating,
      description: description
    };

    list.push(bookmark);
    
    logger.info('You made a bookmark!      Bookmark_Id: ' + bookmark.id );
    res
      .status(200)
      .location(`http://localhost:${PORT}/bookmarks/${bookmark.id}`)
      .json(bookmark);

  });

app
  .route('/bookmarks:id')
  .get((req, res) => {
    const { id } = req.params;
    let bookmark = list.filter(item => item.id === id);

    if (bookmark.length === 0) {
      logger.error('Bookmark does not exist');
      return res
        .status(404)
        .send(`Sorry, we could't find bookmark ${id}`);
    }

    res
      .status(200)
      .json(bookmark[0]);
  })
  .delete((req, res) => {
    const { id } = req.params;
    let bookmark = list.filter(item => item.id === id);
    
    if (bookmark.length === 0) {
      logger.error('Bookmark does not exist');
      return res
        .status(404)
        .send(`Sorry, we could't find bookmark ${id}`);
    }

    let num = 0;
    for (let x = 0; x < list.length; x++) {
      if (x.id === id) {
        num = id;
      }
    }
    list.splice(num, 1);

    logger.info('bookmark deleted succesfully');
    res
      .status(200)
      .end();
  });


module.exports = app;