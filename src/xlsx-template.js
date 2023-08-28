const XlsxTemplate = require("./lib/index");
const fs = require("fs");

module.exports = function (RED) {
  function XlsxTemplateNode(config) {
    RED.nodes.createNode(this, config);
    this.templatePath = config.templatePath;
    this.sheetNumber = config.sheetNumber || 1;
    this.outputType = config.outputType || "arraybuffer";
    const node = this;

    node.on("input", (msg) => {
      try {
        const { templatePath, option, data, sheetNumber, outputType } =
          msg.payload;
        if (!this.templatePath) {
          this.templatePath = templatePath;
        }
        if (!this.sheetNumber) {
          this.sheetNumber = sheetNumber;
        }
        if (!this.outputType) {
          this.outputType = outputType;
        }

        // Create a template
        const blob = fs.readFileSync(this.templatePath, option);
        const xlsxTemplate = new XlsxTemplate(blob);

        // Perform substitution
        xlsxTemplate.substitute(this.sheetNumber, data);

        // Get binary data
        const resp = xlsxTemplate.generate();
        
        node.send({
          ...msg,
          payload: resp,
        });
      } catch (error) {
        node.error(error.toString(), msg);
      }
    });
  }

  RED.nodes.registerType("xlsx-template", XlsxTemplateNode);
};
