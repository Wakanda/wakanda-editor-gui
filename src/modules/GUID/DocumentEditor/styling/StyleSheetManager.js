class StyleSheetManager {
  constructor(stylesheet) {
    this.stylesheet = stylesheet;
  }

  addRule({selector, rule}) {
    console.log('Adding css rule :' + selector + ':' + rule);
    this.stylesheet.addRule(selector, rule, this.stylesheet.rules.length);
  }

  removeLastRule() {
    this.stylesheet.removeRule(this.stylesheet.rules.length - 1);
  }

  toString() {
    var string = '';
    var rules = {};

    //Iterate over rules to regroup them according to their selector
    for (var i = 0; i < this.stylesheet.rules.length; i++) {
      let rule = this.stylesheet.rules[i];
      if (!rules[rule.selectorText]) {
        rules[rule.selectorText] = {};
      }
      for (var j = 0; j < rule.style.length; j++) {
        let declarationName = rule.style[j];
        rules[rule.selectorText][declarationName] = rule.style[declarationName];
      }
    }

    //Constructign pretty-printed css code for stylesheet
    for (var rule in rules) {
      if (rules.hasOwnProperty(rule)) {
        string += rule + " {\n";
        let ruleObj = rules[rule];
        for (var declaration in ruleObj) {
          if (ruleObj.hasOwnProperty(declaration)) {
            string += "\t" + declaration + ": " + ruleObj[declaration] + ";\n"
          }
        }
        string += "}\n\n";
      }
    }

    return string;
  }
}

export default StyleSheetManager;
