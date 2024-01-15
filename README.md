to run the poject
1. npm install
2. in services/stripe.service.js, you need to add ur stripe secret key! const stripe = require('stripe')('SECRET_KEY_HERE');
3. npm start
4. go to localhost:3000

This express repo is just for  poc purpose to demonstrate how we can create, cancel and update a subscription using stripe checkout page
you can run the frontend part using this repo https://github.com/sarahzayat2019/stripe-checkout-subscription-angular
