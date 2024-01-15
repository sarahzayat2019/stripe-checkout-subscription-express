const stripe = require('stripe')('SECRET_KEY_HERE');

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
        success_url: 'http://localhost:4200/success?session_id={CHECKOUT_SESSION_ID}',
        customer: customerId, // this is used to not create multiple customer for a payment, and when invoices are collected they are collected under this customer id
        // as a solution, we can store invoices ids in our data base and fetch them under a company
        line_items: [
            {
                price: priceId,
                quantity: Number(count),
            },
        ],
        locale: "",
        mode: 'subscription',
    });
    return session;
}

async function getSubscriptionSession(sessionId) {
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
        limit: 5
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
    console.log(currentSubscription.items.data);
    const test = await stripe.subscriptions.update(
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
    console.log(test);
    return test;
}

module.exports = {
    getProducts,
    getProductPrices,
    startSubscription,
    getSubscriptionSession,
    getCustomerInvoices,
    cancelSubscription,
    updateSubscription,
    getSubscriptionById
};
