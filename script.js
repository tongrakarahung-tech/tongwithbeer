// ====================================
// 0. ข้อมูลรูปภาพใหม่ทั้งหมด (อัปเดตล่าสุด 18 รูปคู่)
// ====================================

const ALL_COUPLE_IMAGES = [
    "p1.jpg", "p2.jpg", "p3.jpg", "p4.jpg", "p5.jpg", 
    "p6.jpg", "p7.jpg", "p8.jpg", "p9.jpg", "p10.jpg", 
    "p11.jpg", "p12.jpg", "p13.jpg", "p14.jpg", 
    "mark_1.jpg", "mark_2.jpg", "mark_3.jpg", "mark_4.jpg" 
]; // รวม 18 รูป

// ใช้สำหรับหน้า Login (วนซ้ำ 18 รูป)
const LOGIN_IMAGES = ALL_COUPLE_IMAGES; 

// ใช้สำหรับหน้า Valentine (วนซ้ำ 18 รูป)
const VALENTINE_IMAGES = ALL_COUPLE_IMAGES; 

// **แก้ไขแล้ว:** ใช้รูป P1.jpg ถึง P6.jpg เป็นไอคอนสำหรับเกมจับคู่ (รวม 6 ไอคอน ที่จะสร้างเป็น 6 คู่ = 12 ช่อง)
const MATCHING_ICONS = [
    'p1.jpg', 'p2.jpg', 'p3.jpg', 
    'p4.jpg', 'p5.jpg', 'p6.jpg' 
]; 

// Jigsaw Game - ใช้ 4 รูปแรกสำหรับตัวเลือก
const JIGSAW_OPTIONS = [
    { id: 'p1', fileName: "p1.jpg", label: 'รูปคู่ 1' },
    { id: 'p2', fileName: "p2.jpg", label: 'รูปคู่ 2' }, 
    { id: 'p3', fileName: "p3.jpg", label: 'รูปคู่ 3' },
    { id: 'p4', fileName: "p4.jpg", label: 'รูปคู่ 4' }
];

// ====================================
// ตัวแปรและ Logic ส่วนที่เหลือ 
// ====================================

let currentImageIndex = 0;
let currentValentineImageIndex = 0; 
let yesButtonScale = 1; 
let valentineImageInterval; 

// Matching Game Variables
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchesFound = 0;
// Jigsaw Variables
const ROWS = 3;
const COLS = 3;
const TOTAL_PIECES = ROWS * COLS;
const JIGSAW_CONTAINER_SIZE = 450; 
const PIECE_SIZE = JIGSAW_CONTAINER_SIZE / COLS;

let pieces = [];
let selectedPieces = [];
let currentJigsawIndex = 0;
let currentImageUrl = ''; 

function cycleLoginImage() {
    const imageElement = document.getElementById('loginImage');
    if (imageElement) {
        currentImageIndex = (currentImageIndex + 1) % LOGIN_IMAGES.length;
        const nextImageURL = LOGIN_IMAGES[currentImageIndex];
        
        imageElement.style.backgroundImage = `url('${nextImageURL}')`;
        imageElement.classList.remove('image-fade');
        void imageElement.offsetWidth;
        imageElement.classList.add('image-fade');
    }
}

// ====================================
// 1. DOM Content Loaded: จัดการ Event Listener
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    // Main Menu
    const monthlyMessageElement = document.getElementById('monthlyMessage');
    if (monthlyMessageElement) {
        displayMonthlyMessage(); 
    }
    
    // Login Numpad (เรียกใช้ setupNumpad เพื่อโหลดภาพเริ่มต้น)
    const loginContainer = document.querySelector('.container');
    if (loginContainer && loginContainer.querySelector('.numpad-grid')) {
        setupNumpad();
    }
    
    // Jigsaw Game
    const jigsawArea = document.getElementById('jigsawContainer');
    if (jigsawArea) {
        setupJigsaw(); 
        const prevBtn = document.getElementById('prevImage');
        const nextBtn = document.getElementById('nextImage');
        if (prevBtn) prevBtn.addEventListener('click', () => changeJigsawImage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeJigsawImage(1));
    }
    
    // Valentine Page
    const valentineContainer = document.querySelector('.valentine-container');
    if (valentineContainer) {
        startValentineImageCycle();
    }
    
    // Matching Game
    const matchGame = document.getElementById('matchGame');
    if (matchGame) {
        setupMatchingGame(); 
    }
});


