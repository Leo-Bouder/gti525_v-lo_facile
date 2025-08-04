// routes/auth.js
const express = require('express');
const db = require('../database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Endpoint pour récupérer tous les arrondissements
router.get('/arrondissements', (req, res) => {
    const sql = `SELECT name, id, mat FROM arrondissements ORDER BY name`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching arrondissements:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(200).json(rows);
    });
});

router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const typeSearch = req.query.type;
    const territoireSearch = req.query.territoire;
    const nomSearch = req.query.nom;

    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM points_interets WHERE 1=1`;
    const params = [];

    if (typeSearch) {
        sql += ` AND Type LIKE ?`;
        params.push(`%${typeSearch}%`);
    }

    if (territoireSearch) {
        sql += ` AND Arrondissement LIKE ?`;
        params.push(`%${territoireSearch}%`);
    }

    if (nomSearch) {
        sql += ` AND Nom_parc_lieu LIKE ?`;
        params.push(`%${nomSearch}%`);
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching points d\'intérêt:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        let countSql = `SELECT COUNT(*) AS total FROM points_interets WHERE 1=1`;
        const countParams = [];

        if (typeSearch) {
            countSql += ` AND Type LIKE ?`;
            countParams.push(`%${typeSearch}%`);
        }

        if (territoireSearch) {
            countSql += ` AND Arrondissement LIKE ?`;
            countParams.push(`%${territoireSearch}%`);
        }

        if (nomSearch) {
            countSql += ` AND Nom_parc_lieu LIKE ?`;
            countParams.push(`%${nomSearch}%`);
        }

        db.get(countSql, countParams, (countErr, countRow) => {
            if (countErr) {
                console.error('Error fetching total count for points d\'intérêt:', countErr.message);
                return res.status(200).json({
                    data: rows,
                    pagination: {
                        limit: limit,
                        page: page,
                        total_results: null,
                        total_pages: null
                    }
                });
            }

            const totalResults = countRow.total;
            const totalPages = Math.ceil(totalResults / limit);

            res.status(200).json({
                data: rows,
                pagination: {
                    limit: limit,
                    page: page,
                    total_results: totalResults,
                    total_pages: totalPages
                }
            });
        });
    });
});

router.get('/:id', (req, res) => {
    const pointId = parseInt(req.params.id);

    if (isNaN(pointId)) {
        return res.status(400).json({ error: 'Invalid point of interest ID. Must be a number.' });
    }

    const sql = `SELECT * FROM points_interets WHERE ID = ?`;

    db.get(sql, [pointId], (err, row) => {
        if (err) {
            console.error('Error fetching point d\'intérêt:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Point of interest not found.' });
        }

        res.status(200).json(row);
    });
});

router.post('/', authenticateToken, (req, res) => {
    console.log(req.headers);
    const { Arrondissement, Type, Nom_parc_lieu, Proximite_jeux_repere, Intersection, Etat, Date_installation, Remarque, Precision_localisation, X, Y, Longitude, Latitude } = req.body;

    if (!Arrondissement || !Nom_parc_lieu || !Proximite_jeux_repere || !Longitude || !Latitude || !Type) {
        return res.status(400).json({ error: 'Missing required fields: Arrondissement, Type, Nom_parc_lieu, Proximite_jeux_repere, Longitude ou Latitude.' });
    }

    const sql = `INSERT INTO points_interets (Arrondissement, Type, Nom_parc_lieu, Proximite_jeux_repere, Intersection, Etat, Date_installation, Remarque, Precision_localisation, X, Y, Longitude, Latitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [Arrondissement, Type, Nom_parc_lieu, Proximite_jeux_repere, Intersection || null, Etat || null, Date_installation || null, Remarque || null, Precision_localisation || null, X || null, Y || null, Longitude || null, Latitude || null];

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error inserting new point d\'intérêt:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ ID: this.lastID, ...req.body });
    });
});

router.patch('/:id', authenticateToken, (req, res) => {
    const pointId = parseInt(req.params.id);
    const updates = req.body;

    if (isNaN(pointId)) {
        return res.status(400).json({ error: 'Invalid point of interest ID. Must be a number.' });
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields provided for update.' });
    }

    let setClauses = [];
    let params = [];
    for (const key in updates) {
        if (key !== 'ID') {
            setClauses.push(`${key} = ?`);
            params.push(updates[key]);
        }
    }

    if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
    }

    params.push(pointId);

    const sql = `UPDATE points_interets SET ${setClauses.join(', ')} WHERE ID = ?`;

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Error updating point d\'intérêt:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Point of interest not found or no changes made.' });
        }

        db.get(`SELECT * FROM points_interets WHERE ID = ?`, [pointId], (getErr, row) => {
            if (getErr) {
                console.error('Error fetching updated point d\'intérêt:', getErr.message);
                return res.status(500).json({ error: 'Internal server error after update.' });
            }
            res.status(200).json(row);
        });
    });
});

router.delete('/:id', authenticateToken, (req, res) => {
    const pointId = parseInt(req.params.id);

    if (isNaN(pointId)) {
        return res.status(400).json({ error: 'Invalid point of interest ID. Must be a number.' });
    }

    const sql = `DELETE FROM points_interets WHERE ID = ?`;

    db.run(sql, [pointId], function(err) {
        if (err) {
            console.error('Error deleting point d\'intérêt:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Point of interest not found.' });
        }

        res.status(204).send();
    });
});

module.exports = router;
