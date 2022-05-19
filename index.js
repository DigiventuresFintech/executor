const { get } = require("lodash");
const actions = require("./actions");

class Executor {
  constructor() {
    this.actions = { ...actions };
  }

  replaceFromCollector(v, collector) {
    if (!v) return;
    v = JSON.stringify(v);
    const regex = /\{\{(.*?)\}\}/g;
    const matches = v.match(regex) || [];
    matches.map((match) => {
      const [, path] = match.match(/\{\{(.*?)\}\}/);
      const value = get(collector, path, "");
      v = v.replace(match, value);
    });
    return JSON.parse(v);
  }

  async run(instructions = [], collector = {}) {
    try {
      if (!Array.isArray(instructions)) {
        instructions = instructions.children;
      }

      const steps = [];

      const execute = async (instructions = []) => {
        const pendings = instructions.map(async (instruction) => {
          const { children } = instruction;
          let { data = false } = instruction;

          if (!data) data = instruction;

          const output = {};
          let { action, step, settings } = data;
          steps.push(step);
          settings = this.replaceFromCollector(settings, collector);
          const actionExecutionData = await (this.actions.methods[action]?.(
            step,
            settings
          ) || false);
          if (actionExecutionData) {
            collector[step] = actionExecutionData;
            output.box = actionExecutionData;
            if (children && children.length) {
              const ranPending = execute(children);
              const ranResolved = Array.isArray(ranPending)
                ? await Promise.all(ranPending)
                : await ranPending;
              output.children = ranResolved;
            }
          }
          return output;
        });
        const resolved = await Promise.all(pendings);
        return resolved;
      };

      const pendings = execute(instructions);
      const resolved = Array.isArray(pendings)
        ? await Promise.all(pendings)
        : await pendings;
      //clean collector
      Object.keys(collector).map((c) => {
        if (!steps.includes(c)) delete collector[c];
      });

      return collector;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = Executor;
