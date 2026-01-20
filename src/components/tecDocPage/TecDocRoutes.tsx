import { Routes, Route } from 'react-router-dom';
import {SearchArticlesPage} from './search/articles/SearchArticlesPage.tsx';
import {SearchSuppliersPage} from './search/suppliers/SearchSuppliersPage.tsx';
import {TecDocPage} from './TecDocPage.tsx';
import {ArticleDetailPage} from './detailpage/articles';
import {SupplierDetailPage} from './detailpage/suppliers';
import {ROUTE_TEC_DOC} from './constants/routes.ts';

export function TecDocRoutes() {
  return (
    <Routes>
      <Route index element={<TecDocPage />} />
      <Route path={ROUTE_TEC_DOC.INDEX} element={<TecDocPage />} />
      <Route path={ROUTE_TEC_DOC.SEARCH_ARTICLES} element={<SearchArticlesPage />} />
      <Route path={ROUTE_TEC_DOC.SEARCH_SUPPLIERS} element={<SearchSuppliersPage />} />
      <Route path={ROUTE_TEC_DOC.ARTICLE_DETAIL} element={<ArticleDetailPage />} />
      <Route path={ROUTE_TEC_DOC.SUPPLIER_DETAIL} element={<SupplierDetailPage />} />
    </Routes>
  );
}
