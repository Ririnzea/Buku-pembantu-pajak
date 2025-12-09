// Transaction data array
let transactions = [];
let editingIndex = -1;

// Load data from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderTable();
});

// Add or Update Transaction
function addTransaction() {
    const tanggal = document.getElementById('inputTanggal').value;
    const noBukti = document.getElementById('inputNoBukti').value;
    const uraian = document.getElementById('inputUraian').value;
    const kodeRekening = document.getElementById('inputKodeRekening').value;
    const pemotongan = parseFloat(document.getElementById('inputPemotongan').value) || 0;
    const penyetoran = parseFloat(document.getElementById('inputPenyetoran').value) || 0;

    // Validation
    if (!tanggal || !uraian) {
        alert('Tanggal dan Uraian harus diisi!');
        return;
    }

    const transaction = {
        tanggal,
        noBukti,
        uraian,
        kodeRekening,
        pemotongan,
        penyetoran
    };

    if (editingIndex >= 0) {
        // Update existing transaction
        transactions[editingIndex] = transaction;
        editingIndex = -1;
        document.querySelector('.btn-add').textContent = 'Tambah Transaksi';
    } else {
        // Add new transaction
        transactions.push(transaction);
    }

    saveToLocalStorage();
    renderTable();
    clearForm();
}

// Render table with automatic calculations
function renderTable() {
    const tbody = document.getElementById('transactionTableBody');
    tbody.innerHTML = '';

    let runningBalance = 0;
    let totalPemotongan = 0;
    let totalPenyetoran = 0;

    transactions.forEach((transaction, index) => {
        // Calculate running balance
        // Formula: Saldo = Previous Saldo + Penyetoran - Pemotongan
        runningBalance = runningBalance + transaction.penyetoran - transaction.pemotongan;

        // Update totals
        totalPemotongan += transaction.pemotongan;
        totalPenyetoran += transaction.penyetoran;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatDate(transaction.tanggal)}</td>
            <td>${transaction.noBukti || '-'}</td>
            <td style="text-align: left; padding-left: 10px;">${transaction.uraian}</td>
            <td>${transaction.kodeRekening || '-'}</td>
            <td>${formatNumber(transaction.pemotongan)}</td>
            <td>${formatNumber(transaction.penyetoran)}</td>
            <td>${formatNumber(runningBalance)}</td>
            <td class="no-print">
                <button class="action-btn btn-edit" onclick="editTransaction(${index})">Edit</button>
                <button class="action-btn btn-remove" onclick="deleteTransaction(${index})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Update totals in footer
    document.getElementById('totalPemotongan').textContent = formatNumber(totalPemotongan);
    document.getElementById('totalPenyetoran').textContent = formatNumber(totalPenyetoran);

    // Update annual summary
    renderAnnualSummary();
}

// Edit Transaction
function editTransaction(index) {
    const transaction = transactions[index];

    document.getElementById('inputTanggal').value = transaction.tanggal;
    document.getElementById('inputNoBukti').value = transaction.noBukti;
    document.getElementById('inputUraian').value = transaction.uraian;
    document.getElementById('inputKodeRekening').value = transaction.kodeRekening;
    document.getElementById('inputPemotongan').value = transaction.pemotongan;
    document.getElementById('inputPenyetoran').value = transaction.penyetoran;

    editingIndex = index;
    document.querySelector('.btn-add').textContent = 'Update Transaksi';

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete Transaction
function deleteTransaction(index) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        transactions.splice(index, 1);
        saveToLocalStorage();
        renderTable();
    }
}

// Clear Form
function clearForm() {
    document.getElementById('inputTanggal').value = '';
    document.getElementById('inputNoBukti').value = '';
    document.getElementById('inputUraian').value = '';
    document.getElementById('inputKodeRekening').value = '';
    document.getElementById('inputPemotongan').value = '';
    document.getElementById('inputPenyetoran').value = '';

    editingIndex = -1;
    document.querySelector('.btn-add').textContent = 'Tambah Transaksi';
}

// Clear All Data
function clearAllData() {
    if (confirm('Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
        transactions = [];
        saveToLocalStorage();
        renderTable();
        clearForm();
        alert('Semua data telah dihapus.');
    }
}

// Format number with thousand separators
function formatNumber(num) {
    if (num === 0) return '-';
    return num.toLocaleString('id-ID');
}

// Format date to Indonesian format
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('bukuPembantuPajak', JSON.stringify(transactions));
}

