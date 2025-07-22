// Cal-Trac Web Application - Main JavaScript

// Global configuration
const CalTrac = {
    apiBase: '/api',
    version: '1.0.0'
};

// Utility functions
const Utils = {
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
    },

    // Format date and time
    formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get query parameters
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Set query parameter
    setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    // Generate initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    // Copy text to clipboard
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            Toast.show('Copied to clipboard', 'success');
        }).catch(() => {
            Toast.show('Failed to copy to clipboard', 'error');
        });
    }
};

// API helper
const API = {
    async request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${CalTrac.apiBase}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Toast notification system
const Toast = {
    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <i class="fas ${icon} text-lg"></i>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${message}</p>
                </div>
                <div class="ml-auto pl-3">
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="text-gray-400 hover:text-gray-600 focus:outline-none">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
    },

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle text-green-500',
            error: 'fa-exclamation-circle text-red-500',
            warning: 'fa-exclamation-triangle text-yellow-500',
            info: 'fa-info-circle text-blue-500'
        };
        return icons[type] || icons.info;
    }
};

// Loading overlay
const Loading = {
    show(message = 'Loading...') {
        const existing = document.getElementById('loading-overlay');
        if (existing) return;

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
                <i class="fas fa-spinner fa-spin text-blue-600 text-xl"></i>
                <span class="text-gray-900">${message}</span>
            </div>
        `;

        document.body.appendChild(overlay);
    },

    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
};

// Modal helper
const Modal = {
    show(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="${btn.class || 'btn-secondary'}" 
                                onclick="${btn.onclick || 'this.closest(\'.modal-overlay\').remove()'}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        return modal;
    },

    confirm(message, onConfirm, onCancel) {
        return this.show('Confirm Action', `<p>${message}</p>`, [
            {
                text: 'Cancel',
                class: 'btn-secondary',
                onclick: onCancel ? `(${onCancel})(); this.closest('.modal-overlay').remove();` : 'this.closest(\'.modal-overlay\').remove()'
            },
            {
                text: 'Confirm',
                class: 'btn-danger',
                onclick: `(${onConfirm})(); this.closest('.modal-overlay').remove();`
            }
        ]);
    }
};

// Form validation helper
const FormValidator = {
    validate(form, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (!input) continue;

            const value = input.value.trim();
            
            if (rule.required && !value) {
                errors[field] = rule.required;
            } else if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || 'Invalid format';
            } else if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `Must be at least ${rule.minLength} characters`;
            } else if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `Must be no more than ${rule.maxLength} characters`;
            }
        }

        return errors;
    },

    showErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Show new errors
        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorEl = document.createElement('p');
                errorEl.className = 'error-message text-red-500 text-sm mt-1';
                errorEl.textContent = message;
                
                input.parentNode.appendChild(errorEl);
            }
        }
    },

    clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
};

// Authentication functions
async function logout() {
    try {
        Loading.show('Signing out...');
        await API.post('/auth/logout');
        window.location.href = '/login';
    } catch (error) {
        Loading.hide();
        Toast.show('Error signing out. Please try again.', 'error');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for common elements
    document.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', () => {
            Utils.copyToClipboard(el.dataset.copy);
        });
    });

    // Add hover effects to cards
    document.querySelectorAll('.card-hover').forEach(el => {
        el.classList.add('fade-in');
    });

    // Handle form submissions
    document.querySelectorAll('form[data-api]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                Loading.show();
                const result = await API.post(form.dataset.api, data);
                Loading.hide();
                
                Toast.show(result.message || 'Success', 'success');
                
                if (form.dataset.redirect) {
                    setTimeout(() => {
                        window.location.href = form.dataset.redirect;
                    }, 1000);
                }
            } catch (error) {
                Loading.hide();
                Toast.show(error.message || 'An error occurred', 'error');
            }
        });
    });

    // Set up search debouncing
    document.querySelectorAll('input[type="search"], input[data-search]').forEach(input => {
        const debouncedSearch = Utils.debounce((value) => {
            if (window.performSearch && typeof window.performSearch === 'function') {
                window.performSearch(value);
            }
        }, 300);

        input.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    });

    console.log('Cal-Trac Web Application initialized');
});

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Toast.show('An unexpected error occurred', 'error');
});

// Export for global access
window.CalTrac = CalTrac;
window.Utils = Utils;
window.API = API;
window.Toast = Toast;
window.Loading = Loading;
window.Modal = Modal;
window.FormValidator = FormValidator;