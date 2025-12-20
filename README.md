# Studio1 Etalon Client

React + Ant Design клиент для работы с Studio1 OData API. Приложение поддерживает полный CRUD для производителей (`EtProducer`) и деталей (`EtPart`), предоставляет интерфейс master-detail, вдохновленный классическим десктопным приложением, и готово для добавления новых сущностей через переиспользование общего OData клиента и конфигураций форм.

## Начало работы

```bash
cd client
npm install
```

Создайте файл `.env` в директории `client/` (Vite автоматически загружает его) и установите endpoint API и токен. При работе с удаленным экземпляром, который блокирует cross-origin запросы, оставьте `VITE_API_BASE_URL=/odata` и настройте прокси на удаленный хост:

```
VITE_API_BASE_URL=/odata
VITE_API_TOKEN=<your_api_token>
VITE_API_PROXY_TARGET=http://studio-api.interparts.ru
```

Затем запустите dev сервер:

```bash
npm run dev
```

Приложение ожидает, что Studio1 API будет доступен локально на настроенном URL. Все запросы автоматически включают заголовок Authorization.

## Сущности и типы данных

### EtProducer (Производитель)

**Namespace:** `Domains.Models.Etalon`

Основная сущность для работы с производителями запчастей.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор производителя
- `RealId` (Edm.Int32, обязательное) - Идентификатор основного производителя (для неоригинальных записей)
- `Prefix` (Edm.String, опциональное) - Префикс производителя
- `Name` (Edm.String, опциональное) - Название производителя
- `Address` (Edm.String, опциональное) - Адрес производителя
- `Www` (Edm.String, опциональное) - Веб-сайт производителя
- `Rating` (Edm.Int32, обязательное) - Рейтинг производителя (0-10)
- `ExistName` (Edm.String, опциональное) - Название в системе Exist
- `ExistId` (Edm.Int32, обязательное) - ID в системе Exist
- `Domain` (Edm.String, опциональное) - Домен производителя
- `TecdocSupplierId` (Edm.Int32, обязательное) - ID поставщика в TecDoc
- `MarketPrefix` (Edm.String, опциональное) - Рыночный префикс производителя

**Навигационные свойства:**
- `Parts` - Коллекция деталей производителя (`EtPart`)
- `SutExternalPrices` - Коллекция внешних цен (`SutExternalPrice`)

**Особенности:**
- Если `RealId !== Id`, то производитель является неоригинальным (алиасом) и ссылается на основной производитель
- Поддерживается фильтрация по оригинальным/неоригинальным производителям
- Поддерживается фильтрация по наличию заполненного `MarketPrefix`

### EtPart (Деталь)

**Namespace:** `Domains.Models.Etalon`

Сущность для работы с деталями (запчастями).

**Поля:**
- `Id` (Edm.Int64, обязательное) - Уникальный идентификатор детали
- `ProducerId` (Edm.Int32, обязательное) - ID производителя (связь с `EtProducer`)
- `OldId` (Edm.Int32, обязательное) - Старый идентификатор
- `Code` (Edm.String, опциональное) - Код детали
- `LongCode` (Edm.String, опциональное) - Длинный код детали
- `Weight` (Edm.Decimal, обязательное) - Вес детали в килограммах
- `Name` (Edm.Int32, обязательное) - Идентификатор названия (связь с `EtStringEntry`)
- `Description` (Edm.Int32, обязательное) - Идентификатор описания (связь с `EtStringEntry`)
- `V` (Edm.Decimal, обязательное) - Объём детали
- `SessionId` (Edm.Int32, обязательное) - ID сессии импорта
- `NoChangeFlag` (Edm.Boolean, обязательное) - Флаг отсутствия изменений
- `Accepted` (Edm.Boolean, обязательное) - Флаг принятия детали
- `Deleted` (Edm.Boolean, обязательное) - Флаг удаления детали
- `Rating` (Edm.Int16, обязательное) - Рейтинг детали
- `Old` (Edm.Boolean, обязательное) - Флаг устаревшей детали
- `Dead` (Edm.Boolean, обязательное) - Флаг снятой с производства детали

**Навигационные свойства:**
- `Producer` - Производитель детали (`EtProducer`)

**Особенности:**
- Название и описание хранятся в отдельной таблице строк (`EtStringEntry`) и загружаются по идентификаторам
- Поддерживается поиск по коду детали с различными режимами: точное совпадение, начинается с, заканчивается на, содержит

