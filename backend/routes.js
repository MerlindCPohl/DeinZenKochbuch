const express = require('express');
const router = express.Router();
const client = require('./db');

function ersetzeFuerSuche(text) {
    return text
        .replace(/ß/g, 'ss')
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/Ä/g, 'Ae')
        .replace(/Ö/g, 'Oe')
        .replace(/Ü/g, 'Ue');
}

// POST User einloggen
router.post('/users/login', async (req, res) => {
    const { name, passwort } = req.body;
    try {
        // überprüft ob nutzer*in eyistiert
        const userQuery = 'SELECT * FROM users WHERE name = $1';
        const userResult = await client.query(userQuery, [name]);

        if (userResult.rows.length === 0) {
            // Benutzername existiert nicht
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }

        // Überprüfen, ob das Passwort korrekt ist
        const user = userResult.rows[0];
        if (user.passwort !== passwort) {
            // Falsches Passwort
            return res.status(401).json({ message: 'Ungültige Anmeldedaten' });
        }

        // Login erfolgreich
        res.json({
            message: 'Login erfolgreich',
            userId: user.id,
            name: user.name,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Serverfehler beim Login' });
    }
});

// GET Benutzer*in mit Passwort und Name
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'User nicht gefunden' });
        }
    } catch (err) {
        console.error('Fehler beim Abrufen des Users:', err);
        res.status(500).json({ message: 'Serverfehler' });
    }
});


// GET alle Rezepte
router.get('/rezepte', async(req, res) => {
    console.log("GET /rezepte aufgerufen");
    try {
        const result = await client.query(`SELECT * FROM rezepte`);
        console.log("Ergebnis (alle Rezepte):", result.rows.length);
        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Fehler beim Laden aller Rezepte:', err);
        res.status(500).send('Fehler beim Abrufen der Rezepte');
    }
});

// GET ein spezifisches Rezept
router.get('/rezeptdetail/:id', async (req, res) => {
    const rezeptId = req.params.id;

    const rezeptQuery = `
        SELECT id, name, vegan, vegetarisch, glutenfrei, rohkost, anleitung, anzahlportionen, zubereitungszeitmin
        FROM rezepte
        WHERE id = $1
    `;


    const zutatenQuery = `
        SELECT z.id, z.name, b.menge, z.mengeneinheit
        FROM beinhaltet b
                 JOIN zutaten z ON b.zutaten_id = z.id
        WHERE b.rezepte_id = $1
    `;

    try {
        const rezeptResult = await client.query(rezeptQuery, [rezeptId]);

        if (rezeptResult.rows.length === 0) {
            return res.status(404).send('Rezept nicht gefunden');
        }


        const zutatenResult = await client.query(zutatenQuery, [rezeptId]);
        console.log('Zutaten-Query-Ergebnis:', zutatenResult.rows);

        const rezept = rezeptResult.rows[0];
        rezept.zutaten = zutatenResult.rows;
        console.log('Zutaten im Rezept:', rezept.zutaten);

        res.json(rezept);
    } catch (err) {
        console.error("Fehler beim Laden des Rezepts:", err.stack);
        res.status(500).send('Fehler beim Abrufen des Rezeptes');
    }
});


//GET eine spezifische zutat, damit autovervollästndigung im dropdowm funktioniert + mengeneinheit
router.get('/zutaten', async (req, res) => {
    const searchTerm = req.query.name;

    if (!searchTerm) {
        return res.status(400).send('Suchbegriff fehlt');
    }

    const query = `
        SELECT id, name, mengeneinheit
        FROM zutaten
        WHERE LOWER(name) ILIKE '%' || LOWER($1) || '%'`;

    try {
        const result = await client.query(query, [searchTerm]);
        res.send(result.rows);
    } catch (err) {
        console.error("Datenbankfehler:", err.stack);
        res.status(500).send('Serverfehler bei der Zutatensuche');
    }
});

// Post ein Rezept
router.post('/rezept', async (req, res) => {
    try {
            const {
            name,
            anleitung,
            anzahlportionen,
            zubereitungszeitmin,
            rohkost,
            vegan,
            vegetarisch,
            glutenfrei,
            zutaten,
            userId
        } = req.body;

        console.log('Zutaten beim POST:', zutaten);

        if (!userId) {
            return res.status(400).json({ error: 'User-ID fehlt' });
        }

        // Rezept einfügen
        const result = await client.query(
            'INSERT INTO rezepte (name, anleitung, anzahlportionen, zubereitungszeitmin, erstelltvon, rohkost, vegan, vegetarisch, glutenfrei) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [name, anleitung, anzahlportionen, zubereitungszeitmin, userId, rohkost, vegan, vegetarisch, glutenfrei]
        );

        const rezeptId = result.rows[0].id;

        // Zutaten speichern
        for (const zutat of zutaten) {
            try {
                console.log('Speichere Zutat:', zutat);
                await client.query(
                    'INSERT INTO beinhaltet (zutaten_id, rezepte_id, menge) VALUES ($1, $2, $3)',
                    [zutat.id, rezeptId, zutat.menge]
                );
            } catch (err) {
                console.error(`Fehler beim Speichern der Zutat:`, zutat, err);
            }

        }

        res.status(201).json({ message: 'Rezept gespeichert', rezeptId });

    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        res.status(500).json({ message: 'Fehler beim Speichern des Rezepts' });
    }
});

