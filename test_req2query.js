const assert = require("assert");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const extractAttr = require("./req2query").extractAttr;
const matchedObject = require("./req2query").matchAttr;

const modelAttr = {
  started_at: {
    type: "Date",
    model: "campaign",
  },
  amount: {
    type: "Number",
    model: "package",
  },
  is_deleted: {
    type: "Boolean",
    model: "campaign",
  },
  state: {
    type: "String",
    model: "package",
  },
  created_at: {
    type: "Date",
    model: "campaign",
  },
  balance: {
    type: "Number",
    model: "package",
  },
  is_ga_integrated: {
    type: "Boolean",
    model: "campaign",
  },
};

let currentTest;
try {
  /* TESTCASE */
  currentTest = "base case no-filteration";
  console.log(currentTest);

  let extractedAttr = extractAttr({ query: {} }, modelAttr);
  assert.deepEqual(extractedAttr, {});
  
  /* TESTCASE */
  currentTest = "1. one query parameter";
  console.log(currentTest);

  extractedAttr = extractAttr({ query: { state: "RUNNING" } }, modelAttr);
  assert.deepEqual(extractedAttr, { package: { state: ["RUNNING"] } });
  
  /* TESTCASE */
  currentTest = "2. non existing attr";
  console.log(currentTest);

  extractedAttr = extractAttr(
    { query: { state: "RUNNING", size: 10 } },
    modelAttr
  );
  assert.deepEqual(extractedAttr, { package: { state: ["RUNNING"] } });
  
  /* TESTCASE */
  currentTest = "3. multi value attr";
  console.log(currentTest);

  extractedAttr = extractAttr(
    { query: { state: ["RUNNING", "PENDING", "PENDING_PAID"] } },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: { state: ["RUNNING", "PENDING", "PENDING_PAID"] },
  });

  
  /* TESTCASE */
  currentTest = "4. add another query parameter";
  console.log(currentTest);

  extractedAttr = extractAttr(
    {
      query: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: 10,
      },
    },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [10],
    },
  });
  
  /* TESTCASE */
  currentTest = "5. add another query parameters from another model";
  console.log(currentTest);

  extractedAttr = extractAttr(
    {
      query: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: 10,
        started_at: "2020-01-01",
        is_deleted: false,
      },
    },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [10],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: {[Op.not]: true},
    },
  });

  /* TESTCASE */
  currentTest = "6. add amount gte operator";
  console.log(currentTest);

  extractedAttr = extractAttr(
    {
      query: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount__gte: 10,
        started_at: "2020-01-01",
        is_deleted: true,
      },
    },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [{ value: 10, op: "gte" }],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  });
  
  /* TESTCASE */
  currentTest = "7. add amount gte,lte operator";
  console.log(currentTest);

  extractedAttr = extractAttr(
    {
      query: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount__gte: "10",
        amount__lte: "20",
        started_at: "2020-01-01",
        is_deleted: true,
      },
    },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [
        { value: 10, op: "gte" },
        { value: 20, op: "lte" },
      ],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  });
  
  /* TESTCASE */
  currentTest = "8. invalid test operator";
  console.log(currentTest);

  extractedAttr = extractAttr(
    {
      query: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount__gta: "10",
        amount__lte: "20",
        started_at: "2020-01-01",
        is_deleted: true,
      },
    },
    modelAttr
  );
  assert.deepEqual(extractedAttr, {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [{ value: 20, op: "lte" }],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  });

  
  /* TESTCASE */
  currentTest = "MATCHEDOBJECT: base case empty query";
  console.log(currentTest);

  extractedAttr = {};
  let matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {});
  
  /* TESTCASE */
  currentTest = "1: one query single parameter";
  console.log(currentTest);

  extractedAttr = { package: { state: ["RUNNING"] } };
  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING"],
      },
    },
  });
  
  /* TESTCASE */
  currentTest = "2: one query array parameter";
  console.log(currentTest);

  extractedAttr = {
    package: { state: ["RUNNING", "PENDING", "PENDING_PAID"] },
  };
  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
      },
    },
  });
  
  /* TESTCASE */
  currentTest = "3: two query parameters";
  console.log(currentTest);

  extractedAttr = {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [10],
    },
  };
  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: [10],
      },
    },
  });
  
  /* TESTCASE */
  currentTest = "4: add query parameters from another model";
  console.log(currentTest);

  extractedAttr = {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [10],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  };
  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: [10],
      },
    },
    campaign: {
      where: {
        started_at: ["2020-01-01"],
        is_deleted: [true],
      },
    },
  });

  // /* TESTCASE */
  currentTest = "4.1: add boolean varaible with false value";
  console.log(currentTest);

  extractedAttr = {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: ["10"],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: {[Op.not]: true},
    },
  };
  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: ["10"],
      },
    },
    campaign: {
      where: {
        started_at: ["2020-01-01"],
        is_deleted: { [Op.not]: true },
      },
    },
  });

  /* TESTCASE */
  currentTest = "5. add amount gte operator";
  console.log(currentTest);

  extractedAttr = {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [{ value: 10, op: "gte" }],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  };

  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: {
          [Op.gte]: 10,
        },
      },
    },
    campaign: {
      where: {
        started_at: ["2020-01-01"],
        is_deleted: [true],
      },
    },
  });
  
  /* TESTCASE */
  currentTest = "6. add amount gte, lte operator";
  console.log(currentTest);

  extractedAttr = {
    package: {
      state: ["RUNNING", "PENDING", "PENDING_PAID"],
      amount: [
        { value: 10, op: "gte" },
        { value: 20, op: "lte" },
      ],
    },
    campaign: {
      started_at: ["2020-01-01"],
      is_deleted: [true],
    },
  };

  matchedObj = matchedObject(extractedAttr);
  assert.deepEqual(matchedObj, {
    package: {
      where: {
        state: ["RUNNING", "PENDING", "PENDING_PAID"],
        amount: {
          [Op.and]: {
            [Op.gte]: 10,
            [Op.lte]: 20,
          },
        },
      },
    },
    campaign: {
      where: {
        started_at: ["2020-01-01"],
        is_deleted: [true],
      },
    },
  });

  
  /* TESTCASE */
  currentTest = "7. return generator function";
  console.log(currentTest);

  const generatorFn = require("./req2query").generator();

  assert.equal(typeof generatorFn, "function");

} catch (ex) {
  console.log(ex);
}