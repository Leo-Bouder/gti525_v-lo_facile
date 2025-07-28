const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const dbPath = path.join(__dirname, 'data', 'comptage_velo.db');

const db = new sqlite3.Database(dbPath, (err)=> {
    if(err){
        console.error('Erreur de connexion SQLite:', err.message);
    }else{
        console.log('Connexion SQLite reussie');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table checked/created.');
        }
    });

    function importCsvData(tableName, csvFilePath, columns, transformData = (data) => data) {
        db.get(`SELECT COUNT(*) AS count FROM ${tableName}`, (err, row) => {
            if (err) {
                console.error(`Error checking count for ${tableName}:`, err.message);
                return;
            }
            if (row.count === 0) {
                console.log(`${tableName} table is empty, importing data from ${csvFilePath}...`);
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on('data', (data) => {
                        const transformed = transformData(data);
                        const placeholders = columns.map(() => '?').join(', ');
                        const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                        const values = columns.map(col => transformed[col]);

                        db.run(insertSql, values, function(insertErr) {
                            if (insertErr) {
                                console.error(`Error inserting data into ${tableName}:`, insertErr.message, 'Data:', JSON.stringify(data));
                            }
                        });
                    })
                    .on('end', () => {
                        console.log(`${tableName} data import finished.`);
                    })
                    .on('error', (readErr) => {
                        console.error(`Error reading ${csvFilePath}:`, readErr.message);
                    });
            } else {
                console.log(`${tableName} table already has data, skipping import.`);
            }
        });
    }

    // Create the compteurs table if it doesn't exist and import data
    db.run(`
        CREATE TABLE IF NOT EXISTS compteurs (
          ID INTEGER PRIMARY KEY,
          Ancien_ID TEXT,
          Nom TEXT,
          Statut TEXT,
          Latitude REAL,
          Longitude REAL,
          Annee_implante INTEGER,
          Arrondissement TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating compteurs table:', err.message);
            return;
        }
        console.log('Compteurs table checked/created.');
        const compteursColumns = ['ID', 'Ancien_ID', 'Nom', 'Statut', 'Latitude', 'Longitude', 'Annee_implante', 'Arrondissement'];
        const compteursCsvPath = "./data/compteurs.csv";
        importCsvData('compteurs', compteursCsvPath, compteursColumns, (data) => ({
            ID: parseInt(data.ID),
            Ancien_ID: data.Ancien_ID || null,
            Nom: data.Nom,
            Statut: data.Statut,
            Latitude: parseFloat(data.Latitude),
            Longitude: parseFloat(data.Longitude),
            Annee_implante: parseInt(data.Annee_implante),
            Arrondissement: data.Arrondissement
        }));
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS points_interets (
          ID INTEGER PRIMARY KEY,
          Arrondissement TEXT,
          Nom_parc_lieu TEXT,
          Proximite_jeux_repere TEXT,
          Intersection TEXT,
          Etat TEXT,
          Date_installation TEXT,
          Remarque TEXT,
          Precision_localisation TEXT,
          X REAL,
          Y REAL,
          Longitude REAL,
          Latitude REAL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating points_interets table:', err.message);
            return;
        }
        console.log('Points_interets table checked/created.');
        const pointsInteretsColumns = [
            'ID', 'Arrondissement', 'Nom_parc_lieu', 'Proximite_jeux_repere',
            'Intersection', 'Etat', 'Date_installation', 'Remarque',
            'Precision_localisation', 'X', 'Y', 'Longitude', 'Latitude'
        ];
        const pointsInteretsCsvPath = "./data/fontaines.csv";
        importCsvData('points_interets', pointsInteretsCsvPath, pointsInteretsColumns, (data) => ({
            ID: parseInt(data.ID),
            Arrondissement: data.Arrondissement,
            Nom_parc_lieu: data.Nom_parc_lieu,
            Proximite_jeux_repere: data['Proximité_jeux_repère'],
            Intersection: data.Intersection,
            Etat: data.Etat,
            Date_installation: data.Date_installation,
            Remarque: data.Remarque,
            Precision_localisation: data.Precision_localisation,
            X: parseFloat(data.X),
            Y: parseFloat(data.Y),
            Longitude: parseFloat(data.Longitude),
            Latitude: parseFloat(data.Latitude)
        }));
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS arrondissements (
          name TEXT,
          id INTEGER PRIMARY KEY,
          mat TEXT
        )
    `, (err) => {
        if (err) {
            console.error('Error creating arrondissements table:', err.message);
            return;
        }
        console.log('Arrondissements table checked/created.');
        const arrondissementsColumns = ['name', 'id', 'mat'];
        const arrondissementsCsvPath = "./data/territoires.csv";
        importCsvData('arrondissements', arrondissementsCsvPath, arrondissementsColumns, (data) => ({
            name: data.name,
            id: parseInt(data.id),
            mat: data.mat
        }));
    });
});

module.exports = db;
