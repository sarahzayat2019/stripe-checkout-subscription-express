to run the poject
1. npm install
2. npm start
3. in services/stripe.service.js, you need to add ur stripe secret key! const stripe = require('stripe')('SECRET_KEY_HERE');

This express repo is just for  poc purpose to demonstrate how we can create, cancel and update a subscription using stripe checkout page
