import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type Language = {
    code: string;
    name: string;
    nativeName: string;
};

const languages: Language[] = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    // Add more languages as they become available
    // { code: 'fr', name: 'French', nativeName: 'Français' },
    // { code: 'de', name: 'German', nativeName: 'Deutsch' },
    // { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    // { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
];

const LanguageSetting = () => {
    const { t, i18n } = useTranslation();

    const currentLanguage =
        languages.find((lang) => lang.code === i18n.language) || languages[0];

    const changeLanguage = (languageCode: string) => {
        i18n.changeLanguage(languageCode);
    };

    return (
        <div className="flex flex-col gap-2 rounded-md border p-2">
            <div className="flex flex-row items-center gap-2">
                <span className="font-semibold">{t("settings.language")}</span>
                <div className="ml-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex min-w-[140px] flex-row items-center justify-between gap-2"
                            >
                                <span>{currentLanguage.nativeName}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-[200px]"
                        >
                            {languages.map((language) => (
                                <DropdownMenuItem
                                    key={language.code}
                                    onClick={() =>
                                        changeLanguage(language.code)
                                    }
                                    className="flex flex-row items-center justify-between"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">
                                            {language.nativeName}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {language.name}
                                        </span>
                                    </div>
                                    {i18n.language === language.code && (
                                        <Check className="ml-2 h-4 w-4" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};

export default LanguageSetting;
