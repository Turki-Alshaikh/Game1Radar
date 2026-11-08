let currentLanguage = "ar";

const platformLogos = {
    "Steam": "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
    "Epic Games": "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg",
    "Humble Bundle": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Humble_Bundle_logo.svg",
    "GOG.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GOG.com_logo.svg/800px-GOG.com_logo.svg.png",
    "Origin": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Origin_logo.svg",
    "Ubisoft Store": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ubisoft_logo.svg",
    "Other": "https://via.placeholder.com/40"
};

const storeIdToPlatform = {
    "1": "Steam", "2": "GOG.com", "3": "Epic Games", "11": "Epic Games",
    "25": "Epic Games", "7": "Humble Bundle", "8": "Origin", "9": "Ubisoft Store"
};

const translations = {
    "ar": {
        "title": "رادار 1 الألعاب | عروض الألعاب المجانية",
        "brand": "رادار <span>1 الألعاب </span>",
        "heroTitle": "اكتشف أحدث الألعاب المجانية",
        "heroSubtitle": "لا تفوت الفرصة! احصل على ألعابك المفضلة مجاناً من أشهر المنصات قبل انتهاء العروض.",
        "sectionHeading": "الألعاب المتاحة حالياً",
        "normalPrice": "بدلاً من ",
        "salePrice": "مجاناً",
        "getItNow": "احصل عليها الآن",
        "noGames": "لا توجد عروض ألعاب مجانية حالياً. عد قريباً!",
        "footerText": "جميع الحقوق محفوظة © 2026 رادار 1 الألعاب",
        "sponsorText": "برعاية",
        "languageButton": "English"
    },
    "en": {
        "title": "Game 1 Radar | Free Games Deals",
        "brand": "Game <span>1 Radar</span>",
        "heroTitle": "Discover the Latest Free Games",
        "heroSubtitle": "Don't miss out! Get your favorite games for free from top platforms before deals expire.",
        "sectionHeading": "Available Games",
        "normalPrice": "Was ",
        "salePrice": "FREE",
        "getItNow": "Get It Now",
        "noGames": "No free games available right now. Check back later!",
        "footerText": "All Rights Reserved © 2026 Game 1 Radar",
        "sponsorText": "Sponsored by",
        "languageButton": "العربية"
    }
};

async function fetchFreeGames() {
    try {
        const response = await fetch("https://www.cheapshark.com/api/1.0/deals?upperPrice=0");
        const data = await response.json();

        if (data.length === 0) throw new Error("No free games found.");

        const filteredGames = data.filter(game => {
            const title = game.title.toLowerCase();
            return !title.includes("dlc") && !title.includes("game pass") && 
                   !title.includes("add-on") && !title.includes("expansion") && 
                   !title.includes("wallpaper") && !title.includes("lynn") && 
                   !title.includes("software") && !title.includes("battle pass") && 
                   !title.includes("bundle") && !title.includes("pack") && 
                   !title.includes("season") && !title.includes("edition");
        });

        return filteredGames.map(game => ({
            title: game.title,
            normalPrice: game.normalPrice,
            image: game.thumb.replace("capsule_sm_120", "header"),
            url: `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
            platform: storeIdToPlatform[game.storeID] || "Other"
        }));
    } catch (error) {
        console.error("Error fetching free games:", error);
        return [];
    }
}

function displayGames(games, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (games.length === 0) {
        container.innerHTML = `<p class="loading">${translations[currentLanguage].noGames}</p>`;
        return;
    }

    games.forEach(game => {
        const gameCard = document.createElement("div");
        gameCard.className = "game-card";

        gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.title}" class="game-image" loading="lazy">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-meta">
                    <div class="price-box">
                        <span class="sale-price">${translations[currentLanguage].salePrice}</span>
                        <span class="normal-price">${translations[currentLanguage].normalPrice}$${game.normalPrice}</span>
                    </div>
                    <div class="platform-box">
                        <img src="${platformLogos[game.platform] || platformLogos["Other"]}" alt="${game.platform}">
                        <span>${game.platform}</span>
                    </div>
                </div>
                <a href="${game.url}" target="_blank" class="btn-get">${translations[currentLanguage].getItNow}</a>
            </div>
        `;
        container.appendChild(gameCard);
    });
}

function updateLanguage() {
    const t = translations[currentLanguage];
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.title = t.title;
    document.querySelector(".brand").innerHTML = t.brand;
    document.getElementById("hero-title").textContent = t.heroTitle;
    document.getElementById("hero-subtitle").textContent = t.heroSubtitle;
    document.getElementById("section-heading").textContent = t.sectionHeading;
    document.getElementById("footer-text").textContent = t.footerText;
    document.getElementById("sponsor-text").textContent = t.sponsorText;
    document.getElementById("language-button").textContent = t.languageButton;
}

function toggleLanguage() {
    currentLanguage = currentLanguage === "ar" ? "en" : "ar";
    updateLanguage();
    main(); 
}

async function main() {
    const freeGames = await fetchFreeGames();
    displayGames(freeGames, "free-games-container");
}

document.getElementById("language-button").addEventListener("click", toggleLanguage);

updateLanguage();
main();