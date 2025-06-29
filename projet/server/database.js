const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'comptage_velo.db');

const db = new sqlite3.Database(dbPath, (err)=> {
    if(err){
        console.error('Erreur de connexion SQLite:', err.message);
    }else{
        console.log('Connexion SQLite reussie');
    }
});

module.exports = db;