import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/theme-provider";
const ThemeSetting = () => {
    const { theme, setTheme } = useTheme();
    return (
        <div className="flex flex-row items-center gap-2 p-2 border rounded-md">
            <span className="font-semibold">Theme</span>
            <Button
                variant={"outline"}
                className="flex flex-row gap-2 items-center ml-auto"
                onClick={() => {
                    if (theme === "dark") setTheme("light");
                    else setTheme("dark");
                }}
            >
                {theme === "dark" ? <Moon /> : <Sun />} {theme === "dark" ? "Dark" : "Light"}
            </Button>
        </div>
    );
};

export default ThemeSetting;