### EtStringEntry (Строка локализации)

**Namespace:** `Domains.Models.Etalon`

Сущность для хранения локализованных строк (названия и описания деталей).

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `ProducerId` (Edm.Int32, обязательное) - ID производителя
- `OldId` (Edm.Int32, опциональное) - Старый идентификатор
- `IdStr` (Edm.Int32, обязательное) - Идентификатор строки (используется в `EtPart.Name` и `EtPart.Description`)
- `Lng` (Edm.Int32, опциональное) - Код языка
- `Text` (Edm.String, опциональное) - Текст строки

### CtUser (Пользователь)

**Namespace:** `Domains.Models`

Сущность для аутентификации пользователей.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор пользователя
- `Login` (Edm.String, обязательное) - Логин пользователя
- `Password` (Edm.String, обязательное) - Пароль пользователя

### CtUserDetails (Детали пользователя)

**Namespace:** `Domains.Models`

Расширенная информация о пользователе.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `Login` (Edm.String, обязательное) - Логин
- `Region` (Edm.Int32, опциональное) - Регион
- `FirstName` (Edm.String, опциональное) - Имя
- `LastName` (Edm.String, опциональное) - Фамилия
- `Email` (Edm.String, опциональное) - Email
- `Icq` (Edm.Int32, опциональное) - ICQ номер
- `Phones` (Edm.String, опциональное) - Телефоны
- `Address` (Edm.String, опциональное) - Адрес
- `Date` (Edm.String, опциональное) - Дата регистрации
- `BirthDate` (Edm.String, опциональное) - Дата рождения
- `Locked` (Edm.Boolean, опциональное) - Флаг блокировки
- `Coef` (Edm.Decimal, опциональное) - Коэффициент
- `LastArea` (Edm.String, опциональное) - Последняя область
- `LastActivity` (Edm.String, опциональное) - Последняя активность
- `ExtId` (Edm.String, опциональное) - Внешний ID
- `ExtData1` (Edm.String, опциональное) - Внешние данные 1
- `UserType` (Edm.Int32, опциональное) - Тип пользователя
- `ConfirmsEmails` (Edm.Boolean, опциональное) - Подтверждение email
- `Comments` (Edm.String, опциональное) - Комментарии
- `Manager` (Edm.String, опциональное) - Менеджер
- `CurrencyId` (Edm.Int32, опциональное) - ID валюты
- `CoefSurchargeId` (Edm.Int32, опциональное) - ID коэффициента наценки
- `UseSurchargeCoef` (Edm.Boolean, опциональное) - Использовать коэффициент наценки
- `UserCoefStatus` (Edm.String, опциональное) - Статус коэффициента пользователя
- `ConnectedSupplierId` (Edm.Int32, опциональное) - ID подключенного поставщика
- `MaxUserOffers` (Edm.Int32, опциональное) - Максимум предложений пользователя
- `BasketDiscretSurchargeId` (Edm.Int32, опциональное) - ID дискретной наценки корзины
- `Income` (Edm.Decimal, опциональное) - Доход
- `OrganisationType` (Edm.Int32, опциональное) - Тип организации
- `Inn` (Edm.String, опциональное) - ИНН
- `Kpp` (Edm.String, опциональное) - КПП
- `LocalExtData1` (Edm.Boolean, опциональное) - Локальные внешние данные 1
- `UseAutodoc` (Edm.Int32, опциональное) - Использование Autodoc
- `UseAutodocCrossLimit` (Edm.Int32, опциональное) - Лимит кроссов Autodoc
- `UseExist` (Edm.Int32, опциональное) - Использование Exist
- `UseExistCrossLimit` (Edm.Int32, опциональное) - Лимит кроссов Exist
- `ExistLogin` (Edm.String, опциональное) - Логин Exist
- `ExistPassword` (Edm.String, опциональное) - Пароль Exist
- `UseEmex` (Edm.Int32, опциональное) - Использование Emex
- `UseEmexCrossLimit` (Edm.Int32, опциональное) - Лимит кроссов Emex
- `UseAutodocStoragrCross` (Edm.Boolean, опциональное) - Кроссы складов Autodoc
- `UseExistStoragrCross` (Edm.Boolean, опциональное) - Кроссы складов Exist
- `UseEmexStoragrCross` (Edm.Boolean, опциональное) - Кроссы складов Emex
- `UseAutopiter` (Edm.Int32, опциональное) - Использование Autopiter
- `UseAutopiterCrossLimit` (Edm.Int32, опциональное) - Лимит кроссов Autopiter
- `UseAutopiterStoragrCross` (Edm.Boolean, опциональное) - Кроссы складов Autopiter

