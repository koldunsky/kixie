const { globalShortcut } = require('electron');

const registerGlobalShortcuts = () => {
// Регистрируем слушатель для сочетания клавиш 'CommandOrControl+G'.
  const ret = globalShortcut.register('CommandOrControl+G', () => {
    console.log('CommandOrControl+G is pressed')
  });

  if (!ret) {
    console.log('ошибка регистрации')
  }

  // Проверяем, было ли сочетание зарегистрировано.
  console.log(globalShortcut.isRegistered('CommandOrControl+G'))
};

const unregisterGlobalShortcuts = () => {
  // Отменяем регистрацию сочетания клавиш.
  globalShortcut.unregister('CommandOrControl+G')

  // Отменяем регистрацию всех сочетаний.
  globalShortcut.unregisterAll()
};

module.exports = {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts
};
