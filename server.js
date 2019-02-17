const express = require('express');
const app = express();
const cors = require ('cors');
const mysql = require('mysql') 

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(cors());
app.use(bodyParser.urlencoded({
	extended: true
}));

const config = { 								//menyambungkan express dengan database
  host     : 'localhost',						//mungkin disimpen di server berbeda. bisa jadi ip tertentu
  user     : 'root',							//user database
  password : '',								//pw database
  database : 'microblogging'					//pake yg suar aja
  												//satu lagi ada port default mysql:'3306'. di port lain mysql juga bisa misal 3307, specify di port ini
};
const connection = mysql.createPool(config);


var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var url = "mongodb://localhost:27017/";
var ObjectId = require('mongodb').ObjectID;

app.get('/mongodb', (req, res) => {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("blogmobile");
	  dbo.collection("blogs").find({}).sort({'_id': -1}).toArray(function(err, result) {
	    if (err) throw err;
	    console.log(result.name);
	    db.close();
	    res.send(result)
	  });
	});
});

app.post('/mongodb', (req, res) => {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("blogmobile");
	  var post = req.body
	  dbo.collection("blogs").insertOne(post, function(err, result) {
	    if (err) throw err;
	    console.log("1 document inserted");
	    db.close();
	    res.status(200).send({_id:post._id});
	  });
	});
});

app.post('/mongodblogin', (req, res) => {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("blogmobile");
	  var login = req.body
	    console.log(login)
	  dbo.collection("user").findOne(login, function(err, result) {
	    if (err) {
	    	res.send(err.message)
	    } else {
	    	if (result._id != null) {
	    		res.send({_id:result._id, username:result.username});	
	    	} else {
	    		res.send(result._id)
	    	}
	    };
	    console.log(result)
	    db.close();
	    //res.status(200).send({_id:result._id},{username:result.username});
	  });
	});
});

app.delete('/mongodb/:id', (request, response) => {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("blogmobile");
	    const id = {_id: new mongo.ObjectID(request.params.id)};
 		console.log(id)
	  dbo.collection("blogs").deleteOne(id, function(err, obj) {
	    if (err) throw err;
	    console.log("1 document deleted");
	    db.close();
	    response.send(obj)
	  });
	});
});

app.put('/mongodb/:id', (request, response) => {
	MongoClient.connect(url, function(err, db) {
	  	if (err) throw err;
	  	var dbo = db.db("blogmobile");
	  	const id = {_id: new mongo.ObjectID(request.params.id)};
 		console.log(id)
	  	dbo.collection("blogs").updateOne(id, {$set:request.body}, function(err, result) {
	    	if (err) throw err;
	    console.log("1 document updated");
	    db.close();
	    response.status(200).json(result);
	  });
	});
});

app.get('/mysql', (req, res) => {				
	connection.query('SELECT * FROM blogs ORDER BY id DESC', function (err, rows, fields) { 
	  if (err) throw err																
	  res.send(rows);							//rows dalam bentuk array //solution column nya
	})	
});

app.post('/mysql', (request, response) => {
	console.log(request.body)
	connection.query("INSERT INTO blogs SET ?", request.body, (error, result) => 
	{	
		console.log('string error', error)
		if (error) {
			throw error;
		}	
		console.log('result', result.insertId)
		console.log('result2', result.id)
		response.status(200).send({id:result.insertId});	
	})
});

app.delete('/mysql/:id', (request, response) => {
    const id = request.params.id;
 	console.log(id)
    connection.query('DELETE FROM blogs WHERE id = ?', id, (error, result) => {
        if (error) throw error;
 
        response.send('post deleted.');
    });
});

app.put('/mysql/:id', (request, response) => {
    const id = request.params.id;
 
    connection.query('UPDATE blogs SET ? WHERE id = ?', [request.body, id], (error, result) => {
        if (error) {
        	throw error;
 		}
        response.send('Post updated successfully.');
    });
});

// MongoClient.connect("mongodb://localhost:27017/MyDb", function (err, db) {   
//     if(err) {
//      	throw err;
//     }
                
// });

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
	});

//mongod -dbpath .

// let biodata = {
// 	nama: 'Rifqi',
// 	umur: '25',
// 	alamat: 'antapani',
// 	ttl: 'Bandung, 9 April 1993',
// 	riwayatPendidikan: [
// 		{
// 			jenjang: "sd",
// 			sekolah: "SD Istiqamah"
// 		},
// 		{
// 			jenjang: "smp",
// 			sekolah: "SMP Istiqamah"

// 		},
// 		{
// 			jenjang: "sma",
// 			sekolah: "SMAN 3"
// 		},	
// 		{
// 			jenjang: "univ",
// 			sekolah: "itb"
// 		}
// 	]
// }

// app.get('/', (req, res) => {

//   res.send(biodata);
// });

// app.get('/sekolah/:jenjang', (req, res) => {
	
// 	function cariSekolah(biodata,jenjang) {
// 		let rp = biodata.riwayatPendidikan;
// 		var i=0;
// 		while (i < rp.length) {
// 			if (jenjang == rp[i].jenjang) {
// 				return rp[i].sekolah;
// 			} 
// 			i++;
// 		}
// 		return "sekolah tidak ada"
// 	}
	
// 	let output= cariSekolah(biodata,req.params.jenjang);
//   res.send(output);
// });

// app.get('/runningtext', (req, res) => {

//   res.send({text:'dari express'});
// });

// app.get('/blogmobile', (req, res) => {

//   res.send(
//   	[{text:'initialPost1'}, {text:'initialPost2'}]
//   );
// });