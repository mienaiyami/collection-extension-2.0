import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/theme-provider";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const ThemeSetting = () => {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();
    return (
        <div className="flex flex-row items-center gap-2 rounded-md border p-2">
            <span className="font-semibold">{t("settings.theme")}</span>
            <Button
                variant={"outline"}
                className="ml-auto flex flex-row items-center gap-2"
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