### CtSession (Сессия)

**Namespace:** `Domains.Models`

Сущность для работы с сессиями импорта данных.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор сессии
- `App` (Edm.Int32, опциональное) - ID приложения
- `Source` (Edm.String, опциональное) - Источник данных
- `Start` (Edm.String, опциональное) - Время начала сессии
- `End` (Edm.String, опциональное) - Время окончания сессии
- `Inactive` (Edm.String, опциональное) - Время деактивации

### SutExternalPrice (Внешняя цена)

**Namespace:** `Domains.Models`

Сущность для хранения внешних цен на запчасти.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `ExternalSupplierId` (Edm.Int32, обязательное) - ID внешнего поставщика
- `SupplierName` (Edm.String, опциональное) - Название поставщика
- `ProducerId` (Edm.Int32, обязательное) - ID производителя
- `PartCode` (Edm.String, опциональное) - Код детали
- `Cost` (Edm.Decimal, обязательное) - Стоимость
- `CurrencyId` (Edm.Int32, обязательное) - ID валюты
- `Amount` (Edm.Int32, обязательное) - Количество
- `Date` (Edm.DateTimeOffset, обязательное) - Дата цены

**Навигационные свойства:**
- `Currency` - Валюта (`SutCurrency`)
- `Producer` - Производитель (`EtProducer`)

### SutCurrency (Валюта)

**Namespace:** `Domains.Models`

Сущность для работы с валютами.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `Name` (Edm.String, опциональное) - Название валюты
- `Symbol` (Edm.String, опциональное) - Символ валюты
- `RbcId` (Edm.Int16, обязательное) - ID валюты в RBC
- `Accuracy` (Edm.Int16, обязательное) - Точность (количество знаков после запятой)
- `LongName` (Edm.String, опциональное) - Полное название

**Навигационные свойства:**
- `ExternalPrices` - Коллекция внешних цен (`SutExternalPrice`)

### SutSupplier (Поставщик)

**Namespace:** `Domains.Models`

Сущность для работы с поставщиками.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `Name` (Edm.String, опциональное) - Название поставщика
- `Address` (Edm.String, опциональное) - Адрес
- `Www` (Edm.String, опциональное) - Веб-сайт
- `UseSurchGrp` (Edm.Boolean, обязательное) - Использование групп наценки
- `ExtId` (Edm.String, опциональное) - Внешний ID
- `External` (Edm.Boolean, обязательное) - Внешний поставщик
- `Competitor` (Edm.Int32, обязательное) - Конкурент
- `PriceVariation` (Edm.Decimal, обязательное) - Вариация цены
- `ProfitMargin` (Edm.Decimal, обязательное) - Маржа прибыли
- `Flags` (Edm.Int32, опциональное) - Флаги
- `Hidden` (Edm.Boolean, обязательное) - Скрытый
- `IconType` (Edm.Byte, обязательное) - Тип иконки
- `Allowance` (Edm.Boolean, обязательное) - Скидка
- `DenyRevaluation` (Edm.Boolean, обязательное) - Запрет переоценки
- `LogPrices` (Edm.Boolean, обязательное) - Логирование цен
- `Inn` (Edm.String, опциональное) - ИНН
- `Kpp` (Edm.String, опциональное) - КПП

**Навигационные свойства:**
- `Prices` - Коллекция цен (`SutPrice`)

### SutPrice (Цена)

**Namespace:** `Default`

Сущность для работы с ценами поставщиков.

**Поля:**
- `Id` (Edm.Int32, обязательное) - Уникальный идентификатор
- `SupplierId` (Edm.Int32, обязательное) - ID поставщика
- `ProducerId` (Edm.Int32, опциональное) - ID производителя
- `PartCode` (Edm.String, опциональное) - Код детали
- `Cost` (Edm.Decimal, обязательное) - Стоимость
- `CurrencyId` (Edm.Int32, обязательное) - ID валюты
- `Amount` (Edm.Int32, опциональное) - Количество
- `PriceText` (Edm.String, опциональное) - Текст цены
- `SessionId` (Edm.Int32, обязательное) - ID сессии
- `SurchGrp` (Edm.String, опциональное) - Группа наценки
- `Actual` (Edm.Boolean, обязательное) - Актуальная цена
- `Pack` (Edm.Int32, опциональное) - Упаковка

