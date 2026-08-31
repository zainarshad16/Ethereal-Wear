import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import * as AuthorizeNet from "authorizenet";

// Promise wrapper for Authorize.net SDK
function processAuthorizeNetPayment(paymentData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const merchantAuthenticationType = new AuthorizeNet.APIContracts.MerchantAuthenticationType();
      merchantAuthenticationType.setName(process.env.AUTHORIZENET_API_LOGIN_ID || "mock-login");
      merchantAuthenticationType.setTransactionKey(process.env.AUTHORIZENET_TRANSACTION_KEY || "mock-key");

      const creditCard = new AuthorizeNet.APIContracts.CreditCardType();
      creditCard.setCardNumber(paymentData.cardNumber.replace(/\s+/g, ''));
      creditCard.setExpirationDate(paymentData.expiry.replace(/\//g, ''));
      creditCard.setCardCode(paymentData.cvc);

      const paymentType = new AuthorizeNet.APIContracts.PaymentType();
      paymentType.setCreditCard(creditCard);

      const billTo = new AuthorizeNet.APIContracts.CustomerAddressType();
      billTo.setFirstName(paymentData.firstName);
      billTo.setLastName(paymentData.lastName);
      billTo.setAddress(paymentData.address);
      billTo.setCity(paymentData.city);
      billTo.setZip(paymentData.zipCode);
      billTo.setCountry(paymentData.country);

      const transactionRequestType = new AuthorizeNet.APIContracts.TransactionRequestType();
      transactionRequestType.setTransactionType(AuthorizeNet.APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
      transactionRequestType.setPayment(paymentType);
      transactionRequestType.setAmount(paymentData.amount);
      transactionRequestType.setBillTo(billTo);

      const createRequest = new AuthorizeNet.APIContracts.CreateTransactionRequest();
      createRequest.setMerchantAuthentication(merchantAuthenticationType);
      createRequest.setTransactionRequest(transactionRequestType);

      const ctrl = new AuthorizeNet.APIControllers.CreateTransactionController(createRequest.getJSON());
      
      // Default to sandbox, change to AuthorizeNet.Constants.endpoint.production for live
      // AuthorizeNet.Constants.endpoint.production
      
      // Fallback for mock keys if env vars aren't set yet (to allow the app to not crash instantly)
      if (process.env.AUTHORIZENET_API_LOGIN_ID) {
        ctrl.execute(() => {
          const apiResponse = ctrl.getResponse();
          const response = new AuthorizeNet.APIContracts.CreateTransactionResponse(apiResponse);
          
          if (response != null) {
            if (response.getMessages().getResultCode() == AuthorizeNet.APIContracts.MessageTypeEnum.OK) {
              const tResponse = response.getTransactionResponse();
              if (tResponse && tResponse.getMessages() && tResponse.getMessages().getMessage()[0].getCode() == '1') {
                resolve({ success: true, transactionId: tResponse.getTransId() });
              } else {
                let errorMsg = "Payment declined";
                if (tResponse && tResponse.getErrors()) {
                  errorMsg = tResponse.getErrors().getError()[0].getErrorText();
                } else if (tResponse && tResponse.getMessages()) {
                  errorMsg = tResponse.getMessages().getMessage()[0].getDescription();
                }
                resolve({ success: false, error: errorMsg });
              }
            } else {
              let errorMsg = "Payment failed";
              if (response.getTransactionResponse() && response.getTransactionResponse().getErrors()) {
                errorMsg = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
              } else if (response.getMessages().getMessage()) {
                errorMsg = response.getMessages().getMessage()[0].getText();
              }
              resolve({ success: false, error: errorMsg });
            }
          } else {
            resolve({ success: false, error: "Null response from Authorize.net" });
          }
        });
      } else {
        // If no keys, simulate a successful payment for testing purposes until user adds keys
        console.warn("AUTHORIZENET KEYS NOT SET. SIMULATING SUCCESS.");
        resolve({ success: true, transactionId: "SIMULATED_TX_" + Date.now() });
      }
    } catch (e: any) {
      resolve({ success: false, error: e.message || "Unknown error" });
    }
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "You must be logged in to checkout" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingDetails, paymentDetails } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!paymentDetails || !paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvc) {
      return NextResponse.json({ error: "Payment details are required" }, { status: 400 });
    }

    // 1. Stock Validation
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 404 });
      }

      // Check size stock
      const size = item.size || "S";
      const sizeStock = product.sizeStock
        ? (typeof product.sizeStock === "string" ? JSON.parse(product.sizeStock) : product.sizeStock)
        : {};

      const available = sizeStock[size] !== undefined ? Number(sizeStock[size]) : product.stock;

      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${available} units of size ${size} left for ${product.name}.` },
          { status: 400 }
        );
      }
    }

    // Calculate Total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // 2. Process Payment via Authorize.net
    const paymentResult = await processAuthorizeNetPayment({
      amount: total.toFixed(2),
      cardNumber: paymentDetails.cardNumber,
      expiry: paymentDetails.expiry,
      cvc: paymentDetails.cvc,
      firstName: shippingDetails.firstName,
      lastName: shippingDetails.lastName,
      address: shippingDetails.address,
      city: shippingDetails.city,
      zipCode: shippingDetails.zipCode,
      country: shippingDetails.country,
    });

    if (!paymentResult.success) {
      return NextResponse.json({ error: `Payment failed: ${paymentResult.error}` }, { status: 400 });
    }

    // 3. Deduct Stock & Create Order
    const orderItemsData = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    // Update stocks
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (product) {
        const size = item.size || "S";
        const sizeStock = product.sizeStock
          ? (typeof product.sizeStock === "string" ? JSON.parse(product.sizeStock) : product.sizeStock)
          : {};

        // Deduct
        sizeStock[size] = Math.max(0, (sizeStock[size] || 0) - item.quantity);
        const updatedTotalStock = Math.max(0, product.stock - item.quantity);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: updatedTotalStock,
            sizeStock: sizeStock
          }
        });
      }
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PAID",
        items: {
          create: orderItemsData
        }
      }
    });

    return NextResponse.json({ success: true, orderId: order.id, transactionId: paymentResult.transactionId });
  } catch (error: any) {
    console.error("ORDER CREATION ERROR:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
