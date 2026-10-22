// Import Firebase SDK từ CDN chính thức
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Cấu hình Firebase cho dự án thiep-cuoi-ynhi-khanhhuy
const firebaseConfig = {
  apiKey: "AIzaSyBzTS4TDWYSmJkYOLLePmq_Tc95eRqP-xU",
  authDomain: "thiep-cuoi-ynhi-khanhhuy.firebaseapp.com",
  projectId: "thiep-cuoi-ynhi-khanhhuy",
  storageBucket: "thiep-cuoi-ynhi-khanhhuy.firebasestorage.app",
  messagingSenderId: "484254624595",
  appId: "1:484254624595:web:91c11949826c3ea3800fa6",
  measurementId: "G-R2CZBTP03S"
};

// Khởi tạo Firebase và Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ngày cưới dùng để đếm ngược (giờ địa phương Việt Nam):
const weddingDate = new Date('2026-12-20T11:00:00+07:00');
const cover = document.getElementById('cover');
const main = document.getElementById('main');
const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');

async function startMusic() {
    if (!music) return;

    music.volume = 0.7;
    const startTime = 12.9;

    try {
        if (music.readyState < 1) {
            await new Promise((resolve, reject) => {
                music.addEventListener('loadedmetadata', resolve, { once: true });
                music.addEventListener('error', reject, { once: true });
                music.load();
            });
        }

        music.currentTime = Math.min(
            startTime,
            Math.max(0, music.duration - 0.5)
        );

        await music.play();
        musicBtn?.classList.add('playing');

    } catch (error) {
        console.error('Lỗi phát nhạc:', error);
    }
}

document.getElementById('openBtn').addEventListener('click', async () => {
  cover.classList.add('hidden');
  main.classList.remove('hidden');
  musicBtn.classList.remove('hidden');
  startMusic();
  observer.observe(document.querySelector('.intro'));
});

musicBtn.addEventListener('click', async () => {
    if (music.paused) {
        try {
            await music.play();
            musicBtn.classList.add('playing');
        } catch (error) {
            console.error('Không thể phát nhạc:', error);
        }
    } else {
        music.pause();
        musicBtn.classList.remove('playing');
    }
});

function updateCountdown() {
  let remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86400000); remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000); remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000); remaining %= 60000;
  const seconds = Math.floor(remaining / 1000);
  Object.entries({days,hours,minutes,seconds}).forEach(([key,value]) => document.getElementById(key).textContent = String(value).padStart(2,'0'));
}
updateCountdown(); 
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ================= HIỂN THỊ LỜI CHÚC TỪ FIRESTORE =================
const wishList = document.getElementById('wishList');

const q = query(collection(db, 'wishes'));
onSnapshot(q, (snapshot) => {
    wishList.replaceChildren();
    
    const wishes = [];
    snapshot.forEach((doc) => {
        wishes.push({ id: doc.id, ...doc.data() });
    });

    // Sắp xếp lời chúc mới nhất lên đầu
    wishes.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return timeB - timeA;
    });

    if (wishes.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.style.cssText = 'text-align: center; color: var(--brown); font-style: italic;';
        emptyMsg.textContent = 'Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc đến cô dâu chú rể nhé!';
        wishList.appendChild(emptyMsg);
        return;
    }

    // Hiển thị danh sách lời chúc theo đúng cấu trúc CSS `.wish-item` của bạn
    wishes.slice(0, 15).forEach(item => {
        const div = document.createElement('div');
        div.className = 'wish-item';
        
        const name = document.createElement('strong');
        name.textContent = (item.name || 'Ẩn danh') + ' — ' + (item.attendance || 'Có tham dự');
        
        const msg = document.createElement('span');
        msg.textContent = item.wish || 'Chúc hai bạn trăm năm hạnh phúc!';
        
        div.append(name, msg);
        wishList.appendChild(div);
    });
});

// GỬI LỜI CHÚC LÊN FIRESTORE
document.getElementById('rsvpForm').addEventListener('submit', async event => {
    event.preventDefault();
    const name = document.getElementById('guestName').value.trim();
    const attendance = document.getElementById('attendance').value;
    const wish = document.getElementById('wish').value.trim();
    
    if (!name) return;

    const formMessage = document.getElementById('formMessage');

    try {
        await addDoc(collection(db, 'wishes'), {
            name: name,
            attendance: attendance,
            wish: wish,
            createdAt: serverTimestamp()
        });

        formMessage.textContent = 'Gửi lời chúc và xác nhận thành công! Cảm ơn bạn rất nhiều ❤️';
        formMessage.style.color = 'var(--brown)';
        event.target.reset();
    } catch (error) {
        console.error('Lỗi khi gửi lời chúc lên Firestore:', error);
        formMessage.textContent = 'Không thể gửi lời chúc lúc này, vui lòng thử lại sau.';
        formMessage.style.color = 'red';
    }
});