// ====================================
// 1.5 Logic สำหรับ Main Menu (ข้อความตามเดือน)
// ====================================

const monthlyMessages = {
    // 0=ม.ค. ถึง 11=ธ.ค.
    8: "บี๋ลองเล่นดูนะเค้าตั้งใจทำให้ ❤️", 
    9: "บี๋ลองเล่นดูนะเค้าตั้งใจทำให้💖", 
    10: "บี๋ลองเล่นดูนะเค้าตั้งใจทำให้ 🍂", 
    11: "บี๋ลองเล่นดูนะเค้าตั้งใจทำให้ 🎉" 
};

function displayMonthlyMessage() {
    const messageElement = document.getElementById('monthlyMessage');
    if (messageElement) {
        const date = new Date();
        const currentMonth = date.getMonth(); 

        if (monthlyMessages[currentMonth]) {
            messageElement.textContent = monthlyMessages[currentMonth];
        } else {
            messageElement.textContent = "วันนี้อยากทำอะไรดีน้า? เลือกเลย!";
        }
    }
}


// ====================================
// 2. Logic สำหรับหน้า Login (Numpad) 
// ====================================

let currentPassword = "";
const MAX_PASSWORD_LENGTH = 8; 

function updateDisplay() {
    const hiddenPassword = '•'.repeat(currentPassword.length);
    document.getElementById('passwordDisplay').textContent = hiddenPassword;
}

function setupNumpad() {
    const keys = document.querySelectorAll('.numpad-key');
    keys.forEach(key => {
        key.addEventListener('click', handleNumpadKey);
    });
    
    // **แก้ไข:** กำหนดภาพพื้นหลังเริ่มต้นของ Login Page
    const loginImageElement = document.getElementById('loginImage');
    if (loginImageElement) {
        loginImageElement.style.backgroundImage = `url('${LOGIN_IMAGES[currentImageIndex]}')`;
        loginImageElement.classList.add('image-fade');
    }
}

function handleNumpadKey(event) {
    const key = event.currentTarget.dataset.key;
    const message = document.getElementById('message');
    if(message) message.classList.add('hidden');

    if (key >= '0' && key <= '9') {
        if (currentPassword.length < MAX_PASSWORD_LENGTH) {
            currentPassword += key;
            cycleLoginImage();
        }
    } else if (key === 'C') {
        currentPassword = currentPassword.slice(0, -1);
        cycleLoginImage();
    } else if (key === 'L') {
        checkPassword(currentPassword);
        return;
    }
    updateDisplay();
}

function checkPassword(password) {
    const correctPassword = "29042025"; 
    const message = document.getElementById('message');

    if (password === correctPassword) {
        window.location.href = "main_menu.html"; 
    } else {
        if (message) {
            message.classList.remove('hidden');
            message.classList.add('error');
            currentPassword = "";
            updateDisplay();
        }
    }
}


// ====================================
// 3. Logic สำหรับหน้าเกมต่อจิ๊กซอว์ 
// ====================================

function setupJigsaw() {
    const container = document.getElementById('jigsawContainer');
    if (!container) return;

    container.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

    loadJigsawImage(currentJigsawIndex);
}

function loadJigsawImage(index) {
    if (index < 0 || index >= JIGSAW_OPTIONS.length) return;

    const selector = document.getElementById('imageSelector');
    selector.innerHTML = ''; 
    
    const option = JIGSAW_OPTIONS[index];
    const img = document.createElement('img');
    img.src = option.fileName;
    img.alt = option.label;
    img.classList.add('image-choice'); 
    img.dataset.filename = option.fileName;
    img.title = option.label;
    
    selector.appendChild(img);

    currentJigsawIndex = index;
    currentImageUrl = option.fileName;
    resetJigsawGame(currentImageUrl); 
    
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    if (prevBtn) prevBtn.disabled = (currentJigsawIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentJigsawIndex === JIGSAW_OPTIONS.length - 1);
}

function changeJigsawImage(direction) {
    let newIndex = currentJigsawIndex + direction;

    if (newIndex >= 0 && newIndex < JIGSAW_OPTIONS.length) {
        loadJigsawImage(newIndex);
    }
}