// Load from localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('bukuPembantuPajak');
    if (saved) {
        try {
            transactions = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading data:', e);
            transactions = [];
        }
    }
}

// Add some sample data on first load (optional - can be removed)
if (transactions.length === 0) {
    transactions = [
        {
            tanggal: '2025-01-15',
            noBukti: '',
            uraian: 'Pungut Pajak PPN',
            kodeRekening: '',
            pemotongan: 3000000,
            penyetoran: 0
        },
        {
            tanggal: '2025-01-15',
            noBukti: '',
            uraian: 'Setor Pajak PPN',
            kodeRekening: '',
            pemotongan: 0,
            penyetoran: 3000000
        },
        {
            tanggal: '2025-01-20',
            noBukti: '',
            uraian: 'Pungut Pajak PPN',
            kodeRekening: '',
            pemotongan: 2000000,
            penyetoran: 0
        },
        {
            tanggal: '2025-01-20',
            noBukti: '',
            uraian: 'Setor Pajak PPN',
            kodeRekening: '',
            pemotongan: 0,
            penyetoran: 2000000
        }
    ];
    saveToLocalStorage();
}

// Render Annual Summary
function renderAnnualSummary() {
    const tbody = document.getElementById('annualSummaryBody');
    tbody.innerHTML = '';

    // Group transactions by year
    const yearlyData = {};

    transactions.forEach(transaction => {
        const year = new Date(transaction.tanggal).getFullYear();

        if (!yearlyData[year]) {
            yearlyData[year] = {
                pemotongan: 0,
                penyetoran: 0,
                saldo: 0
            };
        }

        yearlyData[year].pemotongan += transaction.pemotongan;
        yearlyData[year].penyetoran += transaction.penyetoran;
    });

    // Calculate saldo for each year and sort by year
    const years = Object.keys(yearlyData).sort();
    let grandTotalPemotongan = 0;
    let grandTotalPenyetoran = 0;
    let grandTotalSaldo = 0;

    years.forEach(year => {
        const data = yearlyData[year];
        data.saldo = data.penyetoran - data.pemotongan;

        grandTotalPemotongan += data.pemotongan;
        grandTotalPenyetoran += data.penyetoran;
        grandTotalSaldo += data.saldo;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center; font-weight: 600;">${year}</td>
            <td>${formatNumber(data.pemotongan)}</td>
            <td>${formatNumber(data.penyetoran)}</td>
            <td>${formatNumber(data.saldo)}</td>
        `;
        tbody.appendChild(row);
    });

    // Update grand totals
    document.getElementById('grandTotalPemotongan').textContent = formatNumber(grandTotalPemotongan);
    document.getElementById('grandTotalPenyetoran').textContent = formatNumber(grandTotalPenyetoran);
    document.getElementById('grandTotalSaldo').textContent = formatNumber(grandTotalSaldo);
}

// Open Annual Summary Modal
function openAnnualSummary() {
    renderAnnualSummary();
    const modal = document.getElementById('annualSummaryModal');
    modal.style.display = 'block';
}

// Close Annual Summary Modal
function closeAnnualSummary() {
    const modal = document.getElementById('annualSummaryModal');
    modal.style.display = 'none';
}

// Print Annual Summary Only
function printAnnualSummary() {
    // Hide main content
    const mainContent = document.querySelector('.container');
    const originalDisplay = mainContent.style.display;
    mainContent.style.display = 'none';

    // Create temporary print container
    const printContainer = document.createElement('div');
    printContainer.className = 'print-annual-container';
    printContainer.innerHTML = `
        <div style="padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 24px; margin-bottom: 10px;">REKAPITULASI TAHUNAN</h1>
                <h2 style="font-size: 18px;">BUKU PEMBANTU PAJAK</h2>
            </div>
            ${document.querySelector('#annualSummaryModal .annual-summary-table').outerHTML}
        </div>
    `;

    document.body.appendChild(printContainer);

    // Print
    window.print();

    // Cleanup
    document.body.removeChild(printContainer);
    mainContent.style.display = originalDisplay;
}

// ========== SETTINGS MANAGEMENT ==========

// Open Settings Modal with focus on KOP
function openKOPSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';

    // Load current settings into form
    loadSettingsToForm();

    // Scroll modal to KOP section
    setTimeout(() => {
        const kopSection = modal.querySelector('h3');
        if (kopSection) {
            kopSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// Open Settings Modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';

    // Load current settings into form
    loadSettingsToForm();
}

// Close Settings Modal
function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('settingsModal');
    if (event.target == modal) {
        closeSettings();
    }
}

// Save Settings
function saveSettings() {
    const settings = {
        kepalaName: document.getElementById('settingKepalaNama').value.trim(),
        kepalaNIP: document.getElementById('settingKepalaNIP').value.trim(),
        bendaharaName: document.getElementById('settingBendaharaNama').value.trim(),
        bendaharaNIP: document.getElementById('settingBendaharaNIP').value.trim(),
        tempat: document.getElementById('settingTempat').value.trim(),
        tanggal: document.getElementById('settingTanggal').value,
        namaMadrasah: document.getElementById('settingNamaMadrasah').value.trim(),
        kelurahan: document.getElementById('settingKelurahan').value.trim(),
        kota: document.getElementById('settingKota').value.trim(),
        provinsi: document.getElementById('settingProvinsi').value.trim(),
        bulan: document.getElementById('settingBulan').value
    };

    // Save to localStorage
    localStorage.setItem('signatureSettings', JSON.stringify(settings));

    // Update signature display
    updateSignatureDisplay();

    // Close modal
    closeSettings();

    // Show success message
    alert('✅ Pengaturan berhasil disimpan!');
}

// Load Settings to Form
function loadSettingsToForm() {
    const saved = localStorage.getItem('signatureSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);
            document.getElementById('settingKepalaNama').value = settings.kepalaName || '';
            document.getElementById('settingKepalaNIP').value = settings.kepalaNIP || '';
            document.getElementById('settingBendaharaNama').value = settings.bendaharaName || '';
            document.getElementById('settingBendaharaNIP').value = settings.bendaharaNIP || '';
            document.getElementById('settingTempat').value = settings.tempat || '';
            document.getElementById('settingTanggal').value = settings.tanggal || '';
            document.getElementById('settingNamaMadrasah').value = settings.namaMadrasah || '';
            document.getElementById('settingKelurahan').value = settings.kelurahan || '';
            document.getElementById('settingKota').value = settings.kota || '';
            document.getElementById('settingProvinsi').value = settings.provinsi || '';
            document.getElementById('settingBulan').value = settings.bulan || '';
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Update Signature Display
function updateSignatureDisplay() {
    const saved = localStorage.getItem('signatureSettings');
    if (saved) {
        try {
            const settings = JSON.parse(saved);

            // Update Kepala Madrasah
            document.getElementById('kepalaName').textContent =
                settings.kepalaName || '................................................';
            document.getElementById('kepalaNIP').textContent =
                settings.kepalaNIP ? `NIP ${settings.kepalaNIP}` : 'NIP.................................';

            // Update Bendahara
            document.getElementById('bendaharaName').textContent =
                settings.bendaharaName || '................................................';
            document.getElementById('bendaharaNIP').textContent =
                settings.bendaharaNIP ? `NIP ${settings.bendaharaNIP}` : 'NIP.................................';

            // Update School Info
            document.getElementById('infoNamaMadrasah').textContent =
                settings.namaMadrasah || 'MAN 2 KOTA TIDORE KEPULAUAN';
            document.getElementById('infoKelurahan').textContent =
                settings.kelurahan || 'MAREKU';
            document.getElementById('infoKota').textContent =
                settings.kota || 'TIDORE KEPULAUAN';
            document.getElementById('infoProvinsi').textContent =
                settings.provinsi || 'MALUKU UTARA';

            // Update Month/Year Header
            if (settings.bulan) {
                const [year, month] = settings.bulan.split('-');
                const months = ['JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
                    'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'];
                const monthName = months[parseInt(month) - 1];
                document.getElementById('headerMonth').textContent = `BULAN ${monthName} ${year}`;
            }

            // Update Date & Location
            if (settings.tempat && settings.tanggal) {
                const date = new Date(settings.tanggal);
                const day = date.getDate();
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const month = months[date.getMonth()];
                const year = date.getFullYear();

                document.getElementById('documentDate').textContent =
                    `${settings.tempat}, ${day} ${month} ${year}`;
            } else if (settings.tempat) {
                document.getElementById('documentDate').textContent =
                    `${settings.tempat}....................${new Date().getFullYear()}`;
            } else if (settings.tanggal) {
                const date = new Date(settings.tanggal);
                const day = date.getDate();
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const month = months[date.getMonth()];
                const year = date.getFullYear();

                document.getElementById('documentDate').textContent =
                    `Tidore, ${day} ${month} ${year}`;
            } else {
                document.getElementById('documentDate').textContent =
                    'Tidore....................2025';
            }
        } catch (e) {
            console.error('Error updating signature:', e);
        }
    }
}

// Initialize signature display on page load
window.addEventListener('DOMContentLoaded', () => {
    updateSignatureDisplay();
    loadLogo();
    loadAdminPhoto();
});

// ========== LOGO MANAGEMENT ==========

// Handle logo upload
function handleLogoUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('❌ File harus berupa gambar (PNG, JPG, dll)');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Ukuran file maksimal 2MB');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const logoData = e.target.result;

        // Save to localStorage
        localStorage.setItem('schoolLogo', logoData);

        // Update preview in modal
        document.getElementById('logoPreviewImage').src = logoData;
        document.getElementById('logoPreview').style.display = 'block';

        // Update logo in header
        loadLogo();

        alert('✅ Logo berhasil diupload!');
    };

    reader.readAsDataURL(file);
}

// Remove logo
function removeLogo() {
    if (confirm('Yakin ingin menghapus logo?')) {
        localStorage.removeItem('schoolLogo');
        document.getElementById('settingLogo').value = '';
        document.getElementById('logoPreview').style.display = 'none';
        loadLogo();
        alert('✅ Logo berhasil dihapus!');
    }
}

// Load and display logo
function loadLogo() {
    const logoData = localStorage.getItem('schoolLogo');
    const logoImage = document.getElementById('logoImage');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (logoData) {
        logoImage.src = logoData;
        logoImage.style.display = 'block';
        logoPlaceholder.style.display = 'none';

        // Update preview in settings modal if it exists
        const previewImage = document.getElementById('logoPreviewImage');
        if (previewImage) {
            previewImage.src = logoData;
            document.getElementById('logoPreview').style.display = 'block';
        }
    } else {
        logoImage.style.display = 'none';
        logoPlaceholder.style.display = 'flex';
    }
}

// ========== ADMIN PHOTO MANAGEMENT ==========

// Handle admin photo upload
function handleAdminPhotoUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('❌ File harus berupa gambar (PNG, JPG, dll)');
        return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('❌ Ukuran file maksimal 2MB');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const photoData = e.target.result;

        // Save to localStorage
        localStorage.setItem('adminPhoto', photoData);

        // Update preview in modal
        document.getElementById('adminPhotoPreviewImage').src = photoData;
        document.getElementById('adminPhotoPreview').style.display = 'block';

        // Update photo in header
        loadAdminPhoto();

        alert('✅ Foto admin berhasil diupload!');
    };

    reader.readAsDataURL(file);
}

// Remove admin photo
function removeAdminPhoto() {
    if (confirm('Yakin ingin menghapus foto admin?')) {
        localStorage.removeItem('adminPhoto');
        document.getElementById('settingAdminPhoto').value = '';
        document.getElementById('adminPhotoPreview').style.display = 'none';
        loadAdminPhoto();
        alert('✅ Foto admin berhasil dihapus!');
    }
}

// Load and display admin photo
function loadAdminPhoto() {
    const photoData = localStorage.getItem('adminPhoto');
    const photoImage = document.getElementById('adminPhoto');
    const photoPlaceholder = document.getElementById('adminPhotoPlaceholder');

    if (photoData && photoImage && photoPlaceholder) {
        photoImage.src = photoData;
        photoImage.style.display = 'block';
        photoPlaceholder.style.display = 'none';

        // Update preview in settings modal if it exists
        const previewImage = document.getElementById('adminPhotoPreviewImage');
        if (previewImage) {
            previewImage.src = photoData;
            document.getElementById('adminPhotoPreview').style.display = 'block';
        }
    } else if (photoImage && photoPlaceholder) {
        photoImage.style.display = 'none';
        photoPlaceholder.style.display = 'flex';
    }
}
