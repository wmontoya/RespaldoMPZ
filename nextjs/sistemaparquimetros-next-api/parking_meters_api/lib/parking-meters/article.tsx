import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const json = await sendRequest({
      req,
      endpoint: 'get_articles',
      method: 'POST'
    });

    if (!json.result?.success) {
      throw new Error(`Error desde Odoo: ${json.message}`);
    }

    const parsed = JSON.parse(json.result.data);
    const articles = (parsed.data || []).map((article: any) => ({
      Id: article.id,
      Article: article.article,
      Definition: article.definition,
      Title: article.title,
      Clauses: (article.clauses || []).map((clause: any) => ({
        Id: clause.id,
        Name: clause.name,
        Description: clause.description,
        Title: clause.title,
      })),
    }));

    return res.status(200).json({ success: true, data: articles });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
    });
  }
}
