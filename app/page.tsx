"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";



/*

    Logic for the Home component.

    1.  The root URL ( i.e. / ) is NOT a valid page. All page views will be under
        some tenant id (this DOES NOT includes the login page See explaination in #2)

    2.  If somebody comes to this HOME page, and has NO VALID token, and we do NOT have
        any information saved about them in their local storage, then redirect them to 
        the default login page which has NO tenant id, client id, etc in the URL params.
        Instead, the URL params will include: _pa=true. The user will enter their
        email and the system will check to see if the domain of the email tied to the 
        management of a tenant. If not, then error. Otherwise, does the domain use 
        a federated OIDC provider? If yes, then use that for authentication. Otherwise
        prompt for a password (and perhaps additional authentication factors). Set
        the tenant and other information in the localstorage of the browser.

        If the user has authenticated before to this management console, but does not
        currently have a valid token (maybe expired or missing) then we will
        look at their local storage to see which tenant (and possibly federaed oidc provider)
        they used previously for authentication and redirect to the /authorization page
        with that tenant, client, state, response type, return-to-uri, etc. 

        If the user has a valid token, then we will redirect them to the landing
        page for their tenant.

        Side note: All authorization calls will use the tenat id in the URL (see
        the /pages/[tenant_id]/api directory for an example).

        

*/


const Home: React.FC = () => {

    useEffect(
        () => {
            console.log("checkpoint 1");
            document.title = "This is the age"
        },
        []
    );

    console.log("checkpoint 2")
  return (
    
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.tsx</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

export default Home;