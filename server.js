const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();
const adapter = new FileSync(path.join('/tmp', 'db.json'));
const db = low(adapter);
db.defaults({ products: [], admin: {} }).write();

app.use(express.static(path.join(__dirname)));

// TENTUKAN PASSWORD KAMU DI SINI (Silakan ganti 'rahasia123' sesuai maumu)
const PASSWORD_ADMIN = 'Cetulkerenbetz';

db.defaults({ links: [] }).write();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 1. API untuk cek password saat login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD_ADMIN) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Password salah!' });
    }
});

// 2. API untuk mengambil semua link
app.get('/api/links', (req, res) => {
    const links = db.get('links').value();
    res.json(links);
});

// 3. API untuk menambah link baru
app.post('/api/links', (req, res) => {
    const { title, url } = req.body;
    
    const currentLinks = db.get('links').value();
    const nextNumber = currentLinks.length + 1;

    const newLink = {
        id: Date.now().toString(),
        number: nextNumber,
        title: title,
        url: url
    };

    db.get('links').unshift(newLink).write();
    res.redirect('/admin.html');
});

// 4. API untuk menghapus link berdasarkan ID
app.get('/api/links/delete/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('links').remove({ id: id }).write();
    
    const links = db.get('links').value();
    const reversedLinks = [...links].reverse();
    reversedLinks.forEach((link, index) => {
        link.number = index + 1;
    });
    db.write();

    res.redirect('/admin.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
