function Messages() {

  this.displayMsg = function (msg, looking = false) {
    $('#choice').hide()
    let p = $('<p>').text(msg)
    $('#message')
      .empty()
      .append(p)
      .show()
    if (looking) {
      let sr = $('<span>')
        .addClass('sr-only')
        .text('Loading...')
      let spinner = $('<div>')
        .addClass('spinner-grow')
        .attr('role', 'status')
        .append(sr)
      $('#message').append(spinner)
    }
  }

  this.displayRestartMsg = function (msg) {
    $('#choice').hide()
    let a = $('<button>')
      .attr('href', '#')
      .addClass('btn btn-secondary restart-btn font-weight-bold')
      .text('Play again.')
    $('#message')
      .text(msg + ' ')
      .append(a)
      .show()
  }

  this.displayChoiceMsg = function () {
    //console.log('displayChoiceMessage')
    $('#message').hide()
    $('#choice').show()
  }

}