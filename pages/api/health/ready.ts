import type { NextApiRequest, NextApiResponse } from 'next'
import { DaoFactory } from '@/lib/data-sources/dao-factory';
import OpenSearchDao from '@/lib/dao/impl/search/open-search-dao';
import SearchDao from '@/lib/dao/search-dao';
import { SearchResultType } from '@/graphql/generated/graphql-types';

const searchDao: SearchDao = new OpenSearchDao();

const {
    HEALTH_CHECK_ENABLED,
    HEALTH_CHECK_DB_ENABLED,
    HEALTH_CHECK_SEARCH_ENABLED,
} = process.env;

type CheckStatus = 'ok' | 'skipped' | 'error';

interface ReadyResponse {
    status: 'ready' | 'unavailable';
    checks: {
        database: CheckStatus;
        search: CheckStatus;
    };
}

async function checkDatabase(): Promise<CheckStatus> {
    const tenantDao = DaoFactory.getInstance().getTenantDao();
    try{
        await tenantDao.getSystemSettings();
        return 'ok';
    }
    catch{
        return 'error';
    }

}

async function checkSearch(): Promise<CheckStatus> {
    try {
        await searchDao.objectSearch({page: 1, perPage: 1, resultType: SearchResultType.Tenant}, []);
        return 'ok';
        
    }
    catch {
        return 'error';
    }
}

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse<ReadyResponse>
) {
    if (HEALTH_CHECK_ENABLED !== 'true') {
        return res.status(404).end();
    }

    const dbEnabled = HEALTH_CHECK_DB_ENABLED === 'true';
    const searchEnabled = HEALTH_CHECK_SEARCH_ENABLED === 'true';

    const [dbStatus, searchStatus] = await Promise.all([
        dbEnabled ? checkDatabase() : Promise.resolve<CheckStatus>('skipped'),
        searchEnabled ? checkSearch() : Promise.resolve<CheckStatus>('skipped'),
    ]);

    const anyFailed =
        (dbEnabled && dbStatus === 'error') ||
        (searchEnabled && searchStatus === 'error');

    const body: ReadyResponse = {
        status: anyFailed ? 'unavailable' : 'ready',
        checks: {
            database: dbStatus,
            search: searchStatus,
        },
    };

    return res.status(anyFailed ? 503 : 200).json(body);
}
