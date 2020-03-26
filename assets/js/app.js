function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

function moveElementToElement(fromElemSelector, toElemSelector) {
  let x = $(toElemSelector).offset().left
  let y = $(toElemSelector).offset().top
  $(fromElemSelector).animate({
    left: x,
    top: y
  }, {
    duration: 600
  })
}

function animateCardContainer(cardContainer, newWrapperSel) {
  let x = $(newWrapperSel).offset().left
  let y = $(newWrapperSel).offset().top
  $(cardContainer).animate({
    left: x,
    top: y
  }, {
    duration: 600
  })
  cardContainer.toggleClass('flipped')
  setTimeout(function () {
    cardContainer.remove()
  }, 600)
}

function updateDeckImages(decks) {
  let card = decks.flippedDeck.pop()
  $('#flippedDeck')
    .css({
      'opacity': 1
    })
  let $flippedDeck = $('#flippedDeck')
  $flippedDeck
    .find('.card-img-top')
    .attr('src', card ? card.imgUrl : 'assets/images/playing-card-back.png')
  if (!card) {
    $flippedDeck.css({
      opacity: 0
    })
  }
}

function initCardContainer(wrapperSel, card, flipped) {

  let $unflippedDeck = flipped ? $('#flippedDeck') : $('#unflippedDeck')
  let pos = $unflippedDeck.offset()

  let imgUrl = card ? card.imgUrl : 'assets/images/playing-card-back.png'

  let backImg = $('<img>')
    .addClass('card-img-top')
    .attr('src', imgUrl)
  let backCard = $('<div>')
    .addClass('card')
    .append(backImg)
  let back = $('<div>')
    .addClass('back')
    .append(backCard)
  let frontImg = $('<img>')
    .addClass('card-img-top')
    .attr('src', 'assets/images/playing-card-back.png')
  let frontCard = $('<div>')
    .addClass('card')
    .append(frontImg)
  let front = $('<div>')
    .addClass('front')
    .append(frontCard)
  let flipper = $('<div>')
    .addClass('flipper shadow')
    .append(front, back)
  let flipContainer = $('<div>')
    .addClass('flip-container')
    .css({
      position: 'fixed',
      marginLeft: 0,
      marginTop: 0,
      top: pos.top,
      left: pos.left,
      width: $unflippedDeck.width(),
      zIndex: 10
    })
    .append(flipper)
  if (flipped) {
    flipContainer.addClass('flipped')
  }
  $(wrapperSel).append(flipContainer)
  return flipContainer
}


