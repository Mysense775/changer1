// Telegram WebApp initialization
const tg = window.Telegram.WebApp;

class CryptoExchange {
    constructor() {
        this.currentRate = 90.50;
        this.commission = 0.5;
        this.currentOperation = 'buy'; // 'buy' or 'sell'
        this.paymentMethod = 'card';
        this.userCards = [
            { id: 1, name: 'Тинькофф •• 7890', type: 'visa', isDefault: true }
        ];
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
        // Operation tabs
        document.querySelectorAll('.operation-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchOperation(e.target.dataset.operation);
            });
        });

        // Amount inputs
        document.getElementById('buyAmount').addEventListener('input', () => this.calculateExchange());
        document.getElementById('sellAmount').addEventListener('input', () => this.calculateExchange());
        
        // Quick amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const amount = e.target.dataset.amount;
                if (this.currentOperation === 'buy') {
                    document.getElementById('buyAmount').value = amount;
                } else {
                    document.getElementById('sellAmount').value = amount;
                }
                this.calculateExchange();
            });
        });

        // Payment methods
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.paymentMethod = e.currentTarget.dataset.method;
            });
        });

        // Card management
        document.getElementById('addCardBtn').addEventListener('click', () => this.showCardForm());
        document.getElementById('saveCardBtn').addEventListener('click', () => this.saveCard());

        // Card input formatting
        document.querySelector('.card-number')?.addEventListener('input', (e) => this.formatCardNumber(e));
        document.querySelector('.card-expiry')?.addEventListener('input', (e) => this.formatExpiry(e));
        document.querySelector('.card-cvc')?.addEventListener('input', (e) => this.formatCVC(e));

        // Exchange button
        document.getElementById('exchangeBtn').addEventListener('click', () => this.executeExchange());
        
        // Quick action buttons
        document.getElementById('historyBtn').addEventListener('click', () => this.showHistory());
        document.getElementById('supportBtn').addEventListener('click', () => this.showSupport());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
    }

    switchOperation(operation) {
        this.currentOperation = operation;
        
        // Update tabs
        document.querySelectorAll('.operation-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.operation === operation);
        });
        
        // Update sections
        document.querySelectorAll('.operation-section').forEach(section => {
            section.classList.toggle('active', section.id === `${operation}Section`);
        });
        
        // Update button text
        const btnText = document.getElementById('btnText');
        btnText.textContent = operation === 'buy' ? 'Купить USDT' : 'Продать USDT';
        
        this.calculateExchange();
    }

    calculateExchange() {
        let giveAmount, getAmount;
        
        if (this.currentOperation === 'buy') {
            giveAmount = parseFloat(document.getElementById('buyAmount').value) || 0;
            getAmount = giveAmount / this.currentRate;
        } else {
            giveAmount = parseFloat(document.getElementById('sellAmount').value) || 0;
            getAmount = giveAmount * this.currentRate;
        }

        // Apply commission
        const commissionAmount = getAmount * (this.commission / 100);
        const totalAmount = getAmount - commissionAmount;

        this.updateDisplay(totalAmount);
    }

    updateDisplay(totalAmount) {
        const totalAmountElement = document.getElementById('totalAmount');
        const btnSubtext = document.getElementById('btnSubtext');
        const exchangeRate = document.getElementById('exchangeRate');
        const exchangeFee = document.getElementById('exchangeFee');

        if (this.currentOperation === 'buy') {
            document.getElementById('buyGetAmount').value = totalAmount.toFixed(2);
            totalAmountElement.textContent = `${totalAmount.toFixed(2)} USDT`;
            btnSubtext.textContent = `${totalAmount.toFixed(2)} USDT`;
            exchangeRate.textContent = `1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        } else {
            document.getElementById('sellGetAmount').value = totalAmount.toFixed(2);
            totalAmountElement.textContent = `${totalAmount.toFixed(2)} ₽`;
            btnSubtext.textContent = `${totalAmount.toFixed(2)} ₽`;
            exchangeRate.textContent = `1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        }

        exchangeFee.textContent = `${this.commission}%`;
    }

    showCardForm() {
        const form = document.getElementById('newCardForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        value = value.substring(0, 19);
        e.target.value = value;
    }

    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        value = value.substring(0, 5);
        e.target.value = value;
    }

    formatCVC(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 3);
        e.target.value = value;
    }

    saveCard() {
        const cardNumber = document.querySelector('.card-number').value;
        const cardExpiry = document.querySelector('.card-expiry').value;
        const cardCVC = document.querySelector('.card-cvc').value;

        if (!this.validateCard(cardNumber, cardExpiry, cardCVC)) {
            this.showError('Пожалуйста, проверьте данные карты');
            return;
        }

        // Simulate API call to save card
        const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
        const newCard = {
            id: Date.now(),
            name: `Карта •• ${lastFour}`,
            type: this.getCardType(cardNumber),
            isDefault: this.userCards.length === 0
        };

        this.userCards.push(newCard);
        this.showSuccess('Карта успешно добавлена!');
        
        // Reset form
        document.getElementById('newCardForm').style.display = 'none';
        document.querySelector('.card-number').value = '';
        document.querySelector('.card-expiry').value = '';
        document.querySelector('.card-cvc').value = '';

        this.updateSavedCards();
    }

    validateCard(number, expiry, cvc) {
        const cleanNumber = number.replace(/\s/g, '');
        return cleanNumber.length === 16 && 
               expiry.length === 5 && 
               cvc.length === 3;
    }

    getCardType(number) {
        const cleanNumber = number.replace(/\s/g, '');
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        if (/^2/.test(cleanNumber)) return 'mir';
        return 'unknown';
    }

    updateSavedCards() {
        // Update saved cards list in UI
        const savedCardsContainer = document.querySelector('.saved-cards');
        // Implementation for dynamic cards update
    }

    executeExchange() {
        let giveAmount, getAmount, currency;
        
        if (this.currentOperation === 'buy') {
            giveAmount = document.getElementById('buyAmount').value;
            getAmount = document.getElementById('buyGetAmount').value;
            currency = 'USDT';
        } else {
            giveAmount = document.getElementById('sellAmount').value;
            getAmount = document.getElementById('sellGetAmount').value;
            currency = 'RUB';
            
            // Check if card is selected for withdrawal
            if (!this.userCards.length) {
                this.showError('Пожалуйста, добавьте карту для вывода средств');
                return;
            }
        }

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
            const operationText = this.currentOperation === 'buy' ? 'покупки' : 'продажи';
            this.showSuccess(
                `Заявка на ${operationText} создана!`, 
                `${giveAmount} ${this.currentOperation === 'buy' ? '₽' : 'USDT'} → ${getAmount} ${currency}`
            );
            
            exchangeBtn.innerHTML = originalHTML;
            exchangeBtn.disabled = false;
            
            // Reset form
            if (this.currentOperation === 'buy') {
                document.getElementById('buyAmount').value = '1000';
            } else {
                document.getElementById('sellAmount').value = '100';
            }
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