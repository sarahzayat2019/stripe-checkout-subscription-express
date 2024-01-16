const stripe = require('stripe')('SECRET_KEY');

async function getProducts(productId) {
    return await stripe.products.retrieve(productId).then((it) => {
        return it;
    });

}

async function getSubscriptionById(subscriptionId) {
    return await stripe.subscriptions.retrieve(subscriptionId);
}

//listing prices by product id
async function getProductPrices(productId) {
    const prices = await stripe.prices.list({
        product: productId,
        active: true,
    });
    return prices.data.map((it) => {
        return {
            id: it.id,// price id
            name: it.nickname, // this should be fetched from our database
            amount: it.unit_amount,
            currency: it.currency,
            paymentFrequency: it.recurring.interval,
        };
    })
}

async function startSubscription(priceId, count, customerId) {
    const session = await stripe.checkout.sessions.create({
        // the redirect url can be sent from the frontend
        success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}', // it can be sent from the FE
        // return_url we can use return url
        customer: customerId, // this is used to not create multiple customer for a payment, and when invoices are collected they are collected under this customer id
        // as a solution, we can store invoices ids in our data base and fetch them under a company
        line_items: [
            {
                price: priceId,
                quantity: Number(count),
            },
        ],
        mode: 'subscription',
    });
    return session;
}

async function startSubscriptionByPayment(count, customerId) {
    const session = await stripe.checkout.sessions.create({
        // the redirect url can be sent from the frontend
        success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}', // it can be sent from the FE
        // return_url we can use return url
        customer: customerId, // this is used to not create multiple customer for a payment, and when invoices are collected they are collected under this customer id
        // as a solution, we can store invoices ids in our data base and fetch them under a company
        invoice_creation: {
            enabled: true,
        },
        line_items: [ // all arguments are required
            {
                price_data: {
                    unit_amount: 4000, //this is in cents
                    currency: 'usd',
                    product_data: {
                        name: 'Test Product'
                    },
                },
                quantity: count,
            },
        ],
        // we need this to save user payment method for future use
        payment_intent_data: {
            setup_future_usage: "on_session",
        },
        mode: 'payment',
    });
    return session;
}

async function getCheckoutSession(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
        subTotal: (session.amount_subtotal / 100).toLocaleString("en-US", {
            style: "currency",
            currency: session.currency,
        }),
        email: session.customer_email,
        status: session.payment_status,
        customerId: session.customer,
    }
}

async function getCustomerInvoices(customerId) {
    const invoices = await stripe.invoices.list({
        customer: customerId,

    });
    return invoices.data.map((it) => {
        return {
            pdf: it.invoice_pdf,
            id: it.id,
            date: it.created,
            subTotal: (it.amount_paid / 100).toLocaleString("en-US", {
                style: "currency",
                currency: it.currency,
            }),

        }
    })
}

async function cancelSubscription(subscriptionId) {
    return await stripe.subscriptions.cancel(
        subscriptionId
    );
}

async function updateSubscription(subscriptionId, newPriceId) {
    const currentSubscription = await getSubscriptionById(subscriptionId);
    const updateRequest = await stripe.subscriptions.update(
        subscriptionId,
        {
            proration_behavior: 'create_prorations',
            billing_cycle_anchor: 'now',
            items: [
                {
                    id: currentSubscription.items.data[0].id,
                    price: newPriceId,
                    quantity: currentSubscription.items.data[0].quantity
                },
            ],
        }
    );
    return updateRequest;
}

async function createAndPayInvoice() {
    const customerId = "cus_PNy3bcnky98XBO";
    const quantity = 5
    const paymentMethods = await stripe.customers.listPaymentMethods(
        customerId,
        {
            limit: 1,
        }
    );

    const invoice = await stripe.invoices.create(
        {
            customer: customerId,
            currency: 'usd',
            auto_advance: false,
            default_payment_method: paymentMethods.data[0].id
        },
    );
    await stripe.invoiceItems.create(
        {
            customer: customerId,
            amount: 4000 * quantity,
            invoice: invoice.id
        },
    );
    return await stripe.invoices.pay(invoice.id);

}

module.exports = {
    getProducts,
    getProductPrices,
    startSubscription,
    getCheckoutSession,
    getCustomerInvoices,
    cancelSubscription,
    updateSubscription,
    startSubscriptionByPayment,
    createAndPayInvoice
};
