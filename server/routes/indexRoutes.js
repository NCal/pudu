const express = require('express')
const router = express.Router()
// const Airtable = require('airtable')
// const key = require('../../hidden/hidden')
// const base = new Airtable({apiKey: key.api }).base(key.base);

router.post('/airtable', (req, res, next) => {
  postAirtable(req, res, next)
})

const postAirtable = (req, res, next) => {
  // console.log('postAirtable query', req)

    base('addresses').create([
      {
        "fields": {
          id: Date.now().toString(), 
          address: req.body.address,
          ip: req.socket.remoteAddress
        }
      }
    ], (err, records) => {
      if (err) {
        console.error(err);
        res.status(500).send(err)
        return;
      }
      records.forEach( (record) => {
        // console.log('success', record.getId());
        res.status(200).send()
      });
    });
}

module.exports = router