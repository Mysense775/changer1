// Telegram WebApp initialization
const tg = window.Telegram.WebApp;

class CryptoExchange {
    constructor() {
        this.currentRate = 90.50;
        this.commission = 0.5;
        this.currentDirection = 'buy'; // 'buy' or 'sell'
        this.selectedPaymentMethod = null;
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
        // Direction buttons
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchDirection(e.currentTarget.dataset.direction);
            });
        });

        // Amount input
        document.getElementById('giveAmount').addEventListener('input', () => this.calculateExchange());
        
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
        document.getElementById('exchangeBtn').addEventListener('click', () => this.startExchange());
        
        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        
        // Overlay click to close
        document.getElementById('paymentModal').addEventListener('click', (e) => {
            if (e.target.id === 'paymentModal') this.closeModal();
        });
    }

    switchDirection(direction) {
        this.currentDirection = direction;
        
        // Update buttons
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.direction === direction);
        });
        
        // Update currencies
        const giveCurrencyFlag = document.getElementById('giveCurrencyFlag');
        const giveCurrencyCode = document.getElementById('giveCurrencyCode');
        const getCurrencyFlag = document.getElementById('getCurrencyFlag');
        const getCurrencyCode = document.getElementById('getCurrencyCode');
        const giveBalance = document.getElementById('giveBalance');
        const getBalance = document.getElementById('getBalance');
        
        if (direction === 'buy') {
            giveCurrencyFlag.textContent = '₽';
            giveCurrencyCode.textContent = 'RUB';
            getCurrencyFlag.textContent = '₿';
            getCurrencyCode.textContent = 'USDT';
            giveBalance.textContent = 'Баланс: 25,430.00 ₽';
            getBalance.textContent = 'Баланс: 1,250.50 USDT';
            document.getElementById('giveAmount').value = '1000';
        } else {
            giveCurrencyFlag.textContent = '₿';
            giveCurrencyCode.textContent = 'USDT';
            getCurrencyFlag.textContent = '₽';
            getCurrencyCode.textContent = 'RUB';
            giveBalance.textContent = 'Баланс: 1,250.50 USDT';
            getBalance.textContent = 'Баланс: 25,430.00 ₽';
            document.getElementById('giveAmount').value = '100';
        }
        
        this.updateRateDisplay();
        this.calculateExchange();
    }

    calculateExchange() {
        const giveAmount = parseFloat(document.getElementById('giveAmount').value) || 0;
        let getAmount;
        
        if (this.currentDirection === 'buy') {
            getAmount = giveAmount / this.currentRate;
        } else {
            getAmount = giveAmount * this.currentRate;
        }

        // Apply commission
        const commissionAmount = getAmount * (this.commission / 100);
        const totalAmount = getAmount - commissionAmount;

        this.updateDisplay(totalAmount);
    }

    updateDisplay(totalAmount) {
        const getAmountInput = document.getElementById('getAmount');
        const btnSubtext = document.getElementById('btnSubtext');
        
        getAmountInput.value = totalAmount.toFixed(2);
        
        if (this.currentDirection === 'buy') {
            btnSubtext.textContent = `Получите: ${totalAmount.toFixed(2)} USDT`;
        } else {
            btnSubtext.textContent = `Получите: ${totalAmount.toFixed(2)} ₽`;
        }
    }

    updateRateDisplay() {
        const rateDisplay = document.getElementById('rateDisplay');
        if (this.currentDirection === 'buy') {
            rateDisplay.textContent = `1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        } else {
            rateDisplay.textContent = `1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        }
    }

    startExchange() {
        const giveAmount = parseFloat(document.getElementById('giveAmount').value) || 0;
        
        if (giveAmount <= 0) {
            this.showError('Введите сумму для обмена');
            return;
        }

        if (this.currentDirection === 'buy') {
            this.showPaymentMethods();
        } else {
            this.showWithdrawalMethods();
        }
    }

    showPaymentMethods() {
        const modal = document.getElementById('paymentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Выберите способ оплаты';
        modalBody.innerHTML = `
            <div class="payment-methods">
                <div class="payment-method" data-method="card">
                    <div class="method-icon">💳</div>
                    <div class="method-info">
                        <div class="method-name">Банковская карта</div>
                        <div class="method-description">Visa, Mastercard, МИР</div>
                    </div>
                    <div class="method-check">✓</div>
                </div>
                <div class="payment-method" data-method="sbp">
                    <div class="method-icon">⚡</div>
                    <div class="method-info">
                        <div class="method-name">СБП</div>
                        <div class="method-description">Быстрый перевод</div>
                    </div>
                    <div class="method-check">✓</div>
                </div>
            </div>
            <button class="btn btn-primary" style="margin-top: 20px;" id="confirmPayment">
                Продолжить
            </button>
        `;
        
        // Add event listeners to payment methods
        modalBody.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                modalBody.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                this.selectedPaymentMethod = method.dataset.method;
            });
        });
        
        // Confirm button
        modalBody.querySelector('#confirmPayment').addEventListener('click', () => {
            if (!this.selectedPaymentMethod) {
                this.showError('Выберите способ оплаты');
                return;
            }
            this.processExchange();
        });
        
        this.showModal();
    }

    showWithdrawalMethods() {
        const modal = document.getElementById('paymentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = 'Карта для получения';
        modalBody.innerHTML = `
            <div class="saved-cards">
                ${this.userCards.map(card => `
                    <div class="saved-card ${card.isDefault ? 'active' : ''}" data-card-id="${card.id}">
                        <div class="card-icon">💳</div>
                        <div class="card-info">
                            <div class="card-name">${card.name}</div>
                            <div class="card-balance">${card.isDefault ? 'Основная карта' : ''}</div>
                        </div>
                        <div class="card-check">✓</div>
                    </div>
                `).join('')}
                <button class="add-card-btn" id="addCardBtn">
                    <span class="add-icon">+</span>
                    Добавить карту
                </button>
            </div>
            
            <div class="new-card-form" id="newCardForm" style="display: none; margin-top: 16px;">
                <div class="form-group">
                    <label class="form-label">Номер карты</label>
                    <input type="text" class="form-input card-number" 
                           placeholder="0000 0000 0000 0000" maxlength="19">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Срок действия</label>
                        <input type="text" class="form-input card-expiry" 
                               placeholder="ММ/ГГ" maxlength="5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">CVC</label>
                        <input type="text" class="form-input card-cvc" 
                               placeholder="000" maxlength="3">
                    </div>
                </div>
                <button class="btn btn-secondary" id="saveCardBtn">
                    Сохранить карту
                </button>
            </div>
            
            <button class="btn btn-primary" style="margin-top: 20px;" id="confirmWithdrawal">
                Подтвердить вывод
            </button>
        `;
        
        // Add card button
        modalBody.querySelector('#addCardBtn').addEventListener('click', () => {
            const form = modalBody.querySelector('#newCardForm');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
        
        // Card input formatting
        const cardNumberInput = modalBody.querySelector('.card-number');
        const cardExpiryInput = modalBody.querySelector('.card-expiry');
        const cardCVCInput = modalBody.querySelector('.card-cvc');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => this.formatCardNumber(e));
            cardExpiryInput.addEventListener('input', (e) => this.formatExpiry(e));
            cardCVCInput.addEventListener('input', (e) => this.formatCVC(e));
        }
        
        // Save card button
        modalBody.querySelector('#saveCardBtn')?.addEventListener('click', () => {
            this.saveCard(modalBody);
        });
        
        // Confirm withdrawal
        modalBody.querySelector('#confirmWithdrawal').addEventListener('click', () => {
            const selectedCard = modalBody.querySelector('.saved-card.active');
            if (!selectedCard && !modalBody.querySelector('#newCardForm').style.display === 'block') {
                this.showError('Выберите карту для вывода');
                return;
            }
            this.processExchange();
        });
        
        // Card selection
        modalBody.querySelectorAll('.saved-card').forEach(card => {
            card.addEventListener('click', () => {
                modalBody.querySelectorAll('.saved-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
        
        this.showModal();
    }

    showModal() {
        document.getElementById('paymentModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('paymentModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.selectedPaymentMethod = null;
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

    saveCard(modalBody) {
        const cardNumber = modalBody.querySelector('.card-number').value;
        const cardExpiry = modalBody.querySelector('.card-expiry').value;
        const cardCVC = modalBody.querySelector('.card-cvc').value;

        if (!this.validateCard(cardNumber, cardExpiry, cardCVC)) {
            this.showError('Пожалуйста, проверьте данные карты');
            return;
        }

        // Simulate saving card
        const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
        const newCard = {
            id: Date.now(),
            name: `Карта •• ${lastFour}`,
            type: this.getCardType(cardNumber),
            isDefault: false
        };

        this.userCards.push(newCard);
        this.showSuccess('Карта успешно добавлена!');
        this.closeModal();
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

    processExchange() {
        const giveAmount = document.getElementById('giveAmount').value;
        const getAmount = document.getElementById('getAmount').value;
        
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
            const operation = this.currentDirection === 'buy' ? 'покупки' : 'продажи';
            const fromCurrency = this.currentDirection === 'buy' ? '₽' : 'USDT';
            const toCurrency = this.currentDirection === 'buy' ? 'USDT' : '₽';
            
            this.showSuccess(
                `Заявка на ${operation} создана!`, 
                `${giveAmount} ${fromCurrency} → ${getAmount} ${toCurrency}`
            );
            
            exchangeBtn.innerHTML = originalHTML;
            exchangeBtn.disabled = false;
            this.closeModal();
            
            // Reset form
            if (this.currentDirection === 'buy') {
                document.getElementById('giveAmount').value = '1000';
            } else {
                document.getElementById('giveAmount').value = '100';
            }
            this.calculateExchange();
        }, 2000);
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