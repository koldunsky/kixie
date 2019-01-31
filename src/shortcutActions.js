const { globalShortcut } = require('electron');

const registerGlobalShortcuts = () => {
// Регистрируем слушатель для сочетания клавиш 'CommandOrControl+X'.
  const ret = globalShortcut.register('CommandOrControl+X', () => {
    console.log('CommandOrControl+X is pressed')
  });

  if (!ret) {
    console.log('ошибка регистрации')
  }

  // Проверяем, было ли сочетание зарегистрировано.
  console.log(globalShortcut.isRegistered('CommandOrControl+X'))
};

const unregisterGlobalShortcuts = () => {
  // Отменяем регистрацию сочетания клавиш.
  globalShortcut.unregister('CommandOrControl+X')

  // Отменяем регистрацию всех сочетаний.
  globalShortcut.unregisterAll()
};

module.exports = {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts
};