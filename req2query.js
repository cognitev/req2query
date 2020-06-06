const sequelize = require('sequelize');
const Op = sequelize.Op;

const generator = function(modelAttr) {
  return (req, res, next) => {
    const extractedAtrr = extractAttr(req, modelAttr);
    req.sequelizeQuery = matchAttr(extractedAtrr);

    next();
  };
};

const extractAttr = function(req, modelAttr) {
  const extractedAttr = {};

  const { query } = req;

  for (let propertyName in query) {
    let [key, op] = propertyName.split('__');

    const supportedOPerations = ['gte', 'gt', 'lte', 'lt'].includes(op);

    if (!supportedOPerations && typeof op !== 'undefined') continue;

    if (modelAttr[key]) {
      const model = modelAttr[key]['model'];

      if (!extractedAttr[model]) extractedAttr[model] = {};

      if (op) {
        const extract = { value: query[propertyName], op };

        if (extractedAttr[model][key]) {
          extractedAttr[model][key].push(extract);
        } else {
          extractedAttr[model][key] = [extract];
        }
      } else {
        if (modelAttr[key]['type'] === 'Boolean') {
          if (JSON.parse(query[key]))
            extractedAttr[model][key] = [true];
          else
            extractedAttr[model][key] = { [Op.not]: true };
        } else {
          extractedAttr[model][key] = (Array.isArray(query[key])) ? query[key] : [query[key]];
        }
      }
    }
  }
  return extractedAttr;
};

const matchAttr = function(extractedAttr) {
  const matchedObj = {};

  for (let modelName in extractedAttr) {
    const model = extractedAttr[modelName];

    let where = {};
    for (let propertyName in model) {
      if (Array.isArray(model[propertyName])) {
        if (typeof model[propertyName][0] !== 'object') {
          where[propertyName] = model[propertyName];
        } else {
          if (model[propertyName].length === 1){
            where[propertyName] = getOPerator(model[propertyName][0]);
          } else {
            where[propertyName] = getAndOperator(model[propertyName]);
          }
        }
      } else {
        where[propertyName] = model[propertyName];
      }
      matchedObj[modelName] = { where };
    }
  }
  return matchedObj;
};

function getOPerator(property) {
  return {
    [Op[property.op]]: property.value,
  };
}

function getAndOperator(properties) {
  const condidtions = [];

  properties.forEach(property => {
    condidtions.push(getOPerator(property));
  });

  return { [Op.and]: condidtions };
}

module.exports = {
  generator,
  extractAttr,
  matchAttr,
};
