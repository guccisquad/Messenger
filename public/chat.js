//Скрываем окно чата до тех пор, пока пользователь на введет имя

//Устанавливаем соединение
var socket = io.connect('http://localhost:4000');

var messages = $('#messages');
var typing_message = $('#typing_message');
var nickname = $('#username').val();
var message = $('#message').val();

//Авторизация
$('#enter').click(function () {
  var login = $('#username').val();
  if (login != '') {
    $('#login').hide();
    $('#messenger').show();
  }
});

//Отправка сообщения при нажатии кнопки SEND
$('#send_message').click(function () {
  var time = moment().format('HH:mm');

  //Генерируем событие 'chat', передаем объект с данными
  socket.emit('chat', {
    message: $('#message').val(),
    username: $('#username').val(),
    time: time
  });
  $('#message').val('');
});

$('#message').keypress(function () {
  //Генерируем событие 'typing_text', (Собеседник набирает сообщение)
  socket.emit('typing_text', $('#username').val());
});

//Обрабатываем событие 'chat', выводим полученные данные
socket.on('chat', function (data) {
  typingMessageClearing();

  var nickname = $('#username').val();
    var myOutput = (
      '<div id="my_output">'+
        '<p>' +
          '<strong>' + data.username + ': </strong>' + data.message +
          '<em>'+data.time +'</em>'+
        '</p>'+
      '</div>');

    var yourOutput = (
      '<div id="output">'+
        '<p>' +
          '<strong>' + data.username + ': </strong>' + data.message +
          '<em>'+data.time +'</em>'+
        '</p>'+
      '</div>');
  if (data.message != 0) {
    if (nickname == data.username) {
      messages.append(myOutput);
    }  else {
      messages.append(yourOutput);
      }
  }

      scrollingTextArea();
});

//Обрабатываем событие 'typing_text', выводим информацию о том, что собеседник что-то печатает
socket.on('typing_text', function (data) {
  typing_message.html('<p>'+'<em>'+data+' is typing a message...'+'</em>'+'</p>');
});

//При нажатии клавиши ENTER срабатывает событие #send_message.click
$('#message').on('keydown',function(e) {
  if (e.keyCode == 13) {
    $('#send_message').trigger('click');
  }
});

//Автоматическая прокрутка чата вниз
scrollingTextArea = function() {
  var chatResult = $('#chat_window');
  chatResult.scrollTop(chatResult.prop('scrollHeight'));
}

//Очистка "пользователь набирает сообщение"
typingMessageClearing = function () {
  typing_message.html(' ');
}