**Навигационные свойства:**
- `Supplier` - Поставщик (`SutSupplier`)
- `Currency` - Валюта (`SutCurrency`)

## Принцип работы с OData

### Базовый клиент OData

Модуль `odataClient.ts` предоставляет универсальный клиент для работы с OData API.

**Основные методы:**

1. **`list<T>(resource, options?, config?)`** - Получение списка сущностей
   - `resource` - Имя EntitySet (например, "Producers", "Parts")
   - `options` - Параметры OData запроса (`ODataQueryOptions`)
   - Возвращает `ODataListResponse<T>` с полями:
     - `value` - Массив сущностей
     - `@odata.count` - Общее количество записей (если запрашивалось)
     - `@odata.nextLink` - Ссылка на следующую страницу (для пагинации)

2. **`getById<T>(resource, id, config?)`** - Получение сущности по ID
   - Использует формат OData: `/Resource(id)`

3. **`create<T>(resource, payload, config?)`** - Создание новой сущности
   - Отправляет POST запрос с телом `payload`

4. **`update<T>(resource, id, payload, config?)`** - Обновление сущности
   - Использует PATCH метод для частичного обновления

5. **`remove(resource, id, config?)`** - Удаление сущности
   - Использует DELETE метод

6. **`fetchByUrl<T>(url, config?)`** - Выполнение запроса по полному URL
   - Используется для пагинации через `@odata.nextLink`

### Параметры OData запросов (`ODataQueryOptions`)

- **`filter`** - Строка фильтрации в формате OData
  - Примеры:
    - `ProducerId eq 123`
    - `Name eq 'BMW'`
    - `contains(Name,'BMW')`
    - `(Id eq RealId) and (MarketPrefix ne null)`
  
- **`orderBy`** - Сортировка
  - Примеры: `Name`, `Name desc`, `LongCode asc`

- **`select`** - Выбор конкретных полей
  - Пример: `IdStr,Text`

- **`expand`** - Развертывание навигационных свойств
  - Пример: `Producer,Parts`

- **`top`** - Количество записей на странице
  - Пример: `100`

- **`skip`** - Количество пропускаемых записей
  - Пример: `200`

- **`$count`** - Автоматически добавляется при наличии других параметров
  - Возвращает общее количество записей в `@odata.count`

### Фильтрация

OData поддерживает различные операторы фильтрации:

- **Сравнение:** `eq` (равно), `ne` (не равно), `gt` (больше), `ge` (больше или равно), `lt` (меньше), `le` (меньше или равно)
- **Логические:** `and`, `or`, `not`
- **Строковые функции:** `contains`, `startswith`, `endswith`, `length`, `indexof`, `substring`, `tolower`, `toupper`, `trim`, `concat`
- **Математические:** `add`, `sub`, `mul`, `div`, `mod`
- **Проверка на null:** `null`, `ne null`

**Примеры фильтров:**

```typescript
// Точное совпадение
filter: "Code eq '12345'"

// Поиск по вхождению
filter: "contains(Name,'BMW')"

// Комбинированные условия
filter: "(ProducerId eq 123) and (contains(Code,'ABC'))"

// Проверка на null
filter: "MarketPrefix ne null and MarketPrefix ne ''"

// Начало строки
filter: "startswith(Code,'ABC')"

// Конец строки
filter: "endswith(Code,'XYZ')"
```

### Пагинация

OData поддерживает серверную пагинацию через параметры `$top` и `$skip`, а также через `@odata.nextLink`.

**Страничная пагинация:**
```typescript
// Первая страница (100 записей)
const page1 = await odataClient.list('Producers', { top: 100 })

// Вторая страница
const page2 = await odataClient.list('Producers', { top: 100, skip: 100 })
```

**Бесконечная прокрутка (Infinite Scroll):**
```typescript
// Первая страница
const firstPage = await odataClient.list('Producers', { top: 100 })
const nextLink = firstPage['@odata.nextLink']

// Следующая страница через nextLink
if (nextLink) {
  const nextPage = await odataClient.fetchByUrl(nextLink)
}
```

### Экранирование значений

Для безопасной работы со строками в фильтрах используется функция `escapeODataValue`, которая экранирует одинарные кавычки:

