var express = require('express')
var app = express()

var mongo = require('mongodb').MongoClient
var url = process.env.MONGOLAB_URI

var PORT = process.env.PORT || 3000;


app.get('/:id', function(req, res) {
	var id = parseInt(req.params.id)
	mongo.connect(url, function(err, db) {
		if(err){

		}else{
			console.log('Connection Established to ', url)

			var links = db.collection('links')
			links.findOne({_id: id}, {}, function(err, result) {
				if(err){
					console.log(err)
				}else if (result){
					console.log('Found: ', result)
					res.redirect(result.link)
				}else{
					console.log('No link found under _id = ' + id)
					res.end('No link found under _id = ' + id)
				}
			})

		}
		db.close()
	})	
})

app.get('/new/:longUrl*', function(req, res) {
	var longUrl = req.url.slice(5)
	var id = 1;
	if(longUrl.match(/^(http|https):\/\//)){
		mongo.connect(url, function(err, db) {
			if(err) {
				console.log(err)
			} else {
				var links = db.collection('links')
				links.findOne({}, {sort: {_id: -1}}, function(err, result) {
					console.log("Result of query = " + result)
					if(err){
						throw(err)
					}else {
						if(result){
							id += result._id
						}
						var shortLink = req.protocol + '://' + req.get('host') + "/" + id
						console.log(shortLink)
						links.insert({_id: id, link: longUrl, shortLink: shortLink}, function (err){
							if(err) {
								console.log(err)
							}else{
								db.close()
							}
						})
						res.end(JSON.stringify({original_link: longUrl, short_link: shortLink}))
					}
				})
			}
		// db.close()
		})
	}else{
		res.end("Invalid link format. Must start with http:// or https://, your link: " + longUrl)
	}
})


app.listen(PORT, function(){
	console.log('Node app is running on port ' + PORT)

})