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



##### One-liner for the initialization process. This will generate a private key and certificate for use in initializaing the IdP

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout initialization.key -out initialization.crt -days 365
```

#### To create the 2 search indexes in OpenSearch, use the following HTTP calls:

##### Object search

PUT   /iam_object_search

with the contents of the file at `/scripts/object-search-ddl.json`

You can also create an index with a different name than `object_search` (for example `object_search_09_22_2025`) and then create
an alias to the index `object_search`. For example

```JSON
POST _aliases
{
  "actions": [
    {
      "add": {
        "index": "object_search_09_22_2025",
        "alias": "iam_object_search",
        "is_write_index": true 
      }
    }
  ]
}
```

You can remove an alias with the following request:

```JSON
POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "object_search_09_22_2025",
        "alias": "iam_object_search"
      }
    }
  ]
}
```

##### Rel search

PUT  /iam_rel_search

with the contents of the file at `/scripts/rel-search-ddl.json`

You can also create an index with a different name than `rel` (for example `rel_search_09_22_2025`) and then create
an alias to the index `rel_search`.

```JSON
POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "rel_search_09_22_2025",
        "alias": "iam_rel_search"
      }
    }
  ]
}
```


Note that creating the initial index using a time (or date) stamp and then creating an alias is generally the way
to go. You have a much easier path to upgrading the indexes over time.