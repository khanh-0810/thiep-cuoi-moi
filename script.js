// TÙY CHỈNH: sửa tên, ngày cưới, địa điểm trực tiếp trong index.html.
// Ngày cưới dùng để đếm ngược (giờ địa phương Việt Nam):
const weddingDate = new Date('2026-12-20T11:00:00+07:00');
const cover = document.getElementById('cover');
const main = document.getElementById('main');
const music = document.getElementById('music');
const musicBtn = document.getElementById('musicBtn');

async function startMusic() {
    if (!music) return;

    music.volume = 0.7;

    // Thời điểm bắt đầu phát nhạc: giây thứ 25
    const startTime = 12.9;

    try {
        // Đợi file nhạc tải thông tin thời lượng
        if (music.readyState < 1) {
            await new Promise((resolve, reject) => {
                music.addEventListener('loadedmetadata', resolve, { once: true });
                music.addEventListener('error', reject, { once: true });
                music.load();
            });
        }

        // Chuyển đến đoạn nhạc muốn nghe
        music.currentTime = Math.min(
            startTime,
            Math.max(0, music.duration - 0.5)
        );

        // Bắt đầu phát
        await music.play();
        musicBtn?.classList.add('playing');

    } catch (error) {
        console.error('Lỗi phát nhạc:', error);
    }
}

document.getElementById('openBtn').addEventListener('click', async () => {
  // Mở thiệp cưới
  cover.classList.add('hidden');
  main.classList.remove('hidden');
  musicBtn.classList.remove('hidden');

  // Phát nhạc ngay khi khách nhấn mở thiệp
  startMusic();

  // Hiển thị hiệu ứng phần giới thiệu
  observer.observe(document.querySelector('.intro'));
});
musicBtn.addEventListener('click', async () => {
    if (music.paused) {
        // Tiếp tục phát nhạc từ vị trí đã dừng
        try {
            await music.play();
            musicBtn.classList.add('playing');
        } catch (error) {
            console.error('Không thể phát nhạc:', error);
        }
    } else {
        // Dừng nhạc
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
updateCountdown(); setInterval(updateCountdown, 1000);
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
// Demo lưu RSVP trong localStorage của từng trình duyệt, KHÔNG đồng bộ giữa các khách.
const storageKey = 'wedding-demo-wishes';
function getWishes(){try {return JSON.parse(localStorage.getItem(storageKey)) || [];} catch {return [];}}
function renderWishes(){
 const list = document.getElementById('wishList'); list.replaceChildren();
 getWishes().slice(-15).reverse().forEach(item => {
  const div=document.createElement('div');div.className='wish-item';
  const name=document.createElement('strong');name.textContent=item.name+' — '+item.attendance;
  const msg=document.createElement('span');msg.textContent=item.wish || 'Chúc hai bạn trăm năm hạnh phúc!';
  div.append(name,msg);list.appendChild(div);
 });
}
renderWishes();
document.getElementById('rsvpForm').addEventListener('submit', event => {
 event.preventDefault();
 const name=document.getElementById('guestName').value.trim();
 const attendance=document.getElementById('attendance').value;
 const wish=document.getElementById('wish').value.trim();
 if(!name)return;
 const entries=getWishes();entries.push({name,attendance,wish});
 try {localStorage.setItem(storageKey,JSON.stringify(entries.slice(-100)));document.getElementById('formMessage').textContent='Đã lưu lời chúc trên thiết bị này. Cảm ơn bạn!';renderWishes();event.target.reset();}
 catch {document.getElementById('formMessage').textContent='Không thể lưu trên trình duyệt này.';}
});
