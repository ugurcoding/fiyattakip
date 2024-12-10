const express = require('express');
const path = require('path');
const { getPrice } = require('./js/scrape.js');
const app = express();

// Ana dizini statik dosyalar için sunuyoruz
app.use(express.static(path.join(__dirname)));

// Scraping işlemi
app.get('/scrape', async (req, res) => {
    const productName = req.query.product;
    if (!productName) {
        return res.status(400).send({ error: 'Product name is required.' });
    }

    const price = await getPrice(productName);
    res.json({ price });
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
