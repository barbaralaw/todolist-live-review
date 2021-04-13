// Declares and assigns constant 'express' to the module express
const express = require('express')
// Declares and assigns constant 'app' to the active function express() so we don't have to write it out constantly
const app = express()
// Declares and assigns constant 'MongoClient' to the mongodb MongoClient
const MongoClient = require('mongodb').MongoClient
// Declares and assigns 'PORT' to 2121, it could be any number really but 2121 is funny
const PORT = 2121
// Imports the module dotenv to allow environment files
require('dotenv').config()

// setting up our database information in the file
let db,
    // sets local variable 'dbConnectionStr' to secret env string 'DB_STRING', abstracting the details from view
    dbConnectionStr = process.env.DB_STRING,
    // sets our database name to 'todo' because our data will all be tasks to do
    dbName = 'todo'

// connects us beautifully and neatly to our cloud-based database. useUnifiedTopology is some sorcery that deals with shenanigans that could otherwise occur
MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    // if all goes well, this arrow function will be called
    .then(client => {
        // Console logs that we're connected our database and gives some piece of mind
        console.log(`Hey, connected to ${dbName} database`)
        // Sets 'db' to the mongo atlas database name (I think)
        db = client.db(dbName)
    })
    // if all anything doesn't go well, this arrow function will be called
    .catch(err =>{
        // Console logs given error
        console.log(err)
    })

// Tells the app that we're using 'ejs' as our templating language
app.set('view engine', 'ejs')
// General sorcery?
app.use(express.static('public'))
// Continued magic?
app.use(express.urlencoded({ extended: true }))
// Telling app to use that sweet, sweet json
app.use(express.json())

// This is our get that runs when page loads or reloads
app.get('/', async (req,res)=>{
    // declares and sets todoItems to an array of the todos in our cloud database
    const todoItems = await db.collection('todos').find().toArray()
    // declares and sets itemsLeft to the number of items left marked uncomplete in our database  (is it the number? I need to look it up)
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    // after the other items go through, we render our ejs file with the data we just assigned to variables
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft})
})


app.post('/createTodo', (req, res)=>{
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
    .then(result =>{
        console.log('Todo has been added!')
        res.redirect('/')
    })
})

app.put('/markComplete', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: true
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.put('/undo', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn},{
        $set: {
            completed: false
        }
    })
    .then(result =>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.delete('/deleteTodo', (req, res)=>{
    db.collection('todos').deleteOne({todo:req.body.rainbowUnicorn})
    .then(result =>{
        console.log('Deleted Todo')
        res.json('Deleted It')
    })
    .catch( err => console.log(err))
})

// This is the port our server is running on - either our abstracted heroku port or 2121
app.listen(process.env.PORT || PORT, ()=>{
    // Dad joke
    console.log('Server is running, you better catch it!')
})
