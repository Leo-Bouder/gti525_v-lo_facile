const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const fs = require('fs')
const csv = require('csv-parser')
const authRoutes = require('./routes/auth');
const compteursRoutes = require('./routes/compteurs');
const poiRoutes = require('./routes/points_interets');
const pistesRoutes = require('./routes/pistes');


const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.use('/gti525/v1/auth', authRoutes);
app.use('/gti525/v1/compteurs', compteursRoutes);
app.use('/gti525/v1/pointsdinteret', poiRoutes);
app.use('/gti525/v1', pistesRoutes);

app.get('/gti525/v1/compteurs', (req, res)=>{
    const results = [];
    const csvPath = path.join(__dirname, './data/compteurs.csv'); 
    fs.createReadStream(csvPath).pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', ()=>{
        res.json(results);
    })
    .on('error', (err)=>{
        console.error('Erreur lors de la lecture du csv compteurs', err);
        res.status(500).json({error: 'Erreur serveur'});
    });
});

app.get('/gti525/v1/pointsdinteret', (req, res)=>{
    const results = [];
    const csvPath = path.join(__dirname, './data/fontaines.csv');
    fs.createReadStream(csvPath).pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', ()=>{
        res.json(results);
    })
    .on('error', (err)=>{
        console.error('Erreur lors de la lecture du csv pointsdinteret', err);
        res.status(500).json({error: 'Erreur serveur'});
    });
});

app.get('/gti525/v1/territoires', (req, res)=>{
    const results = [];
    const csvPath = path.join(__dirname, './data/territoires.csv');
    fs.createReadStream(csvPath).pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', ()=>{
        res.json(results);
    })
    .on('error', (err)=>{
        console.error('Erreur lors de la lecture du csv territoires', err);
        res.status(500).json({error: 'Erreur serveur'});
    });
});

app.get('/gti525/v1/territoiresGeo', (req, res)=>{
    const geojsonPath = path.join(__dirname, './data/territoires.geojson');
    fs.readFile(geojsonPath, 'utf8', (err,data)=>{
        if(err){
            console.error('Erreur lors de la lecture du fichier territoires.geojson:', err);
            return res.status(500).json({error: 'Erreur serveur' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});


//À TERMINER
app.get('/gti525/v1/', (req, res) => {
  res.json({
    message: 'Available API endpoints',
    endpoints: [
      { method: 'POST', path: '/gti525/v1/auth/signup' },
      { method: 'POST', path: '/gti525/v1/auth/login' }
    ],
  });
});

app.listen(PORT, () =>{
    console.log(`Serveur GTI525 backend en marche sur http://localhost:${PORT}`);
});