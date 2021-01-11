/* eslint-disable strict */
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const app = require('./app');

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Thank God! listening on port ${PORT}`);
});