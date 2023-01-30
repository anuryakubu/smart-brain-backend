const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const sqlite = require('sqlite3')
const knex = require('knex')
const Clarifai = require("clarifai")
const bcrypt = require('bcrypt-nodejs')
//const pg = require('pg')

//const db = new sqlite.Database('../facialRecognition-Database/facial.db')

const appClarifai = new Clarifai.App({
    apiKey: '1ef3179ace574b09a10f27fa14f1fa01'
   });

const postgres = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'amiryakubu',
    password : '',
    database : 'facial'
  }
})
app.use(cors())
app.use(bodyParser.json())


const PORT = 3000

app.get('/', (req, res) => {
    
    postgres('userdb').select('*')
    .then(users => res.send(users))
    
})

app.post('/signin', (req, res) => {
    
console.log(req.body)
    
const email = req.body.email
const password = req.body.password
console.log(email)
console.log(password)
 
//postres           
postgres('userdb').select('*').where({
    email, password
    }).then( user => {
        res.json(user[0])
    })

// sqlite
/*db.get(`SELECT * FROM userdb WHERE email="${email}" AND password="${password}"`, (err, row) => {
            if(err) {
        return console.error(err.message)}
        res.json(row)
        })*/
            
})


app.post('/register', (req, res) => {
    const {name, email, password} = req.body
    
   //postgres
   postgres('userdb')
   .returning('*')
    .insert({
        name, email, password, joined: new Date()
    })
    .then(user => {
        console.log(user[0])
        res.json(user[0]);
    })
    .catch(err => {
        res.status(400).json('error');
    })

    //sqlite
    /*db.run(`INSERT INTO userdb (name, email, password)
                VALUES ($name, $email, $password);`,
                {
                    $name: name,
                    $email: email,
                    $password: password
                }, (err, row) => {
                    if(err) {
                return console.error(err.message)}
                    res.json(row)
                })*/
    
})

app.put('/image', (req, res) => {

    const {id} = req.body

//postgres
postgres('userdb').where('id', '=', id)
.increment('entries', 1)
.returning('entries')
.then(entries => {
    res.json(entries[0].entries)
});

//sqlite                
/* db.run(`UPDATE userdb SET entries = (entries + 1)  WHERE id="${id}"`, (err) => {
    if(err) {
        return console.error(err.message)}
        
        db.get(`SELECT * FROM userdb WHERE id=${id}`, (err, row) => {
            if(err) {
        return console.error(err.message)}
        res.json(row.entries)
        })
        
    })*/
    
})

app.post('/imageurl', (req, res) => {

    appClarifai.models
    .predict(
      {
        id: 'face-detection',
        name: 'face-detection',
        version: '6dc7e46bc9124c5c8824be4822abe105',
        type: 'visual-detector',
      },
      req.body.input      
    ).then(data => {
        return res.json(data)
    }).catch(err => res.status(400).json('Can\t work with API'))

})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;

    postgres.select('*').from('userdb').where({id})
    .then(user => {
        if(user.length) {
            res.json(user[0])
        } else {
            res.status('400').json('Not Found')
        }
    })
    .catch(err => res.status('400').json('Not Available'));

})

app.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT)
})


/*
/----> GET, res => data.users
/signin ---> POST, res => "success"
/register -----> POST, res => user registered
/profile


*/