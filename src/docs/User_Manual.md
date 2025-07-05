# PayMaster - User Manual

**Version 1.0** | **Professional Payroll Management System**

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Employee Management](#employee-management)
3. [Payment Processing](#payment-processing)
4. [Reports & Analytics](#reports--analytics)
5. [Settings & Configuration](#settings--configuration)
6. [Data Management](#data-management)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

---

## 🚀 Getting Started

### System Requirements
- **Operating System**: Windows 10 or later
- **Memory**: 4GB RAM minimum
- **Storage**: 100MB available space
- **Display**: 1024x768 resolution minimum

### First Launch
1. Double-click the PayMaster icon to launch
2. The application will open to the main dashboard
3. Click "Add Employee" to create your first employee record
4. Access Settings (⚙️) to configure currency and company information

### Quick Start Guide
1. **Configure Settings**: Set your currency, company name, and date format
2. **Add Employees**: Create employee records with salary and insurance information
3. **Manage Payments**: Add adjustments and generate receipts
4. **Generate Reports**: View analytics and export data

---

## 👥 Employee Management

### Adding New Employees
1. Click **"Add Employee"** on the main dashboard
2. Fill in required information:
   - **Employee Name** (required)
   - **Position** (optional)
   - **Base Salary** (required)
   - **Insurance Amount** (required)
   - **Hire Date** (optional)
3. Click **"Add Employee"** to save

### Editing Employee Information
1. **From Dashboard**: Click the "Edit" button (📝) next to any employee
2. **From Employee View**: Click "Edit Employee" in the top-right corner
3. Modify any field as needed
4. Click **"Update Employee"** to save changes

> **Note**: Changes to salary or insurance will affect all future payments

### Removing Employees
1. Click the "Remove" button (🗑️) next to the employee
2. Confirm the deletion when prompted
3. Employee will be archived (soft delete) and hidden from active lists

### Employee Information Fields
- **Name**: Full employee name
- **Position**: Job title or role
- **Base Salary**: Monthly salary amount
- **Insurance**: Monthly insurance deduction
- **Hire Date**: Date employee was hired

---

## 💰 Payment Processing

### Understanding Payment Structure
Each employee's payment consists of:
- **Base Salary**: ✅ Added to total
- **Insurance**: ❌ Deducted from total
- **Adjustments**: ✅ or ❌ Added or deducted based on type

### Adding Payment Adjustments
1. Navigate to an employee's detail page
2. Click **"Add New Entry"** in the Payment Adjustments section
3. Enter:
   - **Description**: What the adjustment is for
   - **Amount**: Monetary value
   - **Type**: Select from dropdown (bonus, overtime, deduction, etc.)
4. Click **"Add Adjustment"**

### Adjustment Types
- **Bonus**: Performance bonus, holiday bonus
- **Overtime**: Extra hours compensation
- **Commission**: Sales commissions
- **Deduction**: Tax deductions, loan payments
- **Advance**: Salary advances (deducted)
- **Penalty**: Late penalties, policy violations

### Generating Receipts
1. From employee view, click **"Generate Receipt"**
2. Review the receipt details
3. Click **"Print"** to print immediately
4. Receipt is automatically saved to payment history

### Batch Receipt Generation
1. From dashboard, click **"Print Batch"**
2. Confirm printing for all employees
3. All receipts will be generated and sent to printer

---

## 📊 Reports & Analytics

### Accessing Reports
Click **"Reports"** on the main dashboard to access analytics

### Summary Dashboard
View key metrics:
- **Total Employees**: Current active employee count
- **Total Payroll**: Sum of all processed payments
- **Receipts Generated**: Number of receipts created
- **Average Salary**: Mean salary across all employees

### Available Reports
1. **Payroll Summary**: Overview of all employee payments
2. **Employee List**: Complete employee information
3. **Adjustments Report**: All payment adjustments made

### Generating Reports
1. Click the desired report button
2. Report opens in a new window
3. Use browser's print function to print
4. Report includes company branding and timestamp

### Analytics Tables
- **Employee Salary Analysis**: Individual employee payment breakdowns
- **Adjustment Types Summary**: Statistics by adjustment category

---

## ⚙️ Settings & Configuration

### Accessing Settings
Click the **Settings** button (⚙️) in the top-right corner

### Currency Configuration
- Select from 120+ supported currencies
- Changes apply to all monetary displays
- Existing data is preserved in original values

### Company Information
- **Company Name**: Appears on all receipts and reports
- Default: "PayMaster"
- Maximum 50 characters

### Date Format Options
- **US Format**: MM/DD/YYYY
- **European Format**: DD/MM/YYYY
- **ISO Format**: YYYY-MM-DD

### Saving Settings
1. Make desired changes
2. Click **"Save Settings"**
3. Settings apply immediately across the application

---

## 💾 Data Management

### Automatic Data Saving
- All data is automatically saved to local storage
- No manual save required
- Data persists between application sessions

### Creating Backups
1. Go to **Reports** > **Export Data**
2. Click **"Backup All Data"**
3. Save the `.json` file to a secure location
4. Backup includes all employees, payments, and settings

### Restoring from Backup
1. Go to **Reports** > **Export Data**
2. Click **"Restore Data"**
3. Select your backup `.json` file
4. Review backup contents
5. Click **"Restore Data"** to confirm

> **⚠️ Warning**: Restoring data replaces ALL current information

### Exporting Data
Available export formats:
- **Employee CSV**: Employee information for spreadsheets
- **Payments CSV**: Payment history for accounting
- **Adjustments CSV**: All adjustments made
- **Complete Backup**: Full data backup in JSON format

---

## 🔍 Troubleshooting

### Common Issues

#### Application Won't Start
- Ensure you have administrator privileges
- Check system requirements
- Restart your computer and try again

#### Data Not Saving
- Check available disk space
- Ensure PayMaster has write permissions
- Create a backup before troubleshooting

#### Receipts Not Printing
- Verify printer is connected and online
- Check printer drivers are installed
- Try printing from another application first

#### Currency Not Displaying Correctly
- Check Settings > Currency selection
- Verify browser locale settings
- Clear application cache if needed

#### Search Not Working
- Try typing more specific terms
- Check for spelling errors
- Restart the application if issues persist

### Performance Tips
- **Regular Backups**: Create monthly backups
- **Clean Data**: Remove old, unnecessary adjustments
- **Update Regularly**: Keep PayMaster updated
- **Restart Periodically**: Restart the app weekly for optimal performance

---

## 📞 Support

### Getting Help
For technical support and assistance:

📧 **Email Support**: [support@paymaster.com]
🌐 **Website**: [www.paymaster.com]
📚 **Documentation**: [docs.paymaster.com]

### Business Hours
- **Monday - Friday**: 9:00 AM - 6:00 PM EST
- **Response Time**: Within 24 hours
- **Emergency Support**: Available for critical issues

### What to Include in Support Requests
1. **PayMaster Version**: Found in About section
2. **Operating System**: Windows version
3. **Problem Description**: Detailed explanation
4. **Steps to Reproduce**: What you were doing when the issue occurred
5. **Screenshots**: If applicable

### License Information
PayMaster is commercial software. Each license allows installation on one computer for one business entity. For multi-user or enterprise licenses, contact our sales team.

### Version History
- **v1.0**: Initial release with core payroll features
- **v1.1**: Added insurance management
- **v1.2**: Enhanced reporting and analytics

---

## 📋 Quick Reference

### Keyboard Shortcuts
- **Ctrl + N**: Add new employee
- **Ctrl + S**: Save current form
- **Ctrl + P**: Print current view
- **Ctrl + F**: Search employees
- **Esc**: Close modal/cancel action

### Important File Locations
- **Data Storage**: Local browser storage
- **Backup Files**: User-selected location (.json)
- **Export Files**: Downloads folder (.csv)

### Emergency Procedures
1. **Data Loss**: Restore from most recent backup
2. **Corruption**: Clear application data and restore backup
3. **Application Crash**: Restart application, data should be preserved

---

*PayMaster - Professional Payroll Management Made Simple*

**© 2024 PayMaster. All rights reserved.**
