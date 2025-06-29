const express = require('express');
const path = require('path');
const cors = require('cors');
require('./database');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get('/gti525/v1/test', (req, res) =>{
    res.json({message: 'API GTI525 FONCTIONNEL'});
});

app.listen(PORT, () =>{
    console.log(`Serveur GTI525 backend en marche sur http://localhost:${PORT}`);
});