const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Kein Token vorhanden' });
    }

    const token = authHeader.split(' ')[1]; // Header-Format: "Bearer <token>"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Token validieren
        req.userID = decoded.id; // speichert benutzer*inneninfo
        next(); // weiterleitung zur nächsten route
    } catch (error) {
        return res.status(403).json({ message: 'Ungültiges Token' });
    }
};
