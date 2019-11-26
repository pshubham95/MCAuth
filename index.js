const express = require('express');

const app = express();
const sha1 = require('sha1');

const bodyParser = require('body-parser')
app.use(bodyParser());

const { Pool, Client } = require('pg')
let connectionString = 'postgresql://postgres:shubham123@localhost:5432/postgres'
if (process.env.PORT) {
    connectionString = 'postgres://edmchzqbslnnkd:a4a08b5b48f1e0f7bb62e3a955035e51040e37ec6d01ee9eedafece32cd48795@ec2-54-221-214-3.compute-1.amazonaws.com:5432/dclp5tqns7js4f';
}
const pool = new Pool({
    connectionString: connectionString,
})
pool.query('SELECT NOW()', (err, res) => {
    //console.log(err, res)
    pool.end()
})

app.post('/registerUser', (req, resp) => {
    const { firstName, lastName, username, password } = req.body;
    const arr = [firstName, lastName, username, password];
    if (arr.filter(e => e === null || e === undefined || e.trim() === '').length > 0) {
        resp.status(400).json({ err: 'Check input json, some values are missing' });
        return;
    }
    const text = 'INSERT INTO user_details(firstname, lastname, username, password) VALUES($1, $2, $3, $4)';
    arr[3] = sha1(arr[3]);
    //console.log(arr)
    client.query(`SELECT id from user_details where username = '${username}'`).then(res => {
        if (res.rows.length > 0) {
            resp.status(500).json({ 'error': 'Username already exists' });
            return;
        } else {
            client
                .query(text, arr)
                .then(res => {
                    resp.status(200).json({ 'message': 'Row successfully inserted' })
                    // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
                })
                .catch(e => {
                    resp.status(500).json({ error: e.stack });
                })
        }
    })

    //res.status(200).json(req.body)
})

app.post('/login', (req, resp) => {
    const {username, password} = req.body;
    const arr = [username, password];
    if (arr.filter(e => e === null || e === undefined || e.trim() === '').length > 0) {
        resp.status(500).json({err: 'Provide username and password'});
        return;
    }
    const shapass = sha1(password);
    client.query(`SELECT id from user_details where password = '${shapass}' and username ='${username}'`).then(res => {
        if (res.rows.length > 0) {
            console.log(res.rows)
            resp.status(200).json({'status': 'authentication successful', id: res.rows[0].id});
            return;
        } else {
            resp.status(401).json({'err': 'Incorrect credentials'});
            return;
        }
    }).catch(e => resp.status(500).json({err: e.stack}))
});

const client = new Client({
    connectionString: connectionString,
})
client.connect()
app.listen(process.env.PORT || 3000, () =>{
    console.log('server running');
});

function cleanup() {
    client.end()
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);