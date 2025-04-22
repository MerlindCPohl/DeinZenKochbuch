
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const app = express();
const PORT = 3000;
const client = require('./db');

app.use(cors({
    origin: 'http://localhost:4200',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());
app.use('/api', routes);


app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server started and listening on port ${PORT} ... `);
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});




