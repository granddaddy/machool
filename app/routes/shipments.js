
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	
	res.status(200).sendFile(__dirname + '/views/index.html')

});

router.post('/sendInformation', (req, res) => {

	res.status(200).send(req.body)

})



module.exports = router;