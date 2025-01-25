import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "dark",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "dark",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    // here localStorage is used because it is a synchronous operation
    // when accessing theme from browser storage it is an async operation and it will cause flickering on page load
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );
    const [first, setFirst] = useState(false);
    useLayoutEffect(() => {
        if (!first) {
            setFirst(true);
            window.browser.storage.local.get().then(({ theme: _theme }) => {
                if (_theme && typeof _theme === "string") setTheme(_theme as Theme);
                else window.browser.storage.local.set({ theme: theme });
            });
        }
    }, [first]);
    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");

        // if (theme === "system") {
        //     const systemTheme = window.matchMedia(
        //         "(prefers-color-scheme: dark)"
        //     ).matches
        //         ? "dark"
        //         : "light";

        //     root.classList.add(systemTheme);
        //     return;
        // }

        root.classList.add(theme);
    }, [theme]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            window.browser.storage.local.set({ theme });
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
