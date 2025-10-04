// Telegram WebApp initialization
const tg = window.Telegram.WebApp;

class CryptoExchange {
    constructor() {
        this.currentRate = 90.50;
        this.commission = 0.5;
        this.init();
    }

    init() {
        tg.ready();
        tg.expand();
        
        this.setupTheme();
        this.setupUserInfo();
        this.setupEventListeners();
        this.calculateExchange();
    }

    setupTheme() {
        if (tg.colorScheme === 'dark') {
            document.body.style.setProperty('--background', '#0F0F0F');
            document.body.style.setProperty('--surface', '#1A1A1A');
        } else {
            document.body.style.setProperty('--background', '#FFFFFF');
            document.body.style.setProperty('--surface', '#F8FAFC');
            document.body.style.setProperty('--text-primary', '#1F2937');
        }
    }

    setupUserInfo() {
        const user = tg.initDataUnsafe?.user;
        const userBadge = document.getElementById('userBadge');
        
        if (user && user.photo_url) {
            userBadge.innerHTML = `
                <img src="${user.photo_url}" alt="Avatar" class="user-avatar" 
                     style="width: 40px; height: 40px; border-radius: 50%;">
            `;
        }
    }

    setupEventListeners() {
        // Amount input
        document.getElementById('giveAmount').addEventListener('input', () => this.calculateExchange());
        
        // Currency changes
        document.getElementById('giveCurrency').addEventListener('change', () => this.calculateExchange());
        document.getElementById('getCurrency').addEventListener('change', () => this.calculateExchange());
        
        // Swap button
        document.getElementById('swapBtn').addEventListener('click', () => this.swapCurrencies());
        
        // Quick amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const amount = e.target.dataset.amount;
                document.getElementById('giveAmount').value = amount;
                this.calculateExchange();
            });
        });
        
        // Exchange button
        document.getElementById('exchangeBtn').addEventListener('click', () => this.executeExchange());
        
        // Quick action buttons
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('supportBtn').addEventListener('click', () => this.showSupport());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
    }

    calculateExchange() {
        const giveAmount = parseFloat(document.getElementById('giveAmount').value) || 0;
        const giveCurrency = document.getElementById('giveCurrency').value;
        const getCurrency = document.getElementById('getCurrency').value;
        
        if (giveAmount <= 0) {
            this.updateDisplay(0, giveCurrency, getCurrency);
            return;
        }

        let result;
        if (giveCurrency === 'USDT' && getCurrency === 'RUB') {
            result = giveAmount * this.currentRate;
        } else if (giveCurrency === 'RUB' && getCurrency === 'USDT') {
            result = giveAmount / this.currentRate;
        } else {
            result = giveAmount;
        }

        // Apply commission
        const commissionAmount = result * (this.commission / 100);
        const totalAmount = result - commissionAmount;

        this.updateDisplay(totalAmount, giveCurrency, getCurrency);
    }

    updateDisplay(totalAmount, giveCurrency, getCurrency) {
        const getAmountInput = document.getElementById('getAmount');
        const totalAmountElement = document.getElementById('totalAmount');
        const btnSubtext = document.getElementById('btnSubtext');
        const exchangeRate = document.getElementById('exchangeRate');
        const exchangeFee = document.getElementById('exchangeFee');

        getAmountInput.value = totalAmount.toFixed(2);
        totalAmountElement.textContent = `${totalAmount.toFixed(2)} ${getCurrency === 'RUB' ? '₽' : getCurrency}`;
        btnSubtext.textContent = `${totalAmount.toFixed(2)} ${getCurrency === 'RUB' ? '₽' : getCurrency}`;

        // Update exchange rate display
        if (giveCurrency === 'USDT' && getCurrency === 'RUB') {
            exchangeRate.textContent = `1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        } else {
            exchangeRate.textContent = `1 ₽ = ${(1/this.currentRate).toFixed(4)} USDT`;
        }

        exchangeFee.textContent = `${this.commission}%`;
    }

    swapCurrencies() {
        const giveCurrency = document.getElementById('giveCurrency');
        const getCurrency = document.getElementById('getCurrency');
        const giveAmount = document.getElementById('giveAmount');
        const getAmount = document.getElementById('getAmount');

        [giveCurrency.value, getCurrency.value] = [getCurrency.value, giveCurrency.value];
        giveAmount.value = getAmount.value;
        
        this.calculateExchange();
    }

    executeExchange() {
        const giveAmount = document.getElementById('giveAmount').value;
        const giveCurrency = document.getElementById('giveCurrency').value;
        const getAmount = document.getElementById('getAmount').value;
        const getCurrency = document.getElementById('getCurrency').value;

        if (!giveAmount || parseFloat(giveAmount) <= 0) {
            this.showError('Введите сумму для обмена');
            return;
        }

        const exchangeBtn = document.getElementById('exchangeBtn');
        const originalHTML = exchangeBtn.innerHTML;
        
        exchangeBtn.innerHTML = `
            <span class="btn-content">
                <span class="btn-text">Обработка...</span>
                <span class="btn-subtext">Пожалуйста, подождите</span>
            </span>
            <div class="btn-arrow">⏳</div>
        `;
        exchangeBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showSuccess(
                `Успешный обмен!`, 
                `${giveAmount} ${giveCurrency} → ${getAmount} ${getCurrency}`
            );
            
            exchangeBtn.innerHTML = originalHTML;
            exchangeBtn.disabled = false;
            
            // Reset form
            document.getElementById('giveAmount').value = '1000';
            this.calculateExchange();
        }, 2000);
    }

    showHistory() {
        tg.showAlert('История операций будет доступна в следующем обновлении!');
    }

    showSupport() {
        tg.openTelegramLink('https://t.me/cryptoexchange_support');
    }

    showProfile() {
        tg.showAlert('Раздел профиля будет доступен в следующем обновлении!');
    }

    showError(message) {
        tg.showPopup({
            title: 'Ошибка',
            message: message
        });
    }

    showSuccess(title, message) {
        tg.showPopup({
            title: title,
            message: message
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CryptoExchange();
});