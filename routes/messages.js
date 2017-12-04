const express = require('express')
const router = express.Router()

const crypto = require('crypto')

let map = {}

router.post('/', function(req, res) {
	const msg = req.body.message
	const hash = crypto.createHash('sha256').update(msg).digest('hex')
	map[hash] = msg
	const json = stringify({'digest': hash})
	res.send(json)
})

router.get('/:hash', function(req, res) {
	const hash = req.params.hash
	const msg = map[hash]
	if (msg) {
		const json = stringify({'message': msg})
		res.send(json)
	} else {
		const json = stringify({"err_msg": "Message not found"})
		res.status(404).send(json)
	}
})

function stringify(obj) {
	return JSON.stringify(obj, null, 2)
}

module.exports = router
