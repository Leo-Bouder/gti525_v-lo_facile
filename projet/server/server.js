const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const fs = require('fs')
const csv = require('csv-parser')
const { error } = require('console');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

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

app.get('/gti525/v1/compteurs/:id', (req,res)=>{
    const compteurId = req.params.id;
    const debut = req.query.debut;
    const fin = req.query.fin;
    
    let query = `SELECT * FROM comptage_velo WHERE id_compteur = ?`;
    let params = [compteurId];

    if(debut && fin){
        query += ` AND date_heure BETWEEN ? AND ?`;
        params.push(debut, fin);
    }

    db.all(query, params, (err, rows)=>{
        if(err){
            console.error(err);
            res.status(500).json({error: "Erreur lors de la recupperation des donnees des compteurs"});
        }else{
            res.json(rows);
        }
    });
});

app.get('/gti525/v1/pistes', (req, res)=>{
    const geojsonPath = path.join(__dirname, './data/reseau_cyclable.geojson');
    fs.readFile(geojsonPath, 'utf8', (err,data)=>{
        if(err){
            console.error('Erreur lors de la lecture du fichier reseau_cyclable:', err);
            return res.status(500).json({error: 'Erreur serveur' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
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

app.listen(PORT, () =>{
    console.log(`Serveur GTI525 backend en marche sur http://localhost:${PORT}`);
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

app.listen(PORT, () =>{
    console.log(`Serveur GTI525 backend en marche sur http://localhost:${PORT}`);
});