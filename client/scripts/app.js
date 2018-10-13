/* APP OBJECT & PROTOTYPE CHAIN */

const App = function() {
  this.server =
    'http://parse.rpt.hackreactor.com/chatterbox/classes/messages?order=-createdAt&limit=250';
};

App.prototype.init = function() {
  $.ajax({
    url: this.server,
    type: 'GET',
    error: function() {
      $('#chats').html('<p>An error has occurred</p>');
    },
    dataType: 'json',
    success: function(data) {
      console.log(data);
      let rooms = {};
      for (var i = 0; i < data.results.length; i++) {
        if (
          !xssTest(data.results[i].text) &&
          !xssTest(data.results[i].roomname) &&
          !xssTest(data.results[i].username)
        ) {
          const roomClass = classFormatter(data.results[i].roomname);
          const nameClass = classFormatter(data.results[i].username);
          var $message = $(`<div class="chat ${roomClass} ${nameClass}">`)
            .html(`<span class="username ${nameClass}">${
              data.results[i].username
            }:</span>
              <span class="messageText">${data.results[i].text}</span>`);
          if (!rooms[data.results[i].roomname]) {
            rooms[data.results[i].roomname] = data.results[i].roomname;
          }

          $('#chats').append($message);
        }
      }

      for (var key in rooms) {
        var $option = $(`<option>${rooms[key]}</option>`);
        $('#roomSelect').append($option);
      }
    }
  });

  $('#send').on('submit', app.handleSubmit);
};

App.prototype.send = function(message) {
  $.ajax({
    type: 'POST',
    url: 'http://parse.rpt.hackreactor.com/chatterbox/classes/messages',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log('chatterbox: Message sent');
    },
    error: function(data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

App.prototype.renderMessage = function() {
  //console.log('render message check');
  const loadingGif = $('<div class="loading">')
    .html(
      '<img src="images/loading.gif" alt="a cute kitty loading gif" width="150" height="150">'
    )
    .css('text-align', 'center');

  $('#main').append(loadingGif);
  let $text = $('#textField').val();
  let userName = usernameFormatter(window.location.search);
  let roomName = $('#roomSelect option:selected').text();

  var $message = $(`<div class="chat ${roomName} ${userName}">`)
    .html(`<span class="username">${userName}:</span>
      <span class="messageText">${$text}</span>`);

  setTimeout(function() {
    $('#chats').prepend($message);
  }, 1000);

  //In order to pass all SpecRunner tests,
  //uncomment line 89, and comment out lines 82-84

  //$('#chats').prepend($message);

  var message = {
    username: userName,
    text: $text,
    roomname: roomName
  };
  setTimeout(function() {
    $('.loading').detach();
  }, 1000);

  this.send(message);

  //spam feature
  // for (var i = 0; i < 4; i++) {
  //   this.send(message);
  // }

};

App.prototype.renderRoom = function(newRoomText) {
  const newRoom = `<option>${newRoomText}</option>`;
  $('#roomSelect').append(newRoom);
};

App.prototype.handleSubmit = function(event) {
  event.preventDefault();
  app.renderMessage();
  $('#textField').val('');
};

App.prototype.handleUsernameClick = function(e) {
  let position = e.indexOf(' ', 5);
  let friend = e.slice(position + 1);
  console.log(friend);
  return friend;
};

App.prototype.clearMessages = function () {
  $('#chats').empty();
};

App.prototype.fetch = function () {
  this.init();
};

/* INITIALIZE PAGE */
const app = new App();
$(document).ready(function() {
  app.init();
});


/* BUTTONS & EVENT LISTENERS */

//Room Select functionality
$(document).on('change', '#roomSelect', function() {
  var $selected = $('#roomSelect option:selected');
  var $selectedText = $selected.text();
  const newRoomClass = classFormatter($selectedText);
  const roomClassFinal = charEscaper(newRoomClass);
  if ($selectedText === 'Create New Room') {
    $('.createRoomField').css('visibility', 'visible');
    $('.createRoomButton').css('visibility', 'visible');
  } else if ($selectedText === 'All Rooms') {
    $('.chat').show();
    var toDo = 'do something';
  } else {
    $('.chat').hide();
    $(`.${roomClassFinal}`).show();
  }
});

//Create New Room functionality
$(document).on('click', '.createRoomButton', function() {
  const newRoomText = $('.newRoom').val();
  app.renderRoom(newRoomText);
  $('.newRoom').val('');
  $('.createRoomField').css('visibility', 'hidden');
  $('.createRoomButton').css('visibility', 'hidden');
});

//Get Friend's Messages functionality
$(document).on('click', '.chat', function () {
  let friendClass = app.handleUsernameClick($(this).attr('class'));
  let friendName = charEscaper(friendClass);
  $('.chat').hide();
  $(`.${friendName}`).show();
});

//Rrefresh Page functionality
$(document).on('click', '.refreshButton', function () {
  location.reload();
});

/* HELPER FUNCTIONS */

//XSS attack test --> returns true if the string is evil
const xssTest = function(str) {
  if (str) {
    return str.includes('<') || str.startsWith('&') || str.startsWith(' ');
  } else {
    return false;
  }
};

//Escapes certain characters
const charEscaper = function (string) {
  let result;
  if (string) {
    result = string;
  } else {
    return;
  }
  if (result.includes('\'')) {
    let position = result.indexOf('\'');
    result = result.substr(0, position) + '\\' + result.substr(position);
  }
  if (result.includes('+')) {
    let position = result.indexOf('+');
    result = result.substr(0, position) + '\\' + result.substr(position);
  }
  if (result.startsWith('.')) {
    result = '\\' + result;
  }
  return result;
};

//Formats username for display
const usernameFormatter = function(string) {
  let result = string.slice(10);
  let regex = /%20/gi;
  if (result.includes('%20')) {
    return result.replace(regex, ' ');
  }
  return result;
};

//Formats classes for CSS & HTML
const classFormatter = function(string) {
  let result;
  let regex = / /gi;
  if (string) {
    result = string;
  } else {
    return;
  }
  if (result.includes(' ')) {
    return result.replace(regex, '_');
  }
  return result;
};

/* DELETE REQUEST */
// $.ajax({
//   type: 'DELETE',
//   url: 'http://parse.rpt.hackreactor.com/chatterbox/classes/messages/<putObjectIDHere>',
//   contentType: 'application/json',
//   success: function (data) {
//     console.log('chatterbox: Message Deleted');
//   },
//   error: function (data) {
//     console.error('chatterbox: Failed to delete message', data);
//   }
// });