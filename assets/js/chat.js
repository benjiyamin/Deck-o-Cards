$('#minChat').on('click', function () {
  let $chatBody = $('#chatBody')
  $chatBody.toggle()
  if ($chatBody.is(':visible')) {
    $('#msgInput').focus()
  }
})