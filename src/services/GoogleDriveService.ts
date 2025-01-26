import { collectionSchema } from "@/utils";
import { GoogleAuthService } from "./GoogleAuthService";
import { z } from "zod";

const BACKUP_FILE_NAME = "collections-backup.json";

export class GoogleDriveService {
    private static readonly MAX_RETRIES = 3;
    private static readonly INITIAL_RETRY_DELAY = 1000;
    private static async findBackupFile(token: string): Promise<string | null> {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILE_NAME}'`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to search files: ${response.statusText}`);
        }

        const data = await response.json();
        return data.files?.[0]?.id || null;
    }

    static async uploadBackup(collections: Collection[]): Promise<void> {
        let retryCount = 0;
        while (retryCount < this.MAX_RETRIES) {
            try {
                const token = await GoogleAuthService.getValidToken();
                const fileId = await this.findBackupFile(token);

                const metadata = {
                    name: BACKUP_FILE_NAME,
                    mimeType: "application/json",
                };
                const body = JSON.stringify(collections);

                const form = new FormData();
                form.append(
                    "metadata",
                    new Blob([JSON.stringify(metadata)], { type: "application/json" })
                );
                form.append("file", new Blob([body], { type: "application/json" }));

                const url = fileId
                    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
                    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

                const response = await fetch(url, {
                    method: fileId ? "PATCH" : "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: form,
                });
                if (response.status === 403) {
                    throw new Error("Quota exceeded");
                }

                if (!response.ok) {
                    throw new Error("Failed to upload backup to Google Drive");
                }
            } catch (error) {
                retryCount++;
                if (retryCount > this.MAX_RETRIES) {
                    throw error;
                }
                const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
                console.error(`Error uploading backup: ${error}. Retrying in ${delay}ms`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    static async checkValidCollectionData(data: unknown): Promise<boolean> {
        try {
            const schema = z.array(collectionSchema);
            schema.parse(data);
            return true;
        } catch (error) {
            return false;
        }
    }

    static async downloadBackup(): Promise<Collection[]> {
        let retryCount = 0;
        try {
            const token = await GoogleAuthService.getValidToken();
            const fileId = await this.findBackupFile(token);

            if (!fileId) {
                throw new Error("No backup found on Google Drive");
            }

            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log({ response });
            if (!response.ok) {
                throw new Error("Failed to download backup from Google Drive");
            }
            const data = await response.json();
            if (!(await this.checkValidCollectionData(data))) {
                throw new Error("Invalid backup data");
            }
            console.log(data);
            return data;
        } catch (error) {
            retryCount++;
            if (retryCount > this.MAX_RETRIES) {
                throw error;
            }
            const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
            console.error(`Error downloading backup: ${error}. Retrying in ${delay}ms`);
            return await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}
