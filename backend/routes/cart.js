const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:userId', cartController.getCart);
router.post('/:userId', cartController.addItem);
router.put('/item/:id', cartController.updateItem);
router.delete('/item/:id', cartController.removeItem);

module.exports = router;
