export type CollectionOperation =
    | {
          type: "MAKE_NEW_COLLECTION";
          payload: {
              title: string;
              items?: CollectionItem[];
              fillByData?: {
                  activeTabId?: number;
                  activeWindowId?: number;
              };
          };
          response: { collection: Collection };
      }
    | {
          type: "REMOVE_COLLECTIONS";
          payload: UUID | UUID[];
          response: { removedCollections: string[] };
      }
    | {
          type: "ADD_TO_COLLECTION";
          payload: {
              collectionId: UUID;
              items: CollectionItem | CollectionItem[];
          };
      }
    | {
          type: "ADD_TAB_TO_COLLECTION";
          payload: {
              collectionId: UUID;
              /** required because by the time its queried in background.ts another tab might be active */
              tabId: number;
          };
      }
    | {
          type: "ADD_ALL_TABS_TO_COLLECTION";
          payload: {
              collectionId: UUID;
              /** required because by the time its queried in background.ts another window might be active */
              windowId: number;
          };
      }
    | {
          type: "REMOVE_FROM_COLLECTION";
          payload: { collectionId: UUID; itemId: UUID | UUID[] };
      }
    | {
          type: "RENAME_COLLECTION";
          payload: { id: UUID; newName: string };
          response: {
              oldName: string;
              newName: string;
          };
      }
    | {
          type: "CHANGE_COLLECTION_ORDER";
          payload: UUID[];
      }
    | {
          type: "CHANGE_COLLECTION_ITEM_ORDER";
          payload: { colID: UUID; newOrder: UUID[] };
      }
    | {
          type: "EXPORT_DATA";
          payload?: never;
          response: { data: Collection[] };
      }
    | {
          type: "IMPORT_DATA";
          payload: Collection[];
      }
    | {
          type: "RESTORE_BACKUP";
          payload?: never;
      }
    | {
          type: "CREATE_LOCAL_BACKUP";
          payload?: never;
          response: {
              date: string;
          };
      }
    | {
          type: "SET_COLLECTIONS_DANGEROUSLY";
          payload: Collection[];
      }
    | {
          type: "SET_APP_SETTING";
          payload: Partial<AppSettingType>;
      }
    | {
          type: "GOOGLE_DRIVE_LOGIN_STATUS";
          payload?: never;
          response: { isLoggedIn: boolean };
      }
    | {
          type: "LOGIN_GOOGLE_DRIVE";
          payload?: never;
      }
    | {
          type: "LOGOUT_GOOGLE_DRIVE";
          payload?: never;
      }
    | {
          type: "GOOGLE_DRIVE_USER_INFO";
          payload?: never;
          response: GoogleDriveUserData | null;
      }
    | {
          type: "GOOGLE_DRIVE_SYNC_NOW";
          payload?: never;
      }
    | {
          type: "GET_GOOGLE_DRIVE_SYNC_STATE";
          payload?: never;
          response: SyncState;
      }
    | {
          type: "DELETE_ALL_LOCAL_COLLECTIONS_DATA";
          payload?: never;
      }
    | {
          type: "DELETE_ALL_GDRIVE_SYCNED_COLLECTION_DATA";
          payload?: never;
      };

export type BrowserMessage<T = unknown, R = unknown> = {
    type: string;
    payload?: T;
    response?: R;
};

export type CollectionMessage = BrowserMessage & CollectionOperation;

type OptionalResponseData<T> = T extends { response: unknown }
    ? { data: T["response"] }
    : { data?: never };

export type MessageResponse<
    T extends BrowserMessage = {
        type: string;
        payload?: unknown;
        response?: unknown;
    }
> =
    | ({
          success: true;
          message?: string;
      } & OptionalResponseData<T>)
    | {
          success: false;
          error: string;
      };

// export type CollectionResponse<T extends CollectionOperation> =
//     | ({
//           success: true;
//       } & OptionalResponseData<T>)
//     | {
//           success: false;
//           error: string;
//       };

export type OperationResponse<T extends BrowserMessage["type"]> = Promise<
    MessageResponse<Extract<BrowserMessage, { type: T }>>
>;
export type CollectionOperationResponse<T extends CollectionOperation["type"]> = T extends T
    ? Promise<MessageResponse<Extract<CollectionOperation, { type: T }>>>
    : never;
