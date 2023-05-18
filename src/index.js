import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

// Conexión base de datos

mongoose
  .connect(
    'mongodb+srv://' +
    process.env.MONGO_USER +
    ':' +
    process.env.MONGO_PASS +
    '@clusterproyecto1.dwjo7jw.mongodb.net/BD-Proyecto1Backend?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('CONEXION EXITOSA');
  })
  .catch((err) => { console.error('CONEXION FALLIDA', err.message); });
mongoose.Promise = global.Promise;


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