function resetJigsawGame(imageUrl) {
    const container = document.getElementById('jigsawContainer');
    const message = document.getElementById('jigsawMessage');
    
    container.innerHTML = '';
    pieces = [];
    selectedPieces = [];
    
    createAndShufflePieces(imageUrl, container);

    const currentPieces = Array.from(container.children);
    currentPieces.forEach(piece => {
        piece.addEventListener('click', handleJigsawClick);
    });
    
    message.textContent = "คลิกที่ชิ้นส่วนที่ต้องการสลับ!";
}

function createAndShufflePieces(imageUrl, container) {
    const backgroundSize = JIGSAW_CONTAINER_SIZE; 
    const pieceSize = PIECE_SIZE; 

    for (let i = 0; i < TOTAL_PIECES; i++) {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.dataset.correctIndex = i; 
        
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        
        const xPos = -col * pieceSize; 
        const yPos = -row * pieceSize;
        
        piece.style.backgroundImage = `url('${imageUrl}')`; 
        piece.style.backgroundSize = `${JIGSAW_CONTAINER_SIZE}px ${JIGSAW_CONTAINER_SIZE}px`; 
        piece.style.backgroundPosition = `${xPos}px ${yPos}px`; 
        
        pieces.push(piece);
    }

    shuffleAndDrawPieces(container);
}

function shuffleAndDrawPieces(container) {
    let shuffledIndices = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
    
    let isShuffled = false;
    while (!isShuffled) {
        shuffledIndices.sort(() => Math.random() - 0.5);
        isShuffled = shuffledIndices.some((val, idx) => val !== idx);
    }

    const shuffledPieces = shuffledIndices.map(index => pieces[index]);

    container.innerHTML = '';
    
    shuffledPieces.forEach((piece, currentDisplayIndex) => {
        piece.dataset.currentDisplayIndex = currentDisplayIndex; 
        container.appendChild(piece);
    });
}


function handleJigsawClick(event) {
    const piece = event.currentTarget;
    const message = document.getElementById('jigsawMessage');

    if (message.textContent.includes('สำเร็จ!')) return;

    if (piece.classList.contains('selected')) {
        piece.classList.remove('selected');
        selectedPieces = selectedPieces.filter(p => p !== piece);
        message.textContent = "ยกเลิกการเลือก";
    } else {
        if (selectedPieces.length < 2) {
            piece.classList.add('selected');
            selectedPieces.push(piece);
            
            if (selectedPieces.length === 2) {
                message.textContent = "กำลังสลับชิ้นส่วน...";
                
                swapPiecesInDOM(selectedPieces[0], selectedPieces[1]);
                
                selectedPieces = [];
                
                checkWin();
                
            } else {
                message.textContent = "เลือกชิ้นส่วนที่สอง...";
            }
        }
    }
}

function swapPiecesInDOM(p1, p2) {
    const container = document.getElementById('jigsawContainer');
    
    const p1Placeholder = document.createElement('div');
    const p2Placeholder = document.createElement('div');

    container.replaceChild(p1Placeholder, p1);
    container.replaceChild(p2Placeholder, p2);

    container.replaceChild(p2, p1Placeholder);
    container.replaceChild(p1, p2Placeholder);
    
    p1.classList.remove('selected');
    p2.classList.remove('selected');
    
    p1Placeholder.remove();
    p2Placeholder.remove();
}


function checkWin() {
    const container = document.getElementById('jigsawContainer');
    const currentPieces = Array.from(container.children);
    let isCorrect = true;

    currentPieces.forEach((piece, index) => {
        if (parseInt(piece.dataset.correctIndex) !== index) {
            isCorrect = false;
        }
    });

    const message = document.getElementById('jigsawMessage');
    if (isCorrect) {
        message.textContent = "🎉 ยอดเยี่ยมมาก! ต่อจิ๊กซอว์สำเร็จแล้ว! ❤️";
        currentPieces.forEach(p => p.style.border = 'none');
    } else {
        setTimeout(() => {
             if (!message.textContent.includes('สำเร็จ!')) {
                 message.textContent = "เกือบแล้ว! ลองสลับชิ้นส่วนอื่นต่อสิ 🧐";
             }
        }, 300);
    }
}


// ====================================
// 4. Logic สำหรับ Gallery Lightbox 
// ====================================

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('myLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    lightbox.style.display = "flex"; 
    lightboxImage.src = imageSrc;
    document.body.style.overflow = 'hidden'; 
}