```typescript
const searchTerm = "O'Brien"
const escaped = escapeODataValue(searchTerm) // "O''Brien"
const filter = `Name eq '${escaped}'`
```

### Обработка ошибок

Клиент автоматически обрабатывает:
- **403 Forbidden** - Показывает сообщение о недоступности IP-адреса
- **CORS ошибки** - Определяет и показывает соответствующее сообщение
- **Сетевые ошибки** - Обрабатывает `ERR_NETWORK` и подобные ошибки

## Модули для работы с данными

### `odataClient.ts` - Базовый OData клиент

Универсальный клиент для всех операций с OData API.

**Экспортируемые функции:**
- `odataClient` - Объект с методами CRUD операций
- `escapeODataValue(value: string)` - Экранирование строковых значений для фильтров
- `ODataQueryOptions` - Интерфейс параметров запроса

**Особенности:**
- Автоматическое добавление заголовка `Authorization: Bearer <token>`
- Автоматическое добавление `$count=true` при наличии параметров запроса
- Специальная сериализация параметров (пробелы как `+` вместо `%20`)
- Обработка ошибок с пользовательскими сообщениями

### `producers.ts` - Модуль работы с производителями

**Экспортируемые функции:**

- **`fetchProducersPage(search?, nextLink?, options?)`** - Получение страницы производителей
  - Поддерживает поиск по названию и префиксу
  - Поддерживает фильтрацию по режимам: все, оригинальные, неоригинальные, с заполненным префиксом
  - Использует пагинацию через `nextLink`
  - Размер страницы: 100 записей
  - Возвращает `ProducersPageResult` с полями:
    - `items` - Массив производителей
    - `total` - Общее количество (если доступно)
    - `nextLink` - Ссылка на следующую страницу

- **`createProducer(payload)`** - Создание нового производителя
- **`updateProducer(id, payload)`** - Обновление производителя
- **`deleteProducer(id)`** - Удаление производителя
- **`fetchProducerById(id)`** - Получение производителя по ID

**Режимы фильтрации:**
- `'all'` - Все производители
- `'originals'` - Только оригинальные (`Id eq RealId`)
- `'non-originals'` - Неоригинальные (`Id ne RealId`)
- `'with-prefix'` - С заполненным префиксом (`MarketPrefix ne null and MarketPrefix ne ''`)

### `parts.ts` - Модуль работы с деталями

**Экспортируемые функции:**

- **`fetchPartsPage(producerId, nextLink?, codeFilter?, filterMode?)`** - Получение страницы деталей производителя
  - Обязательно фильтрует по `ProducerId`
  - Поддерживает поиск по коду детали
  - Режимы поиска: `'exact'`, `'startsWith'`, `'endsWith'`, `'contains'`
  - Размер страницы: 200 записей
  - Сортировка по `LongCode`

- **`fetchPartsPageWithoutProducer(searchTerm?, filterMode?, nextLink?)`** - Получение деталей без привязки к производителю
  - Позволяет искать детали по коду без выбора производителя
  - Поддерживает те же режимы поиска

- **`fetchPartsCount(producerId)`** - Получение количества деталей производителя
  - Использует запрос с `top: 0` для получения только счетчика

- **`fetchStringsByIds(producerId, ids, chunkSize?)`** - Получение строк локализации
  - Загружает названия и описания деталей из таблицы `EtStringEntry`
  - Обрабатывает запросы порциями (по умолчанию 5 ID за раз)
  - Возвращает объект `Record<number, string>` с текстами по ID строк

- **`createPart(payload)`** - Создание новой детали
- **`updatePart(id, payload)`** - Обновление детали
- **`deletePart(id)`** - Удаление детали

**Режимы поиска по коду:**
- `'exact'` - Точное совпадение: `Code eq 'value'`
- `'startsWith'` - Начинается с: `startswith(Code,'value')`
- `'endsWith'` - Заканчивается на: `endswith(Code,'value')`
- `'contains'` - Содержит: `contains(Code,'value')`

### `users.ts` - Модуль работы с пользователями

**Экспортируемые функции:**

- **`fetchUsers()`** - Получение всех пользователей
  - Автоматически загружает все страницы через `nextLink`
  - Размер страницы: 100 записей

- **`authenticateUser(login, password)`** - Аутентификация пользователя
  - Загружает всех пользователей и ищет совпадение по логину и паролю
  - Возвращает `CtUser` или `null`

