const { response } = require('express');
var express = require('express');
const session = require('express-session');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
const auth = require('../helpers/auth')
const User = require('../models/userModel');
const mongoose = require('mongoose')
const cartModel = require('../models/cartModel');
// const wishlistModel = require('../Models/wishlistModel')
const adminHelpers = require('../helpers/admin-helpers');
// const ProductModel = require('../models/productModel');

const isLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    console.log('session ok')
    next()


  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', (async (req, res) => {

  let session = req.session;
  let categories = await adminHelpers.getAllCategory()

  let products = await adminHelpers.getAllProducts()

  let banners = await adminHelpers.getAllBanners()

  res.render('user/index', { users: true, session, categories, banners, products })
  //         res.render('user/index', { users: true, session })
  req.session.LoginErr = false
})



  // res.render('user/index')

)


router.get('/login', function (req, res) {
  if (req.session.userloggedIn) {
    res.redirect('/')
  } else {
    let blocked = req.session.blocked
    res.render('user/user-login', { loginerr: req.session.userLoginErr, blocked });
    req.session.userLoginErr = false
  }

});

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.block) {
      req.session.blocked = true
      res.redirect('/login')
    } else {
      if (response.status) {
        req.session.userloggedIn = true
        req.session.user = response.user
        console.log(response)
        res.redirect('/')
      }
      else {
        req.session.userLoginErr = "Invalid user name or password"
        res.redirect('/login')
      }
    }
  })
})

router.get('/signup', (req, res, next) => {
  if (req.session.userloggedIn) {
    res.redirect('/')
  } else {
    let signupErr = req.session.check
    console.log(signupErr);
    res.render('user/user-signup', { signupErr })
    req.session.check = false
  }
})

router.post('/signup', (req, res) => {
  console.log(req.body)
  auth.userCheck(req.body.email).then((status) => {
    if (status.check) {
      req.session.check = true
      res.redirect('/signup')
    } else {
      auth.sendOtp(req.body.mobile).then((verification) => {
        req.session.mobile = req.body.mobile
        req.session.user = req.body
        res.redirect('/otp')
      })
    }

  })
})
router.post('/loginotp', (req, res) => {
  auth.checkMobile(req.body.mobile).then((status) => {
    console.log(status)
    if (!status.check) {
      req.session.exist = true
      res.redirect('/login')
    } else {
      auth.sendOtp(req.body.mobile).then((verification => {
        req.session.exist = false
        req.session.mobile = req.body.mobile
        req.session.user = status.user
        console.log(req.session.user);
        res.redirect('/loginotp')
      }))
    }
  })
})
router.get('/loginotp', (req, res) => {
  var mobile = req.session.mobile

  res.render('user/loginotp', { mobile })
})

router.post('/otpverify', (req, res) => {
  auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
    if (check === 'approved') {
      req.session.otpcheck = true
      req.session.userloggedIn = true

      res.redirect('/')
    } else {

      res.redirect('/loginotp')
    }
  })
})
router.get('/otp', ((req, res) => {
  var mobile = req.session.mobile


  res.render('user/signupotp', { mobile })
}))

router.post('/otp', ((req, res) => {
  auth.verifyOtp(req.body.otp, req.body.mobile).then((check) => {
    if (check === 'approved') {

      userHelpers.doSignup(req.session.user).then((data) => {
        req.session.user = data
        req.session.loggedIn = true
        req.session.userloggedIn = true
        res.redirect('/')
      })
    } else {

      res.redirect('/otp')
    }
  })
}))

router.get('/profile', (async (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let user = req.session.user
    let id = user._id
    let userData = await User.findOne({ _id: id })
    adminHelpers.getAllCategory().then((categories) => {
      res.render('user/userprofile', { userData: user, user: true, session, categories })
    })
  } else {
    let session = req.session.check
    res.redirect('/')
  }
}))
router.get('/update-profile', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let userData = req.session.user
    console.log(userData);
    adminHelpers.getAllCategory().then((categories) => {
      res.render('user/updateprofile', { userData, users: true, session, categories })
    })
  } else {
    let session = req.session.check
    res.redirect('/');
  }
})
router.post('/update-profile', (req, res) => {

  userHelpers.updateProfile(req.body).then(() => {
    res.redirect('/logout')
  })



})
router.get('/view-singleproduct/:id', async (req, res) => {
  let user = req.session.userloggedIn
  let session = req.session

  let categories = await adminHelpers.getAllCategory()
  let product = await adminHelpers.getProduct(req.params.id)
  res.render('user/singleproduct', { users: true, categories, session, product, user })

})
router.get('/viewproducts', async (req, res) => {
  let user = req.session.userloggedIn
  let session = req.session

  let categories = await adminHelpers.getAllCategory()
  let products = await adminHelpers.getAllProducts()

  res.render('user/products', { users: true, categories, session, products, user })

})


