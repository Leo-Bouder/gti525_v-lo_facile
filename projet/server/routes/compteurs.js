// routes/auth.js
const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    const limit = parseInt(req.query.limite) || 10;
    const page = parseInt(req.query.page) || 1;
    const minAnneeImplante = parseInt(req.query.implantation);
    const nomSearch = req.query.nom;
    const arrondissement = req.query.arrondissement;
    const statut = req.query.statut;
    const sortBy = req.query.sortBy || 'ID';
    const sortOrder = req.query.sortOrder || 'ASC';

    const offset = (page - 1) * limit;

    let sql = `SELECT * FROM compteurs WHERE 1=1`;

    const params = [];

    if (minAnneeImplante) {
        sql += ` AND Annee_implante >= ?`;
        params.push(minAnneeImplante);
    }

    if (nomSearch) {
        sql += ` AND Nom LIKE ?`;
        params.push(`%${nomSearch}%`);
    }

    if (arrondissement && arrondissement !== 'all') {
        sql += ` AND Arrondissement = ?`;
        params.push(arrondissement);
    }

    if (statut) {
        sql += ` AND Statut = ?`;
        params.push(statut);
    }

    // Validation du tri
    const allowedSortFields = ['ID', 'Nom', 'Statut', 'Annee_implante', 'Arrondissement'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'ID';
    const validSortOrder = allowedSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    sql += ` ORDER BY ${validSortBy} ${validSortOrder}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching compteurs:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        let countSql = `SELECT COUNT(*) AS total FROM compteurs WHERE 1=1`;
        const countParams = [];

        if (minAnneeImplante) {
            countSql += ` AND Annee_implante >= ?`;
            countParams.push(minAnneeImplante);
        }

        if (nomSearch) {
            countSql += ` AND Nom LIKE ?`;
            countParams.push(`%${nomSearch}%`);
        }

        if (arrondissement && arrondissement !== 'all') {
            countSql += ` AND Arrondissement = ?`;
            countParams.push(arrondissement);
        }

        if (statut) {
            countSql += ` AND Statut = ?`;
            countParams.push(statut);
        }

        db.get(countSql, countParams, (countErr, countRow) => {
            if (countErr) {
                console.error('Error fetching total count for compteurs:', countErr.message);
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
    const compteurId = parseInt(req.params.id);

    if (isNaN(compteurId)) {
        return res.status(400).json({ error: 'Invalid ID. Must be a number.' });
    }

    const sql = `SELECT * FROM compteurs WHERE ID = ?`;

    db.get(sql, [compteurId], (err, row) => {
        if (err) {
            console.error(`Error getting compteur ${id} :`, err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'Compteur not found.' });
        }

        res.status(200).json(row);
    });
});

router.get('/:id/passages', (req, res) => {
    const compteurId = parseInt(req.params.id);
    const debut = req.query.debut;
    const fin = req.query.fin;
    const intervalle = req.query.interval || 'jour'; // jour, semaine, mois

    if (isNaN(compteurId)) {
        return res.status(400).json({ error: 'Invalid counter ID. Must be a number.' });
    }

    let dateFormat;
    let groupByColumn;

    switch (intervalle) {
        case 'jour':
            groupByColumn = `strftime('%Y-%m-%d', date_heure)`;
            break;
        case 'semaine':
            groupByColumn = `strftime('%Y-%W', date_heure)`;
            break;
        case 'mois':
            groupByColumn = `strftime('%Y-%m', date_heure)`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid interval. Must be "jour", "semaine", or "mois".' });
    }

    let sql = `
        SELECT
            ${groupByColumn} AS periode,
            SUM(nb_passages) AS total_passages
        FROM
            comptage_velo
        WHERE
            id_compteur = ?
    `;
    const params = [compteurId];

    if (debut) {
        sql += ` AND date_heure >= ?`;
        params.push(debut);
    }

    if (fin) {
        sql += ` AND date_heure <= ?`;
        params.push(fin);
    }

    sql += ` GROUP BY periode ORDER BY periode ASC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching passages data:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No passage data found for this counter with the given criteria.' });
        }

        res.status(200).json(rows);
    });
});

module.exports = router;
