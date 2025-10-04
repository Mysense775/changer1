// Telegram WebApp initialization
const tg = window.Telegram.WebApp;

class CryptoExchange {
    constructor() {
        this.currentRate = 90.50;
        this.commission = 0.5;
        this.currentDirection = 'buy';
        this.selectedPaymentMethod = null;
        this.userCards = [
            { id: 1, name: 'Тинькофф •• 7890', type: 'visa', isDefault: true }
        ];
        this.walletAddress = 'XXXYYYZZZ';
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing CryptoExchange...');
        
        // Initialize Telegram WebApp
        if (typeof tg !== 'undefined') {
            tg.ready();
            tg.expand();
        }
        
        this.setupTheme();
        this.setupUserInfo();
        this.setupEventListeners();
        this.calculateExchange();
        
        // Hide wallet info initially
        const walletInfo = document.getElementById('walletInfo');
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }
        
        // Hide modal initially
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        console.log('✅ CryptoExchange initialized successfully');
    }

    setupTheme() {
        if (typeof tg !== 'undefined' && tg.colorScheme === 'dark') {
            document.body.style.setProperty('--background', '#0F0F0F');
            document.body.style.setProperty('--surface', '#1A1A1A');
        }
    }

    setupUserInfo() {
        if (typeof tg !== 'undefined') {
            const user = tg.initDataUnsafe?.user;
            const userBadge = document.getElementById('userBadge');
            
            if (user && user.photo_url && userBadge) {
                userBadge.innerHTML = `
                    <img src="${user.photo_url}" alt="Avatar" class="user-avatar" 
                         style="width: 40px; height: 40px; border-radius: 50%;">
                `;
            }
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Direction buttons
        const dirButtons = document.querySelectorAll('.dir-btn');
        dirButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.currentTarget.getAttribute('data-direction');
                console.log('🔄 Switching direction to:', direction);
                this.switchDirection(direction);
            });
        });

        // Amount input
        const giveAmountInput = document.getElementById('giveAmount');
        if (giveAmountInput) {
            giveAmountInput.addEventListener('input', () => {
                this.calculateExchange();
            });
        }
        
        // Quick amount buttons
        const amountButtons = document.querySelectorAll('.amount-btn');
        amountButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = e.target.getAttribute('data-amount');
                console.log('💰 Quick amount selected:', amount);
                
                // Remove active class from all buttons
                amountButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Set amount in input
                if (giveAmountInput) {
                    giveAmountInput.value = amount;
                    this.calculateExchange();
                }
            });
        });

        // Copy wallet button
        const copyWalletBtn = document.getElementById('copyWalletBtn');
        if (copyWalletBtn) {
            copyWalletBtn.addEventListener('click', () => {
                this.copyWalletAddress();
            });
        }

        // Exchange button
        const exchangeBtn = document.getElementById('exchangeBtn');
        if (exchangeBtn) {
            exchangeBtn.addEventListener('click', () => {
                this.startExchange();
            });
        }
        
        // Modal close
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        // Overlay click to close
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.addEventListener('click', (e) => {
                if (e.target.id === 'paymentModal') {
                    this.closeModal();
                }
            });
        }

        // FAQ functionality
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                item.classList.toggle('active');
            });
        });

        // Support button
        const supportButton = document.getElementById('supportButton');
        if (supportButton) {
            supportButton.addEventListener('click', () => {
                if (typeof tg !== 'undefined') {
                    tg.openTelegramLink('https://t.me/cryptoexchange_support');
                } else {
                    window.open('https://t.me/cryptoexchange_support', '_blank');
                }
            });
        }

        console.log('✅ Event listeners setup complete');
    }

    switchDirection(direction) {
        this.currentDirection = direction;
        
        // Update buttons
        const dirButtons = document.querySelectorAll('.dir-btn');
        dirButtons.forEach(btn => {
            const btnDirection = btn.getAttribute('data-direction');
            if (btnDirection === direction) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update currencies and balances
        const giveCurrencyFlag = document.getElementById('giveCurrencyFlag');
        const giveCurrencyCode = document.getElementById('giveCurrencyCode');
        const getCurrencyFlag = document.getElementById('getCurrencyFlag');
        const getCurrencyCode = document.getElementById('getCurrencyCode');
        const giveBalance = document.getElementById('giveBalance');
        const getBalance = document.getElementById('getBalance');
        const walletInfo = document.getElementById('walletInfo');
        
        if (direction === 'buy') {
            // RUB → USDT
            if (giveCurrencyFlag) giveCurrencyFlag.textContent = '₽';
            if (giveCurrencyCode) giveCurrencyCode.textContent = 'RUB';
            if (getCurrencyFlag) getCurrencyFlag.textContent = '₿';
            if (getCurrencyCode) getCurrencyCode.textContent = 'USDT';
            if (giveBalance) giveBalance.innerHTML = '<i class="fas fa-wallet"></i> Баланс: 25,430.00 ₽';
            if (getBalance) getBalance.innerHTML = '<i class="fas fa-wallet"></i> Баланс: 1,250.50 USDT';
            
            const giveAmountInput = document.getElementById('giveAmount');
            if (giveAmountInput) giveAmountInput.value = '1000';
            
            if (walletInfo) walletInfo.style.display = 'none';
        } else {
            // USDT → RUB
            if (giveCurrencyFlag) giveCurrencyFlag.textContent = '₿';
            if (giveCurrencyCode) giveCurrencyCode.textContent = 'USDT';
            if (getCurrencyFlag) getCurrencyFlag.textContent = '₽';
            if (getCurrencyCode) getCurrencyCode.textContent = 'RUB';
            if (giveBalance) giveBalance.innerHTML = '<i class="fas fa-wallet"></i> Баланс: 1,250.50 USDT';
            if (getBalance) getBalance.innerHTML = '<i class="fas fa-wallet"></i> Баланс: 25,430.00 ₽';
            
            const giveAmountInput = document.getElementById('giveAmount');
            if (giveAmountInput) giveAmountInput.value = '100';
            
            if (walletInfo) walletInfo.style.display = 'block';
        }
        
        this.updateRateDisplay();
        this.calculateExchange();
    }

    calculateExchange() {
        const giveAmountInput = document.getElementById('giveAmount');
        const giveAmount = parseFloat(giveAmountInput?.value) || 0;
        
        let getAmount;
        
        if (this.currentDirection === 'buy') {
            // RUB to USDT: divide by rate
            getAmount = giveAmount / this.currentRate;
        } else {
            // USDT to RUB: multiply by rate
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
        
        if (getAmountInput && btnSubtext) {
            const formattedAmount = totalAmount.toFixed(2);
            getAmountInput.value = formattedAmount;
            
            if (this.currentDirection === 'buy') {
                btnSubtext.textContent = `Получите: ${formattedAmount} USDT`;
            } else {
                btnSubtext.textContent = `Получите: ${formattedAmount} ₽`;
            }
        }
    }

    updateRateDisplay() {
        const rateDisplay = document.getElementById('rateDisplay');
        if (rateDisplay) {
            rateDisplay.innerHTML = `<i class="fas fa-sync-alt"></i> 1 USDT = ${this.currentRate.toFixed(2)} ₽`;
        }
    }

    copyWalletAddress() {
        const copyBtn = document.getElementById('copyWalletBtn');
        
        navigator.clipboard.writeText(this.walletAddress).then(() => {
            copyBtn.classList.add('copied');
            this.showToast('Адрес скопирован!');
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.walletAddress;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            copyBtn.classList.add('copied');
            this.showToast('Адрес скопирован!');
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    }

    showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span class="toast-message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    startExchange() {
        const giveAmountInput = document.getElementById('giveAmount');
        const giveAmount = parseFloat(giveAmountInput?.value) || 0;
        
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
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = 'Выберите способ оплаты';
        modalBody.innerHTML = `
            <div class="payment-methods">
                <div class="payment-method active" data-method="card">
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
                this.selectedPaymentMethod = method.getAttribute('data-method');
            });
        });
        
        // Confirm button
        const confirmBtn = modalBody.querySelector('#confirmPayment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (!this.selectedPaymentMethod) {
                    this.showError('Выберите способ оплаты');
                    return;
                }
                this.processExchange();
            });
        }
        
        this.showModal();
    }

    showWithdrawalMethods() {
        const modal = document.getElementById('paymentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
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
            
            <div class="wallet-info" style="margin-top: 20px;">
                <div class="wallet-header">
                    <i class="fas fa-wallet"></i>
                    <span>Переведите USDT на наш кошелёк</span>
                </div>
                <div class="wallet-address">
                    <code class="address-code">${this.walletAddress}</code>
                    <button class="copy-btn" id="modalCopyBtn">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                <div class="wallet-note">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Переводите USDT только по сети TRC-20</span>
                </div>
            </div>
            
            <button class="btn btn-primary" style="margin-top: 20px;" id="confirmWithdrawal">
                Подтвердить вывод
            </button>
        `;
        
        // Add card button
        const addCardBtn = modalBody.querySelector('#addCardBtn');
        if (addCardBtn) {
            addCardBtn.addEventListener('click', () => {
                const form = modalBody.querySelector('#newCardForm');
                if (form) {
                    form.style.display = form.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
        
        // Card input formatting
        const cardNumberInput = modalBody.querySelector('.card-number');
        const cardExpiryInput = modalBody.querySelector('.card-expiry');
        const cardCVCInput = modalBody.querySelector('.card-cvc');
        
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => this.formatCardNumber(e));
        }
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => this.formatExpiry(e));
        }
        if (cardCVCInput) {
            cardCVCInput.addEventListener('input', (e) => this.formatCVC(e));
        }
        
        // Save card button
        const saveCardBtn = modalBody.querySelector('#saveCardBtn');
        if (saveCardBtn) {
            saveCardBtn.addEventListener('click', () => {
                this.saveCard(modalBody);
            });
        }
        
        // Copy wallet button in modal
        const modalCopyBtn = modalBody.querySelector('#modalCopyBtn');
        if (modalCopyBtn) {
            modalCopyBtn.addEventListener('click', () => {
                this.copyWalletAddress();
            });
        }
        
        // Confirm withdrawal
        const confirmWithdrawal = modalBody.querySelector('#confirmWithdrawal');
        if (confirmWithdrawal) {
            confirmWithdrawal.addEventListener('click', () => {
                const selectedCard = modalBody.querySelector('.saved-card.active');
                const newCardForm = modalBody.querySelector('#newCardForm');
                if (!selectedCard && (!newCardForm || newCardForm.style.display !== 'block')) {
                    this.showError('Выберите карту для вывода');
                    return;
                }
                this.processExchange();
            });
        }
        
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
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.selectedPaymentMethod = null;
        }
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
        const cardNumber = modalBody.querySelector('.card-number')?.value;
        const cardExpiry = modalBody.querySelector('.card-expiry')?.value;
        const cardCVC = modalBody.querySelector('.card-cvc')?.value;

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
        if (!number || !expiry || !cvc) return false;
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
        const giveAmount = document.getElementById('giveAmount')?.value || '0';
        const getAmount = document.getElementById('getAmount')?.value || '0';
        const exchangeBtn = document.getElementById('exchangeBtn');
        
        if (!exchangeBtn) return;
        
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
            const giveAmountInput = document.getElementById('giveAmount');
            if (giveAmountInput) {
                giveAmountInput.value = this.currentDirection === 'buy' ? '1000' : '100';
                this.calculateExchange();
            }
        }, 2000);
    }

    showError(message) {
        if (typeof tg !== 'undefined') {
            tg.showPopup({
                title: 'Ошибка',
                message: message
            });
        } else {
            alert(`Ошибка: ${message}`);
        }
    }

    showSuccess(title, message) {
        if (typeof tg !== 'undefined') {
            tg.showPopup({
                title: title,
                message: message
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cryptoExchange = new CryptoExchange();
    });
} else {
    window.cryptoExchange = new CryptoExchange();
}