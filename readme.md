 const { gender, brands, categories, priceRanges } = req.query;
  
      // Step 1: Build the match stage
      const matchStage = { $match: {} };
  
      // Add gender filter if provided
      if (gender) {
        matchStage.$match.gender = gender;
      }
  
      // Add brand filter if provided
      if (brands) {
        const brandIds = brands.split(',').map(id => new mongoose.Types.ObjectId(id));
        matchStage.$match.brand = { $in: brandIds };
      }
  
      // Add category filter if provided
      if (categories) {
        const categoryIds = categories.split(',').map(id => new mongoose.Types.ObjectId(id));
        matchStage.$match.category = { $in: categoryIds };
      }
  
      // Add price range filter if provided
      if (priceRanges) {
        const priceRangesArray = priceRanges.split(',').map(range => {
          const [min, max] = range.split('-').map(Number);
          return { salePrice: { $gte: min, $lte: max } };
        });    
        matchStage.$match.$or = priceRangesArray;
      }
  
      // Step 2: Build the aggregation pipeline
      const pipeline = [
        matchStage,
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brand'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $unwind: '$brand'
        },
        {
          $project: {
            _id: 1,
            productName: 1,
            description: 1,
            gender: 1,
            stock: 1,
            regularPrice: 1,
            salesPrice: 1,
            salePrice: 1,
            sizes: 1,
            thumbnail: 1,
            gallery: 1,
            status: 1,
            'category._id': 1,
            'category.categoryName': 1,
            'brand._id': 1,
            'brand.brandName': 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ];
  
      // Step 3: Execute the aggregation
      const products = await Products.aggregate(pipeline);
  