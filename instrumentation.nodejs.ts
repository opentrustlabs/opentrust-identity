import { readFileSync } from "node:fs"


export function registerNodeInstrumentation() {
    const fileContents = readFileSync("C:\\Users\\David\\projects\\open-certs\\notes-on-authentication-and-registration-flows.txt");
    const s = fileContents.toString("utf-8");
    console.log(s);

    // TODO
    // Add nodenv to load environment variables dynamically, without
    // the variables needing to be there at build time.
    

}