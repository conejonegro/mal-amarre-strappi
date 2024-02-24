"use strict";
const stripe = require("stripe")(
  "sk_test_51McFNvGuOrnPfQraUIaKVASi6mMCjeuqxoyziq0RQqtQGSB1e7romBWwfgeZRdKZ9z9oyn8Lw5RRvSblLzuQFmh300yQzvvCec"
);

function calcDiscountPrice(price, discount) {
  if (!discount) return price;

  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;

  return result.toFixed(2);
}

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::pedido.pedido", ({ strapi }) => ({
  async paymentPedido(ctx) {
    const { token, products, user, addressShipping } = ctx.request.body;

    let totalPayment = 0;
    products.forEach((product) => {
      const priceTemp = calcDiscountPrice(
        product.attributes.price,
        product.attributes.discount
      );

      totalPayment += Number(priceTemp) * product.quantity;
    });

    const charge = await stripe.charges.create({
      amount: Math.round(totalPayment * 100),
      currency: "mxn",
      source: token.id,
      description: `User ID: ${user}`,
    });

    const data = {
      products,
      user: user,
      totalPayment,
      paymentID: charge.id,
      addressShipping,
    };

    const model = strapi.contentTypes["api::pedido.pedido"];
    const validData = await strapi.entityValidator.validateEntityCreation(
      model,
      data
    );

    const entry = await strapi.db
      .query("api::pedido.pedido")
      .create({ data: validData });

    return entry;
  },
}));
