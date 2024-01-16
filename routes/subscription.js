const express = require('express');
const stripeService = require('../services/stripe.service');
const router = express.Router();

/* GET products listing. */
router.get('/start', async function (req, res, next) {
    const result = await stripeService.startSubscription(req.query.priceId, req.query.count, req.query.customerId);
    res.json(result);
});
router.get('/start/payment', async function (req, res, next) {
    const result = await stripeService.startSubscriptionByPayment(req.query.count, req.query.customerId);
    res.json(result);
});
router.post('/create/invoice', async function (req, res, next) {
    const result = await stripeService.createInvoice();
    res.json(result);
});

router.delete('/cancel/:id', async function (req, res, next) {
    const result = await stripeService.cancelSubscription(req.params.id);
    res.json(result);
});
router.post('/update/:id/:priceId', async function (req, res, next) {
    const result = await stripeService.updateSubscription(req.params.id, req.params.priceId);
    res.json(result);
});
router.get('/session/:id', async function (req, res, next) {
    const result = await stripeService.getSubscriptionSession(req.params.id);
    res.json(result);
});
router.get('/invoices/customer/:id', async function (req, res, next) {
    const result = await stripeService.getCustomerInvoices(req.params.id);
    res.json(result);
});
module.exports = router;
