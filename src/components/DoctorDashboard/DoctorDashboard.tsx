import { DispatchWithoutAction, FC } from "react";
import {
  useThemeParams,
} from "@vkruglikov/react-telegram-web-app";

import { ConfigProvider, theme } from "antd";
export const RegisterPatient: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const [colorScheme, themeParams] = useThemeParams();

  return (
    <div>
      <ConfigProvider
        theme={
          themeParams.text_color
            ? {
                algorithm:
                  colorScheme === "dark"
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
                token: {
                  colorText: themeParams.text_color,
                  colorPrimary: themeParams.button_color,
                  colorBgBase: themeParams.bg_color,
                },
              }
            : undefined
        }
      >
        Hello world
      </ConfigProvider>
    </div>
  );
};
