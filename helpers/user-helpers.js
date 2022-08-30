const async = require('hbs/lib/async');
const { reject } = require('bcrypt/promises')
const User = require('../Models/userModel');
const bcrypt = require('bcrypt');
const cartModel = require('../Models/cartModel');
const mongoose = require('mongoose')
// const productModel = require('../models/productModel'); 
const wishlistModel = require('../Models/wishlistModel');
const addressModel = require('../Models/addressModel');
const Razorpay = require('razorpay');
const orderModel = require('../Models/orderModel');
const couponModel = require('../Models/couponModel'); 
const env = require('dotenv').config()

var instance = new Razorpay({
    key_id: process.env.RAZOR_KEY,
    key_secret: process.env.RAZOR_SECRET,
  });


let userhelper= {
    
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let {name,email,mobile,password,confirmPassword,status}=userData

                password= await bcrypt.hash(password,10)
                 user = new User({
                    name,
                    email,
                    mobile,
                    password,
                    confirmPassword,
                    status
                })

                user.save().then((data)=>{
                    console.log(data)
                    resolve(data)
                }).catch((err)=>{
                    console.log(err)
                })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await User.findOne({ email: userData.email })
            if (user) {
                if(user.status){
                    response.block=true
                    resolve(response)
                }else{
                    response.block=false
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log(user)
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    } else {
                        resolve({ status: false })
                    }
                
                })
            }
            } else {
                resolve({ status: false })
            }
        })
    },
    updateProfile:(userData)=>{
        return new Promise((resolve,response)=>{
            // console.log(userData)
            User.findByIdAndUpdate((userData.id),{name:userData.name, email:userData.email,mobile:userData.mobile}).then((userData)=>{
                console.log(userData)
                resolve(userData)
            })
        })


    },

    addToCart: (userId, productId) => {
        let user_Id = mongoose.Types.ObjectId(userId);
        const response = {
            duplicate: false
        }
        return new Promise(async (resolve, reject) => {
            let size
            let cart = await cartModel.findOne({ user: user_Id })
            if (cart) {
                let cartProduct = await cartModel.findOne({ user: user_Id, 'cartItems.product': productId })
                if (cartProduct) {
                    response.duplicate = true
                    resolve(response)
                } else {
                    let cartArray = { product: productId, quantity: 1,size }
                    cartModel.findOneAndUpdate({ user: user_Id }, { $push: { cartItems: cartArray } }).then(async (data) => {
                        let wishList = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': productId })
                        if (wishList) {
                            wishlistModel.updateOne({ user: userId }, {
                                $pull: {
                                    wishListItems:
                                        { product: productId }
                                }
                            }).then((data) => {
                                response.added = false
                                response.data = data
                                resolve(response)
                            })
                        }
                        resolve(data)
                    })
                }
            } else {
                let product = productId;
                let quantity = 1;
                
                cart = new cartModel({
                    user: userId,
                    cartItems: [
                        {
                            product,
                            quantity,
                            size
                        }
                    ]
                })
                cart.save().then(async (data) => {
                    let wishList = await wishlistModel.findOne({ user: user_Id, 'wishListItems.product': productId })
                    if (wishList) {
                        wishlistModel.updateOne({ user: userId }, {
                            $pull: {
                                wishListItems:
                                    { product: productId }
                            }
                        }).then((data) => {
                            response.added = false
                            response.data = data
                            resolve(response)
                        })
                    }
                    resolve(data)
                })
            }
        })
    },



    showCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartProduct = await cartModel.findOne({ user: userId }).populate('products')
            resolve(cartProduct)

        })
    },
    deleteFromCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: productId }
                }
            }).then((data) => {
                resolve(data)
            })
        })

    },
    cartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cartProduct = await cartModel.findOne({ user: userId });
            if (cartProduct) {
                console.log(cartProduct);
                count = cartProduct.cartItems.length
                console.log(count);
            }
            resolve(count)
        })
    },
    wishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlistProduct = await wishlistModel.findOne({ user: userId });
            if (wishlistProduct) {
                count = wishlistProduct.wishListItems.length
            }
            resolve(count)
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let cartItems = await cartModel.findOne({ user: userId }).populate('cartItems.product').lean()
            console.log(cartItems)
            if(cartItems){
            if (cartItems.cartItems.length>0) { 
                response.notEmpty = true
                response.cart = cartItems
                resolve(response)
            } else {
                response.notEmpty = false
                resolve(response)
            }
        }else{
                response.notEmpty = false
                resolve(response)
            }
        })
    }, 

    changeSize: (productId, userId,size) => {
        console.log(size)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': productId }, { $set: { 'cartItems.$.size':size} }).then(async (data) => {
                let cart = await cartModel.findOne({ user: userId }).lean()
                let response = {}
                // // let count = null
                // for (let i = 0; i < cart.cartItems.length; i++) {
                //     if (cart.cartItems[i].product == productId) {
                        size = cart.cartItems.size
                //     }
                // }
                response.size = size
                resolve(response)
            })
        })
    },




    quantityPlus: (productId, userId) => {
        console.log(productId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': productId }, { $inc: { 'cartItems.$.quantity': 1 } }).then(async (data) => {
                let cart = await cartModel.findOne({ user: userId }).lean()
                let response = {}
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == productId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                response.count = count
                resolve(response)
            })
        })
    },
    quantityMinus: (productId, userId) => {
        console.log(productId)
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId, 'cartItems.product': productId }, { $inc: { 'cartItems.$.quantity': -1 } }).then(async (data) => {
                let response = {}
                let cart = await cartModel.findOne({ user: userId }).lean()
                response.cart = cart
                console.log(cart)
                let count = null
                for (let i = 0; i < cart.cartItems.length; i++) {
                    if (cart.cartItems[i].product == productId) {
                        count = cart.cartItems[i].quantity
                    }
                }
                if (count == 0) {
                    cartModel.updateOne({ user: userId }, {
                        $pull: {
                            cartItems:
                                { product: productId }
                        }
                    }).then((data) => {
                        response.data = data
                    })
                }
                response.count = count
                resolve(response)
            })
        })
    },
    deleteFromCart: (userId, productId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ user: userId }, {
                $pull: {
                    cartItems:
                        { product: productId }
                }
            }).then((data) => {
                resolve(data)
            })
        })
    },

    addToWishList: (userId, productId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let userWishList = await wishlistModel.findOne({ user: userId })
            let cartItem = await cartModel.findOne({ user: userId, 'cartItems.product': productId })
            if (cartItem) {
                response.cart = true
                resolve(response)
            } else {
                if (userWishList) {
                    let exist = await wishlistModel.findOne({ user: userId, 'wishListItems.product': productId })
                    if (!exist) {
                        let conditions = {
                            user: userId,
                            'wishListItems.product': { $ne: productId }
                        };
                        var update = {
                            $addToSet: { wishListItems: { product: productId } }
                        }
                        wishlistModel.findOneAndUpdate(conditions, update).then((data) => {
                            response.added = true
                            response.data = true
                            response.cart = false
                            resolve(response)
                        })
                    } else {
                        wishlistModel.updateOne({ user: userId }, {
                            $pull: {
                                wishListItems:
                                    { product: productId }
                            }
                        }).then((data) => {
                            response.added = false
                            response.data = data
                            response.cart = false
                            resolve(response)
                        })
                    }

                } else {
                    let user = userId
                    let product = productId
                    let wishListItems = []
                    wishListItems[0] = { product }
                    newWishList = new wishlistModel({
                        user,
                        wishListItems
                    })
                    newWishList.save().then((data) => {
                        response.added = true
                        response.data = data
                        response.cart = false
                        resolve(response)
                    })
                }
            }
        })
    },

    checkWishlist:(userId,productId)=>{
        return new Promise(async(resolve,reject) => {
            let wishlist = null
            wishlistModel.find({user:userId,wishlistItems: { 
                $elemMatch: { product: productId } 
             }}).then((data)=>{
                if(data.length > 0){
                    wishlist = true
                    console.log(wishlist,'exist')
                }else{
                    wishlist = false
                    console.log(wishlist,'not')
                }
                resolve(wishlist)
             })
            
        })
    },
    wishListProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let products = await wishlistModel.findOne({user:userId}).populate('wishListItems.product').lean()
            if (products){
            if (products.wishListItems.length > 0) {
                response.notEmpty = true
                response.products = products
                resolve(response)
            } else {
                response.notEmpty = false
                resolve(response)
            }
        }else {
                response.notEmpty = false
                resolve(response)
            }
        })
    },
    removeWishListItem: (userId, productId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            wishlistModel.updateOne({ user: userId }, {
                $pull: {
                    wishListItems:
                        { product: productId }
                }
            }).then((data) => {
                response.removed = true
                response.data = data
                resolve(response)
            })
        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await addressModel.find({ User: userId }).lean();
            resolve(address);
        })
    },
    addAddress: (data, userId) => {
        return new Promise(async (resolve, reject) => {
            let defaultAddress = null;
            let address = await addressModel.find({ User: userId }).lean();
            if (address) {
                defaultAddress = false;
            } else {
                defaultAddress = true;
            }
            let Address = new addressModel({
                User: userId,
                firstname: data.firstname,
                lastname: data.lastname,
                number: data.number,
                address1: data.address1,
                address2: data.address2,
                district: data.district,
                state: data.state,
                country: data.country,
                pinCode: data.pinCode,
                defaultAddress
            })
            Address.save().then((address) => {
                resolve(address);
            })
        })
    },

    applyCoupon: (couponcode,id) => {
        return new Promise(async(resolve, reject) => {
            let response = {}
            response.discount = 0
            // code.code = code.code.toUpperCase();
            let coupon = await couponModel.findOne({code:couponcode.code})
            if(coupon){
                response.status = true
                response.coupon = coupon
                userhelper.getCartProducts(id).then((cartProducts)=>{
                    userhelper.cartTotal(cartProducts.cart).then((total)=>{
                        console.log(total)
                        response.discount = (total.grandTotal * coupon.percentage)/100
                        response.grandTotal = total.grandTotal - response.discount
                        // console.log(response,"HFJHHJGJHGJHGJHG")
                        resolve(response)
                    })
                })
            }else{
                response.status = false
                resolve(response)
            }
        })
    },

    cartTotal: (cart) => {
        return new Promise(async (resolve, reject) => {
            let total = cart.cartItems.reduce((acc, curr) => {
                acc = acc + curr.product.productprice * curr.quantity
                return acc;
            }, 0)
            let response = {};
            let shipping = 0;
            if (total < 1000) {
                shipping = 100;
            }
            response.shipping = shipping;
            response.total = total;
            response.grandTotal = response.total + response.shipping;
            console.log(response.grandTotal+"nishada")
            if(cart.discount){
               response.grandTotal = response.grandTotal - cart.discount
                response.discount = cart.discount
                console.log(response.grandTotal+'niyas')
            }
            resolve(response);
        })
    },
    PlaceOrder:(data,userId)=>{
        let orderStatus
        return new Promise(async (resolve, reject) => {
          if(data.paymentMethod==='COD'){
           orderStatus = 'Placed';
          }
          else{
            orderStatus = 'pending';
          }
          console.log(data);
          userhelper.getCartProducts(userId).then((cartProducts)=>{
            userhelper.cartTotal(cartProducts.cart).then((response)=>{
                if(data.discount){
                    response.Total = response.grandTotal - data.discount
                    console.log(response.Total,data.discount)
                }else{
                    response.Total = response.grandTotal 
                }
              
             let order = new orderModel({
                user: userId,
                orderItems: cartProducts.cart.cartItems,
                Total:response.grandTotal,
                discount:data.discount,
                totalPrice:response.Total,
                shipping: response.shipping,
                deliveryDetails: data.address,
                paymentDetails:data.paymentMethod,
                date:new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear(),
                time:new Date().getTime(),
                orderStatus
              })
              order.save().then(async(data)=>{
                let cartItems = cartProducts.cart.cartItems
                // for(let i=0;i<cartItems.length;i++){
                    // cartModel.findByIdAndUpdate(cartItems[i].product,{$inc:{quantity:-cartItems[i].quantity}}).then((data)=>{
                        cartModel.findOneAndUpdate({user:userId},{$pull:{cartItems:{}}}).then((data)=>{
                        console.log(data);
                    })
                // }
                resolve(data);
              })
            })
          })
        })
      },

      generateRazorPay:(Order)=>{
        return new Promise((resolve,reject) => {
            console.log(Order._id,"generater")
            let fund = Order.totalPrice * 100
            fund = parseInt(fund)
            var options = {
                amount: fund,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+Order._id,
              };
              instance.orders.create(options, function(err, order) {
                console.log(order+"sdfgbhzxcdfgxsdcvxcv");
                console.log(err,"als;dfjalsk");

                resolve(order)
              });

        })
      },
      verifyPayment:(data)=>{
        return new Promise(async (resolve, reject) => {
          const crypto = require('crypto');
          let hmac = crypto.createHmac('sha256',process.env.RAZOR_SECRET)
          let body=data.payment.razorpay_order_id + "|" + data.payment.razorpay_payment_id;
          hmac.update(body.toString());
          hmac = hmac.digest('hex');
          if(hmac==data.payment.razorpay_signature){
            resolve();
          }else{
            reject();
          }
        })
      },

    cancelOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let order = await orderModel.findById(orderId).lean()
            orderModel.findByIdAndUpdate(orderId,{orderStatus:'cancelled'}).then((data)=>{
                resolve(data)
            })
        })
    },




      changeOrderStatus:(data,id)=>{
        return new Promise(async (resolve, reject)=>{
          orderModel.findByIdAndUpdate(data.order.receipt,{ orderStatus:true,orderStatus:'Placed',deliveryStatus:'processing' }).then(()=>{
            cartModel.findOneAndRemove({user:id}).then(()=>{
                resolve()
            })
          })
        })
      },
       getOrder:(id) => {
        return new Promise((resolve,reject)=>{
            orderModel.findById(id).populate('orderItems.product').populate('deliveryDetails').lean().then((order)=>{
                resolve(order)
            })
        })
      },
      getUserOrders:(userId)=>{
        return new Promise(async (resolve, reject)=>{
            let userOrder = await orderModel.find({User:userId}).sort({time:-1}).populate('orderItems.product').populate('deliveryDetails').lean()
             resolve(userOrder)
        })
    }


}

module.exports = userhelper