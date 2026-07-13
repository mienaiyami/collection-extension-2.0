import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCollectionOperations } from "@/hooks/useCollectionOperations";
import { AppWindow } from "lucide-react";
import { type ClipboardEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    getImageFileFromDataTransfer,
    getSafeItemImageSrc,
    parseItemUrl,
    readImageFileAsDataUrl,
} from "./edit-item";

type EditCollectionItemDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: UUID;
    item: CollectionItem;
};

/**
 * Dialog to edit a collection item's title, URL, and image (URL, upload, or clipboard paste).
 * Save commits all three fields together via {@link useCollectionOperations.updateCollectionItem}.
 */
const EditCollectionItemDialog = ({
    open,
    onOpenChange,
    collectionId,
    item,
}: EditCollectionItemDialogProps) => {
    const { t } = useTranslation();
    const operations = useCollectionOperations();
    const [title, setTitle] = useState(item.title);
    const [url, setUrl] = useState(item.url);
    const [img, setImg] = useState(item.img);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTitle(item.title);
        setUrl(item.url);
        setImg(item.img);
        setPreviewFailed(false);
        setSaving(false);
    }, [open, item.title, item.url, item.img]);

    const applyImageFile = async (file: File) => {
        const dataUrl = await readImageFileAsDataUrl(file);
        if (!dataUrl) {
            toast.error(t("messages.invalidItemImageUpload"));
            return;
        }
        setImg(dataUrl);
        setPreviewFailed(false);
    };

    /** Prefer clipboard image over text when pasting into the image fields/preview. */
    const onImagePaste = (e: ClipboardEvent) => {
        const file = getImageFileFromDataTransfer(e.clipboardData);
        if (!file) return;
        e.preventDefault();
        void applyImageFile(file);
    };

    const onSave = async () => {
        const parsedUrl = parseItemUrl(url);
        if (!parsedUrl) {
            toast.error(t("messages.invalidItemUrl"));
            return;
        }
        const trimmedImg = img.trim();
        const safeImg = trimmedImg === "" ? "" : getSafeItemImageSrc(img);
        if (safeImg === null) {
            toast.error(t("messages.invalidItemImage"));
            return;
        }

        setSaving(true);
        const response = await operations.updateCollectionItem(collectionId, item.id, {
            title: title.trim(),
            url: parsedUrl,
            img: safeImg,
        });
        setSaving(false);
        if (response.success) onOpenChange(false);
    };

    const previewSrc = getSafeItemImageSrc(img);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-sm sm:max-w-md"
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{t("collections.editItem")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                    <div
                        className="grid h-28 w-full place-items-center overflow-hidden rounded-md border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        tabIndex={0}
                        onPaste={onImagePaste}
                        title={t("collections.itemImagePasteHint")}
                    >
                        {previewSrc && !previewFailed ? (
                            <img
                                src={previewSrc}
                                alt=""
                                className="max-h-28 max-w-full object-contain p-1"
                                onError={() => setPreviewFailed(true)}
                                onLoad={() => setPreviewFailed(false)}
                            />
                        ) : (
                            <AppWindow className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {t("collections.itemImagePasteHint")}
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-item-title">{t("collections.itemTitle")}</Label>
                        <Input
                            id="edit-item-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-item-url">{t("collections.itemUrl")}</Label>
                        <Input
                            id="edit-item-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="edit-item-img">{t("collections.itemImageUrl")}</Label>
                        <Input
                            id="edit-item-img"
                            value={img.startsWith("data:image/") ? "" : img}
                            placeholder={
                                img.startsWith("data:image/")
                                    ? t("collections.itemImageUploadedPlaceholder")
                                    : t("collections.itemImageUrlPlaceholder")
                            }
                            onChange={(e) => {
                                setImg(e.target.value);
                                setPreviewFailed(false);
                            }}
                            onPaste={onImagePaste}
                            autoComplete="off"
                        />
                        <div className="flex flex-wrap gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                className="max-w-full cursor-pointer text-sm file:mr-2"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = "";
                                    if (!file) return;
                                    await applyImageFile(file);
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setImg("");
                                    setPreviewFailed(false);
                                }}
                            >
                                {t("collections.clearItemImage")}
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("common.cancel")}
                    </Button>
                    <Button type="button" disabled={saving} onClick={() => void onSave()}>
                        {t("common.save")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCollectionItemDialog;
