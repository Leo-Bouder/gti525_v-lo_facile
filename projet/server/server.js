const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const { error } = require('console');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get('/gti525/v1/test', (req, res) =>{
    res.json({message: 'API GTI525 FONCTIONNEL'});
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
            res.status(500).json({error: "Erreur lors de la recupperation des donnees"});
        }else{
            res.json(rows);
        }
    });
});

app.listen(PORT, () =>{
    console.log(`Serveur GTI525 backend en marche sur http://localhost:${PORT}`);
});