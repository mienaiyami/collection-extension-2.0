import "i18next";
import type { Resources } from "./config";

type TranslationResource = Resources["en"];

declare module "i18next" {
    interface CustomTypeOptions {
        resources: TranslationResource;
    }
}
