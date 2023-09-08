const moment = require('moment')

module.exports = {
  formatDate: function (date, format) {
    return moment(date).utc().format(format)
  },
  currency: function (lang, num, conversionRatio) {
    num = num * conversionRatio;
    cur = new Intl.NumberFormat(`fr-FR`, {
      currency: `EUR`,
      style: 'currency',
    }).format(num);
    return cur
  },
  json: function (obj) {
    try {
      return JSON.stringify(obj);
    }
    catch (err) {
      return "bad json"

    }
  },
  mathAdd: function () {
    newVal = 0
    for (var i = 0; i < (arguments.length - 1); i++) {
      newVal += arguments[i]
    }
    return newVal
  },
  mathMultiply: function () {
    newVal = 1
    for (let i = 0; i < (arguments.length - 1); i++) {
      newVal *= arguments[i]
    }
    return newVal
  },
  nullOrMinusOne: function (posNull) {
    if (!(posNull)) {
        return -1;
    }
    return posNull;
  }

}
