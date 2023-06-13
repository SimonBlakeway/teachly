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

}
