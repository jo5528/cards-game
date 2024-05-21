//遊戲狀態 
const GAME_STATUS = {
FirstCardAwaits : "FirstCardAwaits",
SecondCardAwaits :"SecondCardAwaits",
CardsMatchedFailed: "CardsMatchedFailed",
CardsMatched: "CardsMatched",
GameFinished : "GameFinished"
}

//牌的符號
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//視覺呈現
const view = {
  //卡片背面
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>` 
  },
  //卡片正面
  getCardContent (index) {
    const number = this.TransformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}"/>
      <p>${number}</p>
    `
  },  
  TransformNumber (number) {
  switch(number) {
   case 1:
    return 'A'
   case 11: 
    return 'J'
   case 12: 
    return 'Q'
   case 13:
    return 'K'
   default: 
    return number 
   }
  },
  displayCard (indexes) {
  const rootElement = document.querySelector('#cards')
  rootElement.innerHTML = indexes.map(index => 
  this.getCardElement(index)).join('')
  },
  //決定顯示正面還是背面
  //...會把參數變成陣列
  flipCards(...cards) {
    cards.map(card =>{
     if (card.classList.contains('back')) {
    // 如果是背面的話，要回傳正面
    card.classList.remove('back')
    card.innerHTML = this.getCardContent(Number(card.dataset.index))
    return
    }
    // 如果是正面的話，要回傳背面
    card.classList.add('back')
    card.innerHTML = null
    })
   },
  pairCards(...cards) {
    cards.map(card => {
     card.classList.add('paired')
    })
  },
  renderScore(score) {
  document.querySelector('.score').textContent = `Score: ${score}`;
  },
  renderTriedTimes(times){
  document.querySelector('.tried').textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
  cards.map(card => {
    card.classList.add('wrong')
    card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
    })
  },
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
 
 }
const model = {
  //被翻開的卡片
  revealedCards: [],
  isRevealedCardsMatched () {
  return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
 },
 score: 0,
 triedTimes : 0
}

const controller = {
  currentState : GAME_STATUS.FirstCardAwaits,
  generateCards () {
  view.displayCard(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    //如果已經翻開的卡片，不理會
    if(!card.classList.contains('back')){
    return 
   }
   switch (this.currentState) {
     case GAME_STATUS.FirstCardAwaits : 
       view.flipCards(card)
       model.revealedCards.push(card) 
       this.currentState = GAME_STATUS.SecondCardAwaits;
       break
     case GAME_STATUS.SecondCardAwaits:
       view.renderTriedTimes(++model.triedTimes) 
       view.flipCards(card)
       model.revealedCards.push(card)
       if (model.isRevealedCardsMatched()) {
        //配對正確
       view.renderScore(model.score += 10)
       this.currentState = GAME_STATUS.CardsMatched
       view.pairCards(...model.revealedCards)
       model.revealedCards =[]
       if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATUS.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
        this.currentState = GAME_STATUS.FirstCardAwaits
    }  else {
        //配對失敗
       this.currentState = GAME_STATUS.CardsMatchedFailed
       view.appendWrongAnimation(...model.revealedCards) 
       setTimeout(this.resetCards,1000)
    }
    break
   }
  },
  resetCards () {
   view.flipCards(...model.revealedCards)
   model.revealedCards =[]
   controller.currentState = GAME_STATUS.FirstCardAwaits
  }
}
const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})