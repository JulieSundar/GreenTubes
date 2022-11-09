var os = require('os');

var messages = {};

function checkAndSendData(key, data, message) {
  if (data === os.EOL || message.match(/^L\d\d , \d,\d\d\d\d\d , \d\.\d\d\d\d\d$/)) {
    // TODO: send data to server in formatted way, maybe need key?

    return true;
  }

  return false;
}

module.exports = {
  add: function(key, data) {
    if (typeof messages[key] === 'undefined') {
      messages[key] = '';
    }

    messages[key] += String(data);

    if (checkAndSendData(key, data, messages[key])) {
      //console.log(data);
      //io.sockets.emit("message", messages[key]);
      messages[key] = '';
    }
  }
}