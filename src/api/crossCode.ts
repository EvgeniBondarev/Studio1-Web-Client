import { odataClient } from './odataClient.ts';

export interface CrossCodeItem {
  Id: number;
  Cross: number;
  CrossCode: string;
  MainCode: string;
  By: number;
  ByCode: string;
  Verity: number;
}

type ODataPage<T> = {
  value: T[];
  '@odata.nextLink'?: string;
};

async function fetchPage(nextLink?: string, signal?: AbortSignal): Promise<ODataPage<CrossCodeItem>> {
  return nextLink
    ? odataClient.fetchByUrl(nextLink, { signal })
    : odataClient.list<CrossCodeItem>('CrTCrosses', undefined, { signal });
}

//Кэш и индексация

const byCrossCode = new Map<string, CrossCodeItem>();
const byMainCode = new Map<string, CrossCodeItem[]>();

function indexItem(item: CrossCodeItem) {
  byCrossCode.set(item.CrossCode, item);

  if (!byMainCode.has(item.MainCode)) {
    byMainCode.set(item.MainCode, []);
  }
  byMainCode.get(item.MainCode)!.push(item);
}

// Контроллер и флаг полной загрузки

let activeController: AbortController | null = null;
let fullyLoaded = false;

//Функция поиска дерева

export async function findTreeByCode(
  inputCode: string,
  onProgress?: (loaded: number, mainCode?: string) => void
) {
  // Отмена предыдущего поиска
  if (activeController) {
    activeController.abort();
  }

  const controller = new AbortController();
  activeController = controller;

  inputCode = inputCode.trim();

  // Быстрая проверка в кэше
  if (byCrossCode.has(inputCode)) {
    const item = byCrossCode.get(inputCode)!;
    const relatedItems = byMainCode.get(item.MainCode) ?? [];
    return buildTree(relatedItems);
  }

  // Если все данные уже загружены и код не найден
  if (fullyLoaded) {
    return null;
  }

  let nextLink: string | undefined = undefined;
  let loaded = 0;
  let foundItem: CrossCodeItem | null = null;
  let targetMainCode: string | null = null;

  // Ищем  CrossCode
  while (!foundItem) {
    if (controller.signal.aborted) throw new Error('aborted');

    const res = await fetchPage(nextLink, controller.signal);

    for (const item of res.value) {
      indexItem(item);
      loaded++;

      if (item.CrossCode === inputCode) {
        foundItem = item;
        targetMainCode = item.MainCode;
      }
    }

    //  Вызываем колбек прогресса с частичным деревом
    if (targetMainCode) {
      onProgress?.(loaded, targetMainCode);
    } else {
      onProgress?.(loaded);
    }

    nextLink = res['@odata.nextLink'];
    if (!nextLink) break;
  }

  if (!foundItem || !targetMainCode) {
    return null; // код не найден
  }

  //Догружаем остальные страницы
  while (nextLink) {
    if (controller.signal.aborted) throw new Error('aborted');

    const res = await fetchPage(nextLink, controller.signal);

    for (const item of res.value) {
      indexItem(item);
      loaded++;
    }

    onProgress?.(loaded, targetMainCode);

    nextLink = res['@odata.nextLink'];
  }

  fullyLoaded = true;

  if (!foundItem || !targetMainCode) {
    return null
  }

// берём ВСЕ элементы этого корня
  const relatedItems = byMainCode.get(targetMainCode) ?? []

  return buildTree(relatedItems)
}

export type TreeNode = {
  label: string
  type: 'root' | 'brand' | 'code'
  children: TreeNode[]
}

    //построение дерева
function buildTree(items: CrossCodeItem[]): TreeNode[] {
  // 1. находим корни
  const roots = items.filter(
    i => i.MainCode === i.CrossCode
  )

  return roots.map(root => {
    // 2. все элементы этого корня
    const related = items.filter(
      i => i.MainCode === root.CrossCode && i.CrossCode !== root.CrossCode
    )

    // 3. группировка по производителю
    const byBrand = new Map<string, CrossCodeItem[]>()

    related.forEach(item => {
      const brand = item.ByCode || ''
      if (!byBrand.has(brand)) {
        byBrand.set(brand, [])
      }
      byBrand.get(brand)!.push(item)
    })

    // 4. строим детей корня
    const children: TreeNode[] = []

    byBrand.forEach((codes, brand) => {
      if (!brand) {
        // без производителя — сразу коды
        codes.forEach(code => {
          children.push({
            type: 'code',
            label: code.CrossCode,
            children: []
          })
        })
      } else {
        // с производителем
        children.push({
          type: 'brand',
          label: brand,
          children: codes.map(code => ({
            type: 'code',
            label: code.CrossCode,
            children: []
          }))
        })
      }
    })

    return {
      type: 'root',
      label: root.CrossCode,
      children
    }
  })
}


//  Получение частичного дерева

export function getPartialTree(mainCode: string): TreeNode[] {
  const items = byMainCode.get(mainCode) ?? []
  return buildTree(items)
}

