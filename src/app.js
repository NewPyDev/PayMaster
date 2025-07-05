// PayRoll Pro - Main Application Logic
class PayrollApp {
    constructor() {
        this.employees = JSON.parse(localStorage.getItem('payroll_employees')) || [];
        this.adjustments = JSON.parse(localStorage.getItem('payroll_adjustments')) || [];
        this.receipts = JSON.parse(localStorage.getItem('payroll_receipts')) || [];
        this.currentEmployee = null;
        this.receiptCounter = parseInt(localStorage.getItem('receipt_counter')) || 1;
        
        // Load settings with defaults
        this.settings = JSON.parse(localStorage.getItem('payroll_settings')) || {
            currency: 'USD',
            companyName: 'PayMaster',
            dateFormat: 'US'
        };
        
        // Performance and UX enhancements
        this.debounceTimers = {};
        this.renderQueue = [];
        this.isRendering = false;
        
        this.init();
    }

    init() {
        this.renderEmployeeTable();
        this.bindEvents();
        
        // Show dashboard by default
        this.showDashboard();
    }

    bindEvents() {
        // Close modals when clicking outside
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.classList.remove('active');
            }
        };
    }

    // Data Management
    saveData() {
        localStorage.setItem('payroll_employees', JSON.stringify(this.employees));
        localStorage.setItem('payroll_adjustments', JSON.stringify(this.adjustments));
        localStorage.setItem('payroll_receipts', JSON.stringify(this.receipts));
        localStorage.setItem('receipt_counter', this.receiptCounter.toString());
        localStorage.setItem('payroll_settings', JSON.stringify(this.settings));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Performance Utilities
    debounce(func, wait, key) {
        clearTimeout(this.debounceTimers[key]);
        this.debounceTimers[key] = setTimeout(func, wait);
    }

    queueRender(renderFunction) {
        this.renderQueue.push(renderFunction);
        if (!this.isRendering) {
            this.processRenderQueue();
        }
    }

    async processRenderQueue() {
        this.isRendering = true;
        while (this.renderQueue.length > 0) {
            const renderFunction = this.renderQueue.shift();
            await new Promise(resolve => {
                renderFunction();
                requestAnimationFrame(resolve);
            });
        }
        this.isRendering = false;
    }

    // Notification System
    showNotification(message, type = 'success', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInFromRight 0.3s ease-out reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }
        }, duration);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInFromRight 0.3s ease-out reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'info': return 'info-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'bell';
        }
    }

    // Loading States
    setButtonLoading(buttonElement, loading = true) {
        if (loading) {
            buttonElement.classList.add('loading');
            buttonElement.disabled = true;
        } else {
            buttonElement.classList.remove('loading');
            buttonElement.disabled = false;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
style: 'currency',
            currency: this.settings.currency
        }).format(amount);
    }

    formatDate(date) {
        const dateObj = new Date(date);
        switch (this.settings.dateFormat) {
            case 'EU':
                return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
            case 'ISO':
                return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
            default:
                return dateObj.toLocaleDateString('en-US'); // MM/DD/YYYY
        }
    }

    // Employee Management
    addEmployee(employeeData) {
        const employee = {
            id: this.generateId(),
            name: employeeData.name,
            position: employeeData.position || 'Not specified',
            baseSalary: parseFloat(employeeData.baseSalary),
            insurance: parseFloat(employeeData.insurance) || 0,
            hireDate: employeeData.hireDate || new Date().toISOString().split('T')[0],
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.employees.push(employee);
        this.saveData();
        this.queueRender(() => this.renderEmployeeTable());
        this.showNotification(`Employee ${employee.name} added successfully!`, 'success');
        return true;
    }

    // Edit Employee functionality
    showEditEmployeeModal(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) {
            this.showNotification('Employee not found!', 'error');
            return;
        }

        // Populate form with current employee data
        document.getElementById('edit-emp-name-input').value = employee.name;
        document.getElementById('edit-emp-position-input').value = employee.position;
        document.getElementById('edit-emp-salary-input').value = employee.baseSalary;
        document.getElementById('edit-emp-insurance-input').value = employee.insurance || 0;
        document.getElementById('edit-emp-hire-date-input').value = employee.hireDate;

        // Store employee ID for update
        this.editingEmployeeId = employeeId;
        
        this.showModal('edit-employee-modal');
    }

    updateEmployee(employeeData) {
        if (!this.editingEmployeeId) {
            this.showNotification('No employee selected for editing!', 'error');
            return false;
        }

        const employee = this.employees.find(emp => emp.id === this.editingEmployeeId);
        if (!employee) {
            this.showNotification('Employee not found!', 'error');
            return false;
        }

        // Store old values for comparison
        const oldSalary = employee.baseSalary;
        const oldInsurance = employee.insurance;
        
        // Update employee data
        employee.name = employeeData.name;
        employee.position = employeeData.position || 'Not specified';
        employee.baseSalary = parseFloat(employeeData.baseSalary);
        employee.insurance = parseFloat(employeeData.insurance) || 0;
        employee.hireDate = employeeData.hireDate || employee.hireDate;
        employee.updatedAt = new Date().toISOString();

        this.saveData();
        this.queueRender(() => {
            this.renderEmployeeTable();
            // If we're currently viewing this employee, update the display
            if (this.currentEmployee && this.currentEmployee.id === this.editingEmployeeId) {
                this.currentEmployee = employee; // Update current employee reference
                this.renderEmployeeInfo();
                this.updatePaymentSummary();
            }
        });

        // Show specific update notifications
        let updateMessage = `Employee ${employee.name} updated successfully!`;
        if (oldSalary !== employee.baseSalary || oldInsurance !== employee.insurance) {
            updateMessage += ` Salary and/or insurance amounts have been changed.`;
        }
        this.showNotification(updateMessage, 'success');

        // Clear editing state
        this.editingEmployeeId = null;
        return true;
    }

    removeEmployee(employeeId) {
        if (confirm('Are you sure you want to remove this employee? This action cannot be undone.')) {
            // Soft delete - mark as inactive
            const employee = this.employees.find(emp => emp.id === employeeId);
            if (employee) {
                employee.isActive = false;
                this.saveData();
                this.queueRender(() => this.renderEmployeeTable());
                this.showNotification(`Employee ${employee.name} removed successfully!`, 'info');
                
                // If we're currently viewing this employee, go back to dashboard
                if (this.currentEmployee && this.currentEmployee.id === employeeId) {
                    this.showDashboard();
                }
            }
        }
    }

    getEmployee(employeeId) {
        return this.employees.find(emp => emp.id === employeeId && emp.isActive);
    }

    // Payment Adjustments
    addAdjustment(employeeId, adjustmentData) {
        const adjustment = {
            id: this.generateId(),
            employeeId: employeeId,
            description: adjustmentData.description,
            amount: parseFloat(adjustmentData.amount),
            type: adjustmentData.type,
            frequency: adjustmentData.frequency || 'recurring', // Set default to 'recurring'
            dateAdded: new Date().toISOString(),
            isActive: true
        };

        this.adjustments.push(adjustment);
        this.saveData();
        this.showNotification(`Adjustment "${adjustment.description}" added successfully!`, 'success');
        
        if (this.currentEmployee && this.currentEmployee.id === employeeId) {
            this.queueRender(() => {
                this.renderAdjustmentsTable();
                this.updatePaymentSummary();
            });
        }
    }

    removeAdjustment(adjustmentId) {
        if (confirm('Are you sure you want to remove this adjustment?')) {
            const adjustment = this.adjustments.find(adj => adj.id === adjustmentId);
            if (adjustment) {
                adjustment.isActive = false;
                this.saveData();
                this.showNotification(`Adjustment "${adjustment.description}" removed!`, 'info');
                this.queueRender(() => {
                    this.renderAdjustmentsTable();
                    this.updatePaymentSummary();
                });
            }
        }
    }

    removeOneTimeAdjustments(employeeId) {
        // Mark one-time adjustments as inactive
        this.adjustments.forEach(adj => {
            if (adj.employeeId === employeeId && adj.frequency === 'one-time' && adj.isActive) {
                adj.isActive = false;
            }
        });
        
        this.saveData();
        
        // Update the display if we're currently viewing this employee
        if (this.currentEmployee && this.currentEmployee.id === employeeId) {
            this.queueRender(() => {
                this.renderAdjustmentsTable();
                this.updatePaymentSummary();
            });
        }
        
        // Show notification about removed adjustments
        const removedCount = this.adjustments.filter(adj => 
            adj.employeeId === employeeId && 
            adj.frequency === 'one-time' && 
            !adj.isActive
        ).length;
        
        if (removedCount > 0) {
            this.showNotification(`${removedCount} one-time adjustment(s) automatically removed after receipt generation`, 'info');
        }
    }

    getEmployeeAdjustments(employeeId) {
        return this.adjustments.filter(adj => adj.employeeId === employeeId && adj.isActive);
    }

    calculateTotalAdjustments(employeeId) {
        const adjustments = this.getEmployeeAdjustments(employeeId);
        return adjustments.reduce((total, adj) => {
            if (['deduction', 'advance', 'penalty'].includes(adj.type)) {
                return total - adj.amount;
            } else {
                return total + adj.amount;
            }
        }, 0);
    }

    // UI Management
    showView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        document.getElementById(viewId).classList.add('active');
    }

    showDashboard() {
        this.showView('dashboard-view');
        this.currentEmployee = null;
        this.renderEmployeeTable();
    }

    showEmployeeView(employeeId) {
        const employee = this.getEmployee(employeeId);
        if (!employee) {
            alert('Employee not found');
            return;
        }

        this.currentEmployee = employee;
        this.showView('employee-view');
        this.renderEmployeeInfo();
        this.renderAdjustmentsTable();
        this.updatePaymentSummary();
    }

    renderEmployeeTable() {
        const tableBody = document.getElementById('employees-table-body');
        const noEmployees = document.getElementById('no-employees');
        const tableContainer = document.querySelector('.employees-table-container');
        
        const activeEmployees = this.employees.filter(emp => emp.isActive);

        if (activeEmployees.length === 0) {
            tableContainer.style.display = 'none';
            noEmployees.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        noEmployees.style.display = 'none';

        tableBody.innerHTML = activeEmployees.map(employee => `
            <tr>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td class="salary-amount">${this.formatCurrency(employee.baseSalary)}</td>
                <td>
                    <button class="btn btn-primary" onclick="app.showEmployeeView('${employee.id}')" data-tooltip="View employee details and manage payments">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-warning" onclick="app.showEditEmployeeModal('${employee.id}')" data-tooltip="Edit employee information">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="app.removeEmployee('${employee.id}')" data-tooltip="Remove employee from payroll">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderEmployeeInfo() {
        if (!this.currentEmployee) return;

        document.getElementById('employee-title').textContent = 
            `${this.currentEmployee.name} - Payment Manager`;
        document.getElementById('emp-name').textContent = this.currentEmployee.name;
        document.getElementById('emp-position').textContent = this.currentEmployee.position;
        document.getElementById('emp-base-salary').textContent = 
            this.formatCurrency(this.currentEmployee.baseSalary);
        document.getElementById('emp-insurance').textContent = 
            this.formatCurrency(this.currentEmployee.insurance || 0);
    }

    renderAdjustmentsTable() {
        if (!this.currentEmployee) return;

        const tableBody = document.getElementById('adjustments-table-body');
        const adjustments = this.getEmployeeAdjustments(this.currentEmployee.id);

        if (adjustments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        No adjustments added yet
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = adjustments.map(adjustment => {
            const isNegative = ['deduction', 'advance', 'penalty'].includes(adjustment.type);
            const amountClass = isNegative ? 'amount negative' : 'amount';
            const amountPrefix = isNegative ? '-' : '+';
            const frequency = adjustment.frequency || 'recurring'; // Default to recurring for old adjustments
            
            return `
                <tr>
                    <td>${adjustment.description}</td>
                    <td class="${amountClass}">${amountPrefix}${this.formatCurrency(Math.abs(adjustment.amount))}</td>
                    <td>
                        <span class="badge badge-${adjustment.type}">
                            ${adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                        </span>
                    </td>
                    <td>
                        <span class="badge badge-${frequency === 'one-time' ? 'one-time' : 'recurring'}">
                            ${frequency === 'one-time' ? '⚡ One-Time' : '🔄 Recurring'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-danger" onclick="app.removeAdjustment('${adjustment.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updatePaymentSummary() {
        if (!this.currentEmployee) return;

        const baseSalary = this.currentEmployee.baseSalary;
        const insurance = this.currentEmployee.insurance || 0;
        const totalAdjustments = this.calculateTotalAdjustments(this.currentEmployee.id);
        const finalAmount = baseSalary - insurance + totalAdjustments;

        document.getElementById('summary-base-salary').textContent = this.formatCurrency(baseSalary);
        document.getElementById('summary-insurance').textContent = '-' + this.formatCurrency(insurance);
        
        const adjustmentElement = document.getElementById('summary-adjustments');
        adjustmentElement.textContent = this.formatCurrency(totalAdjustments);
        adjustmentElement.className = totalAdjustments >= 0 ? 'amount' : 'amount negative';
        
        const finalElement = document.getElementById('summary-final-amount');
        finalElement.textContent = this.formatCurrency(finalAmount);
        finalElement.className = finalAmount >= 0 ? 'amount' : 'amount negative';
    }

    // Modal Management
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        
        // Clear form data
        const form = document.querySelector(`#${modalId} form`);
        if (form) {
            form.reset();
        }
    }

    // Enhanced Search functionality
    searchEmployees() {
        this.debounce(() => {
            const searchTerm = document.getElementById('employee-search').value.toLowerCase();
            const tableRows = document.querySelectorAll('#employees-table-body tr');
            let visibleCount = 0;
            
            tableRows.forEach((row, index) => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                    row.style.animationDelay = `${index * 0.05}s`;
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Show search results feedback
            if (searchTerm && visibleCount === 0) {
                this.showSearchNoResults();
            } else {
                this.hideSearchNoResults();
            }
        }, 300, 'employee-search');
    }

    showSearchNoResults() {
        let noResultsRow = document.getElementById('search-no-results');
        if (!noResultsRow) {
            const tableBody = document.getElementById('employees-table-body');
            noResultsRow = document.createElement('tr');
            noResultsRow.id = 'search-no-results';
            noResultsRow.innerHTML = `
                <td colspan="4" class="text-center text-muted" style="padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No employees found matching your search.</p>
                </td>
            `;
            tableBody.appendChild(noResultsRow);
        }
        noResultsRow.style.display = '';
    }

    hideSearchNoResults() {
        const noResultsRow = document.getElementById('search-no-results');
        if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }

    // Receipt Generation
    generateReceipt() {
        if (!this.currentEmployee) return;

        const employee = this.currentEmployee;
        const adjustments = this.getEmployeeAdjustments(employee.id);
        const baseSalary = employee.baseSalary;
        const insurance = employee.insurance || 0;
        const totalAdjustments = this.calculateTotalAdjustments(employee.id);
        const finalAmount = baseSalary - insurance + totalAdjustments;
        
        const currentDate = new Date();

        // Save receipt record
        const receipt = {
            id: this.generateId(),
            employeeId: employee.id,
            baseSalary: baseSalary,
            totalAdjustments: totalAdjustments,
            finalAmount: finalAmount,
            paymentDate: currentDate.toISOString().split('T')[0],
            adjustments: adjustments.map(adj => ({...adj})), // Copy adjustments
            createdAt: currentDate.toISOString()
        };

        this.receipts.push(receipt);
        this.saveData();

        // Remove one-time adjustments after generating receipt
        this.removeOneTimeAdjustments(employee.id);

        // Generate receipt HTML
        const receiptHTML = `
            <div class="receipt">
                <div class="receipt-header">
                    <h1>${this.settings.companyName}</h1>
                    <p>Payment Receipt</p>
                </div>
                
                <div class="receipt-details">
                    <div><strong>Date:</strong> ${this.formatDate(currentDate)}</div>
                    <div><strong>Employee:</strong> ${employee.name}</div>
                    <div><strong>Position:</strong> ${employee.position}</div>
                </div>

                <table class="receipt-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Base Salary</td>
                            <td>${this.formatCurrency(baseSalary)}</td>
                        </tr>
                        <tr>
                            <td>Insurance</td>
                            <td>-${this.formatCurrency(insurance)}</td>
                        </tr>
                        ${adjustments.map(adj => {
                            const isNegative = ['deduction', 'advance', 'penalty'].includes(adj.type);
                            const amount = isNegative ? -adj.amount : adj.amount;
                            return `
                                <tr>
                                    <td>${adj.description} (${adj.type})</td>
                                    <td>${this.formatCurrency(amount)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>

                <div class="receipt-total">
                    Total Amount: ${this.formatCurrency(finalAmount)}
                </div>

                <div class="receipt-footer">
                    <p>Generated on ${currentDate.toLocaleString()}</p>
                    <p>Thank you for using PayMaster</p>
                </div>
            </div>
        `;

        document.getElementById('receipt-content').innerHTML = receiptHTML;
        this.showModal('receipt-modal');
    }

    printReceiptContent() {
        const receiptContent = document.getElementById('receipt-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payment Receipt</title>
                <style>
                    body { font-family: 'Courier New', monospace; }
                    .receipt { max-width: 400px; margin: 20px auto; }
                    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    .receipt-details div { margin-bottom: 5px; }
                    .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .receipt-table th, .receipt-table td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
                    .receipt-table th { background: #f0f0f0; font-weight: bold; }
                    .receipt-total { border-top: 2px solid #000; padding-top: 10px; font-size: 18px; font-weight: bold; text-align: right; }
                    .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    printReceipt() {
        this.generateReceipt();
        setTimeout(() => {
            this.printReceiptContent();
        }, 500);
    }

    printBatchReceipts() {
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        if (activeEmployees.length === 0) {
            alert('No employees found to generate receipts for.');
            return;
        }

        if (confirm(`Generate and print receipts for all ${activeEmployees.length} employees?`)) {
            let batchHTML = '';
            
            activeEmployees.forEach((employee, index) => {
                const adjustments = this.getEmployeeAdjustments(employee.id);
                const baseSalary = employee.baseSalary;
                const insurance = employee.insurance || 0;
                const totalAdjustments = this.calculateTotalAdjustments(employee.id);
                const finalAmount = baseSalary - insurance + totalAdjustments;
                
                batchHTML += `
                    <div class="receipt" style="page-break-after: ${index < activeEmployees.length - 1 ? 'always' : 'auto'};">
                        <div class="receipt-header">
                            <h1>${this.settings.companyName}</h1>
                            <p>Payment Receipt</p>
                        </div>
                        
                        <div class="receipt-details">
                            <div><strong>Date:</strong> ${this.formatDate(new Date())}</div>
                            <div><strong>Employee:</strong> ${employee.name}</div>
                            <div><strong>Position:</strong> ${employee.position}</div>
                        </div>

                        <table class="receipt-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Base Salary</td>
                                    <td>${this.formatCurrency(baseSalary)}</td>
                                </tr>
                                <tr>
                                    <td>Insurance</td>
                                    <td>-${this.formatCurrency(insurance)}</td>
                                </tr>
                                ${adjustments.map(adj => {
                                    const isNegative = ['deduction', 'advance', 'penalty'].includes(adj.type);
                                    const amount = isNegative ? -adj.amount : adj.amount;
                                    return `
                                        <tr>
                                            <td>${adj.description} (${adj.type})</td>
                                            <td>${this.formatCurrency(amount)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>

                        <div class="receipt-total">
                            Total Amount: ${this.formatCurrency(finalAmount)}
                        </div>

                        <div class="receipt-footer">
                            <p>Generated on ${new Date().toLocaleString()}</p>
                            <p>Thank you for using PayMaster</p>
                        </div>
                    </div>
                `;
            });

            this.saveData(); // Save updated receipt counter
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Batch Payment Receipts</title>
                    <style>
                        body { font-family: 'Courier New', monospace; margin: 0; }
                        .receipt { max-width: 400px; margin: 20px auto; padding: 20px; }
                        .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        .receipt-details div { margin-bottom: 5px; }
                        .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .receipt-table th, .receipt-table td { padding: 5px; text-align: left; border-bottom: 1px solid #ddd; }
                        .receipt-table th { background: #f0f0f0; font-weight: bold; }
                        .receipt-total { border-top: 2px solid #000; padding-top: 10px; font-size: 18px; font-weight: bold; text-align: right; }
                        .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
                        @media print {
                            .receipt { margin: 0; padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    ${batchHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    showPaymentHistory() {
        if (!this.currentEmployee) return;
        
        const employeeReceipts = this.receipts.filter(receipt => 
            receipt.employeeId === this.currentEmployee.id
        ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (employeeReceipts.length === 0) {
            alert('No payment history found for this employee.');
            return;
        }

        const historyHTML = `
            <div style="max-height: 400px; overflow-y: auto;">
                <h4>Payment History for ${this.currentEmployee.name}</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeeReceipts.map(receipt => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${this.formatDate(receipt.paymentDate)}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${this.formatCurrency(receipt.finalAmount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Create a temporary modal for history
        const historyModal = document.createElement('div');
        historyModal.className = 'modal active';
        historyModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Payment History</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div style="padding: 20px;">
                    ${historyHTML}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(historyModal);
    }

    showSettings() {
        // Load current settings into the form
        document.getElementById('currency-select').value = this.settings.currency;
        document.getElementById('company-name-input').value = this.settings.companyName;
        document.getElementById('date-format-select').value = this.settings.dateFormat;
        
        this.showModal('settings-modal');
    }

    saveSettings(formData) {
        this.settings.currency = formData.currency;
        this.settings.companyName = formData.companyName || 'PayMaster';
        this.settings.dateFormat = formData.dateFormat;
        
        this.saveData();
        
        // Refresh displays to show new currency format
        this.queueRender(() => {
            this.renderEmployeeTable();
            if (this.currentEmployee) {
                this.renderEmployeeInfo();
                this.renderAdjustmentsTable();
                this.updatePaymentSummary();
            }
        });
        
        this.showNotification('Settings saved successfully!', 'success');
    }

    // Reports and Analytics
    showReportsView() {
        this.showView('reports-view');
        this.updateReportsSummary();
        this.renderAnalytics();
    }

    updateReportsSummary() {
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        const totalEmployees = activeEmployees.length;
        const totalReceipts = this.receipts.length;
        
        // Calculate total payroll (sum of all final amounts from receipts)
        const totalPayroll = this.receipts.reduce((sum, receipt) => sum + receipt.finalAmount, 0);
        
        // Calculate average salary
        const avgSalary = totalEmployees > 0 ? 
            activeEmployees.reduce((sum, emp) => sum + emp.baseSalary, 0) / totalEmployees : 0;
        
        // Update summary cards
        document.getElementById('total-employees').textContent = totalEmployees;
        document.getElementById('total-payroll').textContent = this.formatCurrency(totalPayroll);
        document.getElementById('total-receipts').textContent = totalReceipts;
        document.getElementById('avg-salary').textContent = this.formatCurrency(avgSalary);
    }

    renderAnalytics() {
        this.renderEmployeeAnalytics();
        this.renderAdjustmentAnalytics();
    }

    renderEmployeeAnalytics() {
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        const tbody = document.getElementById('employee-analytics-body');
        
        if (activeEmployees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No employees found</td></tr>';
            return;
        }
        
        tbody.innerHTML = activeEmployees.map(employee => {
            const adjustments = this.calculateTotalAdjustments(employee.id);
            const insurance = employee.insurance || 0;
            const netSalary = employee.baseSalary - insurance + adjustments;
            
            // Find last payment
            const lastReceipt = this.receipts
                .filter(r => r.employeeId === employee.id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            
            const lastPayment = lastReceipt ? this.formatDate(lastReceipt.paymentDate) : 'Never';
            
            return `
                <tr>
                    <td>${employee.name}</td>
                    <td>${this.formatCurrency(employee.baseSalary)}</td>
                    <td class="${adjustments >= 0 ? 'text-success' : 'text-danger'}">
                        ${this.formatCurrency(adjustments)}
                    </td>
                    <td class="${netSalary >= 0 ? 'text-success' : 'text-danger'}">
                        ${this.formatCurrency(netSalary)}
                    </td>
                    <td>${lastPayment}</td>
                </tr>
            `;
        }).join('');
    }

    renderAdjustmentAnalytics() {
        const adjustmentTypes = {};
        
        this.adjustments.filter(adj => adj.isActive).forEach(adj => {
            if (!adjustmentTypes[adj.type]) {
                adjustmentTypes[adj.type] = {
                    count: 0,
                    total: 0
                };
            }
            adjustmentTypes[adj.type].count++;
            adjustmentTypes[adj.type].total += adj.amount;
        });
        
        const tbody = document.getElementById('adjustments-analytics-body');
        
        if (Object.keys(adjustmentTypes).length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No adjustments found</td></tr>';
            return;
        }
        
        tbody.innerHTML = Object.entries(adjustmentTypes).map(([type, data]) => {
            const avgAmount = data.total / data.count;
            return `
                <tr>
                    <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                    <td>${data.count}</td>
                    <td>${this.formatCurrency(data.total)}</td>
                    <td>${this.formatCurrency(avgAmount)}</td>
                </tr>
            `;
        }).join('');
    }

    // Export Functions
    exportToCSV(type) {
        let csvContent = '';
        let filename = '';
        
        switch (type) {
            case 'employees':
                csvContent = this.generateEmployeesCSV();
                filename = `employees_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'payments':
                csvContent = this.generatePaymentsCSV();
                filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
                break;
            case 'adjustments':
                csvContent = this.generateAdjustmentsCSV();
                filename = `adjustments_${new Date().toISOString().split('T')[0]}.csv`;
                break;
        }
        
        this.downloadCSV(csvContent, filename);
    }

    generateEmployeesCSV() {
        const headers = ['Name', 'Position', 'Base Salary', 'Insurance', 'Hire Date', 'Status'];
        const rows = this.employees.map(emp => [
            emp.name,
            emp.position,
            emp.baseSalary,
            emp.insurance || 0,
            emp.hireDate,
            emp.isActive ? 'Active' : 'Inactive'
        ]);
        
        return this.arrayToCSV([headers, ...rows]);
    }

    generatePaymentsCSV() {
        const headers = ['Employee Name', 'Payment Date', 'Base Salary', 'Adjustments', 'Final Amount'];
        const rows = this.receipts.map(receipt => {
            const employee = this.employees.find(emp => emp.id === receipt.employeeId);
            return [
                employee ? employee.name : 'Unknown',
                receipt.paymentDate,
                receipt.baseSalary,
                receipt.totalAdjustments,
                receipt.finalAmount
            ];
        });
        
        return this.arrayToCSV([headers, ...rows]);
    }

    generateAdjustmentsCSV() {
        const headers = ['Employee Name', 'Description', 'Amount', 'Type', 'Date Added'];
        const rows = this.adjustments.filter(adj => adj.isActive).map(adj => {
            const employee = this.employees.find(emp => emp.id === adj.employeeId);
            return [
                employee ? employee.name : 'Unknown',
                adj.description,
                adj.amount,
                adj.type,
                adj.dateAdded.split('T')[0]
            ];
        });
        
        return this.arrayToCSV([headers, ...rows]);
    }

    arrayToCSV(data) {
        return data.map(row => 
            row.map(field => 
                typeof field === 'string' && field.includes(',') 
                    ? `"${field.replace(/"/g, '""')}"` 
                    : field
            ).join(',')
        ).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Enhanced Backup and Restore
    backupData() {
        try {
            this.showNotification('Creating backup...', 'info', 2000);
            
            const backupData = {
                employees: this.employees,
                adjustments: this.adjustments,
                receipts: this.receipts,
                settings: this.settings,
                receiptCounter: this.receiptCounter,
                timestamp: new Date().toISOString(),
                version: '1.0',
                appName: 'PayMaster'
            };
            
            const dataStr = JSON.stringify(backupData, null, 2);
            const filename = `paymaster_backup_${new Date().toISOString().split('T')[0]}.json`;
            
            const blob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => {
                    this.showNotification(`Backup created successfully! (${filename})`, 'success');
                }, 500);
            }
        } catch (error) {
            this.showNotification('Failed to create backup. Please try again.', 'error');
            console.error('Backup error:', error);
        }
    }

    showRestoreModal() {
        this.showModal('restore-modal');
    }

    handleRestoreFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                this.validateBackupData(backupData);
                this.previewBackupData(backupData);
                document.getElementById('restore-confirm-btn').disabled = false;
                this.pendingRestoreData = backupData;
            } catch (error) {
                alert('Invalid backup file. Please select a valid PayRoll Pro backup.');
                document.getElementById('restore-confirm-btn').disabled = true;
            }
        };
        reader.readAsText(file);
    }

    validateBackupData(data) {
        const requiredFields = ['employees', 'adjustments', 'receipts', 'settings'];
        for (const field of requiredFields) {
            if (!data.hasOwnProperty(field)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }

    previewBackupData(data) {
        const preview = document.getElementById('restore-preview');
        const list = document.getElementById('restore-preview-list');
        
        list.innerHTML = `
            <li>${data.employees.length} employees</li>
            <li>${data.adjustments.length} adjustments</li>
            <li>${data.receipts.length} receipts</li>
            <li>Settings and preferences</li>
            <li>Backup created: ${new Date(data.timestamp).toLocaleString()}</li>
        `;
        
        preview.style.display = 'block';
    }

    confirmRestore() {
        if (!this.pendingRestoreData) return;
        
        if (confirm('Are you sure you want to restore this backup? This will replace ALL current data and cannot be undone.')) {
            try {
                this.showNotification('Restoring data...', 'info', 2000);
                
                this.employees = this.pendingRestoreData.employees;
                this.adjustments = this.pendingRestoreData.adjustments;
                this.receipts = this.pendingRestoreData.receipts;
                this.settings = this.pendingRestoreData.settings;
                this.receiptCounter = this.pendingRestoreData.receiptCounter || 1;
                
                this.saveData();
                this.closeModal('restore-modal');
                
                // Smooth transition back to dashboard
                setTimeout(() => {
                    this.showDashboard();
                    this.showNotification('Data restored successfully!', 'success');
                }, 500);
                
            } catch (error) {
                this.showNotification('Failed to restore data. Please check the backup file.', 'error');
                console.error('Restore error:', error);
            }
        }
    }

    // Report Generation
    generatePayrollReport() {
        const reportData = this.generatePayrollReportData();
        this.printReport('Payroll Summary Report', reportData);
    }

    generateEmployeeReport() {
        const reportData = this.generateEmployeeReportData();
        this.printReport('Employee List Report', reportData);
    }

    generateAdjustmentsReport() {
        const reportData = this.generateAdjustmentsReportData();
        this.printReport('Adjustments Report', reportData);
    }

    generatePayrollReportData() {
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        const totalPayroll = this.receipts.reduce((sum, receipt) => sum + receipt.finalAmount, 0);
        
        return {
            title: 'Payroll Summary',
            summary: [
                { label: 'Total Active Employees', value: activeEmployees.length },
                { label: 'Total Payroll Processed', value: this.formatCurrency(totalPayroll) },
                { label: 'Total Receipts Generated', value: this.receipts.length },
                { label: 'Report Generated', value: new Date().toLocaleString() }
            ],
            table: {
                headers: ['Employee', 'Base Salary', 'Net Salary', 'Last Payment'],
                rows: activeEmployees.map(emp => {
                    const adjustments = this.calculateTotalAdjustments(emp.id);
                    const insurance = emp.insurance || 0;
                    const netSalary = emp.baseSalary - insurance + adjustments;
                    const lastReceipt = this.receipts
                        .filter(r => r.employeeId === emp.id)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    
                    return [
                        emp.name,
                        this.formatCurrency(emp.baseSalary),
                        this.formatCurrency(netSalary),
                        lastReceipt ? this.formatDate(lastReceipt.paymentDate) : 'Never'
                    ];
                })
            }
        };
    }

    generateEmployeeReportData() {
        const activeEmployees = this.employees.filter(emp => emp.isActive);
        
        return {
            title: 'Employee List',
            summary: [
                { label: 'Total Employees', value: activeEmployees.length },
                { label: 'Report Generated', value: new Date().toLocaleString() }
            ],
            table: {
                headers: ['Name', 'Position', 'Base Salary', 'Insurance', 'Hire Date'],
                rows: activeEmployees.map(emp => [
                    emp.name,
                    emp.position,
                    this.formatCurrency(emp.baseSalary),
                    this.formatCurrency(emp.insurance || 0),
                    this.formatDate(emp.hireDate)
                ])
            }
        };
    }

    generateAdjustmentsReportData() {
        const activeAdjustments = this.adjustments.filter(adj => adj.isActive);
        
        return {
            title: 'Adjustments Report',
            summary: [
                { label: 'Total Adjustments', value: activeAdjustments.length },
                { label: 'Report Generated', value: new Date().toLocaleString() }
            ],
            table: {
                headers: ['Employee', 'Description', 'Amount', 'Type', 'Date'],
                rows: activeAdjustments.map(adj => {
                    const employee = this.employees.find(emp => emp.id === adj.employeeId);
                    return [
                        employee ? employee.name : 'Unknown',
                        adj.description,
                        this.formatCurrency(adj.amount),
                        adj.type.charAt(0).toUpperCase() + adj.type.slice(1),
                        this.formatDate(adj.dateAdded)
                    ];
                })
            }
        };
    }

    printReport(title, data) {
        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
                    .report-title { font-size: 20px; color: #666; }
                    .summary { margin: 30px 0; }
                    .summary-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
                    .summary-label { font-weight: bold; }
                    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    tr:hover { background-color: #f8f9fa; }
                    .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">${this.settings.companyName}</div>
                    <div class="report-title">${title}</div>
                </div>
                
                <div class="summary">
                    ${data.summary.map(item => `
                        <div class="summary-item">
                            <span class="summary-label">${item.label}:</span>
                            <span>${item.value}</span>
                        </div>
                    `).join('')}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            ${data.table.headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.table.rows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    Generated by PayMaster | ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.print();
    }
}

// Global functions for HTML onclick events
function showAddEmployeeModal() {
    app.showModal('add-employee-modal');
}

function showAddAdjustmentModal() {
    if (!app.currentEmployee) {
        alert('Please select an employee first');
        return;
    }
    app.showModal('add-adjustment-modal');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function addEmployee(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('emp-name-input').value,
        position: document.getElementById('emp-position-input').value,
        baseSalary: document.getElementById('emp-salary-input').value,
        insurance: document.getElementById('emp-insurance-input').value,
        hireDate: document.getElementById('emp-hire-date-input').value
    };

    if (app.addEmployee(formData)) {
        closeModal('add-employee-modal');
    }
}

function updateEmployee(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('edit-emp-name-input').value,
        position: document.getElementById('edit-emp-position-input').value,
        baseSalary: document.getElementById('edit-emp-salary-input').value,
        insurance: document.getElementById('edit-emp-insurance-input').value,
        hireDate: document.getElementById('edit-emp-hire-date-input').value
    };

    if (app.updateEmployee(formData)) {
        closeModal('edit-employee-modal');
    }
}

function addAdjustment(event) {
    event.preventDefault();
    
    const formData = {
        description: document.getElementById('adj-description-input').value,
        amount: document.getElementById('adj-amount-input').value,
        type: document.getElementById('adj-type-input').value,
        frequency: document.getElementById('adj-frequency-input').value
    };

    app.addAdjustment(app.currentEmployee.id, formData);
    closeModal('add-adjustment-modal');
}

function searchEmployees() {
    app.searchEmployees();
}

function showDashboard() {
    app.showDashboard();
}

function generateReceipt() {
    app.generateReceipt();
}

function printReceipt() {
    app.printReceipt();
}

function printReceiptContent() {
    app.printReceiptContent();
}

function printBatchReceipts() {
    app.printBatchReceipts();
}

function showPaymentHistory() {
    app.showPaymentHistory();
}

function showSettings() {
    app.showSettings();
}

function saveSettings(event) {
    event.preventDefault();
    
    const formData = {
        currency: document.getElementById('currency-select').value,
        companyName: document.getElementById('company-name-input').value,
        dateFormat: document.getElementById('date-format-select').value
    };

    app.saveSettings(formData);
    closeModal('settings-modal');
}

function showReportsView() {
    app.showReportsView();
}

function generatePayrollReport() {
    app.generatePayrollReport();
}

function generateEmployeeReport() {
    app.generateEmployeeReport();
}

function generateAdjustmentsReport() {
    app.generateAdjustmentsReport();
}

function exportToCSV(type) {
    app.exportToCSV(type);
}

function backupData() {
    app.backupData();
}

function showRestoreModal() {
    app.showRestoreModal();
}

function handleRestoreFile(event) {
    const file = event.target.files[0];
    app.handleRestoreFile(file);
}

function confirmRestore() {
    app.confirmRestore();
}

function editCurrentEmployee() {
    if (app.currentEmployee) {
        app.showEditEmployeeModal(app.currentEmployee.id);
    } else {
        app.showNotification('No employee currently selected!', 'error');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new PayrollApp();
});

// Add some sample data for demonstration (remove in production)
function addSampleData() {
    if (app.employees.length === 0) {
        app.addEmployee({
            name: 'John Doe',
            position: 'Software Developer',
            baseSalary: '5000',
            insurance: '200',
            hireDate: '2024-01-15'
        });

        app.addEmployee({
            name: 'Jane Smith',
            position: 'UI/UX Designer',
            baseSalary: '4500',
            insurance: '180',
            hireDate: '2024-02-01'
        });

        app.addEmployee({
            name: 'Mike Johnson',
            position: 'Project Manager',
            baseSalary: '6000',
            insurance: '250',
            hireDate: '2024-01-01'
        });

        // Add some sample adjustments
        const johnId = app.employees.find(emp => emp.name === 'John Doe').id;
        app.addAdjustment(johnId, {
            description: 'Overtime Work',
            amount: '500',
            type: 'overtime'
        });

        app.addAdjustment(johnId, {
            description: 'Performance Bonus',
            amount: '1000',
            type: 'bonus'
        });
    }
}

// Uncomment this line to add sample data for testing
// setTimeout(addSampleData, 1000);
