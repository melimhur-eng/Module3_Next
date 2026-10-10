// Pretend server: waits a second, then "places" the order.
// Open /checkout?fail=1 to simulate a failed request.
export function placeOrder(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (new URLSearchParams(window.location.search).has("fail")) {
        reject(new Error("We could not reach the restaurant. Your order was not placed — please try again."));
      } else {
        resolve({ id: "AE-" + Math.floor(1000 + Math.random() * 9000), ...order });
      }
    }, 1000);
  });
}
