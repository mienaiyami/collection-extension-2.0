import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/theme-provider";
import { useTranslation } from "react-i18next";

const ThemeSetting = () => {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();
    return (
        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
            <span className="font-semibold">{t("settings.theme")}</span>
            <Button
                variant={"outline"}
                className="flex flex-row gap-2 items-center ml-auto"
                onClick={() => {
                    if (theme === "dark") setTheme("light");
                    else setTheme("dark");
                }}
            >
                {theme === "dark" ? <Moon /> : <Sun />}{" "}
                {theme === "dark" ? t("settings.dark") : t("settings.light")}
            </Button>
        </div>
    );
};

export default ThemeSetting;
