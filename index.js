const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

// Define your routes here

const path = require('path');
const ejs = require('ejs');

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const {getUserByHash, createUser, loginUser, findUserByToken} = require('./app/controllers/user.js');
const {createTimeRecord, getUserTimeRecords} = require('./app/controllers/time_record.js');

app.get('/register/:user_hash', async (req, res) => {
  const user = await getUserByHash(req.params.user_hash); 
  const timeRecords = await getUserTimeRecords(req, res, user);

  const recordsType = [
    {
    name: 'Entrada',
      type: 'entrada'
    }, 
    {
      name: 'Saída',
      type: 'saida'
    }, 
    {
      name: 'Entrada Almoço',
      type: 'almoco-entrada'
    },
    {
      name: 'Saída Almoço',
      type: 'almoco-saida'
    }
  ];

  console.log(timeRecords);

  if (user) {
    res.render('register.html.ejs', { user: user , recordsType: recordsType});
  } else {
    res.status(404).render('404.html.ejs');
  }
}); 

app.post('/register-user', async (req, res) => {
    await createUser(req, res);
});

app.get('/register-user', async (req, res) => {
  res.render('register.user.html.ejs');
});

app.post('/register', async (req, res) => {
    await createTimeRecord(req, res);
});

app.get('/register-complete', (req, res) => {
    res.render('register-complete.html.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.html.ejs');
});

app.post('/login', async (req, res) => {
  await loginUser(req, res);
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard.html.ejs');
});

app.get('/check-login', (req, res) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await findUserByToken(decoded.id);

    if (user) {
      return res.status(200).json({ message: 'Authorized', user: user });
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  });
});

// 404 Not Found route
app.use((req, res) => {
  res.status(404).render('404.html.ejs');
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {

    const time_record = require('./app/models/time_record.js');
    const user = require('./app/models/user.js');
    const sequelize = require('./app/config/database.js');
  
    await sequelize.authenticate();
  
    await time_record.sync();
    await user.sync();

    // try {
    //   // const defaultUser = await user.create({
    //   //   username: 'admin',
    //   //   user_hash: 'xyetss',
    //   //   name: 'Administrador',
    //   //   email: 'admin@example.com',
    //   //   password: 'adminpassword', // Note: In a real application, ensure this is hashed
    //   // });
    //   console.log('Default user created:', defaultUser.toJSON());
    // } catch (error) {
    //   console.error('Error creating default user:', error);
    // }

    console.log('Database tables have been created.');
    // Add more model imports here as needed
    console.log('Database connection has been established successfully.');
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});