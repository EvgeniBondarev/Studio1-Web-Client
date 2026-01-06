import { odataClient } from './odataClient'
import {fetchProducerById} from './producers.ts';
import {fetchPartsPageWithoutProducer} from './parts.ts';
import type {EtProducer} from './types.ts';

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
  producer?: EtProducer
  codes: CodeNode[]
}

export type CrossTree = {
  mainCode: string
  mainProducer?: EtProducer
  brands: BrandNode[]
}

const CROSS_PAGE_SIZE = 500;
const CROSS_MAX_ITEMS = 2000; // ограничение на количество элементов, чтобы ускорить загрузку

export async function fetchAllByMainCode(
  mainCode: string,
  signal?: AbortSignal,
  maxItems: number = CROSS_MAX_ITEMS,
): Promise<CrossCodeItem[]> {
  const allItems: CrossCodeItem[] = [];

  // Первый запрос через list с увеличенным page size
  const response = await odataClient.list<CrossCodeItem>(
    'CrTCrosses',
    { filter: `MainCode eq '${mainCode}'`, top: CROSS_PAGE_SIZE },
    { signal },
  );

  if (response.value) {
    allItems.push(...response.value);
  }

  // Проверяем наличие nextLink
  let nextLink = (response as any)['@odata.nextLink'];

  // Запрашиваем последующие страницы, но не больше maxItems
  while (nextLink && allItems.length < maxItems) {
    try {
      const nextResponse = await odataClient.fetchByUrl<any>(nextLink, { signal });

      if (nextResponse.value) {
        const remaining = maxItems - allItems.length;
        // Добавляем только то, что помещается в лимит
        allItems.push(...nextResponse.value.slice(0, remaining));
      }

      // Если достигли лимита, прекращаем
      if (allItems.length >= maxItems) {
        break;
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
  if (!items.length) return null;

  // Главный код - это MainCode из первого элемента
  const mainCode = items[0].MainCode;

  // Находим деталь по MainCode, чтобы получить ProducerId
  let mainProducer: EtProducer | undefined;
  try {
    const partsPage = await fetchPartsPageWithoutProducer(mainCode, 'exact');
    const mainPart = partsPage.items.find(p => p.Code === mainCode);
    if (mainPart?.ProducerId) {
      mainProducer = await fetchProducerById(mainPart.ProducerId).catch(() => undefined);
    }
  } catch (error) {
    console.error('Ошибка при загрузке производителя главного кода:', error);
  }

  const brands = new Map<number, BrandNode>();

  // Собираем уникальные brandId из поля Cross (производитель кросс-кода)
  const brandIds = Array.from(new Set(items.map(i => i.Cross)));

  // Загружаем производителей параллельно
  const producers = await Promise.all(
    brandIds.map(id => fetchProducerById(id).catch(() => null))
  );

  const producerMap = new Map<number, EtProducer>();
  producers.forEach((p, index) => {
    if (p) {
      producerMap.set(brandIds[index], p);
    }
  });

  // Группируем по производителю (Cross)
  items.forEach(item => {
    const producer = producerMap.get(item.Cross);
    const name = producer?.Name ?? `ID ${item.Cross}`;
    const prefix = producer?.Prefix ?? producer?.MarketPrefix ?? name;
    const brandName = producer 
      ? `${name.toLowerCase()} (${prefix})`
      : `ID ${item.Cross}`;

    if (!brands.has(item.Cross)) {
      brands.set(item.Cross, {
        brandId: item.Cross,
        brandName,
        producer,
        codes: []
      });
    }

    brands.get(item.Cross)!.codes.push({
      id: item.Id,
      code: item.CrossCode,
      verity: item.Verity,
      date: item.Date
    });
  });

  return {
    mainCode,
    mainProducer,
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

