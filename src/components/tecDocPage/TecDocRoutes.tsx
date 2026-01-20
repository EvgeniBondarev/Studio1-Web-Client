import { Routes, Route } from 'react-router-dom';
import {SearchArticlesPage} from './search/articles/SearchArticlesPage.tsx';
import {SearchSuppliersPage} from './search/suppliers/SearchSuppliersPage.tsx';
import {TecDocPage} from './TecDocPage.tsx';
import {ArticleDetailPage} from './detailpage/articles';
import {SupplierDetailPage} from './detailpage/suppliers';

export function TecDocRoutes() {
  return (
    <Routes>
      <Route index element={<TecDocPage />} />
      <Route path="/tecdoc" element={<TecDocPage />} />
      <Route path="/tecdoc/search/articles" element={<SearchArticlesPage />} />
      <Route path="/tecdoc/search/suppliers" element={<SearchSuppliersPage />} />
      <Route path="/tecdoc/articles/:supplierId/:articleNumber/*" element={<ArticleDetailPage />} />
      <Route path="/tecdoc/suppliers/:supplierId/*" element={<SupplierDetailPage />} />
    </Routes>
  );
}
