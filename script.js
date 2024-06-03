let specialRequestMode = false; // Flag to track special request mode
let orderSummary = []; // To keep track of orders
let context = {}; // To keep track of conversation context

function sendMessage() {
    var userInput = document.getElementById("user-input").value;
    if (userInput !== "") {
        displayUserMessage(userInput);
        processMessage(userInput);
        document.getElementById("user-input").value = "";
    }
}

function displayBotMessage(message) {
    var chatBox = document.getElementById("chat-box");
    var botMessageElement = document.createElement("div");
    botMessageElement.classList.add("chat-message", "bot");
    botMessageElement.innerHTML = `<i class="fas fa-robot"></i> ${message}`;
    chatBox.appendChild(botMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function displayUserMessage(message) {
    var chatBox = document.getElementById("chat-box");
    var userMessageElement = document.createElement("div");
    userMessageElement.classList.add("chat-message", "user");
    userMessageElement.innerHTML = `<i class="fas fa-user"></i> ${message}`;
    chatBox.appendChild(userMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function processMessage(userInput) {
    var botResponse;
    userInput = userInput.toLowerCase();

    if (specialRequestMode) {
        orderSummary.push(`Special request: ${userInput}`);
        botResponse = `Your special request has been noted: ${userInput}. Would you like anything else?`;
        specialRequestMode = false;
    } else {
        // Enhanced tokenization and synonym handling
        let tokens = tokenize(userInput);
        let intent = identifyIntent(tokens, userInput);
        botResponse = generateResponse(intent, tokens, userInput);
    }

    displayBotMessage(botResponse);
}

// Enhanced Tokenization function
function tokenize(input) {
    return input.match(/\b(\w+)\b/g);
}

// Basic stemming function (using simple suffix stripping)
function stem(word) {
    return word.replace(/(ing|ed|s)$/, '');
}

// Synonym handling
const synonyms = {
    "hello": ["hi", "hey"],
    "menu": ["list", "options"],
    "order": ["want", "would like"],
    "pizza": ["pizzas"],
    "burger": ["burgers"],
    "pasta": ["pastas"],
    "salad": ["salads"],
    "thanks": ["thank you", "thx"],
    "bye": ["goodbye", "see you"]
};

// Convert tokens to stemmed form and handle synonyms
function normalize(tokens) {
    return tokens.map(token => {
        for (let key in synonyms) {
            if (synonyms[key].includes(token)) {
                return key;
            }
        }
        return stem(token);
    });
}

// Identify intent based on normalized tokens
function identifyIntent(tokens, userInput) {
    let normalizedTokens = normalize(tokens);
    if (normalizedTokens.includes("hello")) {
        return "greet";
    } else if (normalizedTokens.includes("menu")) {
        return "menu";
    } else if (normalizedTokens.includes("order") && normalizedTokens.includes("pizza")) {
        context.pendingOrder = "pizza";
        return "order_pizza";
    } else if (normalizedTokens.includes("order") && normalizedTokens.includes("burger")) {
        context.pendingOrder = "burger";
        return "order_burger";
    } else if (normalizedTokens.includes("order") && normalizedTokens.includes("pasta")) {
        context.pendingOrder = "pasta";
        return "order_pasta";
    } else if (normalizedTokens.includes("order") && normalizedTokens.includes("salad")) {
        context.pendingOrder = "salad";
        return "order_salad";
    } else if (userInput.match(/(\d+)\s*(pizza|burger|pasta|salad)/)) {
        return "specify_quantity";
    } else if (normalizedTokens.includes("thanks")) {
        return "thanks";
    } else if (normalizedTokens.includes("bye")) {
        return "bye";
    } else if (normalizedTokens.includes("special") && normalizedTokens.includes("request")) {
        return "special_request";
    } else if (normalizedTokens.includes("delivery") && normalizedTokens.includes("time")) {
        return "delivery_time";
    } else if (normalizedTokens.includes("payment")) {
        return "payment_options";
    } else if (normalizedTokens.includes("promotions")) {
        return "promotions";
    } else if (normalizedTokens.includes("help")) {
        return "help";
    } else {
        return "unknown";
    }
}

// Generate response based on identified intent
function generateResponse(intent, tokens, userInput) {
    let response;
    switch (intent) {
        case "greet":
            response = "Hello! I'm FOODBOT. How can I assist you with your food order today?";
            break;
        case "menu":
            response = "Sure! Our menu includes:\n1. Pizza\n2. Burger\n3. Pasta\n4. Salad\nPlease type the name of the item you'd like to order.";
            break;
        case "order_pizza":
            response = "Great choice! How many pizzas would you like to order?";
            break;
        case "order_burger":
            response = "Great choice! How many burgers would you like to order?";
            break;
        case "order_pasta":
            response = "Great choice! How many pastas would you like to order?";
            break;
        case "order_salad":
            response = "Great choice! How many salads would you like to order?";
            break;
        case "specify_quantity":
            let [quantity, item] = userInput.match(/(\d+)\s*(pizza|burger|pasta|salad)/).slice(1, 3);
            orderSummary.push(`${quantity} ${item}(s)`);
            response = `You've ordered ${quantity} ${item}(s). Would you like anything else?`;
            break;
        case "thanks":
            response = "You're welcome! If you need anything else, just let me know.";
            break;
        case "bye":
            response = `Goodbye! Have a great day! Here is your order summary: ${orderSummary.join(", ")}.`;
            break;
        case "special_request":
            response = "Sure, please let us know your special request.";
            specialRequestMode = true;
            break;
        case "delivery_time":
            response = "Our average delivery time is 30-45 minutes. Is there anything else I can help you with?";
            break;
        case "payment_options":
            response = "We accept cash, credit cards, and mobile payments. How would you like to pay?";
            break;
        case "promotions":
            response = "We currently have a 10% discount on orders over $50. Use the code SAVE10 at checkout!";
            break;
        case "help":
            response = "How can we assist you? You can ask about our menu, payment options, or anything else.";
            break;
        case "unknown":
        default:
            response = "I'm sorry, I didn't understand that. Could you please rephrase?";
    }
    return response;
}