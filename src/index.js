import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

// Conexión base de datos

const uri = process.env.MONGODB_URI;
const options = {useNewUrlParser: true, useUnifiedTopology: true};

mongoose.set('strictQuery', false);

mongoose.connect(uri, options).then(
  () => { console.log('Conectado a DB') },
  err => { console.log(err) }
);


const app = express();

// Middleware
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/product'));
app.use('/api', require('./routes/restaurant'));
app.use('/api', require('./routes/order'));

app.set('puerto', process.env.PORT || 4000);
app.listen(app.get('puerto'), () => {
  console.log('Example app listening on port '+ app.get('puerto'));
});