- **`fetchUserDetailsByLogin(login)`** - Получение детальной информации о пользователе
  - Ищет пользователя по логину в `CtUserDetails`
  - Возвращает `CtUserDetails` или `null`

### `sessions.ts` - Модуль работы с сессиями

**Экспортируемые функции:**

- **`fetchCtSessions(app?)`** - Получение сессий
  - Опциональная фильтрация по `App`
  - Сортировка по `Start desc`
  - Размер страницы: 200 записей

- **`fetchSessionById(id)`** - Получение сессии по ID

### `types.ts` - TypeScript типы

Содержит интерфейсы для всех сущностей:
- `EtProducer` - Производитель
- `EtPart` - Деталь
- `EtStringEntry` - Строка локализации
- `CtUser` - Пользователь
- `CtUserDetails` - Детали пользователя
- `CtSession` - Сессия
- `ODataListResponse<T>` - Ответ OData для списков

## Представления (Компоненты)

### `App.tsx` - Главный компонент приложения

Корневой компонент, управляющий состоянием приложения и навигацией.

**Основные функции:**
- Управление аутентификацией пользователя
- Управление темой (светлая/темная)
- Управление выбранным производителем и деталью
- Управление режимом поиска деталей (с производителем/без производителя)
- Сохранение состояния в localStorage и sessionStorage
- Настройка темы Ant Design

**Состояние:**
- `currentUser` - Текущий пользователь
- `isDarkMode` - Режим темной темы
- `selectedProducer` - Выбранный производитель
- `selectedPart` - Выбранная деталь
- `activeTab` - Активная вкладка навигации
- `navCollapsed` - Состояние свернутой навигации
- `partsSearchType` - Тип поиска деталей
- `producerSiderWidth` - Ширина панели производителей (с возможностью изменения)

### `LoginPage.tsx` - Страница входа

Компонент для аутентификации пользователей.

**Пропсы:**
- `onLogin(user: CtUser)` - Callback при успешном входе
- `isDarkMode?: boolean` - Режим темной темы

**Функциональность:**
- Форма входа с полями логин/пароль
- Валидация обязательных полей
- Интеграция с `authenticateUser` из `users.ts`
- Отображение ошибок аутентификации
- Адаптивная стилизация под светлую/темную тему

### `ProducerPanel.tsx` - Панель производителей

Компонент для отображения и управления списком производителей.

**Пропсы:**
- `selectedProducer?: EtProducer | null` - Выбранный производитель
- `onSelect: (producer: EtProducer | null) => void` - Callback выбора производителя
- `externalSearch?: string` - Внешний поисковый запрос
- `onSearchChange?: (value: string) => void` - Callback изменения поиска
- `searchType?: 'by_producer' | 'without_producer'` - Тип поиска деталей

**Функциональность:**
- **Поиск** - По названию и префиксу производителя
- **Фильтрация:**
  - Все производители
  - Только оригинальные
  - Не оригинальные
  - С заполненным префиксом
- **Сортировка** - По префиксу, названию, количеству деталей (с индикаторами направления)
- **Бесконечная прокрутка** - Автоматическая загрузка при прокрутке
- **CRUD операции:**
  - Создание нового производителя
  - Редактирование производителя
  - Удаление производителя (с подтверждением)
  - Просмотр деталей производителя
- **Отображение:**
  - Рейтинг производителя (цветовая индикация: высокий/средний/низкий/неизвестный)
  - Количество деталей (с индикатором загрузки)
  - Индикатор неоригинального производителя (иконка ссылки)
  - Частота использования префикса
- **Контекстное меню** - Правый клик для быстрого доступа к действиям
- **Интеграция с ProducerDetailsDrawer** - Открытие карточки производителя

### `PartsPanel.tsx` - Панель деталей

Компонент для отображения и управления списком деталей.

**Пропсы:**
- `selectedProducer?: EtProducer | null` - Выбранный производитель
- `selectedPart?: EtPart | null` - Выбранная деталь
- `onSelectPart: (part: EtPart | null) => void` - Callback выбора детали
- `searchType: 'by_producer' | 'without_producer'` - Тип поиска
- `onSearchTypeChange?: (type: 'by_producer' | 'without_producer') => void` - Callback изменения типа поиска

**Функциональность:**
- **Два режима поиска:**
  - `by_producer` - Поиск деталей выбранного производителя
  - `without_producer` - Поиск деталей без привязки к производителю
