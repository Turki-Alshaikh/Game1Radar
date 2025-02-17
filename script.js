let currentLanguage = "ar"; // Default language is Arabic

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN = "8013441748:AAHR60HPhGXM0Rsoz9IoiCjjGBizMNP86D4"; // Replace with your bot token
const TELEGRAM_GROUP_ID = "-4613971882"; // Replace with your group chat ID

// Platform logos
const platformLogos = {
    "Steam": "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
    "Epic Games": "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg",
    "Humble Bundle": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Humble_Bundle_logo.svg",
    "GOG.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GOG.com_logo.svg/800px-GOG.com_logo.svg.png",
    "Origin": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Origin_logo.svg",
    "Ubisoft Store": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ubisoft_logo.svg",
    "Other": "https://via.placeholder.com/40" // Placeholder for unknown platforms
};

// Mapping of storeID to platform names
const storeIdToPlatform = {
    "1": "Steam", // Steam
    "2": "GOG.com", // GOG
    "3": "Epic Games", // Epic Games
    "11": "Epic Games", // Epic Games (alternative ID)
    "25": "Epic Games", // Epic Games (alternative ID)
    "7": "Humble Bundle", // Humble Bundle
    "8": "Origin", // Origin
    "9": "Ubisoft Store", // Ubisoft Store
    // Add more mappings as needed
};

// Language translations
const translations = {
    "ar": {
        "title": "عروض الألعاب المجانية",
        "subtitle": "ابحث عن أحدث الألعاب المجانية من منصات مختلفة!",
        "freeGames": "الألعاب المجانية",
        "normalPrice": "السعر العادي: ",
        "salePrice": "السعر المخفض: ",
        "getItNow": "احصل عليها الآن",
        "noGames": "لا توجد ألعاب مجانية متاحة حاليًا. يرجى التحقق لاحقًا!",
        "languageButton": "English"
    },
    "en": {
        "title": "Free Game Deals",
        "subtitle": "Find the latest free games from various platforms!",
        "freeGames": "Free Games",
        "normalPrice": "Normal Price: ",
        "salePrice": "Sale Price: ",
        "getItNow": "Get It Now",
        "noGames": "No free games available at the moment. Check back later!",
        "languageButton": "العربية"
    }
};

// Track previously seen games
let previousGames = [];

// Send a message to Telegram group in Arabic
async function sendTelegramMessage(game) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const message = `
🎮 لعبة جديدة مجانية: ${game.title}
المنصة: ${game.platform}
<a href="${game.url}">احصل عليها من هنا</a>
    `;

    const payload = {
        chat_id: TELEGRAM_GROUP_ID,
        photo: game.image, // Game image
        caption: message, // Message with game details
        parse_mode: "HTML", // Enable HTML parsing for clickable links
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        console.log("Telegram API Response:", data);
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

// Fetch free games from CheapShark API (fallback to static data if API fails)
async function fetchFreeGames() {
    try {
        const response = await fetch("https://www.cheapshark.com/api/1.0/deals?upperPrice=0");
        const data = await response.json();
        console.log("CheapShark API Response:", data); // Log the response

        if (data.length === 0) {
            throw new Error("No free games found in the API response.");
        }

        // Filter out non-game content (e.g., wallpapers, software)
        const filteredGames = data.filter(game => {
            const title = game.title.toLowerCase();
            return !title.includes("wallpaper") && !title.includes("lynn") && !title.includes("software");
        });

        const games = filteredGames.map(game => ({
            title: game.title,
            normalPrice: game.normalPrice,
            salePrice: game.salePrice,
            image: game.thumb.replace("capsule_sm_120", "header"), // Use higher quality image
            url: `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
            platform: storeIdToPlatform[game.storeID] || "Other", // Map storeID to platform
            price: 0
        }));

        // Check for new games
        const newGames = games.filter(game => !previousGames.includes(game.title));
        if (newGames.length > 0) {
            newGames.forEach(game => {
                sendTelegramMessage(game); // Send Arabic message
            });
            previousGames = games.map(game => game.title); // Update previous games list
        }

        return games;
    } catch (error) {
        console.error("Error fetching free games from CheapShark API:", error);

        // Fallback to static data if the API fails
        return [
            {
                title: "لعبة تجريبية 1",
                normalPrice: "$19.99",
                salePrice: "$0.00",
                image: "https://via.placeholder.com/600x400", // High-quality placeholder
                url: "#",
                platform: "Steam", // Add platform
                price: 0
            },
            {
                title: "لعبة تجريبية 2",
                normalPrice: "$29.99",
                salePrice: "$0.00",
                image: "https://via.placeholder.com/600x400", // High-quality placeholder
                url: "#",
                platform: "GOG.com", // Add platform
                price: 0
            }
        ];
    }
}

// Display games in the HTML
function displayGames(games, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (games.length === 0) {
        container.innerHTML = `<p>${translations[currentLanguage].noGames}</p>`;
        return;
    }

    games.forEach(game => {
        const gameCard = document.createElement("div");
        gameCard.className = "game-card";

        gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.title}" loading="lazy">
            <h3>${game.title}</h3>
            <div class="price">
                <div class="sale-price">${translations[currentLanguage].salePrice}${game.salePrice}</div>
                <div class="normal-price">${translations[currentLanguage].normalPrice}${game.normalPrice}</div>
            </div>
            <div class="platform">
                <img src="${platformLogos[game.platform] || platformLogos["Other"]}" alt="${game.platform}">
                <span>${game.platform}</span>
            </div>
            <a href="${game.url}" target="_blank">${translations[currentLanguage].getItNow}</a>
        `;

        container.appendChild(gameCard);
    });
}

// Update the UI with the current language
function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.querySelector("header h1").textContent = translations[currentLanguage].title;
    document.querySelector("header p").textContent = translations[currentLanguage].subtitle;
    document.querySelector("#free-games h2").textContent = translations[currentLanguage].freeGames;
    document.getElementById("language-button").textContent = translations[currentLanguage].languageButton;
}

// Toggle language between Arabic and English
function toggleLanguage() {
    currentLanguage = currentLanguage === "ar" ? "en" : "ar";
    updateLanguage();
    main(); // Refresh the game list
}

// Main function to fetch and display games
async function main() {
    const freeGames = await fetchFreeGames();
    displayGames(freeGames, "free-games-container");
}

// Run the main function
main();

// Add event listener for the language button
document.getElementById("language-button").addEventListener("click", toggleLanguage);

// Initialize language on page load
updateLanguage();