const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    require: (module) => {
        try {
          return require(module);
        } catch (e) {
          console.error(e);
        }
      },
    createNote: (data) => ipcRenderer.invoke('create-file', data),
    title: "Test Title",
})


// require: (module) => {
//     try {
//       return require(module);
//     } catch (e) {
//       console.error(e);
//     }
//   },