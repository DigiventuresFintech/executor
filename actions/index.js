const axios = require("axios");
const qs = require("qs");
const RulesEngine = require("./rules");

const actions = {
  set: function (name, value, override) {
    if (this[name] && !override) {
      console.log(`Action named ${name} already exists.`);
      return;
    }
    this[name] = value;
  },
  methods: {
    request: async (step, settings) => {
      function parseBody(contentType = "application/json", body = {}) {
        const parsers = {
          "application/x-www-form-urlencoded": qs.stringify,
          "application/json": JSON.stringify,
        };
        return parsers[contentType](body);
      }

      const { headers, data = {} } = settings;
      settings.data = parseBody(
        headers["content-type"] || headers["Content-Type"],
        data
      );

      try {
        const response = await axios(settings);
        return {
          status: response.status,
          response: response.data,
        };
      } catch (error) {
        console.log(error);
        return { status: error.response.status, response: error.response.data };
      }
    },
    validation: (step, settings) => {
      return RulesEngine(settings);
    },
  },
};

module.exports = actions;
