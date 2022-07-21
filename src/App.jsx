import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./CheckoutForm";
import "./App.css";

const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

const items = [
  { id: "product-1", price: 10000, quantity: 10 },
  { id: "product-2", price: 10000, quantity: 1 },
]

export default function App() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => {
        console.log("create-payment-intent")
        return res.json()
      })
      .then((data) => {
        console.log({data})
        setClientSecret(data.clientSecret)
      })
      .catch(err => console.log(err));
      
  }, []);

  
  const options = { clientSecret };

  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm items={items}/>
        </Elements>
      )}
    </div>
  );
}