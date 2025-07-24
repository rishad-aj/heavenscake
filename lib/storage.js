const logs = [];
const moment = require("moment");

function cleanOldLogs() {
  const oneYearAgo = moment().subtract(1, 'year');
  for (let i = logs.length - 1; i >= 0; i--) {
    if (moment(logs[i].date, 'DD/MM/YYYY').isBefore(oneYearAgo)) {
      logs.splice(i, 1);
    }
  }
}

function addLog(ip) {
  const today = moment().format('DD/MM/YYYY');
  logs.push({ ip, date: today });
  cleanOldLogs();
}

function getLogs() {
  cleanOldLogs();
  return [...logs];
}

module.exports = { addLog, getLogs };