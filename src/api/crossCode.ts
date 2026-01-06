import { odataClient } from './odataClient'
import {fetchProducerById} from './producers.ts';

export interface CrossCodeItem {
  Id: number
  Cross: number
  CrossCode: string
  MainCode: string
  By: number
  ByCode: string
  Verity: number
  SessionId: number
  Deleted: boolean
  IsMainNew: boolean
  Date: string
}

export type CodeNode = {
  id: number
  code: string
  verity: number
  date: string
}

export type BrandNode = {
  brandId: number
  brandName: string
  codes: CodeNode[]
}

export type CrossTree = {
  mainCode: string
  brands: BrandNode[]
}

export async function fetchAllByMainCode(
  mainCode: string,
  signal?: AbortSignal
): Promise<CrossCodeItem[]> {
  const allItems: CrossCodeItem[] = [];

  // Первый запрос через list
  const response = await odataClient.list<CrossCodeItem>(
    'CrTCrosses',
    { filter: `MainCode eq '${mainCode}'` },
    { signal }
  );

  if (response.value) {
    allItems.push(...response.value);
  }

  // Проверяем наличие nextLink
  let nextLink = (response as any)['@odata.nextLink'];

  // Запрашиваем последующие страницы
  while (nextLink) {
    try {
      const nextResponse = await odataClient.fetchByUrl<any>(
        nextLink,
        { signal }
      );

      if (nextResponse.value) {
        allItems.push(...nextResponse.value);
      }

      // Обновляем nextLink для следующей итерации
      nextLink = (nextResponse as any)['@odata.nextLink'];
    } catch (error) {
      console.error('Ошибка при получении следующей страницы:', error);
      break;
    }
  }

  return allItems;
}


// async function fetchByMainCode(
//   mainCode: string,
//   signal?: AbortSignal
// ): Promise<CrossCodeItem[]> {
//   const res = await odataClient.list<CrossCodeItem>(
//     'CrTCrosses',
//     { filter: `MainCode eq '${mainCode}'` },
//     { signal }
//   )
//
//   return res.value
// }


export async function buildTree(items: CrossCodeItem[]): Promise<CrossTree | null> {
  const rootItem = items.find(i => i.MainCode === i.CrossCode);
  if (!rootItem) return null;

  const brands = new Map<number, BrandNode>();

  // Собираем уникальные brandId
  const brandIds = Array.from(new Set(items.map(i => i.Cross)));

  // Загружаем производителей параллельно
  const producers = await Promise.all(
    brandIds.map(id => fetchProducerById(id))
  );

  const producerMap = new Map<number, string>();
  producers.forEach(p => {
    producerMap.set(p.Id, p.Name ?? `ID ${p.Id}`);
  });

  items.forEach(item => {
    if (item.CrossCode === rootItem.CrossCode) return;

    const brandName = producerMap.get(item.Cross) ?? `ID ${item.Cross}`;

    if (!brands.has(item.By)) {
      brands.set(item.By, {
        brandId: item.By,
        brandName,
        codes: []
      });
    }

    brands.get(item.By)!.codes.push({
      id: item.Id,
      code: item.CrossCode,
      verity: item.Verity,
      date: item.Date // если у тебя есть дата
    });
  });

  return {
    mainCode: rootItem.CrossCode,
    brands: Array.from(brands.values())
  };
}


export async function findTreeByCode(
  mainCode: string,
  signal?: AbortSignal
): Promise<CrossTree | null> {
  const items = await fetchAllByMainCode(mainCode.trim(), signal)
  if (!items.length) return null

  return buildTree(items)
}

