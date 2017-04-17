
const express = require('express');
const js2xmlparser = require("js2xmlparser");
const xml2js = require('xml2js');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const router = express.Router();

router.get('/', (req, res, next) => {
	
	res.status(200).sendFile(__dirname + '/views/index.html')

});

router.post('/sendInformation', (req, res) => {

	req.body["@"] = {
		"xmlns": "http://www.canadapost.ca/ws/ncshipment-v4"
	}

	if (req.body["delivery-spec"]["preferences"]) {
		req.body["delivery-spec"]["preferences"]["show-packing-instructions"] = true;
	} else {
		req.body["delivery-spec"]["preferences"] = {
			"show-packing-instructions": false
		}
	}

	var xml = js2xmlparser.parse("non-contract-shipment", req.body, {"declaration": {"encoding": "UTF-8"}})

	request(
	{
		url: "https://ct.soa-gw.canadapost.ca/rs/0008545499/ncshipment",
		method: "POST",
		headers: {
			"Accept": "application/vnd.cpc.ncshipment-v4+xml",
			"Content-Type": "application/vnd.cpc.ncshipment-v4+xml",
			"Authorization": "Basic NmY0OWVhOTAxNjE3NDFiMTpmNmU4MDY3ZWNlMzUyYWIwYWU3Mzg2",
			"Accept-language": "en-CA"
		},
		body: xml
	}, function(error, response, body) {

		if (error) {
			res.status(400).send('Bad Request');
		}

		var parser = new xml2js.Parser();

		parser.parseString(body, function(err, result) {
			var json = JSON.stringify(result);
			json = JSON.parse(json);

			var links = json["non-contract-shipment-info"]["links"][0]["link"]

			var obj = _.find(links, function(el) {
				return _.get(el, '$.rel') === 'label';
			});

			var url = _.get(obj, '$.href');
			console.log(url);

			request(
			{
				url: url,
				method: "GET",
				headers: {
					"Accept": "application/pdf",
					"Authorization": "Basic NmY0OWVhOTAxNjE3NDFiMTpmNmU4MDY3ZWNlMzUyYWIwYWU3Mzg2",
					"Accept-language": "en-CA"
				},
				encoding: 'binary'
			}, function (error, response, body) {

				fs.writeFileSync("label.pdf", body, 'binary');

			});

		});
	});

	

})



module.exports = router;