var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const Admin = require('../models/adminModel');
const adminHelpers = require('../helpers/admin-helpers')
const multer = require('../helpers/multer');



function isLogin(req,res,next){
  if(req.session.isAthenticated){
    console.log('heloooooiii')
      next()
  }else{
      console.log(req.session.isAthenticated+"asdfsd");
      res.redirect('/admin')
  }
}

/* GET home page. */
router.get('/', async(req, res, next)=> {
  console.log(req.session.adminLoggedIn)
  if (req.session.admin) {
   
    res.redirect('/adminhome');
  } else {
    res.render('admin/admin-login')
    req.session.adminLoggErr = false;
  }
});

router.post('/', async (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      console.log(response);
      console.log("response");

      req.session.admin = response.admin
      req.session.adminLoggedIn = true
      req.session.isAthenticated=true
      res.redirect('/admin/adminhome')
    } else {
      req.session.adminLoginErr = "Invalid email or password"
      res.redirect('/admin')
    }
  })
});

router.get('/adminhome',isLogin, async (req, res, next) =>{
  console.log(req.session.adminLoggedIn)
  if (req.session.admin) {
    let totalUser = await adminHelpers.getUsersCount()
    let productCount = await adminHelpers.getProductCount()
    let totalOrder =await adminHelpers.getOrderCount()
    let delivered = await adminHelpers.totalDelivered()
    let todayRevenue = await adminHelpers.getTodayRevenue()
    let totalRevenue = await adminHelpers.getTotalRevenue()
    let todaySales = await adminHelpers.getTodaySales()
    let totalSales = await adminHelpers.getTotalSales()
    let recentOrders = await adminHelpers.getRecentOrders()
    res.render('admin/admin-home',{totalUser,productCount,totalOrder,delivered,todayRevenue,totalRevenue,todaySales,totalSales,recentOrders});
  } else {
    res.redirect('/admin')
    req.session.adminLoggErr = false;
  }
});

router.get('/view-user',isLogin, function (req, res, next) {
  adminHelpers.getAllUsers().then((userdetails) => {
    if (req.session.admin) {
      res.render('admin/view-user', { users: userdetails });
    } else {
      res.redirect('/admin')
      req.session.adminLoggErr = false;
    }
  })
});
router.get('/block-user/:id',isLogin, (req, res, next) => {
  let usrId = req.params.id;
  adminHelpers.blockUser(usrId).then((response) => {

    res.redirect('/admin/view-user')
  })
});




router.get('/view-products',isLogin, function (req, res, next) {
  adminHelpers.getAllProducts().then((products) => {
    if (req.session.admin) {
      res.render('admin/view-products', { products });
    } else {
      res.redirect('/admin')
      req.session.adminLoggErr = false;
    }
  })
});

router.get('/add-product',isLogin, (req, res) => {

  let exist = req.session.productexist
  adminHelpers.getAllCategory().then((categories) => {


  res.render('admin/add-product', { exist,categories })
  })
});
router.post('/add-product',isLogin, multer.upload.array('productimage', 4), (req, res) => {
  let images = []
  files = req.files
  console.log(files)
  images = files.map((value) => {
    return value.filename
  })
  adminHelpers.addProduct(req.body, images).then((response) => {
    console.log(response)
    if (response.check) {
      req.session.productexist = true
      res.render('admin/add-product', { exist: req.session.productexist })
      req.session.productexist = false

    } else {
      res.redirect('/admin/view-products')
    }
  })
});

router.get('/edit-product/:id',isLogin, async (req, res) => {

  if (req.session.adminLoggedIn) {
    let product = await adminHelpers.getProduct(req.params.id)
    res.render('admin/edit-product', { product })

  } else {
    res.redirect('/admin');
  }
});

router.post('/edit-product',isLogin, multer.upload.array('productimage'), (req, res) => {
  let images = []
  files = req.files
  console.log(files)
  images = files.map((value) => {
    return value.filename
  })
  adminHelpers.editProduct(req.body, images).then(() => {
    res.redirect('/admin/view-products')
  })
});
router.get('/delete-product/:id',isLogin, (req, res) => {
  adminHelpers.deleteProduct(req.params.id).then(() => {
    res.redirect('/admin/view-products')
  })
});







