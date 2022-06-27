import Deliveries from '@/models/Deliveries.model';
import Products from '@/models/Products.model';

const find = async (req) => {
  // some vars
  const query = req.query;
  let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
  let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;
  ;

  let totalResults = (await  await Deliveries.aggregate(
    [
      { "$lookup": {
        "from": 'products',
        "localField": "products",
        "foreignField": "_id",
        "as": "products"
      }},
      { "$match": {$and:[
          {"products.weight": { "$gte": parseInt(query.weight) } },
          {"when": {$gte: new Date(query.dateFrom), $lt: new Date(query.dateTo)}}
        ]}
      }
    
    ]
  )).length
  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`
      }
    }
  }
  let deliveries = await Deliveries.aggregate(
  [
    { "$lookup": {
      "from": 'products',
      "localField": "products",
      "foreignField": "_id",
      "as": "products"
    }},
    { "$unwind": "$products" },
    { "$match": {$and:[
        {"products.weight": { "$gte": parseInt(query.weight) } },
        {"when": {$gte: new Date(query.dateFrom), $lt: new Date(query.dateTo)}}
      ]}
    },{ $skip: skip }, { $limit:limit }
  
  ]
)
  return {
    totalResults: totalResults,
    deliveries
  }
}

const create = async (req) => {
  try {
    await Deliveries.create(req.body);
  } catch (e) {
    throw {
      code: 400,
      data: {
        message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`
      }
    }
  }
}

const findOne = async (req) => {
  let delivery = await Deliveries.findOne({_id: req.body.id});
  if (!delivery) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find a delivery with the sent ID`
      }
    }
  }
  return delivery;
}

export default {
  find,
  create,
  findOne
}
