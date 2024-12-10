document.getElementById('add-products').addEventListener('click', async () => {
    const productNames = document.getElementById('product-names').value.trim();
    const totalPrice = parseFloat(document.getElementById('total-price').value.trim());

    // Eğer ürün adı veya toplam fiyat girilmemişse uyarı ver
    if (!productNames || isNaN(totalPrice)) {
        alert("Lütfen Satın Alma Fiyatı veya Ürün Adı alanlarını boş bırakmayın.");
        return;
    }

    const products = productNames.split('*').map(product => product.trim()).filter(product => product);
    const totalProductCount = products.length;
    let totalCurrentPrice = 0;
    let totalProfitLoss = 0;

    const productListElement = document.getElementById('product-list');
    productListElement.innerHTML = ''; // Ürün listesine yeni ürünleri eklemeden önce temizle

    // İşlem çubuğunu başlat
    let progressValue = 0;
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    progressBar.value = 0;
    progressText.textContent = '0%';

    // Ürünleri sırayla işle
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const currentPrice = await getProductPrice(product);

        if (currentPrice !== null) {
            const purchasePrice = totalPrice / totalProductCount;
            const profitLoss = currentPrice - purchasePrice;

            // Ürün bilgilerini listede göster
            const productItem = document.createElement('li');
            productItem.innerHTML = `${product} | <span class="purchase-price">${purchasePrice.toFixed(2)}₺</span> | <span class="current-price">${currentPrice.toFixed(2)}₺</span> | <span class="profit-loss">${profitLoss.toFixed(2)}₺</span>`;
            productListElement.appendChild(productItem);

            totalCurrentPrice += currentPrice;
            totalProfitLoss += profitLoss;

            // İşlem çubuğunda ilerleme kaydet
            progressValue = ((i + 1) / products.length) * 100;
            progressBar.value = progressValue;
            progressText.textContent = `${Math.round(progressValue)}%`;
        } else {
            alert(`"${product}" için fiyat bulunamadı.`);
        }
    }

    // Tüm ürünler işlendiğinde toplam bilgileri güncelle
    updateTotalInfo(totalPrice, totalCurrentPrice, totalProfitLoss);

    // İşlem tamamlandığında çubuğu bitir
    progressText.textContent = "Tamamlandı!";
});

// Ürün fiyatını almak için fonksiyon
async function getProductPrice(productName) {
    try {
        const response = await fetch(`/scrape?product=${encodeURIComponent(productName)}`);
        const data = await response.json();
        return data.price || null;
    } catch (error) {
        console.error('Error scraping price:', error);
        return null;
    }
}

// Toplam bilgileri güncelleyen fonksiyon
function updateTotalInfo(totalPrice, totalCurrentPrice, totalProfitLoss) {
    // Sayıları binlik ayracı ile formatla (Türk Lirası formatı)
    const formattedTotalPrice = totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    const formattedTotalCurrentPrice = totalCurrentPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    const formattedTotalProfitLoss = totalProfitLoss.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

    document.getElementById('total-purchase').textContent = `Satın Alma Fiyatı Toplamı: ${formattedTotalPrice}`;
    document.getElementById('total-current').textContent = `Güncel Satış Fiyatı Toplamı: ${formattedTotalCurrentPrice}`;
    document.getElementById('total-profit-loss').textContent = `Toplam Kar/Zarar: ${formattedTotalProfitLoss}`;

    // Renkleri güncelle
    document.getElementById('total-purchase').style.color = '#f1c40f'; // Sarı
    document.getElementById('total-current').style.color = '#2ecc71'; // Yeşil
    document.getElementById('total-profit-loss').style.color = totalProfitLoss >= 0 ? '#1abc9c' : '#e74c3c'; // Kar: Açık Yeşil, Zarar: Kırmızı
}
