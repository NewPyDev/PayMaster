const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        show: false, // Don't show until ready
        titleBarStyle: 'default'
    });

    // Load the app
    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Focus on window when shown
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Create application menu
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Employee',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('showAddEmployeeModal()');
                    }
                },
                {
                    label: 'Print Batch Receipts',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('printBatchReceipts()');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Backup Data',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('backupData()');
                    }
                },
                {
                    label: 'Restore Data',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('showRestoreModal()');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('showDashboard()');
                    }
                },
                {
                    label: 'Reports',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('showReportsView()');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('showSettings()');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export Employees (CSV)',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('exportToCSV("employees")');
                    }
                },
                {
                    label: 'Export Payments (CSV)',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('exportToCSV("payments")');
                    }
                },
                {
                    label: 'Export Adjustments (CSV)',
                    click: () => {
                        mainWindow.webContents.executeJavaScript('exportToCSV("adjustments")');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'User Manual',
                    click: () => {
                        // Open user manual in default browser
                        shell.openExternal('https://paymaster.com/manual');
                    }
                },
                {
                    label: 'Support',
                    click: () => {
                        shell.openExternal('mailto:support@paymaster.com');
                    }
                },
                { type: 'separator' },
                {
                    label: 'About PayMaster',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About PayMaster',
                            message: 'PayMaster v1.0.0',
                            detail: 'Professional Payroll Management System\n\nBuilt for small to medium businesses\nSimple, Fast, Professional\n\n© 2024 PayMaster. All rights reserved.',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: 'About ' + app.getName(),
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About PayMaster',
                            message: 'PayMaster v1.0.0',
                            detail: 'Professional Payroll Management System\n\nBuilt for small to medium businesses\nSimple, Fast, Professional\n\n© 2024 PayMaster. All rights reserved.',
                            buttons: ['OK']
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Services',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: 'Hide ' + app.getName(),
                    accelerator: 'Command+H',
                    click: () => {
                        app.hide();
                    }
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    click: () => {
                        app.hide();
                    }
                },
                {
                    label: 'Show All',
                    click: () => {
                        app.unhide();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
});

// Security: Prevent navigation to external sites
app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, url) => {
        const parsedUrl = new URL(url);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
});