function closeLightbox(event) {
    const lightbox = document.getElementById('myLightbox');
    if (event.target === lightbox || event.target.classList.contains('close-button')) {
        lightbox.style.display = "none";
        document.body.style.overflow = 'auto'; 
    }
}

window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;


// ====================================
// 5. Logic สำหรับหน้า Valentine 
// ====================================

function startValentineImageCycle() {
    const catImage = document.querySelector('.cat-image');
    if (!catImage) return; 

    catImage.src = VALENTINE_IMAGES[currentValentineImageIndex];

    if (valentineImageInterval) {
        clearInterval(valentineImageInterval);
    }

    valentineImageInterval = setInterval(() => {
        currentValentineImageIndex = (currentValentineImageIndex + 1) % VALENTINE_IMAGES.length;
        catImage.classList.add('image-fade-out'); 

        setTimeout(() => {
            catImage.src = VALENTINE_IMAGES[currentValentineImageIndex];
            catImage.classList.remove('image-fade-out'); 
        }, 500); 
        
    }, 4000); 
}


function moveButton() {
    const noBtn = document.getElementById('noBtn');
    
    const maxMoveX = 250; 
    const maxMoveY = 150; 
    const newX = Math.random() * (maxMoveX * 2) - maxMoveX;
    const newY = Math.random() * (maxMoveY * 2) - maxMoveY;
    
    noBtn.style.transform = `translate(${newX}px, ${newY}px) scale(0.8)`;
    
    const messages = ['ไม่เอาหรอ? 🤔', 'แน่ใจนะ 🥺', 'ลองคิดดูใหม่สิ!', 'กดไม่ได้หรอก 😝'];
    noBtn.textContent = messages[Math.floor(Math.random() * messages.length)];

    const yesBtn = document.getElementById('yesBtn');
    if (yesBtn) {
        yesButtonScale += 0.05; 
        yesBtn.style.transform = `scale(${yesButtonScale})`;
        yesBtn.textContent = `Yes (${Math.round((yesButtonScale - 1) * 100)}%)`; 
    }
}

function handleYes() {
    const container = document.querySelector('.valentine-container');
    
    if (valentineImageInterval) {
        clearInterval(valentineImageInterval);
    }

    container.style.animation = 'none'; 
    
    const randomIndex = Math.floor(Math.random() * VALENTINE_IMAGES.length);
    const randomImageSrc = VALENTINE_IMAGES[randomIndex];

    container.innerHTML = `
        <h1 style="font-size: 3em;">YES! I love you too! 🥰</h1>
        <img src="${randomImageSrc}" alt="Happy Couple Image" class="cat-image" style="width: 200px; height: 200px;">
        <p style="color: #ff69b4; font-size: 24px; font-weight: bold;">เค้าก็รักบี๋เหมือนกันเด้อออออ ❤️</p>
        <button onclick="window.location.href='main_menu.html'" style="background-color: #ff69b4; color: white; margin-top: 20px; padding: 12px 25px; border-radius: 10px; border: none; cursor: pointer; font-weight: bold;">
            กลับเมนูหลัก 🏡
        </button>
    `;
    
    document.body.style.backgroundColor = '#ffd8e1';
}

window.moveButton = moveButton;
window.handleYes = handleYes;


// ====================================
// 6. Logic สำหรับหน้าเกมจับคู่รูปภาพ
// ====================================

function setupMatchingGame() {
    const gameContainer = document.getElementById('matchGame');
    if (!gameContainer) return;

    let cards = [...MATCHING_ICONS, ...MATCHING_ICONS];
    shuffle(cards);
    matchesFound = 0; 
    
    gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)'; 

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('match-card');
        card.dataset.icon = icon;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back" style="background-image: url('${icon}');"></div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        gameContainer.appendChild(card);
    });
    
    document.getElementById('gameMessage').textContent = 'พลิกการ์ดสองใบเพื่อหาคู่!';
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    matchesFound++;
    document.getElementById('gameMessage').textContent = `จับคู่ได้ ${matchesFound} คู่แล้ว!`;
    
    if (matchesFound === MATCHING_ICONS.length) {
        document.getElementById('gameMessage').textContent = '🎉 ยอดเยี่ยม! จับคู่ครบทุกคู่แล้ว!';
    }

    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');

        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}