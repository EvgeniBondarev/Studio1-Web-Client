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

export type ProducerNode = {
  type: 'producer'
  cross: number
  producer?: EtProducer
  children: CrossTreeNode[]
}


export type CrossTreeNode = {
  type: 'code'
  id: number
  code: string
  by: number
  byCode: string
  cross: number
  crossCode: string
  verity: number
  date: string
  children: TreeNode[]
}

export type TreeNode = ProducerNode | CrossTreeNode


export type CrossTree = {
  mainCode: string
  mainProducer?: EtProducer
  nodes: TreeNode[]
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


type IndexKey = string

function makeKey(by: number, byCode: string): IndexKey {
  return `${by}|${byCode}`
}

function indexItems(items: CrossCodeItem[]) {
  const index = new Map<IndexKey, CrossCodeItem[]>()

  for (const item of items) {
    const key = makeKey(item.By, item.ByCode)
    if (!index.has(key)) {
      index.set(key, [])
    }
    index.get(key)!.push(item)
  }

  return index
}



async function buildNodes(
  parentBy: number,
  parentCode: string,
  index: Map<string, CrossCodeItem[]>,
  producerMap: Map<number, EtProducer>,
  visited = new Set<number>()
): Promise<TreeNode[]> {

  const key = makeKey(parentBy, parentCode)
  const items = index.get(key) ?? []

  // группируем по Cross (producer)
  const grouped = new Map<number, CrossCodeItem[]>()

  for (const item of items) {
    if (!grouped.has(item.Cross)) {
      grouped.set(item.Cross, [])
    }
    grouped.get(item.Cross)!.push(item)
  }

  const result: TreeNode[] = []

  // producer → crossCode → children
  for (const [cross, crossItems] of grouped) {
    const producer = producerMap.get(cross)

    const producerNode: ProducerNode = {
      type: 'producer',
      cross,
      producer,
      children: []
    }

    for (const item of crossItems) {
      if (visited.has(item.Id)) continue
      visited.add(item.Id)

      const codeNode: CrossTreeNode = {
        type: 'code',
        id: item.Id,
        code: item.CrossCode,
        by: item.By,
        byCode: item.ByCode,
        cross: item.Cross,
        crossCode: item.CrossCode,
        verity: item.Verity,
        date: item.Date,
        children: []
      }

      codeNode.children = await buildNodes(
        item.Cross,
        item.CrossCode,
        index,
        producerMap,
        visited
      )

      producerNode.children.push(codeNode)
    }

    result.push(producerNode)
  }

  return result
}


export async function buildRecursiveTree(
  mainCode: string,
  items: CrossCodeItem[]
): Promise<CrossTree> {
  const index = indexItems(items)

  // собираем уникальные producerId
  const producerIds = Array.from(new Set(items.map(i => i.Cross)))

  const producers = await Promise.all(
    producerIds.map(id => fetchProducerById(id).catch(() => null))
  )

  const producerMap = new Map<number, EtProducer>()
  producers.forEach((p, i) => {
    if (p) producerMap.set(producerIds[i], p)
  })

  const nodes = await buildNodes(
    0,
    mainCode,
    index,
    producerMap
  )

  let mainProducer: EtProducer | undefined

  try {
    const partsPage = await fetchPartsPageWithoutProducer(mainCode, 'exact')
    const mainPart = partsPage.items.find(p => p.Code === mainCode)

    if (mainPart?.ProducerId) {
      mainProducer = await fetchProducerById(mainPart.ProducerId)
        .catch(() => undefined)
    }
  } catch (error) {
    console.error(
      'Ошибка при загрузке производителя главного кода:',
      error
    )
  }

  return {
    mainCode,
    mainProducer,
    nodes
  }
}

export async function findCrossTreeByMainCode(
  mainCode: string,
  signal?: AbortSignal
): Promise<CrossTree | null> {
  const items = await fetchAllByMainCode(mainCode, signal)

  if (!items.length) {
    return null
  }

  return buildRecursiveTree(mainCode, items)
}


