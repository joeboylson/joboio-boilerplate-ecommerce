import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { checkIfItemsAreInStock } from "./utils/fetch";

const CheckoutForm = ({items}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readOnly, setReadonly] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  useEffect(() => {
    setInterval(async () => {
      const itemsAreInStock = await checkIfItemsAreInStock(items);
      if (!itemsAreInStock) {
        setMessage("Your cart contains items that are out of stock." + new Date().valueOf())
        setReadonly(true);
        return;
      }

      setMessage("Everything is in stock." + new Date().valueOf())
    }, 5000)
  }, [items])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:4242/order-success",
      },
    });

    const paymentHadError = error.type === "card_error" || error.type === "validation_error"
    const _message = paymentHadError ? error.message : "An unexpected error occurred."
    setMessage(_message);
    setIsLoading(false);
  };

  const paymentElementOptions = { readOnly }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions}/>
      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
      </button>

      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}

export default CheckoutForm;