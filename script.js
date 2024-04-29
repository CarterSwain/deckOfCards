document.getElementById('shuffleBtn').addEventListener('click', shuffleAndDraw);
document.getElementById('newDeckBtn').addEventListener('click', drawNewDeck);
document.getElementById('reshuffleBtn').addEventListener('click', reshuffleDeck);

let deckId = ''; // Global variable to store the deck ID

async function shuffleAndDraw() {
    try {
        // Shuffle the deck
        const shuffleResponse = await fetch('https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
        const shuffleData = await shuffleResponse.json();
        deckId = shuffleData.deck_id;
        console.log('Deck shuffled:', deckId);

        // Draw 15 cards from the shuffled deck (5 cards for each player)
        const drawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=15`);
        const drawData = await drawResponse.json();
        const cards = drawData.cards;

        // Display the drawn cards for each player
        displayCards(cards);
        alert('Deck has been shuffled, and 15 cards have been drawn (5 cards for each player).');
    } catch (error) {
        console.error('Error shuffling and drawing cards:', error);
    }
}

async function reshuffleDeck() {
    try {
        // Check if there are enough cards remaining in the deck for all players
        const deckResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}`);
        const deckData = await deckResponse.json();
        const remainingCards = deckData.remaining;

        // If there are not enough cards for all players, show alert and suggest drawing a new deck
        if (remainingCards < 15) { // Assuming each player needs 5 cards
            alert('There are not enough cards left in the deck for all players to have five cards. Please draw a new deck instead.');
            return;
        }

        // Draw 15 cards from the existing deck (5 cards for each player)
        const drawResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=15`);
        const drawData = await drawResponse.json();
        const cards = drawData.cards;

        // Display the drawn cards for each player
        displayCards(cards);
        console.log('Deck reshuffled and 15 new cards drawn:', deckId);
        alert('Deck has been reshuffled and 15 new cards have been drawn (5 cards for each player).');

        // Apply shuffle animation to cards
        const cardsOnScreen = document.querySelectorAll('.card');
        cardsOnScreen.forEach((card, index) => {
            card.classList.add('shuffling');
            // Remove the 'shuffling' class after the animation completes
            card.addEventListener('animationend', () => {
                card.classList.remove('shuffling');
            });
        });
    } catch (error) {
        console.error('Error reshuffling deck:', error);
    }
}


async function drawNewDeck() {
    try {
        // Return the drawn cards to the deck if there are any
        if (deckId !== '') {
            await returnCardsToDeck(deckId);
        }

        // Draw a new deck
        const response = await fetch('https://www.deckofcardsapi.com/api/deck/new/');
        const data = await response.json();
        deckId = data.deck_id; // Update the global deckId variable
        console.log('New deck drawn:', deckId);
        alert('A new deck has been drawn!');
    } catch (error) {
        console.error('Error drawing new deck:', error);
    } finally {
        // Clear the cards from the screen
        clearCardsFromScreen();
    }
}

async function returnCardsToDeck(deckId) {
    try {
        // Return all drawn cards to the deck
        const returnResponse = await fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/return`);
        const returnData = await returnResponse.json();
        console.log('Cards returned to deck:', returnData);
    } catch (error) {
        console.error('Error returning cards to deck:', error);
    }
}

function clearCardsFromScreen() {
    const participantsDiv = document.getElementById('participants');
    participantsDiv.innerHTML = ''; // Clear previous cards
}

function displayCards(cards) {
    const participantsDiv = document.getElementById('participants');
    participantsDiv.innerHTML = ''; // Clear previous cards

    // Divide the cards into three arrays, each representing a player's hand
    const player1Hand = cards.slice(0, 5);
    const player2Hand = cards.slice(5, 10);
    const player3Hand = cards.slice(10, 15);

    // Display each player's hand in a separate column
    displayPlayerHand(player1Hand, 'Player 1 Hand:', participantsDiv);
    displayPlayerHand(player2Hand, 'Player 2 Hand:', participantsDiv);
    displayPlayerHand(player3Hand, 'Player 3 Hand:', participantsDiv);
}

function displayPlayerHand(cards, playerName, parentElement) {
    const handDiv = document.createElement('div');
    handDiv.classList.add('hand', 'mx-2', 'mt-4');

    const title = document.createElement('h2');
    title.textContent = playerName;
    handDiv.appendChild(title);

    const cardsRow = document.createElement('div');
    cardsRow.classList.add('card-row');
    cards.forEach((card, cardIndex) => {
        const cardImg = document.createElement('img');
        cardImg.src = card.image;
        cardImg.alt = `${card.value} of ${card.suit}`;
        cardImg.classList.add('card', 'mx-2');
        cardImg.style.animationDelay = `${cardIndex * 100}ms`; // Delay each card animation
        cardsRow.appendChild(cardImg);
    });

    handDiv.appendChild(cardsRow);
    parentElement.appendChild(handDiv);
}
