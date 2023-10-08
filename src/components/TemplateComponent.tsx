import { DispatchWithoutAction, FC, useEffect } from "react";
import "./PatientDashboard.scss";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useThemeParams } from "@vkruglikov/react-telegram-web-app";

export const Template: FC<{
  onChangeTransition: DispatchWithoutAction;
}> = () => {
  const navigate = useNavigate();
  const [colorScheme, themeParams] = useThemeParams();


  useEffect(() => {
    const handleBackButtonClick = () => {
      navigate(-1);
    };
    Telegram.WebApp.onEvent("backButtonClicked", handleBackButtonClick);
    Telegram.WebApp.BackButton.show();
    return () => {
      Telegram.WebApp.offEvent("backButtonClicked", handleBackButtonClick);
      Telegram.WebApp.BackButton.hide();
    };
  }, [navigate]);

  return (
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

    </ConfigProvider>
  );
};

export default Template;
