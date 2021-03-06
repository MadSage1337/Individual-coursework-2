
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();
const path = require("path");

app.use(cors());

app.use(express.json());


app.use(function(request, response, next) {
    console.log("In comes a request to: " + request.url);
    next();
});

var imagePath = path.resolve(__dirname, "image");
app.use(express.static(imagePath));


const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb+srv://Emmanuel:Manny230@cluster0.tdj3z.mongodb.net',(err, client) =>{
    db = client.db('webstore');
})


app.get('/', (req, res, next) =>{
    res.send('Select a collection, e.g /collection/messages')
})


app.param('collectionName', (req, res, next, collectionName) => {

    req.collection = db.collection(collectionName)

    return next()

})


app.get('/collection/:collectionName', (req, res, next) => {

    req.collection.find({}).toArray((e, results) => {

        if (e) return next(e)

        res.send(results)

    })

})


app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if(e) return next(e)
        res.send(results.ops)
    })
})


const ObjectID = require('mongodb').ObjectID;

 

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})



app.put('/collection/:collectionName/:id', (req, res, next) => {
    let les = req.body;
    req.collection.update(
    {_id: new ObjectID(req.params.id)},
    {$set: { numberofspace: les.numberofspace }},
    {safe: true, multi: false},
    (e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    })
 })


app.use(function(request, response, next) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Error: Looks like you did not find the file you were looking for");
});

const port = process.env.PORT || 3000;


app.listen(port);