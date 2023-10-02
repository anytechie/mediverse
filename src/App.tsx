import { useState } from 'react';
import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';
import { DemoApp } from './DemoApp';
const App = () => {
  const [smoothButtonsTransition, setSmoothButtonsTransition] = useState(false);

  return (
    <WebAppProvider options={{ smoothButtonsTransition }}>
      <DemoApp
        onChangeTransition={() => setSmoothButtonsTransition(state => !state)} />
    </WebAppProvider>
  );
};

export default App;