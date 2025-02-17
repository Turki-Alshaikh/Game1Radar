let currentLanguage = "ar"; // اللغة الافتراضية هي العربية

// منصات الألعاب
const platformLogos = {
    "Steam": "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
    "Epic Games": "https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg",
    "Humble Bundle": "https://upload.wikimedia.org/wikipedia/commons/7/7a/Humble_Bundle_logo.svg",
    "GOG.com": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/GOG.com_logo.svg/800px-GOG.com_logo.svg.png",
    "Origin": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Origin_logo.svg",
    "Ubisoft Store": "https://upload.wikimedia.org/wikipedia/commons/3/31/Ubisoft_logo.svg",
    "Other": "https://via.placeholder.com/40" // صورة افتراضية
};

// تعيين معرف المتجر إلى المنصة
const storeIdToPlatform = {
    "1": "Steam",
    "2": "GOG.com",
    "3": "Epic Games",
    "11": "Epic Games",
    "25": "Epic Games",
    "7": "Humble Bundle",
    "8": "Origin",
    "9": "Ubisoft Store"
};

// الترجمات
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

// جلب الألعاب المجانية من CheapShark API
async function fetchFreeGames() {
    try {
        const response = await fetch("https://www.cheapshark.com/api/1.0/deals?upperPrice=0");
        const data = await response.json();

        if (data.length === 0) {
            throw new Error("No free games found.");
        }

        // تصفية الألعاب غير المرغوب فيها (DLC، Game Pass، إضافات، إلخ)
        const filteredGames = data.filter(game => {
            const title = game.title.toLowerCase();
            const isGame = !title.includes("dlc") && 
                           !title.includes("game pass") && 
                           !title.includes("add-on") && 
                           !title.includes("expansion") && 
                           !title.includes("wallpaper") && 
                           !title.includes("lynn") && 
                           !title.includes("software");
            return isGame;
        });

        const games = filteredGames.map(game => ({
            title: game.title,
            normalPrice: game.normalPrice,
            salePrice: game.salePrice,
            image: game.thumb.replace("capsule_sm_120", "header"),
            url: `https://www.cheapshark.com/redirect?dealID=${game.dealID}`,
            platform: storeIdToPlatform[game.storeID] || "Other",
            price: 0
        }));

        return games;
    } catch (error) {
        console.error("Error fetching free games:", error);
        return [];
    }
}
// عرض الألعاب في الواجهة
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

// تحديث اللغة
function updateLanguage() {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.querySelector("header h1").textContent = translations[currentLanguage].title;
    document.querySelector("header p").textContent = translations[currentLanguage].subtitle;
    document.querySelector("#free-games h2").textContent = translations[currentLanguage].freeGames;
    document.getElementById("language-button").textContent = translations[currentLanguage].languageButton;
}

// تبديل اللغة
function toggleLanguage() {
    currentLanguage = currentLanguage === "ar" ? "en" : "ar";
    updateLanguage();
    main(); // تحديث قائمة الألعاب
}

// الوظيفة الرئيسية
async function main() {
    const freeGames = await fetchFreeGames();
    displayGames(freeGames, "free-games-container");
}

// تشغيل الوظيفة الرئيسية
main();

// إضافة حدث لزر اللغة
document.getElementById("language-button").addEventListener("click", toggleLanguage);

// تهيئة اللغة عند التحميل
updateLanguage();