// POST einen neuen User
router.post('/users/neu', async(req, res) => {
    let { name, passwort } = req.body;

    if (!name || !passwort) {
        console.log('Fehlende Eingaben'); // Logging
        return res.status(400).json({ message: "Username und Passwort sind erforderlich" });
    }

    // Überprüfe Passwortanforderungen
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwort)) {
        console.log('Passwort erfüllt nicht die Anforderungen'); // Logging
        return res.status(400).json({ message: "Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Ziffer und ein Sonderzeichen enthalten" });
    }

    try {
        // Überprüfe, ob der Benutzer bereits existiert
        const userCheck = await client.query('SELECT * FROM users WHERE name = $1', [name]);
        console.log('Eingegangene Daten:', req.body);
        console.log('Benutzer existiert bereits:', userCheck.rows.length > 0); // Logging

        if (userCheck.rows.length > 0) {
            console.log('Benutzername bereits vergeben'); // Logging
            return res.status(400).json({ message: 'Benutzername bereits vergeben' });
        }

        // Füge den neuen Benutzer hinzu
        const query = `INSERT INTO users(name, passwort) VALUES ($1, $2) RETURNING id, name`;
        const result = await client.query(query, [name, passwort]);
        console.log('Neuer Benutzer erstellt:', result.rows[0]); // Logging

        res.status(201).json({
            message: "Benutzer erfolgreich registriert",
            user: { id: result.rows[0].id, name: result.rows[0].name }
        });
    } catch (err) {
        console.log('Fehler bei der Registrierung:', err.stack); // Logging
        res.status(500).json({ message: "Fehler bei der Registrierung" });
    }
});


// GET alle Rezepte eines users (meine rezepte)
router.get('/rezepteuser/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log("⚡ GET /rezepteuser aufgerufen mit userId:", userId);

    if (!userId) {
        console.log("❌ Keine User-ID angegeben");
        return res.status(400).json({ error: 'User-ID fehlt' });
    }

    try {
        const result = await client.query(
            'SELECT id, name FROM rezepte WHERE erstelltvon = $1',
            [userId]
        );
        console.log(`✅ Gefundene Rezepte für User ${userId}:`, result.rows.length);
        res.status(200).json(result.rows);
    } catch (err) {

        console.error('Fehler beim Laden der Rezepte des Users:', err);
        res.status(500).json({ error: 'Fehler beim Abrufen der Rezepte' });
    }
});


// DELETE ein spezifisches Rezept
router.delete('/deleterezepte/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.query('DELETE FROM beinhaltet WHERE rezepte_id = $1', [id]);
        await client.query('DELETE FROM rezepte WHERE id = $1', [id]);
        res.status(200).json({ message: 'Rezept erfolgreich gelöscht!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fehler beim Löschen des Rezepts' });
    }
});

// UPDATE Rezeptangaben - dynamisch,sodass nur geänderte werte gespeichert werden, aber egal welche werte, sonst brauchen wir mehree update methoden
router.put('/updaterezepte/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name,
        anleitung,
        anzahlportionen,
        zubereitungszeitmin,
        rohkost,
        vegan,
        vegetarisch,
        glutenfrei,
        zutaten
    } = req.body;

    try {
        // Rezeptfelder aktualisieren
        await client.query(`
            UPDATE rezepte SET
              name = $1,
              anleitung = $2,
              anzahlportionen = $3,
              zubereitungszeitmin = $4,
              rohkost = $5,
              vegan = $6,
              vegetarisch = $7,
              glutenfrei = $8
            WHERE id = $9
        `, [name, anleitung, anzahlportionen, zubereitungszeitmin, rohkost, vegan, vegetarisch, glutenfrei, id]);

        // Bestehende Zutaten löschen
        await client.query('DELETE FROM beinhaltet WHERE rezepte_id = $1', [id]);

        // Neue Zutaten einfügen
        for (const zutat of zutaten) {
            await client.query(`
              INSERT INTO beinhaltet (zutaten_id, rezepte_id, menge)
              VALUES ($1, $2, $3)
            `, [zutat.id, id, zutat.menge]);
        }
        console.log('Rezept-Update ID:', id);
        console.log('Neue Zutaten:', zutaten);


        res.status(200).json({ message: 'Rezept erfolgreich aktualisiert!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Rezepts' });
    }
});