router.get('/view-category',isLogin, (req, res) => {
  if (req.session) {
    adminHelpers.getAllCategory().then((categories) => {
      res.render('admin/view-categories', { categories })
    })
  } else {
    res.redirect(302, '/admin/login')
  }
});
router.get('/add-category',isLogin, (req, res) => {

  let exist = req.session.categoryexist


  res.render('admin/addcategory', { exist })
});

router.post('/add-category',isLogin,multer.upload.single('categoryimage'), (req, res) => {
  // let image = req.file.filename
  
  adminHelpers.addCategory(req.body,req.file.filename).then((response) => {
    console.log(response)
    if (response.check) {
      req.session.categoryexist = true
      res.render('admin/addcategory', { exist: req.session.categoryexist })
      req.session.categoryexist = false

    } else {
      res.redirect('/admin/view-category')
    }
  })
});
router.get('/edit-category/:id',isLogin, async (req, res) => {

  if (req.session.adminLoggedIn) {
    let categories = await adminHelpers.getCategory(req.params.id)
    res.render('admin/editcategory', { categories })

  } else {
    res.redirect('/admin');
  }
});

router.post('/edit-category',isLogin, (req, res) => {
  adminHelpers.editCategory(req.body).then(() => {
    res.redirect('/admin/view-category')
  })
});
router.get('/delete-category/:id',isLogin, (req, res) => {
  adminHelpers.deleteCategory(req.params.id).then(() => {
    res.redirect('/admin/view-category')
  })
});




router.get('/view-banners',isLogin, function (req, res, next) {
  adminHelpers.getAllBanners().then((banners) => {
    if (req.session.admin) {
      res.render('admin/view-banners', { banners });
    } else {
      res.redirect('/admin')
      req.session.adminLoggErr = false;
    }
  })
});

router.get('/add-banner',isLogin, (req, res) => {

  let exist = req.session.bannerexist


  res.render('admin/add-banner', { exist })
});
router.post('/add-banner',isLogin, multer.upload.single('banner'), (req, res) => {
  if (req.session.adminLoggedIn) {
    adminHelpers.addBanner(req.body, req.file.filename).then((response) => {
      // console.log(response)
      if (response.check) {
        req.session.bannerexist = true
        res.render('admin/add-banner', { exist: req.session.bannerexist })
        req.session.bannerexist = false

      } else {
        res.redirect('/admin/view-banners')
      }
    })
  }
    else {
      res.redirect('/admin')
    }
  
});

router.get('/edit-banner/:id', async (req, res) => {

  if (req.session.adminLoggedIn) {
    let categories = await adminHelpers.getAllCategory(req.params.id)
    let banner = await adminHelpers.getBanner(req.params.id)
    res.render('admin/edit-banner', {banner,categories})

  } else {
    res.redirect('/admin');
  }
});

router.post('/edit-banner',multer.upload.single('banner'), (req, res) => {
  if (req.session.adminLoggedIn) {
    let image=req.file.filename
    console.log(image)
  adminHelpers.editBanner(req.body,req.file.filename).then(() => {
 
    res.redirect('/admin/view-banners')
  })
}else{
  res.redirect('/admin');
}
});

router.get('/delete-banner/:id',(req,res)=>{
  adminHelpers.deleteBanner(req.params.id).then(()=>{
      res.redirect('/admin/view-banners')
  })
});


// router.get('/view-coupons',isLogin,(req,res)=>{
//   adminHelpers.getCoupons().then((coupons)=>{
//     console.log(coupons)
//       res.render('admin/coupons',{coupons,admin:true})
//   })
// })
router.get('/view-coupons', function (req, res, next) {
  adminHelpers.getCoupons().then((coupons) => {
    if (req.session.admin) {
      res.render('admin/coupons', { coupons });
    } else {
      res.redirect('/admin')
      req.session.adminLoggErr = false;
    }
  })
});
router.get('/newCoupon', (req, res) => {

  let exist = req.session.couponexist


  res.render('admin/add-coupon', { exist })
});

