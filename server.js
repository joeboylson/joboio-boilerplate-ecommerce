const express = require("express");
const app = express();
const stripe = require("stripe")('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, where, query } = require('firebase/firestore/lite');

app.use(express.static("public"));
app.use(express.json());

const db = (() => {

  const firebaseConfig = {
    apiKey: "AIzaSyD5I5n51YeQ4zij5tVUnfC2RbE6owgBevc",
    authDomain: "joboio-demo-ecommerce.firebaseapp.com",
    projectId: "joboio-demo-ecommerce",
    storageBucket: "joboio-demo-ecommerce.appspot.com",
    messagingSenderId: "811620755211",
    appId: "1:811620755211:web:9f2065e63a5116e536e40e",
    measurementId: "G-QB3TF87KJZ"
  };

  const firebaseApp = initializeApp(firebaseConfig);
  return getFirestore(firebaseApp);
})()

const calculateOrderAmount = (items) => {

  const total = items.reduce((accumulatedPrice, _item) => {
    return accumulatedPrice + _item.price;
  }, 0)

  // // Replace this constant with a calculation of the order's amount
  // // Calculate the order total on the server to prevent
  // // people from directly manipulating the amount on the client
  // return total;

  return total
};

app.post("/create-payment-intent", async (req, res) => {

  const { items } = req.body;
  
  const metadata = {
    name: "Joe Boylson",
    email: "joeboylson@gmail.com",
    formData: "this that this that",
    item_json_stringified: JSON.stringify(items)
  }
  
  const customer = await stripe.customers.create();

  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    metadata,
    setup_future_usage: "off_session",
    amount: calculateOrderAmount(items),
    currency: "usd",
    receipt_email: "joeboylson@gmail.com",
  });

  res.send({
    paymentIntent,
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/order-success", async (req, res) => {
  const { payment_intent, redirect_status } = req.query;

  if (redirect_status === "succeeded") {
    const successfulPaymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
  }
  
  res.redirect("http://localhost:3000/")
});

app.get("/products-by-id", async (req, res) => {
  
  const { productIds: productIdsString } = req.query;
  const productIds = productIdsString.split(",")

  const productsQuery = query(collection(db, "products"), where("id", "in", productIds));
  const productsDocs = await getDocs(productsQuery);
  const products = productsDocs.docs.map(doc => doc.data());
  
  res.send({ products })
});


app.listen(4242, () => console.log("Node server listening on port 4242!"));