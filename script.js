// Data antrian
let queueHistory = [];
let currentQueue = {
    number: null,
    operator: null,
    time: null
};

// Elemen DOM
const currentQueueNumberElement = document.getElementById('current-queue-number');
const currentQueueOperatorElement = document.getElementById('current-queue-operator');
const queueInstructionElement = document.getElementById('queue-instruction-text');
const historyListElement = document.getElementById('history-list');
const queueNumberInput = document.getElementById('queue-number');
const queueOperatorSelect = document.getElementById('queue-operator');
const callButton = document.getElementById('call-button');
const resetButton = document.getElementById('reset-button');
const announcementSound = document.getElementById('announcement-sound');
const currentDateElement = document.getElementById('current-date');
const currentTimeElement = document.getElementById('current-time');
const currentYearElement = document.getElementById('current-year');
const operatorItems = document.querySelectorAll('.operator-item');

// Nama operator untuk tampilan dan suara
const operatorNames = {
    '1': 'Operator 1 - Pendaftaran',
    '2': 'Operator 2 - Verifikasi Dokumen',
    '3': 'Operator 3 - Wawancara',
    '4': 'Operator 4 - Tes Potensi Akademik',
    '5': 'Operator 5 - Tes Bakat Minat',
    '6': 'Operator 6 - Konsultasi Jurusan',
    '7': 'Operator 7 - Pembayaran',
    '8': 'Operator 8 - Pengambilan Kartu'
};

// Fungsi untuk memperbarui tanggal dan waktu
function updateDateTime() {
    const now = new Date();
    
    // Format tanggal: Hari, DD Month YYYY
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', optionsDate);
    currentDateElement.textContent = formattedDate;
    
    // Format waktu: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Tahun untuk footer
    currentYearElement.textContent = now.getFullYear();
}

// Fungsi untuk mengonversi angka ke kata-kata dalam bahasa Indonesia
function numberToWords(num) {
    const units = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    const teens = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
    const tens = ['', '', 'dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];
    
    if (num === 0) return 'nol';
    
    let words = '';
    
    // Ratusan
    if (num >= 100) {
        const hundreds = Math.floor(num / 100);
        if (hundreds === 1) {
            words += 'seratus ';
        } else {
            words += units[hundreds] + ' ratus ';
        }
        num %= 100;
    }
    
    // Puluhan dan satuan
    if (num > 0) {
        if (num < 10) {
            words += units[num];
        } else if (num < 20) {
            words += teens[num - 10];
        } else {
            const tensDigit = Math.floor(num / 10);
            const unitsDigit = num % 10;
            words += tens[tensDigit];
            if (unitsDigit > 0) {
                words += ' ' + units[unitsDigit];
            }
        }
    }
    
    return words.trim();
}

// Fungsi untuk membuat pengumuman suara
function makeAnnouncement(queueNumber, operatorNumber) {
    // Gunakan Web Speech API untuk suara
    if ('speechSynthesis' in window) {
        // Hentikan suara yang sedang berjalan
        speechSynthesis.cancel();
        
        // Mainkan suara panggilan pengumuman di bandara
        announcementSound.play();
        
        // Tunggu sebentar sebelum memanggil nomor antrian
        setTimeout(() => {
            const utterance1 = new SpeechSynthesisUtterance();
            utterance1.text = `Panggilan pengumuman.`;
            utterance1.lang = 'id-ID';
            utterance1.rate = 0.9;
            utterance1.pitch = 1.2;
            
            // Gunakan suara wanita jika tersedia
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => voice.lang.includes('id') && voice.name.includes('Female')) ||
                               voices.find(voice => voice.lang.includes('id-ID')) ||
                               voices.find(voice => voice.lang.includes('id'));
            
            if (femaleVoice) {
                utterance1.voice = femaleVoice;
            }
            
            // Konversi nomor antrian ke kata-kata
            const queueNumberWords = numberToWords(queueNumber);
            
            // Buat teks untuk diucapkan
            const operatorText = operatorNames[operatorNumber];
            
            // Ucapkan pengumuman
            speechSynthesis.speak(utterance1);
            
            // Tunggu sebentar sebelum melanjutkan
            setTimeout(() => {
                const utterance2 = new SpeechSynthesisUtterance();
                utterance2.text = `Nomor antrian ${queueNumberWords}, silahkan menuju ke ${operatorText}.`;
                utterance2.lang = 'id-ID';
                utterance2.rate = 0.9;
                utterance2.pitch = 1.2;
                
                if (femaleVoice) {
                    utterance2.voice = femaleVoice;
                }
                
                speechSynthesis.speak(utterance2);
            }, 1000);
        }, 1000);
    } else {
        alert('Browser Anda tidak mendukung Web Speech API. Pengumuman suara tidak dapat diputar.');
    }
}