- **Поиск по коду детали:**
  - Динамический поиск при вводе (для режима без производителя)
  - Поиск по Enter (для режима с производителем)
  - Режимы поиска: точное совпадение, начинается с, заканчивается на, содержит
- **Отображение статистики:**
  - Общее количество найденных записей
  - Количество записей на текущей странице
- **Бесконечная прокрутка** - Автоматическая загрузка при прокрутке
- **CRUD операции:**
  - Создание новой детали
  - Редактирование детали
  - Удаление детали (с подтверждением)
- **Отображение:**
  - Код детали
  - Длинный код
  - Название и описание (загружаются из `EtStringEntry` с индикатором загрузки)
  - Вес, объём, сессия
  - Флаги состояния (принято, изменения, удалено, старое, снято)
- **Контекстное меню** - Правый клик для быстрого доступа к действиям
- **Интеграция с PartDetailsDrawer** - Открытие карточки детали

### `ProducerDetailsModal.tsx` - Карточка производителя

Компонент для отображения детальной информации о производителе в боковой панели.

**Пропсы:**
- `producer?: EtProducer | null` - Производитель для отображения
- `onClose: () => void` - Callback закрытия
- `onSelectProducer?: (producerId: number) => void` - Callback выбора основного производителя

**Функциональность:**
- Отображение всех полей производителя
- Индикация неоригинального производителя
- Кнопка перехода к основному производителю (если это алиас)
- Форматированное отображение данных

### `PartDetailsDrawer.tsx` - Карточка детали

Компонент для отображения детальной информации о детали в боковой панели.

**Пропсы:**
- `producer?: EtProducer | null` - Производитель детали
- `part?: EtPart | null` - Деталь для отображения
- `onClose: () => void` - Callback закрытия

**Функциональность:**
- Отображение всех полей детали
- Загрузка названия и описания из `EtStringEntry` (с индикатором загрузки)
- Отображение флагов состояния с цветовыми тегами
- Информация о производителе

### `EntityFormModal.tsx` - Универсальная форма создания/редактирования

Универсальный компонент для создания и редактирования сущностей.

**Пропсы:**
- `title: string` - Заголовок модального окна
- `open: boolean` - Видимость модального окна
- `onCancel: () => void` - Callback отмены
- `onSubmit: (values: Partial<T>) => void` - Callback отправки формы
- `fields: FieldConfig[]` - Конфигурация полей
- `loading?: boolean` - Индикатор загрузки
- `initialValues?: Partial<T>` - Начальные значения

**Функциональность:**
- Автоматическая генерация полей на основе конфигурации
- Поддержка типов полей: `text`, `number`, `url`, `textarea`
- Валидация обязательных полей
- Валидация минимальных значений для числовых полей
- Интеграция с Ant Design Form

### `PartFormModal.tsx` - Форма создания/редактирования детали

Специализированная форма для работы с деталями.

**Пропсы:**
- `open: boolean` - Видимость модального окна
- `onCancel: () => void` - Callback отмены
- `onSubmit: (values: Partial<EtPart>) => void` - Callback отправки формы
- `initialValues?: Partial<EtPart>` - Начальные значения
- `loading?: boolean` - Индикатор загрузки

**Функциональность:**
- Специфичные поля для деталей
- Валидация кода детали
- Поддержка всех полей из `partFields` конфигурации

### `UserProfileModal.tsx` - Модальное окно профиля пользователя

Компонент для отображения и редактирования профиля пользователя.

**Пропсы:**
- `user: CtUser | null` - Пользователь
- `open: boolean` - Видимость модального окна
- `onClose: () => void` - Callback закрытия

**Функциональность:**
- Отображение детальной информации о пользователе
- Загрузка данных из `CtUserDetails`
- Отображение всех полей профиля
- Интеграция с системой аутентификации

### `ContextActionsMenu.tsx` - Контекстное меню действий

Универсальный компонент для отображения контекстного меню при правом клике.

**Пропсы:**
- `actions: Array<{ key: string; label: ReactNode; onClick?: () => void; danger?: boolean }>` - Массив действий
- `children: ReactNode` - Дочерний элемент, на котором будет работать меню

**Функциональность:**
- Отображение меню при правом клике
- Поддержка опасных действий (красный цвет)
- Интеграция с Ant Design Dropdown

## Конфигурация полей

### `config/resources.ts` - Конфигурация полей форм