//Test:
router.post('/test', express.json(), (req, res) => {
    console.log("Test-Route wurde aufgerufen!");
    res.send("Route funktioniert!");
});

// UPDATE das Passwort eines Users
router.put('/users/:id/passwort', async (req, res) => {
    const { id } = req.params;
    const { passwort } = req.body;
    if (!passwort) {
        res.status(400).send('Passwort ist erforderlich');
        return;
    }
    try {
        const query = `UPDATE users SET passwort = $1 WHERE id = $2 RETURNING *`;
        const result = await client.query(query, [passwort, id]);
        if (result.rows.length > 0) {
            res.send({ message: 'Passwort erfolgreich geändert' });
        } else {
            res.status(404).send('Benutzer*in nicht gefunden');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Ändern des Passworts');
    }
});

//für suchleiste unter alle rezepte
router.get('/rezepte/suche', async (req, res) => {
    const { begriff } = req.query;
    const normalisiert = ersetzeFuerSuche(begriff);
    const pattern = `%${normalisiert.toLowerCase()}%`;

    try {
        const result = await client.query(`
            SELECT DISTINCT r.*
            FROM rezepte r
            LEFT JOIN rezept_synonyme rs ON rs.rezepte_id = r.id
            LEFT JOIN beinhaltet b ON b.rezepte_id = r.id
            LEFT JOIN zutaten z ON z.id = b.zutaten_id
            LEFT JOIN zutat_synonyme zs ON zs.zutaten_id = z.id
            WHERE LOWER(r.name) LIKE $1
               OR LOWER(rs.synonyme) LIKE $1
               OR LOWER(z.name) LIKE $1
               OR LOWER(zs.synonyme) LIKE $1
        `, [pattern]);

        res.json(result.rows);
    } catch (err) {
        console.error("Fehler bei der Rezeptsuche:", err);
        res.status(500).json({ message: 'Fehler bei der Suche' });
    }
});

// autocomplete route
router.get('/suchvorschlaege', async (req, res) => {
    let query = req.query.query;
    console.log("Ursprünglicher Query:", query);
    if (!query || query.length < 3) {
        return res.status(400).json({ error: 'Zu kurzer Suchbegriff' });
    }

    query = ersetzeFuerSuche(query);
    console.log("Nach ersetzeFuerSuche:", query);

    const sqlPattern = `%${query}%`;
    console.log("SQL Pattern:", sqlPattern);

    try {
        const result = await client.query(`
            SELECT name AS begriff, 'rezeptname' AS typ FROM rezepte WHERE LOWER(name) ILIKE LOWER($1)
            UNION
            SELECT synonyme AS begriff, 'rezeptsynonym' AS typ FROM rezept_synonyme WHERE LOWER(synonyme) ILIKE LOWER($1)
            UNION
            SELECT name AS begriff, 'zutat' AS typ FROM zutaten WHERE LOWER(name) ILIKE LOWER($1)
            UNION
            SELECT synonyme AS begriff, 'zutatsynonym' AS typ FROM zutat_synonyme WHERE LOWER(synonyme) ILIKE LOWER($1)
        `, [`%${query}%`]);

        res.json(result.rows);
    } catch (err) {
        console.error('Fehler bei Suchvorschlägen:', err);
        res.status(500).json({ error: 'Fehler beim Abrufen der Vorschläge' });
    }
});

//get anfrage für monatsspezifische rezepte
router.get('/rezepte-saison/:monat', async (req, res) => {
    const monat = parseInt(req.params.monat, 10);
    console.log("GET /rezepte-saison aufgerufen mit Monat:", monat);

    if (isNaN(monat) || monat < 0 || monat > 11) {
        console.log("❌ Ungültiger Monatswert:", monat);
        return res.status(400).send('Ungültiger Monat');
    }

    try {
        const query = `
      SELECT r.*
      FROM rezepte r
      JOIN beinhaltet b ON r.id = b.rezepte_id
      JOIN zutaten z ON z.id = b.zutaten_id
      WHERE z.hatSaison = true
      AND z.verfuegbarkeit[($1 + 1)] = true
      GROUP BY r.id
    `;
        const result = await client.query(query, [monat]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Fehler bei /rezepte-saison/:monat:', error.message, error.stack);
        res.status(500).json({ message: error.message || 'Fehler beim Laden der Rezepte' });
    }
});



module.exports = router;
