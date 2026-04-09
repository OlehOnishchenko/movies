import express from 'express';
import db from '../db/connector.js';


import { 
  createCar, 
  updateCar, 
  deleteCar, 
  validateCarData 
} from '../controllers/carController.js';

const router = express.Router();

router.get('/', async function(req, res, next) {
  console.log("Зайшли на головну сторінку!"); 
  try {
    
    const cars = await db.query('SELECT * FROM cars ORDER BY id ASC');
    const rowCars = cars.rows.map(s => {
      return {
        ...s,
        created_at_time: s.created_at.toLocaleTimeString(), 
        created_at_date: s.created_at.toLocaleDateString()
      }
    });

    res.render('cars', { 
        cars: rowCars || [], 
        showList: true,   
        showForm: false 
    });
  } catch (error) {
    console.error('Помилка при завантаженні машин:', error);
    res.status(500).send('Помилка сервера при завантаженні даних');
  }
});


router.get('/new', (req, res) => {
  console.log("Зайшли на сторінку створення!");
  res.render('cars', { 
      showList: false,  
      showForm: true,   
      editingCar: null 
  });
});


router.post('/', async (req, res) => {
  try {
    validateCarData(req.body);

    await createCar(req.body);
    
    res.redirect('/'); 
  } catch (error) {
    console.error('Помилка при створенні машини:', error.message);

    res.status(400).send(`Помилка: ${error.message} <br><br><a href="/cars/new">Повернутися назад</a>`);
  }
});


router.get('/edit/:id', async (req, res) => {
  const carId = req.params.id;
  try {
    const carResult = await db.query('SELECT * FROM cars WHERE id = $1', [carId]);
    if (carResult.rows.length === 0) {
      return res.status(404).send('Машину не знайдено');
    }

    res.render('cars', { 
      showList: false,  
      showForm: true,   
      editingCar: carResult.rows[0] 
    });
  } catch (error) {
    console.error('Помилка при завантаженні машини для редагування:', error);
    res.status(500).send('Помилка сервера');
  }
});


router.post('/edit/:id', async (req, res) => {
  const carId = req.params.id;

  try {

    validateCarData(req.body);


    await updateCar(carId, req.body);

    res.redirect('/'); 
  } catch (error) {
    console.error('Помилка при оновленні:', error.message);
    res.status(400).send(`Помилка: ${error.message} <br><br><a href="/cars/edit/${carId}">Повернутися назад</a>`);
  }
});


router.delete('/:id', async (req, res) => {
  const carId = req.params.id;
  try {
    await deleteCar(carId);
    res.status(200).json({ message: 'Машину успішно видалено!' });
  } catch (error) {
    console.error('Помилка при видаленні:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
