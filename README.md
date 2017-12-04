# string-store
Store strings based on their sha256. POST a string to store it and get back its hash. GET the hash to get back the string.

endpoint at `ec2-34-239-101-104.compute-1.amazonaws.com/messages`

Using ec2/node/express/pm2 as the web server and RDS/mysql for persistence.

## examples
```
$ curl -X POST -H "Content-Type: application/json" -d '{"message": "foo"}' ec2-34-239-101-104.compute-1.amazonaws.com/messages
{
  "digest": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae"
}
$ curl -i ec2-34-239-101-104.compute-1.amazonaws.com/messages/2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 22
ETag: W/"16-kHqUWbPjW5UK0Bdtm9saTH4EJIo"
Date: Mon, 04 Dec 2017 05:36:05 GMT
Connection: keep-alive

{
  "message": "foo"
}
$ curl -i ec2-34-239-101-104.compute-1.amazonaws.com/messages/nonexistenthash
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 36
ETag: W/"24-lNU8+Sb6uQSvhpSOsSS7kWniHMQ"
Date: Mon, 04 Dec 2017 05:36:25 GMT
Connection: keep-alive

{
  "err_msg": "Message not found"
}
```

## some setup
```
$ git clone https://github.com/anthonyvmai/string-store.git
$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ sudo npm install pm2 -g
$ cd string-store
~/string-store$ npm install
```

## run the app
```
~/string-store$ pm2 start bin/www
```

## create mysql table
```
mysql -h string-store-mysql.c7gn5ltapjua.us-east-1.rds.amazonaws.com -P 3306 -u foouser -p < create_table.sql
```

# Performance Question
The main bottlenecks in this implementation are the single tiny express server and the tiny mysql instance. The single express server could be scaled by using a beefier instance, then the app as a whole could be scaled further by launching multiple servers with a load balancer that can split up requests between the servers. Every express server would connect to the same mysql instance as the persistent data store. The persistent data store could be scaled by using a technology specifically meant for KV storage instead of just a simple relational database. This KV store could also be a distributed cluster instead of a single instance.