router.get('/viewproducts/:categoryname', async (req, res) => {
  let user = req.session.userloggedIn
  let session = req.session

  let categories = await adminHelpers.getAllCategory()
  let products = await adminHelpers.getProducts(req.params.categoryname)

  res.render('user/products', { users: true, categories, session, products, user })

})

/*---------------cart-----------------*/

router.post('/addToCart/:id', isLogin, (req, res) => {
  if(req.session.user){

    let userId = req.session.user._id;
    let productId = req.params.id;
    console.log(productId)
  
    userHelpers.addToCart(userId, productId).then(response => {
      res.json({ response,status:true })
    })
  }else{
    res.json({status:false});
  }
})


router.get('/cartpage', isLogin, (req, res) => {
  let session = req.session
  req.session.coupon=null
  req.session.discount=null
  userHelpers.getCartProducts(req.session.user._id).then((response) => {
    adminHelpers.getAllCategory().then((categories) => {
      if (response.notEmpty) {
        let cart = response.cart
        console.log(cart)
        res.render('user/view-cart', { user: true, cart, session, response, categories })
      } else {
        res.render('user/view-cart', { user: true, session, response, categories })
      }

    })

  })

})
router.get('/cartCount', (req, res) => {
  userHelpers.cartCount(req.session.user._id).then((response) => {
    res.json({ response })
  })
})
router.post('/changesize/:id', isLogin, (req, res) => {
  userHelpers.changeSize(req.params.id, req.session.user._id,req.body.size).then((response) => {
    res.json({ response })
  })
})

router.post('/quantityPlus/:id', isLogin, (req, res) => {
  userHelpers.quantityPlus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  })
})

router.post('/quantityMinus/:id', isLogin, (req, res) => {
  userHelpers.quantityMinus(req.params.id, req.session.user._id).then((response) => {
    res.json({ response })
  })
})

router.post('/deleteFromCart/:id', isLogin, (req, res) => {
  userHelpers.deleteFromCart(req.session.user._id, req.params.id).then((response) => {
    res.json({ response })
  })
})
router.post('/addToWishList/:id', isLogin, (req, res) => {
  if(req.session.user){
  userHelpers.addToWishList(req.session.user._id, req.params.id).then((response) => {
    console.log(response)
    res.json({ response,status:true })
  })
}else{
  res.json({status:false});
}
})

router.get('/wishlist', isLogin, (req, res) => {
  let session = req.session
  userHelpers.wishListProducts(req.session.user._id).then((response) => {
    if (response.notEmpty) {
      let wishListItems = response.products.wishListItems
      res.render('user/wishlist', { user: true, session, response, wishListItems })
    } else {
      res.render('user/wishlist', { user: true, session, response })
    }
  })
})

router.get('/checkWishlist/:id', isLogin, (req, res) => {
  userHelpers.checkWishlist(req.session.user._id, req.params.id).then((wishList) => {
    res.json({ wishList })
  })
})

router.post('/removeWishListItem/:id', isLogin, (req, res) => {
  userHelpers.removeWishListItem(req.session.user._id, req.params.id).then((response) => {
    res.json({ response })
  })
})

