require('dotenv').config()
const config = require('./bitserve.json')
const express = require('express')
const bitqueryd = require('bitqueryd')
const ip = require('ip')
const app = express()
var db;
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.get(/^\/q\/(.+)/, async function(req, res) {
  var encoded = req.params[0];
  let r = JSON.parse(new Buffer(encoded, "base64").toString());
  let result = await db.read(r)
  if (config.log) {
    console.log("query = ", r)
    console.log("response = ", result)
  }
  res.json(result)
})
app.get(/^\/explorer\/(.+)/, function(req, res) {
  let encoded = req.params[0]
  let decoded = Buffer.from(encoded, 'base64').toString()
  res.render('explorer', { code: decoded })
});
app.get('/explorer', function (req, res) {
  res.render('explorer', { code: JSON.stringify(config.query, null, 2) })
});
var run = async function() {
  db = await bitqueryd.init({
    url: (config.url ? config.url : process.env.url),
    timeout: config.timeout
  })
  app.listen(config.port, () => {
    console.log("######################################################################################");
    console.log("#")
    console.log("#  BITSERVE: BitDB Microservice")
    console.log("#  Serving Bitcoin through HTTP...")
    console.log("#")
    console.log(`#  Explorer: ${ip.address()}:${config.port}/explorer`);
    console.log(`#  API Endpoint: ${ip.address()}:${config.port}/q`);
    console.log("#")
    console.log("#  Learn more at https://docs.bitdb.network")
    console.log("#")
    console.log("######################################################################################");
  })
}
run()