// router.post('/newCoupon',isLogin,(req,res)=>{
//   adminHelpers.addCoupon(req.body).then((response)=>{
//       res.redirect('/admin/view-coupons')
//   })
// })
router.post('/newCoupon', (req, res) => {
  if (req.session.adminLoggedIn) {
    adminHelpers.addCoupon(req.body).then((response) => {
      console.log(response)
      if (response.check) {
        req.session.couponexist = true
        res.render('admin/add-coupon', { exist: req.session.couponexist })
        req.session.couponexist = false

      } else {
        res.redirect('/admin/view-coupons')
      }
    })
  }
    else {
      res.redirect('/admin')
    }
  
});

router.get('/edit-coupon/:id', async (req, res) => {

  if (req.session.adminLoggedIn) {
    let categories = await adminHelpers.getAllCategory(req.params.id)
    let coupon = await adminHelpers.getCoupon(req.params.id)
    console.log(coupon)
    res.render('admin/edit-coupon', {coupon,categories})

  } else {
    res.redirect('/admin');
  }
});

// router.post('/editCoupon/:id',isLogin, (req, res) => {
//   adminHelpers.editCoupon(req.body,req.params.id).then((data) => {
//       res.redirect('/admin/view-coupons')
   
//   })
// })
router.post('/edit-coupon',(req, res) => {
  if (req.session.adminLoggedIn) {
  
    
  adminHelpers.editCoupon(req.body).then(() => {
 
    res.redirect('/admin/view-coupons')
  })
}else{
  res.redirect('/admin');
}
});

router.get('/delete-Coupon/:id',isLogin,(req, res) => {
  adminHelpers.deleteCoupon(req.params.id).then((data) => {
    res.redirect('/admin/view-coupons')
  })
})

// router.get('/view-orders', function (req, res, next) {
//   // adminHelpers.getAllorders().then((userdetails) => {
//     if (req.session.admin) {
//       res.render('admin/view-orders');
//     } else {
//       res.redirect('/admin')
//       req.session.adminLoggErr = false;
//     }
//   })
// // });
router.get('/view-orders',isLogin, function (req, res, next) {
 
  adminHelpers.getAllUsers().then((userdetails) => {
    console.log(userdetails+'dfghjkl')
  adminHelpers.getAllOrders().then((orderdetails) => { 
      console.log(orderdetails+'dfghjkl')
    if (req.session.adminLoggedIn) {
      res.render('admin/view-orders', { userdetails,orderdetails});
      
    } else {
      res.redirect('/admin')
    }
  })
  }
  )
});
router.get('/orderstatus-shipped/:id',isLogin,(req, res) => {
  
   adminHelpers.changeOrderStatusShipped(req.params.id).then(() => {
     res.redirect('/admin/view-orders')
   })
 })
 router.get('/orderstatus-delivered/:id',isLogin, (req, res) => {
   
  
  adminHelpers.changeOrderStatusdelivered(req.params.id).then(() => {
    res.redirect('/admin/view-orders')
  })
})
 router.get('/orderstatus-arriving/:id',isLogin, (req, res) => {
   
  
  adminHelpers.changeOrderStatusarriving(req.params.id).then(() => {
    res.redirect('/admin/view-orders')
  })
})
router.get('/revenueChart',isLogin, (req, res) => {
  adminHelpers.getAllOrders().then(orders => {
      res.json({orders})
  })
})
router.get('/revenueChart1',isLogin, (req, res) => {
  adminHelpers.findTotalCOD().then(COD => {
    adminHelpers.findTotalOnline().then(online => {
      //  console.log(COD)
      let orders = {
        COD:COD,
        online:online
      }
      console.log(orders)
      res.json({orders})
      
    })
  })
})
router.get('/report',isLogin,async(req,res)=>{
  let deliveredOrder = await adminHelpers.getAllDeliveredOrder()
    res.render('admin/report',{deliveredOrder,admin:true})
  })





router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/admin');
});
module.exports = router;