Определяет структуру полей для автоматической генерации форм.

**Типы полей:**
- `text` - Текстовое поле
- `number` - Числовое поле
- `url` - URL поле (с валидацией)
- `textarea` - Многострочное текстовое поле

**Конфигурации:**

- **`producerFields`** - Поля формы производителя:
  - `Prefix` - Префикс (обязательное)
  - `Name` - Название (обязательное)
  - `Domain` - Домен
  - `Www` - Сайт (тип: url)
  - `Rating` - Рейтинг (тип: number, min: 0)
  - `TecdocSupplierId` - TecDoc ID (тип: number)

- **`partFields`** - Поля формы детали:
  - `Code` - Код (обязательное)
  - `LongCode` - Длинный код
  - `Weight` - Вес, кг (тип: number, min: 0)
  - `Name` - Идентификатор названия (тип: number, min: 0)
  - `Description` - Идентификатор описания (тип: number, min: 0)
  - `V` - Объём (тип: number, min: 0)
  - `SessionId` - Сессия (тип: number, min: 0)

## Расширение приложения

### Добавление новой сущности

1. **Определите TypeScript интерфейс** в `src/api/types.ts`
2. **Создайте модуль API** в `src/api/` по образцу `producers.ts` или `parts.ts`
3. **Определите конфигурацию полей** в `src/config/resources.ts`
4. **Создайте компоненты панели и деталей** по образцу `ProducerPanel.tsx` и `PartsPanel.tsx`
5. **Интегрируйте в `App.tsx`** для отображения в навигации

### Использование OData клиента

```typescript
import { odataClient } from './api/odataClient.ts'

// Получение списка
const items = await odataClient.list<MyEntity>('MyEntities', {
  filter: "Name eq 'Value'",
  orderBy: 'Name',
  top: 100,
})

// Получение по ID
const item = await odataClient.getById<MyEntity>('MyEntities', 123)

// Создание
const newItem = await odataClient.create<MyEntity>('MyEntities', {
  Name: 'New Item',
})

// Обновление
await odataClient.update<MyEntity>('MyEntities', 123, {
  Name: 'Updated Name',
})

// Удаление
await odataClient.remove('MyEntities', 123)
```

### Использование конфигурации полей

```typescript
import { producerFields } from './config/resources.ts'
import { EntityFormModal } from './components/EntityFormModal.tsx'

<EntityFormModal
  title="Новый производитель"
  open={isOpen}
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  fields={producerFields}
  initialValues={{ Rating: 0 }}
/>
```

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Ant Design 5** - UI компоненты
- **TanStack Query (React Query)** - Управление состоянием сервера и кэширование
- **Axios** - HTTP клиент
- **Vite** - Сборщик и dev сервер
- **OData 4.0** - Протокол доступа к данным

## Структура проекта

```
client/
├── src/
│   ├── api/              # Модули доступа к данным
│   │   ├── odataClient.ts    # Базовый OData клиент
│   │   ├── types.ts          # TypeScript типы сущностей
│   │   ├── producers.ts      # API производителей
│   │   ├── parts.ts          # API деталей
│   │   ├── users.ts          # API пользователей
│   │   └── sessions.ts       # API сессий
│   ├── components/       # React компоненты
│   │   ├── App.tsx           # Главный компонент
│   │   ├── LoginPage.tsx     # Страница входа
│   │   ├── ProducerPanel.tsx # Панель производителей
│   │   ├── PartsPanel.tsx    # Панель деталей
│   │   ├── ProducerDetailsModal.tsx # Карточка производителя
│   │   ├── PartDetailsDrawer.tsx     # Карточка детали
│   │   ├── EntityFormModal.tsx       # Универсальная форма
│   │   ├── PartFormModal.tsx         # Форма детали
│   │   ├── UserProfileModal.tsx       # Профиль пользователя
│   │   └── ContextActionsMenu.tsx    # Контекстное меню
│   ├── config/           # Конфигурация
│   │   └── resources.ts      # Конфигурация полей форм
│   ├── App.tsx           # Точка входа приложения
│   ├── main.tsx          # Точка входа React
│   └── styles.css        # Глобальные стили
├── public/               # Статические файлы
│   └── logo.svg          # Логотип приложения
├── package.json          # Зависимости
├── tsconfig.json         # Конфигурация TypeScript
├── vite.config.ts        # Конфигурация Vite
└── README.md             # Документация
```
