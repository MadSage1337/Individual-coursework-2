
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();
const path = require("path");

app.use(cors());

app.use(express.json());

//logger middleware

app.use(function(request, response, next) {
    console.log("In comes a request to: " + request.url);
    next();
});

//static file middleware
var imagePath = path.resolve(__dirname, "image");
app.use(express.static(imagePath));


//connect to MongoDB

const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb+srv://Emmanuel:Manny230@cluster0.tdj3z.mongodb.net',(err, client) =>{
    db = client.db('webstore');
})


app.get('/', (req, res, next) =>{
    res.send('Select a collection, e.g /collection/messages')
})

//get collection name
//look up what app.param does
app.param('collectionName', (req, res, next, collectionName) => {

    req.collection = db.collection(collectionName)

    // console.log('collection name:', req.collection)

    return next()

})

//retrieve all the objects from a collection

app.get('/collection/:collectionName', (req, res, next) => {

    req.collection.find({}).toArray((e, results) => {

        if (e) return next(e)

        res.send(results)

    })

})

//adding post
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if(e) return next(e)
        res.send(results.ops)
    })
})

//return with object id
const ObjectID = require('mongodb').ObjectID;

 

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e)
        res.send(result)
    })
})


//update an object finding the object by id
app.put('/collection/:collectionName/:id', (req, res, next) => {
    let lesson = req.body;
    req.collection.update(
    {_id: new ObjectID(req.params.id)},
    {$set: { numberOfSpaces: lesson.numberOfSpaces }},
    {safe: true, multi: false},
    (e, result) => {
    if (e) return next(e)
    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
    })
 })

//file not found middleware

app.use(function(request, response, next) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Error: Looks like you did not find the file you were looking for");
});

const port = process.env.PORT || 3000;


app.listen(port);