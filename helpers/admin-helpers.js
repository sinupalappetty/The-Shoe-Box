const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel');
const categoryModel = require('../Models/categoryModel');
const productModel = require('../Models/productModel');
const bannerModel = require('../Models/bannerModel');
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')


module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let email = adminData.email
            let password = adminData.password

            let admin = await adminModel.find({ email: email, password: password })
            console.log("admin found");

            let response = {}
            if (admin) {
                response.status = true
                response.admin = admin
                resolve(response)
            } else {
                response.status = false
                console.log("wrong admin");

                resolve(response)
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userdetails = await userModel.find({}).lean()
            resolve(userdetails)
        })
    },
    blockUser: (usrId) => {
        return new Promise(async (resolve, reject) => {
            let user = await userModel.findById(usrId).lean()
            if (user.status) {
                userModel.findByIdAndUpdate(usrId, { status: false }).then((data) => {
                    resolve(data)
                })
            }
            else {
                userModel.findByIdAndUpdate(usrId, { status: true }).then((data) => {
                    resolve(data)
                })


            }
        })
    },



    addProduct: (productDetails, image) => {
        return new Promise(async (resolve, reject) => {
            let productimage = image
            let { productname, productdescription,productsizes, productprice, productcategory } = productDetails
           console.log(productsizes+' sizes')
            let product = await productModel.findOne({ productname })
            let status = {
                check: false
            }
            if (product) {
                status.check = true
                resolve(status)
            } else {
                newProduct = new productModel({
                    productname,
                    productdescription,
                    productimage,
                    productsizes,
                    productprice,

                    productcategory
                }
                )
                newProduct.save().then((data) => {
                    // console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await productModel.find({}).lean()
            resolve(products)
        })
    },
    getProducts: (categoryname) => {
        return new Promise(async (resolve, reject) => {
            // let category = req.params.categoryname
            let products = await productModel.find({productcategory:categoryname}).lean()
            resolve(products)
        })
    },
  
    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            productModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await productModel.findOne({ _id: id }).lean()
            resolve(product)
        })
    },
     editProduct: (details, image) => {
        return new Promise((resolve, response) => {
            let productimage = image
            productModel.findByIdAndUpdate(details.id, { productname: details.productname, productdescription: details.productdescription, productimage: productimage,productsizes: details.productsizes, productprice: details.productprice, productcategory: details.productcategory }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },





    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await categoryModel.find({}).lean()
            console.log('sfsd')
            resolve(categories)
        })
    },
  

    addCategory: (categoryDetails,image) => {
        return new Promise(async (resolve, reject) => {
            let categoryimage = image
            let { categoryname,description } = categoryDetails
            let alias = categoryname.toLowerCase();
            let category = await categoryModel.findOne({ alias })
            let status = {
                check: false
            }
            if (category) {
                status.check = true
                resolve(status)
            } else {
                newCategory = new categoryModel({
                    categoryname,
                    alias,
                    description,
                    categoryimage
                }
                )
                newCategory.save().then((data) => {
                    console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },

    deleteCategory: (id) => {
        return new Promise((resolve, reject) => {
            categoryModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.findOne({ _id: id }).lean()
            resolve(category)
        })
    },
    editCategory: (details) => {
        return new Promise((resolve, response) => {
            categoryModel.findByIdAndUpdate(details.id, { categoryname: details.categoryname }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },



    addBanner: (bannerDetails, image) => {
        return new Promise(async (resolve, reject) => {
            let banner = image
            let { title, caption, category } = bannerDetails

            let Banner = await bannerModel.findOne({ title })
            let status = {
                check: false
            }
            if (Banner) {
                status.check = true
                resolve(status)
            } else {
                newBanner = new bannerModel({
                    banner,
                    title,
                    caption,
                    category
                }
                )
                newBanner.save().then((data) => {
                    console.log(data)
                    status.data = data
                    resolve(status)
                })
            }
        })
    },
    getAllBanners: () => {
        return new Promise(async (resolve, reject) => {
            let banners = await bannerModel.find({}).lean()
            // console.log(banners)
            resolve(banners)
        })
    },
    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            bannerModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            let banner = await bannerModel.findOne({ _id: id }).lean()
            resolve(banner)
        })
    },
    editBanner: (details,image) => {
        return new Promise((resolve, response) => {
            let bannerimage =image
            bannerModel.findByIdAndUpdate(details.id, { banner: bannerimage, title: details.title, caption: details.caption, category: details.category }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            couponModel.find({}).lean().then((coupons)=>{
                console.log(coupons+'sinu')
                resolve(coupons)
            })
        })
    }, 
    addCoupon:(couponData)=>{

        return new Promise(async(resolve,reject)=>{
    
            let {name,code,description,percentage} = couponData
            // code = code.toUpperCase()

            console.log(couponData.name +'shifs')
            let response = {}
            let coupon = await couponModel.findOne({code:couponData.code})
            if(coupon){
                response.exist = true
                resolve(response)
            }else{
                newCoupon = new couponModel({
                    name,
                    code,
                    description,
                    percentage
                })
                newCoupon.save().then((data)=>{
                    console.log(data+'hi')
                    response.exist=false
                    resolve(response)
                })
            }
        })
    },
    getCoupon: (id) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await couponModel.findOne({ _id: id }).lean()
            resolve(coupon)
        })
    },
    editCoupon: (data) => {
        return new Promise((resolve, response) => {
        
            couponModel.findByIdAndUpdate(data.id, {  name: data.name,
                      code: data.code,
                     description: data.description,
                      percentage: data.percentage, }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    deleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            couponModel.findByIdAndDelete(id).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderdetails= await orderModel.find({}).sort({date:-1,time:-1}).populate('user').populate('deliveryDetails').populate('orderItems.product').lean()
            console.log(JSON.stringify(orderdetails) +"bdbsd")
            resolve(orderdetails) 
        })
    },
    getOrders:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let orderdetails = await orderModel.findOne({_id:id}).lean()
            resolve(orderdetails)
        })
    },
    
    changeOrderStatusShipped:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'shipped'}
            })
             resolve(order)
           
           
        })
    },
    changeOrderStatusdelivered:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'delivered'}
            })
             resolve(order)
           
           
        })
    
    
    },
    changeOrderStatusarriving:(orderId)=>{
        console.log(orderId);
        return new Promise(async(resolve,reject)=>{
          let order=await orderModel.findByIdAndUpdate({_id:orderId},{
                $set:{orderStatus:'arriving'}
            })
             resolve(order)
           
           
        })
    
    
    },
    getUsersCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let usercount= await userModel.count()
            resolve(usercount)
        })
    },
    getProductCount:()=>{
        return new Promise(async (resolve, reject) => {
            let productcount= await productModel.count() 
            resolve(productcount)
        })
    },
    getOrderCount:()=>{
        return new Promise(async (resolve, reject) => {
            let ordercount= await orderModel.count() 
            resolve(ordercount)
        })
    },
    findTotalCOD:()=>{
        return new Promise(async (resolve, reject) => {
            const totalCod = await orderModel.find({ paymentDetails: 'COD' }).count()
            console.log(totalCod)
            resolve(totalCod);
        })
    },
    findTotalOnline: () => {
        return new Promise(async (resolve, reject) => {
            const totalOnline = await orderModel.find({ paymentDetails: 'online' }).count()
            console.log(totalOnline)
            resolve(totalOnline);
        })
    },
    totalShipped:()=>{
    
        return new Promise(async (resolve, reject) => {
            const totalShipped = await orderModel.find({ orderStatus: 'shipped' }).count()
            resolve(totalShipped);
        })
    },

    getAllDeliveredOrder:()=>{
        return new Promise(async (resolve, reject)=>{
            const totalDeliverdOrder = await orderModel.find({orderStatus:'delivered'}).sort({date:-1}).populate('user').populate('deliveryDetails').populate('orderItems.product').lean()
            resolve(totalDeliverdOrder)
        })
        
    }
    ,getUsersCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let usercount= await userModel.count()
         
            resolve(usercount)
        })
    },
    getProductCount:()=>{
        return new Promise(async (resolve, reject) => {
            let productcount= await productModel.count() 
            resolve(productcount)
        })
    },
    getOrderCount:()=>{
        return new Promise(async (resolve, reject) => {
            let ordercount= await orderModel.count() 
            resolve(ordercount)
        })
    },
    totalDelivered:()=>{

        return new Promise(async (resolve, reject) => {
            const totalDelivered = await orderModel.find({ orderStatus: 'delivered' }).count()
            resolve(totalDelivered);
        })
    },
    getTodayRevenue:()=>{

        return new Promise(async (resolve, reject) => {
           try{
            let  todayrevenue = await orderModel.aggregate([
                {
                    $unwind: '$orderItems'
                },
                {
                    $match: {
                        'date': new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
                       
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$totalPrice'
                        }
                    }
                }
            ])
            if (todayrevenue[0]) {
                resolve(todayrevenue[0].total)
            } else {
                resolve(todayrevenue = 0)
            }
        } catch (error) {
            reject(error)
        }
    })
},
getTotalRevenue:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  totalrevenue = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
            
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice'
                    }
                }
            }
        ])
        if (totalrevenue[0]) {
            resolve(totalrevenue [0].total)
        } else {
            resolve(totalrevenue  = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},

getTotalSales:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  totalsales = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
           
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$orderItems.quantity'
                    }
                }
            }
        ])
        if (totalsales[0]) {
            resolve(totalsales[0].total)
        } else {
            resolve(totalsales = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},
getTodaySales:()=>{

    return new Promise(async (resolve, reject) => {
       try{
        let  todaysales = await orderModel.aggregate([
            {
                $unwind: '$orderItems'
            },
            {
                $match: {
                    'date': new Date().getDate()+"-"+(new Date().getMonth()+1)+"-"+new Date().getFullYear()
                   
                }
            },
           
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$orderItems.quantity'
                    }
                }
            }
        ])
        if (todaysales[0]) {
            resolve(todaysales [0].total)
        } else {
            resolve(todaysales  = 0)
        }
    } catch (error) {
        reject(error)
    }
})
},

     
getRecentOrders: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let recentOrders = await orderModel.aggregate([
                {
                    $match: { orderStatus: 'Placed' }
                },
                {
                     $sort: {date :-1,time:-1 }
                 },
                 {
                    $unwind: '$orderItems'
                 },
                 {
                    $limit: 10
                 }, 
                {
                    $project:{
                    _id:0,
                     user:1,
                        'orderItems.product' : 1,
                        paymentDetails:1,
                        date:1

                    } 
                },
                {
                    $lookup:{
                        from:'users',
                        localField:'user',
                        foreignField : '_id',
                        
                        as:'user'

                    } 
                },
                 {
                    $lookup:{
                        from:'products',
                        localField:'orderItems.product',
                        foreignField : '_id',
                        
                        as:'product'

                    } 
                },
                {
                    $unwind: '$product'
                },
                {
                    $unwind: '$user'
                },
                {
                    $project:{
                       'product.productname' :1,
                        'product.productimage' :1,
                        'product.productprice' : 1,
                         paymentDetails:1,
                         date:1,
                         'user.name':1

                    } 
                },


             ])
             console.log(recentOrders)
             if (recentOrders) {
                console.log(recentOrders+'gh')
                resolve(recentOrders)
             } else {
                resolve(recentOrders = 0)
             }
        } catch (error) {
            reject(error)
        }
    })
},
    

    
    
  
}