const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/pistes', (req, res)=> {
    const {populaireDebut, populaireFin} = req.query;

    if(populaireDebut && populaireFin){
        const sqlPopularite = `
            SELECT c.Arrondissement AS arrondissement,
                SUM(cv.nb_passages) AS total_passages,
                COUNT(DISTINCT cv.id_compteur) AS nb_compteurs
            FROM comptage_velo cv
            JOIN compteurs c ON cv.id_compteur = c.ID
            WHERE cv.date_heure BETWEEN ? AND ?
            GROUP BY c.Arrondissement
        `;
        console.log('Debut:', populaireDebut, 'Fin', populaireFin);
        db.all(sqlPopularite, [populaireDebut, populaireFin], (err,rows)=>{
            if(err){
            console.error('Erreur SQL:', err.message);
             return res.status(500).json({ error: 'Erreur serveur popularite'});
        }
        const ratios = rows.map(r=>({
            arrondissement: r.arrondissement,
            ratio: r.total_passages / r.nb_compteurs
        }));

        const top3 = ratios.sort((a, b) => b.ratio - a.ratio)
        .slice(0, 3)
        .map(r => r.arrondissement);

        console.log("TOP 3: ", top3);

        db.get('SELECT geojson FROM pistes_cyclables WHERE id = 1', (err, row) =>{
            if(err){
                console.error('Erreur lecture GeoJSON:', err.message);
                 return res.status(500).json({ error: 'Erreur lecture GeoJSON'});
            }

            if(!row){
                return res.status(404).json({error: 'Aucune donnee GeoJSON trouvee'});
            }

            let geojson;
            try{
                geojson = JSON.parse(row.geojson);
            } catch(parseErr){
                console.error('Erreur parsing GeoJSON:', parseErr.message);
                return res.status(500).json({ error: 'Erreur format GeoJSON'});
            }

            const filtered = geojson.features.filter(f =>
                top3.includes(f.properties['NOM_ARR_VILLE_DESC'])
            );

            return res.status(200).json({
                type: 'FeatureCollection',
                features: filtered
            });
        });
    });
    } else{
        db.get("SELECT geojson FROM pistes_cyclables WHERE id = 1", (err,row)=>{
            if(err){
                console.error('Erreur lecture geojson:', err.message);
                return res.status(500).json({ error: 'Erreur lecture GeoJSON'});
            } 
        
            if (!row){
                return res.status(404).json({ error: 'GeoJSON non trouve'});
            }
        
            let geojson;
            try{
                geojson = JSON.parse(row.geojson);
            } catch(parseErr){
                console.error('Erreur parsing JSON:', parseErr.message);
                return res.status(500).json({ error: 'Erreur de parsing JSON'});
            }
            return res.status(200).json(geojson);
        });
    }
});

module.exports = router;