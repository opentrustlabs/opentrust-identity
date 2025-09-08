This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## One-liner for the initialization process. This will generate a private key and certificate
## for use in initializaing the IdP

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout initialization.key -out initialization.crt -days 365
```

