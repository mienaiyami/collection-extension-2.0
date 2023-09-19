import fs from "fs";
import querystring from "querystring";
const publishUpdate = async (token: string) => {
    const productID = "ec4f1f74-fb61-474b-b553-1866c924a7f9";
    const url = `https://api.addons.microsoftedge.microsoft.com/v1/products/${productID}/submissions/draft/package`;
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/zip",
    };
    const file = fs.readFileSync("./build.zip");
    try {
        console.log("Publishing...");
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: file,
        });
        console.log({
            status: response.status,
            statusText: response.statusText,
        });
    } catch (error) {
        console.error(error);
    }
};

const getToken = async () => {
    const url =
        "https://login.microsoftonline.com/5c9eedce-81bc-42f3-8823-48ba6258b391/oauth2/v2.0/token";
    const client_id = "fe04991b-ba8b-40fc-83d3-fa55cb2ee2ed";
    const client_secret = process.env.MS_SECRET;
    if (!client_secret) {
        console.error("Secret not found in process env.");
        process.exit(1);
    }
    const data = {
        grant_type: "client_credentials",
        client_id,
        client_secret,
        scope: "https://api.addons.microsoftedge.microsoft.com/.default",
    };
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };
    try {
        const res = await fetch(url, {
            method: "POST",
            headers,
            body: querystring.stringify(data),
        });
        const jsonRes = await res.json();
        if (jsonRes.access_token) {
            console.log("Got the token.");
            return jsonRes.access_token as string;
        } else {
            console.error("Couldn't get the token");
            process.exit(1);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

if (fs.existsSync("./build.zip")) getToken().then((e) => publishUpdate(e));
else {
    console.error("build.zip not found.");
    process.exit(1);
}
