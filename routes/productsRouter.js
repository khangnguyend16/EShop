'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controllers/productsController');
const cartController = require('../controllers/cartController');

router.get('/', controller.getData, controller.show);

router.get('/cart', cartController.show);

router.get('/:id', controller.getData, controller.showDetails)

router.post('/cart', cartController.add);

router.put('/cart', cartController.update);

router.delete('/cart', cartController.remove);
router.delete('/cart/all', cartController.clear);

module.exports = router;