function Application(messages, cards) {
  let self = this

  let config = {
    apiKey: "AIzaSyAsMo5nzeM6BM2u9OnJXxoOXulUHAd1sVY",
    authDomain: "deck-o-cards.firebaseapp.com",
    databaseURL: "https://deck-o-cards.firebaseio.com",
    projectId: "deck-o-cards",
    storageBucket: "deck-o-cards.appspot.com",
    messagingSenderId: "245006645475"
  };
  firebase.initializeApp(config);
  let database = firebase.database()

  let gameRef = database.ref('game')

  this.shuffleCards = function () {
    shuffle(cards)
    database.ref('game/unflippedDeck').set(cards)
    database.ref('game/flippedDeck').set([])
  }

  this.updateFlippedCounter = function (int) {
    $('#flippedText').text(int)
  }

  this.updateUnflippedCounter = function (int) {
    $('#unflippedText').text(int)
  }

  this.getDecks = function (gameSnap) {
    let gameData = gameSnap.val()
    let unflippedDeck = gameData.unflippedDeck || []
    let flippedDeck = gameData.flippedDeck || []
    let decks = {
      unflippedDeck: unflippedDeck,
      flippedDeck: flippedDeck,
    }
    return decks
  }

  this.updateCounters = function (decks) {
    self.updateFlippedCounter(decks.flippedDeck.length)
    self.updateUnflippedCounter(decks.unflippedDeck.length)
  }

  this.updateDatabase = function (decks) {
    database.ref('game/unflippedDeck').set(decks.unflippedDeck)
    database.ref('game/flippedDeck').set(decks.flippedDeck)
  }

  this.flipCard = function () {
    database.ref('game').once('value', function (gameSnap) {
      let decks = self.getDecks(gameSnap)
      let card = decks.unflippedDeck.pop()
      decks.flippedDeck.push(card)

      // Update the database
      self.updateDatabase(decks)

      // Update the counters
      self.updateCounters(decks)

      // Update the animation
      opacity = decks.unflippedDeck.length ? 1 : 0
      $('#unflippedDeck')
        .css({
          'opacity': opacity
        })
      if (decks.flippedDeck.length == 1) {
        setTimeout(function () {
          $('#unflippedDeck')
            .css({
              'opacity': 1
            })
        }, 600)
      }

      let cardContainer = initCardContainer('#unflippedWrapper', card)
      animateCardContainer(cardContainer, '#flippedWrapper')
      setTimeout(function () {
        updateDeckImages(decks)
      }, 600)
    })
  }

  this.unflipCard = function () {
    database.ref('game').once('value', function (gameSnap) {
      let decks = self.getDecks(gameSnap)
      let card = decks.flippedDeck.pop()
      decks.unflippedDeck.push(card)

      // Update the database
      self.updateDatabase(decks)

      // Update the counters
      self.updateCounters(decks)

      // Update the animation
      opacity = decks.flippedDeck.length ? 1 : 0
      $('#flippedDeck')
        .css({
          'opacity': opacity
        })
      if (decks.unflippedDeck.length == 1) {
        setTimeout(function () {
          $('#unflippedDeck')
            .css({
              'opacity': 1
            })
        }, 600)
      }

      let cardContainer = initCardContainer('#flippedWrapper', card, true)
      updateDeckImages(decks)
      animateCardContainer(cardContainer, '#unflippedWrapper')
    })
  }

  this.init = function (gameSnap) {
    $('#flippedDeck')
      .css({
        'opacity': 0
      })

    let unflippedDeckExists = gameSnap.child("unflippedDeck").exists()
    if (unflippedDeckExists) {
      // messages.displayMsg('Continuing from the current deck')
    } else {
      //messages.displayMsg('New deck shuffled')
      self.shuffleCards()
    }

    let decks = self.getDecks(gameSnap)

    // Update the counters
    self.updateCounters(decks)

    // Update the animation
    let card = decks.flippedDeck.slice(-1)[0]
    //self.animateCardFlip('#img1', card)

    if (decks.flippedDeck.length) {
      let cardContainer = initCardContainer('#unflippedWrapper', card)
      animateCardContainer(cardContainer, '#flippedWrapper')
      setTimeout(function () {
        updateDeckImages(decks)
      }, 600)
    }
  }

  // On game initialization
  gameRef.once('value').then(function (gameSnap) {
    self.init(gameSnap)
  })

  this.authenticate = function () {
    firebase.auth().signInAnonymously().catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
    });
  }

  $('#unflippedDeck').on('click', function () {
    self.flipCard()
  })

  $('#flippedDeck').on('click', function () {
    self.unflipCard()
  })

  this.sendMessage = function () {
    let $msgInput = $('#msgInput')
    let text = $msgInput.val().trim()
    if (text) {
      // Store to firebase
      var user = firebase.auth().currentUser
      database.ref('messages').push({
        text: text,
        user: user.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
    }
    $msgInput.val('')
  }

  // This function allows you to update your page in real-time when the firebase database changes.
  var child_added_first = true;
  database.ref('messages').orderByChild('timestamp').limitToLast(1).on('child_added', function (snapshot) {
    if (!child_added_first) {
      var user = firebase.auth().currentUser
      let msgData = snapshot.val()
      var timeStamp = moment(msgData.timestamp).format('h:mm:ss A')
      let p = $('<p>').text(msgData.text)
      let chatTime = $('<span>')
        .addClass('chat-time')
        .text(timeStamp)
      let msgType = $('<div>')
        .append(p, chatTime)
      if (msgData.user == user.uid) {
        msgType.addClass('outgoing px-0 offset-sm-5 col-sm-7')
      } else {
        msgType.addClass('incoming px-0 col-sm-7')
      }
      let chatMsg = $('<div>')
        .addClass('chat-message row')
        .append(msgType)
      let chatMessages = $('#chatMessages')
        .append(chatMsg)
      chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }
    child_added_first = false;
  })

  $('#msgInput').on('keyup', function (e) {
    // If enter clicked
    if (e.keyCode == 13) {
      self.sendMessage()
    }
  });

  $('#msgBtn').on('click', function () {
    self.sendMessage()
  })

  $('#shuffleBtn').on('click', function () {
    self.shuffleCards()
    gameRef.once('value').then(function (gameSnap) {
      self.init(gameSnap)
    })
  })

}