// Fungsi untuk memanggil antrian
function callQueue() {
    const queueNumber = parseInt(queueNumberInput.value);
    const operatorNumber = queueOperatorSelect.value;
    
    if (isNaN(queueNumber) || queueNumber < 1) {
        alert('Masukkan nomor antrian yang valid (minimal 1)');
        return;
    }
    
    // Update antrian saat ini
    currentQueue.number = queueNumber;
    currentQueue.operator = operatorNumber;
    currentQueue.time = new Date();
    
    // Update tampilan
    currentQueueNumberElement.textContent = queueNumber;
    currentQueueOperatorElement.textContent = operatorNames[operatorNumber];
    queueInstructionElement.textContent = `Silahkan menuju ke ${operatorNames[operatorNumber]}`;
    
    // Tambahkan ke riwayat
    const historyItem = {
        number: queueNumber,
        operator: operatorNumber,
        operatorName: operatorNames[operatorNumber],
        time: currentQueue.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    queueHistory.unshift(historyItem);
    
    // Batasi riwayat hanya 10 item terbaru
    if (queueHistory.length > 10) {
        queueHistory = queueHistory.slice(0, 10);
    }
    
    // Update tampilan riwayat
    updateHistoryDisplay();
    
    // Buat pengumuman suara
    makeAnnouncement(queueNumber, operatorNumber);
    
    // Highlight operator yang aktif
    highlightActiveOperator(operatorNumber);
    
    // Auto increment nomor antrian untuk panggilan selanjutnya
    queueNumberInput.value = queueNumber + 1;
}

// Fungsi untuk memperbarui tampilan riwayat
function updateHistoryDisplay() {
    if (queueHistory.length === 0) {
        historyListElement.innerHTML = '<div class="history-empty">Belum ada riwayat pemanggilan</div>';
        return;
    }
    
    let historyHTML = '';
    queueHistory.forEach(item => {
        historyHTML += `
            <div class="history-item">
                <div class="history-number">${item.number}</div>
                <div class="history-operator">${item.operatorName}</div>
                <div class="history-time">${item.time}</div>
            </div>
        `;
    });
    
    historyListElement.innerHTML = historyHTML;
}

// Fungsi untuk menyorot operator yang aktif
function highlightActiveOperator(operatorNumber) {
    operatorItems.forEach(item => {
        if (item.getAttribute('data-operator') === operatorNumber) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Fungsi untuk reset antrian
function resetQueue() {
    if (confirm('Apakah Anda yakin ingin mereset antrian? Riwayat pemanggilan akan dihapus.')) {
        currentQueue.number = null;
        currentQueue.operator = null;
        currentQueue.time = null;
        
        currentQueueNumberElement.textContent = '--';
        currentQueueOperatorElement.textContent = '--';
        queueInstructionElement.textContent = 'Silahkan menunggu pemanggilan';
        
        queueHistory = [];
        updateHistoryDisplay();
        
        queueNumberInput.value = 1;
        queueOperatorSelect.value = '1';
        
        // Hentikan suara jika sedang diputar
        speechSynthesis.cancel();
        announcementSound.pause();
        announcementSound.currentTime = 0;
        
        // Hapus highlight operator
        operatorItems.forEach(item => {
            item.classList.remove('active');
        });
    }
}

// Fungsi untuk inisialisasi
function init() {
    // Update tanggal dan waktu setiap detik
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event listener untuk tombol panggil antrian
    callButton.addEventListener('click', callQueue);
    
    // Event listener untuk tombol reset
    resetButton.addEventListener('click', resetQueue);
    
    // Event listener untuk operator item
    operatorItems.forEach(item => {
        item.addEventListener('click', function() {
            const operatorNumber = this.getAttribute('data-operator');
            queueOperatorSelect.value = operatorNumber;
            
            // Hapus highlight dari semua operator
            operatorItems.forEach(op => op.classList.remove('active'));
            // Tambahkan highlight ke operator yang dipilih
            this.classList.add('active');
        });
    });
    
    // Event listener untuk keyboard
    document.addEventListener('keydown', function(event) {
        // Spasi untuk memanggil antrian
        if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            callQueue();
        }
        
        // Escape untuk reset antrian
        if (event.code === 'Escape') {
            resetQueue();
        }
        
        // Angka 1-8 untuk memilih operator
        if (event.code >= 'Digit1' && event.code <= 'Digit8') {
            const operatorNumber = event.code.replace('Digit', '');
            queueOperatorSelect.value = operatorNumber;
            highlightActiveOperator(operatorNumber);
        }
    });
    
    // Inisialisasi Web Speech API
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = function() {
            console.log('Web Speech API voices loaded');
        };
    }
    
    // Update riwayat display
    updateHistoryDisplay();
    
    // Set tahun di footer
    currentYearElement.textContent = new Date().getFullYear();
}

// Inisialisasi aplikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', init);