router.get('/checkWishlist/:id', (req, res) => {
  userHelpers.checkWishlist(req.session.user._id, req.params.id).then((wishlist) => {
    res.json({ wishlist })
  })
})
router.get('/checkout', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let userData = req.session.user
    console.log(userData);
    userHelpers.getCartProducts(req.session.user._id).then((response) => {
      adminHelpers.getAllCategory().then((categories) => {
        userHelpers.getAddress(req.session.user._id).then((address) => {
          let cart = response.cart
          console.log(cart )
          if (req.session.discount) {
            cart.discount = req.session.discount
            cart.grandTotal = req.session.grandTotal
          }
          userHelpers.cartTotal(cart).then((response) => {
            console.log(response)
            res.render('user/checkout', { userData, users: true, session, address, cart, categories, response })
          })
        })
      })
    })
  } else {
    let session = req.session.check
    res.redirect('/');
  }
})


router.post('/applyCoupon', isLogin, (req, res) => {
  userHelpers.applyCoupon(req.body, req.session.user._id).then((response) => {
    if (response.status) {
      console.log(response)
      req.session.coupon = response.coupon
      req.session.discount = response.discount
    }
    res.json({ response })
  })
})


router.post('/placeOrder', isLogin, (req, res) => {
  userId = req.session.user._id;
  orderDetails = req.body
  if (req.session.coupon) {
    orderDetails.discount = req.session.discount
  }
  userHelpers.PlaceOrder(orderDetails, userId).then((order) => {
    console.log(order, "PlaceOrder")
    if (order.paymentDetails === 'COD') {
      console.log("asdfasfafa aslfdka fasfd")
      res.json({ order })
    } else {

      userHelpers.generateRazorPay(order).then((data) => {
        res.json({ data })
      })
    }
  })
})

router.get('/orderSuccess/:id', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session

    let userData = req.session.user
    console.log(req.params.id)
    userHelpers.getOrder(req.params.id).then((order) => {
      console.log(order)
          res.render('user/orderSuccess', { userData, order, user: true, session})
        })
    
  }
  else {
    let session = req.session.check
    res.redirect('/');
  }
})
router.post('/verifyPayment',isLogin, (req, res)=>{
  console.log(req.body)
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changeOrderStatus(req.body,req.session.user._id).then(()=>{
      res.json({status: true});
    })
  })
})
router.get('/orders', (async (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let user = req.session.user


    adminHelpers.getAllCategory().then((categories) => {
      userHelpers.getUserOrders(req.session.user._id).then((orders) => {
       console.log(orders)
        res.render('user/view-orders', { userData: user, user: true, session, orders, categories })
      })
    })
  } else {
    let session = req.session.check
    res.redirect('/')
  }
}))

router.get('/viewaddress', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let userData = req.session.user
    console.log(userData);
    adminHelpers.getAllCategory().then((categories) => {
      userHelpers.getAddress(req.session.user._id).then((address) => {
        res.render('user/address', { userData, users: true, session, address, categories })
      })
    })
  } else {
    let session = req.session.check
    res.redirect('/');
  }
})

router.get('/addaddress', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session
    let userData = req.session.user
    console.log(userData);
    adminHelpers.getAllCategory().then((categories) => {

      res.render('user/addaddress', { userData, users: true, session, categories })
    })

  } else {
    let session = req.session.check
    res.redirect('/');
  }
})

router.post('/address', isLogin, (req, res) => {
  // userId = req.session.user._id;
  console.log('helloo')
  userHelpers.addAddress(req.body, req.session.user._id).then((address) => {
    res.redirect('/checkout')
  })
})
router.get('/cancel-order/:id', (req, res) => {
 
 let orderId = req.params.id;
  userHelpers.cancelOrder(orderId).then((response) => {
    res.redirect('/orders')
  })
})
// router.get('/view-singleorder', (req, res) => {
//   if (req.session.userloggedIn) {
//     let session = req.session
//     let userData = req.session.user
//     console.log(userData);
//     adminHelpers.getAllCategory().then((categories) => {

//       res.render('user/view-singleorder', { userData, users: true, session, categories })
//     })

//   } else {
//     let session = req.session.check
//     res.redirect('/');
//   }
// })

router.get('/view-singleorder/:id', (req, res) => {
  if (req.session.userloggedIn) {
    let session = req.session

    let userData = req.session.user
    console.log(req.params.id)
    userHelpers.getOrder(req.params.id).then((order) => {
      console.log(order)
          res.render('user/view-singleorder', { userData, order, user: true, session})
        })
    
  }else {
    let session = req.session.check
    res.redirect('/');
  }
})


router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

module.exports = router;
