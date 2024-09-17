const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();
const port = 3000;

const config = {
    user: 'new_user',
    password: 'StrongPassword123',
    server: 'DESKTOP-K0PKJHI\\SQLEXPRESS',
    database: 'WEBSITE',
    port: 1433,
    options: {
        trustedConnection: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        instancename: "SQLEXPRESS"
    }
};

app.use(cors());
app.use(express.json());

sql.connect(config).then(pool => {
    if (pool.connected) {
        console.log('Connected to SQL Server');
    }

    app.get('/Quote', async (req, res) => {
        try {
            const result = await pool.request().query(`
                SELECT TOP 1 text, author 
                FROM Quote
                ORDER BY NEWID();
                `
            );
            res.json(result.recordset);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/Users', async (req, res) => {
        try {
            const { name, email, message } = req.body;
            const insertQuery = `INSERT INTO users (name, email, comment) VALUES (@name, @email, @comment)`;

            let result = await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('comment', sql.NVarChar, message)
                .query(insertQuery);
            console.log('Data inserted successfully:', result.rowsAffected);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/subscriptions', async (req, res) => {

        try {
            const { subscription_type } = req.body;
            const start_date = new Date(Date.now()).toISOString()///  .toString();
            console.log(start_date);
            
            const insertQuery = `
            INSERT INTO subscriptions (subscription_type, start_date, end_date) 
            VALUES (@subscription_type, @start_date, @end_date)`;

            let result = await pool.request()
                .input('subscription_type', sql.NVarChar, subscription_type)
                .input('start_date', sql.Date, start_date)
                .input('end_date', sql.Date, null)
                .query(insertQuery);

            res.status(200).send('Subscription added successfully!');
        } catch (err) {
            console.error('SQL error', err);
            res.status(500).send('Error inserting data into database.');
        }
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

}).catch(err => {
    console.error('Database connection failed:', err);
});