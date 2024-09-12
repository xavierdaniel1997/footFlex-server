
import Order from "../models/orderModel.js";
      
const generateReport = async (startDate, endDate) => {
    // console.log("this is first of generate report", startDate, endDate)
    const pipeline = [
        {
            $match: {
                createdAt: {$gte: startDate, $lte: endDate},
                status: {$in: ["Delivered", "Shipped"]}
            }
        },
        {
            $unwind: "$items"
        }, 
                                      

        {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                productId: '$items.product',
                productName: '$items.productName',
                thumbnail: '$items.thumbnail',
                productBrand: '$items.productBrand',
                totalPrice: '$items.totalPrice',
                finalPrice: '$items.finalPrice',
              },
              totalQuantity: { $sum: '$items.quantity' },                   
              totalRevenue: { $sum: '$items.totalPrice' },
              // totalRevenue: { $sum: '$items.finalPrice' },
              orderCount: { $sum: 1 }
            }
          },


          {
            $group: {
              _id: '$_id.date',
              products: {
                $push: {
                  productId: '$_id.productId',
                  productName: '$_id.productName',
                  productBrand: '$_id.productBrand',
                  thumbnail: '$_id.thumbnail',
                  quantity: '$totalQuantity',
                  revenue: '$totalRevenue',
                  totalPrice: '$_id.totalPrice',
                  // finalPrice: '$_id.finalPrice',
                }
              },                                
              dailyTotalRevenue: { $sum: '$totalRevenue' },
              dailyTotalQuantity: { $sum: '$totalQuantity' },
              dailyOrderCount: { $sum: '$orderCount' }
            }
          },
                                  
                

          {
            $sort: { _id: 1 }
          }  
    ]

    const result = await Order.aggregate(pipeline) 
    // console.log("this is frm the generate Report", result)   

    return processReportResults(result)

}

const processReportResults = (result) => {

  let totalRevenue = 0;
  let totalQuantity = 0;
  let totalOrders = 0;
  const productPerformance = {};



  const dailyData = result.map(day => {
    totalRevenue += day.dailyTotalRevenue;
    totalQuantity += day.dailyTotalQuantity;
    totalOrders += day.dailyOrderCount;

    const dailyProducts = day.products.map(product => {
      // console.log("this  is inside products", product) 
        if(!productPerformance[product.productId]) {
            productPerformance[product.productId] = {
                productId: product.productId,
                productName: product.productName,
                thumbnail: product.thumbnail,
                productBrand: product.productBrand,
                totalPrice: product.totalPrice,    
                // finalPrice: product.finalPrice,  
                totalQuantity: 0,
                totalRevenue: 0,
                dates: [] 
            }
        }

        productPerformance[product.productId].totalQuantity += product.quantity;
        productPerformance[product.productId].totalRevenue += product.revenue;
        productPerformance[product.productId].dates.push(day._id); 

        return {
            productId: product.productId,
            productName: product.productName,
            quantity: product.quantity,
            revenue: product.revenue
        };
    });

    return {
        date: day._id,
        revenue: day.dailyTotalRevenue,
        quantity: day.dailyTotalQuantity,
        orderCount: day.dailyOrderCount,
        products: dailyProducts 
    };
});


  const topProducts = Object.values(productPerformance)
  .sort((a,b) => b.totalRevenue - a.totalRevenue)
  .slice(0, 10)
  .map(product => ({
      ...product,
      dates: [...new Set(product.dates)].sort() 
  }));

  const topProductsSummary = {
    totalRevenue: topProducts.reduce((sum, product) => sum + product.totalRevenue, 0),
    totalQuantity: topProducts.reduce((sum, product) => sum + product.totalQuantity, 0),
    averageRevenue: topProducts.reduce((sum, product) => sum + product.totalRevenue, 0) / topProducts.length,
    averageQuantity: topProducts.reduce((sum, product) => sum + product.totalQuantity, 0) / topProducts.length
  };

  return{
    summary: {
      totalRevenue,
      totalQuantity,
      totalOrders,
      averageOrderValue: totalRevenue / totalOrders
    },
    dailyData,
    topProducts,
    topProductsSummary
  }
}


export {generateReport}