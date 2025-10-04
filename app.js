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
        this.userData = null;
        this.userBalance = {
            rub: 25430.00,
            usdt: 1250.50
        };
        
        this.init();
    }

    init() {
        console.log('🚀 Initializing CryptoExchange...');
        
        // Initialize Telegram WebApp
        if (typeof tg !== 'undefined') {
            tg.ready();
            tg.expand();
            
            // Get user data from Telegram
            this.userData = tg.initDataUnsafe?.user;
            console.log('📱 Telegram user data:', this.userData);
        }
        
        this.setupTheme();
        this.setupUserInfo();
        this.setupEventListeners();
        this.calculateExchange();
        this.loadUserData();
        
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
        const userBadge = document.getElementById('userBadge');
        
        if (this.userData) {
            // User is logged in via Telegram
            if (userBadge) {
                if (this.userData.photo_url) {
                    userBadge.innerHTML = `
                        <img src="${this.userData.photo_url}" alt="Avatar" class="user-avatar" 
                             style="width: 40px; height: 40px; border-radius: 50%;">
                    `;
                } else {
                    // Create avatar from first letter if no photo
                    const firstName = this.userData.first_name || 'U';
                    const firstLetter = firstName.charAt(0).toUpperCase();
                    userBadge.innerHTML = `
                        <div class="user-avatar-text" style="
                            width: 40px; 
                            height: 40px; 
                            border-radius: 50%; 
                            background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            color: white; 
                            font-weight: bold;
                            font-size: 16px;
                        ">${firstLetter}</div>
                    `;
                }
            }
            
            // Update header with user info
            this.updateUserHeader();
        } else {
            // User is not logged in (testing in browser)
            if (userBadge) {
                userBadge.innerHTML = `
                    <div class="user-avatar-text" style="
                        width: 40px; 
                        height: 40px; 
                        border-radius: 50%; 
                        background: var(--surface-light);
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        color: var(--text-secondary); 
                        font-weight: bold;
                        font-size: 16px;
                        border: 2px solid var(--border);
                    ">👤</div>
                `;
            }
        }
    }

    updateUserHeader() {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement && this.userData) {
            const userName = this.userData.first_name + (this.userData.last_name ? ' ' + this.userData.last_name : '');
            userInfoElement.innerHTML = `
                <div class="user-welcome">
                    <span class="welcome-text">Добро пожаловать,</span>
                    <span class="user-name">${userName}</span>
                </div>
            `;
        }
    }

    loadUserData() {
        // Simulate loading user data from backend
        console.log('📊 Loading user data...');
        
        // In real app, this would be an API call to your backend
        // For now, we'll use mock data
        setTimeout(() => {
            this.updateBalances();
            this.updateExchangeLimits();
        }, 500);
    }

    updateBalances() {
        const giveBalance = document.getElementById('giveBalance');
        const getBalance = document.getElementById('getBalance');
        
        if (giveBalance && getBalance) {
            if (this.currentDirection === 'buy') {
                giveBalance.innerHTML = `<i class="fas fa-wallet"></i> Баланс: ${this.userBalance.rub.toLocaleString('ru-RU')} ₽`;
                getBalance.innerHTML = `<i class="fas fa-wallet"></i> Баланс: ${this.userBalance.usdt.toLocaleString('ru-RU')} USDT`;
            } else {
                giveBalance.innerHTML = `<i class="fas fa-wallet"></i> Баланс: ${this.userBalance.usdt.toLocaleString('ru-RU')} USDT`;
                getBalance.innerHTML = `<i class="fas fa-wallet"></i> Баланс: ${this.userBalance.rub.toLocaleString('ru-RU')} ₽`;
            }
        }
    }

    updateExchangeLimits() {
        // Update limits based on user verification status
        const limitsElement = document.getElementById('exchangeLimits');
        if (limitsElement) {
            if (this.userData) {
                limitsElement.innerHTML = `
                    <div class="limits-info">
                        <i class="fas fa-chart-line"></i>
                        <span>Ваши лимиты: до 500,000 ₽ в сутки</span>
                    </div>
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

        // Profile button
        const profileButton = document.getElementById('profileButton');
        if (profileButton) {
            profileButton.addEventListener('click', () => {
                this.showProfile();
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
        
        if (direction === 'buy') {
            // RUB → USDT
            if (giveCurrencyFlag) giveCurrencyFlag.textContent = '₽';
            if (giveCurrencyCode) giveCurrencyCode.textContent = 'RUB';
            if (getCurrencyFlag) getCurrencyFlag.textContent = '₿';
            if (getCurrencyCode) getCurrencyCode.textContent = 'USDT';
            
            const giveAmountInput = document.getElementById('giveAmount');
            if (giveAmountInput) giveAmountInput.value = '1000';
            
            const walletInfo = document.getElementById('walletInfo');
            if (walletInfo) walletInfo.style.display = 'none';
        } else {
            // USDT → RUB
            if (giveCurrencyFlag) giveCurrencyFlag.textContent = '₿';
            if (giveCurrencyCode) giveCurrencyCode.textContent = 'USDT';
            if (getCurrencyFlag) getCurrencyFlag.textContent = '₽';
            if (getCurrencyCode) getCurrencyCode.textContent = 'RUB';
            
            const giveAmountInput = document.getElementById('giveAmount');
            if (giveAmountInput) giveAmountInput.value = '100';
            
            const walletInfo = document.getElementById('walletInfo');
            if (walletInfo) walletInfo.style.display = 'block';
        }
        
        this.updateBalances();
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
        
        // Check if user has sufficient balance
        this.checkBalance(giveAmount);
    }

    checkBalance(amount) {
        const exchangeBtn = document.getElementById('exchangeBtn');
        if (!exchangeBtn) return;
        
        let hasSufficientBalance = true;
        
        if (this.currentDirection === 'buy') {
            // Buying USDT - check RUB balance
            hasSufficientBalance = amount <= this.userBalance.rub;
        } else {
            // Selling USDT - check USDT balance
            hasSufficientBalance = amount <= this.userBalance.usdt;
        }
        
        if (!hasSufficientBalance) {
            exchangeBtn.disabled = true;
            exchangeBtn.style.opacity = '0.6';
            this.showBalanceError();
        } else {
            exchangeBtn.disabled = false;
            exchangeBtn.style.opacity = '1';
        }
    }

    showBalanceError() {
        const errorElement = document.getElementById('balanceError');
        if (errorElement) {
            const currency = this.currentDirection === 'buy' ? 'RUB' : 'USDT';
            errorElement.style.display = 'block';
            errorElement.innerHTML = `
                <div class="balance-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    Недостаточно средств на балансе
                </div>
            `;
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        }
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

        // Check if user is authorized
        if (!this.userData) {
            this.showError('Для совершения обмена необходимо авторизоваться в Telegram');
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
            <div class="user-info-card">
                <div class="user-avatar-small">
                    ${this.userData.photo_url ? 
                        `<img src="${this.userData.photo_url}" alt="Avatar">` :
                        `<div class="avatar-placeholder">${(this.userData.first_name?.charAt(0) || 'U').toUpperCase()}</div>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-name">${this.userData.first_name} ${this.userData.last_name || ''}</div>
                    <div class="user-id">ID: ${this.userData.id}</div>
                </div>
            </div>
            
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
            
            <div class="exchange-summary">
                <div class="summary-item">
                    <span>Сумма:</span>
                    <span>${document.getElementById('giveAmount')?.value} ₽</span>
                </div>
                <div class="summary-item">
                    <span>Получите:</span>
                    <span>${document.getElementById('getAmount')?.value} USDT</span>
                </div>
                <div class="summary-item commission">
                    <span>Комиссия:</span>
                    <span>${this.commission}%</span>
                </div>
            </div>
            
            <button class="btn btn-primary" style="margin-top: 20px;" id="confirmPayment">
                Подтвердить оплату
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
        
        modalTitle.textContent = 'Подтверждение вывода';
        modalBody.innerHTML = `
            <div class="user-info-card">
                <div class="user-avatar-small">
                    ${this.userData.photo_url ? 
                        `<img src="${this.userData.photo_url}" alt="Avatar">` :
                        `<div class="avatar-placeholder">${(this.userData.first_name?.charAt(0) || 'U').toUpperCase()}</div>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-name">${this.userData.first_name} ${this.userData.last_name || ''}</div>
                    <div class="user-id">ID: ${this.userData.id}</div>
                </div>
            </div>
            
            <div class="saved-cards">
                <div class="section-title">Карта для получения</div>
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
            
            <div class="exchange-summary">
                <div class="summary-item">
                    <span>Отправьте:</span>
                    <span>${document.getElementById('giveAmount')?.value} USDT</span>
                </div>
                <div class="summary-item">
                    <span>Получите:</span>
                    <span>${document.getElementById('getAmount')?.value} ₽</span>
                </div>
                <div class="summary-item commission">
                    <span>Комиссия:</span>
                    <span>${this.commission}%</span>
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

    showProfile() {
        const modal = document.getElementById('paymentModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = 'Мой профиль';
        modalBody.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    ${this.userData.photo_url ? 
                        `<img src="${this.userData.photo_url}" alt="Avatar">` :
                        `<div class="avatar-placeholder large">${(this.userData.first_name?.charAt(0) || 'U').toUpperCase()}</div>`
                    }
                </div>
                <div class="profile-info">
                    <h3>${this.userData.first_name} ${this.userData.last_name || ''}</h3>
                    <p>ID: ${this.userData.id}</p>
                    ${this.userData.username ? `<p>@${this.userData.username}</p>` : ''}
                </div>
            </div>
            
            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-value">${this.userBalance.rub.toLocaleString('ru-RU')} ₽</div>
                    <div class="stat-label">RUB Баланс</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.userBalance.usdt.toLocaleString('ru-RU')}</div>
                    <div class="stat-label">USDT Баланс</div>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="profile-btn" id="historyBtn">
                    <i class="fas fa-history"></i>
                    История операций
                </button>
                <button class="profile-btn" id="verificationBtn">
                    <i class="fas fa-shield-alt"></i>
                    Верификация
                </button>
                <button class="profile-btn" id="supportBtn">
                    <i class="fas fa-headset"></i>
                    Поддержка
                </button>
            </div>
        `;
        
        // Add event listeners for profile actions
        const historyBtn = modalBody.querySelector('#historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showHistory();
            });
        }
        
        const verificationBtn = modalBody.querySelector('#verificationBtn');
        if (verificationBtn) {
            verificationBtn.addEventListener('click', () => {
                this.showVerification();
            });
        }
        
        const supportBtn = modalBody.querySelector('#supportBtn');
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                this.openSupport();
            });
        }
        
        this.showModal();
    }

    showHistory() {
        // Implementation for history view
        this.showSuccess('История операций', 'Здесь будет история ваших операций');
    }

    showVerification() {
        // Implementation for verification
        this.showSuccess('Верификация', 'Пройти верификацию можно у нашего менеджера');
    }

    openSupport() {
        if (typeof tg !== 'undefined') {
            tg.openTelegramLink('https://t.me/cryptoexchange_support');
        } else {
            window.open('https://t.me/cryptoexchange_support', '_blank');
        }
        this.closeModal();
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

        // Simulate API call to backend
        console.log('📤 Sending exchange request to backend...', {
            userId: this.userData?.id,
            direction: this.currentDirection,
            amount: giveAmount,
            paymentMethod: this.selectedPaymentMethod
        });

        // Simulate API call
        setTimeout(() => {
            const operation = this.currentDirection === 'buy' ? 'покупки' : 'продажи';
            const fromCurrency = this.currentDirection === 'buy' ? '₽' : 'USDT';
            const toCurrency = this.currentDirection === 'buy' ? 'USDT' : '₽';
            
            // Update balances (in real app this would come from backend)
            if (this.currentDirection === 'buy') {
                this.userBalance.rub -= parseFloat(giveAmount);
                this.userBalance.usdt += parseFloat(getAmount);
            } else {
                this.userBalance.usdt -= parseFloat(giveAmount);
                this.userBalance.rub += parseFloat(getAmount);
            }
            
            this.updateBalances();
            
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