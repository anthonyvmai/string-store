const express = require('express')
const router = express.Router()

const crypto = require('crypto')
const mysql = require('mysql')

const pool = mysql.createPool({
	host: 'string-store-mysql.c7gn5ltapjua.us-east-1.rds.amazonaws.com',
	user: 'foouser',
	password: 'foobar123',
	database: 'stringstore'
})

router.post('/', function(req, res) {
	pool.getConnection(function(err, conn) {
		if (err) {
			conn.release()
			res.status(500).send(stringify({'err_msg': 'Database error'}))
			return
		}
		const msg = req.body.message
		const hash = crypto.createHash('sha256').update(msg).digest('hex')
		// lol sql injection
		// IGNORE duplicate inserts
		const sql = `INSERT IGNORE INTO messages VALUES ("${hash}", "${msg}")`

		conn.query(sql, function (err, rows) {
			conn.release()
			if (err) {
				res.status(500).send(stringify({'err_msg': 'Database error'}))
				return
			}
			res.send(stringify({'digest': hash}))
		})
	})
})

router.get('/:hash', function(req, res) {
	pool.getConnection(function(err, conn) {
		if (err) {
			conn.release()
			res.status(500).send(stringify({'err_msg': 'Database error'}))
			return
		}
		const hash = req.params.hash
		// lol sql injection
		const sql = `SELECT message FROM messages WHERE digest = "${hash}"`

		conn.query(sql, function (err, rows) {
			conn.release()
			if (err) {
				res.status(500).send(stringify({'err_msg': 'Database error'}))
				return
			}
			if (rows.length > 0) {
				res.send(stringify(rows[0]))
			} else {
				res.status(404).send(stringify({'err_msg': 'Message not found'}))
			}
		})
	})
})

// pretty print json
function stringify(obj) {
	return JSON.stringify(obj, null, 2)
}

module.exports = router
