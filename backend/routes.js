const express = require('express');
const router = express.Router();
const client = require('./db');


// Login-Endpunkt
router.post('/login', async (req, res) => {
    const { name, passwort } = req.body;
    try {
        const userQuery = 'SELECT * FROM users WHERE name = $1';
        const userResult = await client.query(userQuery, [name]);

        if (userResult.rows.length === 0) {
            // user not found
            return res.status(404).json({ message: 'User nicht gefunden' });
        }

        const user = userResult.rows[0];

        if (user.passwort !== passwort) {
            // Passwort stimmt nicht überein
            return res.status(401).json({ message: 'Falsches Passwort' });
        }

        // Login erfolgreich
        res.json({
            message: 'Login erfolgreich',
            userId: user.id,
            name: user.name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Fehler beim Login' });
    }
});


// POST User einloggen
router.post('/users/login', async (req, res) => {
    const { name, passwort } = req.body;
    try {
        // Überprüfen, ob der Benutzer existiert
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

// GET alle Rezepte
router.get('/rezepte', async(req, res) => {
    const query = `SELECT * FROM rezepte`;
    try {
        const result = await client.query(query)
        console.log(result)
        res.send(result.rows);
    } catch (err) {
        console.log(err.stack)
        res.status(500).send('Fehler beim Abrufen der Rezepte');
    }
});

// GET ein spezifisches Rezept
router.get('/rezepte/:id', async (req, res) => {
    const query = `SELECT r.name AS rezept, z.name AS zutat, b.menge
                   FROM beinhaltet b
                   JOIN zutaten z ON b.zutaten_id = z.id
                   JOIN rezepte r ON b.rezepte_id = r.id
                   WHERE b.rezepte_id = $1;`;
    try {
        const rezeptId = req.params.id;
        const result = await client.query(query, [rezeptId]);
        res.send(result.rows);
    } catch (err) {
        console.log("error", err.stack)
        res.status(500).send('Fehler beim Abrufen des Rezeptes');
    }
});

//GET eine spezifische zutat, damit autovervollästndigung im dropdowm funktioniert
router.get('/zutaten', async (req, res) => {
    const searchTerm = req.query.name;

    if (!searchTerm) {
        return res.status(400).send('Suchbegriff fehlt');
    }
    const query = `SELECT * FROM zutaten
                   WHERE name ILIKE '%' || $1 || '%'`;

    try {
        const result = await client.query(query, [searchTerm]);
        res.send(result.rows);
    } catch (err) {
        console.error("Datenbankfehler:", err.stack);
        res.status(500).send('Serverfehler bei der Zutatensuche');
    }
});

// Post ein rezept
router.post('/rezept', async (req, res) => {
    const { name, anleitung, anzahlPortionen, zubereitungsZeitMin, rohkost, vegan, vegetarisch, glutenfrei, zutaten, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User-ID fehlt' });
    }

    try {
        // Rezept einfügen
        const result = await client.query(
            'INSERT INTO rezepte (name, anleitung, anzahlPortionen, zubereitungsZeitMin, erstelltVon, rohkost, vegan, vegetarisch, glutenfrei) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, anleitung, anzahlPortionen, zubereitungsZeitMin, userId, rohkost, vegan, vegetarisch, glutenfrei]
        );

        const rezeptId = result.insertId; // automatisch generierte ID des Rezepts

        // Zutaten speichern
        for (const zutat of zutaten) {
            await db.query(
                'INSERT INTO beinhaltet (zutaten_id, rezepte_id, menge) VALUES (?, ?, ?)',
                [zutat.id, rezeptId, zutat.menge]
            );
        }

        res.status(201).json({ message: 'Rezept gespeichert', rezeptId });
    } catch (error) {
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

// DELETE ein spezifisches Rezept
router.delete('/rezepte/:id', async (req, res) => {
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
router.put('/rezepte/:id', async (req, res) => {
    const { id } = req.params;
    const { anleitung, zutaten } = req.body;
    try {
        if (anleitung) {
            await client.query('UPDATE rezepte SET anleitung = $1 WHERE id = $2', [anleitung, id]);
        }
        if (zutaten && Array.isArray(zutaten)) {
            for (const zutat of zutaten) {
                const { zutaten_id, menge } = zutat;
                await client.query('UPDATE beinhaltet SET menge = $1 WHERE rezepte_id = $2 AND zutaten_id = $3',[menge, id, zutaten_id]);
            }
        }
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

module.exports = router;
