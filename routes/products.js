const express = require('express');
const stripeService = require('../services/stripe.service');
const router = express.Router();

/* GET products listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });


router.get('/:id', async function (req, res, next) {
    console.log(req.params);
    const product = await stripeService.getProducts(req.params.id);
    res.json(product);
});
router.get('/prices/:id', async function (req, res, next) {
    console.log(req.params);
    const prices = await stripeService.getProductPrices(req.params.id);
    res.json(prices.data);
});



module.exports = router;
