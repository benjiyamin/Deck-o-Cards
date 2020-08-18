function shuffle(array, count) {
  let currentIndex = array.length,
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
  const x = $(toElemSelector).offset().left
  const y = $(toElemSelector).offset().top
  $(fromElemSelector).animate({
    left: x,
    top: y
  }, {
    duration: 600
  })
}

function animateCardContainer(cardContainer, newWrapperSel) {
  const x = $(newWrapperSel).offset().left
  const y = $(newWrapperSel).offset().top
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

function updateDeckImages(card, showUnflippedDeck) {
  const $flippedDeck = $('#flippedDeck')
  const $unflippedDeck = $('#unflippedDeck')
  $flippedDeck
    .find('.card-img-top')
    .attr('src', card ? card.imgUrl : 'assets/images/playing-card-back.png')
  $flippedDeck.css({
    opacity: card ? 1 : 0
  })

  $unflippedDeck.css({
    opacity: showUnflippedDeck ? 1 : 0
  })
}

function initCardContainer(wrapperSel, card, flipped) {

  const $unflippedDeck = flipped ? $('#flippedDeck') : $('#unflippedDeck')
  const pos = $unflippedDeck.offset()

  const imgUrl = card ? card.imgUrl : 'assets/images/playing-card-back.png'

  const backImg = $('<img>')
    .addClass('card-img-top')
    .attr('src', imgUrl)
  const backCard = $('<div>')
    .addClass('card')
    .append(backImg)
  const back = $('<div>')
    .addClass('back')
    .append(backCard)
  const frontImg = $('<img>')
    .addClass('card-img-top')
    .attr('src', 'assets/images/playing-card-back.png')
  const frontCard = $('<div>')
    .addClass('card')
    .append(frontImg)
  const front = $('<div>')
    .addClass('front')
    .append(frontCard)
  const flipper = $('<div>')
    .addClass('flipper shadow')
    .append(front, back)
  const flipContainer = $('<div>')
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

function updateFlippedCounter(int) {
  $('#flippedText').text(int)
}

function updateUnflippedCounter(int) {
  $('#unflippedText').text(int)
}

function updateFlipCounters(decks) {
  updateFlippedCounter(decks.flippedDeck.length)
  updateUnflippedCounter(decks.unflippedDeck.length)
}

function updateDeckCounters(int) {
  let deckCountText = `${int} deck`
  if (int > 1) {
    deckCountText += 's'
  }
  $('#deckCountText').text(deckCountText)
  $('#deckCountInput').val(int)
}

function getCardValue(card) {
  const value = card.name.split('of')[0].trim()
  if (!isNaN(value)) {
    return parseInt(value)
  } else if (value === 'Ace') {
    return 1
  } else if (card.name.indexOf('Joker') !== -1) {
    return 15
  }
  return 10
}

function updatePlayerList(flippedDeck, user, players) {
  const playerArray = _.groupBy(flippedDeck, 'userId')
  const $playerList = $('#playerList')
    .empty()

  const $playerCardBody = $('#playerCardBody')
  if (_.isEmpty(playerArray)) {
    $playerCardBody.hide()
  } else {
    $playerCardBody.show()
  }

  let playerIndex = 1
  for (const userId in playerArray) {
    if (playerArray.hasOwnProperty(userId)) {
      const playerCards = playerArray[userId]

      let score = 0
      let name
      for (let i = 0; i < playerCards.length; i++) {
        const card = playerCards[i]
        const value = getCardValue(card)
        score += value
        name = players[userId] || `Player ${playerIndex}`
      }

      const playerIcon = $('<i>')
        .addClass(user.uid == userId ? 'fas fa-user-edit' : 'fas fa-user')
      const latestCard = flippedDeck.slice(-1)[0]

      const playerBadge = $('<span>')
        .addClass('badge badge-secondary badge-pill')
        .text(score)
      const playerListItem = $('<li>')
        .addClass('list-group-item d-flex justify-content-between align-items-center')
        .append(playerIcon, name, playerBadge)

      if (latestCard.userId == userId) {
        playerListItem.addClass('active')
      }

      if (user.uid == userId) {
        playerIcon.attr('data-toggle', 'modal')
        playerIcon.attr('data-target', '#settingsModal')
        playerIcon.addClass('cursor-pointer')
      }
      $playerList.append(playerListItem)

    }
    playerIndex += 1
  }
}


const quill = new Quill('#editor', {
  theme: 'snow'
})


function Application(cards) {
  const self = this

  const config = {
    apiKey: "AIzaSyAsMo5nzeM6BM2u9OnJXxoOXulUHAd1sVY",
    authDomain: "deck-o-cards.firebaseapp.com",
    databaseURL: "https://deck-o-cards.firebaseio.com",
    projectId: "deck-o-cards",
    storageBucket: "deck-o-cards.appspot.com",
    messagingSenderId: "245006645475"
  }
  firebase.initializeApp(config)
  const database = firebase.database()

  const gameRef = database.ref('game')
  const playersRef = database.ref('game/players')
  const unflippedDeckRef = database.ref('game/unflippedDeck')
  const flippedDeckRef = database.ref('game/flippedDeck')
  const rulesRef = database.ref('game/rules')

  this.shuffleCards = function () {
    const deckCount = $('#deckCountInput').val()
    let newDeck = []

    // Multiply deck
    if (deckCount > 0) {
      for (let i = 0; i < deckCount; i++) {
        newDeck = newDeck.concat(cards)
      }
    }

    shuffle(newDeck)
    unflippedDeckRef.set(newDeck)
    flippedDeckRef.remove()

    updateDeckCounters(deckCount)
  }

  this.saveSettings = function () {
    database.ref('game').once('value', function (gameSnap) {
      const players = self.getPlayers(gameSnap)
      const user = firebase.auth().currentUser
      players[user.uid] = $('#userNameInput').val()
      playersRef.set(players)
    })
  }

  this.getDecks = function (gameSnap) {
    const gameData = gameSnap.val()
    const unflippedDeck = gameData.unflippedDeck || []
    const flippedDeck = gameData.flippedDeck || []
    const decks = {
      unflippedDeck: unflippedDeck,
      flippedDeck: flippedDeck,
    }
    return decks
  }

  this.getPlayers = function (gameSnap) {
    const gameData = gameSnap.val()
    return gameData.players || {}
  }

  this.getDeckCount = function (decks) {
    const deckCount = (decks.flippedDeck.length + decks.unflippedDeck.length) / cards.length
    return Math.round(deckCount)
  }

  this.updateDatabase = function (decks) {
    unflippedDeckRef.set(decks.unflippedDeck)
    flippedDeckRef.set(decks.flippedDeck)
  }

  //let timeout

  this.flipCard = function (card) {
    gameRef.once('value', function (gameSnap) {
      const decks = self.getDecks(gameSnap)

      $('#unflippedDeck').css({
        opacity: decks.unflippedDeck.length ? 1 : 0
      })

      const cardContainer = initCardContainer('#unflippedWrapper', card)
      animateCardContainer(cardContainer, '#flippedWrapper')

      //clearTimeout(timeout)
      setTimeout(function () {
        const showUnflippedDeck = decks.unflippedDeck.length > 0
        updateDeckImages(card, showUnflippedDeck)
      }, 600)
    })
  }

  this.unflipCard = function (card) {
    gameRef.once('value', function (gameSnap) {
      const decks = self.getDecks(gameSnap)

      const cardContainer = initCardContainer('#flippedWrapper', card, true)

      const newCard = decks.flippedDeck.slice(-1)[0]
      updateDeckImages(newCard, decks.unflippedDeck.length > 1)

      animateCardContainer(cardContainer, '#unflippedWrapper')

      //clearTimeout(timeout)
      setTimeout(function () {
        const showUnflippedDeck = decks.unflippedDeck.length > 0
        updateDeckImages(newCard, showUnflippedDeck)
      }, 600)

    })
  }

  // On game initialization
  gameRef.once('value').then(function (gameSnap) {
    const decks = self.getDecks(gameSnap)

    // Update the animation
    const card = decks.flippedDeck.slice(-1)[0]
    const showUnflippedDeck = decks.unflippedDeck.length > 0
    updateDeckImages(card, showUnflippedDeck)

    $('#table').show()
    $('#loader').hide()

    // Load rules
    //self.loadRules()
  })

  // On flip
  unflippedDeckRef.on('child_removed', function (cardSnap) {
    const card = cardSnap.val()
    self.flipCard(card)
  })

  // On unflip
  flippedDeckRef.on('child_removed', function (cardSnap) {
    const card = cardSnap.val()
    self.unflipCard(card)
  })

  // On mod
  gameRef.on('value', function (gameSnap) {
    const decks = self.getDecks(gameSnap)

    // Update the counters
    updateFlipCounters(decks)

    // Update deck count
    const deckCount = self.getDeckCount(decks)
    updateDeckCounters(deckCount)

    // Update player list
    const user = firebase.auth().currentUser
    const players = self.getPlayers(gameSnap)
    updatePlayerList(decks.flippedDeck, user, players)
  })

  playersRef.on('value', function (playersSnap) {
    const players = playersSnap.val()
    const user = firebase.auth().currentUser
    const currentPlayer = players[user.uid]
    $('#userNameInput').val(currentPlayer)

    database.ref('game').once('value', function (gameSnap) {
      const decks = self.getDecks(gameSnap)
      updatePlayerList(decks.flippedDeck, user, players)
    })
  })

  this.authenticate = function () {
    firebase.auth().signInAnonymously().catch(function (error) {
      // Handle Errors here.
      const errorCode = error.code
      const errorMessage = error.message
      // ...
    })
  }

  $('#unflippedDeck').on('click', function () {
    database.ref('game').once('value', function (gameSnap) {
      const decks = self.getDecks(gameSnap)
      const card = decks.unflippedDeck.pop()

      const user = firebase.auth().currentUser
      card.userId = user.uid
      card.timestamp = firebase.database.ServerValue.TIMESTAMP

      decks.flippedDeck.push(card)

      self.updateDatabase(decks)
    })
  })

  $('#flippedDeck').on('click', function () {
    database.ref('game').once('value', function (gameSnap) {
      const decks = self.getDecks(gameSnap)
      const card = decks.flippedDeck.pop()
      decks.unflippedDeck.push(card)

      self.updateDatabase(decks)
    })
  })

  this.sendMessage = function () {
    const $msgInput = $('#msgInput')
    const text = $msgInput.val().trim()
    if (text) {
      // Store to firebase
      const user = firebase.auth().currentUser
      database.ref('messages').push({
        text: text,
        user: user.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
    }
    $msgInput.val('')
  }

  // This function allows you to update your page in real-time when the firebase database changes.
  let child_added_first = true
  database.ref('messages').orderByChild('timestamp').limitToLast(1).on('child_added', function (snapshot) {
    if (!child_added_first) {
      const user = firebase.auth().currentUser
      const msgData = snapshot.val()
      const timeStamp = moment(msgData.timestamp).format('h:mm:ss A')
      const p = $('<p>').text(msgData.text)
      const chatTime = $('<span>')
        .addClass('chat-time')
        .text(timeStamp)
      const msgType = $('<div>')
        .append(p, chatTime)
      if (msgData.user == user.uid) {
        msgType.addClass('outgoing px-0 offset-sm-5 col-sm-7')
      } else {
        msgType.addClass('incoming px-0 col-sm-7')
      }
      const chatMsg = $('<div>')
        .addClass('chat-message row')
        .append(msgType)
      const chatMessages = $('#chatMessages')
        .append(chatMsg)
      chatMessages.scrollTop(chatMessages[0].scrollHeight)
    }
    child_added_first = false
  })

  // On rule mod
  rulesRef.on('value', function (rulesSnap) {
    const rules = rulesSnap.val()
    quill.setContents(rules)
  })

  this.saveRules = function () {
    const data = quill.getText().trim().length ? JSON.parse(JSON.stringify(quill.getContents())) : null
    rulesRef.set(data)
  }

  $('#msgInput').on('keyup', function (e) {
    // If enter clicked
    if (e.keyCode == 13) {
      self.sendMessage()
    }
  })

  $('#msgBtn').on('click', function () {
    self.sendMessage()
  })

  $('#shuffleBtn').on('click', function () {
    //self.reset()
    self.shuffleCards()
  })

  $('#saveSettingsBtn').on('click', function () {
    self.saveSettings()
  })

  $('#saveRulesBtn').on('click', function () {
    self.saveRules()
  })

}