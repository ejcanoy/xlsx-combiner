const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }

    });

    ipcMain.handle('create-file', (req, data) => {
        if (!data) return false;

        // Get the current year, month, day, hour, minute, and second
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        // Concatenate the date and time values into a single string
        const timestamp = `${year}-${month}-${day}_${hour}-${minute}-${second}`;

        // Use the timestamp in a file name, for example:
        const fileName = `combined_${timestamp}.csv`;
        const filePath = path.join(os.homedir(), 'Downloads', fileName);
        fs.writeFileSync(filePath, data.content);
        return { success: true, filePath };
    })

    win.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});